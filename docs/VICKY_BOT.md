# Vicky Bot

Vicky is the dedicated ecommerce sales bot for WhatsApp and web/social leads.

## Public URLs

- Bot gateway: `https://vicky.b2b.com.ec`
- Storefront: `https://shop.b2b.com.ec`
- CRM backoffice: `https://adminshop.b2b.com.ec/app/crm-whatsapp`
- Meta catalog feed: `https://shop.b2b.com.ec/feeds/meta/catalog.csv`

Keep these URLs in environment variables. If the storefront domain changes later, update `STORE_PUBLIC_URL`, `NEXT_PUBLIC_STORE_URL`, `META_CATALOG_URL` and Meta catalog settings instead of changing code.

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

- `GET /tools/search-products`
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
curl -fsS https://shop.b2b.com.ec/ | head
curl -fsS https://shop.b2b.com.ec/feeds/meta/catalog.csv | head
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

## Production Guardrails

- Keep PayPhone in `PAYPHONE_DRY_RUN=true` until real credentials and webhook are validated.
- Keep outbound WhatsApp allowlisted during early testing.
- Do not automate ad spend or Marketplace publishing without explicit human confirmation.
- Human must confirm delivery, invoice, warranty exceptions, bulk discounts and unclear payment status.
