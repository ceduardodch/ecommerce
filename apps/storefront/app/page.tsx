import { existsSync } from "node:fs"
import { join } from "node:path"
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
import { getProducts } from "../lib/catalog"
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

type MediaSlot = {
  id: string
  title: string
  label: string
  poster: string
  video: string
  metric: string
}

const mediaSlots: MediaSlot[] = [
  {
    id: "hero-cocina",
    title: "Ollas de granito en uso diario",
    label: "Video principal",
    poster: "/media/poster-hero.svg",
    video: "hero-cocina.mp4",
    metric: "Menos aceite",
  },
  {
    id: "prueba-huevo",
    title: "Prueba huevo y queso",
    label: "Prueba de producto",
    poster: "/media/poster-huevo.svg",
    video: "prueba-huevo.mp4",
    metric: "No se pega",
  },
  {
    id: "limpieza-rapida",
    title: "Limpieza despues de cocinar",
    label: "Uso real",
    poster: "/media/poster-limpieza.svg",
    video: "limpieza-rapida.mp4",
    metric: "Limpieza facil",
  },
  {
    id: "receta-wok",
    title: "Receta rapida en wok 32 cm",
    label: "Receta",
    poster: "/media/poster-receta.svg",
    video: "receta-wok.mp4",
    metric: "Wok 32 cm",
  },
]

const approvedTestimonials: Array<{
  name: string
  city: string
  quote: string
  approved: boolean
}> = []

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
        <p className="description">{product.bundleUseCase || product.description}</p>
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
            placement={compact ? "social_deal_card" : "catalog_card"}
            product={product}
          >
            <MessageCircle size={18} />
            Cotizar
          </TrackedWhatsAppLink>
        </div>
      </div>
    </article>
  )
}

function VideoSlot({ slot, featured }: { slot: MediaSlot; featured?: Product }) {
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
        {featured ? (
          <TrackedWhatsAppLink placement={`video_${slot.id}`} product={featured}>
            Preguntar por WhatsApp
          </TrackedWhatsAppLink>
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
  const starProducts = products.filter((product) =>
    [
      "prod-wok-granito-32",
      "prod-olla-granito-20",
      "prod-olla-granito-24",
      "prod-set-mgc-granito",
    ].includes(product.id),
  )
  const featured =
    products.find((product) => product.id === "prod-wok-granito-32") ||
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
        <strong>Guia de cocina saludable + cupon para tu primera cotizacion</strong>
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
          <a href="#videos">Videos</a>
          <a href="#productos">Productos</a>
          <a href="#guias">Guias</a>
          <a href="#club">Club</a>
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
          <p className="eyebrow">Cocina saludable por WhatsApp</p>
          <h1>Ollas de granito para cocinar con menos aceite en casa.</h1>
          <p className="hero-subcopy">
            Elige wok, olla o set segun tu familia. Te asesoramos por WhatsApp
            antes de pagar y registramos tu interes para dar seguimiento real.
          </p>
          <div className="hero-actions">
            {featured ? (
              <TrackedWhatsAppLink
                className="primary-button hero-cta"
                placement="hero_primary"
                product={featured}
              >
                <MessageCircle size={19} />
                Quiero asesoria por WhatsApp
              </TrackedWhatsAppLink>
            ) : null}
            <TrackedEventLink
              className="secondary-button"
              cta="hero_guia_cupon"
              href="#club"
              placement="hero_secondary"
              metadata={{ leadMagnet: "guia_cocina_saludable" }}
            >
              <BookOpen size={18} />
              Descargar guia + cupon
            </TrackedEventLink>
          </div>
          <div className="hero-proof">
            <span>
              <Leaf size={17} />
              Alternativa a antiadherentes tradicionales
            </span>
            <span>
              <BadgeDollarSign size={17} />
              Gama media, no low-cost
            </span>
            <span>
              <ShieldCheck size={17} />
              Claims fuertes solo con certificacion
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
          <strong>Video primero</strong>
          <span>Slots listos para Reels, pruebas y recetas.</span>
        </div>
        <div>
          <Utensils size={22} />
          <strong>Uso diario</strong>
          <span>Huevo, queso, salteados, sopas y limpieza rapida.</span>
        </div>
        <div>
          <HeartHandshake size={22} />
          <strong>Postventa</strong>
          <span>Cuidado a 7 dias y complementos por CRM.</span>
        </div>
      </section>

      <section className="section-head" id="videos">
        <div>
          <p className="eyebrow">Visto en redes</p>
          <h2>Pruebas visuales, recetas y cuidado</h2>
        </div>
        <span>
          <PlayCircle size={18} />
          Sin embeds externos
        </span>
      </section>

      <section className="video-grid" aria-label="Videos de cocina">
        {mediaSlots.slice(1).map((slot, index) => (
          <VideoSlot
            featured={socialProducts[index] || featured}
            key={slot.id}
            slot={slot}
          />
        ))}
      </section>

      <section className="section-head" id="productos">
        <div>
          <p className="eyebrow">Productos estrella</p>
          <h2>Granito para cocinar rico sin comprar barato dos veces</h2>
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

      <section className="social-proof-grid" aria-label="Contenido de redes">
        {socialProducts.map((product, index) => (
          <article className="social-card" key={product.id}>
            <img alt={product.title} src={product.imageUrl} />
            <div>
              <span>Reel {index + 1}</span>
              <h2>{product.contentAngles?.[0] || product.title}</h2>
              <p>{product.healthAngle || product.bundleUseCase}</p>
              <TrackedWhatsAppLink
                className="text-link"
                placement={`social_reel_${index + 1}`}
                product={product}
              >
                Pedir este producto
              </TrackedWhatsAppLink>
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
          <h2>Aprende a elegir antes de comprar</h2>
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
          <h2>Recibe la guia, el cupon y recordatorios utiles.</h2>
          <p>
            El formulario alimenta el CRM para que la IA sepa si vienes por
            guia, video, producto especifico o recompra. Sin conversaciones
            completas ni datos sensibles para Meta.
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
            No hay productos disponibles para este filtro. Revisa Medusa Admin
            o intenta otra busqueda.
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
