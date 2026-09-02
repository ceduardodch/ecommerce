# Vicky Bot

Vicky is the dedicated ecommerce sales bot for WhatsApp and web/social leads.

## Public URLs

- Bot gateway: `https://whatsapp-test.eter-niu.com`
- Cocina storefront: `https://cocina.eter-niu.com`
- Bienestar storefront: `https://bienestar.eter-niu.com`
- Portal de marca: `https://eter-niu.com`
- CRM backoffice: `https://admin.eter-niu.com/app/crm-whatsapp`
- Meta catalog cocina: `https://cocina.eter-niu.com/feeds/meta/catalog.csv`
- Meta catalog bienestar: `https://bienestar.eter-niu.com/feeds/meta/catalog.csv`

Keep these URLs in environment variables. If a storefront domain changes later, update `STORE_PUBLIC_URL`, `COCINA_PUBLIC_URL`, `BIENESTAR_PUBLIC_URL`, `NEXT_PUBLIC_STORE_URL`, `NEXT_PUBLIC_COCINA_URL`, `NEXT_PUBLIC_BIENESTAR_URL`, `META_CATALOG_URL` and Meta catalog settings instead of changing code.

## Runtime

Vicky corre **dentro de `ecommerce-tools`**, no como una app aparte. El webhook
de WhatsApp Cloud API entra al servicio, el agente arma la respuesta en
`services/ecommerce-tools/src/whatsapp-agent.ts` y contesta por el mismo canal.

Interruptor:

```text
WHATSAPP_AGENT_MODE=openai   # `off` lo apaga y las respuestas quedan manuales
OPENAI_API_KEY=<clave>
OPENAI_MODEL=gpt-5-mini
```

El guion no vive en un archivo del repo: son reglas en la base de datos que el
dueño edita en Admin → CRM WhatsApp → **Guión IA**, más la configuración
comercial de **Configuración**. Los cambios aplican sin redeploy.

Hasta agosto de 2026 Vicky fue una app OpenClaw separada, con su propio prompt
en `agents/` y su gateway en `vicky.b2b.com.ec`. Ese runtime se retiró: si
encuentras referencias a OpenClaw en documentos de planificación, son
históricas.

## Data Boundaries

Vicky should not query the database directly for normal sales work. Use `ecommerce-tools`:

- `GET /tools/search-products?vertical=cocina|bienestar`
- `GET /tools/ai-context/customer/:phone`
- `POST /tools/quote`
- `POST /tools/orders`
- `GET /tools/payment-methods`
- `POST /tools/whatsapp-cart-sessions`
- `POST /tools/datafast/checkout`
- `POST /tools/customer-events`
- `POST /tools/events`
- `GET /tools/followups/due`
- `GET /tools/dashboard`
- `POST /tools/meta-post-draft`

The tools service is responsible for Medusa, CRM WhatsApp, Meta events, Datafast and order traceability.

## Formas de pago (dos)

Vicky ofrece **solo dos**: transferencia/depósito bancario y tarjeta con
Datafast. No hay pago contra entrega — se despacha después de confirmar el pago.

Los datos de la cuenta bancaria **no viven en el repo** (es público) **ni en
variables de entorno**: se editan en Admin → CRM WhatsApp → **Configuración** y
Vicky los lee con `GET /tools/payment-methods`. Ver
[CONFIG_COMERCIAL.md](CONFIG_COMERCIAL.md).

Sin la cuenta cargada, la respuesta marca `configured: false` y tanto el prompt
como el agente propio obligan a escalar a un humano en lugar de dictar una
cuenta inventada. Verificación:

```bash
curl -fsS "$ECOMMERCE_TOOLS_BASE_URL/tools/payment-methods" \
  -H "Authorization: Bearer $ECOMMERCE_TOOLS_TOKEN" | head -40
```

La misma respuesta trae la política de previo pago, el guion de confianza
(videos de despacho en redes, guía de Servientrega, reseñas) y los enlaces a la
página pública `/pagos`.

## Puesta en marcha

1. Cargar `OPENAI_API_KEY` en el servicio `ecommerce-tools` y poner
   `WHATSAPP_AGENT_MODE=openai`.
2. Configurar el webhook de Meta contra `/webhooks/whatsapp` del mismo servicio
   (`WHATSAPP_WEBHOOK_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET`,
   `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`).
3. Revisar el guion en Admin → CRM WhatsApp → Guión IA y la cuenta bancaria en
   Configuración.
4. Probar con el número de venta antes de abrirlo a las campañas.

## Validation

Validate the current ecommerce stack before enabling the bot:

```bash
curl -fsS https://cocina.eter-niu.com/ | head
curl -fsS https://bienestar.eter-niu.com/ | head
curl -fsS https://cocina.eter-niu.com/feeds/meta/catalog.csv | head
curl -fsS https://bienestar.eter-niu.com/feeds/meta/catalog.csv | head
curl -fsS https://admin.eter-niu.com/app/crm-whatsapp | head
```

Validate Vicky after deployment:

```bash
curl -fsS https://whatsapp-test.eter-niu.com/healthz
```

Then run a controlled WhatsApp test:

1. Ask for a wok or olla recommendation.
2. Confirm Vicky searches products before answering price.
3. Ask for a quote.
4. Ask for payment link.
5. Confirm the order appears in `/app/crm-whatsapp`.
6. Confirm no followup is sent without consent or active conversation policy.

## CRM Reset Before Campaigns

Use the reset script only for a clean launch window and only after confirming that no real CRM record must be preserved. It resets only the B2B CRM tables: `crm_customer_profile`, `crm_customer_event` and `conversational_order`.

Dry-run with backup:

```bash
DATABASE_URL="<medusa_postgres_url>" npm run crm:reset
```

Confirmed reset with backup:

```bash
DATABASE_URL="<medusa_postgres_url>" npm run crm:reset -- --confirm-reset-crm
```

The script writes JSON/CSV backups under `data/crm-backups/<timestamp>` and does not touch Medusa catalog, products, users, customers, regions or core orders.

## Name And City Capture

After a product-specific WhatsApp click or stock/payment question, Vicky should ask:

```text
Para confirmarte envio gratis por Servientrega, me ayudas con tu nombre y ciudad?
```

Then register:

```bash
curl -X POST "$ECOMMERCE_TOOLS_BASE_URL/tools/customer-events" \
  -H "Authorization: Bearer $ECOMMERCE_TOOLS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+593979854915",
    "type": "lead_created",
    "source": "vicky_whatsapp",
    "customer": {"name": "Maria Cliente", "whatsappConsent": true},
    "metadata": {
      "city": "Cuenca",
      "productInterestSku": "COC-CUCHILLO-SAMURAI-TODO-USO",
      "campaignSlug": "cuchillo-samurai-japones-todo-uso",
      "leadId": "Lead Cuchillo 777",
      "journeyStage": "cotizacion_pendiente"
    }
  }'
```

## Message Logging (Timeline de Conversación)

**IMPORTANTE**: Vicky debe registrar cada mensaje de WhatsApp en el CRM para construir el timeline de conversación.

### Mensajes entrantes (cliente → Vicky)

Cuando Vicky recibe un mensaje del cliente, registra inmediatamente:

```bash
curl -X POST "$ECOMMERCE_TOOLS_BASE_URL/tools/customer-events" \
  -H "Authorization: Bearer $ECOMMERCE_TOOLS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+593979854915",
    "type": "message_in",
    "at": "2026-06-11T14:30:00Z",
    "source": "vicky_whatsapp",
    "payload": {
      "text": "Hola, me interesa la olla de granito",
      "mediaType": "text",
      "mediaUrl": null
    }
  }'
```

### Mensajes salientes (Vicky → cliente)

Cuando Vicky envía un mensaje al cliente, registra inmediatamente:

```bash
curl -X POST "$ECOMMERCE_TOOLS_BASE_URL/tools/customer-events" \
  -H "Authorization: Bearer $ECOMMERCE_TOOLS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+593979854915",
    "type": "message_out",
    "at": "2026-06-11T14:30:15Z",
    "source": "vicky_whatsapp",
    "payload": {
      "text": "Hola Maria, la olla de granito tiene X capacidad...",
      "mediaType": "text",
      "mediaUrl": null
    }
  }'
```

### Payload soportado

El campo `payload` debe contener:

- `text` (string): El texto del mensaje
- `mediaType` (string, opcional): Tipo de media (`text`, `image`, `video`, `audio`, `document`)
- `mediaUrl` (string, opcional): URL del media si no es texto

### Volumen y validación

- **1 evento por mensaje**: No agrupar ni batchear mensajes
- **Timestamp `at`**: Usar la hora real del mensaje (no la hora del registro)
- **Consentimiento implícito**: Al registrar un `message_in`, asumir que el cliente tiene consentimiento si el número tiene `whatsapp_consent=true`
- **Casos especiales**:
  - Si el cliente envía media (imagen/video), registrar en `mediaUrl`
  - Si el mensaje contiene un audio, usar `mediaType: "audio"`
  - Si el cliente comparte ubicación, usar `mediaType: "location"` y poner coordenadas en `text`

### Prompt de Vicky

Añadir a las instrucciones del prompt de Vicky:

```text
TRANSPARENCIA DE CRM: Cada mensaje que envíes o recibas debe registrarse en el CRM.
Al recibir un mensaje, POST /tools/customer-events con type=message_in.
Al enviar un mensaje, POST /tools/customer-events con type=message_out.
Esto crea el timeline de conversación visible en el admin.
```

### Validación en producción

Verificar que cada conversación tenga N eventos `message_in` + `message_out` intercalados:

```bash
# En el admin, abrir la ficha de un cliente
# Ir a la pestaña "Conversación"
# Verificar que los mensajes aparecen como burbujas (in izquierda, out derecha)
# Verificar que hay 1 evento por cada mensaje real de WhatsApp
```

Use `/tools/sales/payment-proof` for transfer screenshots under review and `/tools/sales/confirm` only after human confirmation.

## Responder por Cloud API (ventana de 24 h)

Cuando entra un mensaje por el webhook de Meta, la respuesta sale por el mismo
canal de Cloud API. Fuera de la ventana de 24 h ya no se puede mandar texto
libre y hay que usar una plantilla aprobada.

### Flujo

1. `POST /webhooks/whatsapp` recibe el mensaje, lo registra como `message_in` y
   se lo pasa al agente.

2. Vicky procesa el mensaje y, al responder, llama a:

```bash
curl -X POST "$ECOMMERCE_TOOLS_BASE_URL/tools/whatsapp/reply" \
  -H "Authorization: Bearer $ECOMMERCE_TOOLS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+593979854915",
    "text": "Hola Maria, la olla de granito tiene antiadherente..."
  }'
```

3. ecommerce-tools verifica que `metadata.lastInboundAt` exista y sea < 24h.
   - Si sí: envía el texto como **mensaje libre (free-form)** vía Cloud API (gratis) y registra `message_out`.
   - Si no: responde **409 `{ "error": "window_closed" }`**.

4. Ante un 409, Vicky/coordinador decide si enviar una plantilla vía el
   dispatcher (modo `meta`).

### Respuesta exitosa (200)

```json
{
  "ok": true,
  "channel": "cloud_api_freeform",
  "sentAt": "2026-06-12T14:30:15.000Z"
}
```

### Ventana cerrada (409)

```json
{
  "error": "window_closed"
}
```

Esto significa que el cliente no ha escrito en las últimas 24h. Para contactarle
fuera de ventana se debe usar una plantilla aprobada por Meta a través del
dispatcher con `CRM_FOLLOWUP_DISPATCH_MODE=meta`.

## Production Guardrails

- Keep Datafast in `DATAFAST_DRY_RUN=true` until real credentials and the result callback are validated.
- Keep outbound WhatsApp allowlisted during early testing.
- Do not automate ad spend or Marketplace publishing without explicit human confirmation.
- Human must confirm delivery, invoice, warranty exceptions, bulk discounts and unclear payment status.

## Automatic Reorder Followups (CRM Dispatch)

The Medusa backend runs a daily scheduled job (`dispatch-due-followups`, default
`0 14 * * *` UTC = 9:00 America/Guayaquil) that processes CRM customers whose
`next_followup_at` is due, with `whatsapp_consent=true`, no `opt_out` event and
no `followup_sent`/`followup_queued` event in the last
`CRM_FOLLOWUP_COOLDOWN_DAYS` (default 7).

It can also be triggered manually from the admin dashboard ("Ejecutar followups
ahora") or via:

```bash
curl -X POST "https://admin.eter-niu.com/admin/b2b/crm/followups/dispatch" \
  -H "Content-Type: application/json" \
  -b "$MEDUSA_ADMIN_COOKIE" \
  -d '{"dryRun": true}'
```

### Dispatch modes (`CRM_FOLLOWUP_DISPATCH_MODE`)

- `draft` (default, safe lane): no message is sent. Each due customer gets a
  `followup_queued` CRM event with the suggested message, visible in the admin
  dashboard ("Cola de envío de recompra") for manual sending via wa.me.
- `meta`: el job envía por WhatsApp Cloud API. Dentro de la ventana de 24 h va
  como texto libre; fuera de ella, como plantilla aprobada. Si el envío falla,
  degrada a `followup_queued`.

Existió un tercer modo, `openclaw`, que empujaba el mensaje a un gateway
externo. Ese runtime se retiró: un valor heredado cae a `draft` y encola sin
enviar.

In both modes `next_followup_at` advances `CRM_FOLLOWUP_RETRY_DAYS` (default 7)
so customers are not reprocessed on every run.

### Enabling automatic sending in Coolify

1. Verify the queue works in `draft` mode first (events `followup_queued`).
2. Set on the ecommerce stack (medusa-api service):
   - `CRM_FOLLOWUP_DISPATCH_MODE=meta`
   - `WHATSAPP_PHONE_NUMBER_ID` y `WHATSAPP_ACCESS_TOKEN` cargados
3. Optional tuning: `CRM_FOLLOWUP_MAX_PER_RUN` (default 20),
   `CRM_FOLLOWUP_WINDOW` (default `9-19`, Guayaquil hours),
   `CRM_FOLLOWUP_CRON`, `CRM_FOLLOWUP_ENABLED=false` as kill-switch.
4. Guardrails: consent-only (the query already filters
   `whatsapp_consent=true`), opt-out respected, cooldown dedupe, per-run cap,
   send window, and full audit trail as CRM events.
