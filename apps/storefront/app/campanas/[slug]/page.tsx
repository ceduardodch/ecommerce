import { existsSync } from "node:fs"
import { join } from "node:path"
import type { Metadata } from "next"
import {
  BadgeDollarSign,
  CheckCircle2,
  CookingPot,
  Leaf,
  MessageCircle,
  ShieldCheck,
  Timer,
  Truck,
  Utensils,
} from "lucide-react"
import { getProducts, productPath, type Product } from "../../../lib/catalog"
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
import { Badge } from "../../components/ui/badge"
import { PromoBar } from "../../components/ui/promo-bar"
import { SiteHeader } from "../../components/ui/site-header"
import { VideoFrame } from "../../components/ui/video-frame"
import { PriceTag } from "../../components/ui/price-tag"

type CampaignPageProps = {
  params: Promise<{ slug: string }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export const dynamic = "force-dynamic"
export const revalidate = 0

const defaultCampaignSku = "MGC-WOK-GRANITO-32"

export async function generateMetadata({
  params,
  searchParams,
}: CampaignPageProps): Promise<Metadata> {
  const { slug } = await params
  const query = searchParams ? await searchParams : {}
  const products = await getProducts()
  const selectedProduct =
    productBySku(products, paramValue(query.sku)) ||
    productBySku(products, defaultCampaignSku) ||
    products[0]
  const complement = selectedProduct
    ? isKitchenComplement(selectedProduct)
    : false
  const title = selectedProduct
    ? `${selectedProduct.title} | Campana Eter Niu Cocina`
    : "Campana Eter Niu Cocina"
  const description = selectedProduct
    ? complement
      ? "Mira el producto real, reclama cupon, confirma stock y cierra por WhatsApp."
      : "Landing de campana con video real, cupon, envio gratis y cierre por WhatsApp."
    : "Landing de campana Eter Niu Cocina con cierre por WhatsApp."
  const image = selectedProduct?.imageUrl || "/media/photo-hero-cocina.jpg"

  return {
    title,
    description,
    alternates: {
      canonical: `${kitchenBaseUrl}/campanas/${slug}`,
    },
    openGraph: {
      title: selectedProduct
        ? `${selectedProduct.title} con cupon`
        : "Campana Eter Niu Cocina",
      description,
      images: [image],
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

function campaignProduct(product: Product): Product {
  if (
    product.sku === "COC-CUCHILLO-SAMURAI-TODO-USO" &&
    (!product.originalPrice ||
      product.originalPrice.amount <= product.price.amount) &&
    product.price.amount <= 29.99
  ) {
    return {
      ...product,
      originalPrice: { amount: 50, currency: "USD" },
      promoLabel: product.promoLabel || "Oferta especial",
    }
  }

  return product
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

function isKnifeProduct(product: Product) {
  return [product.category, product.title, product.sku, ...(product.tags || [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes("cuchillo")
}

function isKitchenComplement(product: Product) {
  return (
    isKnifeProduct(product) ||
    product.stoveCompatibility?.toLowerCase().includes("no aplica")
  )
}

function campaignSlots(product: Product) {
  const direct = mediaSlots.filter((slot) =>
    slot.productSkus.includes(product.sku),
  )
  if (direct.length) {
    const hero = direct[0] || mediaSlots[0]
    const proofs = direct.filter((slot) => slot.id !== hero.id).slice(0, 3)

    return { hero, proofs }
  }

  if (isKitchenComplement(product)) {
    const hero: MediaSlot = {
      id: `${product.sku.toLowerCase()}-real`,
      title: `Mira ${product.title}`,
      label: "Producto real",
      poster: product.imageUrl,
      video: "",
      metric:
        product.bundleUseCase || "Foto real del producto antes de pedirlo.",
      cta: "Consultar stock con cupon",
      productSkus: [product.sku],
      proofPoints: [
        product.category,
        product.material || "producto real",
        product.deliveryBadge || "stock por WhatsApp",
      ],
      eventType: "video_interest",
    }

    return { hero, proofs: [] }
  }

  const fallback = mediaSlots.filter((slot) =>
    ["hero-cocina", "detalle-wok", "receta-wok"].includes(slot.id),
  )
  const hero = fallback[0] || mediaSlots[0]
  const proofs = fallback.filter((slot) => slot.id !== hero.id).slice(0, 3)

  return { hero, proofs }
}

type CampaignPhoto = {
  file: string
  label: string
  title: string
  text: string
}

function campaignPhotos(product: Product): CampaignPhoto[] {
  if (!isKnifeProduct(product)) return []

  return [
    {
      file: "photo-cuchillo-samurai-vertical.jpg",
      label: "Producto completo",
      title: "Forma curva todo uso",
      text: "Vista real de hoja, mango y tamano antes de pedirlo.",
    },
    {
      file: "photo-cuchillo-samurai-full.jpg",
      label: "Perfil",
      title: "Hoja curva",
      text: "Perfil amplio para cortes de preparacion diaria.",
    },
    {
      file: "photo-cuchillo-samurai-textura.jpg",
      label: "Detalle",
      title: "Textura de hoja",
      text: "Toma cercana del acabado y la zona de agarre.",
    },
    {
      file: "photo-cuchillo-samurai-mango.jpg",
      label: "Mango",
      title: "Agarre y remaches",
      text: "Mango visible para revisar comodidad antes de escribir.",
    },
  ].filter((photo) => mediaPath(photo.file))
}

/** Trust grid: 3 columns with icon + caption (maqueta 2.3 point 6) */
function TrustGrid({ product }: { product: Product }) {
  const commerce = commercialInfo(product)
  const complement = isKitchenComplement(product)

  return (
    <div className="grid grid-cols-3 divide-x divide-[#E8E2D8] border-y border-[#E8E2D8]">
      <div className="flex flex-col items-center gap-1.5 px-2 py-4 text-center">
        <Truck size={20} className="text-[#1A1A18]" />
        <span className="text-[10.5px] leading-snug text-[#6B6B66]">
          {commerce.freeShippingLabel}
        </span>
      </div>
      <div className="flex flex-col items-center gap-1.5 px-2 py-4 text-center">
        <BadgeDollarSign size={20} className="text-[#1A1A18]" />
        <span className="text-[10.5px] leading-snug text-[#6B6B66]">
          Pagas al recibir
        </span>
      </div>
      <div className="flex flex-col items-center gap-1.5 px-2 py-4 text-center">
        {complement ? <Utensils size={20} className="text-[#1A1A18]" /> : <ShieldCheck size={20} className="text-[#1A1A18]" />}
        <span className="text-[10.5px] leading-snug text-[#6B6B66]">
          Garantia 6 meses
        </span>
      </div>
    </div>
  )
}

/** Photo gallery for knife product */
function CampaignPhotoGallery({
  product,
  attribution,
}: {
  product: Product
  attribution: CampaignAttribution
}) {
  const photos = campaignPhotos(product)
  if (!photos.length) return null

  return (
    <section className="px-4 py-10" aria-label="Fotos reales">
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-[var(--accent)]">
        Mira el producto de cerca
      </p>
      <h2 className="mb-4 text-[20px] font-medium leading-snug text-[#1A1A18]" style={{ fontFamily: "var(--font-display)" }}>
        Fotos reales para confirmar antes de pedir.
      </h2>
      <div className="grid grid-cols-2 gap-2">
        {photos.map((photo) => (
          <div key={photo.file} className="overflow-hidden rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={`${photo.title} de ${product.title}`}
              src={`/media/${photo.file}`}
              className="w-full aspect-square object-cover"
            />
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-2xl border border-[#E8E2D8] bg-white p-4">
        <p className="mb-1 text-[14px] font-medium text-[#1A1A18]">
          Oferta de lanzamiento: $29.99
        </p>
        <p className="mb-4 text-[12px] text-[#6B6B66]">
          Envio gratis por Servientrega y pago por transferencia, deuna! o PayPhone.
        </p>
        <TrackedWhatsAppLink
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-[14px] font-semibold text-white"
          cta="campaign_photo_gallery_whatsapp"
          eventType="campaign_cta_click"
          extraEventTypes={["whatsapp_opened"]}
          leadId={`lead_${attribution.campaignSlug}_${product.sku}_photos`}
          metadata={{
            ...attribution,
            source: "meta_ads",
            journeyStage: "cotizacion_pendiente",
            productInterestSku: product.sku,
            recommendedSku: product.sku,
            photoProofShown: true,
          }}
          placement="campaign_photo_gallery"
          product={product}
          source="meta_ads"
          whatsappContext={{
            ...attribution,
            source: "meta_ads",
            recommendation: "vio fotos reales de hoja, mango y textura",
            recommendedSku: product.sku,
            journeyStage: "cotizacion_pendiente",
          }}
        >
          <MessageCircle size={18} />
          Reclamar oferta
        </TrackedWhatsAppLink>
      </div>
    </section>
  )
}

/** FAQ section (conserved content, re-styled) */
function CampaignFaq({ product }: { product: Product }) {
  const commerce = commercialInfo(product)
  const complement = isKitchenComplement(product)

  const items = [
    {
      icon: <Timer size={20} className="text-[var(--accent)]" />,
      title: "Hay stock",
      body: `${product.stockSignal || `${product.stock} disponibles`}.`,
    },
    {
      icon: <ShieldCheck size={20} className="text-[var(--accent)]" />,
      title: complement ? "Para que sirve" : "Por que granito",
      body: complement
        ? product.bundleUseCase ||
          "Complemento practico para preparar ingredientes antes de cocinar."
        : product.healthAngle ||
          "Es una alternativa a antiadherentes tradicionales para cocinar con menos aceite.",
    },
    {
      icon: <Leaf size={20} className="text-[var(--accent)]" />,
      title: "Como se cuida",
      body:
        product.careTips ||
        (complement
          ? "Lavalo y secalo despues de usarlo. Evita golpes fuertes y guardalo protegido."
          : "Usa utensilios suaves, fuego medio y esponja no abrasiva."),
    },
    {
      icon: <CheckCircle2 size={20} className="text-[var(--accent)]" />,
      title: "Que incluye el cupon",
      body: `Cupon ${commerce.couponCode}, ${commerce.freeShippingLabel.toLowerCase()} y confirmacion de entrega por WhatsApp.`,
    },
  ]

  return (
    <section className="px-4 py-10" aria-label="Dudas frecuentes">
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-[var(--accent)]">
        FAQ
      </p>
      <h2 className="mb-6 text-[20px] font-medium leading-snug text-[#1A1A18]" style={{ fontFamily: "var(--font-display)" }}>
        Antes de escribir a Vicky.
      </h2>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.title} className="flex gap-3 rounded-2xl border border-[#E8E2D8] bg-white p-4">
            <div className="mt-0.5 shrink-0">{item.icon}</div>
            <div>
              <p className="mb-1 text-[14px] font-medium text-[#1A1A18]">{item.title}</p>
              <p className="text-[13px] leading-snug text-[#6B6B66]">{item.body}</p>
            </div>
          </div>
        ))}
      </div>
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
  const defaultProduct =
    productBySku(products, defaultCampaignSku) || products[0]
  const selectedProductCandidate =
    productBySku(products, requestedSku) || defaultProduct

  if (!selectedProductCandidate) {
    return (
      <main data-theme="cocina" className="min-h-screen bg-[#FAF7F2]">
        <PromoBar />
        <section className="px-4 py-16 text-center text-[14px] text-[#6B6B66]">
          No hay productos de cocina disponibles para esta campana.
        </section>
      </main>
    )
  }

  const selectedProduct = campaignProduct(selectedProductCandidate)

  const fallbackUsed = Boolean(
    requestedSku && requestedSku !== selectedProduct.sku,
  )
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
  const complement = isKitchenComplement(selectedProduct)
  const promo = hasPromo(selectedProduct)
  const savings =
    promo && selectedProduct.originalPrice
      ? selectedProduct.originalPrice.amount - selectedProduct.price.amount
      : 0

  const heroVideo = mediaPath(hero.video)
  const heroVideoSrc = heroVideo || undefined
  const heroPoster = hero.poster || selectedProduct.imageUrl

  return (
    <main data-theme="cocina" className="min-h-screen bg-[#FAF7F2] pb-24">
      <CampaignAnalytics
        context={{
          ...attribution,
          productInterestSku: selectedProduct.sku,
          recommendedSku: selectedProduct.sku,
          journeyStage: "view_content",
        }}
        product={selectedProduct}
      />

      {/* 1. Promo bar */}
      <PromoBar />

      {/* 2. Header mínimo */}
      <SiteHeader
        compact
        compactTitle={selectedProduct.category}
        backHref={productPath(selectedProduct)}
        vertical="cocina"
      />

      {/* 3. Hero video 9:16 con pills */}
      <div className="relative px-4 pt-4">
        {heroVideoSrc ? (
          <VideoFrame
            src={heroVideoSrc}
            poster={heroPoster}
            ratio="9/16"
            label="Ver en uso"
          />
        ) : (
          <div className="relative aspect-[9/16] overflow-hidden rounded-[14px] bg-[#E8E2D8]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={hero.title}
              src={heroPoster}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        )}

        {/* Pill: discount badge top-left */}
        {promo && savings > 0 && (
          <div className="absolute left-6 top-6">
            <Badge tone="accent">
              -{Math.round((savings / selectedProduct.originalPrice!.amount) * 100)}% hoy
            </Badge>
          </div>
        )}
        {selectedProduct.promoLabel && !promo && (
          <div className="absolute left-6 top-6">
            <Badge tone="accent">{selectedProduct.promoLabel}</Badge>
          </div>
        )}
      </div>

      {/* 4. Eyebrow → H1 → subcopy */}
      <div className="px-4 pt-6">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-[var(--accent)]">
          {complement
            ? `${selectedProduct.category} · todo uso`
            : `Granito Eter Niu · ${selectedProduct.category}`}
        </p>
        <h1
          className="mb-2 text-[clamp(28px,8vw,40px)] font-medium leading-[1.15] text-[#1A1A18]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {selectedProduct.title}
        </h1>
        <p className="mb-5 text-[14px] leading-snug text-[#6B6B66]">
          {complement
            ? "Mira el producto real, confirma stock y reclama el cupon por WhatsApp sin pasar por catalogo largo."
            : "Mira el producto real, confirma si sirve para tu cocina y reclama el cupon por WhatsApp sin pasar por catalogo largo."}
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
            <span className="text-[12px] text-[#6B6B66]">
              Ahorra {money(savings)}
            </span>
          )}
        </div>

        {/* Hero CTA */}
        <TrackedWhatsAppLink
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3.5 text-[14px] font-semibold text-white"
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

      {/* 6. Trust grid */}
      <div className="mt-6">
        <TrustGrid product={selectedProduct} />
      </div>

      {/* 7. Proof videos (when available) */}
      {proofs.length > 0 && (
        <div className="px-4 pt-10">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-[var(--accent)]">
            Pruebas rapidas
          </p>
          <h2 className="mb-4 text-[20px] font-medium leading-snug text-[#1A1A18]" style={{ fontFamily: "var(--font-display)" }}>
            Antes de escribir, mira lo que vas a pedir.
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {proofs.map((slot) => {
              const slotVideo = mediaPath(slot.video)
              return slotVideo ? (
                <VideoFrame
                  key={slot.id}
                  src={slotVideo}
                  poster={slot.poster}
                  ratio="9/16"
                  label={slot.label}
                />
              ) : (
                <div
                  key={slot.id}
                  className="relative aspect-[9/16] overflow-hidden rounded-[14px] bg-[#E8E2D8]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={slot.title}
                    src={slot.poster}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
              )
            })}
          </div>
          <TrackedWhatsAppLink
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3.5 text-[14px] font-semibold text-white"
            cta={`campaign_proofs_whatsapp`}
            eventType="campaign_cta_click"
            extraEventTypes={["whatsapp_opened"]}
            leadId={`lead_${slug}_${selectedProduct.sku}_proofs`}
            metadata={{
              ...attribution,
              source: "meta_ads",
              journeyStage: "interes_video",
              productInterestSku: selectedProduct.sku,
              recommendedSku: selectedProduct.sku,
            }}
            placement="campaign_proofs"
            product={selectedProduct}
            source="meta_ads"
            whatsappContext={{
              ...attribution,
              source: "meta_ads",
              recommendation: "vio videos de prueba del producto",
              recommendedSku: selectedProduct.sku,
              journeyStage: "interes_video",
            }}
          >
            <MessageCircle size={19} />
            Reclamar cupon por WhatsApp
          </TrackedWhatsAppLink>
        </div>
      )}

      {/* 8. Photo gallery (knife only) */}
      <CampaignPhotoGallery attribution={attribution} product={selectedProduct} />

      {/* 9. WhatsApp panel (personalization) */}
      <CampaignWhatsAppPanel
        context={{
          ...attribution,
          productInterestSku: selectedProduct.sku,
          recommendedSku: selectedProduct.sku,
          journeyStage: "cotizacion_pendiente",
        }}
        product={selectedProduct}
      />

      {/* 10. FAQ */}
      <CampaignFaq product={selectedProduct} />

      {/* 11. Sticky CTA bar — always visible, uses TrackedWhatsAppLink internally via CampaignStickyCta */}
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
