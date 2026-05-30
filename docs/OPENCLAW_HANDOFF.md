# OpenClaw Handoff

Este documento explica como retomar la integracion de OpenClaw para el ecommerce.

## Decision de arquitectura

OpenClaw debe vivir como una app separada en Coolify, no dentro del `docker-compose.yml` del ecommerce.

Motivo:

- WhatsApp, sesiones y memoria del agente tienen ciclo de vida distinto al ecommerce.
- El vendedor necesita volumen propio y backup propio.
- Separar OpenClaw permite actualizar Medusa/storefront sin tocar la sesion WhatsApp.
- Evita mezclar agentes existentes como Cody o Bruno con ventas ecommerce.

## Forma esperada

```text
WhatsApp ecommerce
  -> OpenClaw app separada
    -> ecommerce-tools:8787
      -> CRM customers/events/followups
      -> Medusa
      -> PayPhone
      -> Meta drafts/feed
```

## Archivos en este repo

- `agents/openclaw-ecommerce-seller.md`: prompt canonico.
- `agents/openclaw-ecommerce-config.example.env`: env ejemplo cerca del agente.
- `infra/openclaw-ecommerce.env.example`: env ejemplo para Coolify/OpenClaw.
- `skills/ecommerce-sales/SKILL.md`: guia de venta.
- `skills/meta-marketplace-assistant/SKILL.md`: guia Meta/Marketplace.
- `skills/payphone-reconciliation/SKILL.md`: guia conciliacion PayPhone.

## Variables esperadas

En la app OpenClaw ecommerce:

```text
OPENCLAW_AGENT_NAME=Eter Niu Cocina Seller
OPENCLAW_AGENT_PROMPT_FILE=agents/openclaw-ecommerce-seller.md
OPENCLAW_SKILLS_DIR=skills
ECOMMERCE_TOOLS_BASE_URL=http://ecommerce-tools:8787
ECOMMERCE_TOOLS_TOKEN=<TOOLS_API_TOKEN>
OPENCLAW_WHATSAPP_DM_POLICY=allowlist
OPENCLAW_WHATSAPP_ALLOWED_NUMBERS=+593999999999
OPENCLAW_FOLLOWUP_POLICY=consent_or_human_approval
```

En el stack ecommerce:

```text
TOOLS_API_TOKEN=<same-token-used-by-openclaw>
WHATSAPP_SELLER_NUMBER=593...
PAYPHONE_DRY_RUN=true
```

## Conectividad

Ruta ideal:

```text
OpenClaw -> http://ecommerce-tools:8787
```

Si Coolify no resuelve `ecommerce-tools` desde la app separada:

1. Conectar OpenClaw a la misma red Docker/Coolify del stack ecommerce.
2. O exponer `ecommerce-tools` con ruta protegida por `TOOLS_API_TOKEN`.

No exponer rutas privadas sin token.

## Auth

`ecommerce-tools` usa Bearer token cuando `TOOLS_API_TOKEN` existe.

OpenClaw debe enviar:

```text
Authorization: Bearer <ECOMMERCE_TOOLS_TOKEN>
```

Rutas publicas sin token:

- `GET /healthz`
- `GET /feeds/meta/catalog.csv`

Rutas privadas esperadas:

- `GET /tools/search-products`
- `POST /tools/quote`
- `POST /tools/orders`
- `POST /tools/payphone-link`
- `POST /tools/customers/import`
- `GET /tools/customers/:phone`
- `GET /tools/ai-context/customer/:phone`
- `POST /tools/customer-events`
- `POST /tools/events`
- `GET /tools/followups/due`
- `GET /tools/dashboard`
- `POST /tools/meta-post-draft`
- `POST /webhooks/payphone`

## Flujo de venta

1. Cliente escribe por WhatsApp.
2. Si conoce el telefono, OpenClaw/Vicky consulta `GET /tools/ai-context/customer/:phone` antes de recomendar. Si el mensaje de WhatsApp trae `Lead`, `ProductoID`, `Variante`, `SKU`, cupon, pagos, compatibilidad o empieza con `Hola, quiero la olla de granito ...`, consulta `GET /tools/ai-context/customer/:phone?leadId=<Lead>` y responde el flujo de ese producto, no un menu generico.
3. OpenClaw busca productos de cocina antes de decir precio o stock.
4. OpenClaw recomienda maximo tres opciones segun uso: 20 cm, 24 cm, wok 32 cm, set MGC, menos aceite, familia, cuidado o reposicion.
5. OpenClaw cotiza y queda evento `quote_created` si hay telefono.
6. Si el cliente acepta, OpenClaw crea orden `pending_payment`.
7. OpenClaw genera link PayPhone.
8. Webhook PayPhone o conciliacion humana confirma el pago y agenda recompra si aplica.
9. Si entrega, factura, instalacion o garantia no son claras, OpenClaw escala a humano.
10. Si el cliente envia comprobante de transferencia/deuna, registrar `payment_proof_received`; queda en revision humana y no se marca `paid` ni `Purchase`.

## Recompra

Flujo diario:

1. Consultar `GET /tools/followups/due` o `GET /tools/dashboard`.
2. Revisar `suggestedMessage`, `reason`, `priority`, `recommendedProductSku`, `requiresHumanApproval`, producto anterior y consentimiento.
3. Enviar solo si hay consentimiento o conversacion vigente.
4. Si no, dejar borrador para aprobacion humana/campana permitida.
5. Registrar `followup_sent`, `reorder_interest`, `no_response`, `conversation_escalated` u `opt_out` con `POST /tools/customer-events`.

## Pixel y contexto IA

- El storefront registra eventos web por `POST /api/events`, que proxy a `POST /tools/events`.
- Eventos soportados: `page_view`, `view_content`, `search`, `video_interest`, `product_interest`, `whatsapp_opened`, `quiz_completed`, `guide_downloaded`, `quote_created`, `order_created`, `paid`, `payment_proof_received`, `care_followup_due`, `care_followup_sent`, `complement_due`, `reorder_due`, `campaign_click`, `opt_out`.
- El selector "Elige tu olla ideal" registra `quiz_completed` con `journeyStage`, ciudad, personas en casa, uso, presupuesto, `productInterestSku`, `recommendedSku` y `followupSequence`.
- El formulario "Club Cocina Saludable" registra `guide_downloaded` con tags `lead-magnet`, `guia-cupon` y `recompra`, mas metadata como ciudad, personas en casa, producto de interes, cupon y secuencia de followup.
- Las guias `/guias` y `/guias/teflon-pfas` generan contexto de campana. Si el lead viene de guia PFAS, responder con educacion segura, sin diagnosticos ni afirmaciones medicas absolutas.
- Los CTAs de WhatsApp incluyen `ProductoID`, `Variante`, `SKU`, precio, material, diametro, `Lead`, cupon `GRANITOHOY`, envio gratis, pagos disponibles y compatibilidad para que OpenClaw pueda unir conversacion con interes previo y responder directo por producto.
- Si el mensaje llega con un `Lead`, consultar `GET /tools/ai-context/customer/:phone?leadId=<Lead>` para recuperar producto visto, video/guia/quiz de origen, etapa del cliente y siguiente accion sugerida.
- Meta CAPI solo envia eventos si estan configurados `META_ACCESS_TOKEN`, `META_DATASET_ID`/`META_PIXEL_ID` y existe consentimiento.

## Limites del agente

OpenClaw no debe:

- Inventar stock, precio, descuento, estado de pago ni estado de orden.
- Inventar historial de compra o consentimiento WhatsApp.
- Pedir datos de tarjeta, claves, tokens o credenciales.
- Recontactar fuera de una conversacion vigente sin consentimiento o aprobacion humana.
- Publicar en Marketplace sin confirmacion humana.
- Ejecutar gasto publicitario sin confirmacion humana.
- Mezclar este vendedor con agentes de otros proyectos.

## Prueba minima

Con `ecommerce-tools` arriba:

```bash
curl http://localhost:8787/healthz
curl http://localhost:8787/tools/search-products?query=ollas
```

Con token:

```bash
curl -H "Authorization: Bearer <TOOLS_API_TOKEN>" \
  "http://localhost:8787/tools/search-products?query=wok%2032"

curl -H "Authorization: Bearer <TOOLS_API_TOKEN>" \
  "http://localhost:8787/tools/followups/due"

curl -H "Authorization: Bearer <TOOLS_API_TOKEN>" \
  "http://localhost:8787/tools/dashboard"
```

Desde OpenClaw:

- Preguntar: "Quiero una olla de granito para 4 personas, mejor 24 cm o wok 32?"
- Verificar que llama a `search-products`.
- Si el telefono esta disponible, verificar que llama a `get_customer`.
- Pedir cotizacion.
- Verificar que llama a `quote`.
- Aceptar compra.
- Verificar que crea orden y link PayPhone.

## Handoff humano

El agente debe dejar rastro corto:

- Cliente/intencion.
- Producto seleccionado.
- Total cotizado.
- Order id.
- Link/status PayPhone.
- Evento CRM y proximo seguimiento.
- Siguiente accion.
- Si fue escalado: motivo y datos que faltan.
