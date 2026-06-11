# Eter Niu — monorepo ecommerce

Ecommerce ecuatoriano de ventas por WhatsApp con **dos líneas (únicas): cocina y
bienestar**. El checkout es la conversación con Vicky (bot WhatsApp) — no hay
carrito. ~80% del tráfico es móvil. Rama de trabajo: `release`.

## REGLA #1 — Verificación explícita (innegociable)

**Si algo no está verificado, dilo explícitamente.** Nunca presentes como hecho
lo que no comprobaste:

- Toda afirmación sobre **casos reales** (ventas, clientes, métricas, eventos en
  producción, comportamiento de campañas) se audita contra evidencia (base de
  datos, logs, dashboard, reporte de Meta) ANTES de afirmarse. Sin evidencia →
  se dice "no verificado".
- Todo trabajo de código se cierra con su verificación ejecutada (tests, build,
  curl) y el **output real** en el reporte — no "debería funcionar".
- Los reportes de subagentes son afirmaciones, no hechos: el coordinador (o el
  agente `verificador`) re-ejecuta las verificaciones clave antes del push.
- En reportes y documentos, separar siempre: **Verificado** (con cómo) vs
  **Asumido/Pendiente** (con qué falta para verificarlo).

## Mapa del repo

- `apps/backend` — Medusa v2 + módulo CRM `b2b-crm` (perfiles, eventos, recompra)
- `apps/storefront` — Next.js 15 (cocina/bienestar por host; rediseño en curso)
- `services/ecommerce-tools` — Fastify, fachada para Vicky (OpenClaw, app externa)
- `scripts/` — validación de campañas, sync catálogo, reset CRM

## Planes ejecutables (fuente de verdad; las decisiones ahí están CERRADAS)

- `docs/CRM_BACKLOG.md` — CRM nivel benchmark (épicas TPL/CONV/RPT/BRC/XSELL/BMK)
- `docs/WEB_REDESIGN_PLAN.md` — rediseño premium editorial (WFND/WCMP/WPRD/WHOM/WCLN)
- `docs/DOMAIN_PLAN.md` — migración a eter-niu.com (D1–D5)
- `docs/AGENT_WORKFLOW.md` — coordinación de agentes y estrategia de tokens
- `docs/LESSONS_LEARNED.md` — lecciones del proyecto

## Verificaciones estándar

- Backend: `cd apps/backend && npm run typecheck && npm run test:unit`
- Storefront: `cd apps/storefront && npm run build`
- Tools: `cd services/ecommerce-tools && npm test && npx tsc --noEmit`
- Campañas (con server activo): `node scripts/validate-meta-whatsapp-flow.mjs`

## Qué NO tocar sin orden explícita del dueño

Tracking (`analytics.tsx`, MetaPixel, `/api/events`), hosts del `middleware.ts`,
feeds Meta, `lib/whatsapp.ts`, URLs/params de campañas activas, precios/cupones.
