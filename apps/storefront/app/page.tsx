import { existsSync } from "node:fs"
import { join } from "node:path"
import type { CSSProperties } from "react"
import {
  BadgeDollarSign,
  BookOpen,
  CookingPot,
  Flame,
  MessageCircle,
  PlayCircle,
  Sparkles,
  Timer,
  Truck,
  Video,
} from "lucide-react"
import type { Product } from "../lib/catalog"
import { getProducts, productPath } from "../lib/catalog"
import { commercialInfo } from "../lib/commercial"
import {
  mediaSlots,
  starProductSkus,
  type MediaSlot,
} from "../lib/content"
import { LeadCaptureForm } from "./components/lead-capture-form"
import { FloatingWhatsAppCta } from "./components/floating-whatsapp-cta"
import { PotRecommendationQuiz } from "./components/pot-recommendation-quiz"
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

const mainCouponCta =
  "Reclamar mi cupon y confirmar stock por WhatsApp"

const landingProductSkus = [
  "MGC-WOK-GRANITO-32",
  "MGC-OLLA-GRANITO-24",
  "MGC-SET-GRANITO-FAMILIAR",
]

const landingVideoSlotIds = ["detalle-wok", "uso-diario-gas", "receta-wok"]

function CommerceBadges({
  product,
  compact = false,
}: {
  product?: Product
  compact?: boolean
}) {
  const commerce = commercialInfo(product)

  return (
    <div className={compact ? "commerce-badges compact" : "commerce-badges"}>
      <span>
        <Truck size={15} />
        {commerce.freeShippingLabel}
      </span>
      <span>
        <BadgeDollarSign size={15} />
        {commerce.paymentMethodsLabel}
      </span>
      <span>
        <CookingPot size={15} />
        {commerce.stoveCompatibility}
      </span>
      <strong>
        <Sparkles size={15} />
        Cupon {commerce.couponCode}
      </strong>
    </div>
  )
}

function PrequalificationBlock({ featured }: { featured?: Product }) {
  const commerce = commercialInfo(featured)

  return (
    <section className="prequal-section" aria-label="Pagos envio y compatibilidad">
      <div className="prequal-copy">
        <p className="eyebrow">Antes de escribir</p>
        <h2>Ya sabes lo importante: envio, pago y cocina compatible.</h2>
        <p>
          El boton de WhatsApp reclama el cupon, manda el producto exacto a
          Vicky y evita preguntas basicas antes de confirmar stock.
        </p>
        {featured ? (
          <TrackedWhatsAppLink
            className="primary-button"
            cta="prequal_coupon_whatsapp"
            eventType="whatsapp_opened"
            metadata={{
              journeyStage: "lead_nuevo",
              productInterestSku: featured.sku,
              recommendedSku: featured.sku,
              prequalified: true,
            }}
            placement="prequalification_block"
            product={featured}
            whatsappContext={{
              recommendation: "cupon con envio gratis y pagos disponibles",
              recommendedSku: featured.sku,
              journeyStage: "lead_nuevo",
            }}
          >
            <MessageCircle size={18} />
            Reclamar cupon y stock
          </TrackedWhatsAppLink>
        ) : null}
      </div>
      <div className="prequal-grid">
        <article>
          <Truck size={24} />
          <strong>{commerce.freeShippingLabel}</strong>
          <span>Se confirma cobertura y tiempo de entrega por ciudad.</span>
        </article>
        <article>
          <BadgeDollarSign size={24} />
          <strong>{commerce.paymentMethodsLabel}</strong>
          <span>Transferencia, deuna! o link PayPhone/tarjeta.</span>
        </article>
        <article>
          <CookingPot size={24} />
          <strong>{commerce.stoveCompatibility}</strong>
          <span>Aclara compatibilidad antes de pasar al chat.</span>
        </article>
      </div>
    </section>
  )
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
            {commercialInfo(product).freeShippingLabel}
          </span>
          <span>
            <Timer size={15} />
            {product.stockSignal || `${product.stock} disponibles`}
          </span>
        </div>
        <CommerceBadges compact product={product} />
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
              eventType="product_interest"
              metadata={{
                journeyStage: "cotizacion_pendiente",
                productInterestSku: product.sku,
                recommendedSku: product.sku,
              }}
              placement={compact ? "social_deal_card" : "catalog_card"}
              product={product}
              whatsappContext={{
                recommendation:
                  product.bundleUseCase || product.healthAngle || product.title,
                recommendedSku: product.sku,
                journeyStage: "cotizacion_pendiente",
              }}
            >
              <MessageCircle size={18} />
              Reclamar cupon
            </TrackedWhatsAppLink>
          </div>
        </div>
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
        <div className="video-caption">
          <strong>{slot.proofPoints[0]}</strong>
          <small>{slot.title}</small>
        </div>
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
              metadata={{
                journeyStage: "interes_video",
                videoSlot: slot.id,
                productInterestSku: featured.sku,
                recommendedSku: featured.sku,
                needType: slot.proofPoints.join(", "),
                followupSequence: [
                  "dia_0_video",
                  "dia_2_recomendacion",
                  "dia_7_cuidado",
                  "dia_30_complemento",
                  "dia_90_recompra",
                ],
              }}
              placement={`video_${slot.id}`}
              product={featured}
              whatsappContext={{
                recommendation: slot.metric,
                recommendedSku: featured.sku,
                journeyStage: "interes_video",
                videoSlot: slot.id,
              }}
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
  const promoProducts = products.filter(hasPromo)
  const starProducts = products.filter(isStarProduct).sort((a, b) => {
    return starRank(a) - starRank(b)
  })
  const featured =
    products.find((product) => starRank(product) === 0) ||
    promoProducts[0] ||
    products[0]
  const landingProducts = landingProductSkus
    .map((sku) => products.find((product) => product.sku === sku))
    .filter((product): product is Product => Boolean(product))
  const deals = (landingProducts.length ? landingProducts : starProducts).slice(
    0,
    3,
  )
  const landingVideos = mediaSlots
    .filter((slot) => landingVideoSlotIds.includes(slot.id))
    .slice(0, 3)
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
          Reclamar
        </TrackedEventLink>
      </div>

      <header className="topbar">
        <a className="brand-mark" href="/">
          <CookingPot size={22} />
          <span>Eter Niu Cocina</span>
        </a>
        <nav>
          <a href="#videos">Videos</a>
          <a href="#productos">Comprar</a>
          <a href="#olla-ideal">Elegir</a>
          <a href="/guias">Guias</a>
        </nav>
        <a className="ghost-button" href="#club">
          <BookOpen size={18} />
          Guia gratis
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
            cupon, envio gratis, pagos claros y compatibilidad confirmada.
          </p>
          <div className="hero-actions">
            {featured ? (
              <>
                <TrackedWhatsAppLink
                  className="primary-button hero-cta"
                  eventType="video_interest"
                  cta="hero_video_whatsapp"
                  metadata={{
                    journeyStage: "interes_video",
                    videoSlot: "hero-cocina",
                    productInterestSku: featured.sku,
                    recommendedSku: featured.sku,
                    followupSequence: [
                      "dia_0_video",
                      "dia_2_recomendacion",
                      "dia_7_cuidado",
                      "dia_30_complemento",
                      "dia_90_recompra",
                    ],
                  }}
                  placement="hero_primary"
                  product={featured}
                  whatsappContext={{
                    recommendation: "video principal de cocina saludable",
                    recommendedSku: featured.sku,
                    journeyStage: "interes_video",
                    videoSlot: "hero-cocina",
                  }}
                >
                  <MessageCircle size={19} />
                  {mainCouponCta}
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
              <Truck size={17} />
              {commercialInfo(featured).freeShippingLabel}
            </span>
            <span>
              <BadgeDollarSign size={17} />
              {commercialInfo(featured).paymentMethodsLabel}
            </span>
            <span>
              <CookingPot size={17} />
              {commercialInfo(featured).stoveCompatibility}
            </span>
          </div>
          <CommerceBadges product={featured} />
        </div>
      </section>

      <PrequalificationBlock featured={featured} />

      <PotRecommendationQuiz products={starProducts.length ? starProducts : products} />

      <section className="section-head" id="videos">
        <div>
          <p className="eyebrow">Visto en redes</p>
          <h2>3 pruebas rapidas antes de escribir por WhatsApp</h2>
        </div>
        <span>
          <PlayCircle size={18} />
          Video sin audio
        </span>
      </section>

      <section className="video-grid" aria-label="Videos de cocina">
        {landingVideos.map((slot) => (
          <VideoSlot
            featured={productForSkus(products, slot.productSkus, featured)}
            key={slot.id}
            slot={slot}
          />
        ))}
      </section>

      <section className="section-head" id="productos">
        <div>
          <p className="eyebrow">Productos estrella</p>
          <h2>Elige una opcion y Vicky confirma stock</h2>
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
            Estamos preparando los productos estrella de cocina.
          </div>
        ) : null}
      </section>

      <section className="club-section" id="club">
        <div className="club-copy">
          <p className="eyebrow">Club Cocina Saludable</p>
          <h2>Guia + cupon para decidir hoy sin vueltas.</h2>
          <p>
            Recibe una guia corta, el cupon y recomendaciones segun cuantas
            personas comen en casa.
          </p>
          <div className="followup-flow">
            <span>Dia 0 guia</span>
            <span>Dia 2 tamano</span>
            <span>Dia 7 cuidado</span>
          </div>
          <TrackedEventLink
            className="secondary-button"
            cta="club_read_guides"
            href="/guias"
            placement="club_secondary"
            type="campaign_click"
          >
            <BookOpen size={18} />
            Ver guias completas
          </TrackedEventLink>
        </div>
        <LeadCaptureForm
          products={products.slice(0, 8).map((product) => ({
            id: product.id,
            sku: product.sku,
            title: product.title,
          }))}
        />
      </section>

      {featured ? <FloatingWhatsAppCta product={featured} /> : null}

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
          <TrackedWhatsAppLink
            cta="mobile_coupon_whatsapp"
            placement="mobile_bar"
            product={featured}
          >
            <MessageCircle size={18} />
            Cupon
          </TrackedWhatsAppLink>
        ) : null}
      </nav>
    </main>
  )
}
