import {
  BadgeDollarSign,
  Flame,
  MessageCircle,
  PackageSearch,
  Search,
  ShieldCheck,
  ShoppingBag,
  Tags,
  Timer,
  Truck,
  Zap,
} from "lucide-react"
import type { Product } from "../lib/catalog"
import { getProducts, whatsappLink } from "../lib/catalog"

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

function filterProducts(products: Product[], query?: string, category?: string) {
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
          <a
            className="primary-button"
            href={whatsappLink(product)}
            rel="noreferrer"
            target="_blank"
          >
            <MessageCircle size={18} />
            Cotizar
          </a>
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
  const deals = (promoProducts.length ? promoProducts : products).slice(0, 4)
  const bundleProducts = products.filter((product) => product.bundleEligible)
  const bundles = (bundleProducts.length ? bundleProducts : products).slice(0, 3)
  const whatsappPopular = [...products]
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 3)
  const featured = promoProducts[0] || products[0]

  return (
    <main className="page-shell">
      <div className="promo-bar">
        <span>
          <Zap size={16} />
          CUPON B2BHOY
        </span>
        <strong>Descuentos activos para cotizaciones cerradas esta semana</strong>
        <a href="#ofertas">Ver ofertas</a>
      </div>

      <header className="topbar">
        <a className="brand-mark" href="/">
          <ShoppingBag size={22} />
          <span>B2B Shop</span>
        </a>
        <nav>
          <a href="#ofertas">Ofertas</a>
          <a href="#combos">Combos</a>
          <a href="#catalogo">Catalogo</a>
        </nav>
        <a className="ghost-button" href="/feeds/meta/catalog.csv">
          <PackageSearch size={18} />
          Feed Meta
        </a>
      </header>

      <section className="market-hero" aria-label="Catalogo promocional">
        <div className="hero-copy">
          <p className="eyebrow">Marketplace B2B por WhatsApp</p>
          <h1>Compra rapido para tu negocio con ofertas listas para cotizar.</h1>
          <form className="search-box" action="/">
            <Search size={20} />
            <input
              aria-label="Buscar productos"
              defaultValue={query}
              name="q"
              placeholder="Buscar por necesidad: camaras, wifi, cobros..."
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
          <a
            className="deal-spotlight"
            href={whatsappLink(featured)}
            rel="noreferrer"
            target="_blank"
          >
            <img alt={featured.title} src={featured.imageUrl} />
            <div>
              <span>Oferta destacada</span>
              <strong>{featured.title}</strong>
              <p>{featured.promoLabel || "Cotizacion prioritaria por WhatsApp"}</p>
              <b>{money(featured.price.amount)}</b>
            </div>
          </a>
        ) : null}
      </section>

      <section className="trust-strip" aria-label="Condiciones comerciales">
        <div>
          <ShieldCheck size={18} />
          Compra con factura y revision humana
        </div>
        <div>
          <BadgeDollarSign size={18} />
          Pago por link PayPhone en modo sandbox
        </div>
        <div>
          <MessageCircle size={18} />
          Atencion prioritaria por WhatsApp
        </div>
      </section>

      <section className="section-head" id="ofertas">
        <div>
          <p className="eyebrow">Cierra hoy</p>
          <h2>Ofertas para negocios que necesitan resolver ya</h2>
        </div>
        <span>
          <Flame size={18} />
          Promos con stock visible
        </span>
      </section>

      <section className="deal-grid" aria-label="Ofertas para cerrar hoy">
        {deals.map((product) => (
          <ProductCard compact key={product.id} product={product} />
        ))}
      </section>

      <section className="split-sections">
        <div className="band" id="combos">
          <div className="section-head compact-head">
            <div>
              <p className="eyebrow">Combos</p>
              <h2>Paquetes para implementar mas rapido</h2>
            </div>
          </div>
          <div className="mini-list">
            {bundles.map((product) => (
              <a
                href={whatsappLink(product)}
                key={product.id}
                rel="noreferrer"
                target="_blank"
              >
                <Tags size={18} />
                <span>{product.title}</span>
                <strong>{money(product.price.amount)}</strong>
              </a>
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
              <a
                href={whatsappLink(product)}
                key={product.id}
                rel="noreferrer"
                target="_blank"
              >
                <MessageCircle size={18} />
                <span>{product.title}</span>
                <strong>{product.stock} disp.</strong>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="section-head" id="catalogo">
        <div>
          <p className="eyebrow">Catalogo</p>
          <h2>{visibleProducts.length} productos listos para cotizar</h2>
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
      </section>

      <nav className="mobile-action-bar" aria-label="Acciones rapidas">
        <a href="#ofertas">
          <Flame size={18} />
          Ofertas
        </a>
        <a href="#catalogo">
          <PackageSearch size={18} />
          Catalogo
        </a>
        {featured ? (
          <a href={whatsappLink(featured)} rel="noreferrer" target="_blank">
            <MessageCircle size={18} />
            WhatsApp
          </a>
        ) : null}
      </nav>
    </main>
  )
}
