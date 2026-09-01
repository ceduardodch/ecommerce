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
