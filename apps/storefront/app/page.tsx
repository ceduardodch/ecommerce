import {
  BadgeDollarSign,
  ChefHat,
  ClipboardCheck,
  CookingPot,
  Flame,
  MessageCircle,
  PackageSearch,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Tags,
  Timer,
  Truck,
  Utensils,
  Zap,
} from "lucide-react"
import type { Product } from "../lib/catalog"
import { getProducts } from "../lib/catalog"
import { PageAnalytics, TrackedWhatsAppLink } from "./components/analytics"

type HomeProps = {
  searchParams?: Promise<{
    q?: string
    category?: string
  }>
}

function money(amount: number) {
  return `$${amount.toFixed(2)}`
}

function hasPromo(product: Product) {
  return (
    product.originalPrice !== undefined &&
    product.originalPrice.amount > product.price.amount
  )
}

function filterProducts(
  products: Product[],
  query?: string,
  category?: string,
) {
  const normalizedQuery = (query || "").trim().toLowerCase()
  return products.filter((product) => {
    if (category && product.category !== category) return false
    if (!normalizedQuery) return true
    const haystack = [
      product.title,
      product.description,
      product.category,
      product.brand,
      product.sku,
      product.promoLabel || "",
      product.deliveryBadge || "",
      product.material || "",
      product.tipoCocina || "",
      product.nivel || "",
      product.bundleUseCase || "",
      product.careTips || "",
      ...product.tags,
    ]
      .join(" ")
      .toLowerCase()
    return normalizedQuery
      .split(/\s+/)
      .filter(Boolean)
      .every((term) => haystack.includes(term))
  })
}

function ProductCard({
  product,
  compact = false,
}: {
  product: Product
  compact?: boolean
}) {
  const promo = hasPromo(product)

  return (
    <article className={compact ? "product-card compact" : "product-card"}>
      <div className="product-image">
        <img alt={product.title} src={product.imageUrl} />
        <div className="image-badges">
          {product.promoLabel ? <span>{product.promoLabel}</span> : null}
          {promo && product.discountPercent ? (
            <strong>-{product.discountPercent}%</strong>
          ) : null}
        </div>
      </div>
      <div className="product-body">
        <div className="product-heading">
          <p>{product.category}</p>
          <h2>{product.title}</h2>
          <span>{product.sku}</span>
        </div>
        <p className="description">{product.description}</p>
        <div className="product-specs">
          {product.material ? <span>{product.material}</span> : null}
          {product.diameterCm ? <span>{product.diameterCm} cm</span> : null}
          {product.capacity ? <span>{product.capacity}</span> : null}
          {product.teflonFree ? <span>Sin teflon</span> : null}
          {product.tipoCocina ? <span>{product.tipoCocina}</span> : null}
          {product.nivel ? <span>{product.nivel}</span> : null}
        </div>
        <div className="signal-row">
          <span>
            <Truck size={15} />
            {product.deliveryBadge || "Entrega coordinada"}
          </span>
          <span>
            <Timer size={15} />
            {product.stockSignal || `${product.stock} disponibles`}
          </span>
        </div>
        <div className="price-row">
          <div>
            {promo ? (
              <span className="original-price">
                {money(product.originalPrice!.amount)}
              </span>
            ) : null}
            <strong>{money(product.price.amount)}</strong>
          </div>
          <TrackedWhatsAppLink
            className="primary-button"
            placement={compact ? "deal_card" : "product_card"}
            product={product}
          >
            <MessageCircle size={18} />
            Cotizar por WhatsApp
          </TrackedWhatsAppLink>
        </div>
      </div>
    </article>
  )
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams
  const products = await getProducts()
  const query = params?.q || ""
  const selectedCategory = params?.category || ""
  const categories = [...new Set(products.map((product) => product.category))]
  const visibleProducts = filterProducts(products, query, selectedCategory)
  const promoProducts = products.filter(hasPromo)
  const starProducts = products.filter((product) =>
    [
      "prod-wok-granito-32",
      "prod-olla-granito-20",
      "prod-olla-granito-24",
      "prod-set-mgc-granito",
    ].includes(product.id),
  )
  const dealSource = starProducts.length
    ? starProducts
    : promoProducts.length
      ? promoProducts
      : products
  const deals = dealSource.slice(0, 4)
  const bundleProducts = products.filter((product) => product.bundleEligible)
  const bundles = (bundleProducts.length ? bundleProducts : products).slice(
    0,
    3,
  )
  const reorderProducts = products
    .filter((product) => product.reorderAfterDays)
    .sort((a, b) => (a.reorderAfterDays || 999) - (b.reorderAfterDays || 999))
    .slice(0, 3)
  const whatsappPopular = [...products]
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 3)
  const featured =
    products.find((product) => product.id === "prod-wok-granito-32") ||
    promoProducts[0] ||
    products[0]

  return (
    <main className="page-shell">
      <PageAnalytics
        category={selectedCategory}
        featured={featured}
        query={query}
      />
      <div className="promo-bar">
        <span>
          <Zap size={16} />
          GRANITOHOY
        </span>
        <strong>
          Ollas y woks de granito para cocinar con menos aceite, sin promesas
          medicas
        </strong>
        <a href="#productos">Ver productos</a>
      </div>

      <header className="topbar">
        <a className="brand-mark" href="/">
          <CookingPot size={22} />
          <span>Eter Niu Cocina</span>
        </a>
        <nav>
          <a href="#productos">Productos</a>
          <a href="#menos-aceite">Menos aceite</a>
          <a href="#guia">Guia</a>
          <a href="#catalogo">Catalogo</a>
        </nav>
        <a className="ghost-button" href="/feeds/meta/catalog.csv">
          <PackageSearch size={18} />
          Feed Meta
        </a>
      </header>

      <section className="market-hero" aria-label="Catalogo de cocina">
        <div className="hero-copy">
          <p className="eyebrow">Cocina saludable por WhatsApp</p>
          <h1>Ollas de granito para cocinar mejor en casa.</h1>
          <p className="hero-subcopy">
            Woks, ollas y sets de granito para preparar comida diaria con menos
            aceite, limpieza facil y asesoria humana antes de pagar.
          </p>
          <form className="search-box" action="/">
            <Search size={20} />
            <input
              aria-label="Buscar productos de cocina"
              defaultValue={query}
              name="q"
              placeholder="Busca: wok 32 cm, olla 24 cm, menos aceite..."
            />
            {selectedCategory ? (
              <input name="category" type="hidden" value={selectedCategory} />
            ) : null}
            <button type="submit">Buscar</button>
          </form>
          <div className="category-strip" aria-label="Categorias">
            <a className={!selectedCategory ? "active" : ""} href="/">
              Todo
            </a>
            {categories.map((category) => (
              <a
                className={selectedCategory === category ? "active" : ""}
                href={`/?category=${encodeURIComponent(category)}`}
                key={category}
              >
                {category}
              </a>
            ))}
          </div>
        </div>

        {featured ? (
          <TrackedWhatsAppLink
            className="deal-spotlight"
            placement="hero_spotlight"
            product={featured}
          >
            <img alt={featured.title} src={featured.imageUrl} />
            <div>
              <span>Producto estrella</span>
              <strong>{featured.title}</strong>
              <p>{featured.healthAngle || featured.bundleUseCase}</p>
              <b>{money(featured.price.amount)}</b>
            </div>
          </TrackedWhatsAppLink>
        ) : null}
      </section>

      <section className="trust-strip" aria-label="Condiciones comerciales">
        <div>
          <ShieldCheck size={18} />
          Opcion sin teflon para uso diario
        </div>
        <div>
          <BadgeDollarSign size={18} />
          Pago por link PayPhone cuando aceptas la cotizacion
        </div>
        <div>
          <MessageCircle size={18} />
          Asesoria por WhatsApp antes de comprar
        </div>
      </section>

      <section className="section-head" id="productos">
        <div>
          <p className="eyebrow">Productos estrella</p>
          <h2>Los mas pedidos de granito para casa y recetas</h2>
        </div>
        <span>
          <Flame size={18} />
          Stock visible
        </span>
      </section>

      <section className="deal-grid" aria-label="Productos estrella de granito">
        {deals.map((product) => (
          <ProductCard compact key={product.id} product={product} />
        ))}
        {!deals.length ? (
          <div className="empty-state">
            El catalogo Medusa aun no tiene productos de cocina publicados.
          </div>
        ) : null}
      </section>

      <section className="split-sections">
        <div className="band" id="combos">
          <div className="section-head compact-head">
            <div>
              <p className="eyebrow">Como elegir</p>
              <h2>20 cm, 24 cm o wok 32 cm</h2>
            </div>
          </div>
          <div className="mini-list">
            {bundles.map((product) => (
              <TrackedWhatsAppLink
                key={product.id}
                placement="combo_list"
                product={product}
              >
                <Tags size={18} />
                <span>{product.title}</span>
                <strong>{money(product.price.amount)}</strong>
              </TrackedWhatsAppLink>
            ))}
          </div>
        </div>

        <div className="band">
          <div className="section-head compact-head">
            <div>
              <p className="eyebrow">WhatsApp</p>
              <h2>Mas cotizados por chat</h2>
            </div>
          </div>
          <div className="mini-list">
            {whatsappPopular.map((product) => (
              <TrackedWhatsAppLink
                key={product.id}
                placement="whatsapp_popular"
                product={product}
              >
                <MessageCircle size={18} />
                <span>{product.title}</span>
                <strong>{product.stock} disp.</strong>
              </TrackedWhatsAppLink>
            ))}
          </div>
        </div>
      </section>

      <section className="use-grid" id="menos-aceite" aria-label="Guias por uso">
        <div>
          <ChefHat size={26} />
          <h2>Cocina con menos aceite</h2>
          <p>
            Woks y sartenes de granito ayudan a preparar huevos, vegetales y
            salteados sin depender de mucho aceite.
          </p>
        </div>
        <div>
          <Utensils size={26} />
          <h2>No se pega, se limpia rapido</h2>
          <p>
            El enfoque es uso diario: fuego medio, utensilios suaves y limpieza
            simple despues de cocinar.
          </p>
        </div>
        <div>
          <Sparkles size={26} />
          <h2>Para familia, diario y recetas</h2>
          <p>
            Olla 20 cm para pocas porciones, 24 cm para familia y wok 32 cm
            para recetas completas.
          </p>
        </div>
      </section>

      <section className="education-grid" id="guia" aria-label="Guia saludable">
        <div>
          <p className="eyebrow">Eleccion informada</p>
          <h2>Por que evitar teflon viejo o rayado</h2>
          <p>
            No hacemos diagnosticos ni promesas medicas. El mensaje correcto es
            elegir alternativas de uso diario, cuidar el recubrimiento y pedir
            certificacion cuando un proveedor declare PFOA, PFAS o PTFE.
          </p>
        </div>
        <div>
          <p className="eyebrow">Granito diario</p>
          <h2>Mejor que comprar barato dos veces</h2>
          <p>
            La gama media apunta a durar mas que opciones basicas, sin entrar en
            precios premium. Por eso el bot pregunta para cuantas personas
            cocinas antes de recomendar.
          </p>
        </div>
      </section>

      <section className="section-head" id="recompra">
        <div>
          <p className="eyebrow">Cuidado</p>
          <h2>Postventa para cuidar la olla y recomendar complementos</h2>
        </div>
        <span>
          <RefreshCw size={18} />
          CRM WhatsApp
        </span>
      </section>

      <section className="reorder-strip" aria-label="Productos para recompra">
        {reorderProducts.map((product) => (
          <TrackedWhatsAppLink
            key={product.id}
            placement="reorder_strip"
            product={product}
          >
            <ClipboardCheck size={20} />
            <span>{product.title}</span>
            <strong>{product.reorderAfterDays} dias</strong>
          </TrackedWhatsAppLink>
        ))}
      </section>

      <section className="section-head" id="catalogo">
        <div>
          <p className="eyebrow">Catalogo saludable</p>
          <h2>
            {visibleProducts.length} productos reales listos para cotizar
          </h2>
        </div>
        <span>
          <PackageSearch size={18} />
          Feed Meta activo
        </span>
      </section>

      <section className="product-list" aria-label="Catalogo principal">
        {visibleProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
        {!visibleProducts.length ? (
          <div className="empty-state">
            No hay productos disponibles para este filtro. Revisa Medusa Admin
            o intenta otra busqueda.
          </div>
        ) : null}
      </section>

      <nav className="mobile-action-bar" aria-label="Acciones rapidas">
        <a href="#productos">
          <Flame size={18} />
          Estrella
        </a>
        <a href="#catalogo">
          <PackageSearch size={18} />
          Catalogo
        </a>
        {featured ? (
          <TrackedWhatsAppLink placement="mobile_bar" product={featured}>
            <MessageCircle size={18} />
            WhatsApp
          </TrackedWhatsAppLink>
        ) : null}
      </nav>
    </main>
  )
}
