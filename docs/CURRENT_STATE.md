# Current State

Estado de retoma creado el 2026-05-26, zona horaria America/Guayaquil.

## Git

- Rama actual esperada: `release`.
- Ramas permanentes locales existentes: `develop`, `release`, `main`.
- Commit base inicial: `97d89e0 Initial ecommerce platform scaffold`.
- No habia remoto configurado al crear este documento.
- No hacer push, PR, merge ni cambios en `main` sin autorizacion explicita.

## Implementado

- Monorepo npm con workspaces.
- Medusa v2 backend en `apps/backend`.
- Next.js storefront en `apps/storefront`.
- Fastify tools service en `services/ecommerce-tools`.
- MCP server para tools en `services/ecommerce-tools/src/mcp-server.ts`.
- Docker Compose Coolify-ready.
- Skills repo-locales para ventas, Meta/Marketplace y PayPhone.
- Prompt/config ejemplo para OpenClaw ecommerce.
- Docs de arquitectura, Coolify, ramas y CI.

## Servicios existentes

El compose del ecommerce levanta:

- `postgres`
- `redis`
- `medusa-api`
- `ecommerce-tools`
- `storefront`

OpenClaw no esta en este compose. Debe desplegarse como app separada en Coolify con volumen propio.

`medusa-api` y `ecommerce-tools` deben quedar internos; el compose usa `expose` para esos servicios. El unico servicio publicado al host es el storefront por `STOREFRONT_PORT_MAPPING`, con default `127.0.0.1:18214:3000`, detras de `shop.b2b.com.ec`.

## Flujo funcional disponible

El servicio `ecommerce-tools` permite:

- Buscar productos.
- Construir cotizaciones.
- Crear ordenes conversacionales con estado `pending_payment`.
- Generar link PayPhone en modo dry-run si no hay credenciales reales.
- Recibir webhook PayPhone y marcar pago como `paid` o `payment_review`.
- Exportar feed Meta CSV.
- Generar draft para Facebook, Instagram y Marketplace.
- Importar clientes/compras historicas para CRM WhatsApp.
- Consultar cliente por telefono.
- Registrar eventos comerciales: cotizacion, orden, pago, entrega, recompra, no respuesta, escalamiento y opt-out.
- Listar followups vencidos con mensaje sugerido para recompra.
- Consultar dashboard operativo JSON de leads, ordenes pendientes, pagos y followups.

## Catalogo

- `ecommerce-tools` intenta leer productos desde Medusa por `/store/products`.
- En produccion `ALLOW_DEMO_CATALOG=false`: si Medusa no responde o no tiene productos, no se muestra catalogo demo.
- El fallback de cocina queda solo para desarrollo/pruebas con `ALLOW_DEMO_CATALOG=true`.
- La orientacion actual es nicho cocina saludable: ollas y woks de granito, set MGC, utensilios compatibles, cuidado, recompra y promociones reales.
- Seed inicial disponible: `npm --workspace apps/backend run seed:kitchen`.
- Catalogo fuente trazado a posts: `data/catalog/eter-niu-products.csv`.

Metadata recomendada por producto:

- `material`
- `coating`
- `teflonFree`
- `pfoaFree`
- `pfasFree`
- `ptfeFree`
- `capacity`
- `diameterCm`
- `pieces`
- `stoveCompatibility`
- `tipoCocina`
- `nivel`
- `bundleUseCase`
- `careTips`
- `healthAngle`
- `warrantyText`
- `instagramSourceUrl`
- `sourceUrls`
- `contentAngles`
- `certificationStatus`
- `claimNote`
- `reorderAfterDays`

## CRM WhatsApp

CRM real vive en Medusa, modulo `b2bCrm`, con:

- Telefono normalizado.
- Nombre, email y consentimiento WhatsApp.
- Productos comprados.
- Frecuencia sugerida.
- Proximo seguimiento.
- Eventos comerciales.
- Orden conversacional vinculada a draft order Medusa.

Admin:

- `/app/crm-whatsapp`
- `/admin/b2b/crm/dashboard`
- `/admin/b2b/crm/followups/due`
- `/admin/b2b/orders`

Endpoints:

- `POST /tools/customers/import`
- `GET /tools/customers/:phone`
- `GET /tools/ai-context/customer/:phone`
- `POST /tools/customer-events`
- `POST /tools/events`
- `GET /tools/followups/due`
- `GET /tools/dashboard`

`ecommerce-tools` usa `CRM_BACKEND=medusa` en produccion. El modo JSON queda como fallback local de desarrollo y tests.

## Pagos

- PayPhone esta preparado como API Link.
- `PAYPHONE_DRY_RUN=true` es el modo seguro inicial.
- Para live se requieren `PAYPHONE_TOKEN`, `PAYPHONE_STORE_ID` y validacion de webhook.
- No pedir ni guardar datos de tarjeta en este repo ni en OpenClaw.

## Meta y Marketplace

- Feed Meta disponible en `/feeds/meta/catalog.csv`.
- Drafts organicos disponibles por `/tools/meta-post-draft`.
- Pixel/CAPI v1 disponible con `NEXT_PUBLIC_META_PIXEL_ID`, `META_ACCESS_TOKEN`, `META_DATASET_ID`/`META_PIXEL_ID` y `PIXEL_ENABLED`.
- Eventos web se guardan en CRM por `POST /tools/events`; WhatsApp abre `whatsapp_opened` e interes de producto `product_interest` incluyen `Lead`, SKU, precio, material y diametro para que OpenClaw una interes web con conversacion.
- Marketplace en v1 es asistido: la IA prepara titulo, copy, precio, fotos/checklist; humano confirma/publica.
- No automatizar gasto publicitario ni publicar sin confirmacion explicita.

## OpenClaw

- Prompt canonico: `agents/openclaw-ecommerce-seller.md`.
- Env ejemplo: `infra/openclaw-ecommerce.env.example`.
- Skills: `skills/ecommerce-sales`, `skills/meta-marketplace-assistant`, `skills/payphone-reconciliation`.
- Base URL esperada desde OpenClaw: `http://ecommerce-tools:8787`.
- Token esperado: `ECOMMERCE_TOOLS_TOKEN` debe coincidir con `TOOLS_API_TOKEN`.

## Validaciones ejecutadas

Despues de crear estos handoff docs se ejecuto:

```bash
git diff --check
POSTGRES_PASSWORD=local-check JWT_SECRET=local-jwt-secret COOKIE_SECRET=local-cookie-secret TOOLS_API_TOKEN=local-tools-token docker compose config
npm run build
npm run tools:test
```

Resultado:

- `git diff --check`: OK.
- `docker compose config`: OK.
- `npm run build`: OK, 3 paquetes exitosos.
- `npm run tools:test`: OK, 3 tests pasaron.
- Compose hardening: `medusa-api` y `ecommerce-tools` quedan con `expose`; solo `storefront` conserva `ports` limitado a `127.0.0.1:18214`.

Actualizacion cocina/CRM del 2026-05-27:

- `npm run build`: OK, 3 paquetes exitosos.
- `npm run tools:test`: OK, 4 tests pasaron.
- `npm --workspace @b2b/storefront run build`: OK.
- `git diff --check`: OK.
- `docker compose config`: OK con `META_CATALOG_BRAND=Eter Niu Cocina` y CORS para `adminshop.b2b.com.ec`.
- Browser desktop/mobile local: OK, solo catalogo de cocina, CTA WhatsApp y barra mobile visibles.
- Tools local: OK para `search-products`, `catalog.csv`, `customers/import`, `customers/:phone`, `followups/due` y `dashboard`.

## Validaciones recomendadas

Ejecutar antes de reportar listo:

```bash
npm run build
npm run tools:test
docker compose config
git status --short --branch
```

Validaciones de API si el stack esta arriba:

```bash
curl http://localhost:8787/healthz
curl http://localhost:8787/tools/search-products?limit=2
curl http://localhost:8787/feeds/meta/catalog.csv
```

## Pendiente antes de produccion

- Crear repo remoto y conectar estrategia `release`/`main` solo con autorizacion.
- Configurar Coolify staging/produccion.
- Cargar secretos reales en Coolify, no en Git.
- Crear productos reales en Medusa.
- Validar PayPhone sandbox y webhook.
- Levantar OpenClaw ecommerce separado y vincular WhatsApp vendedor.
- Importar BD historica de clientes/compras y verificar consentimiento.
- Probar end-to-end WhatsApp -> cotizacion -> orden -> link -> pago -> despacho.
- Definir politica operativa de facturacion, entrega, garantia e instalacion.
