# Sprint autónomo — plan ejecutable y backlog

> Creado 2026-08-31. Plan para que un agente avance solo, por lotes de 2 horas,
> sin el dueño presente. Las decisiones aquí están **CERRADAS**: no re-preguntar.
>
> Backlogs hermanos: [CRM_BACKLOG.md](./CRM_BACKLOG.md) ·
> [WEB_REDESIGN_PLAN.md](./WEB_REDESIGN_PLAN.md) · [DOMAIN_PLAN.md](./DOMAIN_PLAN.md)

## 0. Contexto en frío (para un agente que arranca sin historia)

Ecommerce ecuatoriano, dos líneas: cocina y bienestar. Se vende por WhatsApp
(bot Vicky) y por tarjeta (Datafast). ~80% del tráfico es móvil.

Lo que ya se cerró en esta tanda (todo en `main`, CI verde):

| Commit | Qué cerró |
|---|---|
| `cb76f92` | Canónicas propias, noindex, sitemap/robots por host, JSON-LD en fichas |
| `3191f7e` | Purchase de Meta al servidor + rate limit en `/api/events` |
| `f0ffe93` | Número de WhatsApp unificado (`593987135207`) |
| `25719f4` | CI corre typecheck y tests del backend |
| `a6e8b62` | Barrido de cobros Datafast cuyo callback nunca llegó |
| `885b26f` | Catálogo cacheado: 10 peticiones → 1 por cada 5 visitas a una ficha |
| `33f4a4a` | `product_review`: la tabla que rompía la cadena de migraciones |
| `a3b787a` | Catálogo de agosto fuera de `migration-scripts/` |

---

## 1. Frontera de autonomía (LA REGLA DE LA RUTINA)

**No hay branch protection en `main` y Coolify despliega en cuanto se hace push.
El CI corre después y no revierte nada.** De ahí esta clasificación.

### 🟢 VERDE — la rutina puede llegar sola hasta `main`

Cambios que no pueden tumbar la tienda en marcha ni escribirle a un cliente:

- Tests (de cualquier paquete).
- Documentación y este backlog.
- SEO no funcional: JSON-LD, metadata, sitemap, robots.
- Refactors sin cambio de comportamiento, con tests que lo demuestren.
- Contenido estático del storefront que no toque checkout ni carrito.

**Requisito para pushear**: `npm run typecheck` + `npm run build` +
`npm run tools:test` + `npm run backend:test:unit` en verde, ejecutados y con
output real en el reporte. Si algo falla: no se pushea, se deja la rama y se
anota en la bitácora.

### 🔴 ROJO — la rutina llega hasta rama + CI verde, y AHÍ SE DETIENE

Se deja la rama subida y anotada en la bitácora para revisión del dueño:

- Cualquier cosa bajo `services/ecommerce-tools/src/datafast.ts`, el flujo de
  pago, `/checkout/*`, el carrito o el ledger.
- Cualquier cosa que envíe mensajes a clientes (WhatsApp, plantillas, broadcasts,
  dispatch de recompra).
- `middleware.ts`, hosts, feeds de Meta, `analytics.tsx`, precios, cupones.
- Migraciones de base de datos.
- Cambios de variables de entorno o `docker-compose.yml`.

> Para mover un ítem de 🔴 a 🟢, el dueño lo anota aquí. Es una línea.

---

## 2. Backlog priorizado

Prioridad: **P1** mueve dinero ya · **P2** habilita crecimiento · **P3** pulido.
Esfuerzo: **S** < 2h · **M** 2–6h · **L** más de un lote.

### EPIC V — Vicky vendedora (P1) 🔴

La conversación **es** el checkout, y hoy Vicky es un FAQ: cada mensaje es una
llamada aislada a OpenAI, sin historial, sin saber con quién habla y sin
herramientas. Es la inversión con más impacto en tasa de cierre de todo el
backlog.

| ID | Historia | Esf. | Criterio de aceptación |
|---|---|---|---|
| V-1 | Historial de conversación en el prompt | M | `createWhatsAppAgentReply` recibe los últimos N turnos (los eventos `message_in`/`message_out` YA se guardan en el CRM, solo hay que leerlos). Test: el cliente responde "4" a "¿para cuántas personas?" y la respuesta lo usa. |
| V-2 | Contexto del cliente | M | El prompt incluye el resumen de `ai_context` (compras previas, etapa, próximo seguimiento). Test: un cliente que ya compró una olla no recibe la oferta de esa misma olla. |
| V-3 | Herramientas reales | L | El agente puede llamar `quote` y `create_order` vía tool-calling. Ningún cobro sin confirmación explícita del cliente en el chat. |
| V-4 | Notas de voz | M | `type === "audio"` se transcribe y entra al mismo flujo. Hoy se descartan en silencio, y en Ecuador son una fracción enorme del tráfico. |
| V-5 | Comprobantes por foto | M | `type === "image"` registra evento `payment_proof_received` con la imagen y escala a humano. Hoy la foto del comprobante de transferencia/deuna! se pierde. |

### EPIC R — Robustez (P1/P2)

| ID | Historia | Esf. | Prio | CA | Color |
|---|---|---|---|---|---|
| R-1 | Tests del storefront | M | P1 | Vitest configurado + tests de `lib/cart-pricing`, `lib/whatsapp`, `lib/catalog` (normalize/slug). Hoy son 0 tests sobre 14k líneas que incluyen carrito y precios. | 🟢 |
| R-2 | Ledger de pagos a Postgres | L | P2 | `datafast-checkouts.json` es read-modify-write sin lock: dos checkouts simultáneos pueden perder un registro. Mover al módulo Medusa. | 🔴 |
| R-3 | Catálogo en una sola fuente | L | P2 | Hoy vive en 4 sitios (~6.300 líneas duplicadas): CSV, seed de backend, `demo-catalog.ts`, fallback del storefront. Cambiar un precio son 4 ediciones. | 🟡 mixto |
| R-4 | Branch protection en `main` | S | P1 | PR obligatorio + CI verde antes de mergear. **Tarea del dueño** (ajuste en GitHub). | 🔴 |

### EPIC S — SEO y conversión (P2) 🟢

| ID | Historia | Esf. | CA |
|---|---|---|---|
| S-1 | JSON-LD en páginas de campaña | S | `Product` + `Offer` en `/campanas/[slug]`, como en las fichas. |
| S-2 | `BreadcrumbList` en fichas | S | El componente `Breadcrumbs` ya existe; falta emitir el schema. |
| ~~S-3~~ | ~~Carrito visible en móvil en las cards~~ | S | **CERRADA COMO OBSOLETA (lote 6, 2026-09-01).** El patrón que describe existió (commit `e943bae`, INTEG-2) pero el rediseño premium posterior (`18b1fdd` cocina, `d541aee` bienestar) lo eliminó a propósito al consolidar componentes duplicados. Hoy: listado cocina (`ShowcaseTile`) solo carrito, listado bienestar (`WellnessProductCard`) solo WhatsApp, ficha solo carrito (sin WhatsApp en ningún punto). Ninguna parte de la premisa ("la ficha tiene ambos") es cierta. Ver bitácora lote 6 para el detalle completo. |
| S-4 | `Organization` + `WebSite` en el layout | S | Sitelinks searchbox y panel de marca en Google. |

### EPIC O — Operación (P1) — **del dueño, no de la rutina**

| ID | Historia |
|---|---|
| O-1 | Confirmar `WHATSAPP_SELLER_NUMBER` = `593987135207` en Coolify |
| O-2 | Reenviar sitemaps en Search Console (cocina y bienestar) |
| O-3 | Revisar logs tras el deploy: `Recovered DataFast payments whose callback never arrived` |
| O-4 | Cargar los leads históricos (OPS-1 del CRM_BACKLOG) |
| O-5 | Línea base de KPIs para poder medir todo lo anterior |

---

## 3. Orden de ejecución de la rutina

Cada lote de 2h toma **el primer ítem no terminado** de esta lista:

1. S-2 · `BreadcrumbList` (🟢) — ✅ hecho, lote 1
2. S-1 · JSON-LD en campañas (🟢) — ✅ hecho, lote 2
3. S-4 · `Organization` + `WebSite` (🟢) — ✅ hecho, lote 4
4. R-1 · Tests del storefront (🟢) — ✅ hecho, lote 5 (en 1 lote, no 2)
5. ~~S-3~~ · ~~Carrito en móvil en las cards~~ (🟢) — ❌ cerrada como
   obsoleta, lote 6 (premisa ya no aplica tras el rediseño; ver tabla arriba)
6. V-1 · Historial de Vicky (🔴 → para en rama)
7. V-2 · Contexto del cliente (🔴 → para en rama)

Los 🔴 se preparan igual: rama, tests, CI verde, y anotación en la bitácora.

---

## 4. Definición de terminado

Un ítem está listo cuando:

1. Tiene su verificación **ejecutada** y el **output real** en la bitácora — no
   "debería funcionar" (REGLA #1 de `CLAUDE.md`).
2. `npm run typecheck` + `npm run build` + `npm run tools:test` +
   `npm run backend:test:unit` en verde.
3. Si es 🟢: mergeado a `main`, pusheado, y el run de CI confirmado en verde.
4. Si es 🔴: rama subida, PR abierto, CI verde, anotado para revisión.
5. Anotado en la bitácora con commit, evidencia y qué quedó pendiente.

## 5. Bitácora

La rutina escribe cada lote en `docs/BITACORA_AUTONOMA.md`: fecha, ítem,
commits, verificación con output, y qué encontró que no estaba en el plan.
