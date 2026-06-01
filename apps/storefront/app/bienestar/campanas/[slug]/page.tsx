import type { Metadata } from "next"
import {
  BadgeDollarSign,
  CheckCircle2,
  Droplets,
  HeartHandshake,
  Leaf,
  MessageCircle,
  Sparkles,
  Truck,
} from "lucide-react"
import {
  getWellnessProducts,
  productSlug,
  type Product,
} from "../../../../lib/catalog"
import { commercialInfo } from "../../../../lib/commercial"
import { publicCampaignPath, wellnessBaseUrl } from "../../../../lib/domains"
import { wellnessOpeningLine } from "../../../../lib/wellness"
import { TrackedWhatsAppLink } from "../../../components/analytics"
import {
  WellnessAnalytics,
  WellnessRoutinePanel,
  WellnessStickyCta,
  type WellnessAttribution,
} from "../../components/wellness-interactions"

type WellnessCampaignPageProps = {
  params: Promise<{ slug: string }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export const dynamic = "force-dynamic"
export const revalidate = 0

const defaultWellnessSku = "BIEN-TERMO-SUS304-500"

export async function generateMetadata({
  params,
}: WellnessCampaignPageProps): Promise<Metadata> {
  const { slug } = await params

  return {
    title: "Campana bienestar | Eter Niu",
    description:
      "Landing de un producto de bienestar con cupon, envio gratis y cierre por WhatsApp.",
    alternates: {
      canonical: `${wellnessBaseUrl}/campanas/${slug}`,
    },
    openGraph: {
      title: "Producto de bienestar con cupon",
      description:
        "Mira el producto, confirma stock y reclama cupon por WhatsApp.",
      images: ["/media/wellness-hero.svg"],
      type: "website",
      url: `${wellnessBaseUrl}/campanas/${slug}`,
      siteName: "Eter Niu Bienestar",
    },
  }
}

function paramValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value
}

function money(amount: number) {
  return `$${amount.toFixed(2)}`
}

function productBySku(products: Product[], sku?: string) {
  return products.find((product) => product.sku === sku)
}

function campaignPath(product: Product) {
  return publicCampaignPath(
    "bienestar",
    productSlug(product),
    product.sku,
    "bienestar_campaign",
  )
}

function hasPromo(product: Product) {
  return (
    product.originalPrice !== undefined &&
    product.originalPrice.amount > product.price.amount
  )
}

function WellnessProofs({ product }: { product: Product }) {
  const commerce = commercialInfo(product)

  return (
    <section className="wellness-proof-grid">
      <article>
        <Truck size={24} />
        <strong>{commerce.freeShippingLabel}</strong>
        <span>
          El chat confirma ciudad, cobertura y despacho antes del pago.
        </span>
      </article>
      <article>
        <BadgeDollarSign size={24} />
        <strong>{commerce.paymentMethodsLabel}</strong>
        <span>Transferencia, deuna! o link PayPhone/tarjeta si aplica.</span>
      </article>
      <article>
        <HeartHandshake size={24} />
        <strong>Asesoria directa</strong>
        <span>
          Vicky recibe SKU, vertical, campana, Lead y fuente Meta Ads.
        </span>
      </article>
    </section>
  )
}

function WellnessFaq({ product }: { product: Product }) {
  const commerce = commercialInfo(product)

  return (
    <section className="wellness-faq">
      <article>
        <Droplets size={22} />
        <h2>Para que sirve</h2>
        <p>{product.bundleUseCase || product.description}</p>
      </article>
      <article>
        <Leaf size={22} />
        <h2>Como se cuida</h2>
        <p>
          {product.careTips || "Cuidado simple segun material del producto."}
        </p>
      </article>
      <article>
        <CheckCircle2 size={22} />
        <h2>Stock y precio</h2>
        <p>{product.stockSignal || "Stock por confirmar en WhatsApp"}.</p>
      </article>
      <article>
        <Sparkles size={22} />
        <h2>Cupon</h2>
        <p>
          Cupon {commerce.couponCode},{" "}
          {commerce.freeShippingLabel.toLowerCase()} y confirmacion por
          WhatsApp.
        </p>
      </article>
    </section>
  )
}

export default async function WellnessCampaignPage({
  params,
  searchParams,
}: WellnessCampaignPageProps) {
  const { slug } = await params
  const query = searchParams ? await searchParams : {}
  const products = await getWellnessProducts()
  const requestedSku = paramValue(query.sku)
  const defaultProduct =
    productBySku(products, defaultWellnessSku) || products[0]
  const selectedProduct = productBySku(products, requestedSku) || defaultProduct

  if (!selectedProduct) {
    return (
      <main className="wellness-page">
        <section className="wellness-empty">
          <HeartHandshake size={26} />
          <h1>No hay productos de bienestar disponibles.</h1>
          <p>
            Carga productos reales en Medusa con tag `bienestar` para activar
            esta campana.
          </p>
        </section>
      </main>
    )
  }

  const fallbackUsed = Boolean(
    requestedSku && requestedSku !== selectedProduct.sku,
  )
  const attribution: WellnessAttribution = {
    vertical: "bienestar",
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
  const promo = hasPromo(selectedProduct)
  const savings =
    promo && selectedProduct.originalPrice
      ? selectedProduct.originalPrice.amount - selectedProduct.price.amount
      : 0
  const commerce = commercialInfo(selectedProduct)

  return (
    <main className="wellness-page wellness-campaign-page">
      <WellnessAnalytics
        context={{
          ...attribution,
          productInterestSku: selectedProduct.sku,
          recommendedSku: selectedProduct.sku,
          journeyStage: "view_content",
        }}
        placement="wellness_campaign"
        product={selectedProduct}
      />

      <header className="wellness-topbar">
        <a className="brand-mark" href={wellnessBaseUrl}>
          <HeartHandshake size={21} />
          <span>Eter Niu Bienestar</span>
        </a>
        <a className="campaign-topbar-link" href={wellnessBaseUrl}>
          Ver vertical
        </a>
      </header>

      <section className="wellness-campaign-hero">
        <div className="wellness-campaign-media">
          <img alt={selectedProduct.title} src={selectedProduct.imageUrl} />
          <span>{selectedProduct.promoLabel || "Campana bienestar"}</span>
        </div>
        <div className="wellness-campaign-copy">
          <p className="eyebrow">Campana de un producto</p>
          <h1>{selectedProduct.title}</h1>
          <p>{selectedProduct.description}</p>
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
              cta="wellness_campaign_hero_whatsapp"
              eventType="campaign_cta_click"
              extraEventTypes={["whatsapp_opened"]}
              leadId={`lead_bienestar_${slug}_${selectedProduct.sku}_hero`}
              metadata={{
                ...attribution,
                source: "meta_ads",
                journeyStage: "cotizacion_pendiente",
                productInterestSku: selectedProduct.sku,
                recommendedSku: selectedProduct.sku,
              }}
              placement="wellness_campaign_hero"
              product={selectedProduct}
              source="meta_ads"
              whatsappContext={{
                ...attribution,
                openingLine: wellnessOpeningLine(selectedProduct),
                source: "meta_ads",
                recommendation: "campana de bienestar desde Meta Ads",
                recommendedSku: selectedProduct.sku,
                journeyStage: "cotizacion_pendiente",
                vertical: "bienestar",
              }}
            >
              <MessageCircle size={19} />
              Reclamar cupon y confirmar stock por WhatsApp
            </TrackedWhatsAppLink>
          </div>
          <div className="commerce-badges">
            <span>
              <Truck size={15} />
              {commerce.freeShippingLabel}
            </span>
            <span>
              <BadgeDollarSign size={15} />
              {commerce.paymentMethodsLabel}
            </span>
            <strong>
              <Sparkles size={15} />
              Cupon {commerce.couponCode}
            </strong>
          </div>
        </div>
      </section>

      <WellnessProofs product={selectedProduct} />

      <section className="campaign-section-head">
        <div>
          <p className="eyebrow">Por que esta landing</p>
          <h2>Un anuncio, un producto y un chat con contexto.</h2>
        </div>
        <span>Sin catalogo largo</span>
      </section>

      <section className="wellness-story-grid">
        <article>
          <img alt="Rutina bienestar" src="/media/wellness-hero.svg" />
          <strong>Visual por vertical</strong>
          <span>Bienestar no compite visualmente con cocina.</span>
        </article>
        <article>
          <img alt={selectedProduct.title} src={selectedProduct.imageUrl} />
          <strong>Producto protagonista</strong>
          <span>La campana cambia por SKU sin rehacer la pagina.</span>
        </article>
      </section>

      <WellnessRoutinePanel
        context={{
          ...attribution,
          productInterestSku: selectedProduct.sku,
          recommendedSku: selectedProduct.sku,
          journeyStage: "cotizacion_pendiente",
        }}
        product={selectedProduct}
      />

      <WellnessFaq product={selectedProduct} />

      <section className="wellness-more-products">
        <div>
          <p className="eyebrow">Cambiar producto</p>
          <h2>La misma landing sirve para otro SKU.</h2>
        </div>
        <div>
          {products
            .filter((product) => product.sku !== selectedProduct.sku)
            .slice(0, 3)
            .map((product) => (
              <a href={campaignPath(product)} key={product.sku}>
                <img alt={product.title} src={product.imageUrl} />
                <span>{product.title}</span>
              </a>
            ))}
        </div>
      </section>

      <WellnessStickyCta
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
