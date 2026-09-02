# Coolify Deployment

## App

Create one Docker Compose application in Coolify from this repository and use `docker-compose.yml`.

Public routing:

- `eter-niu.com` -> `storefront:3000`
- `www.eter-niu.com` -> `storefront:3000`
- `cocina.eter-niu.com` -> `storefront:3000`
- `bienestar.eter-niu.com` -> `storefront:3000`
- `admin.eter-niu.com/` -> `admin-redirect:80` or host port `127.0.0.1:18216` for the root redirect to `/app`
- `admin.eter-niu.com/app` and `/app/*` -> Medusa Admin on `medusa-api:9000` or host port `127.0.0.1:18215`
- Los hosts públicos anteriores bajo `b2b.com.ec` solo conservan redirecciones 301 al equivalente canónico.
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
- `MEDUSA_PUBLISHABLE_KEY` after Medusa seed/admin setup
- `MEDUSA_ADMIN_API_KEY` secret key `sk_...` for production CRM/order sync
- `CRM_BACKEND=medusa`
- `ALLOW_DEMO_CATALOG=false`
- `STOREFRONT_PORT_MAPPING`, default `127.0.0.1:18214:3000`
- `STORE_PUBLIC_URL=https://eter-niu.com`
- `COCINA_PUBLIC_URL=https://cocina.eter-niu.com`
- `BIENESTAR_PUBLIC_URL=https://bienestar.eter-niu.com`
- `NEXT_PUBLIC_STORE_URL=https://eter-niu.com`
- `NEXT_PUBLIC_COCINA_URL=https://cocina.eter-niu.com`
- `NEXT_PUBLIC_BIENESTAR_URL=https://bienestar.eter-niu.com`
- `NEXT_PUBLIC_PIXEL_ENABLED=false` until Meta Events Manager is ready
- `PIXEL_ENABLED=false` until CAPI credentials are validated
- `NEXT_PUBLIC_META_PIXEL_ID`, `META_PIXEL_ID` or `META_DATASET_ID`
- `META_ACCESS_TOKEN`
- `META_CAPI_TEST_EVENT_CODE` for Events Manager test mode
- `NEXT_PUBLIC_PIXEL_CONSENT_MODE=banner`
- `DATAFAST_ENV=test` for certification review; switch to `live` only with productive credentials.
- `DATAFAST_DRY_RUN=false` once test credentials are configured.
- `DATAFAST_ENTITY_ID`, `DATAFAST_ACCESS_TOKEN`, `DATAFAST_MID`, `DATAFAST_TID`.
- `DATAFAST_ECOMMERCE_ID`, `DATAFAST_SERVICE_PROVIDER_ID`, `DATAFAST_CUSTOMER_NAME` if Datafast provides values different from defaults.
- `REVIEWS_API_TOKEN` shared by `medusa-api` and `storefront` to enable review submission.
- `MEDUSA_INTERNAL_URL=http://medusa-api:9000` for storefront server-side review proxy.

The compose file intentionally fails if the required core secrets are missing.

For Eter Niu go-live, set public URLs to:

```text
STORE_PUBLIC_URL=https://eter-niu.com
COCINA_PUBLIC_URL=https://cocina.eter-niu.com
BIENESTAR_PUBLIC_URL=https://bienestar.eter-niu.com
NEXT_PUBLIC_STORE_URL=https://eter-niu.com
NEXT_PUBLIC_COCINA_URL=https://cocina.eter-niu.com
NEXT_PUBLIC_BIENESTAR_URL=https://bienestar.eter-niu.com
NEXT_PUBLIC_TOOLS_API_URL=https://eter-niu.com
NEXT_PUBLIC_BRAND_URL=https://www.eter-niu.com
```

## First run

1. Deploy the compose app.
2. Open Medusa Admin on the internal or temporary exposed Medusa URL.
3. Migrations run on `medusa-api` startup. Seed base data and kitchen catalog from the Medusa container if needed:

```bash
npm run backend:seed
npm --workspace apps/backend run seed:kitchen
npm --workspace apps/backend run seed:wellness
```

4. Copy the generated publishable key to `MEDUSA_PUBLISHABLE_KEY`.
5. Validate:

```bash
curl http://ecommerce-tools:8787/healthz
curl "http://ecommerce-tools:8787/tools/search-products?vertical=cocina"
curl "http://ecommerce-tools:8787/tools/search-products?vertical=bienestar"
curl "http://ecommerce-tools:8787/feeds/meta/catalog.csv?vertical=cocina"
curl "http://ecommerce-tools:8787/feeds/meta/catalog.csv?vertical=bienestar"
```

`GET http://ecommerce-tools:8787/healthz` must show `crmBackend: "medusa"`,
`allowDemoCatalog: false`, `datafastMode: "test"` and `datafastConfigured: true`
for Datafast certification review.
