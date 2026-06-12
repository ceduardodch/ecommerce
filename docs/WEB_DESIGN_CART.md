# WEB-DESIGN: Carrito WhatsApp Híbrido + Desktop Equilibrado

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

## Estado del Épica

**Estado:** Pendiente de inicio

**Progreso:** 0/4 sprints completados

**Sprint activo:** Ninguno

**Última actualización:** 2026-06-12
