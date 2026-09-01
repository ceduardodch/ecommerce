import { PageAmbient } from "../../components/ui/page-ambient"
import { existsSync } from "node:fs"
import { join } from "node:path"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { BookOpen } from "lucide-react"
import {
  getProductBySlug,
  getProducts,
  productPath,
  productSlug,
  type Product,
} from "../../../lib/catalog"
import { commercialInfo } from "../../../lib/commercial"
import { publicBaseUrlForVertical } from "../../../lib/domains"
import {
  comparableMgcProducts,
  productMedia,
  type ProductMediaItem,
} from "../../../lib/product-media"
import { getReviewSummary, type ReviewSummary } from "../../../lib/reviews"
import { absoluteUrl, canonical } from "../../../lib/seo"
import {
  PageAnalytics,
  TrackedEventLink,
} from "../../components/analytics"
import { AddToCartButton } from "../../components/ui/add-to-cart-button"
import { MaterialMacro } from "../../components/ui/material-macro"
import { ProductGallery } from "../../components/ui/product-gallery"
import { SiteHeader } from "../../components/ui/site-header"
import { SpecTable } from "../../components/ui/spec-table"
import { StickyCTABar } from "../../components/ui/sticky-cta-bar"
import { Breadcrumbs } from "../../components/ui/breadcrumbs"
import { CustomerReviews } from "../../components/ui/customer-reviews"

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
    product.diameterCm
      ? `${product.diameterCm} cm para medir facil`
      : undefined,
    product.careTips,
  ].filter(Boolean) as string[]

  return useCases.length ? useCases : [product.description]
}

/** Build macro items from existing media or fallback to product image */
function macroItems(product: Product) {
  const catalogImages = productMedia(product)
    .filter((item) => item.type === "image")
    .slice(0, 3)
    .map((item) => ({ image: item.src, caption: item.label }))

  if (product.sku.startsWith("MGC-") && catalogImages.length >= 2) {
    return catalogImages
  }

  const knife = [product.category, product.sku, ...(product.tags || [])]
    .join(" ")
    .toLowerCase()
    .includes("cuchillo")

  if (knife) {
    const items = [
      {
        file: "photo-cuchillo-samurai-textura.jpg",
        caption: "Acero inoxidable",
      },
      { file: "photo-cuchillo-samurai-mango.jpg", caption: "Mango ergonomico" },
      {
        file: "photo-cuchillo-samurai-full.jpg",
        caption: "Hoja de uso diario",
      },
    ].filter((i) => mediaPath(i.file))

    if (items.length === 3)
      return items.map((i) => ({
        image: `/media/${i.file}`,
        caption: i.caption,
      }))
  }

  // Granito pots/woks
  const granito = [
    { file: "photo-detalle-wok.jpg", caption: "Granito antiadherente" },
    { file: "photo-uso-diario-gas.jpg", caption: "Base para induccion" },
    { file: "photo-product-utensilios.jpg", caption: "Mango soft-touch" },
  ].filter((i) => mediaPath(i.file))

  if (granito.length === 3)
    return granito.map((i) => ({
      image: `/media/${i.file}`,
      caption: i.caption,
    }))

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

  if (product.diameterCm)
    rows.push({ label: "Diametro", value: `${product.diameterCm} cm` })
  if (product.capacity)
    rows.push({ label: "Capacidad", value: product.capacity })
  if (product.material)
    rows.push({ label: "Material", value: product.material })
  if (
    product.stoveCompatibility &&
    !product.stoveCompatibility.toLowerCase().includes("no aplica")
  ) {
    rows.push({ label: "Cocinas", value: product.stoveCompatibility })
  }
  if (product.pieces && product.pieces > 1)
    rows.push({ label: "Piezas", value: `${product.pieces}` })
  rows.push({
    label: "Garantia",
    value: product.warrantyText || "Confirmar por WhatsApp",
  })
  rows.push({ label: "Envio", value: commerce.freeShippingLabel })
  rows.push({ label: "Cupon", value: commerce.couponCode })

  return rows
}

/**
 * Datos estructurados schema.org de la ficha.
 *
 * Es lo que permite que Google muestre precio, disponibilidad y estrellas en el
 * resultado de búsqueda. El `aggregateRating` se incluye SOLO si hay reseñas
 * reales y visibles en la página: declarar una valoración que el usuario no ve
 * es motivo de acción manual.
 */
function buildProductJsonLd(
  product: Product,
  gallery: ProductMediaItem[],
  reviews?: ReviewSummary,
) {
  const baseUrl = publicBaseUrlForVertical(product.vertical)
  const images = gallery
    .filter((item) => item.type === "image")
    .map((item) => absoluteUrl(item.src, baseUrl))

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description:
      product.healthAngle || product.bundleUseCase || product.description,
    sku: product.sku,
    image: images.length ? images : [absoluteUrl(product.imageUrl, baseUrl)],
    brand: { "@type": "Brand", name: product.brand || "Eter Niu" },
    ...(product.material ? { material: product.material } : {}),
    offers: {
      "@type": "Offer",
      url: absoluteUrl(productPath(product), baseUrl),
      priceCurrency: product.price.currency,
      price: product.price.amount.toFixed(2),
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/PreOrder",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: "Eter Niu" },
    },
    ...(reviews
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: reviews.averageRating.toFixed(1),
            reviewCount: reviews.totalCount,
            bestRating: "5",
            worstRating: "1",
          },
        }
      : {}),
  }
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    return {
      title: "Producto no disponible | Eter Niu Cocina",
      robots: { index: false, follow: true },
    }
  }

  const galleryCover = productMedia(product).find(
    (item) => item.type === "image",
  )

  return {
    title: `${product.title} | Eter Niu Cocina`,
    description:
      product.bundleUseCase ||
      product.description ||
      "Ficha de producto de cocina saludable con cotizacion por WhatsApp.",
    // La canónica apunta a la ficha misma. Sin esto heredaba la del layout y
    // cada producto se declaraba duplicado de la portada — es decir, la página
    // a la que apunta el feed de Meta le pedía a Google que no la indexara.
    ...canonical(productPath(product), publicBaseUrlForVertical(product.vertical)),
    openGraph: {
      title: product.title,
      description: product.healthAngle || product.description,
      images: [galleryCover?.src || product.imageUrl],
      type: "website",
      url: productPath(product),
    },
  }
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params
  const products = await getProducts()
  const product =
    products.find((item) => productSlug(item) === decodeURIComponent(slug)) ||
    (await getProductBySlug(slug))

  if (!product) notFound()

  const catalogProducts = products.some((item) => item.id === product.id)
    ? products
    : [product, ...products]

  const gallery = productMedia(product)
  const comparableProducts = comparableMgcProducts(product, catalogProducts)
  const promo = hasPromo(product)
  const related = relatedProducts(product, catalogProducts)
  const useCases = productUseCases(product)
  const reviewSummary = await getReviewSummary(product.id)
  const productJsonLd = buildProductJsonLd(product, gallery, reviewSummary)
  return (
    <main
      data-theme="cocina"
      className="relative isolate min-h-screen bg-[#10160e] pb-28"
    >
      <script
        type="application/ld+json"
        // El contenido lo construimos nosotros desde el catálogo, no viene del
        // usuario; JSON.stringify ya escapa las comillas del texto.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <PageAmbient />
      <PageAnalytics featured={product} />

      {/* 1. Mini-header: back · name uppercase · share */}
      <SiteHeader
        compact
        compactTitle={product.category}
        backHref="/"
        vertical="cocina"
        surface="dark"
      />

      {/* 1.5. Breadcrumbs (desktop-only) */}
      <div className="px-4 pt-4">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: product.category || "Productos" },
            { label: product.title },
          ]}
        />
      </div>

      {/* Galería y compra: dos columnas en escritorio; una columna en móvil. */}
      <section className="mx-auto grid w-full max-w-6xl gap-8 px-4 pt-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)] lg:items-start lg:pt-8">
        <div className="relative mx-auto w-full max-w-[560px] lg:sticky lg:top-6">
          <ProductGallery media={gallery} productName={product.title} />
        </div>

        <div className="min-w-0 pt-1 lg:pt-5">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-[#d3fa99]">
          {product.category}
        </p>
        {(product.collection || product.color) && (
          <p className="mb-2 text-[12px] font-medium text-[#b8c2ae]">
            {[product.collection, product.color].filter(Boolean).join(" · ")}
          </p>
        )}
        <h1
          className="mb-2 text-[28px] font-medium leading-snug text-white"
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
                className="text-[#d3fa99]"
                aria-hidden="true"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-[11px] text-[#b8c2ae]">
            Clientes reales por WhatsApp
          </span>
        </div>

        {/* 4. Description */}
        <p className="mb-5 text-[13px] leading-snug text-[#b8c2ae]">
          {product.bundleUseCase || product.description}
        </p>

        {comparableProducts.length > 1 && (
          <section className="mb-5" aria-label="Otras colecciones disponibles">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-[#b8c2ae]">
              Otros colores y colecciones
            </p>
            <div className="flex flex-wrap gap-2">
              {comparableProducts.map((item) => {
                const current = item.sku === product.sku
                return (
                  <a
                    key={item.sku}
                    href={productPath(item)}
                    aria-current={current ? "page" : undefined}
                    className={`rounded-full border px-3 py-2 text-[12px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#d3fa99] ${
                      current
                        ? "border-[#d3fa99] bg-[#d3fa99] text-[#10160e]"
                        : "border-white/25 text-white hover:border-white/60"
                    }`}
                  >
                    {item.collection} · {item.color}
                  </a>
                )
              })}
            </div>
          </section>
        )}

        {/* Price */}
        <div className="mb-5 flex items-baseline gap-3">
          {promo && product.originalPrice && (
            <span className="text-[15px] text-[#b8c2ae] line-through">
              {money(product.originalPrice.amount)}
            </span>
          )}
          <span className="text-[26px] font-medium leading-none text-[#d3fa99]">
            PVP {money(product.price.amount)}
          </span>
          <span className="text-[12px] text-[#b8c2ae]">stock al cotizar el carrito</span>
        </div>
        {product.comboPrice && (
          <div className="mb-5 rounded-xl border border-emerald-300/30 bg-emerald-300/10 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-200">
              Precio verde por combo
            </p>
            <p className="mt-1 text-[18px] font-semibold text-emerald-200">
              {money(product.comboPrice.amount)} c/u desde{" "}
              {product.comboMinimumItems || 3} productos
            </p>
          </div>
        )}

        <AddToCartButton
          product={product}
          label="Agregar al carrito"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#d3fa99] px-5 py-3.5 text-[14px] font-semibold text-[#10160e] hover:opacity-90 transition-opacity cursor-pointer"
        />
        <p className="mt-3 text-center text-[12px] text-[#b8c2ae]">
          Agrega varias piezas y pide ayuda con tu combo desde el carrito.
        </p>
        </div>
      </section>

      {/* 5. "El material, de cerca" (patrón Material Kitchen) */}
      <div className="px-4 pt-10">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-[#d3fa99]">
          El material, de cerca
        </p>
        <h2
          className="mb-4 text-[20px] font-medium leading-snug text-white"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Mira lo que vas a recibir.
        </h2>
        <MaterialMacro items={macroItems(product)} />
      </div>

      {/* 6. Spec table (patrón Caraway) */}
      <div className="px-4 pt-10">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-[#d3fa99]">
          Especificaciones
        </p>
        <h2
          className="mb-4 text-[20px] font-medium leading-snug text-white"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Todo lo que necesitas saber.
        </h2>
        <SpecTable rows={specRows(product)} />
      </div>

      {/* Use cases */}
      {useCases.length > 0 && (
        <div className="px-4 pt-10">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-[#d3fa99]">
            Para que sirve
          </p>
          <h2
            className="mb-4 text-[20px] font-medium leading-snug text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Usos recomendados.
          </h2>
          <ul className="space-y-2">
            {useCases.map((item) => (
              <li key={item} className="flex gap-2 text-[14px] text-[#b8c2ae]">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#d3fa99]" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Health / safety note */}
      {product.healthAngle && (
        <div className="mx-4 mt-8 rounded-2xl border border-white/10 bg-[#16200f] p-4">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-[#b8c2ae]">
            Sin miedo, sin promesas medicas
          </p>
          <p className="mb-3 text-[13px] leading-snug text-[#b8c2ae]">
            {product.healthAngle}. Claims como PFAS/PFOA/PTFE se publican solo
            con certificacion del proveedor.
          </p>
          <TrackedEventLink
            className="inline-flex items-center gap-1.5 rounded-full border border-white/40 px-4 py-2 text-[13px] font-medium text-white"
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
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-[#d3fa99]">
            Tambien combina con
          </p>
          <h2
            className="mb-4 text-[20px] font-medium leading-snug text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Arma tu cocina por piezas.
          </h2>
          <div className="space-y-3">
            {related.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 rounded-2xl border border-white/10 bg-[#16200f] p-3"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={item.title}
                  src={item.imageUrl}
                  className="h-16 w-16 shrink-0 rounded-xl object-cover"
                />
                <div className="flex min-w-0 flex-col justify-between py-0.5">
                  <div>
                    <span className="block text-[11px] text-[#b8c2ae]">
                      {item.category}
                    </span>
                    <p className="text-[14px] font-medium text-white leading-snug">
                      {item.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[14px] font-medium text-[#d3fa99]">
                      {money(item.price.amount)}
                    </span>
                    <a
                      href={productPath(item)}
                      className="text-[12px] text-[#b8c2ae] underline"
                    >
                      Ver ficha
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. Customer Reviews Section */}
      <section className="px-4 py-12" aria-label="Reseñas de clientes">
        <div className="max-w-4xl mx-auto">
          <h2 className="mb-2 text-[24px] font-semibold text-[#b8c2ae]">
            Lo que dicen nuestros clientes
          </h2>
          <p className="text-[13px] text-[#7a8a72] mb-6">
            Reseñas reales de clientes que compraron este producto
          </p>

          <CustomerReviews
            productId={product.id}
            productSku={product.sku}
            productName={product.title}
          />
        </div>
      </section>

      {/* Carrito fijo: WhatsApp queda al final del pedido completo. */}
      <StickyCTABar
        surface="dark"
        alwaysVisible
        price={money(product.price.amount)}
        product={product}
        placement="ficha_sticky"
        waLabel="Agregar al carrito"
      />
    </main>
  )
}
