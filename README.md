# B2B Cocina AI Native Ecommerce

Conversational kitchen-commerce for `shop.b2b.com.ec` with Medusa v2, Next.js, OpenClaw tool endpoints, CRM followups, PayPhone API Link, and Meta catalog export.

## Apps

- `apps/backend`: Medusa v2 commerce backend and admin.
- `apps/storefront`: Next.js public catalog.
- `services/ecommerce-tools`: HTTP and MCP tools for OpenClaw seller workflows.
- `agents`: OpenClaw seller prompt and example runtime config.
- `skills`: repo-local skills for sales, Meta/Marketplace drafts, and PayPhone reconciliation.

## AI handoff

For any IA agent retaking this repo, read in this order:

- `AGENTS.md`
- `AI_HANDOFF.md`
- `docs/CURRENT_STATE.md`
- `docs/PROJECT_MAP.md`
- `docs/OPENCLAW_HANDOFF.md`

Practical rule: `AGENTS.md` governs behavior; `AI_HANDOFF.md` gives project context.

## Local setup

```bash
npm install
cp .env.example .env
npm run tools:dev
npm run storefront:dev
```

For the full stack:

```bash
docker compose up --build
```

Useful URLs:

- Storefront dev: `http://localhost:3000`
- Storefront Docker compose: `http://localhost:18214`
- Medusa: `http://localhost:9000`
- Medusa Admin production route: `https://adminshop.b2b.com.ec/app`
- Tools API: `http://localhost:8787/healthz`
- Meta feed: `http://localhost:8787/feeds/meta/catalog.csv`

## OpenClaw tools

The seller agent should call `services/ecommerce-tools`:

- `GET /tools/search-products`
- `POST /tools/quote`
- `POST /tools/orders`
- `POST /tools/payphone-link`
- `POST /tools/customers/import`
- `GET /tools/customers/:phone`
- `POST /tools/customer-events`
- `GET /tools/followups/due`
- `GET /tools/dashboard`
- `POST /tools/meta-post-draft`
- `GET /feeds/meta/catalog.csv`

Build the MCP server after install:

```bash
npm run tools:build
npm --workspace @b2b/ecommerce-tools run mcp
```

Use the dedicated seller agent and skills:

- `agents/openclaw-ecommerce-seller.md`
- `agents/openclaw-ecommerce-config.example.env`
- `skills/ecommerce-sales/SKILL.md`
- `skills/meta-marketplace-assistant/SKILL.md`
- `skills/payphone-reconciliation/SKILL.md`

## Cocina + CRM

El fallback local ya no es generico: si Medusa no devuelve productos, la tienda muestra catalogo de cocina con ollas, cuchillos, tablas, utensilios, sartenes, combos y reposicion. Para produccion real, cargar productos en Medusa con metadata:

- `material`
- `tipoCocina`
- `nivel`
- `bundleUseCase`
- `careTips`
- `reorderAfterDays`

El CRM v1 vive en `ecommerce-tools` sobre `TOOLS_DATA_DIR`:

- `orders.json`: ordenes conversacionales.
- `customers.json`: telefono, consentimiento WhatsApp, historial, eventos y proximo seguimiento.

OpenClaw debe consultar cliente y catalogo antes de recomendar, registrar eventos comerciales y usar `/tools/followups/due` para recompra con confirmacion humana o canal permitido.

## Deployment

Use `docker-compose.yml` as the Coolify compose app. Route `shop.b2b.com.ec` to the storefront host port and `adminshop.b2b.com.ec` through Cloudflare Access to the Medusa Admin host port.

## Branch Strategy

Default work happens on `release`. `main` is production and is treated as the Coolify deploy boundary.

```text
develop -> release -> PR -> main
```

GitHub Actions is validation only. Coolify owns deploys.

See:

- `AGENTS.md`
- `docs/BRANCH_STRATEGY.md`
- `docs/CI_BRANCH_PROTECTION.md`
- `docs/ARCHITECTURE.md`
- `docs/CURRENT_STATE.md`
- `docs/PROJECT_MAP.md`
- `docs/COOLIFY_DEPLOYMENT.md`
- `docs/OPENCLAW_HANDOFF.md`
- `docs/OPENCLAW_SELLER_PROMPT.md`
