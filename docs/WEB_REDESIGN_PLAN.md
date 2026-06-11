# Plan de rediseño del storefront — premium editorial (EJECUTABLE)

> **Este documento es autosuficiente**: cualquier agente/desarrollador debe poder
> ejecutar los sprints leyendo solo esto, sin contexto previo de conversaciones.
> Estado: dirección visual APROBADA por el dueño (junio 2026) con maquetas.
> Las decisiones de la sección 2 están cerradas — no re-preguntar.

## 0. Contexto del negocio (para un agente en frío)

- Ecommerce ecuatoriano con dos líneas: **cocina** (cocina.b2b.com.ec, ollas/woks/
  sartenes/cuchillos de granito) y **bienestar** (bienestar.b2b.com.ec). NO hay
  otras líneas.
- **El checkout es WhatsApp**: el tráfico viene de Meta Ads a landings de campaña
  y termina en conversación con "Vicky" (bot de ventas). No hay carrito. Toda
  CTA principal lleva a wa.me con tracking.
- ~80%+ del tráfico es móvil. El rediseño es **mobile-first estricto**.
- Monorepo Turbo. El storefront es `apps/storefront` (Next.js 15.5.18, App
  Router, React 18.3.1). Rama de trabajo: `release`.

## 1. Diagnóstico del código actual (verificado)

| Hecho | Detalle |
|---|---|
| CSS monolítico | `apps/storefront/app/globals.css` ≈ 62 KB / 3.700 líneas, clases ad-hoc |
| Sin media queries | 0 `@media` en globals.css; grids fijos de 3–4 columnas → roto en móvil |
| Sin Tailwind ni libs UI | Todo CSS artesanal; sin shadcn/Radix |
| Fuentes no cargadas | Declara "Plus Jakarta Sans" pero no usa `next/font` → se ve fuente del sistema |
| Imágenes sin optimizar | `<img>` directo, sin `next/image`, sin srcset |
| Tipografía caótica | font-weights 750/760/780/800/850/900/950; h2 en 4 tamaños distintos |
| Componentes duplicados | `.product-card` vs `.wellness-product-card`; badges/buttons repetidos |
| Assets | `public/media/`: ~39 JPG, 12 SVG, 7 MP4 (hero-cocina.mp4, receta-wok.mp4, uso-diario-gas.mp4, set-mgc.mp4…) |

### Qué NO se puede tocar (regla inquebrantable)

1. **Tracking**: `app/components/analytics.tsx` (`TrackedWhatsAppLink`, eventos a
   `/api/events`), MetaPixel en `app/layout.tsx`. Toda CTA nueva de WhatsApp DEBE
   seguir envolviéndose en `TrackedWhatsAppLink`.
2. **Routing por dominio**: `apps/storefront/middleware.ts` (hosts cocina/bienestar,
   rewrites de `/` y del feed). No cambiar rutas ni hosts.
3. **Feeds Meta**: `app/feeds/meta/catalog.csv/route.ts` y su query `?vertical=`.
4. **URLs y query params**: `/campanas/[slug]` con SKU/variante en query — las
   campañas de Meta activas apuntan ahí.
5. **Lógica de formularios**: `lead-capture-form.tsx` y `pot-recommendation-quiz.tsx`
   conservan su lógica/submit; solo se re-estilizan.
6. Generación de links WhatsApp: `apps/storefront/lib/whatsapp.ts`.

## 2. Decisiones de diseño CERRADAS (aprobadas con maquetas)

### 2.1 Tokens

```css
/* Colores */
--ivory:  #FAF7F2;  /* fondo de página */
--ink:    #1A1A18;  /* texto principal, promo bar */
--stone:  #6B6B66;  /* texto secundario */
--sand:   #E8E2D8;  /* bordes, divisores, placeholders */
--shell:  #EFE9DD;  /* fondo de tiles/categorías */
--clay:   #C4502A;  /* ACENTO COCINA: precios, eyebrows, CTAs no-WhatsApp */
--moss:   #2F5D43;  /* ACENTO BIENESTAR: mismo rol que clay */
--wa:     #25D366;  /* SOLO botones de WhatsApp, jamás decorativo */
--white:  #FFFFFF;  /* cards y barras sticky */
/* Pasteles de colección (chips de color de producto) */
--granito-negro: #2B2B28; --granito-sage: #B7C4B1;
--granito-crema: #E8DFCE; --granito-terracota: #C97B5A;
```

- **Tipografía** (`next/font/google`): display = **Fraunces** (pesos 500/600),
  texto/UI = **Inter** (400/500/600). Nada más.
- **Escala tipográfica única**: 12 / 14 / 16 / 20 / 28 / 40–56 px (el último con
  `clamp()` para h1). Prohibido cualquier tamaño intermedio.
- **Espaciado**: escala Tailwind 4/8; secciones `py-16` móvil, `py-24` desktop.
- **Radios**: cards 12–16px, pills `rounded-full`, marcos de media 14–16px.
- **Sombras**: ninguna decorativa; solo la barra sticky puede tener una sutil.
- **Tema por vertical**: atributo `data-theme="cocina" | "bienestar"` en el layout
  de cada vertical; define `--accent` (clay o moss). Los componentes usan
  `var(--accent)`, nunca clay/moss directo.

### 2.2 Patrones robados de los referentes (aprobados)

| Referente | Patrón a implementar | Dónde |
|---|---|---|
| **Our Place** | Fila horizontal de "video stories": chips verticales 64×88 rounded-14 con poster, label debajo, scroll horizontal; al tocar reproduce inline y dispara evento `video_interest` | Home, arriba del H1, usando los MP4 existentes de `public/media` |
| **Le Creuset** | "Elige tu granito": selector de chips de color circulares (28px, ring de acento en el activo, nombre del color al lado) que cambia la foto/variante del set destacado. Vende colección → recompra | Home cocina + ficha de producto (si el producto tiene variantes de color) |
| **Caraway** | Orden ultra-limpio: comprar por categoría en tiles 2×2 (`--shell` bg, icono + label), specs de producto en tabla bordeada de filas, una sola jerarquía | Home (categorías) + ficha (tabla specs) |
| **Material Kitchen** | "El material, de cerca": strip de 3 fotos macro cuadradas (granito antiadherente / base inducción / mango soft-touch) con caption pequeño | Ficha de producto y landing de campaña |
| **Propio (ningún referente lo tiene)** | Barra inferior sticky SIEMPRE con precio + botón verde "Pedir por WhatsApp" — el checkout es la conversación | Todas las páginas de producto/campaña; home lleva "Asesoría por WhatsApp" |

### 2.3 Maquetas aprobadas, descritas en texto (replicar fielmente)

**HOME COCINA (móvil 390px, de arriba a abajo):**
1. Promo bar: fondo `--ink`, texto `--ivory` 11px centrado, 1 línea ("Envío gratis a todo Ecuador").
2. Header: logo texto en Fraunces ("Eter Niu" en ink + "Cocina" en acento) izquierda; ícono bolsa/menú derecha. Border-bottom `--sand`.
3. Video stories (patrón Our Place) — ver 2.2.
4. H1 Fraunces 40px line-height 1.15 ("Cocina sano, sin esfuerzo") + subcopy Inter 14px `--stone` (máx 2 líneas).
5. Sección "Elige tu granito" (patrón Le Creuset): eyebrow uppercase 11px tracking ancho en acento; chips de color; card del producto destacado (fondo blanco, borde `--sand`, radius 16, foto 76px izquierda, título 14 medium, sub 11 stone, precio en acento con tachado).
6. "Comprar por categoría" (patrón Caraway): eyebrow 11px stone; grid 2×2 tiles `--shell` radius 14 con ícono + label (Ollas, Sartenes, Woks, Cuchillos).
7. Secciones existentes que se conservan re-estilizadas: quiz recomendador, videos demo, club/lead magnet (mismo orden narrativo actual).
8. Barra sticky inferior: fondo blanco, border-top `--sand`, pill verde WhatsApp centrada ("Asesoría por WhatsApp").

**FICHA DE PRODUCTO (móvil):**
1. Mini-header: flecha atrás · nombre corto uppercase 11px · compartir.
2. Galería 4:5 radius 16 con dots de posición.
3. Título Fraunces 28 + fila de 5 estrellas en acento + texto "Clientes reales por WhatsApp" 11px.
4. Descripción 13px stone (2–3 líneas).
5. "El material, de cerca" (patrón Material): 3 tiles macro cuadrados con caption 10px.
6. Tabla de specs (patrón Caraway): card blanca bordeada, filas label/valor 12px separadas por `--sand` (Diámetro, Cocinas, Garantía…).
7. Barra sticky: precio izquierda (label "Hoy" 11px + precio 16 medium) + botón WhatsApp verde pill que ocupa el resto.

**LANDING DE CAMPAÑA (móvil) — la página más importante:**
1. Promo bar (igual a home, con texto de envío/pago contra entrega).
2. Header mínimo.
3. Hero de video 9:16 radius 14 con pill "−40% hoy" en acento (esquina sup. izq.)
   y pill blanca "Ver en uso" con ícono play (inf. der.).
4. Eyebrow uppercase 11px acento ("Cuchillo Samurai · todo uso") → H1 Fraunces
   clamp(28,8vw,40) ("Un solo cuchillo para toda tu cocina") → subcopy 14 stone.
5. Fila de precio: tachado 15 stone + precio 26 medium acento + nota "stock por WhatsApp" 12 stone.
6. Trust grid 3 columnas entre divisores `--sand`: ícono + caption 10.5px
   (camión "Envío gratis Servientrega" / efectivo "Pagas al recibir" / escudo "Garantía 6 meses").
7. Galería de 3 fotos cuadradas radius 10.
8. FAQ breve (conservar contenido actual).
9. Barra sticky de precio + WhatsApp (igual a ficha).

## 3. Especificación de componentes (`apps/storefront/app/components/ui/`)

Crear estos archivos. Server components salvo donde se indique. Tipar props.

| Archivo | Props | Comportamiento |
|---|---|---|
| `button.tsx` | `variant: "primary"\|"secondary"\|"whatsapp"`, `href?`, `onClick?`, `children` | primary = fondo `var(--accent)` texto ivory pill; secondary = borde ink transparente; whatsapp = fondo `--wa` texto blanco pill con ícono; si es WhatsApp DEBE renderizar `TrackedWhatsAppLink` por dentro |
| `section.tsx` + `section-head.tsx` | `eyebrow?`, `title?`, `children` | wrapper `px-4 py-16 md:py-24 max-w-5xl mx-auto`; head = eyebrow uppercase 11px acento + h2 Fraunces 28 |
| `product-card.tsx` | `product` (title, subtitle, price, originalPrice, image, href, badge?) | card blanca borde sand radius 16; foto next/image 4:5 o 1:1; precio en `var(--accent)`; reemplaza `.product-card` y `.wellness-product-card` |
| `price-tag.tsx` | `price`, `originalPrice?`, `note?` | tachado stone + precio acento + nota 12px |
| `badge.tsx` | `tone: "accent"\|"neutral"`, `children` | pill 11px |
| `photo.tsx` | wrapper de `next/image` | `sizes` correcto, radius 14, placeholder fondo `--sand` |
| `video-frame.tsx` (client) | `src`, `poster`, `ratio: "9/16"\|"16/9"`, `label?` | poster + play; carga el `<video>` solo al entrar al viewport (IntersectionObserver) o al tocar; dispara `video_interest` vía helper de analytics |
| `video-stories.tsx` (client) | `items: {src, poster, label}[]` | patrón Our Place (2.2); scroll-x con `snap` |
| `color-picker.tsx` (client) | `colors: {name, hex}[]`, `value`, `onChange` | patrón Le Creuset; chip activo con ring `var(--accent)` |
| `spec-table.tsx` | `rows: {label, value}[]` | patrón Caraway |
| `material-macro.tsx` | `items: {image, caption}[]` | patrón Material Kitchen, grid 3 |
| `sticky-cta-bar.tsx` (client) | `price?`, `waHref`, `waLabel` | barra inferior fija (aparece tras ~300px de scroll en home; siempre visible en ficha/campaña); reemplaza `floating-whatsapp-cta.tsx` y el sticky actual de campañas |
| `promo-bar.tsx`, `site-header.tsx`, `site-footer.tsx` | por vertical via `data-theme` | header con logo Fraunces |
| `form-field.tsx` | `label`, `input props` | inputs 44px touch-friendly, focus ring acento; lo consumen quiz y lead form |

Página de revisión: `app/dev/ui/page.tsx` con TODOS los componentes en ambos
themes, `robots: noindex`. Es el criterio de aceptación visual del Sprint A.

## 4. Sprints (orden estricto, cada uno sale a producción)

### Sprint A — Fundación (WFND)

**WFND-1 · Tailwind v4 + tokens** — `cd apps/storefront && npm install tailwindcss @tailwindcss/postcss postcss`.
Crear `postcss.config.mjs` (`plugins: { "@tailwindcss/postcss": {} }`) y
`app/theme.css` con `@import "tailwindcss";` + bloque `@theme` con los tokens 2.1
(`--color-ivory`, `--color-ink`, `--color-stone`, `--color-sand`, `--color-shell`,
`--color-clay`, `--color-moss`, `--color-wa`, `--font-display`, `--font-sans`) y
los overrides `[data-theme="cocina"] { --accent: var(--color-clay) }` /
`[data-theme="bienestar"] { --accent: var(--color-moss) }`. Importar `theme.css`
en `app/layout.tsx` SIN quitar todavía `globals.css` (conviven hasta WCLN-1).
CA: `npm run build` pasa; una clase Tailwind de prueba renderiza.

**WFND-2 · next/font** — En `app/layout.tsx`: `Fraunces({ subsets:["latin"], weight:["500","600"], variable:"--font-fraunces" })`
e `Inter({ subsets:["latin"], variable:"--font-inter" })`; conectar las variables
en `@theme` (`--font-display: var(--font-fraunces)…`). Eliminar font-families
muertas. CA: en DevTools la h1 computa Fraunces.

**WFND-3 · Librería UI** — Implementar TODOS los componentes de la sección 3 +
`app/dev/ui/page.tsx`. CA: `/dev/ui` muestra ambos themes correctos a 390px y
1280px; cero estilos inline de color en los componentes.

**WFND-4 · next/image** — Componente `photo.tsx`; auditar tamaños reales de
`public/media/*.jpg` (script rápido con `sips -g pixelWidth -g pixelHeight`).
CA: `next/image` no emite warnings de dimensiones en build.

### Sprint B — Donde aterriza el dinero (WCMP + WPRD)

**WCMP-1 · `app/campanas/[slug]/page.tsx`** — Reescribir presentación con el
layout 2.3-"LANDING". Mantener INTACTOS: lectura de query params/SKU, datos de
campaña, `TrackedWhatsAppLink`, eventos, textos comerciales actuales (precios,
cupones). Sustituir el sticky actual por `sticky-cta-bar`.
CA: a 390px no hay scroll horizontal; todos los CTAs disparan su evento (verificar
en Network → `/api/events`); el video no se descarga hasta interacción/viewport.

**WCMP-2 · `app/bienestar/campanas/[slug]/page.tsx`** — Mismo template con
`data-theme="bienestar"`. CA: cero clases `.wellness-*` en el árbol de esta página;
acento moss en precio/eyebrow.

**WCMP-3 · Regresión** — `node scripts/validate-meta-whatsapp-flow.mjs` y
`node scripts/campaign-readiness-report.mjs` en verde; click manual de cada wa.me.

**WPRD-1 · `app/products/[slug]/page.tsx`** — Layout 2.3-"FICHA" con
`spec-table`, `material-macro` (usar fotos macro existentes o recortes de las
actuales como interim), galería con `photo.tsx`, `sticky-cta-bar`. Si el producto
tiene variantes de color en metadata → `color-picker`.

### Sprint C — Marca (WHOM)

**WHOM-1 · Home cocina `app/page.tsx`** — Layout 2.3-"HOME". Los MP4 existentes
van en `video-stories` (generar posters si faltan: frame con ffmpeg). Quiz y club
form conservan lógica, re-estilizados con `form-field`. Densidad: máx una idea
por sección, eliminar gradientes radiales.
**WHOM-2 · Home bienestar `app/bienestar/page.tsx`** — Mismo sistema,
`data-theme="bienestar"`; eliminar todas las clases `.wellness-*` restantes.
**WHOM-3 · `app/guias/*`** — Layout de lectura: ancho `max-w-[65ch]`, Fraunces
en títulos, sin cards.

### Sprint D — Limpieza (WCLN)

**WCLN-1 · Borrar legado** — Cuando ninguna página importe clases de
`globals.css`: vaciarlo dejando solo reset mínimo (o borrarlo y mover el reset a
`theme.css`). Borrar `floating-whatsapp-cta.tsx` si ya nadie lo usa.
CA: `grep -r "wellness-product-card\|social-hero\|promo-bar" app/` sin resultados
en TSX (las clases viejas ya no se referencian).
**WCLN-2 · Performance** — Lighthouse móvil en `/` y una campaña: ≥ 90
performance (medir línea base ANTES del sprint A para comparar). Quick wins:
posters de video, `priority` solo en hero image, fonts `display: swap`.
**WCLN-3 · QA visual** — Pasada a 390/768/1280 de TODAS las rutas
(`/`, `/bienestar`, `/campanas/[slug]` ×2, `/products/[slug]`, `/guias`,
`/bienestar/campanas/[slug]`); capturas en `reports/redesign-qa/`.

## 5. Flujo de trabajo para el agente ejecutor

1. Trabajar en rama `release` (o feature branch + merge a release si el cambio es grande).
2. Por historia: implementar → `cd apps/storefront && npm run build` →
   verificación de la historia → commit con mensaje claro → siguiente.
3. Antes de cualquier push: correr WCMP-3 (regresión de campañas) si se tocó
   una página con CTAs.
4. NUNCA modificar: `middleware.ts` (hosts), `/api/events`, `analytics.tsx`
   (solo consumirlo), `feeds/`, `lib/whatsapp.ts` (solo consumirlo), textos de
   precios/cupones sin orden del dueño.
5. Si una decisión visual no está en este doc: elegir la opción más sobria
   (menos color, más aire) y anotarla en la sección 7.

## 6. Definición de éxito

- El dueño abre la campaña del cuchillo en su celular junto a la versión vieja
  y la diferencia se siente sin explicación.
- Lighthouse móvil ≥ 90 en home y campaña.
- Cero regresiones de tracking (eventos `/api/events` y pixel idénticos a antes).
- Un solo sistema: cambiar el acento de un vertical = editar 1 línea de CSS.

## 7. Registro de decisiones tomadas durante la ejecución

*(El agente ejecutor anota aquí cualquier decisión no cubierta por el plan.)*

- —

## 8. Pendientes del dueño (no bloquean Sprint A)

- [ ] Confirmar si el granito tiene variantes de color reales (afecta `color-picker`; si no, el patrón Le Creuset se aplica solo como narrativa de colección en fotos).
- [ ] Fotos macro de materiales (interim: recortes de las fotos actuales).
- [ ] Logo: ¿se mantiene texto "Eter Niu Cocina/Bienestar" en Fraunces o hay isotipo?
