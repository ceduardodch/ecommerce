import { existsSync } from "node:fs"
import { join } from "node:path"
import type { CSSProperties } from "react"
import {
  BadgeDollarSign,
  BookOpen,
  ChefHat,
  ClipboardCheck,
  CookingPot,
  Flame,
  HeartHandshake,
  Leaf,
  MessageCircle,
  PackageSearch,
  PlayCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Tags,
  Timer,
  Truck,
  Utensils,
  Video,
} from "lucide-react"
import type { Product } from "../lib/catalog"
import { getProducts, productPath } from "../lib/catalog"
import {
  approvedTestimonials,
  editorialTiles,
  mediaSlots,
  starProductSkus,
  type EditorialTile,
  type MediaSlot,
} from "../lib/content"
import { LeadCaptureForm } from "./components/lead-capture-form"
import {
  PageAnalytics,
  TrackedEventLink,
  TrackedWhatsAppLink,
} from "./components/analytics"

type HomeProps = {
  searchParams?: Promise<{
    q?: string
    category?: string
  }>
}

function money(amount: number) {
  return `$${amount.toFixed(2)}`
}

function mediaPath(file: string) {
  try {
    return existsSync(join(process.cwd(), "public", "media", file))
      ? `/media/${file}`
      : undefined
  } catch {
    return undefined
  }
}

function hasPromo(product: Product) {
  return (
    product.originalPrice !== undefined &&
    product.originalPrice.amount > product.price.amount
  )
}

function starRank(product: Product) {
  const skuIndex = starProductSkus.indexOf(product.sku)
  if (skuIndex >= 0) return skuIndex
  const normalized = `${product.title} ${product.sku}`.toLowerCase()
  if (normalized.includes("wok") && normalized.includes("32")) return 0
  if (normalized.includes("20 cm")) return 1
  if (normalized.includes("24 cm")) return 2
  if (normalized.includes("set")) return 3
  return 99
}

function isStarProduct(product: Product) {
  return starRank(product) < 99
}

function productForSkus(products: Product[], skus: string[], fallback?: Product) {
  return products.find((product) => skus.includes(product.sku)) || fallback
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
        </div>
        <div className="product-specs">
          {product.material ? <span>{product.material}</span> : null}
          {product.diameterCm ? <span>{product.diameterCm} cm</span> : null}
          {product.capacity ? <span>{product.capacity}</span> : null}
          {product.teflonFree ? <span>Opcion sin teflon</span> : null}
        </div>
        <p className="description">
          {product.bundleUseCase || product.description}
        </p>
        <div className="surface-row" aria-label="Materiales y estilo">
          <span style={{ "--swatch": "#1c1d19" } as CSSProperties} />
          <span style={{ "--swatch": "#c9bca7" } as CSSProperties} />
          <span style={{ "--swatch": "#7f9a73" } as CSSProperties} />
          <small>granito / tapa / cuidado</small>
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
          <div className="product-card-actions">
            <a className="detail-link" href={productPath(product)}>
              Ver ficha
            </a>
            <TrackedWhatsAppLink
              className="primary-button"
              placement={compact ? "social_deal_card" : "catalog_card"}
              product={product}
            >
              <MessageCircle size={18} />
              Cotizar
            </TrackedWhatsAppLink>
          </div>
        </div>
      </div>
    </article>
  )
}

function EditorialTileCard({
  tile,
  product,
}: {
  tile: EditorialTile
  product?: Product
}) {
  return (
    <article className="editorial-tile">
      <img alt={tile.title} src={tile.poster} />
      <div>
        <span>{tile.eyebrow}</span>
        <h2>{tile.title}</h2>
        <p>{tile.text}</p>
        {product ? (
          <div className="inline-actions">
            <a className="text-link" href={productPath(product)}>
              Ver ficha
            </a>
            <TrackedWhatsAppLink
              className="text-link accent"
              placement={`editorial_${tile.id}`}
              product={product}
            >
              {tile.cta}
            </TrackedWhatsAppLink>
          </div>
        ) : (
          <TrackedEventLink
            className="text-link"
            cta={`editorial_${tile.id}`}
            href="#club"
            placement={`editorial_${tile.id}`}
          >
            {tile.cta}
          </TrackedEventLink>
        )}
      </div>
    </article>
  )
}

function VideoSlot({
  slot,
  featured,
}: {
  slot: MediaSlot
  featured?: Product
}) {
  const video = mediaPath(slot.video)

  return (
    <article className="video-slot">
      <div className="video-frame">
        {video ? (
          <video
            aria-label={slot.title}
            autoPlay
            loop
            muted
            playsInline
            poster={slot.poster}
          >
            <source src={video} type="video/mp4" />
          </video>
        ) : (
          <img alt={slot.title} src={slot.poster} />
        )}
        <span>
          <PlayCircle size={16} />
          {slot.label}
        </span>
      </div>
      <div>
        <strong>{slot.title}</strong>
        <p>{slot.metric}</p>
        <div className="video-proof-row">
          {slot.proofPoints.map((point) => (
            <span key={point}>{point}</span>
          ))}
        </div>
        {featured ? (
          <div className="inline-actions">
            <a href={productPath(featured)}>Ver ficha</a>
            <TrackedWhatsAppLink
              eventType={slot.eventType}
              cta={`video_${slot.id}_whatsapp`}
              placement={`video_${slot.id}`}
              product={featured}
            >
              {slot.cta}
            </TrackedWhatsAppLink>
          </div>
        ) : null}
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
  const starProducts = products.filter(isStarProduct).sort((a, b) => {
    return starRank(a) - starRank(b)
  })
  const featured =
    products.find((product) => starRank(product) === 0) ||
    promoProducts[0] ||
    products[0]
  const deals = (starProducts.length ? starProducts : products).slice(0, 4)
  const bundles = products
    .filter((product) => product.bundleEligible)
    .slice(0, 3)
  const guideProducts = (starProducts.length ? starProducts : products).slice(
    0,
    3,
  )
  const socialProducts = (starProducts.length ? starProducts : products).slice(
    0,
    4,
  )
  const approvedStories = approvedTestimonials.filter((item) => item.approved)
  const heroSavings =
    featured?.originalPrice &&
    featured.originalPrice.amount > featured.price.amount
      ? featured.originalPrice.amount - featured.price.amount
      : 0

  return (
    <main className="page-shell social-shell">
      <PageAnalytics
        category={selectedCategory}
        featured={featured}
        query={query}
      />
      <div className="promo-bar">
        <span>
          <Sparkles size={16} />
          GRANITOHOY
        </span>
        <strong>Lanzamiento cocina saludable: guia + cupon por WhatsApp</strong>
        <TrackedEventLink
          cta="promo_bar_guia"
          href="#club"
          placement="promo_bar"
        >
          Descargar
        </TrackedEventLink>
      </div>

      <header className="topbar">
        <a className="brand-mark" href="/">
          <CookingPot size={22} />
          <span>Eter Niu Cocina</span>
        </a>
        <nav>
          <a href="#momentos">Momentos</a>
          <a href="#videos">Pruebas</a>
          <a href="#productos">Comprar</a>
          <a href="#guias">Guias</a>
        </nav>
        <a className="ghost-button" href="/feeds/meta/catalog.csv">
          <PackageSearch size={18} />
          Feed Meta
        </a>
      </header>

      <section className="social-hero" aria-label="Cocina saludable">
        <div className="hero-media">
          <VideoSlot featured={featured} slot={mediaSlots[0]} />
        </div>
        <div className="hero-copy">
          <p className="eyebrow">Eter Niu Cocina</p>
          <h1>Granito que se ve rico antes de cotizar.</h1>
          <p className="hero-subcopy">
            Mira la prueba, elige tamano y te asesoramos por WhatsApp sin vueltas:
            20 cm, 24 cm, wok 32 cm o set familiar.
          </p>
          <div className="hero-actions">
            {featured ? (
              <>
                <TrackedWhatsAppLink
                  className="primary-button hero-cta"
                  eventType="video_interest"
                  cta="hero_video_whatsapp"
                  placement="hero_primary"
                  product={featured}
                >
                  <MessageCircle size={19} />
                  Quiero mi recomendacion
                </TrackedWhatsAppLink>
                <a className="secondary-button" href={productPath(featured)}>
                  <PlayCircle size={18} />
                  Ver ficha
                </a>
              </>
            ) : null}
            <TrackedEventLink
              className="secondary-button"
              cta="hero_guia_cupon"
              href="#club"
              placement="hero_secondary"
              metadata={{ leadMagnet: "guia_cocina_saludable" }}
            >
              <BookOpen size={18} />
              Guia + cupon
            </TrackedEventLink>
          </div>
          {featured ? (
            <div className="hero-commerce-card">
              <div>
                <span>Mas pedido por redes</span>
                <strong>{featured.title}</strong>
                <p>
                  {featured.diameterCm ? `${featured.diameterCm} cm · ` : ""}
                  {featured.capacity || "Uso diario"} · {featured.material}
                </p>
              </div>
              <div>
                {heroSavings > 0 ? (
                  <span>Ahorra {money(heroSavings)}</span>
                ) : null}
                <strong>{money(featured.price.amount)}</strong>
              </div>
            </div>
          ) : null}
          <div className="hero-proof">
            <span>
              <Leaf size={17} />
              Opcion sin teflon
            </span>
            <span>
              <BadgeDollarSign size={17} />
              Desde $95 a $249
            </span>
            <span>
              <ShieldCheck size={17} />
              Compra guiada
            </span>
          </div>
        </div>
      </section>

      <section className="search-panel" aria-label="Buscar productos">
        <form className="search-box" action="/">
          <Search size={20} />
          <input
            aria-label="Buscar productos de cocina"
            defaultValue={query}
            name="q"
            placeholder="Busca: wok 32 cm, olla familiar, menos aceite..."
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
      </section>

      <section className="proof-strip" aria-label="Pruebas de producto">
        <div>
          <Video size={22} />
          <strong>Prueba antes de comprar</strong>
          <span>Huevo, queso, limpieza y receta en formato Reel.</span>
        </div>
        <div>
          <Utensils size={22} />
          <strong>Asesoria por uso</strong>
          <span>No es lo mismo cocinar para 2 que para 5 personas.</span>
        </div>
        <div>
          <HeartHandshake size={22} />
          <strong>Seguimiento real</strong>
          <span>Guia, cuidado y complemento quedan en CRM.</span>
        </div>
      </section>

      <section className="section-head" id="momentos">
        <div>
          <p className="eyebrow">Compra por momento</p>
          <h2>Menos catalogo frio, mas cocina que se antoja</h2>
        </div>
      </section>

      <section className="editorial-grid" aria-label="Momentos de cocina">
        {editorialTiles.map((tile) => (
          <EditorialTileCard
            key={tile.id}
            product={productForSkus(products, tile.productSkus, featured)}
            tile={tile}
          />
        ))}
      </section>

      <section className="section-head" id="videos">
        <div>
          <p className="eyebrow">Visto en redes</p>
          <h2>Pruebas visuales que venden sin explicar demasiado</h2>
        </div>
        <span>
          <PlayCircle size={18} />
          Sin embeds externos
        </span>
      </section>

      <section className="video-grid" aria-label="Videos de cocina">
        {mediaSlots.slice(1).map((slot) => (
          <VideoSlot
            featured={productForSkus(products, slot.productSkus, featured)}
            key={slot.id}
            slot={slot}
          />
        ))}
      </section>

      <section className="proof-lab" aria-label="Pruebas del producto">
        <article>
          <span>01</span>
          <strong>Antiadherencia visible</strong>
          <p>Huevo y queso muestran mejor que cualquier parrafo si la olla sirve para el dia a dia.</p>
        </article>
        <article>
          <span>02</span>
          <strong>Limpieza sin pelear</strong>
          <p>La prueba clave para recompra: cocinar, lavar rapido y volver a usar.</p>
        </article>
        <article>
          <span>03</span>
          <strong>Tamano correcto</strong>
          <p>20 cm para poco, 24 cm para familia, wok 32 cm para recetas completas.</p>
        </article>
        <article>
          <span>04</span>
          <strong>Material explicado simple</strong>
          <p>Opcion sin teflon y cuidado basico, sin promesas medicas ni miedo.</p>
        </article>
      </section>

      <section className="section-head" id="productos">
        <div>
          <p className="eyebrow">Productos estrella</p>
          <h2>Los favoritos para empezar a cambiar tu cocina</h2>
        </div>
        <span>
          <Flame size={18} />
          Desde {featured ? money(featured.price.amount) : "$95"}
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

      <section className="social-proof-grid" aria-label="Contenido de redes">
        {socialProducts.map((product, index) => (
          <article className="social-card" key={product.id}>
            <img alt={product.title} src={product.imageUrl} />
            <div>
              <span>Reel {index + 1}</span>
              <h2>{product.contentAngles?.[0] || product.title}</h2>
              <p>{product.healthAngle || product.bundleUseCase}</p>
              <div className="inline-actions">
                <a className="text-link" href={productPath(product)}>
                  Ver ficha
                </a>
                <TrackedWhatsAppLink
                  className="text-link accent"
                  eventType="video_interest"
                  cta={`social_reel_${index + 1}_whatsapp`}
                  placement={`social_reel_${index + 1}`}
                  product={product}
                >
                  Pedir este producto
                </TrackedWhatsAppLink>
              </div>
            </div>
          </article>
        ))}
      </section>

      {approvedStories.length ? (
        <section className="testimonial-grid" aria-label="Testimonios reales">
          {approvedStories.map((story) => (
            <article key={`${story.name}-${story.city}`}>
              <Star size={20} />
              <p>{story.quote}</p>
              <strong>
                {story.name}, {story.city}
              </strong>
            </article>
          ))}
        </section>
      ) : null}

      <section className="guide-band" id="guias">
        <div>
          <p className="eyebrow">Guia Cocina Saludable</p>
          <h2>Compra con criterio, no por miedo</h2>
        </div>
        <div className="guide-cards">
          <TrackedEventLink
            cta="guide_teflon_pfas"
            href="/guias/teflon-pfas"
            placement="guide_band"
            type="campaign_click"
          >
            <ShieldCheck size={22} />
            <span>PFAS, PFOA y teflon explicado simple</span>
          </TrackedEventLink>
          <TrackedEventLink
            cta="guide_sizes"
            href="/guias"
            placement="guide_band"
            type="campaign_click"
          >
            <ChefHat size={22} />
            <span>20 cm, 24 cm o wok 32 cm</span>
          </TrackedEventLink>
          <TrackedEventLink
            cta="guide_care"
            href="/guias"
            placement="guide_band"
            type="campaign_click"
          >
            <ClipboardCheck size={22} />
            <span>Cuidado para que el granito dure mas</span>
          </TrackedEventLink>
        </div>
      </section>

      <section className="chooser-grid" aria-label="Como elegir">
        {guideProducts.map((product) => (
          <TrackedWhatsAppLink
            key={product.id}
            placement="size_chooser"
            product={product}
          >
            <Tags size={18} />
            <span>{product.title}</span>
            <strong>{product.capacity || money(product.price.amount)}</strong>
          </TrackedWhatsAppLink>
        ))}
      </section>

      <section className="club-section" id="club">
        <div className="club-copy">
          <p className="eyebrow">Club Cocina Saludable</p>
          <h2>Guia, cupon y recordatorios sin llenar tu WhatsApp.</h2>
          <p>
            Te enviamos ayuda segun tu cocina: tamano de familia, producto de
            interes y ciudad. La IA usa ese contexto para recomendar mejor.
          </p>
          <div className="followup-flow">
            <span>Dia 0 guia</span>
            <span>Dia 2 tamano</span>
            <span>Dia 7 cuidado</span>
            <span>Dia 30 complemento</span>
            <span>Dia 90 recompra</span>
          </div>
        </div>
        <LeadCaptureForm
          products={products.slice(0, 8).map((product) => ({
            id: product.id,
            sku: product.sku,
            title: product.title,
          }))}
        />
      </section>

      <section className="section-head" id="catalogo">
        <div>
          <p className="eyebrow">Catalogo conectado a Medusa</p>
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
        {!visibleProducts.length ? (
          <div className="empty-state">
            No hay productos disponibles para este filtro. Revisa Medusa Admin o
            intenta otra busqueda.
          </div>
        ) : null}
      </section>

      <nav className="mobile-action-bar" aria-label="Acciones rapidas">
        <a href="#videos">
          <PlayCircle size={18} />
          Videos
        </a>
        <a href="#productos">
          <Flame size={18} />
          Estrella
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
