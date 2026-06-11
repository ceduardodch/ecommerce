import { existsSync } from "node:fs"
import { join } from "node:path"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import {
  BookOpen,
  MessageCircle,
} from "lucide-react"
import {
  getProductBySlug,
  getProducts,
  productPath,
  productSlug,
  type Product,
} from "../../../lib/catalog"
import { commercialInfo } from "../../../lib/commercial"
import { mediaSlotForSku } from "../../../lib/content"
import {
  PageAnalytics,
  TrackedEventLink,
  TrackedWhatsAppLink,
} from "../../components/analytics"
import { MaterialMacro } from "../../components/ui/material-macro"
import { SiteHeader } from "../../components/ui/site-header"
import { SpecTable } from "../../components/ui/spec-table"
import { StickyCTABar } from "../../components/ui/sticky-cta-bar"

type ProductPageProps = {
  params: Promise<{ slug: string }>
}

export const dynamic = "force-dynamic"
export const revalidate = 0

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

function relatedProducts(product: Product, products: Product[]) {
  return products
    .filter((item) => item.id !== product.id)
    .filter((item) => {
      if (item.category === product.category) return true
      if (item.bundleEligible && product.bundleEligible) return true
      return item.tags.some((tag) => product.tags.includes(tag))
    })
    .slice(0, 3)
}

function productUseCases(product: Product) {
  const useCases = [
    product.bundleUseCase,
    product.capacity ? `Recomendado para ${product.capacity}` : undefined,
    product.diameterCm ? `${product.diameterCm} cm para medir facil` : undefined,
    product.careTips,
  ].filter(Boolean) as string[]

  return useCases.length ? useCases : [product.description]
}

/** Build macro items from existing media or fallback to product image */
function macroItems(product: Product) {
  const knife = [product.category, product.sku, ...(product.tags || [])]
    .join(" ")
    .toLowerCase()
    .includes("cuchillo")

  if (knife) {
    const items = [
      { file: "photo-cuchillo-samurai-textura.jpg", caption: "Acero inoxidable" },
      { file: "photo-cuchillo-samurai-mango.jpg", caption: "Mango ergonomico" },
      { file: "photo-cuchillo-samurai-full.jpg", caption: "Hoja de uso diario" },
    ].filter((i) => mediaPath(i.file))

    if (items.length === 3) return items.map((i) => ({ image: `/media/${i.file}`, caption: i.caption }))
  }

  // Granito pots/woks
  const granito = [
    { file: "photo-detalle-wok.jpg", caption: "Granito antiadherente" },
    { file: "photo-uso-diario-gas.jpg", caption: "Base para induccion" },
    { file: "photo-product-utensilios.jpg", caption: "Mango soft-touch" },
  ].filter((i) => mediaPath(i.file))

  if (granito.length === 3) return granito.map((i) => ({ image: `/media/${i.file}`, caption: i.caption }))

  // Generic fallback
  return [
    { image: product.imageUrl, caption: product.material || "Material" },
    { image: product.imageUrl, caption: "Vista de detalle" },
    { image: product.imageUrl, caption: "Uso recomendado" },
  ]
}

/** Spec rows built from product data */
function specRows(product: Product) {
  const commerce = commercialInfo(product)
  const rows: { label: string; value: string }[] = []

  if (product.diameterCm) rows.push({ label: "Diametro", value: `${product.diameterCm} cm` })
  if (product.capacity) rows.push({ label: "Capacidad", value: product.capacity })
  if (product.material) rows.push({ label: "Material", value: product.material })
  if (product.stoveCompatibility && !product.stoveCompatibility.toLowerCase().includes("no aplica")) {
    rows.push({ label: "Cocinas", value: product.stoveCompatibility })
  }
  if (product.pieces && product.pieces > 1) rows.push({ label: "Piezas", value: `${product.pieces}` })
  rows.push({ label: "Garantia", value: product.warrantyText || "Confirmar por WhatsApp" })
  rows.push({ label: "Envio", value: commerce.freeShippingLabel })
  rows.push({ label: "Cupon", value: commerce.couponCode })

  return rows
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    return {
      title: "Producto no disponible | Eter Niu Cocina",
    }
  }

  return {
    title: `${product.title} | Eter Niu Cocina`,
    description:
      product.bundleUseCase ||
      product.description ||
      "Ficha de producto de cocina saludable con cotizacion por WhatsApp.",
    openGraph: {
      title: product.title,
      description: product.healthAngle || product.description,
      images: [product.imageUrl],
      type: "website",
      url: productPath(product),
    },
  }
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params
  const products = await getProducts()
  const product = products.find(
    (item) => productSlug(item) === decodeURIComponent(slug),
  )

  if (!product) notFound()

  const slot = mediaSlotForSku(product.sku)
  const video = mediaPath(slot?.video)
  const promo = hasPromo(product)
  const related = relatedProducts(product, products)
  const useCases = productUseCases(product)
  const waHref = (() => {
    // Build the WhatsApp link to embed in StickyCTABar - we use the product's WhatsApp URL
    // The actual link generation happens via TrackedWhatsAppLink in the hero CTA
    return `https://wa.me/593979854915`
  })()

  return (
    <main data-theme="cocina" className="min-h-screen bg-[#FAF7F2] pb-28">
      <PageAnalytics featured={product} />

      {/* 1. Mini-header: back · name uppercase · share */}
      <SiteHeader
        compact
        compactTitle={product.category}
        backHref="/"
        vertical="cocina"
      />

      {/* 2. Gallery 4:5 radius 16 with position dots */}
      <div className="relative px-4 pt-4">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#E8E2D8]">
          {video ? (
            <video
              aria-label={slot?.title || product.title}
              autoPlay
              loop
              muted
              playsInline
              poster={slot?.poster || product.imageUrl}
              className="absolute inset-0 h-full w-full object-cover"
            >
              <source src={video} type="video/mp4" />
            </video>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={product.title}
              src={slot?.poster || product.imageUrl}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          {/* Position indicator dot */}
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            <span className="h-1.5 w-4 rounded-full bg-white" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
          </div>
          {/* Media label pill */}
          {slot?.label && (
            <div className="absolute bottom-8 right-3">
              <span className="rounded-full bg-black/50 px-3 py-1 text-[11px] text-white backdrop-blur-sm">
                {slot.label}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Title Fraunces 28 + 5 stars + social proof */}
      <div className="px-4 pt-5">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-[var(--accent)]">
          {product.category}
        </p>
        <h1
          className="mb-2 text-[28px] font-medium leading-snug text-[#1A1A18]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {product.title}
        </h1>

        {/* 5 stars + social proof */}
        <div className="mb-3 flex items-center gap-2">
          <div className="flex" aria-label="5 estrellas">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                width="14"
                height="14"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="text-[var(--accent)]"
                aria-hidden="true"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-[11px] text-[#6B6B66]">
            Clientes reales por WhatsApp
          </span>
        </div>

        {/* 4. Description */}
        <p className="mb-5 text-[13px] leading-snug text-[#6B6B66]">
          {product.bundleUseCase || product.description}
        </p>

        {/* Price */}
        <div className="mb-5 flex items-baseline gap-3">
          {promo && product.originalPrice && (
            <span className="text-[15px] text-[#6B6B66] line-through">
              {money(product.originalPrice.amount)}
            </span>
          )}
          <span className="text-[26px] font-medium leading-none text-[var(--accent)]">
            {money(product.price.amount)}
          </span>
          <span className="text-[12px] text-[#6B6B66]">stock por WhatsApp</span>
        </div>

        {/* Hero CTA */}
        <TrackedWhatsAppLink
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3.5 text-[14px] font-semibold text-white"
          cta="product_detail_whatsapp"
          eventType="product_interest"
          metadata={{
            journeyStage: "cotizacion_pendiente",
            productInterestSku: product.sku,
            recommendedSku: product.sku,
            videoSlot: slot?.id,
          }}
          placement="product_detail_hero"
          product={product}
          whatsappContext={{
            recommendation:
              product.bundleUseCase || product.healthAngle || product.title,
            recommendedSku: product.sku,
            journeyStage: "cotizacion_pendiente",
            videoSlot: slot?.id,
          }}
        >
          <MessageCircle size={19} />
          Reclamar cupon y consultar stock
        </TrackedWhatsAppLink>
      </div>

      {/* 5. "El material, de cerca" (patrón Material Kitchen) */}
      <div className="px-4 pt-10">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-[var(--accent)]">
          El material, de cerca
        </p>
        <h2
          className="mb-4 text-[20px] font-medium leading-snug text-[#1A1A18]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Mira lo que vas a recibir.
        </h2>
        <MaterialMacro items={macroItems(product)} />
      </div>

      {/* 6. Spec table (patrón Caraway) */}
      <div className="px-4 pt-10">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-[var(--accent)]">
          Especificaciones
        </p>
        <h2
          className="mb-4 text-[20px] font-medium leading-snug text-[#1A1A18]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Todo lo que necesitas saber.
        </h2>
        <SpecTable rows={specRows(product)} />
      </div>

      {/* Use cases */}
      {useCases.length > 0 && (
        <div className="px-4 pt-10">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-[var(--accent)]">
            Para que sirve
          </p>
          <h2
            className="mb-4 text-[20px] font-medium leading-snug text-[#1A1A18]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Usos recomendados.
          </h2>
          <ul className="space-y-2">
            {useCases.map((item) => (
              <li
                key={item}
                className="flex gap-2 text-[14px] text-[#6B6B66]"
              >
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Health / safety note */}
      {product.healthAngle && (
        <div className="mx-4 mt-8 rounded-2xl border border-[#E8E2D8] bg-white p-4">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-[#6B6B66]">
            Sin miedo, sin promesas medicas
          </p>
          <p className="mb-3 text-[13px] leading-snug text-[#6B6B66]">
            {product.healthAngle}. Claims como PFAS/PFOA/PTFE se publican solo con certificacion del proveedor.
          </p>
          <TrackedEventLink
            className="inline-flex items-center gap-1.5 rounded-full border border-[#1A1A18] px-4 py-2 text-[13px] font-medium text-[#1A1A18]"
            cta="product_detail_pfas_guide"
            href="/guias/teflon-pfas"
            placement="product_detail"
            type="campaign_click"
          >
            <BookOpen size={15} />
            Leer guia
          </TrackedEventLink>
        </div>
      )}

      {/* Related products */}
      {related.length > 0 && (
        <div className="px-4 pt-10">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-[var(--accent)]">
            Tambien combina con
          </p>
          <h2
            className="mb-4 text-[20px] font-medium leading-snug text-[#1A1A18]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Arma tu cocina por piezas.
          </h2>
          <div className="space-y-3">
            {related.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 rounded-2xl border border-[#E8E2D8] bg-white p-3"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={item.title}
                  src={item.imageUrl}
                  className="h-16 w-16 shrink-0 rounded-xl object-cover"
                />
                <div className="flex min-w-0 flex-col justify-between py-0.5">
                  <div>
                    <span className="block text-[11px] text-[#6B6B66]">
                      {item.category}
                    </span>
                    <p className="text-[14px] font-medium text-[#1A1A18] leading-snug">
                      {item.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[14px] font-medium text-[var(--accent)]">
                      {money(item.price.amount)}
                    </span>
                    <a
                      href={productPath(item)}
                      className="text-[12px] text-[#6B6B66] underline"
                    >
                      Ver ficha
                    </a>
                    <TrackedWhatsAppLink
                      className="text-[12px] font-medium text-[#25D366]"
                      eventType="product_interest"
                      metadata={{
                        journeyStage: "cotizacion_pendiente",
                        productInterestSku: item.sku,
                        recommendedSku: item.sku,
                      }}
                      placement="product_detail_related"
                      product={item}
                      whatsappContext={{
                        recommendation:
                          item.bundleUseCase || "producto relacionado",
                        recommendedSku: item.sku,
                        journeyStage: "cotizacion_pendiente",
                      }}
                    >
                      WhatsApp
                    </TrackedWhatsAppLink>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Sticky CTA bar: precio izquierda + botón WA — siempre visible (alwaysVisible) */}
      {/* La ficha tiene product en contexto, así que el sticky usa TrackedWhatsAppLink
          (regla #1: ninguna CTA de WhatsApp sin tracking). */}
      <StickyCTABar
        alwaysVisible
        price={money(product.price.amount)}
        product={product}
        placement="ficha_sticky"
        waHref={waHref}
        waLabel="Pedir por WhatsApp"
      />
    </main>
  )
}
