# Plan WhatsApp Cloud API: iniciar conversaciones sin riesgo de bloqueo

> Junio 2026. Documento autosuficiente (ejecutable por cualquier agente).
> Decisión del dueño: las conversaciones INICIADAS por el negocio (recompra,
> broadcasts) deben salir por la **WhatsApp Business Platform oficial de Meta**
> para eliminar el riesgo de bloqueo del número; la IA (Vicky) sigue siendo el
> cerebro de la conversación.

## 1. Hechos verificados de la plataforma (jun 2026, docs de Meta)

- **Pricing por mensaje** (desde jul-2025): se cobra por plantilla ENTREGADA,
  según categoría (marketing / utility / authentication) y país del
  destinatario. Tarifa exacta de Ecuador: ver rate card oficial en
  developers.facebook.com (no asumir un número).
- **Ventana de servicio de 24h**: cuando el cliente escribe, se abre una ventana
  de 24h (se reinicia con cada mensaje suyo) en la que el negocio puede enviar
  mensajes **libres y GRATIS** (los service messages son gratis e ilimitados
  desde nov-2024). Fuera de la ventana: SOLO plantillas aprobadas (pagadas).
- **Utility dentro de ventana = gratis**; marketing se cobra siempre.
- **Cap de frecuencia de Meta**: ~2 plantillas de marketing por usuario/día
  entre TODOS los negocios; la API devuelve error `131049` si se excede.
  Nuestros guardrails (cooldown 7d, tope por corrida, ventana horaria) son más
  estrictos — mantenerlos.
- **Restricción de número**: un número registrado en Cloud API NO puede usarse
  a la vez en la app/sesión normal de WhatsApp (la sesión OpenClaw de Vicky).

## 2. Arquitectura decidida (híbrida: API = canal, Vicky = cerebro)

```
INICIAR (fuera de ventana — recompra, broadcasts)
  dispatcher (modo "meta") ──plantilla aprobada──► Cloud API ──► cliente
                                                                    │ responde
VENTANA 24h ABIERTA                                                 ▼
  Meta webhook ──► ecommerce-tools /webhooks/whatsapp ──► registra message_in
        │                                                + actualiza last_inbound_at
        └──► forward al hook de Vicky (OpenClaw) ──► Vicky razona
                  Vicky responde ──► ecommerce-tools ──► Cloud API free-form (GRATIS)
                                                       + registra message_out

ENTRANTE ACTUAL (campañas wa.me) — SIN CAMBIOS
  cliente inicia en el número actual ──► sesión OpenClaw de Vicky (como hoy)
```

**Decisión de números (fase 1)**: número NUEVO dedicado a Cloud API para todo
lo iniciado por el negocio. El número actual (0979854915) se queda con Vicky
por sesión para el tráfico entrante de campañas (el cliente inicia → sin riesgo
de ban). Consolidar a un solo número se decide DESPUÉS, con datos de respuesta.

**Qué se reutiliza (todo)**: el dispatcher con modos (`draft|openclaw` → se suma
`meta`), las plantillas TPL (se registran en Meta), los guardrails
(consentimiento/opt-out/cooldown/tope/ventana horaria), los eventos CONV
(`message_in/out`), el timeline de la ficha, los broadcasts y la atribución RPT.

## 3. Fases

### W0 — Trámites Meta (DUEÑO; ~1-3 días de revisión de Meta)
1. En Meta Business Suite: crear **WhatsApp Business Account (WABA)** sobre el
   Business Manager ya existente (sinergia con la verificación de dominio D4).
2. Conseguir un número nuevo (chip/línea adicional) y registrarlo en Cloud API.
   NO usar el 0979854915 (perdería la sesión de Vicky).
3. Generar credenciales: `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_WABA_ID`,
   token permanente de sistema (`WHATSAPP_ACCESS_TOKEN`).
4. Someter a aprobación las plantillas (sección 4). Meta tarda minutos-horas.
5. Mientras tanto, desarrollo usa el **número de prueba gratis** que Cloud API
   da a cada app (permite hasta 5 destinatarios de test).

### W1 — Modo `meta` en el dispatcher (S/M)
- `followup-dispatch.ts`: `DispatchMode = "draft" | "openclaw" | "meta"`.
- `dispatchFollowup` modo meta: `POST https://graph.facebook.com/v23.0/
  {WHATSAPP_PHONE_NUMBER_ID}/messages` con `type: "template"`, `template.name`
  = mapeo de nuestro templateKey (sección 4), `language: { code: "es" }`,
  `components` con las variables {nombre}/{producto}/{dias} en orden {{1..3}}.
- Manejo de `131049` (frequency cap) y errores → degradar a `queued` (mismo
  patrón actual). Envs en docker-compose: `WHATSAPP_PHONE_NUMBER_ID`,
  `WHATSAPP_ACCESS_TOKEN`, `META_API_VERSION` (reusar la existente).
- Tests unit del builder de payload (lógica pura, sin red).

### W2 — Webhook entrante (M)
- `services/ecommerce-tools`: `GET /webhooks/whatsapp` (verify token de Meta) y
  `POST /webhooks/whatsapp` (mensajes): valida firma `X-Hub-Signature-256`,
  extrae wa_id/texto, registra `message_in` (evento CONV existente) y guarda
  `metadata.lastInboundAt` en el perfil (para calcular la ventana).
- Forward del texto al hook de Vicky (`OPENCLAW_GATEWAY_URL` + token, contrato
  ya documentado en VICKY_BOT.md) con flag `replyVia: "cloud_api"`.
- Registrar el webhook en la app de Meta (URL pública del ecommerce-tools).

### W3 — Respuesta de Vicky por API (S/M)
- Endpoint en ecommerce-tools `POST /tools/whatsapp/reply` (token interno):
  `{ phone, text }` → si `now - lastInboundAt < 24h` → free-form vía Cloud API
  (gratis) + `message_out`; si la ventana está cerrada → responde 409 con
  `window_closed` (Vicky/coordinador decide si va plantilla).
- Documentar en VICKY_BOT.md cómo OpenClaw responde por este endpoint cuando
  el mensaje llegó con `replyVia: "cloud_api"`.

### W4 — Selector inteligente de canal (S)
- En el dispatcher: si el cliente tiene ventana abierta (lastInboundAt < 24h) →
  enviar free-form (gratis); si no → plantilla. Broadcasts: siempre plantilla.
- Dashboard: mostrar canal usado en la cola de envío (`mode: meta_template |
  meta_freeform | openclaw | draft`).

### W5 — Pruebas y corte (S + dueño)
1. Con número de prueba: template → responder → ver message_in en timeline →
   Vicky responde free-form → message_out. Ciclo completo verificado.
2. Activar `CRM_FOLLOWUP_DISPATCH_MODE=meta` con `MAX_PER_RUN=5` la primera
   semana. Medir tasa de respuesta y costo real por mensaje.
3. El modo `openclaw` queda como fallback configurando env (no se borra).

## 4. Plantillas a someter a Meta (desde nuestras TPL)

| TPL key | Nombre en Meta | Categoría | Cuerpo (variables → {{n}}) |
|---|---|---|---|
| recompra | `eterniu_recompra` | Marketing | Hola {{1}}, hace {{3}} días llevaste {{2}}… ¿te preparo la reposición? |
| complemento | `eterniu_complemento` | Marketing | Hola {{1}}, vi que tienes {{2}}… te muestro el complemento ideal |
| cuidado | `eterniu_cuidado` | **Utility** (post-compra → gratis en ventana) | Hola {{1}}, tips de cuidado para tu {{2}} |
| estacional | `eterniu_estacional` | Marketing | (texto estacional con {{1}}) |
| cross_sell_* | `eterniu_xsell_cocina/bienestar` | Marketing | (los seeds de XS-2) |

Los textos finales los aprueba el dueño ANTES de someterlos (los actuales de la
tabla `crm_message_template` son la base). Regla: tono de la bio de IG
("consciente, cálido"), siempre con salida fácil ("si prefieres no recibir
esto, dime BAJA" → alimenta opt_out).

## 5. Guardrails (sin excepciones)

Consentimiento + opt-out + cooldown 7d + tope por corrida + ventana horaria
Guayaquil + cap de Meta (manejar 131049) + el opt-out por palabra clave "BAJA"
en el webhook entrante (registra `opt_out` automáticamente). El KPI guardián
sigue siendo opt-out ≤ 2%.

## 6. Costos esperados

- Iniciar (marketing template): tarifa Ecuador del rate card de Meta por
  mensaje ENTREGADO. Con tope de 20/día ≈ volumen mensual bajo; medir en W5.
- Toda la conversación posterior con Vicky dentro de ventana: **$0**.
- Número nuevo: costo del chip/línea local.

## 7. Inputs del dueño

- [ ] WABA creada y número nuevo registrado (W0.1–W0.3).
- [ ] Aprobación de los textos de plantillas (sección 4).
- [ ] URL pública de ecommerce-tools para el webhook (ya existe en Coolify).
- [ ] Decidir después de W5: ¿consolidar todo a un solo número API?
