# Plan Botón de Pagos Datafast — pago con tarjeta en la web

> Junio 2026. Documento autosuficiente (ejecutable por cualquier agente).
> Estado del trámite: **formulario enviado a Datafast, esperando aprobación**
> (sin credenciales aún). Por eso este plan se construye y prueba primero contra
> el **ambiente de PRUEBAS** de Datafast, para llegar listos al "go-live".
>
> Decisión del dueño: además del cierre por WhatsApp con Vicky, el cliente debe
> poder **pagar con tarjeta directo en la web** (sobre el carrito ya cableado en
> el Sprint INTEG). Datafast/DataWeb es la pasarela contratada.

## REGLA #1 aplicada — qué está verificado y qué NO

**Verificado** (de los documentos que entregó el dueño, sep-2025):
- Pasarela = **DATAFAST S.A.** (tarifario v3.8, aprobado 20-may-2025).
- Comercio = **INFINITY IMPORTS** / Viky Johanna Saavedra Puebla, RUC
  `1715523021001`. Actividad: productos del hogar + yoga (= cocina + bienestar).
- **Tasas por transacción** (costo del negocio):
  - Débito (Maestro/Electron — Guayaquil, Pacífico, Pichincha): **2.30%**
  - Crédito corriente (Visa, Mastercard, Amex, Diners, Discover): **4.62%**
  - Diferido con intereses (3–6 meses): **~5.75% – 6.06%**
- **Límites antifraude declarados** (los hace cumplir la pasarela):
  máx **$500/día** y **$1000/mes** por cliente; **5 tx/día**, **20 tx/mes**;
  **1 tarjeta** registrada por usuario.
- Entrega: 48h por **Servientrega**; se pide **cédula** para entregar.

**VERIFICADO contra el módulo Odoo `payment_payon` ("Payon DataFast Ecuador",
FractalSoft/Infinit-Plus)** que el dueño ya tenía funcionando — es integración
real, no patrón genérico:
- **Hosts** (Datafast = ACI/oppwa directo):
  - Pruebas: `https://test.oppwa.com` · Producción: `https://oppwa.com`
- **Crear checkout**: `POST {host}/v1/checkouts`, `Authorization: Bearer {accessToken}`,
  `Content-Type: x-www-form-urlencoded`. Params clave: `entityId`, `amount` (2 dec),
  `currency: USD`, `paymentType: DB`, `merchantTransactionId`, datos `customer.*`
  (givenName/middleName/surname/email/ip, `identificationDocType: IDCARD`,
  `identificationDocId` = cédula[:10], `phone`), `shipping/billing.street1/country`,
  `cart.items[i].*`. Respuesta → `id` = **checkoutId**. En test se añade
  `testMode: EXTERNAL`.
- **Widget**: `{host}/v1/paymentWidgets.js?checkoutId={id}` (Copy&Pay) →
  `shopperResultUrl` de retorno.
- **Consultar resultado**: `GET {host}/v1/checkouts/{id}/payment?entityId={entityId}`
  con Bearer → `result.code` + `result.description`.
- **Códigos de ÉXITO** (confirmados en el módulo):
  - Producción: `000.000.000`
  - Pruebas: `000.100.112` o `000.100.110`
  - (cualquier otro → declinado / error)
- **CRÍTICO — desglose de IVA para el SRI (Ecuador)**: Datafast exige un
  `customParameters[{MID}_{TID}]` con un TLV que codifica `tax` (IVA), `base_no_tax`
  (base 0%), `base_tax` (base gravada), `e_commerce_id` y `service_provider_id`
  (códigos TLV `004/052/003/051/053`). Esto **no está en la doc genérica de ACI**
  y es obligatorio en Ecuador. Se porta tal cual del módulo Odoo.
- **Diferido**: el widget soporta corriente vs diferido (con `deferred_type` =
  meses) → mapea a las tasas de diferido del tarifario.
- **Tokenización (opcional)**: `registrations[i].id` para "OneClick" (guardar
  tarjeta). Fase posterior, no MVP.

> Aún falta probar contra el ambiente de test **con nuestras credenciales** y
> confirmar que Datafast no cambió hosts/códigos desde la versión del módulo
> (Odoo v13/14, ~2021). El flujo y el TLV de IVA se dan por válidos por ser
> código en producción del propio dueño.

## DATOS QUE FALTAN (los entrega Datafast al aprobar — el formulario NO los pide)

El módulo Odoo confirma que la integración necesita **7 credenciales/IDs** que NO
están en el formulario de contrato (Doc 3/4). Hay que pedírselos a Datafast:

| Campo (en el código Odoo) | Qué es | ¿Lo tenemos? |
|---|---|---|
| `payon_login` | **Entity ID** | ❌ falta |
| `payon_secretKey` | **Access token** (Bearer) | ❌ falta |
| `payon_mid` | **MID** (merchant id) | ❌ falta |
| `payon_tid` | **TID** (terminal id) | ❌ falta |
| `payon_e_commerce_id` | **E-Commerce ID** (TLV 003) | ❌ falta |
| `payon_service_provider_id` | **Service Provider ID** (TLV 051) | ❌ falta |
| `payon_customer_name` | Nombre de comercio (risk USER_DATA2) | ⚠️ = "INFINITY IMPORTS"? confirmar |

> MID, TID, E-Commerce ID y Service Provider ID son **específicos de Datafast/SRI**
> y van dentro del `customParameters` del IVA. Sin ellos el checkout se rechaza.
> **Acción dueño:** pedir estos 7 valores a Datafast (test y producción) junto con
> el manual. Probablemente vengan en el mismo correo de aprobación.

**Otros datos a confirmar del lado producto:**
- **IVA**: ¿los precios mostrados ya incluyen IVA o se suma al pagar? El TLV exige
  separar base gravada, base 0% e IVA. Hoy el carrito es client-side con un solo
  `price` sin desglose de impuesto → **falta definir el modelo de IVA**.
- **Cédula del cliente**: el checkout exige `identificationDocId` (cédula). El
  carrito actual no la pide → el form de pago debe capturarla (coincide con campo
  17 del contrato: se solicita cédula).

## Datos del comercio y CORRECCIONES antes de que aprueben

Del formulario lleno (Doc 3) — **dos cosas a corregir/confirmar con Datafast**:
1. **Campo 12 (URL de la web) estaba VACÍO.** Datafast exige URL pública en vivo.
   Cruza con `DOMAIN_PLAN.md` (migración a eter-niu.com). **Decisión pendiente
   del dueño**: ¿se declara `eter-niu.com`, o un host actual (`cocina.b2b.com.ec`
   / `shop.b2b.com.ec`)? La URL declarada debe ser la que renderiza el widget.
2. **Campo 28 (stack) decía "BACKEND-PYTHON".** El backend real es **Node/TS
   (Medusa)**, no Python. Valor correcto:
   `Front: Next.js (React) · Backend: Node/TypeScript (Medusa) · BD: PostgreSQL`.

## Arquitectura decidida (híbrida: tarjeta = nuevo carril, WhatsApp/Vicky intacto)

```
CARRITO (storefront, client-side) ─┬─► "Enviar por WhatsApp"  (SIN CAMBIOS, hoy)
                                   │
                                   └─► "Pagar con tarjeta"  (NUEVO)
                                          │
   1) POST /payments/datafast/checkout (backend)  ── crea checkout en Datafast
          backend (entityId+token, server-to-server) ──► devuelve checkoutId
   2) storefront renderiza el WIDGET Copy&Pay (JS de Datafast) con checkoutId
          el cliente ingresa la tarjeta EN EL WIDGET (no toca nuestros servers)
   3) Datafast procesa (incluye 3DS) ──► redirige a shopperResultUrl?id={checkoutId}
   4) GET /payments/datafast/result?id={checkoutId} (backend)
          backend → GET {host}/v1/checkouts/{checkoutId}/payment?entityId=...
          lee result.code (éxito: 000.000.000 prod / 000.100.11x test) ──► éxito/fallo
          éxito → registra compra en CRM (markPaid source="datafast") + orden
                → limpia carrito, muestra confirmación
          fallo → muestra error, NO registra venta
```

**Punto clave de seguridad (PCI):** con el widget **Copy&Pay alojado**, los datos
de la tarjeta (PAN) **nunca pasan por nuestro backend ni storefront** — los captura
el iframe/JS de Datafast. Esto mantiene el alcance PCI en el mínimo (SAQ A/A-EP).
**Nunca** guardamos número de tarjeta, CVV ni datos sensibles. (Coherente con la
regla del proyecto: el negocio no maneja credenciales financieras en claro.)

**Dónde vive el backend de pago:** `services/ecommerce-tools` (Fastify) — ya es la
fachada con auth por token y contratos zod; se le suman las rutas de pago y el
secreto `DATAFAST_ACCESS_TOKEN` (server-side, **nunca** expuesto al navegador).
La confirmación de éxito llama al CRM de Medusa (`markPaid`/`recordManualPurchase`,
ya existen) para que la venta entre al mismo timeline/recompra que el resto.

## Fases

### P0 — Trámites y credenciales (DUEÑO, bloquea P5)
1. Recibir de Datafast: **manual de integración**, `entityId`(s),
   `DATAFAST_ACCESS_TOKEN`, hosts de **test** y **producción**.
2. Corregir en el contrato: **URL (campo 12)** y **stack (campo 28)**.
3. Confirmar con Datafast: ¿widget Copy&Pay alojado? ¿hay webhook o solo consulta
   por `resourcePath`? ¿IP whitelisting? ¿exigen HTTPS público para el test?

### P1 — Backend: crear checkout (M) — `services/ecommerce-tools`
- `POST /payments/datafast/checkout` (auth interno): body `{ items, amount,
  customer? }`. Valida monto contra el carrito (recalcula del lado server por
  SKU/precio — **no confiar en el total del cliente**). Llama al API de Datafast
  para crear el checkout (`amount`, `currency: USD`, `paymentType: DB`, datos del
  comercio) con `DATAFAST_ACCESS_TOKEN` + `entityId`. Devuelve `{ checkoutId }`.
- Manejo de errores → respuesta clara, sin filtrar el token. Idempotencia por
  `orderRef` propio (uuid) para no duplicar checkouts.
- **Tests unit** del builder del payload (lógica pura, sin red) y de la
  re-validación de monto.
- Envs (server-side, nunca en el front): `DATAFAST_ENV=test|live`
  (`live`→`oppwa.com`, test→`test.oppwa.com`), `DATAFAST_ENTITY_ID`,
  `DATAFAST_ACCESS_TOKEN`, `DATAFAST_MID`, `DATAFAST_TID`, `DATAFAST_ECOMMERCE_ID`,
  `DATAFAST_SERVICE_PROVIDER_ID`, `DATAFAST_CUSTOMER_NAME`.
- **Referencia de implementación**: `payment_payon` (Odoo, Downloads/payon-main) —
  `models/payon_payment_acquirer.py` (builder del checkout + TLV de IVA) y
  `controllers/main.py` (consulta de resultado). Se porta esa lógica a Node/TS.

### P2 — Storefront: widget Copy&Pay (M) — `apps/storefront`
- Nuevo botón **"Pagar con tarjeta"** junto a "Enviar por WhatsApp" en
  `components/cart/checkout-button.tsx` (o un segundo componente hermano).
- Página/route `/checkout/pago`: pide `checkoutId` al backend (P1), inyecta el
  script del widget de Datafast y renderiza el formulario `paymentWidgets.js` con
  `data-brands` (VISA MASTER AMEX DINERS según lo que habilite Datafast).
- `shopperResultUrl` → `/checkout/resultado`.
- Trackear `InitiateCheckout` con `cta: "checkout_card"` (reusar `trackStorefrontEvent`,
  el mismo patrón del botón WhatsApp — **no tocar** `analytics.tsx`/MetaPixel).

### P3 — Confirmación + orden (M) — backend + storefront
- `GET /payments/datafast/result?id={checkoutId}` (backend): consulta el estado a
  `{host}/v1/checkouts/{checkoutId}/payment?entityId=...` (Bearer). Interpreta
  `result.code` con la lista de éxito verificada (`000.000.000` en prod;
  `000.100.112`/`000.100.110` en test). Éxito → `markPaid(phone?, { source:
  "datafast", externalOrderId, amount, products })` en el CRM + crea registro de
  orden; responde `{ status: "paid", orderRef }`. Fallo → `{ status: "failed",
  reason: result.description }`.
- Idempotencia: si el `checkoutId`/`orderRef` ya se confirmó, no duplicar la venta.
- **Portar el TLV de IVA**: replicar el builder del `customParameters[MID_TID]`
  del módulo Odoo (`payon_payment_acquirer.py`) — base gravada, base 0%, IVA,
  e_commerce_id, service_provider_id. Es lógica pura → test unit con vectores del
  módulo original.
- `/checkout/resultado` (storefront): lee el estado, muestra éxito (con resumen y
  "te contactamos para el envío") o error con opción de reintentar; limpia el
  carrito solo en éxito.

### P4 — 3DS, errores y conciliación (S/M)
- Asegurar flujo **3D Secure** (redirección del banco) — el widget lo maneja, pero
  validar el retorno y los estados "pendiente".
- Mapa de errores de Datafast → mensajes en español para el cliente.
- Reporte simple de conciliación: cruzar ventas `source: "datafast"` del CRM contra
  el panel de Datafast (montos, comisión esperada por tipo de tarjeta).

### P5 — Pruebas en ambiente de test + corte (S + dueño)
1. Con credenciales de **test** y tarjetas de prueba de Datafast: compra OK,
   compra rechazada, 3DS, monto que excede límite ($500/día) → ver que rebota.
2. Verificar que la venta OK aparece en el CRM con `source: "datafast"` y entra al
   timeline/recompra.
3. Cambiar `DATAFAST_ENV=live` con credenciales de producción; primera compra real
   de monto bajo como smoke test.

## Guardrails (sin excepciones)
- **Nunca** almacenar PAN/CVV ni loguear el `DATAFAST_ACCESS_TOKEN`.
- Monto **siempre recalculado en el backend** desde SKU/precio (no del cliente).
- Respetar límites antifraude declarados (los aplica Datafast; además mostrarlos
  al cliente si los excede, sin filtrar reglas internas).
- Idempotencia en checkout y en confirmación (no duplicar ventas).
- HTTPS obligatorio en la URL declarada; el secreto solo server-side.

## Costos esperados (del tarifario verificado)
- Débito **2.30%**, crédito corriente **4.62%**, diferido c/intereses **~5.75–6.06%**.
- Ejemplo: olla de $95 con crédito corriente → comisión **~$4.39**; con débito
  → **~$2.19**. Considerar al fijar precios/cupones y, si aplica, incentivar débito.

## Cómo encaja con lo existente
- **No reemplaza** el cierre por WhatsApp/Vicky — lo complementa. El carrito ofrece
  ambos caminos.
- Reutiliza el CRM (`markPaid`/timeline/recompra) para que la venta con tarjeta
  alimente la misma maquinaria de recompra que ya construimos.
- No toca tracking, hosts del middleware, feeds, ni `lib/whatsapp.ts`.

## Estado de implementación (jun 2026)

**CONSTRUIDO y VERIFICADO en dry-run (sin credenciales):**
- Backend `services/ecommerce-tools/src/datafast.ts`: `computeIva`,
  `buildIvaCustomParameter` (TLV SRI portado de Odoo), `buildCheckoutForm`,
  `isDatafastSuccess`, `createDatafastCheckout`, `getDatafastResult` (+ modo
  dry-run). Config + contrato zod + rutas `POST /tools/datafast/checkout` y
  `GET /tools/datafast/result`.
- Tests: `tests/datafast.test.ts` → **8/8 verde** (IVA 15%, TLV, códigos de
  éxito test/prod, payload, dry-run). Typecheck limpio.
- Storefront: proxies `app/api/checkout/datafast/{route,result}`; páginas
  `app/checkout/pago` (form + widget Copy&Pay + carril de simulación dry-run) y
  `app/checkout/resultado` (confirma, limpia carrito, dispara `Purchase`); botón
  "Pagar con tarjeta" en `app/cart/page.tsx`. **Build limpio.**
- Flujo probado por API contra el backend corriendo: crear (amount 155, env test,
  código `000.100.112`) → pagado → rechazo. ✅

**PENDIENTE (requiere acción del dueño / credenciales):**
- **7 credenciales Datafast** (entityId, accessToken, MID, TID, eCommerceId,
  serviceProviderId, customerName) → poner en envs y `DATAFAST_DRY_RUN=false`.
- **Prueba del widget real** con tarjetas de test de Datafast (no se puede sin
  credenciales) — solo está verificado el carril de simulación.
- **Registrar la venta en el CRM** (`markPaid` source `datafast`): hoy en éxito
  se dispara el evento `Purchase` (tracking/atribución) pero **aún NO se escribe
  la compra en el timeline de b2b-crm**. Falta cablear result→CRM con el teléfono
  capturado en el form de pago.
- **Modelo de IVA**: hoy se asume precio IVA-incluido y todo gravado al 15%
  (`ECOMMERCE_TAX_RATE`). Confirmar con productos 0% si los hubiera.
- **URL declarada** a Datafast (campo 12) + corrección stack (campo 28).

## Registro de decisiones de implementación
- Host/códigos/TLV: portados del módulo Odoo `payment_payon` (producción del
  dueño). Confirmar que Datafast no cambió hosts/códigos al recibir el manual.
- Backend del pago en `ecommerce-tools` (no en Medusa) por reusar auth/contratos
  y mantener el secreto fuera del front.
- Dry-run por defecto (`DATAFAST_DRY_RUN=true`) hasta credenciales — calca el
  patrón de `payphone.ts`.
