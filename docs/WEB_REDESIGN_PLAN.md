# Plan de rediseño del storefront — premium editorial

> Junio 2026. Decisiones del dueño: estilo **premium editorial** (referencia
> Our Place / Caraway), **rebuild con sistema nuevo**, dolor principal:
> "se ve amateur/desordenada". Aplica a las dos líneas: cocina y bienestar.

## 1. Diagnóstico (por qué se ve amateur)

Auditoría del código actual (`apps/storefront`):

| Problema | Evidencia | Impacto visual |
|---|---|---|
| CSS monolítico sin sistema | `app/globals.css` de 62 KB / ~3.700 líneas, clases ad-hoc | Inconsistencia general |
| **Cero media queries** | 0 resultados de `@media` en globals.css; grids fijos de 3–4 columnas | **Roto en móvil — y el tráfico de Meta/WhatsApp es móvil** |
| Jerarquía tipográfica caótica | font-weights 750/760/780/800/850/900/950; h2 en 2.15/2.2/2.35/2.45rem | Densidad y desorden = sensación amateur |
| Fuentes no cargadas | "Plus Jakarta Sans" declarada pero sin `next/font`: el usuario ve la fuente del sistema | La web nunca se ve como fue diseñada |
| Imágenes sin optimizar | `<img>` directo, sin `next/image`, sin srcset, sin lazy | Lento y fotos deformadas |
| 16 tokens de color + gradientes hardcodeados | `--mint`, `--peach`, `--blue` casi sin uso; radiales en cada sección | Ruido visual |
| Componentes duplicados | `.product-card` vs `.wellness-product-card` casi idénticas; badges/buttons repetidos | Cada vertical envejece distinto |

Lo que sí se conserva: la narrativa de las páginas funciona (promo bar → hero
con video → prueba social → producto → CTA WhatsApp), el tracking
(`TrackedWhatsAppLink`, MetaPixel, `/api/events`), el routing por dominio
(`middleware.ts`) y los feeds Meta. **El rediseño cambia la piel, no el esqueleto
comercial.**

## 2. Dirección de diseño

### Principios (anti-amateur)

1. **Una sola jerarquía**: escala tipográfica fija de 6 tamaños, 3 pesos. Nada fuera de escala.
2. **Aire**: el espacio en blanco es el lujo. Densidad actual ÷ 2; una idea por sección.
3. **Paleta corta**: 5 colores funcionales + 1 acento por vertical. Fuera gradientes decorativos.
4. **Foto primero**: la foto del producto manda; la UI se hace invisible (fondos planos, sombras mínimas).
5. **Móvil primero**: cada sección se diseña a 390 px y se expande a desktop, no al revés.

### Tokens (Tailwind theme)

```
Colores
  base:    ivory #FAF7F2 (fondo) · ink #1A1A18 (texto) · stone #6B6B66 (muted)
  línea:   sand #E8E2D8 (bordes/divisores)
  acento cocina:    clay #C4502A (terracota, solo CTAs y precio)
  acento bienestar: moss #2F5D43 (verde profundo, solo CTAs y precio)
  whatsapp: #25D366 (solo botones de WhatsApp, nunca decorativo)

Tipografía (next/font, self-hosted)
  Display: Fraunces (serif con carácter, 600) — h1/h2
  Texto:   Inter (400/500/600) — body, UI, precios
  Escala:  12 / 14 / 16 / 20 / 28 / 40-56(clamp) — nada intermedio

Espaciado: escala 4/8 de Tailwind; secciones py-16 (móvil) / py-24 (desktop)
Radios: 12px cards, full pills · Sombra: una sola, sutil, solo en elementos flotantes
```

Cada vertical es un **theme** (`data-theme="cocina" | "bienestar"`) que solo
cambia el color de acento: mismos componentes, misma calidad.

### Stack

- **Tailwind CSS v4** (tokens en `@theme`), sin librería de componentes externa —
  la UI propia es chica (≈12 componentes) y el control total mantiene el look editorial.
- **next/font** (Fraunces + Inter) y **next/image** en todas las fotos.
- Videos: poster + carga perezosa (IntersectionObserver), nunca autoplay con sonido.

## 3. Sistema de componentes

Nuevo `apps/storefront/app/components/ui/` (reemplaza las funciones inline de
`page.tsx` y las clases `.wellness-*` duplicadas):

| Componente | Reemplaza | Notas |
|---|---|---|
| `Button` (primary/secondary/whatsapp) | CTAs ad-hoc, `.hero-cta` | Variante whatsapp envuelve `TrackedWhatsAppLink` existente |
| `ProductCard` | `.product-card` + `.wellness-product-card` | Foto 4:5, precio con acento del theme, un solo badge |
| `Section` + `SectionHead` | `.section-head` y wrappers | Controla ritmo vertical y ancho máximo |
| `Badge` | `.commerce-badges` y variantes | Una sola versión |
| `PriceTag` | precios sueltos | Original tachado + actual en acento |
| `VideoFrame` | `.video-slot` | Poster + lazy, ratio 9:16 o 16:9 |
| `FormField` | inputs duplicados de quiz y club | Quiz y lead form los consumen |
| `StickyCtaBar` | sticky CTA de campañas + floating WhatsApp | Una sola barra móvil inferior |
| `PromoBar`, `Header`, `Footer` | topbar/promo actuales | Compartidos entre verticales con theme |

Se conservan tal cual (solo re-estilizados): `analytics.tsx`,
`lead-capture-form.tsx` (lógica), `pot-recommendation-quiz.tsx` (lógica),
`middleware.ts`, feeds y `/api/events`.

## 4. Backlog

Prioridad: P1 = donde aterriza el tráfico pagado · Esfuerzo: S < 1 día, M 1–3 días, L ~1 semana.

### EPIC WFND — Fundación del sistema — P1

| ID | Historia | Esf. | Detalle |
|---|---|---|---|
| WFND-1 | Tailwind v4 + tokens | S | Instalar Tailwind, definir `@theme` con los tokens de la sección 2, themes por vertical via `data-theme`. Convive con `globals.css` durante la migración. |
| WFND-2 | next/font | S | Fraunces + Inter en `layout.tsx`; eliminar declaraciones de fuentes muertas. |
| WFND-3 | Librería UI | M | Los 12 componentes de la sección 3 con Tailwind, móvil primero. Página interna `/dev/ui` (noindex) para verlos todos juntos. |
| WFND-4 | next/image | S | Wrapper `Photo` con sizes correctos; auditar dimensiones de `/public/media`. |

### EPIC WCMP — Landings de campaña — P1 (la plata aterriza aquí)

| ID | Historia | Esf. | Detalle |
|---|---|---|---|
| WCMP-1 | Rediseño `campanas/[slug]` | L | Layout editorial: hero limpio (video + titular Fraunces + precio), 3 pruebas de confianza, galería, FAQ, `StickyCtaBar` móvil. Conservar query params, SKU variants y todos los eventos de tracking. |
| WCMP-2 | Rediseño `bienestar/campanas/[slug]` | M | Mismo template con `data-theme="bienestar"` — aquí se valida que el sistema de themes funciona. |
| WCMP-3 | Regresión de campañas | S | Correr `scripts/validate-meta-whatsapp-flow.mjs` y `campaign-readiness-report.mjs`; verificar wa.me links, pixel y CAPI intactos. |

### EPIC WPRD — Fichas de producto — P1

| ID | Historia | Esf. | Detalle |
|---|---|---|---|
| WPRD-1 | Rediseño `products/[slug]` | M | Galería next/image, specs en tabla limpia, `PriceTag`, CTA WhatsApp prominente, recomendados con `ProductCard`. |

### EPIC WHOM — Homes — P2

| ID | Historia | Esf. | Detalle |
|---|---|---|---|
| WHOM-1 | Home cocina (`/`) | L | Misma narrativa (promo → hero → quiz → videos → productos → club) con la mitad de densidad: hero a una idea, secciones con aire, quiz y club form re-estilizados con `FormField`. |
| WHOM-2 | Home bienestar (`/bienestar`) | M | Mismo sistema, theme bienestar; eliminar todas las clases `.wellness-*`. |
| WHOM-3 | Guías (`/guias`) | S | Layout de lectura editorial (ancho de texto ~65ch). |

### EPIC WCLN — Limpieza y performance — P2

| ID | Historia | Esf. | Detalle |
|---|---|---|---|
| WCLN-1 | Borrar `globals.css` legado | S | Al migrar la última página: de 62 KB a solo Tailwind. |
| WCLN-2 | Lighthouse móvil ≥ 90 | M | Lazy de videos, dimensiones de imágenes, eliminar JS muerto. Medir antes/después. |
| WCLN-3 | QA visual móvil | S | Pasada completa a 390 px y 768 px de todas las rutas; capturas guardadas en `reports/`. |

## 5. Orden de ejecución

1. **Sprint A — Fundación**: WFND-1..4 (el sistema completo, visible en `/dev/ui`).
2. **Sprint B — Dinero**: WCMP-1..3 + WPRD-1 (todo el tráfico pagado ve la web nueva).
3. **Sprint C — Marca**: WHOM-1..3.
4. **Sprint D — Limpieza**: WCLN-1..3.

Migración página por página: cada sprint sale a producción sin esperar al
siguiente; `globals.css` convive hasta WCLN-1. **Regla**: ningún cambio toca
tracking, feeds, middleware ni URLs — solo presentación.

## 6. Verificación

- Por página migrada: vista a 390/768/1280 px, `npm run build` del storefront,
  clic real en cada CTA de WhatsApp (evento en `/api/events` + wa.me correcto).
- Tras WCMP: `node scripts/validate-meta-whatsapp-flow.mjs` en verde.
- Tras WCLN-2: Lighthouse móvil ≥ 90 en home y una campaña (hoy: medir línea base primero).
- Criterio de éxito del dueño: poner la campaña del cuchillo nueva al lado de la
  vieja en el celular y que la diferencia se sienta sin explicación.

## 7. Inputs pendientes del dueño

- [ ] Visto bueno a paleta y tipografías (puedo armar una maqueta visual de la landing del cuchillo antes de tocar código).
- [ ] Confirmar si el logo actual (icono olla + texto) se mantiene o se retoca.
- [ ] Fotos: las actuales sirven para el estilo editorial; si hay presupuesto, 3–5 fotos lifestyle nuevas por línea elevarían todo.
