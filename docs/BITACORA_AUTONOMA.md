# Bitácora del sprint autónomo

> Un bloque por lote. Formato fijo para que el dueño lea de un vistazo qué pasó
> mientras no estaba. Plan: [SPRINT_AUTONOMO.md](./SPRINT_AUTONOMO.md).
>
> Cada entrada separa **Verificado** (con el output real) de
> **Pendiente/Asumido** (con qué falta), según la REGLA #1 de `CLAUDE.md`.

---

## 2026-08-31 · Lote 0 (sesión con el dueño)

**Ítems cerrados**: bloque 1 (SEO + tracking + número), CI, bloque 2 (cobros
huérfanos + caché), y el 500 de plantillas en producción.

**Commits en `main`**: `cb76f92` `3191f7e` `f0ffe93` `25719f4` `a6e8b62`
`885b26f` `33f4a4a` `a3b787a`

**Verificado**:
- `turbo typecheck` 3/3 · `turbo build` 3/3 · tools 88 tests · backend 85 tests
- CI en `main` verde, ya con los pasos `Typecheck` y `Test backend`
- Canónicas: `/products/…` ahora apunta a sí misma (antes, a la portada)
- `/api/events`: `Purchase` desde el navegador → 403; flood → 429
- Catálogo: 5 visitas a una ficha = 1 petición upstream (antes 10)
- `medusa db:migrate` sobre base vacía: exit 0, 21 + 49 productos sembrados
- La consulta de plantillas que daba 500 devuelve datos con
  `label`/`media_url`/`media_type`

**Pendiente**:
- Confirmar en producción que el 500 de `/admin/b2b/crm/templates` quedó
  resuelto tras el deploy (ver nota abajo).
- Tareas del dueño: EPIC O completo en el plan.

**Nota sobre el 500 de plantillas**: la causa raíz verificada es que la cadena
de migraciones se rompía en `Migration20260702000000` (`relation
"product_review" does not exist`), y como MikroORM las aplica en transacción,
`Migration20260724000000` —la que añade `label`, `media_url` y `media_type` a
`crm_message_template`— nunca llegaba a aplicarse. El `serialize()` del endpoint
lee esas columnas, de ahí el 500. Reproducido en Postgres 16 local y corregido.
**No verificado**: el estado exacto del esquema en producción. Si tras el deploy
el 500 persiste, correr:

```bash
psql "$DATABASE_URL" -c "\d crm_message_template"
```

Si faltan `label`, `media_url` o `media_type`, ejecutar `npx medusa db:migrate`
en el contenedor de Medusa: con los dos fixes de esta tanda la cadena ya
completa.

---

## 2026-09-01 · Lote 1 (rutina autónoma, sin el dueño)

**Ítem trabajado**: S-2 · `BreadcrumbList` en fichas (🟢, primer ítem no
terminado del orden de ejecución).

**Qué se hizo**: `apps/storefront/app/products/[slug]/page.tsx` ya tenía el
componente visual `Breadcrumbs` pero no declaraba el schema.org
correspondiente. Se agregó `buildBreadcrumbJsonLd`, que arma un
`BreadcrumbList` con `ListItem` por cada miga, reutilizando el mismo arreglo
`breadcrumbItems` que consume el componente visual (antes estaba repetido
inline) para que schema y UI nunca se desalineen.

**Commit en `main`**: `7abe79a`

**Verificado** (output real):
- `npm run typecheck` → `Tasks: 3 successful, 3 total`
- `npm run build` → `Tasks: 3 successful, 3 total` (storefront: 20/20 páginas
  estáticas generadas, sin errores)
- `npm run tools:test` → `Test Files 10 passed (10)` / `Tests 88 passed (88)`
- `npm run backend:test:unit` → `Test Suites: 7 passed, 7 total` /
  `Tests: 85 passed, 85 total`
- Levantado el storefront local (`ALLOW_DEMO_CATALOG=true next dev -p 3100`) y
  `curl` real a `/products/wok-frances-32cm-gris-negro`: el HTML trae dos
  `<script type="application/ld+json">`, el segundo es
  `{"@type":"BreadcrumbList","itemListElement":[...]}` con las 3 migas
  (Home → categoría → título del producto), URLs absolutas donde el ítem
  tiene `href`.
- CI en `main` tras el push: run `33533561665`, job `ci` en verde
  (Build, Typecheck, Test tools, Test backend, Validate compose — todos ✓).

**Pendiente/Asumido**:
- No se agregó test automatizado para este cambio: el storefront todavía no
  tiene vitest configurado (eso es R-1, el siguiente ítem 🟢 grande del
  backlog, aún no ejecutado). La verificación fue build + curl real, sin
  test unitario que la respalde a futuro.
- No se corrió un validador externo de datos estructurados (Rich Results
  Test de Google); la verificación se limitó a que el JSON emitido sea
  válido y tenga la forma esperada por schema.org.

**Nota fuera del plan**: ninguna — el ítem se ejecutó tal como estaba
descrito en el backlog, sin sorpresas.

**Siguiente lote**: S-1 · JSON-LD en `/campanas/[slug]` (🟢), según el orden
de ejecución del plan.

---

## 2026-09-01 · Lote 2 (autónomo)

**Ítem trabajado**: S-1 · JSON-LD en campañas (🟢, primer ítem no terminado
del orden de ejecución).

**Qué se hizo**: ni `/campanas/[slug]` (cocina) ni `/bienestar/campanas/[slug]`
(bienestar) declaraban schema.org, a diferencia de la ficha de producto que ya
lo tiene desde el lote anterior. Se agregó `buildCampaignJsonLd` en cada
página (mismo patrón que `buildProductJsonLd`: `Product` + `Offer` con precio,
disponibilidad y `url` apuntando a la campaña con el `sku` seleccionado) y se
inyecta con el mismo `<script type="application/ld+json">` que ya usa la
ficha.

**Commit en `main`**: `7cb4a5b`

**Verificado** (output real):
- `npm run typecheck` → `Tasks: 3 successful, 3 total`
- `npm run build` → `Tasks: 3 successful, 3 total` (storefront: 20/20 páginas
  generadas, sin errores)
- `npm run tools:test` → `Test Files 10 passed (10)` / `Tests 88 passed (88)`
- `npm run backend:test:unit` → `Test Suites: 7 passed, 7 total` /
  `Tests: 85 passed, 85 total`
- Levantado el storefront local (`npm run dev` en `apps/storefront`) y `curl`
  real:
  - `/campanas/wok-granito` (host cocina) → `<script type="application/ld+json">`
    con `{"@type":"Product","sku":"MGC-FR-SARTEN-20-GN","offers":{"@type":"Offer","price":"55.00","availability":"https://schema.org/InStock",...}}`.
  - `/bienestar/campanas/termo-acero` (host bienestar) → mismo patrón con
    `"sku":"BIEN-TERMO-SUS304-500"`, `"price":"20.00"`, imagen y `url`
    absolutas al dominio de bienestar.
- CI en `main` tras el push (incluye el commit de esta bitácora): run
  `33537301564`, job `ci` en verde (Build, Typecheck, Test tools, Test
  backend, Validate compose — todos ✓, 2m42s).

**Pendiente/Asumido**:
- Igual que en S-2: sin test automatizado (R-1, aún no ejecutado, sigue
  siendo el siguiente ítem grande de la lista).
- No se corrió un validador externo de datos estructurados (Rich Results
  Test); la verificación se limitó al JSON emitido siendo válido y con la
  forma esperada por schema.org.

**Nota fuera del plan**: la campaña de bienestar (`/bienestar/campanas/[slug]`)
no estaba mencionada explícitamente en la historia S-1 del backlog (que solo
nombra `/campanas/[slug]`), pero es la misma landing duplicada para la otra
vertical con el mismo problema de SEO. Se corrigió también para no dejar la
mitad del catálogo sin datos estructurados.

**Siguiente lote**: S-4 · `Organization` + `WebSite` en el layout (🟢), según
el orden de ejecución del plan.

---

## 2026-09-01 · Lote 3 (autónomo, fuera del orden del plan)

**Motivo**: el dueño reportó en la sesión (fuera del backlog) que "los
últimos 4 despliegues traen error" en Coolify, con el log real del build
fallido. Se investigó y arregló antes de seguir con S-4, porque un deploy
roto es más urgente que cualquier ítem 🟢 del backlog.

**Diagnóstico**: `apps/backend/Dockerfile` falla en
`RUN npm run backend:build` (stage `builder`) con
`error TS2307: Cannot find module '../data/kitchen-catalog-august-2026'`.
Causa raíz: el `.dockerignore` de la raíz excluye cualquier carpeta llamada
`data` (patrones `data` y `**/data`) del contexto de build, para no mandar
volúmenes locales (uploads, dumps) a Docker. El commit `a3b787a` (lote previo,
2026-08-31) movió `kitchen-catalog-august-2026.ts` a `src/data/` para sacarlo
de `migration-scripts/` — el archivo queda *tracked* en git (por eso
`git status` no mostraba nada raro y CI, que no construye la imagen Docker,
nunca lo vio) pero es invisible para `COPY . .` dentro del Dockerfile. Rompe
solo en el build de Docker, nunca en local ni en CI. Empezó a fallar en el
primer deploy después de `a3b787a`, es decir, los 4 despliegues desde
entonces (`7abe79a`, `b4288d6`, `7cb4a5b`, `4fac594`/`8bfb2ef`).

**Qué se hizo**: se movió el archivo de `src/data/` a
`src/catalog-data/` (fuera del patrón del `.dockerignore`) y se ajustó el
único import que lo consume (`migration-scripts/kitchen-catalog-seed.ts`).

**Commit en `main`**: `ac99c17`

**Verificado** (output real):
- `npm run typecheck` → `Tasks: 3 successful, 3 total`
- `npm run build` → `Tasks: 3 successful, 3 total`
- `npm run tools:test` → `Test Files 10 passed (10)` / `Tests 88 passed (88)`
- `npm run backend:test:unit` → `Test Suites: 7 passed, 7 total` /
  `Tests: 85 passed, 85 total`
- **Reproducción real del fallo de Coolify**:
  `docker build -f apps/backend/Dockerfile --target builder .` — con el
  código de ANTES del fix, reproduce exactamente el mismo error
  (`Cannot find module '../data/kitchen-catalog-august-2026'`) que el log de
  Coolify pegado por el dueño. Con el fix aplicado, el mismo comando
  Docker completa: `Backend build completed successfully`, `Frontend build
  completed successfully`, imagen exportada sin errores.
- CI en `main` tras el push: run `33539310635`, job `ci` en verde (Build,
  Typecheck, Test tools, Test backend, Validate compose — todos ✓, 2m32s).

**Pendiente/Asumido**:
- No tengo acceso al dashboard de Coolify desde esta sesión: no pude
  confirmar directamente que el redeploy automático (disparado por este
  push a `main`) terminó en verde en producción. La verificación se hizo
  reproduciendo el build de Docker exacto en local con el mismo Dockerfile
  y el mismo target que usa Coolify — es la evidencia más fuerte disponible
  sin ese acceso, pero el dueño debería confirmar en Coolify que el
  despliegue de `ac99c17` terminó exitoso.
- No se revisó si además hay que forzar un redeploy manual en Coolify o si
  el push a `main` dispara uno automáticamente (el plan asume que sí, según
  la nota de la sección 1 del `SPRINT_AUTONOMO.md`).

**Nota fuera del plan**: este ítem no estaba en el backlog. Se ejecutó porque
el dueño lo reportó activamente durante la sesión y un deploy roto bloquea
cualquier otro trabajo (nada de lo que la rutina haga en `main` llega a
producción hasta que esto se arregle). Después de esto, la rutina retoma
S-4 donde lo había dejado.

---

## 2026-09-01 · Lote 4 (autónomo)

**Ítem trabajado**: S-4 · `Organization` + `WebSite` en el layout (🟢, primer
ítem no terminado del orden de ejecución tras el fix del lote 3).

**Qué se hizo**: ninguna de las tres portadas (`/` cocina, `/bienestar`,
`/marca`) declaraba schema.org de sitio. Se agregó `buildOrganizationJsonLd` y
`buildWebSiteJsonLd` en `lib/seo.ts` y se inyectan con el mismo patrón
`<script type="application/ld+json">` de S-1/S-2, en las tres homepages.

**Decisión de diseño (desviación del literal "en el layout")**: el backlog
dice "en el layout", pero `app/layout.tsx` es compartido por los tres hosts
(marca, cocina, bienestar) y detectar cuál es el host activo requiere
`headers()` (`siteContextFromRequest()` en `lib/seo.ts`), que fuerza
renderizado dinámico en Next y habría roto el ISR de `/bienestar`
(`revalidate: 300`, del lote de caché del catálogo — commit `885b26f`). Cada
homepage ya conoce su propio `baseUrl` en build time vía `lib/domains`, así
que se implementó ahí en vez de en el layout compartido. Verificado con el
build: `/`, `/bienestar` y `/marca` siguen marcados `○` (estático) en el
output de `next build`, igual que antes del cambio.

**Decisión de alcance**: sin `potentialAction` (`SearchAction`, lo que
activa el sitelinks searchbox en el resultado de Google). El `?q=` de la
portada de cocina (`app/page.tsx`, tipo `HomeProps.searchParams`) existe pero
no filtra el grid de productos — solo llega a `PageAnalytics` para
tracking. No hay ninguna ruta `/buscar` ni filtrado client-side en ningún
componente de la portada (confirmado por grep). Declarar un `SearchAction`
sobre una búsqueda que no busca de verdad sería un dato estructurado
engañoso, así que el CA de "sitelinks searchbox" del backlog queda
parcialmente cumplido: se logra el panel de marca (`Organization`), no el
searchbox. Sumar `potentialAction` cuando `?q=` filtre productos de verdad.

**Commit en `main`**: `1aa6c78`

**Verificado** (output real):
- `npm run typecheck` → `Tasks: 3 successful, 3 total`
- `npm run build` → `Tasks: 3 successful, 3 total`; `/`, `/bienestar`,
  `/marca` siguen `○ Static` en el output de rutas (no se volvieron
  dinámicas).
- `npm run tools:test` → `Test Files 10 passed (10)` / `Tests 88 passed (88)`
- `npm run backend:test:unit` → `Test Suites: 7 passed, 7 total` /
  `Tests: 85 passed, 85 total`
- Levantado el storefront local y `curl` real a los tres hosts:
  - `/` con `Host: cocina.b2b.com.ec` → `Organization` (`name: "Eter Niu
    Cocina"`, `url`/`logo` en el dominio de cocina) + `WebSite`.
  - `/` con `Host: bienestar.b2b.com.ec` → mismo patrón con "Eter Niu
    Bienestar" y el dominio de bienestar.
  - `/` con `Host: eter-niu.com` → mismo patrón con "Eter Niu" y
    `www.eter-niu.com` (el middleware reescribe `/` a `/marca` en ese host;
    pedir `/marca` directo devuelve 307 a `/`, así que se verificó contra
    `/`, que es la URL real que sirve Google).

**Pendiente/Asumido**:
- Sin test automatizado (R-1, sigue sin ejecutarse).
- `sameAs` solo incluye Instagram (`instagram.com/eter.niu`), el único
  perfil social real encontrado en el código (`site-footer.tsx`); no se
  inventó ningún otro canal.
- No se corrió un validador externo de datos estructurados (Rich Results
  Test).
- El CA de "sitelinks searchbox" del backlog no se cumple del todo (ver
  decisión de alcance arriba) — queda como trabajo futuro atado a que la
  búsqueda de la portada de cocina funcione de verdad.

**Nota fuera del plan**: ninguna, además de la ya registrada en el lote 3.

**Siguiente lote**: R-1 · Tests del storefront (🟢, probablemente 2 lotes),
según el orden de ejecución del plan.

---

## 2026-09-01 · Lote 5 (autónomo)

**Ítem trabajado**: R-1 · Tests del storefront (🟢, primer ítem no terminado
del orden de ejecución). El plan estimaba 2 lotes; se cerró completo en 1.

**Qué se hizo**: el storefront no tenía vitest configurado ni ningún test.
Se agregó:
- `vitest` como devDependency de `@b2b/storefront` (misma versión que
  `ecommerce-tools`, `4.1.7`) y el script `"test": "vitest run"`.
- `storefront:test` en el `package.json` raíz, igual que `tools:test`.
- `vitest.config.ts` + `vitest.setup.ts`: `lib/catalog.ts` importa `cache`
  de `"react"` a nivel de módulo, pero `cache` solo existe en el build de
  React que Next.js vendoriza para el App Router — el paquete `"react"`
  real (`18.3.1`) que ve Node/vitest fuera de Next no lo exporta, así que
  cualquier test que importe ese archivo fallaba con
  `TypeError: cache is not a function`. El setup mockea `cache` como
  passthrough (`(fn) => fn`, sin memoizar) solo para que el módulo cargue
  en tests; no toca el comportamiento real de la app (Next sigue
  vendorizando su propio `cache` en build/runtime).
- 37 tests en `apps/storefront/tests/`, exactamente los tres archivos que
  pedía el CA de R-1:
  - `cart-pricing.test.ts` (9): agrupación por `comboGroup`, mínimo por
    grupo cuando difiere entre items del mismo grupo, carrito vacío,
    mezcla de items con y sin `comboPrice`.
  - `whatsapp.test.ts` (15): normalización del número de venta (incluye
    el caso del placeholder de prueba `9999999999`), `openingLine` por
    vertical/tipo de producto (bienestar, cuchillo como complemento),
    mensaje del carrito con y sin combo activo, referencia de sesión.
  - `catalog.test.ts` (13): `productSlug` (extracción desde `productUrl`,
    decode de caracteres escapados, fallback a `slugify` del título/sku
    cuando la URL no calza el patrón) y `normalizeProduct` (defaults
    comerciales, vertical/brand, `stoveCompatibility` por categoría). Se
    exportó `normalizeProduct`, que antes era una función privada del
    módulo — es la función de "normalize" que pide el CA.
- Dos tests fallaron en el primer intento por errores míos en las
  aserciones (esperaba `"precio combo aplicado"` cuando el código dice
  `"precio verde aplicado"`; el input de prueba para el número placeholder
  no calzaba con la rama del código que lo detecta) — corregidos antes de
  dar el lote por bueno, no son bugs del código bajo test.

**Commit en `main`**: `3cf16b5`

**Verificado** (output real):
- `npm run typecheck` → `Tasks: 3 successful, 3 total`
- `npm run build` → `Tasks: 3 successful, 3 total`
- `npm run storefront:test` → `Test Files 3 passed (3)` /
  `Tests 37 passed (37)`
- `npm test` (raíz, `turbo test`) → corre `@b2b/storefront` y
  `@b2b/ecommerce-tools` juntos, ambos en verde (37 + 88 tests).
- `npm run tools:test` → `Test Files 10 passed (10)` / `Tests 88 passed (88)`
- `npm run backend:test:unit` → `Test Suites: 7 passed, 7 total` /
  `Tests: 85 passed, 85 total`

**Pendiente/Asumido**:
- El CA de R-1 solo pedía estos tres archivos; el resto de
  `apps/storefront/lib` (14k líneas totales, incluye `commercial.ts`,
  `content.ts`, `product-media.ts`, etc.) sigue sin cobertura. No se
  amplió el alcance más allá de lo que el backlog pide explícitamente.
- No se agregó cobertura de componentes React (solo lib/lógica pura) —
  vitest está configurado sin `@testing-library/react` ni entorno DOM
  (`jsdom`); si en el futuro se quiere testear componentes, hay que sumar
  esas piezas.

**Nota fuera del plan**: revisando el commit de este lote noté que
`.github/workflows/ci.yml` solo tenía pasos "Test tools" y "Test backend" —
los 37 tests nuevos del storefront no corrían en CI, solo si alguien
ejecutaba `npm run storefront:test` a mano. Corregido en el mismo lote
(commit `e2fec79`, separado de `3cf16b5` para no mezclar "agregar tests"
con "hacer que el pipeline los corra"): se agregó el paso "Test storefront"
al workflow. Verificado: el run `33544717620` en `main` muestra el paso
nuevo en verde junto a los demás.

**Siguiente lote**: S-3 · Carrito visible en móvil en las cards (🟢), según
el orden de ejecución del plan.

---

## 2026-09-01 · Lote 6 (autónomo + dueño presente)

**Ítem trabajado**: S-3 · Carrito visible en móvil en las cards. El dueño
estaba presente en esta sesión (no fue un run desatendido), así que antes de
implementar se le reportó el hallazgo y se le pidió dirección. Confirmó:
"Cierra S-3 como obsoleta y pasa al siguiente ítem".

**Qué se investigó**: la premisa de S-3 ("la card del listado muestra solo
WhatsApp en móvil y solo carrito en desktop; la ficha sí tiene ambos") no
calza con ningún componente del código actual. Se rastreó el origen:

- El patrón sí existió: commit `e943bae` ("Add AddToCartButton desktop
  coexistence...", INTEG-2), documentado en `docs/WEB_DESIGN_CART.md`. Un
  `ProductCard` dentro de `app/page.tsx` mostraba
  `TrackedWhatsAppLink` con clase `lg:hidden` (móvil) y `AddToCartButton`
  con clase `hidden lg:flex` (desktop).
- Ese `ProductCard` fue **eliminado a propósito** por el rediseño premium
  posterior: `18b1fdd` ("Redesign home cocina...", WHOM-1) en cocina y
  `d541aee` (WHOM-2) en bienestar, que consolidaron los componentes
  duplicados (`docs/WEB_REDESIGN_PLAN.md` lo documenta explícitamente como
  problema resuelto: *"Componentes duplicados | `.product-card` vs
  `.wellness-product-card`"*).
- Estado real verificado hoy (grep exhaustivo de clases `hidden`/`md:`/
  `lg:` combinadas con WhatsApp/carrito en todo `apps/storefront/app`, sin
  coincidencias del patrón descrito):
  - Listado cocina (`ShowcaseTile`, vía `ProductShowcaseGrid` en la
    portada): solo `AddToCartButton` + "Ver ficha", siempre visibles, sin
    WhatsApp.
  - Listado bienestar (`WellnessProductCard` en `app/bienestar/page.tsx`):
    solo WhatsApp + "Ver landing", siempre visibles, sin carrito.
  - Ficha de producto (`app/products/[slug]/page.tsx`, leída completa):
    solo carrito, dos veces (inline línea 468 + `StickyCTABar` línea 622),
    cero WhatsApp en toda la página. El comentario del código es explícito:
    "Carrito fijo: WhatsApp queda al final del pedido completo".

**Por qué no se implementó tal cual**: forzar la coexistencia
WhatsApp-móvil/carrito-desktop de vuelta habría revertido una decisión de
diseño más reciente y deliberada (la consolidación del rediseño premium)
sin saber si sigue siendo válida. Ninguna mitad de la premisa original es
cierta hoy, así que no había nada que "igualar" — la comparación de
referencia (la ficha) tampoco tiene ambos CTAs.

**Qué se hizo**: se cerró S-3 en `docs/SPRINT_AUTONOMO.md` (tachada, con
nota completa del hallazgo) y se actualizó la sección "Orden de ejecución"
marcando los ítems 🟢 ya hechos (S-2, S-1, S-4, R-1) y S-3 como cerrada. Sin
cambios de código — es un lote 100% de documentación.

**Commit en `main`**: (este lote, junto con la bitácora)

**Verificado**: cambio solo en `docs/`, no aplica build/test — no se
tocó código de la aplicación.

**Pendiente/Asumido**:
- Si el dueño quiere una versión actual de "igualar CTAs entre listado y
  ficha", es una decisión de producto nueva (¿debería el listado de cocina
  tener también WhatsApp? ¿el de bienestar también carrito?), no algo que la
  rutina deba inventar. Queda fuera del backlog hasta que se redefina.

**Nota fuera del plan**: ninguna.

**Siguiente lote**: V-1 · Historial de conversación en el prompt de Vicky
(🔴 → rama + PR, sin merge a `main`), según el orden de ejecución del plan.

---

## 2026-09-01 · Lote 7 (dueño presente) — V-1, 🔴

**Ítem trabajado**: V-1 · Historial de conversación en el prompt de Vicky.
Primer ítem 🔴 del sprint: rama + PR, **sin mergear a `main`**.

**Qué se hizo**: `createWhatsAppAgentReply`
(`services/ecommerce-tools/src/whatsapp-agent.ts`) llamaba a OpenAI con solo
el mensaje actual del cliente — sin ningún turno anterior. Se agregó:

- `input.history?: CustomerEventRecord[]`: nuevo parámetro opcional. La
  función arma un bloque `"Historial reciente (más antiguo primero):"` con
  los últimos 10 turnos (`message_in`/`message_out`) antes del mensaje del
  cliente, extrayendo `payload.text` de cada evento e ignorando cualquier
  otro tipo de evento o eventos sin texto.
- Los eventos se ordenan explícitamente por `at` (ascendente) antes de
  recortar a los últimos 10: Medusa los devuelve `DESC` por fecha
  (`listCustomerEvents`, `apps/backend/.../b2b-crm/service.ts:459-464`) pero
  el almacenamiento local en archivo los devuelve en el orden en que se
  insertaron (`ASC`, `storage.ts`). Sin ese ordenamiento, `slice(-10)` habría
  tomado los turnos más VIEJOS en vez de los más recientes cuando el CRM
  backend es Medusa (que es el que corre en producción).
- `whatsapp-webhook.ts`: se eliminó una llamada duplicada a `getCustomer`.
  Antes se consultaba dos veces por mensaje: una antes de registrar el
  mensaje entrante (para `followup_reason`/NPS) y otra después (para el
  flujo de venta). Se adelantó y reutiliza una sola consulta. Efecto
  colateral bueno: como esa consulta ocurre ANTES de registrar el mensaje
  entrante, el snapshot de `.events` que recibe `createWhatsAppAgentReply`
  nunca incluye el turno que se está procesando — si se hubiera reusado la
  consulta posterior (después de `recordInboundEvent`), el mensaje actual
  del cliente habría aparecido duplicado: una vez en el historial y otra vez
  en "Mensaje del cliente: ...".

**No se tocó** (fuera del alcance de V-1, para no pisar V-2): el tool/método
`aiContext` de `service.ts` ni el campo `ai_context` que pide V-2 (no existe
como columna persistida; `aiContext` es un cálculo on-the-fly ya existente).

**Commit en la rama**: `dd9e663`

**Rama**: `feat/v1-vicky-historial` (pusheada, **no mergeada a `main`** —
correcto para 🔴)

**PR**: [#10](https://github.com/ceduardodch/ecommerce/pull/10)

**Verificado** (output real):
- `npm run typecheck` → `Tasks: 3 successful, 3 total`
- `npm run build` → `Tasks: 3 successful, 3 total`
- `npm run tools:test` → `Test Files 10 passed (10)` /
  `Tests 91 passed (91)` (88 previos + 3 nuevos en `whatsapp-agent.test.ts`).
  Incluye el escenario exacto del CA: el cliente responde "4" a "¿Para
  cuántas personas cocinas?" y el prompt trae el historial ANTES del mensaje
  actual (se verificó el orden con `indexOf` sobre el string armado). Los
  otros dos tests cubren: historial desordenado + más de 10 turnos (recorta
  a los 10 más recientes, ordenados) y eventos sin texto/de otro tipo
  (se ignoran, no aparece el bloque "Historial reciente").
- `npm run backend:test:unit` → `Test Suites: 7 passed, 7 total` /
  `Tests: 85 passed, 85 total` (sin cambios, no se tocó el backend).
- `npm run storefront:test` → `Test Files 3 passed (3)` /
  `Tests 37 passed (37)` (sin cambios).
- CI del PR: run `33547654224`, job `ci` en verde (Build, Typecheck, Test
  tools, Test backend, Test storefront, Validate compose — todos ✓, 2m6s).

**Pendiente/Asumido**:
- **No verificado contra WhatsApp real**: no tengo credenciales de
  producción (`WHATSAPP_ACCESS_TOKEN`, `OPENAI_API_KEY` reales) en esta
  sesión. La verificación es a nivel de unit test del prompt armado
  (aserciones sobre el string que se le manda a OpenAI), no un mensaje real
  ida y vuelta con Vicky. El dueño debería probar un intercambio real antes
  de mergear, o pedirle a alguien que lo haga.
- El límite de 10 turnos (`HISTORY_TURN_LIMIT`) es una elección razonable
  propia, no algo que el CA especificara con un número — si en la práctica
  hace falta más o menos contexto, es un solo número para ajustar.
- Queda 🔴 en rama, tal como pide la regla del sprint para cualquier cambio
  que toque el flujo de mensajes a clientes. NO se mergeó a `main`.

**Nota fuera del plan**: ninguna.

**Siguiente lote**: V-2 · Contexto del cliente en el prompt de Vicky (🔴 →
rama + PR, sin merge a `main`), según el orden de ejecución del plan. Puede
construirse sobre la rama `feat/v1-vicky-historial` una vez que el dueño la
revise, o esperar a que se mergee primero — a decidir por el dueño.

---

## 2026-09-01 · Lote 8 (dueño presente) — V-1 mergeado + V-2, 🔴

**V-1 mergeado a `main`**: el dueño revisó y mergeó el
[PR #10](https://github.com/ceduardodch/ecommerce/pull/10) directamente en
GitHub mientras se trabajaba V-2 (commit `dd9e663` vía merge commit
`19cb659`). Confirmado con `git log 49fb9e1..19cb659` — el historial de
conversación en el prompt de Vicky ya está en producción tras el próximo
deploy de Coolify.

**Ítem trabajado**: V-2 · Contexto del cliente en el prompt de Vicky.
Construido sobre la rama de V-1 (como quedó anotado en el lote 7), luego
retargeteado a `main` cuando V-1 se mergeó.

**Qué se hizo**: `createWhatsAppAgentReply` recibe ahora `customerContext`
con tres cosas del cliente: qué ya compró (`purchasedProducts`), en qué
etapa está la conversación (`journeyStage`, tomado de
`customer.metadata.journeyStage`, el mismo campo que ya escribe el flujo de
venta) y si tiene un seguimiento programado (`nextFollowupAt` +
`followupReason`). Arma un bloque `"Contexto del cliente:"` en el prompt.

**Decisión de diseño clave**: los productos ya comprados se sacan del
catálogo candidato **en código**, no solo con una instrucción de texto al
modelo — el CA pide que un cliente que ya compró una olla no reciba la
oferta de esa misma olla, y confiar en que el modelo "lea" el contexto y
decida no ofrecerla es más frágil que simplemente no dársela como opción.
Si la búsqueda original solo encontraba el producto ya comprado (queda
vacía tras filtrar), cae al catálogo vivo —también filtrado— en vez de
quedarse sin nada que ofrecer, igual que el fallback que ya existía para
búsquedas sin resultados.

**Bug encontrado fuera del plan, corregido en el mismo commit**:
`whatsapp-webhook.ts` leía `customer?.followup_reason` (snake_case) para la
lógica de NPS, pero el campo real es `followupReason` (camelCase) en los
dos backends (`CustomerRecord` local y `serializeCustomer` de Medusa, que
sí devuelve camelCase pese a que la columna en Postgres es
`followup_reason`). Esto significa que `customerFollowupReason` siempre fue
`undefined`, así que `npsDecision()` nunca detectaba que un cliente estaba
respondiendo a una encuesta NPS — el score no se registraba y el
seguimiento de "referido" (cuando el score es ≥9) nunca se programaba. Se
corrigió junto con el widening de tipos que V-2 ya necesitaba tocar en
`getCustomer`. **No se agregó un test de integración nuevo para este fix
específico** (habría requerido levantar Fastify con dependencias
mockeadas, algo que `whatsapp-webhook.test.ts` no hace hoy — solo testea
funciones puras); queda documentado aquí y en el commit en vez de ampliar
el alcance de este lote con infraestructura de test nueva.

**Commit en la rama**: `65c3f74`

**Rama**: `feat/v2-vicky-contexto` (pusheada, **no mergeada a `main`**)

**PR**: [#11](https://github.com/ceduardodch/ecommerce/pull/11)

**Nota sobre el PR apilado**: se abrió originalmente con `--base
feat/v1-vicky-historial` (diff limpio, solo el cambio de V-2) porque V-1
todavía no estaba mergeado. Como GitHub Actions solo dispara `pull_request`
contra `main`/`release` (`.github/workflows/ci.yml`), CI no corría en ese
PR. Cuando V-1 se mergeó a mitad de este lote, se retargeteó el PR a `main`
con `gh pr edit --base main` — pero cambiar la base sola no dispara una
nueva corrida (el workflow no escucha el evento `edited`), así que hubo que
cerrar y reabrir el PR para forzar el evento `reopened` y que CI corriera
de verdad contra `main`.

**Verificado** (output real):
- `npm run typecheck` → `Tasks: 3 successful, 3 total`
- `npm run build` → `Tasks: 3 successful, 3 total`
- `npm run tools:test` → `Test Files 10 passed (10)` /
  `Tests 95 passed (95)` (91 previos + 4 nuevos). Incluye el escenario
  exacto del CA: un cliente que ya compró una olla no la recibe en
  "Catálogo relevante" — verificado incluso cuando es el único resultado de
  la búsqueda original y hay que caer al catálogo vivo (también filtrado).
  Los otros tres tests cubren: el filtrado también aplica al catálogo vivo
  de fallback, etapa/seguimiento aparecen en el contexto sin romper cuando
  no hay compras previas, y no se agrega el bloque de contexto cuando no
  hay `customerContext`.
- `npm run backend:test:unit` → `Test Suites: 7 passed, 7 total` /
  `Tests: 85 passed, 85 total` (sin cambios).
- `npm run storefront:test` → `Test Files 3 passed (3)` /
  `Tests 37 passed (37)` (sin cambios).
- CI del PR #11 contra `main` (tras el retarget + reopen): run
  `33549032426`, job `ci` en verde (Build, Typecheck, Test tools, Test
  backend, Test storefront, Validate compose — todos ✓, 1m35s).

**Pendiente/Asumido**:
- Igual que V-1: **no verificado contra WhatsApp real** (sin credenciales
  de producción en esta sesión). Verificación a nivel de unit test del
  prompt armado.
- El bug de `followup_reason`/NPS no tiene test de regresión dedicado (ver
  nota arriba) — riesgo de que alguien lo reintroduzca sin que CI lo
  atrape. Si el dueño quiere cerrarlo del todo, hace falta un test que
  levante `mountWhatsappWebhookRoutes` con Fastify real o inyectado.
- Queda 🔴 en rama/PR, tal como pide la regla del sprint. NO se mergeó a
  `main`.

**Nota fuera del plan**: el bug de `followup_reason` (ver arriba) y el
manejo del PR apilado que dejó de tener sentido a mitad de camino cuando el
dueño mergeó V-1 en paralelo.

**Siguiente lote**: V-3 · Herramientas reales (quote/create_order vía
tool-calling) (🔴 → rama + PR, sin merge a `main`, esfuerzo L — probablemente
más de un lote), según el orden de ejecución del plan. Antes de arrancarlo
convendría que el dueño revise y mergee (o pida cambios en) el PR #11.

---

## 2026-09-01 · Lote 9 (dueño presente) — sincronizar planes + investigación V-3

**Motivo**: el dueño pidió investigar V-3 y, en paralelo, mergeó directo a
`main` (fuera de esta rutina) cuatro PRs con una feature grande — la
bandeja operativa de WhatsApp — más tres fixes. Pidió actualizar la
planificación contra el estado real de `main` antes de seguir.

**Investigación de V-3 (sin código)**: se encontró que `whatsapp-sales-flow.ts`
(`advanceWhatsappSale`) ya es una máquina de estados determinista (sin IA)
que cotiza, exige confirmación explícita y manda el carrito — con 5 tests
en verde protegiendo exactamente "ningún cobro sin confirmación". Como ese
flujo intercepta casi todos los mensajes una vez que hay venta en curso,
darle tool-calling a `createWhatsAppAgentReply` obliga a decidir entre
tools solo para conversación libre (sin tocar el flujo probado) o que la IA
tome el control de confirmar/crear pedido. Detalle completo, con la
colisión de nombres `create_order` (dos implementaciones reales distintas
en el código) y la actualización tras la bandeja de WhatsApp (nuevo modo
`human`/`ai` por conversación que cualquier tool-calling tendría que
respetar), quedó documentado en `docs/SPRINT_AUTONOMO.md`, sección EPIC V.
**No se escribió código de V-3** — se dejó pausado explícitamente.

**Qué se hizo (sincronización de planes)**:
- `docs/SPRINT_AUTONOMO.md`: V-1 y V-2 marcados hechos (tachados, con
  commit/PR/lote) en la tabla de EPIC V, en el orden de ejecución y en el
  contexto en frío (sección 0). Se agregó la nota de arquitectura de V-3
  (arriba) y se anotaron los 4 commits que el dueño mergeó directo
  (`f89ac2c` bandeja WhatsApp, `ee7c585` fix de persistencia de media,
  `75f1da0` fix de crash con catálogo vacío + `docker-compose.yml`,
  `9a9d97e` fix de links de navegación del admin).
- `docs/CRM_BACKLOG.md`: no tenía ninguna entrada para la bandeja
  operativa de WhatsApp (es una feature nueva, fuera de las épicas
  TPL/CONV/RPT/BRC/XSELL/BMK ya cerradas). Se agregó a "Estado real" con
  una nota de verificación pendiente (ver abajo).

**Commits en `main`**: `73fb026` (V-1/V-2 + bandeja, primera pasada),
`986fb22` (sincronización con los 3 PRs adicionales del dueño)

**Verificado**: cambios solo en `docs/`, `npm run typecheck` en verde
(no se tocó código de la app). CI del push `986fb22`: run `33555500206`,
verde (Build, Typecheck, Test tools, Test backend, Test storefront,
Validate compose — todos ✓, 1m44s).

**Pendiente/Asumido — importante, no verificado en esta sesión**:
- `docs/CRM_WHATSAPP_INBOX.md` (el propio doc de la bandeja) lista pasos
  explícitos "Antes de promover": aplicar la migración en staging,
  confirmar upgrade/downgrade/re-upgrade, montar el volumen persistente
  `crm-whatsapp-media` en Coolify, y probar con un número real (texto,
  imagen, PDF, audio, video, tomado por humano, liberado a Vicky). **No
  tengo forma de confirmar si esto se hizo** antes de mergear a `main` (que
  auto-despliega). Si no se hizo, la bandeja podría estar en producción sin
  el volumen montado — los adjuntos fallarían o se perderían.
- El bug conocido de retención (job diario que borra mensajes/archivos de
  más de 24 meses) tampoco se verificó que esté activo o programado.

**Nota fuera del plan**: ninguna adicional a lo ya registrado en el lote 8.

**Siguiente lote**: pendiente de la decisión del dueño sobre V-3 (ver nota
de arquitectura). Mientras tanto, valdría confirmar los pasos de
"Antes de promover" de la bandeja de WhatsApp en producción (ver
Pendiente/Asumido arriba) — no es un ítem del backlog, es una verificación
operativa urgente.

---

## 2026-09-01 · Lote 10 (dueño presente) — V-3, 🔴

**Decisión del dueño** (respuesta a la pregunta del lote 9): "quiero que la
IA tome el control, haga todo y deje listo para yo solo enviar". Aclarado
con una pregunta de opción múltiple: la IA cierra la venta completa —
cotiza, confirma, crea el carrito de pago— porque son tickets de bajo valor
(ollas); lo único manual que le queda al dueño es despachar a logística una
vez que el cliente ya pagó. Esto resuelve la decisión de arquitectura
pausada en el lote 9: la IA reemplaza a `advanceWhatsappSale` como camino
principal (no solo tools para conversación libre).

**Qué se hizo**: `createWhatsAppAgentReply` acepta ahora `phone` +
`commerce: { quote, createCart }` y declara dos tools reales a la API de
OpenAI Responses (`quote`, `create_cart`), con un loop de tool-calling
(`previous_response_id`, tope de 3 rondas). Los tools ejecutan las mismas
funciones que ya usaba `advanceWhatsappSale`
(`service.quote`/`service.createWhatsappCart`), que ya registran sus
propios eventos CRM — no hizo falta duplicar ese registro.
`requiresHuman()` se exportó de `whatsapp-sales-flow.ts` y se usa como
pre-filtro determinista antes de darle el turno a la IA (factura, garantía,
descuento, envío urgente siguen yendo a una persona, sin cambios).
`whatsapp-webhook.ts`: cuando `WHATSAPP_AGENT_MODE=openai` (el modo de
producción), la IA con tools reemplaza a `advanceWhatsappSale`; si la IA
está apagada, `advanceWhatsappSale` se conserva como respaldo determinista
para no dejar la venta sin respuesta.

**Salvaguarda que se mantuvo pese a la autonomía completa**: `create_cart`
valida el SKU contra el catálogo mostrado (rechaza SKUs inventados) y exige
nombre+ciudad no vacíos ANTES de ejecutar, en código — no confía solo en lo
que el modelo diga que confirmó. El prompt también instruye explícitamente
no crear el carrito sin confirmación explícita del cliente. La garantía de
fondo no cambió: `createWhatsappCart` solo genera un link de un solo uso;
el cliente ingresa su propia tarjeta en DataFast, fuera de este flujo —
ninguna herramienta que la IA puede llamar mueve dinero por sí sola.

**Imprevisto durante el lote**: mientras se armaba la rama, el dueño
mergeó directo a `main` el commit `542ed6c` ("fix(whatsapp): match natural
product requests"), que también toca `whatsapp-agent.ts` (inferencia de
vertical para el catálogo de respaldo cuando la búsqueda no encuentra
nada) y su archivo de tests — los mismos dos archivos que esta historia. Se
rebaseó la rama sobre `main` actualizado; el único conflicto real fue en
los imports (ambos commits agregaron imports nuevos en las mismas líneas),
resuelto combinando los dos. El resto del archivo (la lógica de fallback al
catálogo vivo) se auto-mergeó limpio porque esta historia no había tocado
esas líneas. Verificado que el test de esa otra historia ("limita el
catálogo de respaldo a cocina...") sigue pasando junto con los 6 nuevos de
V-3.

**Commit en la rama**: `b0fd7c0` (tras el rebase; el commit original antes
de rebasear fue `d6a2ec9`, ya no existe como tal)

**Rama**: `feat/v3-vicky-tool-calling` (pusheada, **no mergeada a `main`**)

**PR**: [#17](https://github.com/ceduardodch/ecommerce/pull/17)

**Verificado** (output real):
- `npm run typecheck` → `Tasks: 3 successful, 3 total`
- `npm run build` → `Tasks: 3 successful, 3 total`
- `npm run tools:test` → `Test Files 11 passed (11)` /
  `Tests 107 passed (107)` (103 previos + 3 de la historia concurrente
  `catalog-search.test.ts` + 6 nuevos de tool-calling — algunos ya estaban
  contados en el total previo por el rebase). Los 6 nuevos cubren: crea
  `create_cart` con confirmación/nombre/ciudad y devuelve el link;
  `quote` antes de responder cuando hace falta precio exacto; no ofrece
  tools si falta `phone`/`commerce`; no ejecuta `create_cart` con un SKU
  que no está en el catálogo mostrado; no crea el carrito si faltan
  nombre/ciudad aunque el modelo llame la herramienta; corta al llegar al
  techo de 3 rondas si el modelo insiste en llamar herramientas sin parar.
- `npm run backend:test:unit` → `Test Suites: 8 passed, 8 total` /
  `Tests: 86 passed, 86 total` (sin cambios).
- `npm run storefront:test` → `Test Files 3 passed (3)` /
  `Tests 37 passed (37)` (sin cambios).
- Smoke test de arranque real: `ecommerce-tools` levantado local con
  `WHATSAPP_AGENT_MODE=off`, `GET /healthz` → 200 con el JSON esperado —
  confirma que `mountWhatsappWebhookRoutes` con la nueva rama de código no
  rompe el arranque del servidor.
- CI del PR #17: run `33558328771`, job `ci` en verde (Build, Typecheck,
  Test tools, Test backend, Test storefront, Validate compose — todos ✓,
  1m51s).

**Pendiente/Asumido**:
- **No verificado contra una llamada real a OpenAI**: sin `OPENAI_API_KEY`
  real en esta sesión. El formato de `tools`/`function_call`/
  `function_call_output` sigue el contrato documentado de la Responses
  API, pero es la pieza de mayor riesgo de todo el lote — antes de confiar
  en producción hace falta probar una conversación real de punta a punta
  (cotizar, confirmar, recibir el link de carrito) con una cuenta de
  WhatsApp de prueba.
- El techo de `MAX_TOOL_ROUNDS = 3` es una elección propia razonable, no
  algo que el dueño haya pedido con un número — ajustable si en la
  práctica hace falta más.
- Sigue pendiente (heredado del lote 9, no se avanzó en este) confirmar los
  pasos de "Antes de promover" de la bandeja de WhatsApp en producción.
- Queda 🔴 en rama/PR. NO se mergeó a `main`.

**Nota fuera del plan**: el conflicto de rebase con `542ed6c` (ver arriba).

**Siguiente lote**: pendiente de que el dueño revise el PR #17 — idealmente
con una prueba real de WhatsApp antes de mergear, dado que es el cambio de
mayor alcance de todo el sprint (reemplaza el camino principal de cierre de
venta). Después de eso, V-4 (notas de voz) y V-5 (comprobantes por foto)
siguen en la cola, ambos 🔴.

---

## 2026-09-01 · Mergeado el PR #17 (dueño presente, orden explícita)

**Qué pasó**: el dueño pidió mergear el PR #17 ("mergea") en la misma
sesión, sin esperar a la prueba real contra OpenAI que quedó anotada como
recomendación. Se hizo con `gh pr merge 17 --merge --delete-branch`.

**Commit resultante en `main`**: `0a284dc` (merge commit del PR #17 sobre
`b0fd7c0`)

**Verificado**: CI del push a `main` tras el merge — run `33558989077`,
job `ci` en verde (Build, Typecheck, Test tools, Test backend, Test
storefront, Validate compose — todos ✓, 1m48s). Es la misma verificación
que ya corrió en el PR antes de mergear (mismo commit, sin cambios).

**No verificado — se mergeó sin esto, a criterio del dueño**:
- Conversación real de WhatsApp con `OPENAI_API_KEY` real probando el
  tool-calling de punta a punta (cotizar → confirmar → recibir el link de
  carrito). Sigue siendo la brecha de verificación más importante de este
  cambio.
- Que el deploy de Coolify disparado por este push haya terminado bien
  (no tengo acceso al dashboard).

**Pendiente/Asumido**: vigilar los logs de `whatsapp_agent` en producción
los primeros días — específicamente `openai_http_error`,
`openai_empty_reply` y `tool_call_round_limit_reached`, que son las señales
de que el tool-calling no está funcionando como se espera contra la API
real.

**Siguiente lote**: V-4 · Notas de voz (🔴 → para en rama), según el orden
de ejecución del plan.
