# Project Map

Mapa operativo del repo para agentes IA y humanos.

## Entrada

- `AGENTS.md`: reglas obligatorias para agentes.
- `AI_HANDOFF.md`: contexto de retoma.
- `README.md`: guia general.
- `docker-compose.yml`: stack Coolify del ecommerce.
- `.env.example`: variables locales esperadas.

## Apps

### `apps/backend`

Medusa v2 backend.

Responsabilidades:

- Commerce core.
- Admin Medusa.
- Catalogo, inventario, clientes y ordenes.
- Punto de extension futuro para workflows y modulos Medusa.

Archivos clave:

- `apps/backend/medusa-config.ts`: config Medusa, DB, Redis, CORS y secretos.
- `apps/backend/Dockerfile`: build del servicio `medusa-api`.
- `apps/backend/src/api/store/b2b/status/route.ts`: healthcheck custom usado por Docker.
- `apps/backend/src/migration-scripts/initial-data-seed.ts`: seed inicial de Medusa.

Scripts:

```bash
npm run backend:dev
npm run backend:build
npm run backend:start
npm run backend:seed
```

### `apps/storefront`

Next.js storefront publico.

Responsabilidades:

- Catalogo publico para `shop.b2b.com.ec`.
- Cards de producto.
- Boton de compra por WhatsApp.
- Feed Meta proxy.
- Pagina sandbox de PayPhone.
- Experiencia cocina-first: ollas, cuchillos, utensilios, combos, recompra y promociones reales.

Archivos clave:

- `apps/storefront/app/page.tsx`: pantalla principal.
- `apps/storefront/app/globals.css`: estilos globales.
- `apps/storefront/lib/catalog.ts`: lectura de catalogo desde `ecommerce-tools` con fallback local.
- `apps/storefront/app/feeds/meta/catalog.csv/route.ts`: proxy del feed Meta.
- `apps/storefront/app/payphone/sandbox/[clientTransactionId]/page.tsx`: pagina local de pago sandbox.
- `apps/storefront/Dockerfile`: build del servicio `storefront`.

Scripts:

```bash
npm run storefront:dev
npm run storefront:build
npm run storefront:start
```

## Services

### `services/ecommerce-tools`

Fastify HTTP API y MCP server para OpenClaw.

Responsabilidades:

- Buscar productos.
- Cotizar productos.
- Crear orden conversacional `pending_payment`.
- Crear link PayPhone.
- Recibir webhook PayPhone.
- Exportar feed Meta catalog CSV.
- Generar drafts para Facebook, Instagram y Marketplace.
- Guardar CRM minimo de clientes, compras, consentimiento WhatsApp, eventos y followups.

Archivos clave:

- `services/ecommerce-tools/src/index.ts`: HTTP API.
- `services/ecommerce-tools/src/mcp-server.ts`: MCP server stdio.
- `services/ecommerce-tools/src/service.ts`: casos de uso principales.
- `services/ecommerce-tools/src/catalog.ts`: carga de productos desde Medusa con fallback cocina.
- `services/ecommerce-tools/src/demo-catalog.ts`: catalogo fallback de cocina.
- `services/ecommerce-tools/src/customers.ts`: importacion CSV/JSON y borradores de recompra.
- `services/ecommerce-tools/src/payphone.ts`: integracion PayPhone/dry-run.
- `services/ecommerce-tools/src/meta.ts`: feed y drafts Meta.
- `services/ecommerce-tools/src/storage.ts`: persistencia de ordenes y clientes en `TOOLS_DATA_DIR`.
- `services/ecommerce-tools/src/auth.ts`: token Bearer para rutas privadas.
- `services/ecommerce-tools/src/contracts.ts`: schemas Zod.
- `services/ecommerce-tools/Dockerfile`: build del servicio `ecommerce-tools`.
- `services/ecommerce-tools/tests/quote.test.ts`: pruebas de cotizacion.

Scripts:

```bash
npm run tools:dev
npm run tools:build
npm run tools:start
npm run tools:test
npm --workspace @b2b/ecommerce-tools run mcp
```

## Agents

### `agents`

Prompts y ejemplos de configuracion para OpenClaw.

Archivos clave:

- `agents/openclaw-ecommerce-seller.md`: prompt canonico del vendedor ecommerce.
- `agents/openclaw-ecommerce-config.example.env`: variables ejemplo para la app OpenClaw.

## Skills

### `skills`

Skills repo-locales para agentes que retomen tareas del ecommerce.

- `skills/ecommerce-sales/SKILL.md`: flujo de venta, busqueda, cotizacion y orden.
- `skills/meta-marketplace-assistant/SKILL.md`: drafts Meta/Marketplace.
- `skills/payphone-reconciliation/SKILL.md`: conciliacion de pago PayPhone.

Cada skill incluye `agents/openai.yaml` como descriptor.

## Infra

### `infra`

Configuracion ejemplo para servicios externos.

- `infra/openclaw-ecommerce.env.example`: env base para OpenClaw ecommerce.

## Docs

- `docs/ARCHITECTURE.md`: arquitectura general.
- `docs/BRANCH_STRATEGY.md`: ramas y publicacion.
- `docs/CI_BRANCH_PROTECTION.md`: proteccion CI.
- `docs/COOLIFY_DEPLOYMENT.md`: despliegue Coolify.
- `docs/OPENCLAW_SELLER_PROMPT.md`: puntero al prompt canonico.
- `docs/OPENCLAW_HANDOFF.md`: retoma operativa de OpenClaw.
- `docs/CURRENT_STATE.md`: estado del proyecto.
- `docs/PROJECT_MAP.md`: este mapa.

## API principal

HTTP:

- `GET /healthz`
- `GET /tools/search-products`
- `POST /tools/quote`
- `POST /tools/orders`
- `POST /tools/payphone-link`
- `POST /tools/customers/import`
- `GET /tools/customers/:phone`
- `POST /tools/customer-events`
- `GET /tools/followups/due`
- `GET /tools/dashboard`
- `POST /webhooks/payphone`
- `GET /feeds/meta/catalog.csv`
- `POST /tools/meta-post-draft`

MCP:

- `search_products`
- `quote`
- `create_order`
- `create_payphone_link`
- `import_customers`
- `get_customer`
- `add_customer_event`
- `due_followups`
- `dashboard`
- `meta_post_draft`

## Docker Services

- `postgres`: base Medusa.
- `redis`: cache/eventos Medusa.
- `medusa-api`: backend Medusa, interno.
- `ecommerce-tools`: tools HTTP/MCP para agente, interno.
- `storefront`: Next.js publico.

OpenClaw no esta dentro de este compose; va como app separada en Coolify.
