import type { Metadata } from "next"
import {
  BadgeDollarSign,
  CheckCircle2,
  Droplets,
  HeartHandshake,
  Leaf,
  MessageCircle,
  ShieldCheck,
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
import { Badge } from "../../../components/ui/badge"
import { PromoBar } from "../../../components/ui/promo-bar"
import { SiteHeader } from "../../../components/ui/site-header"
import { PriceTag } from "../../../components/ui/price-tag"

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
      images: ["/media/wellness-tambor-lengua-real.jpg"],
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

/** Trust grid 3-col (maqueta 2.3 point 6) */
function TrustGrid({ product }: { product: Product }) {
  const commerce = commercialInfo(product)

  return (
    <div className="grid grid-cols-3 divide-x divide-white/10 border-y border-white/10">
      <div className="flex flex-col items-center gap-1.5 px-2 py-4 text-center">
        <Truck size={20} className="text-white" />
        <span className="text-[10.5px] leading-snug text-[#b8c2ae]">
          {commerce.freeShippingLabel}
        </span>
      </div>
      <div className="flex flex-col items-center gap-1.5 px-2 py-4 text-center">
        <BadgeDollarSign size={20} className="text-white" />
        <span className="text-[10.5px] leading-snug text-[#b8c2ae]">
          Pagas al recibir
        </span>
      </div>
      <div className="flex flex-col items-center gap-1.5 px-2 py-4 text-center">
        <ShieldCheck size={20} className="text-white" />
        <span className="text-[10.5px] leading-snug text-[#b8c2ae]">
          Garantia y asesoria
        </span>
      </div>
    </div>
  )
}

/** FAQ section (conserved content, re-styled) */
function WellnessFaq({ product }: { product: Product }) {
  const commerce = commercialInfo(product)

  const items = [
    {
      icon: <Droplets size={20} className="text-[#d3fa99]" />,
      title: "Para que sirve",
      body: product.bundleUseCase || product.description,
    },
    {
      icon: <Leaf size={20} className="text-[#d3fa99]" />,
      title: "Como se cuida",
      body: product.careTips || "Cuidado simple segun material del producto.",
    },
    {
      icon: <CheckCircle2 size={20} className="text-[#d3fa99]" />,
      title: "Stock y precio",
      body: `${product.stockSignal || "Stock por confirmar en WhatsApp"}.`,
    },
    {
      icon: <ShieldCheck size={20} className="text-[#d3fa99]" />,
      title: "Cupon",
      body: `Cupon ${commerce.couponCode}, ${commerce.freeShippingLabel.toLowerCase()} y confirmacion por WhatsApp.`,
    },
  ]

  return (
    <section className="px-4 py-10" aria-label="Preguntas frecuentes">
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-[#d3fa99]">
        FAQ
      </p>
      <h2
        className="mb-6 text-[20px] font-medium leading-snug text-white"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Antes de escribir a Vicky.
      </h2>
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.title}
            className="flex gap-3 rounded-2xl border border-white/10 bg-[#16200f] p-4"
          >
            <div className="mt-0.5 shrink-0">{item.icon}</div>
            <div>
              <p className="mb-1 text-[14px] font-medium text-white">
                {item.title}
              </p>
              <p className="text-[13px] leading-snug text-[#b8c2ae]">
                {item.body}
              </p>
            </div>
          </div>
        ))}
      </div>
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
      <main data-theme="bienestar" className="min-h-screen bg-[#10160e]">
        <PromoBar message="Bienestar consciente · Envío gratis a todo Ecuador" />
        <section className="flex flex-col items-center gap-4 px-4 py-16 text-center">
          <HeartHandshake size={26} className="text-[#d3fa99]" />
          <h1
            className="text-[20px] font-medium text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            No hay productos de bienestar disponibles.
          </h1>
          <p className="text-[14px] text-[#b8c2ae]">
            Carga productos reales en Medusa con tag bienestar para activar esta campana.
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

  return (
    <main data-theme="bienestar" className="min-h-screen bg-[#10160e] pb-24">
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

      {/* 1. Promo bar */}
      <PromoBar message="Bienestar consciente · Envío gratis a todo Ecuador" />

      {/* 2. Header mínimo */}
      <SiteHeader
        compact
        compactTitle={selectedProduct.category}
        backHref={wellnessBaseUrl}
        vertical="bienestar"
        surface="dark"
      />

      {/* 3. Hero image 9:16 con pill de promo */}
      <div className="relative px-4 pt-4">
        <div className="relative mx-auto aspect-[9/16] w-full max-w-[440px] overflow-hidden rounded-[14px] bg-[#E8E2D8]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={selectedProduct.title}
            src={selectedProduct.imageUrl}
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* Scrim for readability (decisión 8 del plan) */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent" />
        </div>

        {/* Pill: promo label top-left */}
        {(selectedProduct.promoLabel || promo) && (
          <div className="absolute left-6 top-6">
            <Badge tone="accent">
              {promo && savings > 0
                ? `-${Math.round((savings / selectedProduct.originalPrice!.amount) * 100)}% hoy`
                : selectedProduct.promoLabel}
            </Badge>
          </div>
        )}
      </div>

      {/* 4. Eyebrow → H1 → subcopy */}
      <div className="px-4 pt-6">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-[#d3fa99]">
          {`${selectedProduct.category} · bienestar consciente`}
        </p>
        <h1
          className="mb-2 text-[clamp(28px,8vw,40px)] font-medium leading-[1.15] text-white"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {selectedProduct.title}
        </h1>
        <p className="mb-5 text-[14px] leading-snug text-[#b8c2ae]">
          {selectedProduct.description}
        </p>

        {/* 5. Price row */}
        <div className="mb-5 flex items-end gap-3">
          <PriceTag
            price={money(selectedProduct.price.amount)}
            originalPrice={
              promo && selectedProduct.originalPrice
                ? money(selectedProduct.originalPrice.amount)
                : undefined
            }
            note="stock por WhatsApp"
          />
          {savings > 0 && (
            <span className="text-[12px] text-[#b8c2ae]">
              Ahorra {money(savings)}
            </span>
          )}
        </div>

        {/* Hero CTA */}
        <TrackedWhatsAppLink
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3.5 text-[14px] font-semibold text-white"
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

      {/* 6. Trust grid */}
      <div className="mt-6">
        <TrustGrid product={selectedProduct} />
      </div>

      {/* 7. WhatsApp panel (personalization) */}
      <WellnessRoutinePanel
        context={{
          ...attribution,
          productInterestSku: selectedProduct.sku,
          recommendedSku: selectedProduct.sku,
          journeyStage: "cotizacion_pendiente",
        }}
        product={selectedProduct}
      />

      {/* 8. FAQ */}
      <WellnessFaq product={selectedProduct} />

      {/* 9. Other products (preserved, re-styled) */}
      {products.filter((p) => p.sku !== selectedProduct.sku).length > 0 && (
        <section className="px-4 py-10">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-[#d3fa99]">
            Cambiar producto
          </p>
          <h2
            className="mb-4 text-[20px] font-medium leading-snug text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            La misma landing sirve para otro SKU.
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {products
              .filter((product) => product.sku !== selectedProduct.sku)
              .slice(0, 3)
              .map((product) => (
                <a
                  href={campaignPath(product)}
                  key={product.sku}
                  className="flex min-w-[120px] flex-col gap-2 rounded-2xl border border-white/10 bg-[#16200f] p-2"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={product.title}
                    src={product.imageUrl}
                    className="aspect-square w-full rounded-xl object-cover"
                  />
                  <span className="text-[11px] leading-snug text-white">
                    {product.title}
                  </span>
                </a>
              ))}
          </div>
        </section>
      )}

      {/* 10. Sticky CTA bar — TrackedWhatsAppLink internally via WellnessStickyCta */}
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
