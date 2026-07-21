# Pendientes para una herramienta total funcional (go-live)

> Junio 2026. Consolida lo que falta de CRM_BACKLOG, WHATSAPP_CLOUD_PLAN,
> PAGOS_DATAFAST_PLAN, DOMAIN_PLAN y WEB_REDESIGN_PLAN + gaps de código.
> Leyenda: 🔴 acción del dueño (trámites/credenciales/decisión) · 🟢 desarrollo
> (lo puede hacer un agente) · 🟡 mixto.

## A. PAGOS CON TARJETA (Datafast) — para cobrar de verdad
Estado: código construido y verificado en dry-run + venta enlazada al CRM.
**Go-live inmediato definido:** producción en `eter-niu.com` con Datafast en
`DATAFAST_ENV=test` y `DATAFAST_DRY_RUN=false` para revisión/certificación. El
cobro real por tarjeta se activa después con credenciales productivas.
**Jul/2026: código alineado a la guía v3.2.2 para certificación** — endpoints
`eu-test`/`eu-prod` (los viejos sin `eu-` están desactivados), bloque completo
`customParameters[SHOPPER_*]` (VAL_BASE0/VAL_BASEIMP/VAL_IVA, MID/TID,
ECI=0103910, PSERV=17913101, VERSIONDF=2), `risk.parameters[USER_DATA2]`,
`customer.merchantCustomerId`, cédula 10 dígitos con relleno de ceros, precio
unitario por ítem, `dfAdditionalValidations1.js`, validación de cardholder y
sello "verified" de Datafast en live. Form completo ACEPTADO por el gateway
eu-test real (`000.200.100`, prueba ejecutada 18/jul/2026).

### A-bis. Certificación Datafast — pendientes del DUEÑO
- ✅ **Cloudflare Minimum TLS Version 1.2**: TLS 1.0/1.1 rechazados y TLS 1.2
  aceptado en `eter-niu.com` (verificado 20/jul/2026).
- ✅ Credenciales y tarjeta de **pruebas** cargadas en Coolify; `/healthz`
  reporta `datafastMode=test` y `datafastConfigured=true`. Las credenciales
  productivas siguen pendientes de la aprobación de Datafast.
- 🟡 En fase 2 las transacciones de prueba deben ser **< $50**.
- 🟡 Preguntar a Datafast si los 4 dominios (cocina/bienestar ×
  eter-niu/b2b) en la misma IP cumplen su requisito "IP única que no aloje
  otros dominios" (Anexo H.6) — es el mismo comercio, pero que quede por
  escrito.
- 🟢 Escaneo DigiCert (digicert.com → SSL Installation Diagnostics) tras el
  cambio de TLS en Cloudflare, antes de pedir el escaneo oficial.
- ✅ En Coolify: `DATAFAST_*` de pruebas, `DATAFAST_ENV=test` y
  `DATAFAST_DRY_RUN=false` configurados.
- Paso a producción (Anexo I): `DATAFAST_ENV=live` ya elimina `testMode`,
  cambia host a eu-prod y muestra el sello; solo faltará cargar credenciales
  productivas (entityId/token/MID/TID reales).

### A-ter. Runbook del TestScript (jul/2026 — 12 casos, todo implementado)
Con credenciales de fase 2 cargadas (`DATAFAST_DRY_RUN=false`), MID del
TestScript = **1000000505**, TID = PD100406:
- **Crédito corriente ×2**: flujo normal del carrito; en el widget dejar
  "Sin diferido" + "Corriente". El caso base 0 ($10, IVA $0):
  `/checkout/pago?base0=1`.
- **Diferido con interés ×2**: widget → 9 meses + "Diferido con intereses"
  (SHOPPER_TIPOCREDITO=02).
- **Diferido sin interés ×2**: widget → 3 meses + "Diferido sin intereses" (03).
- **Diferido corriente especial ×2**: widget → "Diferido corriente" (01).
- **Anulaciones ×4**: con el campo `id` del JSON de cada compra aprobada:
  `curl -X POST $TOOLS/tools/datafast/void -H "authorization: Bearer $TOKEN"
  -H "content-type: application/json"
  -d '{"paymentId":"<id>","amount":<monto>}'`
- Hoja CAMPOS: cardholder vacío se bloquea en el widget; cada reintento genera
  `merchantTransactionId` nuevo; trx rechazada = pagar con CVV errado.
- ⚠️ El ejemplo de IVA del TestScript está al 12% (plantilla vieja); nosotros
  calculamos al 15% (`ECOMMERCE_TAX_RATE`). Confirmar tarifa con Datafast en
  la videoconferencia.
- 🟡 Hardening pendiente (antes del go-live real, no bloquea certificación):
  el checkout confía en `unitPrice` enviado por el cliente — validar contra
  el catálogo server-side para impedir manipulación de precios.
1. 🟡 Credenciales de pruebas configuradas; conseguir de Datafast las **7
   credenciales productivas** (Entity ID, Access token, MID, TID, E-Commerce
   ID, Service Provider ID y Customer name) después de aprobar certificación.
2. 🔴 Corregir el formulario Datafast: **campo 12 (URL pública)** y **campo 28
   (stack = Node/TS, no Python)**.
3. ✅ Credenciales test cargadas en envs, `DATAFAST_DRY_RUN=false` y widget real
   de `eu-test.oppwa.com` activo.
4. ✅ Widget real probado el 21/jul/2026: corriente y tres modalidades de
   diferido con aprobaciones/rechazos; anulaciones `RF` aprobadas para las
   cuatro modalidades y doble reverso rechazado con `700.400.200`. Quedan 3DS
   y límite diario únicamente si Datafast los exige en la revisión.
5. 🟢 Confirmar **modelo de IVA** (hoy se asume precio IVA-incluido, todo al 15%);
   ajustar si hay productos con tarifa 0%.
6. ✅ Botón **"Pagar con tarjeta" también en el cajón y el modal** del carrito.

## B. WHATSAPP CLOUD API — iniciar conversaciones sin riesgo de ban
Estado: dispatcher modo `meta` + webhook + reply construidos (W1–W4).
7. 🔴 **W0 trámites Meta**: crear WABA, conseguir número nuevo, registrar en Cloud
   API, generar `WHATSAPP_PHONE_NUMBER_ID/WABA_ID/ACCESS_TOKEN`.
8. 🔴 **Someter plantillas** a aprobación de Meta (recompra, complemento, cuidado,
   estacional, cross-sell) — aprobar textos antes.
9. 🔴 Registrar la **URL del webhook** (ecommerce-tools público) en la app de Meta.
10. 🟡 **W5 corte**: con número de prueba, ciclo completo template→respuesta→Vicky;
    luego `CRM_FOLLOWUP_DISPATCH_MODE=meta` con `MAX_PER_RUN=5` la 1ª semana.

## C. CRM / RECOMPRA — operar con datos reales
Estado: importación, ficha, recompra, kanban, RFM, NPS, estacionales → hechos.
11. 🔴 Subir el **archivo de leads históricos** (OPS-1) por el wizard de importación.
12. 🔴 Configurar **token/URL del hook OpenClaw** (OPS-3) para que Vicky envíe.
13. 🔴 **Aprobar textos** de plantillas, incluidas las de cross-sell (TPL-1, XS-2).
14. 🔴 Dar las **frecuencias reales de recompra** de bienestar (XS-4).
15. 🟡 **OPS-4**: línea base de métricas con datos reales (tras importar leads).

## D. DOMINIO eter-niu.com
Estado: plan D1–D5 definido; código de hosts/SEO listo.
16. 🔴 **DNS** de eter-niu.com (D1) apuntando a Coolify.
17. 🟢 Flip de envs `*_PUBLIC_URL` / `NEXT_PUBLIC_*_URL` a los subdominios nuevos (D2).
18. 🔴 **D4 Meta/Instagram**: verificación de dominio + actualizar enlaces de bio/ads.
19. 🟡 Redirecciones 301 de los hosts viejos a los nuevos.

## E. WEB / MARCA — pulido premium
20. 🔴 Entregar el **SVG real del isotipo** (hoy hay un placeholder) → BRAND-1.
21. 🟢 **Foto dedicada de bienestar** estilo "producto en el páramo" (BRAND-5).
22. 🟢 **QA visual** 390/768/1280 + contraste AA + Lighthouse en producción.
23. ✅ Newsletter **captura el email** como Lead en el pipeline CRM/eventos (ya no
    se descarta). Pendiente 🔴: conectar un proveedor de email marketing dedicado.

## F. INFRA / DESPLIEGUE
24. ✅ **Auto-deploy** de Coolify desde `main` confirmado.
25. ✅ **Volumen persistente** para `TOOLS_DATA_DIR=/data` (`tools-data`).
26. 🔴 Revisar **variables de entorno** de producción (tokens Meta, payphone,
    datafast, openclaw) en Coolify.
27. ✅ Healthchecks de storefront, Medusa y ecommerce-tools activos en Coolify.

## G. LEGAL / CONFIANZA
Estado: política de privacidad LOPDP + banner publicados.
28. 🔴 **Revisión legal** de la política (abogado) y, si aplica, registro de
    delegado ante la Superintendencia de Protección de Datos.
29. ✅ Páginas **/terminos** y **/envios-devoluciones** creadas y enlazadas (footer
    + checkout). Pendiente 🔴: revisión legal y confirmar plazos/condiciones.

## Orden sugerido para "vender de verdad" cuanto antes
1. Desplegar lo ya hecho (F-24) y verificar rutas en prod.
2. Datafast go-live: A-1..A-4 (credenciales → cobro real con tarjeta).
3. Términos/envíos/devoluciones (G-29) — requisito típico de la pasarela.
4. Leads + OpenClaw + plantillas (C-11..C-13) → recompra real por WhatsApp.
5. WhatsApp Cloud API (B) para escalar sin riesgo de ban.
6. Dominio eter-niu.com (D) y pulido de marca (E).

## H. Reseñas (jul 2026 — flujo reparado, requiere envs)

- [ ] 🔴 DUEÑO: definir `REVIEWS_API_TOKEN` (mismo valor en backend Medusa y
  storefront, Coolify) — sin él, publicar reseñas queda deshabilitado
  (fail-closed; leer reseñas sí funciona).
- [ ] 🔴 DUEÑO: definir `MEDUSA_INTERNAL_URL` en el storefront (URL interna del
  backend Medusa en Coolify, ej. http://medusa-api:9000).
- [x] 🟢 Flujo reparado: proxy `/api/reviews` (rate limit + honeypot), backend
  con validación zod + verificación de compra por teléfono normalizado,
  UI con campos reales de nombre/celular.
