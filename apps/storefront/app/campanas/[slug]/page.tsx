import { existsSync } from "node:fs"
import { join } from "node:path"
import type { Metadata } from "next"
import {
  BadgeDollarSign,
  CheckCircle2,
  CookingPot,
  Leaf,
  MessageCircle,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Timer,
  Truck,
} from "lucide-react"
import {
  getProducts,
  productPath,
  type Product,
} from "../../../lib/catalog"
import { commercialInfo } from "../../../lib/commercial"
import { mediaSlots, type MediaSlot } from "../../../lib/content"
import { kitchenBaseUrl } from "../../../lib/domains"
import {
  CampaignAnalytics,
  CampaignStickyCta,
  CampaignWhatsAppPanel,
  type CampaignAttribution,
} from "./components/campaign-interactions"
import { TrackedWhatsAppLink } from "../../components/analytics"

type CampaignPageProps = {
  params: Promise<{ slug: string }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export const dynamic = "force-dynamic"
export const revalidate = 0

const defaultCampaignSku = "MGC-WOK-GRANITO-32"

export async function generateMetadata({
  params,
}: CampaignPageProps): Promise<Metadata> {
  const { slug } = await params

  return {
    title: "Wok de granito 32 cm | Campana Eter Niu Cocina",
    description:
      "Landing de campana con video real, cupon, envio gratis y cierre por WhatsApp.",
    alternates: {
      canonical: `${kitchenBaseUrl}/campanas/${slug}`,
    },
    openGraph: {
      title: "Wok de granito 32 cm con cupon",
      description:
        "Mira el wok en uso, confirma compatibilidad y reclama cupon por WhatsApp.",
      images: ["/media/photo-hero-cocina.jpg"],
      type: "website",
      url: `${kitchenBaseUrl}/campanas/${slug}`,
    },
  }
}

function paramValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value
}

function money(amount: number) {
  return `$${amount.toFixed(2)}`
}

function mediaPath(file?: string) {
  if (!file) return undefined
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

function productBySku(products: Product[], sku?: string) {
  return products.find((product) => product.sku === sku)
}

function campaignSlots(product: Product) {
  const direct = mediaSlots.filter((slot) => slot.productSkus.includes(product.sku))
  const fallback = mediaSlots.filter((slot) =>
    ["hero-cocina", "detalle-wok", "receta-wok"].includes(slot.id),
  )
  const slots = direct.length ? direct : fallback
  const hero = slots[0] || mediaSlots[0]
  const proofs = slots.filter((slot) => slot.id !== hero.id).slice(0, 3)

  return { hero, proofs }
}

function ProductVideo({
  slot,
  product,
  compact = false,
  attribution,
}: {
  slot: MediaSlot
  product: Product
  compact?: boolean
  attribution: CampaignAttribution
}) {
  const video = mediaPath(slot.video)

  return (
    <article
      className={compact ? "campaign-video-card compact" : "campaign-video-card"}
    >
      <div className="campaign-video-frame">
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
          <img alt={slot.title} src={slot.poster || product.imageUrl} />
        )}
        <span>
          <PlayCircle size={16} />
          {slot.label}
        </span>
        <div className="campaign-video-caption">
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
        <TrackedWhatsAppLink
          cta={`campaign_video_${slot.id}_whatsapp`}
          eventType="video_interest"
          extraEventTypes={["whatsapp_opened"]}
          leadId={`lead_${attribution.campaignSlug}_${product.sku}_${slot.id}`}
          metadata={{
            ...attribution,
            source: "meta_ads",
            journeyStage: "interes_video",
            videoSlot: slot.id,
            productInterestSku: product.sku,
            recommendedSku: product.sku,
          }}
          placement={`campaign_video_${slot.id}`}
          product={product}
          source="meta_ads"
          whatsappContext={{
            ...attribution,
            source: "meta_ads",
            recommendation: slot.metric,
            recommendedSku: product.sku,
            journeyStage: "interes_video",
            videoSlot: slot.id,
          }}
        >
          Preguntar por este video
        </TrackedWhatsAppLink>
      </div>
    </article>
  )
}

function TrustStrip({ product }: { product: Product }) {
  const commerce = commercialInfo(product)

  return (
    <section className="campaign-trust" aria-label="Confianza antes del chat">
      <article>
        <Truck size={24} />
        <strong>{commerce.freeShippingLabel}</strong>
        <span>Cobertura y tiempo se confirman por ciudad antes del pago.</span>
      </article>
      <article>
        <BadgeDollarSign size={24} />
        <strong>{commerce.paymentMethodsLabel}</strong>
        <span>Transferencia, deuna! o link PayPhone/tarjeta.</span>
      </article>
      <article>
        <CookingPot size={24} />
        <strong>{commerce.stoveCompatibility}</strong>
        <span>Compatibilidad clara antes de escribir a Vicky.</span>
      </article>
    </section>
  )
}

function CampaignFaq({ product }: { product: Product }) {
  const commerce = commercialInfo(product)

  return (
    <section className="campaign-faq" aria-label="Dudas frecuentes de campana">
      <article>
        <Timer size={22} />
        <h2>Hay stock</h2>
        <p>{product.stockSignal || `${product.stock} disponibles`}.</p>
      </article>
      <article>
        <ShieldCheck size={22} />
        <h2>Por que granito</h2>
        <p>
          {product.healthAngle ||
            "Es una alternativa a antiadherentes tradicionales para cocinar con menos aceite."}
        </p>
      </article>
      <article>
        <Leaf size={22} />
        <h2>Como se cuida</h2>
        <p>
          {product.careTips ||
            "Usa utensilios suaves, fuego medio y esponja no abrasiva."}
        </p>
      </article>
      <article>
        <CheckCircle2 size={22} />
        <h2>Que incluye el cupon</h2>
        <p>
          Cupon {commerce.couponCode}, {commerce.freeShippingLabel.toLowerCase()} y
          confirmacion de entrega por WhatsApp.
        </p>
      </article>
    </section>
  )
}

export default async function CampaignPage({
  params,
  searchParams,
}: CampaignPageProps) {
  const { slug } = await params
  const query = searchParams ? await searchParams : {}
  const products = await getProducts()
  const requestedSku = paramValue(query.sku)
  const defaultProduct = productBySku(products, defaultCampaignSku) || products[0]
  const selectedProduct = productBySku(products, requestedSku) || defaultProduct

  if (!selectedProduct) {
    return (
      <main className="campaign-page">
        <section className="campaign-empty">
          No hay productos de cocina disponibles para esta campana.
        </section>
      </main>
    )
  }

  const fallbackUsed = Boolean(requestedSku && requestedSku !== selectedProduct.sku)
  const attribution: CampaignAttribution = {
    campaignSlug: slug,
    requestedSku,
    fallbackUsed,
    utmSource: paramValue(query.utm_source),
    utmMedium: paramValue(query.utm_medium),
    utmCampaign: paramValue(query.utm_campaign),
    utmContent: paramValue(query.utm_content),
    utmTerm: paramValue(query.utm_term),
    fbclid: paramValue(query.fbclid),
  }
  const { hero, proofs } = campaignSlots(selectedProduct)
  const promo = hasPromo(selectedProduct)
  const savings =
    promo && selectedProduct.originalPrice
      ? selectedProduct.originalPrice.amount - selectedProduct.price.amount
      : 0

  return (
    <main className="campaign-page">
      <CampaignAnalytics
        context={{
          ...attribution,
          productInterestSku: selectedProduct.sku,
          recommendedSku: selectedProduct.sku,
          journeyStage: "view_content",
        }}
        product={selectedProduct}
      />

      <header className="campaign-topbar">
        <a className="brand-mark" href="/">
          <CookingPot size={21} />
          <span>Eter Niu Cocina</span>
        </a>
        <a className="campaign-topbar-link" href={productPath(selectedProduct)}>
          Ver ficha
        </a>
      </header>

      <section className="campaign-hero">
        <ProductVideo attribution={attribution} product={selectedProduct} slot={hero} />
        <div className="campaign-hero-copy">
          <p className="eyebrow">Campana de redes</p>
          <h1>{selectedProduct.title}</h1>
          <p>
            Mira el producto real, confirma si sirve para tu cocina y reclama el
            cupon por WhatsApp sin pasar por catalogo largo.
          </p>
          <div className="campaign-price-card">
            <div>
              {promo && selectedProduct.originalPrice ? (
                <span className="original-price">
                  {money(selectedProduct.originalPrice.amount)}
                </span>
              ) : null}
              <strong>{money(selectedProduct.price.amount)}</strong>
              {savings > 0 ? <small>Ahorra {money(savings)}</small> : null}
            </div>
            <TrackedWhatsAppLink
              className="primary-button hero-cta"
              cta="campaign_hero_whatsapp"
              eventType="campaign_cta_click"
              extraEventTypes={["whatsapp_opened"]}
              leadId={`lead_${slug}_${selectedProduct.sku}_hero`}
              metadata={{
                ...attribution,
                source: "meta_ads",
                journeyStage: "cotizacion_pendiente",
                productInterestSku: selectedProduct.sku,
                recommendedSku: selectedProduct.sku,
              }}
              placement="campaign_hero"
              product={selectedProduct}
              source="meta_ads"
              whatsappContext={{
                ...attribution,
                source: "meta_ads",
                recommendation: "campana de un producto desde Meta Ads",
                recommendedSku: selectedProduct.sku,
                journeyStage: "cotizacion_pendiente",
                videoSlot: hero.id,
              }}
            >
              <MessageCircle size={19} />
              Reclamar cupon y confirmar stock por WhatsApp
            </TrackedWhatsAppLink>
          </div>
          <div className="commerce-badges">
            <span>
              <Truck size={15} />
              {commercialInfo(selectedProduct).freeShippingLabel}
            </span>
            <span>
              <BadgeDollarSign size={15} />
              {commercialInfo(selectedProduct).paymentMethodsLabel}
            </span>
            <span>
              <CookingPot size={15} />
              {commercialInfo(selectedProduct).stoveCompatibility}
            </span>
            <strong>
              <Sparkles size={15} />
              Cupon {commercialInfo(selectedProduct).couponCode}
            </strong>
          </div>
        </div>
      </section>

      <TrustStrip product={selectedProduct} />

      <section className="campaign-section-head" id="pruebas">
        <div>
          <p className="eyebrow">Pruebas rapidas</p>
          <h2>Antes de escribir, mira lo que vas a pedir.</h2>
        </div>
        <span>Videos muted</span>
      </section>

      <section className="campaign-proof-grid">
        {proofs.map((slot) => (
          <ProductVideo
            attribution={attribution}
            compact
            key={slot.id}
            product={selectedProduct}
            slot={slot}
          />
        ))}
      </section>

      <CampaignWhatsAppPanel
        context={{
          ...attribution,
          productInterestSku: selectedProduct.sku,
          recommendedSku: selectedProduct.sku,
          journeyStage: "cotizacion_pendiente",
        }}
        product={selectedProduct}
      />

      <CampaignFaq product={selectedProduct} />

      <CampaignStickyCta
        context={{
          ...attribution,
          productInterestSku: selectedProduct.sku,
          recommendedSku: selectedProduct.sku,
          journeyStage: "cotizacion_pendiente",
        }}
        product={selectedProduct}
      />
    </main>
  )
}
