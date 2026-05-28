# Coolify Deployment

## App

Create one Docker Compose application in Coolify from this repository and use `docker-compose.yml`.

Public routing:

- `shop.b2b.com.ec` -> `storefront:3000`
- `adminshop.b2b.com.ec/` -> `admin-redirect:80` or host port `127.0.0.1:18216` for the root redirect to `/app`
- `adminshop.b2b.com.ec/app` and `/app/*` -> Medusa Admin on `medusa-api:9000` or host port `127.0.0.1:18215`
- `medusa-api:9000` and `ecommerce-tools:8787` are internal-only through Docker `expose`.
- Do not publish `medusa-api` or `ecommerce-tools` directly to the host unless a specific webhook route is being protected and reviewed.
- Default host bind for the public storefront is `127.0.0.1:18214:3000` through `STOREFRONT_PORT_MAPPING`.

If Coolify requires a single public service, expose the storefront first. Add internal-only service URLs through Docker DNS:

- `http://medusa-api:9000`
- `http://ecommerce-tools:8787`

## Required secrets

Set these in Coolify environment variables, not in Git:

- `POSTGRES_PASSWORD`
- `JWT_SECRET`
- `COOKIE_SECRET`
- `TOOLS_API_TOKEN`
- `PAYPHONE_TOKEN` when `PAYPHONE_DRY_RUN=false`
- `PAYPHONE_STORE_ID` when `PAYPHONE_DRY_RUN=false`
- `MEDUSA_PUBLISHABLE_KEY` after Medusa seed/admin setup
- `MEDUSA_ADMIN_API_KEY` secret key `sk_...` for production CRM/order sync
- `CRM_BACKEND=medusa`
- `ALLOW_DEMO_CATALOG=false`
- `STOREFRONT_PORT_MAPPING`, default `127.0.0.1:18214:3000`
- `NEXT_PUBLIC_PIXEL_ENABLED=false` until Meta Events Manager is ready
- `PIXEL_ENABLED=false` until CAPI credentials are validated
- `NEXT_PUBLIC_META_PIXEL_ID`, `META_PIXEL_ID` or `META_DATASET_ID`
- `META_ACCESS_TOKEN`
- `META_CAPI_TEST_EVENT_CODE` for Events Manager test mode
- `NEXT_PUBLIC_PIXEL_CONSENT_MODE=banner`

The compose file intentionally fails if the required core secrets are missing.

## First run

1. Deploy the compose app.
2. Open Medusa Admin on the internal or temporary exposed Medusa URL.
3. Migrations run on `medusa-api` startup. Seed base data and kitchen catalog from the Medusa container if needed:

```bash
npm run backend:seed
npm --workspace apps/backend run seed:kitchen
```

4. Copy the generated publishable key to `MEDUSA_PUBLISHABLE_KEY`.
5. Validate:

```bash
curl http://ecommerce-tools:8787/healthz
curl http://ecommerce-tools:8787/tools/search-products
curl http://ecommerce-tools:8787/feeds/meta/catalog.csv
```

## OpenClaw dedicated gateway

Create a separate OpenClaw Coolify app and volume for ecommerce sales. Do not reuse Cody or Bruno state.

Recommended production bot:

- Name: `Vicky`
- Coolify service: `vicky-sales-bot`
- Public URL: `https://vicky.b2b.com.ec`
- Prompt: `agents/vicky-sales-bot.md`
- Env example: `infra/vicky-coolify.env.example`
- Runbook: `docs/VICKY_BOT.md`

Configure the agent to call the tools service over the internal network:

```text
ECOMMERCE_TOOLS_BASE_URL=http://ecommerce-tools:8787
ECOMMERCE_TOOLS_TOKEN=<TOOLS_API_TOKEN>
```

Then link WhatsApp only for the ecommerce seller number and keep an allowlist during early testing.
