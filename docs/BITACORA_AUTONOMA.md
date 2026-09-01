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
