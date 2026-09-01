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
| `7abe79a` | S-2: `BreadcrumbList` JSON-LD en la ficha de producto |
| `7cb4a5b` | S-1: `Product`+`Offer` JSON-LD en campañas de cocina y bienestar |
| `ac99c17` | Fix de deploy roto: catálogo de agosto fuera de `src/data/` (excluido por `.dockerignore`) |
| `1aa6c78` | S-4: `Organization`+`WebSite` JSON-LD en las 3 portadas |
| `3cf16b5` + `e2fec79` | R-1: vitest + 37 tests del storefront, y que corran en CI |
| `dd9e663` (PR #10) | **V-1: historial de conversación en el prompt de Vicky** — feature de CRM: lee los eventos `message_in`/`message_out` que el CRM ya guarda (CONV-1..3 de `CRM_BACKLOG.md`) y se los pasa a `createWhatsAppAgentReply` |
| `65c3f74` (PR #11) | **V-2: contexto del cliente en el prompt de Vicky** — mismo patrón: lee compras previas/etapa/seguimiento del perfil CRM y evita reofrecer lo ya comprado (filtro en código, no solo instrucción al modelo) |
| `f89ac2c` (PR #12, mergeado por el dueño directo, fuera de la rutina) | **Bandeja operativa de WhatsApp** (`docs/CRM_WHATSAPP_INBOX.md`): conversación + asignación + notas internas en `/app/crm-whatsapp/inbox`, modo `human`/`ai` por conversación ("Tomar caso" saca a Vicky, "Liberar a Vicky" la devuelve), adjuntos (imagen/PDF/audio/video hasta 50 MB) con retención de 24 meses, SSE, y elimina OpenClaw del flujo activo. Toca los mismos archivos que V-1/V-2 (`whatsapp-webhook.ts`, `whatsapp-reply.ts`, `service.ts` de ecommerce-tools) — cualquier trabajo nuevo en el agente de Vicky debe leer este doc primero. |
| `ee7c585` (PR #13, dueño directo) | Fix: la media de WhatsApp (fotos/audio/PDF de la bandeja) no persistía entre servicios — corregido el volumen/ruta compartida. |
| `75f1da0` (PR #14, dueño directo) | Fix: la portada de cocina crasheaba si el catálogo llegaba vacío al arrancar; ahora muestra un estado "catálogo en actualización" con CTA a WhatsApp. También corrige `docker-compose.yml` para que `ecommerce-tools`/`storefront` esperen `service_healthy` de sus dependencias, no solo `service_started`. |
| `9a9d97e` (PR #15, dueño directo) | Fix: links de navegación del admin CRM (`crm-whatsapp/agent`, `crm-whatsapp/recompra`) apuntaban a `/admin/crm-whatsapp/...` en vez de `/crm-whatsapp/...`. |

V-1 y V-2 son la primera pareja de historias que conecta el prompt de Vicky
con los datos que el CRM ya venía acumulando desde que WhatsApp quedó
integrado (CONV-1..3). Detalle completo de ambas en
`docs/BITACORA_AUTONOMA.md`, lotes 7 y 8. La bandeja operativa (PR #12) es
una pieza más grande, hecha por el dueño en paralelo a esta rutina, no por
la rutina misma — no tiene entrada en la bitácora porque no la ejecutó este
proceso.

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
| ~~V-1~~ | ~~Historial de conversación en el prompt~~ | M | **✅ HECHO (lote 7, commit `dd9e663`, PR [#10](https://github.com/ceduardodch/ecommerce/pull/10), mergeado a `main`).** `createWhatsAppAgentReply` recibe los últimos 10 turnos (`message_in`/`message_out`, ya guardados en el CRM) ordenados cronológicamente. Test del CA cubierto: el cliente responde "4" a "¿para cuántas personas?" y el historial se lo pasa al prompt antes del mensaje actual. |
| ~~V-2~~ | ~~Contexto del cliente~~ | M | **✅ HECHO (lote 8, commit `65c3f74`, PR [#11](https://github.com/ceduardodch/ecommerce/pull/11), mergeado a `main`).** El prompt incluye compras previas, etapa (`journeyStage`) y próximo seguimiento del perfil CRM. Test del CA cubierto: un cliente que ya compró una olla no la recibe en el catálogo relevante (filtrado en código, no solo instrucción al modelo). De paso se corrigió un bug de NPS (`followup_reason` vs `followupReason`) que llevaba roto desde siempre. |
| V-3 | Herramientas reales | L | El agente puede llamar `quote` y `create_order` vía tool-calling. Ningún cobro sin confirmación explícita del cliente en el chat. **Pausado**: hay una decisión de diseño sin resolver (ver nota abajo) — no re-arrancar sin que el dueño la cierre. |
| V-4 | Notas de voz | M | `type === "audio"` se transcribe y entra al mismo flujo. Hoy se descartan en silencio, y en Ecuador son una fracción enorme del tráfico. |
| V-5 | Comprobantes por foto | M | `type === "image"` registra evento `payment_proof_received` con la imagen y escala a humano. Hoy la foto del comprobante de transferencia/deuna! se pierde. |

**Nota sobre V-3 (2026-09-01, lote 9)**: antes de codear se encontró una
decisión de arquitectura real que ningún doc resuelve. Hoy existe
`whatsapp-sales-flow.ts` (`advanceWhatsappSale`), una máquina de estados
determinista (regex, sin IA) que ya cotiza, pide confirmación explícita y
manda el link de carrito — con 5 tests en verde protegiendo exactamente el
comportamiento que V-3 pide ("ningún cobro sin confirmación"). Ese flujo
intercepta casi todos los mensajes una vez que hay una venta en curso, así
que la IA de `createWhatsAppAgentReply` solo tiene turno en conversación
libre, antes de que exista un `CommerceState`. Dar tool-calling a la IA
implica elegir entre: (a) darle tools solo para su carril actual —
cotizar/proponer durante charla libre, sin tocar `advanceWhatsappSale` — o
(b) que la IA tome el control de confirmar y crear el carrito/orden,
reemplazando o compitiendo con la máquina de estados ya probada. También hay
una colisión de nombres: `create_order` en un doc viejo de MCP (`OpenClaw`,
`docs/VICKY_BOT.md`) apunta a `service.createOrder` (crea una orden Medusa
`pending_payment` sin link de pago), que es distinto del
`createWhatsappCart` que sí usa hoy `advanceWhatsappSale` (crea el link que
el cliente paga en DataFast). Sin resolver cuál de los dos es el
"create_order" real de V-3, no tiene sentido escribir el tool-calling.

**Actualización (PR #12, mergeado el mismo día)**: la bandeja operativa de
WhatsApp agrega un tercer eje a esta decisión — cada conversación ahora
tiene un modo `human`/`ai` explícito ("Tomar caso" saca a Vicky de la
conversación por completo, "Liberar a Vicky" la reactiva). Cualquier
tool-calling que se agregue a `createWhatsAppAgentReply` tiene que respetar
ese modo (no debería ni siquiera invocarse si la conversación está en modo
`human`) además de no pisar `advanceWhatsappSale`. Revisar
`docs/CRM_WHATSAPP_INBOX.md` y el diff de `whatsapp-webhook.ts` en `f89ac2c`
antes de retomar V-3.

**Recomendación de la rutina**: opción (a), con cualquier tool que comprometa
algo (crear carrito/orden) protegido en código por el mismo `isConfirmation()`
que ya usa `advanceWhatsappSale` sobre el mensaje real del cliente — nunca
confiar en que el modelo "declare" que hubo confirmación. Pendiente de que
el dueño confirme el enfoque antes de retomar V-3.

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
6. ~~V-1~~ · ~~Historial de Vicky~~ (🔴) — ✅ hecho, lote 7, PR #10 mergeado
7. ~~V-2~~ · ~~Contexto del cliente~~ (🔴) — ✅ hecho, lote 8, PR #11 mergeado
8. V-3 · Herramientas reales (🔴, esfuerzo L) — ⏸️ pausado, lote 9: decisión
   de diseño sin resolver (ver nota en la tabla de EPIC V arriba)

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
