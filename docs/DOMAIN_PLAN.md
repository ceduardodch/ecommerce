# Plan de dominio: migración a eter-niu.com con nichos separados

> Junio 2026. El dueño compró **eter-niu.com**. Objetivo: que toda la marca
> referencie a ese dominio, con los nichos **cocina** y **bienestar** claramente
> separados. Documento autosuficiente para cualquier agente ejecutor.

## 1. Decisión de arquitectura (recomendada y por qué)

**Una marca, un dominio madre, dos subdominios de nicho:**

| Dominio | Rol | Theme |
|---|---|---|
| `www.eter-niu.com` (+ apex) | **Portal de marca**: página corta con isotipo, tagline "Bienestar & Cocina Consciente" y dos puertas grandes (Cocina / Bienestar) + CTA WhatsApp | neutro (ink/ivory) |
| `cocina.eter-niu.com` | Tienda cocina (hoy cocina.b2b.com.ec) | `data-theme="cocina"` (clay) |
| `bienestar.eter-niu.com` | Tienda bienestar (hoy bienestar.b2b.com.ec) | `data-theme="bienestar"` (moss) |
| `cocina.b2b.com.ec`, `bienestar.b2b.com.ec` | **301 → equivalente nuevo** (mantener ≥ 12 meses: campañas Meta activas apuntan ahí) | — |
| `adminshop.b2b.com.ec`, `vicky.b2b.com.ec` | Quedan igual (internos); opcional mover después a `admin.eter-niu.com` / `vicky.eter-niu.com` | — |

**Por qué subdominios y no rutas o dos marcas separadas:**
- El middleware actual YA enruta por host — los subdominios reutilizan esa
  arquitectura con cambios mínimos.
- La separación de nichos queda "bien marcada" en 4 capas: subdominio propio,
  theme visual propio (clay/moss), feed/catálogo Meta propio y campañas propias —
  sin partir la marca: el CRM vive del cross-sell cocina↔bienestar
  (docs/CRM_BACKLOG.md EPIC XSELL), el Instagram @eter.niu y el isotipo son uno.
- El portal raíz convierte el dominio "bonito" de la bio de Instagram en un
  embudo: quien llega de la marca elige nicho en un toque.

## 2. Inventario de referencias al dominio viejo (verificado con grep)

| Archivo | Qué tiene | Acción |
|---|---|---|
| `apps/storefront/middleware.ts` | Sets `kitchenHosts`/`wellnessHosts` hardcodeados + redirect a `bienestar.b2b.com.ec` | Añadir hosts nuevos + set `brandHosts` + redirects 301 de hosts viejos |
| `apps/storefront/lib/domains.ts` | Fallbacks `cocina.b2b.com.ec` etc. | Cambiar fallbacks al dominio nuevo |
| `docker-compose.yml` | `STORE_CORS`/`ADMIN_CORS`/`AUTH_CORS` + URLs públicas por env | Añadir dominios nuevos a CORS y actualizar `*_PUBLIC_URL` |
| `services/ecommerce-tools/src/config.ts` | Defaults de `COCINA_PUBLIC_URL`/`BIENESTAR_PUBLIC_URL` | Cambiar defaults |
| `services/ecommerce-tools/src/catalog.ts`, `demo-catalog.ts` | Links absolutos en productos demo | Actualizar |
| `apps/backend/src/migration-scripts/kitchen-catalog-seed.ts`, `wellness-catalog-seed.ts` | URLs de media/links en metadata | Actualizar y re-seedear (upsert) |
| `apps/backend/src/api/admin/b2b/_shared.ts` | Email generado `wa-<phone>@customers.shop.b2b.com.ec` | Opcional → `@customers.eter-niu.com` (interno, no urgente) |
| `scripts/sync-whatsapp-catalog.mjs`, `scripts/campaign-readiness-report.mjs`, `scripts/validate-meta-whatsapp-flow.mjs` | URLs base de validación | Parametrizar por env / actualizar |
| `apps/storefront/app/layout.tsx` | `metadataBase`/canónicas/OG | Actualizar al dominio nuevo |

## 3. Fases de ejecución (orden seguro: lo nuevo convive antes de apagar lo viejo)

### D1 — DNS + Coolify (sin código)
1. En el registrador de eter-niu.com: `A`/`CNAME` de `@`, `www`, `cocina`,
   `bienestar` apuntando al servidor de Coolify (mismos registros que usan los
   hosts b2b.com.ec actuales).
2. En Coolify, app storefront: añadir los 4 dominios nuevos → TLS automático.
3. CA: los 4 responden con certificado válido (aunque muestren contenido de cocina por defecto).

### D2 — Código multi-host (storefront) — ✅ IMPLEMENTADO (jun 2026)

Estado: hecho y verificado con curl multi-host. Detalles de lo implementado:
- `middleware.ts`: hosts nuevos en `kitchenHosts`/`wellnessHosts`; `brandHosts`
  (eter-niu.com y www) con rewrite `/` → `/marca`; redirects 301 de los hosts
  b2b.com.ec **detrás del flag `DOMAIN_MIGRATION_REDIRECTS`** (default `false`)
  — activar en Coolify SOLO después de D1+D4.1; conservan ruta+query (verificado:
  `/campanas/x?sku=...&utm_campaign=...` redirige exacto).
- `app/marca/page.tsx`: portal de marca (isotipo interino SVG, tagline, dos
  puertas con tracking `portal_cocina`/`portal_bienestar`, CTA WhatsApp trackeada).
- `lib/domains.ts`: `brandBaseUrl` (env `NEXT_PUBLIC_BRAND_URL`).
- `docker-compose.yml`: `NEXT_PUBLIC_BRAND_URL`, `DOMAIN_MIGRATION_REDIRECTS` y
  dominios nuevos añadidos a STORE/ADMIN/AUTH_CORS.
- PENDIENTE de este D2 (post-D1): flip de envs `*_PUBLIC_URL`/`NEXT_PUBLIC_*_URL`
  en Coolify al dominio nuevo y actualización de fallbacks/seeds (ver D5).

Pasos originales (referencia):
1. `middleware.ts`: añadir `cocina.eter-niu.com` a `kitchenHosts`,
   `bienestar.eter-niu.com` a `wellnessHosts`; nuevo set
   `brandHosts = {"eter-niu.com","www.eter-niu.com"}` con rewrite de `/` a la
   nueva página `/marca`; el redirect interno a bienestar usa env en vez de
   hardcode. **Redirects 301**: si `host` termina en `b2b.com.ec` (cocina/bienestar)
   → `https://<equivalente>.eter-niu.com` misma ruta+query (preserva campañas activas).
2. `lib/domains.ts`: fallbacks a `https://cocina.eter-niu.com` /
   `https://bienestar.eter-niu.com`.
3. Envs en docker-compose/Coolify: `NEXT_PUBLIC_COCINA_URL`,
   `NEXT_PUBLIC_BIENESTAR_URL`, `COCINA_PUBLIC_URL`, `BIENESTAR_PUBLIC_URL` al
   dominio nuevo; añadir los dominios nuevos a `STORE_CORS`/`ADMIN_CORS`/`AUTH_CORS`.
4. `app/layout.tsx`: `metadataBase` y OG al dominio nuevo.
5. CA: `cocina.eter-niu.com/campanas/<slug>?sku=...` renderiza idéntico al viejo;
   el viejo redirige 301 conservando query params; feeds responden en ambos.

### D3 — Portal de marca `/marca` (parte del rediseño, Sprint C)
Página mínima premium: isotipo monocromo grande, "Eter Niu" en Fraunces,
tagline "Bienestar & Cocina Consciente", dos cards-puerta (Cocina → terracota,
foto de olla; Bienestar → musgo, foto páramo) y pill de WhatsApp. Sin nav, sin
scroll largo. Es la URL para la bio de Instagram.

### D4 — Meta / Instagram (manual del dueño + agente)
1. Meta Business Manager: **verificar el dominio eter-niu.com** (meta-tag o DNS TXT).
2. Commerce Manager: actualizar URLs de los feeds de catálogo a
   `https://cocina.eter-niu.com/feeds/meta/catalog.csv` y el de bienestar
   (los viejos siguen vivos vía 301, pero Meta prefiere URL directa).
3. Campañas: las activas NO se tocan (el 301 las sostiene); las nuevas se crean
   ya con el dominio nuevo.
4. Instagram bio: link a `www.eter-niu.com`.
5. CA: eventos de pixel/CAPI siguen llegando (revisar Events Manager tras el cambio).

### D5 — Limpieza y largo plazo
- Re-seedear catálogos para actualizar URLs en metadata (`npm run seed:kitchen`,
  `seed:wellness` — son upserts).
- Actualizar scripts de validación y correrlos contra el dominio nuevo.
- Email de marca (`hola@eter-niu.com`) cuando se contrate correo; actualizar
  email generado de clientes en `_shared.ts` en ese momento.
- Mantener los 301 de b2b.com.ec ≥ 12 meses; revisar en analytics cuándo el
  tráfico al dominio viejo llegue a ~0 antes de soltarlo.

## 4. Riesgos y cómo los evita este plan

| Riesgo | Mitigación |
|---|---|
| Campañas Meta activas rompen | Nunca se apaga el dominio viejo: 301 con ruta+query intactos (D2.1) |
| Pixel deja de atribuir | Verificación de dominio en Meta ANTES de mover campañas (D4.1) |
| CORS bloquea admin/checkout | Dominios nuevos añadidos a los 3 CORS antes del switch (D2.3) |
| SEO se pierde | 301 permanentes + canónicas nuevas en metadata (D2.4) |
| Vicky manda links viejos | Prompts/config de Vicky usan `*_PUBLIC_URL` de ecommerce-tools — se actualizan por env en D2.3; revisar `agents/vicky-sales-bot.md` por URLs literales |

## 5. Verificación final

1. Matriz de 12 URLs (4 hosts × 3 rutas clave: `/`, campaña con sku, feed CSV):
   las nuevas responden 200, las viejas 301 al equivalente exacto.
2. Click de CTA WhatsApp desde el dominio nuevo → evento en `/api/events` y pixel.
3. `node scripts/validate-meta-whatsapp-flow.mjs` apuntando al dominio nuevo.
4. Events Manager de Meta muestra actividad del dominio nuevo verificado.
