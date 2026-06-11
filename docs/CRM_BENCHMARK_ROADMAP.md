# Plan CRM: benchmark vs Kommo y roadmap de recompra/LTV

> Actualizado: junio 2026. Objetivo de negocio: **maximizar recompra y LTV** de la
> base de clientes en las dos líneas: **cocina y bienestar**.

## 1. Objetivo

El CRM no compite por features: compite por **dólares de recompra por cliente**.
Cada fase de este plan se justifica solo si mueve uno de estos números:

| KPI | Definición | Meta sugerida (12 meses) |
|---|---|---|
| Tasa de recompra 90d | % de clientes pagados que vuelven a comprar en 90 días | ≥ 20% |
| LTV por cliente | Ingreso acumulado promedio por cliente pagado | 2× ticket inicial |
| Respuesta a followups | % de followups enviados que reciben respuesta | ≥ 15% |
| Opt-out rate | % de clientes que piden no recibir mensajes | ≤ 2% |
| Tiempo lead → primera respuesta | Desde lead_created hasta primer mensaje | < 5 min (Vicky) |

## 2. Dónde estamos hoy (junio 2026)

Ya construido y en `release`:

- Perfiles de cliente por teléfono, eventos, órdenes conversacionales (módulo `b2b-crm`).
- Importación de leads CSV/Excel con mapeo de columnas desde el admin.
- Gestión de leads: lista con filtros, ficha con historial, notas, compra manual, snooze, opt-out.
- Recompra automática: job diario que despacha followups vencidos (modo `draft` o `openclaw` vía Vicky), con guardrails (consentimiento, opt-out, cooldown, tope, ventana horaria).
- Vicky (OpenClaw) como vendedor conversacional con catálogo, cotizaciones y PayPhone.
- Dashboard con colas (leads calientes, followups, órdenes pendientes, cola de envío).

## 3. Benchmark: Kommo (WhatsApp-first CRM)

Kommo cuesta $15–45/usuario/mes (mínimo 6 meses, leads limitados por plan:
2.500–10.000 por usuario; bots y broadcasts desde el plan Advanced $25). Capacidades
clave y nuestro estado:

| Capacidad Kommo | ¿La tenemos? | ¿Importa para recompra/LTV? |
|---|---|---|
| Bandeja unificada WhatsApp/IG con historial de conversación por cliente | ❌ Parcial (eventos sí, mensajes no) | **Alta** — sin ver la conversación no se personaliza la recompra |
| Pipeline kanban por etapas con automatización por etapa | ❌ (tenemos journeyStage como texto) | Media — útil para visibilidad, no mueve recompra directo |
| Broadcasts segmentados (por tag/etapa) con plantillas | ❌ (followups 1-a-1 sí; masivos no) | **Alta** — campañas estacionales (Navidad, Día de la Madre) |
| Salesbot no-code (reglas) | ✅ Superior — Vicky es un agente LLM, no un árbol de reglas | — |
| Plantillas de mensaje reutilizables | ❌ (mensaje sugerido hardcodeado) | **Alta** — un solo mensaje de recompra para todo es nuestro techo actual |
| Tareas y recordatorios por lead | ❌ Parcial (snooze + colas) | Media |
| Reportes de ventas y embudo | ❌ Parcial (conteos en dashboard) | **Alta** — sin LTV/cohortes no sabemos si la recompra funciona |
| Scoring / lead caps | ❌ | Baja por ahora |
| Multi-número WhatsApp / multi-equipo | ❌ | Baja (equipo de 1) |
| App móvil | ❌ (admin web responsive) | Media |

**Nuestras ventajas estructurales sobre Kommo** (no las regalemos):

1. **Integración nativa** catálogo → cotización → pago → recompra (Kommo no sabe qué producto compró el cliente ni su `reorderAfterDays`).
2. **Vicky es IA real**: el "salesbot" de Kommo es un constructor de reglas; los créditos de IA de Kommo se pagan aparte.
3. **Costo marginal cero** por usuario/lead; Kommo nos costaría ≥ $150/año con tope de leads.
4. **Datos propios** en nuestro Postgres: cohortes, LTV y segmentación sin exportar nada.

**Dónde Kommo nos gana hoy**: ver la conversación completa junto al perfil,
plantillas, broadcasts segmentados y reportes. Ese es el gap a cerrar.

## 4. Roadmap

### Fase 1 — Operar lo construido (semanas 1–2)
*Sin código nuevo. Validar que la máquina de recompra gira.*

1. Importar todos los leads históricos (CSV) con etapa y fecha de seguimiento.
2. Correr 2 semanas en modo `draft`: revisar la cola diaria y enviar manual con wa.me.
3. Configurar el hook en OpenClaw y activar `CRM_FOLLOWUP_DISPATCH_MODE=openclaw` con `CRM_FOLLOWUP_MAX_PER_RUN=10`.
4. Medir línea base: tasa de respuesta, opt-outs, ventas atribuidas a followups.

### Fase 2 — Cerrar el gap de mensajería (mes 1–2)
*Lo que Kommo tiene y nos falta, versión mínima.*

1. **Plantillas de mensaje por motivo**: tabla/JSON de plantillas (`recompra`, `complemento`, `cuidado`, `estacional`) con variables `{nombre}`, `{producto}`, `{dias}`. El dispatcher elige plantilla según `followup_reason` en vez del mensaje hardcodeado.
2. **Timeline de conversación**: Vicky ya registra eventos; agregar evento `message_in` / `message_out` con el texto, y mostrarlos en la ficha del cliente. Con esto la ficha equivale al lead card de Kommo.
3. **Broadcast segmentado mínimo**: en la lista de leads, "enviar campaña a esta selección/filtro" → encola con los mismos guardrails del job (consentimiento, cooldown, tope diario). Primero en modo draft.

### Fase 3 — Reportes de LTV (mes 2–3)
*Saber si funciona. Kommo cobra esto en el plan de $45.*

1. Página "Recompra" en el admin: tasa de recompra 30/60/90d, LTV promedio, ingresos por followups (eventos `paid` con `source` posterior a `followup_sent`), cohortes por mes de primera compra.
2. Atribución simple: si un cliente paga dentro de 7 días de un `followup_sent`, la venta se atribuye a recompra.
3. Export CSV de cualquier segmento (lo inverso del import — ya tenemos la mitad).

### Fase 4 — Cross-sell cocina ↔ bienestar y campañas estacionales (mes 2–4, en paralelo)
*Las dos líneas se alimentan mutuamente: quien cocina saludable es lead de bienestar y viceversa.*

1. **Segmentación por vertical**: filtro por línea (`metadata.vertical` de los productos comprados) en la lista de leads; todo cliente de una línea sin compras en la otra es un segmento de cross-sell listo.
2. **Plantillas de cross-sell**: `cross_sell_bienestar` (compró cocina) y `cross_sell_cocina` (compró bienestar), conectadas al broadcast de Fase 2.
3. **Followups estacionales por calendario**: job que agenda `followup_reason` estacional (Navidad → 15-nov, Día de la Madre EC → fin de abril, Black Friday) sobre segmentos con consentimiento. Reutiliza el pipeline de dispatch existente.
4. **Ciclos de recompra de bienestar**: revisar `reorderAfterDays` de los productos de bienestar (los consumibles tienen ciclos más cortos que las ollas) para que el motor de recompra trabaje con frecuencias reales por línea.

### Fase 5 — Pulido benchmark (mes 4+, según resultados)

- Vista kanban por etapa (drag & drop sobre `journeyStage`).
- Scoring simple (frecuencia + recencia + monto = segmentos RFM).
- NPS post-entrega vía Vicky y pedido de referidos a promotores.
- Multi-usuario con roles si entra equipo de ventas.

## 5. Build vs buy: cuándo reconsiderar Kommo

Seguir con CRM propio mientras: (a) el equipo sea ≤ 3 personas, (b) Vicky maneje
la mayoría de conversaciones, (c) el costo de construir Fase 2–3 sea < 2 semanas
de trabajo. Reconsiderar comprar si necesitamos urgente: bandeja multi-agente en
vivo, app móvil del equipo, o cumplimiento de plantillas de WhatsApp Cloud API a
escala (>1.000 mensajes salientes/día).

## 6. Regla de oro de recompra

Cada mensaje saliente debe pasar 3 filtros: **consentimiento** (whatsapp_consent),
**relevancia** (plantilla según lo que compró y su línea), **frecuencia**
(cooldown ≥ 7 días, ≤ 2 intentos sin respuesta → pausar 60 días). El opt-out rate
es el KPI guardián: si supera 2%, bajar volumen antes que subirlo.
