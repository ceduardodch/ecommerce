# AI Handoff

Este archivo orienta a cualquier agente IA que retome el proyecto. Las reglas de comportamiento viven en `AGENTS.md`; este archivo explica el contexto operativo.

## Orden de lectura

1. `AGENTS.md`: reglas obligatorias de ramas, push, PR, Coolify, secretos y limites.
2. `AI_HANDOFF.md`: contexto rapido del proyecto.
3. `docs/CURRENT_STATE.md`: que existe, que falta y que fue validado.
4. `docs/PROJECT_MAP.md`: mapa de carpetas, servicios y entrypoints.
5. `docs/OPENCLAW_HANDOFF.md`: como debe conectarse OpenClaw al ecommerce.
6. `docs/COOLIFY_DEPLOYMENT.md`: despliegue en Coolify.
7. `docs/BRANCH_STRATEGY.md`: estrategia de ramas.

## Objetivo del proyecto

Construir `shop.b2b.com.ec` como ecommerce conversacional de cocina para Ecuador:

- Medusa v2 maneja catalogo, admin, inventario, clientes y ordenes.
- Next.js muestra catalogo publico de ollas, cuchillos, utensilios, combos, feed Meta y enlaces a WhatsApp.
- `ecommerce-tools` expone herramientas HTTP y MCP para busqueda, cotizacion, ordenes, CRM, followups, PayPhone y Meta.
- OpenClaw opera como vendedor dedicado por WhatsApp, en una app Coolify separada, con contexto de cliente antes de recomendar.
- PayPhone API Link crea links de pago.
- Meta se usa para catalogo, posts asistidos y Marketplace asistido.

## Estado mental correcto

- Este repo no contiene el runtime completo de OpenClaw.
- OpenClaw debe vivir como app separada con volumen propio.
- Este repo contiene prompt, skills y variables ejemplo para conectar OpenClaw al servicio `ecommerce-tools`.
- `main` es frontera de produccion y esta atado a Coolify; no tocarlo sin autorizacion explicita.
- `release` es la rama de trabajo por defecto.
- No escribir secretos reales en Git.

## Arquitectura corta

```text
Cliente WhatsApp
  -> OpenClaw ecommerce seller
    -> ecommerce-tools HTTP/MCP
      -> CRM customers/events/followups
      -> Medusa API
      -> PayPhone API Link
      -> Meta catalog/drafts

Cliente web
  -> storefront Next.js
    -> ecommerce-tools
      -> Medusa API
```

## Servicios en Docker Compose

El `docker-compose.yml` del ecommerce incluye:

- `postgres`
- `redis`
- `medusa-api`
- `ecommerce-tools`
- `storefront`

No incluye OpenClaw. OpenClaw se despliega aparte y debe poder llamar a:

```text
http://ecommerce-tools:8787
```

Si la red interna de Coolify no resuelve ese host desde la app separada, exponer `ecommerce-tools` con token o conectar ambas apps a la misma red Docker/Coolify.

En produccion no publicar `medusa-api` ni `ecommerce-tools` como puertos de host. El compose deja esos servicios internos y publica solo el storefront por `127.0.0.1:18214:3000` salvo que `STOREFRONT_PORT_MAPPING` indique otro bind.

## Primeros comandos

```bash
git status --short --branch
npm install
npm run build
npm run tools:test
docker compose config
```

Para desarrollo local:

```bash
npm run tools:dev
npm run storefront:dev
```

Para stack completo:

```bash
docker compose up --build
```

## Limites importantes

- No asumir que algo esta desplegado si solo existe localmente.
- Separar siempre: estado local, commit local, remoto, PR, merge a `main` y despliegue Coolify.
- PayPhone en `PAYPHONE_DRY_RUN=true` no cobra dinero real.
- Marketplace Facebook en v1 es asistido: generar copy/checklist, no publicar sin confirmacion humana.
- WhatsApp en v1 lo maneja OpenClaw, no WhatsApp Cloud API desde este repo.
- Recontacto WhatsApp fuera de conversacion vigente debe ser consentido, aprobado o manual hasta tener canal Cloud API con plantillas.

## Siguiente trabajo natural

- Configurar remoto GitHub cuando el usuario lo autorice.
- Conectar Coolify a `release` para staging y `main` para produccion, segun la estrategia aprobada.
- Levantar OpenClaw ecommerce como app separada con el prompt y skills de este repo.
- Crear productos reales de cocina en Medusa Admin y sustituir el fallback local.
- Importar BD historica de clientes/compras por `/tools/customers/import`.
- Integrar PayPhone live despues de sandbox y webhook validado.
- Completar publicacion Meta con confirmacion humana antes de publicar o pautar.
