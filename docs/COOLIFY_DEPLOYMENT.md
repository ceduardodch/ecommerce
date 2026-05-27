# Coolify Deployment

## App

Create one Docker Compose application in Coolify from this repository and use `docker-compose.yml`.

Public routing:

- `shop.b2b.com.ec` -> `storefront:3000`
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
- `MEDUSA_ADMIN_API_KEY` when production order sync is enabled
- `STOREFRONT_PORT_MAPPING`, default `127.0.0.1:18214:3000`

The compose file intentionally fails if the required core secrets are missing.

## First run

1. Deploy the compose app.
2. Open Medusa Admin on the internal or temporary exposed Medusa URL.
3. Run migrations and seed from the Medusa container if needed:

```bash
npm run backend:seed
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

Configure the agent to call the tools service over the internal network:

```text
ECOMMERCE_TOOLS_BASE_URL=http://ecommerce-tools:8787
ECOMMERCE_TOOLS_TOKEN=<TOOLS_API_TOKEN>
```

Then link WhatsApp only for the ecommerce seller number and keep an allowlist during early testing.
