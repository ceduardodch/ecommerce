# Backlog CRM → nivel benchmark

> Plan ejecutable del roadmap [CRM_BENCHMARK_ROADMAP.md](./CRM_BENCHMARK_ROADMAP.md).
> El rediseño visual del storefront tiene su propio plan ejecutable:
> [WEB_REDESIGN_PLAN.md](./WEB_REDESIGN_PLAN.md) (sprints WFND/WCMP/WPRD/WHOM/WCLN).
> La migración al dominio eter-niu.com: [DOMAIN_PLAN.md](./DOMAIN_PLAN.md) (fases D1–D5).
> Prioridad: P1 = mueve recompra/LTV ya · P2 = habilita crecimiento · P3 = pulido.
> Esfuerzo: S < 1 día · M = 1–3 días · L = 1 semana+.

## Cómo leer este backlog

Cada épica tiene historias con ID, archivos concretos y criterio de aceptación (CA).
Orden de ejecución sugerido al final. Convenciones existentes a reutilizar siempre:

- Módulo CRM: `apps/backend/src/modules/b2b-crm/` (service, models, followup-dispatch).
- Endpoints admin: `apps/backend/src/api/admin/b2b/crm/` + helpers `_shared.ts`.
- Páginas admin: `apps/backend/src/admin/routes/crm-whatsapp/` (fetch credentials include, estilos inline).
- Vicky entra por `services/ecommerce-tools` (`/tools/customer-events`, enum en `contracts.ts` + `types.ts`).
- Guardrails de envío: `selectDispatchTargets` / `dispatchFollowup` en `followup-dispatch.ts`.

---

## EPIC 0 — Operación (sin código) — P1

| ID | Historia | CA |
|---|---|---|
| OPS-1 | Importar leads históricos vía admin (CSV) | Todos los leads en la lista con etapa y próximo seguimiento |
| OPS-2 | 2 semanas en modo `draft` revisando la cola diaria | ≥ 10 followups enviados manual, opt-outs registrados |
| OPS-3 | Configurar hook en OpenClaw y activar `CRM_FOLLOWUP_DISPATCH_MODE=openclaw` con `MAX_PER_RUN=10` | Evento `followup_sent` automático visible en dashboard |
| OPS-4 | Línea base de KPIs (tasa respuesta, opt-out, ventas por followup) | Números anotados para comparar tras Fase RPT |

**Inputs del dueño**: archivo de leads; token compartido con OpenClaw.

---

## EPIC TPL — Plantillas de mensajes — P1 (S+M+S)

Hoy el mensaje de recompra está hardcodeado en `buildFollowupMessage()`
([followup-dispatch.ts](../apps/backend/src/modules/b2b-crm/followup-dispatch.ts)) y
duplicado en `_shared.ts` (`buildFollowupDraft`).

| ID | Historia | Esf. | Detalle |
|---|---|---|---|
| TPL-1 | Modelo `CrmMessageTemplate` | S | `models/crm-message-template.ts`: `key` (motivo: recompra, complemento, cuidado, estacional, cross_sell_cocina, cross_sell_bienestar, generico), `body` con variables `{nombre} {producto} {dias}`, `active`. Migración del módulo. Seeds por defecto con los textos actuales. |
| TPL-2 | Dispatcher usa plantillas | M | `renderTemplate(template, customer)` en `followup-dispatch.ts`; elegir por `followup_reason` (fallback `generico`). `buildFollowupDraft` de `_shared.ts` consume lo mismo para que el mensaje sugerido de la ficha y el del job coincidan. |
| TPL-3 | UI de plantillas | S | Sección "Plantillas" en el admin (`crm-whatsapp/templates/page.tsx`): listar, editar body, activar/desactivar. Endpoints GET/PATCH `admin/b2b/crm/templates`. |

**CA épica**: cambiar el texto de la plantilla `recompra` desde el admin cambia el
mensaje del próximo dispatch sin tocar código.

---

## EPIC CONV — Timeline de conversación — P1 (S+M+S)

No hay almacenamiento del texto de mensajes hoy. Decisión: **reutilizar
`crm_customer_event`** (types `message_in` / `message_out`, texto en
`payload.text`) — sin modelo ni migración nueva; el volumen es bajo y la ficha ya
lee eventos.

| ID | Historia | Esf. | Detalle |
|---|---|---|---|
| CONV-1 | Tipos `message_in`/`message_out` | S | Añadir al enum de `contracts.ts` + `types.ts` (ecommerce-tools). Payload: `{ text, mediaType?, mediaUrl? }`. Nada que cambiar en Medusa (el modelo acepta texto libre). |
| CONV-2 | Vicky registra cada mensaje | M | Actualizar prompt/config de Vicky y `docs/VICKY_BOT.md`: tras cada mensaje recibido/enviado, POST `/tools/customer-events` con el tipo y el texto. Validar volumen (1 evento por mensaje). |
| CONV-3 | Ficha tipo chat | S | En `leads/[phone]/page.tsx`: pestaña/sección "Conversación" que renderiza `message_in`/`message_out` como burbujas (in izquierda, out derecha) intercaladas con eventos clave (paid, quote_created). |

**CA épica**: abrir la ficha de un cliente muestra la conversación de WhatsApp
de los últimos N mensajes sin salir del admin (paridad con el lead card de Kommo).

---

## EPIC RPT — Reportes de recompra/LTV — P1 (M+S+M+S)

Patrón actual del dashboard (cargar en memoria con `listCrmCustomerProfiles`/`listConversationalOrders`)
sirve hasta ~10k clientes; mantenerlo y optimizar con SQL solo si duele.

| ID | Historia | Esf. | Detalle |
|---|---|---|---|
| RPT-1 | Métricas en el service | M | `recompraMetrics(asOf)` en `service.ts`: tasa de recompra 30/60/90d (clientes con ≥2 eventos `paid`), LTV promedio (suma `total_amount` de órdenes paid por phone), ventas atribuidas a followup (`paid` ≤ 7 días después de `followup_sent` del mismo phone), cohortes por mes de primera compra. Lógica pura testeable (mismo estilo que `followup-dispatch`). |
| RPT-2 | Endpoint | S | GET `admin/b2b/crm/reports/recompra` → JSON de RPT-1. |
| RPT-3 | Página "Recompra" | M | `crm-whatsapp/recompra/page.tsx`: tarjetas KPI + tabla de cohortes + lista de ventas atribuidas. Link desde el dashboard. |
| RPT-4 | Export CSV de segmento | S | Botón "Exportar CSV" en la lista de leads: genera CSV cliente-side con los filtros activos (inverso del import; columnas compatibles para re-importar). |

**CA épica**: responder con datos "¿cuánta plata generaron los followups este mes?"

---

## EPIC BRC — Broadcasts segmentados — P2 (M+M)

Lo que Kommo cobra en Advanced ($25/usuario). Reutiliza el 80% del dispatch.

| ID | Historia | Esf. | Detalle |
|---|---|---|---|
| BRC-1 | Endpoint de broadcast | ✅ M | POST `admin/b2b/crm/broadcasts`: `{ filter: {stage, tag, consent, vertical}, templateKey, dryRun }`. Resuelve el segmento con `searchCustomers`, aplica `selectDispatchTargets` (consentimiento, opt-out, cooldown) + tope `CRM_BROADCAST_MAX_PER_DAY` (env, default 50), despacha con `dispatchFollowup`, registra `broadcast_sent`/`broadcast_queued`. dryRun devuelve conteo + muestra. GET lista broadcasts recientes vía `listRecentBroadcasts`. |
| BRC-2 | UI de campaña | ✅ M | Lista de leads: filtro de línea + botón "Campaña a este filtro" → `CampaignModal` con selección de plantilla, vista previa dry-run (elegibles/omitidos + muestra del mensaje renderizado) y envío con confirmación explícita. |

**CA épica**: enviar una campaña de Navidad al segmento "vertical=cocina, consent=sí"
en 3 clics, sin pasar el tope diario.

---

## EPIC XSELL — Cross-sell cocina ↔ bienestar y estacionalidad — P2

Las dos líneas se alimentan mutuamente: quien cocina saludable es lead de
bienestar y viceversa. La recompra estacional (Navidad, Día de la Madre, Black
Friday) va por calendario sobre el pipeline de dispatch existente.

| ID | Historia | Esf. | Detalle |
|---|---|---|---|
| XS-1 | Segmento por vertical | ✅ S | Filtro "línea" en la lista de leads: deriva vertical de `purchasedProducts` (SKU `COC-`/`MGC-` = cocina, resto = bienestar) o de `metadata.vertical` vía `customerVerticals()` (flags independientes); expuesto en `searchCustomers`, en el filtro de la UI y en el selector de segmento del broadcast. Incluye los segmentos cross-sell "compró una línea y no la otra". |
| XS-2 | Plantillas de cross-sell | S | Seeds `cross_sell_bienestar` (compró cocina) y `cross_sell_cocina` (compró bienestar) en TPL; usables desde BRC-2. |
| XS-3 | Followups estacionales | M | Job mensual `src/jobs/schedule-seasonal-followups.ts`: fechas fijas EC (Navidad → 15-nov, Día de la Madre → fin de abril, Black Friday → mediados de nov) sobre segmentos con consentimiento; setea `next_followup_at` + `followup_reason: "estacional_*"` solo si no hay un followup más próximo. El dispatch existente hace el resto con la plantilla correcta. Lógica pura + tests unit. |
| XS-4 | Ciclos reales de bienestar | S | Auditar `reorderAfterDays` del catálogo de bienestar (`wellness-catalog-seed.ts`): los consumibles tienen ciclos más cortos que las ollas (30–60d vs 180d). Ajustar metadata para que el motor de recompra use frecuencias reales por producto. |

**CA épica**: un cliente que compró olla de granito recibe el cross-sell de
bienestar, y todo el segmento con consentimiento recibe la campaña de Navidad
agendada automáticamente en noviembre.

---

## EPIC BMK — Pulido benchmark — P3 (decidir tras medir RPT)

| ID | Historia | Esf. | Detalle |
|---|---|---|---|
| BMK-1 | Kanban por etapa | L | Vista drag & drop sobre `metadata.journeyStage` en la lista de leads. |
| BMK-2 | Segmentos RFM | M | Score frecuencia/recencia/monto por cliente → tags automáticas (`vip`, `dormido`, `nuevo`); filtros y broadcasts por segmento. |
| BMK-3 | NPS + referidos | M | Followup post-entrega (7d) vía plantilla; respuesta 9-10 → pedir referido con cupón. |

---

## Estado real (jun 2026)

| Épica | Estado |
|---|---|
| TPL (plantillas) | ✅ TPL-1..3 hechos |
| CONV (timeline) | ✅ CONV-1..3 hechos |
| RPT (reportes LTV) | ✅ RPT-1..4 hechos |
| BRC (broadcasts) | ✅ BRC-1, BRC-2 hechos |
| XSELL | ✅ XS-1..4 completados |
| BMK (P3) | ❌ Pendiente (espera datos de RPT) |
| EPIC 0 (operación) | ⚠️ Tareas del dueño — sin verificar (leads reales, hook OpenClaw) |

**Decisión jun 2026**: se prioriza el frente VISUAL (ver
[WEB_REDESIGN_PLAN.md](./WEB_REDESIGN_PLAN.md), Sprint B). El CRM retoma con
XS-2..4 después.

## Orden de ejecución (sprints de ~1 semana)

1. ~~**Sprint 1 — Mensajería**: TPL-1..3 + CONV-1..3~~ ✅
2. ~~**Sprint 2 — Medición**: RPT-1..4~~ ✅ (falta OPS-4 línea base con datos reales)
3. ~~**Sprint 3 — Campañas**: BRC-1..2 + XS-1~~ ✅
4. ~~**Sprint 4 — Estacionalidad y ciclos**: XS-2, XS-3, XS-4~~ ✅
5. **Después, según números**: BMK-1..3.

EPIC 0 (operación) corre en paralelo desde hoy — no depende de ningún sprint.

## Inputs pendientes del dueño

- [ ] Archivo de leads históricos (OPS-1).
- [ ] Token/URL del hook OpenClaw configurado (OPS-3).
- [ ] Aprobación de los textos de plantillas, incluidos los de cross-sell (TPL-1, XS-2).
- [ ] Frecuencias reales de recompra de los productos de bienestar (XS-4).

## Verificación transversal

Cada historia con código cierra con: `npm run typecheck` + `npm run test:unit`
(backend) o `npm test` (ecommerce-tools), y prueba manual en el admin local.
Las épicas TPL, RPT y XS-3 incluyen tests unitarios de lógica pura (patrón de
`followup-dispatch.unit.spec.ts`).
