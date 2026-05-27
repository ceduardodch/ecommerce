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
OPENCLAW_AGENT_NAME=B2B Ecommerce Seller
OPENCLAW_AGENT_PROMPT_FILE=agents/openclaw-ecommerce-seller.md
OPENCLAW_SKILLS_DIR=skills
ECOMMERCE_TOOLS_BASE_URL=http://ecommerce-tools:8787
ECOMMERCE_TOOLS_TOKEN=<TOOLS_API_TOKEN>
OPENCLAW_WHATSAPP_DM_POLICY=allowlist
OPENCLAW_WHATSAPP_ALLOWED_NUMBERS=+593999999999
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
- `POST /tools/meta-post-draft`
- `POST /webhooks/payphone`

## Flujo de venta

1. Cliente escribe por WhatsApp.
2. OpenClaw busca productos antes de decir precio o stock.
3. OpenClaw cotiza maximo tres opciones salvo que el cliente pida mas.
4. Si el cliente acepta, OpenClaw crea orden `pending_payment`.
5. OpenClaw genera link PayPhone.
6. OpenClaw entrega link y registra el siguiente paso.
7. Webhook PayPhone o conciliacion humana confirma el pago.
8. Si entrega, factura, instalacion o garantia no son claras, OpenClaw escala a humano.

## Limites del agente

OpenClaw no debe:

- Inventar stock, precio, descuento, estado de pago ni estado de orden.
- Pedir datos de tarjeta, claves, tokens o credenciales.
- Publicar en Marketplace sin confirmacion humana.
- Ejecutar gasto publicitario sin confirmacion humana.
- Mezclar este vendedor con agentes de otros proyectos.

## Prueba minima

Con `ecommerce-tools` arriba:

```bash
curl http://localhost:8787/healthz
curl http://localhost:8787/tools/search-products?query=wifi
```

Con token:

```bash
curl -H "Authorization: Bearer <TOOLS_API_TOKEN>" \
  "http://localhost:8787/tools/search-products?query=wifi"
```

Desde OpenClaw:

- Preguntar: "Tienes router wifi para negocio?"
- Verificar que llama a `search-products`.
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
- Siguiente accion.
- Si fue escalado: motivo y datos que faltan.
