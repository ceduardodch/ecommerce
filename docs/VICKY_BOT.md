# Vicky Bot

Vicky is the dedicated ecommerce sales bot for WhatsApp and web/social leads.

## Public URLs

- Bot gateway: `https://vicky.b2b.com.ec`
- Cocina storefront: `https://cocina.b2b.com.ec`
- Bienestar storefront: `https://bienestar.b2b.com.ec`
- Legacy storefront: `https://shop.b2b.com.ec`
- CRM backoffice: `https://adminshop.b2b.com.ec/app/crm-whatsapp`
- Meta catalog cocina: `https://cocina.b2b.com.ec/feeds/meta/catalog.csv`
- Meta catalog bienestar: `https://bienestar.b2b.com.ec/feeds/meta/catalog.csv`

Keep these URLs in environment variables. If a storefront domain changes later, update `STORE_PUBLIC_URL`, `COCINA_PUBLIC_URL`, `BIENESTAR_PUBLIC_URL`, `NEXT_PUBLIC_STORE_URL`, `NEXT_PUBLIC_COCINA_URL`, `NEXT_PUBLIC_BIENESTAR_URL`, `META_CATALOG_URL` and Meta catalog settings instead of changing code.

## Runtime

Run Vicky as a separate OpenClaw Coolify app with its own persistent volume. Do not reuse Cody or Bruno state.

Recommended service name:

```text
vicky-sales-bot
```

Recommended domain:

```text
vicky.b2b.com.ec
```

Prompt:

```text
agents/vicky-sales-bot.md
```

Environment examples:

```text
agents/vicky-openclaw-config.example.env
infra/vicky-coolify.env.example
```

## Data Boundaries

Vicky should not query the database directly for normal sales work. Use `ecommerce-tools`:

- `GET /tools/search-products?vertical=cocina|bienestar`
- `GET /tools/ai-context/customer/:phone`
- `POST /tools/quote`
- `POST /tools/orders`
- `POST /tools/payphone-link`
- `POST /tools/customer-events`
- `POST /tools/events`
- `GET /tools/followups/due`
- `GET /tools/dashboard`
- `POST /tools/meta-post-draft`

The tools service is responsible for Medusa, CRM WhatsApp, Meta events, PayPhone and order traceability.

## Coolify Setup

1. Create a separate OpenClaw app named `vicky-sales-bot`.
2. Attach it to the same Docker network as the ecommerce stack when possible, so it can reach `http://ecommerce-tools:8787`.
3. Mount a dedicated persistent volume for OpenClaw state, for example:

```text
/home/b2b/data/openclaw-vicky:/home/node/.openclaw
```

4. Set the variables from `infra/vicky-coolify.env.example`.
5. Set `ECOMMERCE_TOOLS_TOKEN` to the same secret as ecommerce `TOOLS_API_TOKEN`.
6. Route `vicky.b2b.com.ec` to the OpenClaw gateway port.
7. Link only the ecommerce WhatsApp seller number during early testing.

## Validation

Validate the current ecommerce stack before enabling the bot:

```bash
curl -fsS https://cocina.b2b.com.ec/ | head
curl -fsS https://bienestar.b2b.com.ec/ | head
curl -fsS https://cocina.b2b.com.ec/feeds/meta/catalog.csv | head
curl -fsS https://bienestar.b2b.com.ec/feeds/meta/catalog.csv | head
curl -fsS https://adminshop.b2b.com.ec/app/crm-whatsapp | head
```

Validate Vicky after deployment:

```bash
curl -fsS https://vicky.b2b.com.ec/healthz
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

Use `/tools/sales/payment-proof` for transfer/deuna screenshots under review and `/tools/sales/confirm` only after human confirmation.

## Production Guardrails

- Keep PayPhone in `PAYPHONE_DRY_RUN=true` until real credentials and webhook are validated.
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
curl -X POST "https://adminshop.b2b.com.ec/admin/b2b/crm/followups/dispatch" \
  -H "Content-Type: application/json" \
  -b "$MEDUSA_ADMIN_COOKIE" \
  -d '{"dryRun": true}'
```

### Dispatch modes (`CRM_FOLLOWUP_DISPATCH_MODE`)

- `draft` (default, safe lane): no message is sent. Each due customer gets a
  `followup_queued` CRM event with the suggested message, visible in the admin
  dashboard ("Cola de envío de recompra") for manual sending via wa.me.
- `openclaw`: the job POSTs each followup to the OpenClaw gateway so Vicky
  sends it through the existing WhatsApp session. On success a `followup_sent`
  event is recorded; on any HTTP/network failure it degrades to
  `followup_queued`.

In both modes `next_followup_at` advances `CRM_FOLLOWUP_RETRY_DAYS` (default 7)
so customers are not reprocessed on every run.

### OpenClaw hook contract (mode `openclaw`)

Request sent by the backend:

```http
POST ${OPENCLAW_GATEWAY_URL}${OPENCLAW_GATEWAY_HOOK_PATH:-/hooks/agent}
Authorization: Bearer ${OPENCLAW_HOOKS_TOKEN}
Content-Type: application/json

{
  "name": "crm-followup",
  "channel": "whatsapp",
  "to": "+593979854915",
  "deliver": true,
  "message": "Hola Maria, vi que compraste ..."
}
```

Any 2xx response counts as sent. Configure the OpenClaw side (Coolify app) to
accept this webhook and deliver `message` to `to` over the connected WhatsApp
channel, respecting `OPENCLAW_WHATSAPP_DM_POLICY`.

### Enabling automatic sending in Coolify

1. Verify the queue works in `draft` mode first (events `followup_queued`).
2. Set on the ecommerce stack (medusa-api service):
   - `CRM_FOLLOWUP_DISPATCH_MODE=openclaw`
   - `OPENCLAW_GATEWAY_URL=https://vicky.b2b.com.ec` (or internal URL)
   - `OPENCLAW_HOOKS_TOKEN=<shared token>`
3. Optional tuning: `CRM_FOLLOWUP_MAX_PER_RUN` (default 20),
   `CRM_FOLLOWUP_WINDOW` (default `9-19`, Guayaquil hours),
   `CRM_FOLLOWUP_CRON`, `CRM_FOLLOWUP_ENABLED=false` as kill-switch.
4. Guardrails: consent-only (the query already filters
   `whatsapp_consent=true`), opt-out respected, cooldown dedupe, per-run cap,
   send window, and full audit trail as CRM events.
