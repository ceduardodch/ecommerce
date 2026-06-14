# WEB-DESIGN: Carrito WhatsApp Híbrido + Desktop Equilibrado

> ⚠️ **Hallazgo de auditoría independiente (2026-06-13)** — verificado contra el
> sitio levantado, no contra los mensajes de commit:
>
> Los componentes de CART y DESKTOP **se construyeron pero NO se cablearon**.
> Existen, compilan y los archivos protegidos están intactos, pero son
> **componentes huérfanos**: ninguna página real los usa. Resultado verificado:
> - **El carrito es inaccesible para el usuario** (confirmado: las dos quejas del
>   dueño son CORRECTAS). 3 eslabones rotos — ver Sprint 5.
> - **Desktop se ve angosto** porque RSP-3 (grid 4 col) nunca entró en cocina y
>   el footer/badge están huérfanos.
>
> El trabajo restante es **integración (cableado)**, no construcción. Detalle y
> verdad por historia en "Estado real por historia" (abajo) y el plan en
> **Sprint 5 — INTEG**. Los 7 commits RSP/DTP están en local SIN pushear; no
> rompen nada, pero la épica no está "lista" hasta cablear.

## Contexto

El storefront de Eter Niu está optimizado para móvil (~80% tráfico) pero tiene problemas en desktop:

1. **Sin carrito funcional** - Solo compras unitarias vía WhatsApp
2. **Desktop se ve mal** - Layouts rígidos, espacio desaprovechado
3. **Experiencia inconsistente** - Mobile-first pero sin estrategia desktop

**Objetivo:** Carrito WhatsApp híbrido + diseño responsive equilibrado.

## Estrategia

**Carrito Híbrido:** Persistencia local (localStorage) + checkout WhatsApp multi-producto

**No** es un carrito tradicional con pasarela de pago. Es un carrito que finaliza en WhatsApp con un mensaje resumen.

---

## Sprint 1: MVP Carrito (CART-1..5)

**Objetivo:** Carrito funcional end-to-end con persistencia local y checkout WhatsApp.

### CART-1: CartContext + localStorage

**Priority:** P0 (Bloqueante)

**Story:** Como usuario quiero que mi carrito persista entre recargas de página para no perder productos al navegar.

**Acceptance Criteria:**
- CartContext inicializado con localStorage
- `addItem(product, quantity)` funciona
- `removeItem(productId)` funciona
- `updateQuantity(productId, quantity)` funciona
- `totalItems` calculado correctamente
- `totalAmount` calculado correctamente
- Carrito survives page reload

**Estimate:** 4h

**Dependencies:** Ninguna

**Archivos:**
- `/apps/storefront/contexts/CartContext.tsx` (nuevo)
- `/apps/storefront/app/layout.tsx` (modificar - proveer CartContext)

---

### CART-2: AddToCartButton Component

**Priority:** P0

**Story:** Como usuario quiero agregar productos desde cards y detail pages.

**Acceptance Criteria:**
- Botón reutilizable en ProductCard y ProductPage
- Click agrega producto al carrito
- Tracking event `add_to_cart` → "Lead"
- Visual feedback (toast o micro-interacción)
- Funciona en mobile y desktop

**Estimate:** 3h

**Dependencies:** CART-1

**Archivos:**
- `/apps/storefront/app/components/ui/add-to-cart-button.tsx` (nuevo)
- `/apps/storefront/app/components/ui/product-card.tsx` (modificar - añadir botón)

---

### CART-3: CartDrawer Mobile

**Priority:** P0

**Story:** Como usuario mobile quiero ver mi carrito en un drawer sin salir de la página.

**Acceptance Criteria:**
- Drawer desde bottom (mobile pattern)
- Lista de items con quantity controls (+/-)
- Remover item funciona
- Resumen de total visible
- Button "Finalizar pedido por WhatsApp"
- Close swipe down o click backdrop

**Estimate:** 6h

**Dependencies:** CART-1, CART-2

**Archivos:**
- `/apps/storefront/app/components/cart/cart-drawer.tsx` (nuevo)
- `/apps/storefront/app/components/cart/cart-item.tsx` (nuevo)
- `/apps/storefront/app/components/cart/cart-summary.tsx` (nuevo)

---

### CART-4: /cart Route Page

**Priority:** P1

**Story:** Como usuario quiero una página dedicada de carrito (desktop).

**Acceptance Criteria:**
- `/cart` route funcional
- Tabla de items (desktop) o lista (mobile)
- Form checkout simple (nombre, ciudad)
- Button WhatsApp con resumen
- Breadcrumbs "Home > Carrito"

**Estimate:** 5h

**Dependencies:** CART-1

**Archivos:**
- `/apps/storefront/app/cart/page.tsx` (nuevo)

---

### CART-5: Checkout WhatsApp Integration

**Priority:** P0

**Story:** Como usuario quiero finalizar mi pedido con un mensaje WhatsApp generado automáticamente.

**Acceptance Criteria:**
- `generateWhatsAppMessage()` formatea correctamente
- Incluye: lista items (1x Producto A - $XX), total, cupón, pregunta stock
- Link `wa.me` abre WhatsApp con mensaje prellenado
- Tracking event `InitiateCheckout`
- Session ID único para tracking

**Estimate:** 4h

**Dependencies:** CART-1, CART-4

**Archivos:**
- `/apps/storefront/contexts/CartContext.tsx` (modificar - añadir generateWhatsAppMessage)
- `/apps/storefront/lib/whatsapp.ts` (modificar - añadir generateCartMessage)
- `/apps/storefront/app/components/cart/checkout-button.tsx` (nuevo)

---

## Sprint 2: Responsive Foundation (RSP-1..4)

**Objetivo:** Añadir breakpoints lg/xl para desktop sin romper mobile.

### RSP-1: Add lg:/xl: Breakpoints to theme.css

**Priority:** P0

**Story:** Como desarrollador quiero breakpoints lg/xl para desktop layouts.

**Acceptance Criteria:**
- `theme.css` con `--breakpoint-lg: 1024px`
- `theme.css` con `--breakpoint-xl: 1280px`
- NO romper existing sm/md breakpoints
- Homepage render igual en mobile/tablet

**Estimate:** 2h

**Dependencies:** Ninguna

**Archivos:**
- `/apps/storefront/app/theme.css` (modificar)

---

### RSP-2: Container max-w Progressive

**Priority:** P0

**Story:** Como usuario desktop quiero containers que aprovechen el espacio.

**Acceptance Criteria:**
- Containers progresivos: `max-w-2xl` (mobile) → `md:max-w-4xl` → `lg:max-w-6xl` → `xl:max-w-7xl`
- NO cortar contenido en desktop 1440px
- Mobile/tablet intactos

**Estimate:** 3h

**Dependencies:** RSP-1

**Archivos:**
- `/apps/storefront/app/page.tsx` (modificar - home cocina)
- `/apps/storefront/app/bienestar/page.tsx` (modificar - home bienestar)

---

### RSP-3: ProductCard grid-cols-4 Desktop

**Priority:** P0

**Story:** Como usuario desktop quiero ver 4 productos por fila para aprovechar espacio.

**Acceptance Criteria:**
- Grid progressive: `grid-cols-2` → `md:grid-cols-3` → `lg:grid-cols-4`
- Mobile intacto (2 cols)
- Tablet 3 cols
- Desktop 4 cols
- No layout shifts

**Estimate:** 2h

**Dependencies:** RSP-1

**Archivos:**
- `/apps/storefront/app/page.tsx` (modificar - grid productos)
- `/apps/storefront/app/bienestar/page.tsx` (modificar - grid productos)

---

### RSP-4: Header Nav Links Desktop-Only

**Priority:** P1

**Story:** Como usuario desktop quiero navegación principal en el header.

**Acceptance Criteria:**
- Links "Productos", "Guías", "Marca" en header
- Desktop-only (`hidden lg:flex`)
- Mobile: header unchanged
- Cart badge visible siempre
- MANTENER compact mode para product pages

**Estimate:** 3h

**Dependencies:** RSP-1

**Archivos:**
- `/apps/storefront/app/components/ui/site-header.tsx` (modificar - añadir nav desktop)
- `/apps/storefront/app/components/ui/cart-badge.tsx` (nuevo)

---

## Sprint 3: Desktop Experience (DTP-1..4)

**Objetivo:** Pulir experiencia desktop con componentes específicos.

### DTP-1: CartModal Desktop

**Priority:** P1

**Story:** Como usuario desktop quiero un modal centrado (no drawer).

**Acceptance Criteria:**
- Modal centrado horizontalmente
- Backdrop blur
- Close on ESC y backdrop click
- Diferente layout vs mobile drawer
- Funciona en desktop (>1024px)

**Estimate:** 4h

**Dependencies:** CART-3

**Archivos:**
- `/apps/storefront/app/components/cart/cart-modal.tsx` (nuevo)

---

### DTP-2: Breadcrumbs Desktop

**Priority:** P2

**Story:** Como usuario desktop quiero breadcrumbs para navegar.

**Acceptance Criteria:**
- Breadcrumbs "Home > Cocina > Ollas"
- Desktop-only (`hidden lg:block`)
- Links funcionales
- Micro texto (12-14px)
- Color #6B6B66 (gris suave)

**Estimate:** 2h

**Dependencies:** RSP-1

**Archivos:**
- `/apps/storefront/app/components/ui/breadcrumbs.tsx` (nuevo)
- `/apps/storefront/app/products/[slug]/page.tsx` (modificar - añadir breadcrumbs)

---

### DTP-3: Footer Desktop con Links

**Priority:** P2

**Story:** Como usuario desktop quiero navegación completa en footer.

**Acceptance Criteria:**
- 4 columnas: Productos, Guías, Marca, Contacto
- Links internos funcionando
- Instagram embed social proof
- Newsletter signup (opcional)
- Desktop-only mejorado

**Estimate:** 3h

**Dependencies:** RSP-1

**Archivos:**
- `/apps/storefront/app/components/ui/site-footer.tsx` (modificar - añadir columnas desktop)

---

### DTP-4: Newsletter Signup Desktop

**Priority:** P3

**Story:** como usuario desktop quiero suscribirme a newsletter.

**Acceptance Criteria:**
- Input email + button "Suscribir"
- Desktop-only en footer
- Validation email format
- Success message

**Estimate:** 2h

**Dependencies:** DTP-3

**Archivos:**
- `/apps/storefront/app/components/ui/newsletter-signup.tsx` (nuevo)

---

## Sprint 5: INTEG — Cableado de componentes huérfanos (P0)

**Objetivo:** Conectar los componentes ya construidos a las páginas reales para
que el carrito SEA usable y el desktop SE VEA bien. **No se construye nada nuevo
de cero** — se enchufa lo que existe. Estimado total ~1 día de ejecutor.

> Origen: auditoría independiente 2026-06-13 (las dos quejas del dueño
> confirmadas). El verificador re-auditará este sprint antes del push.

### INTEG-1: Montar el carrito y su trigger (P0 — desbloquea TODO el carrito)
**Problema verificado:** `CartDrawer`/`CartModal` no los monta nadie; no hay
estado `isOpen` ni botón para abrir el carrito.
**Acceptance:**
- Estado global de apertura del carrito (extender `CartContext` con `isOpen`/`openCart`/`closeCart`, o un `CartUI` provider en el layout).
- El ícono de bolsa del header abre el drawer (mobile) / modal (desktop) en vez de enlazar a `/productos`.
- `CartDrawer` montado para `<lg`, `CartModal` para `≥lg` (responsive, ya construidos ambos).
- CA: en móvil y desktop, click en la bolsa abre el carrito y muestra los items.
**Archivos:** `site-header.tsx`, `contexts/CartContext.tsx`, `app/layout.tsx`.

### INTEG-2: AddToCartButton en las páginas de producto reales (P0)
**Problema verificado:** el `ProductCard` compartido (con `AddToCartButton`) no
se usa en `/` ni `/bienestar`; el home tiene un `ProductCard` local solo-WhatsApp.
**Acceptance:**
- En desktop (`hidden lg:block`) cada producto del home y de la ficha muestra `AddToCartButton`; en mobile se mantiene `TrackedWhatsAppLink` (coexistencia del plan, riesgo #3).
- Decidir: reusar el `ProductCard` compartido en `app/page.tsx`/`bienestar` o añadir el botón a la card local. Lo más sobrio sin romper el diseño actual.
- CA: un usuario en desktop puede agregar un producto y el contador del carrito sube.
**Archivos:** `app/page.tsx`, `app/bienestar/page.tsx` (y/o `product-card.tsx`).

### INTEG-3: CartBadge + enlace a /cart en el header (P0)
**Problema verificado:** `CartBadge` no está en el header; cero `href="/cart"` en todo el sitio.
**Acceptance:**
- `CartBadge` en el header conectado a `totalItems` del CartContext (header pasa a `"use client"` o se aísla el badge en un client component).
- Acceso a `/cart` desde el header y/o desde el botón "ver carrito" del drawer.
- CA: con items en el carrito, el badge muestra el número y `/cart` es alcanzable navegando.
**Archivos:** `site-header.tsx`, `cart-badge.tsx`.

### INTEG-4: RSP-3 — grid de productos 4 columnas en cocina (P0 desktop)
**Problema verificado:** `app/page.tsx` (cocina, el de más tráfico) no tiene
`lg:grid-cols-4` en productos; bienestar sí. Esto causa el "se ve angosto".
**Acceptance:**
- Grid de productos de cocina: `grid-cols-2 md:grid-cols-3 lg:grid-cols-4` (mobile intacto, sin layout shift).
- CA: a 1280px se ven 4 productos por fila sin franjas vacías.
**Archivos:** `app/page.tsx`.

### INTEG-5: Montar SiteFooter en páginas reales (P1)
**Problema verificado:** `SiteFooter` (4 col + newsletter) solo está en `/dev/ui`.
**Acceptance:**
- `SiteFooter` en home cocina, bienestar y guías (o en un layout compartido).
- CA: el footer de 4 columnas aparece al final de las páginas productivas.
**Archivos:** `app/layout.tsx` o páginas individuales.

### INTEG-6: QA en vivo a 390 / 768 / 1280 (P0, cierre)
- Levantar el sitio (`ALLOW_DEMO_CATALOG=true`), recorrer el flujo completo:
  agregar al carrito → abrir drawer/modal → ir a /cart → checkout WhatsApp con
  mensaje multi-producto correcto. Capturas en `reports/`.
- Verificación de tracking: `add_to_cart` y `InitiateCheckout` disparan (cubre
  PLN-2). El verificador re-audita antes del push.

**Dependencias:** INTEG-1..5 son mayormente independientes; INTEG-6 va al final.
**Nota:** PLN-1/PLN-3/PLN-4 (Safari, WhatsApp real, Lighthouse) siguen siendo del
dueño/manual tras el cableado.

---

## Sprint 4: Pulido & Testing (PLN-1..4)

**Objetivo:** Validar que todo funciona correctamente en producción.

### PLN-1: Cross-Browser Testing (Safari Desktop)

**Priority:** P0

**Story:** Como desarrollador quiero validar que funciona en Safari.

**Acceptance Criteria:**
- Test carrito en Safari desktop/macOS
- Test en Safari iOS mobile
- Test en Chrome desktop
- Test en Chrome Android
- No layout shifts en ningún browser

**Estimate:** 3h

**Dependencies:** CART-5, RSP-4

**Testing:** Manual

---

### PLN-2: Meta Pixel Events Validation

**Priority:** P0

**Story:** Como marketer quiero validar que todos los eventos se trackean.

**Acceptance Criteria:**
- `add_to_cart` tracked 100%
- `initiate_checkout` tracked 100%
- EventID único por evento
- Meta Pixel Helper extension confirma
- No eventos duplicados

**Estimate:** 2h

**Dependencies:** CART-2, CART-5

**Testing:** Meta Pixel Helper + Chrome DevTools

---

### PLN-3: WhatsApp Message Testing Multi-Product

**Priority:** P0

**Story:** Como usuario quiero que el mensaje de WhatsApp sea legible y completo.

**Acceptance Criteria:**
- Enviar mensaje de prueba a número real
- Formato legible (no código roto)
- Incluye todos los items del carrito
- Total calculado correctamente
- Cupón visible
- Vicky confirma formato correcto

**Estimate:** 2h

**Dependencies:** CART-5

**Testing:** Manual con WhatsApp real

---

### PLN-4: Performance Audit (Lighthouse 90+)

**Priority:** P0

**Story:** Como usuario quiero que el sitio cargue rápido.

**Acceptance Criteria:**
- Lighthouse Performance >90
- CLS (Cumulative Layout Shift) <0.1
- Time to Interactive <3s en 3G
- Images con sizes attribute correctos
- No layout shifts al cargar carrito

**Estimate:** 4h

**Dependencies:** CART-5, RSP-4

**Testing:** Lighthouse en Chrome DevTools

---

## Métricas de Éxito

**Técnicas:**
- Lighthouse Performance >90
- CLS <0.1
- Time to Interactive <3s en 3G
- Meta Pixel events 100% tracked

**Negocio:**
- Tasa conversión carrito → WhatsApp >60%
- Tamaño promedio carrito >1.5 productos
- Reducción tiempo checkout <30% vs flujo actual

**UX:**
- Mobile: 4/5 estrellas en test usabilidad
- Desktop: Time on site +20%
- Cart abandonment rate <40%

---

## Riesgos y Mitigación

### Riesgo #1: Layout Shifts en Mobile

**Causa:** Grid systems con `grid-cols-4` pueden colapsar en mobile

**Prevención:** Mobile-first siempre, especificar breakpoints ascendentes
```tsx
className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
```

### Riesgo #2: Meta Pixel Events Duplicados

**Prevención:** Mapear eventos nuevos a estándar de Meta
```typescript
add_to_cart       -> "Lead"
initiate_checkout -> "InitiateCheckout"
```

### Riesgo #3: Flujo WhatsApp Actual Roto

**Prevención:** NO reemplazar `TrackedWhatsAppLink`, COEXISTIR
```tsx
{/* Mobile: Botón directo WhatsApp (mantiene flujo actual) */}
<div className="lg:hidden">
  <TrackedWhatsAppLink product={product}>Pedir</TrackedWhatsAppLink>
</div>

{/* Desktop: Add to cart (nuevo flujo) */}
<div className="hidden lg:block">
  <AddToCartButton product={product} />
</div>
```

### Riesgo #4: localStorage Lento en Low-End

**Prevención:** `useState` + `useEffect` con inicialización lazy
```tsx
const [items, setItems] = useState<CartItem[]>([])
const [loaded, setLoaded] = useState(false)

useEffect(() => {
  const stored = localStorage.getItem('cart')
  if (stored) setItems(JSON.parse(stored))
  setLoaded(true)
}, [])
```

---

## Archivos Críticos

### Nuevos Componentes

```bash
# Context & State
/apps/storefront/contexts/CartContext.tsx                  # CART-1

# UI Components
/apps/storefront/app/components/ui/add-to-cart-button.tsx  # CART-2
/apps/storefront/app/components/ui/cart-badge.tsx           # DTP-1
/apps/storefront/app/components/cart/cart-drawer.tsx        # CART-3
/apps/storefront/app/components/cart/cart-modal.tsx         # DTP-1
/apps/storefront/app/components/cart/cart-item.tsx          # CART-3
/apps/storefront/app/components/cart/cart-summary.tsx      # CART-3
/apps/storefront/app/components/cart/checkout-button.tsx    # CART-5
/apps/storefront/app/components/ui/breadcrumbs.tsx         # DTP-2
/apps/storefront/app/components/ui/newsletter-signup.tsx  # DTP-4

# Pages
/apps/storefront/app/cart/page.tsx                          # CART-4
```

### Modificaciones a Componentes Existentes

**SiteHeader:**
- Añadir prop `cartItemCount?: number`
- Añadir `CartBadge` cuando >0
- Añadir desktop nav links (`hidden lg:flex`)
- MANTENER compact mode

**ProductCard:**
- Añadir `AddToCartButton` en desktop (`lg:block`)
- MANTENER `TrackedWhatsAppLink` en mobile
- MANTENER grid-cols-2 responsive

**StickyCTABar:**
- Añadir prop `cartTotal` para mostrar acumulado
- Añadir link a `/cart` cuando hay items
- MANTENER alwaysVisible logic

**lib/whatsapp.ts:**
- AÑADIR: `generateCartMessage(items, total, context)`
- MANTENER: `whatsappLink(product, context)` sin cambios

**theme.css:**
- Añadir `--breakpoint-lg: 1024px`
- Añadir `--breakpoint-xl: 1280px`

---

## Plan de Implementación

### Fase 1: Foundation (1-2 días)
1. RSP-1: Add lg/xl breakpoints
2. CART-1: CartContext skeleton
3. CART-2: AddToCartButton placeholder

### Fase 2: MVP Carrito (3-4 días)
4. CART-1 completo: localStorage persistence
5. CART-2 funcional: Integration + tracking
6. CART-3: CartDrawer mobile
7. CART-4: /cart page
8. CART-5: Checkout WhatsApp integration

### Fase 3: Responsive Desktop (2-3 días)
9. RSP-2: Container max-w progressive
10. RSP-3: ProductCard grid-cols-4
11. RSP-4: Header nav desktop
12. DTP-1: CartModal desktop

### Fase 4: Pulido (1-2 días)
13. DTP-2: Breadcrumbs desktop
14. DTP-3: Footer desktop
15. PLN-1: Cross-browser testing
16. PLN-2: Meta Pixel validation
17. PLN-3: WhatsApp message testing
18. PLN-4: Performance audit

---

## Estado real por historia (auditado 2026-06-13)

| Historia | Componente construido | ¿Cableado a página real? | Veredicto |
|---|---|---|---|
| CART-1 CartContext | ✅ | ✅ montado en layout | OK |
| CART-2 AddToCartButton | ✅ | ❌ ProductCard compartido no se usa | INTEG-2 |
| CART-3 CartDrawer | ✅ | ❌ huérfano, sin trigger | INTEG-1 |
| CART-4 /cart page | ✅ compila | ❌ cero enlaces a /cart | INTEG-3 |
| CART-5 checkout WhatsApp | ✅ wa.me válido | ⚠️ solo alcanzable si llegas a /cart | INTEG-3 |
| RSP-1 breakpoints | ✅ | ✅ | OK |
| RSP-2 containers max-w | ✅ | ✅ home+bienestar | OK |
| RSP-3 grid 4 col productos | ❌ no implementado en cocina | — | INTEG-4 |
| RSP-4 nav desktop | ✅ nav | ⚠️ badge no montado | INTEG-3 |
| DTP-1 CartModal | ✅ | ❌ huérfano | INTEG-1 |
| DTP-2 Breadcrumbs | ✅ | ✅ en products/[slug] | OK |
| DTP-3 Footer 4 col | ✅ | ❌ solo en /dev/ui | INTEG-5 |
| DTP-4 Newsletter | ✅ | ❌ depende del footer | INTEG-5 |

## Estado del Épica

**Estado:** Sprint 5 INTEG completado (build ✅, greps verificados) — listo para QA en vivo (INTEG-6, coordinador)

**Progreso real INTEG (2026-06-14):**
- ✅ INTEG-1: CartContext extendido (isOpen/openCart/closeCart); CartController monta CartDrawer (<lg) y CartModal (≥lg) en layout; CartBagButton client island en header abre overlay y muestra CartBadge con totalItems.
- ✅ INTEG-2: ProductCard cocina — TrackedWhatsAppLink con `lg:hidden` (mobile) + AddToCartButton con `hidden lg:flex` (desktop). Coexistencia según riesgo #3.
- ✅ INTEG-3: `href="/cart"` en CartDrawer y CartModal ("Ver carrito completo"). CartBadge en header vía CartBagButton.
- ✅ INTEG-4: Grid productos cocina: `grid-cols-2 md:grid-cols-3 lg:grid-cols-4` — nueva sección en `app/page.tsx`.
- ✅ INTEG-5: SiteFooter montado en cocina, bienestar y guías.
- INTEG-6: QA en vivo (pendiente del coordinador con navegador).

**Decisiones anotadas:**
- CartController se montó en `app/layout.tsx` (una sola instancia global) con `<div className="lg:hidden">` y `<div className="hidden lg:block">` para separar drawer/modal.
- `SiteHeader` sigue siendo server component; la bolsa se aisló en `CartBagButton` ("client island") para mantener la frontera server/client limpia.
- INTEG-5 se aplicó individualmente a cocina/bienestar/guías (no en layout.tsx raíz) para no contaminar páginas de campaña y producto.

**Sprint activo:** INTEG-6 (QA en vivo — coordinador)

**Pendiente de pushear:** commits en release local. No hacer push hasta INTEG-6.

**Última actualización:** 2026-06-14 (Sprint 5 INTEG ejecutado)
