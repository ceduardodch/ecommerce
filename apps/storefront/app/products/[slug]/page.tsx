import { existsSync } from "node:fs"
import { join } from "node:path"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  BadgeDollarSign,
  BookOpen,
  CheckCircle2,
  ChefHat,
  ClipboardCheck,
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

function DetailCommerceBadges({ product }: { product: Product }) {
  const commerce = commercialInfo(product)

  return (
    <div className="commerce-badges detail-commerce-badges">
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

  return (
    <main className="product-detail-page">
      <PageAnalytics featured={product} />

      <nav className="detail-nav" aria-label="Volver al catalogo">
        <a href="/">
          <ArrowLeft size={18} />
          Volver a la tienda
        </a>
        <a href="/guias/teflon-pfas">
          <BookOpen size={18} />
          Guia PFAS
        </a>
      </nav>

      <section className="product-detail-hero">
        <div className="detail-media">
          {video ? (
            <video
              aria-label={slot?.title || product.title}
              autoPlay
              loop
              muted
              playsInline
              poster={slot?.poster || product.imageUrl}
            >
              <source src={video} type="video/mp4" />
            </video>
          ) : (
            <img alt={product.title} src={slot?.poster || product.imageUrl} />
          )}
          <span>
            <PlayCircle size={17} />
            {slot?.label || "Ficha visual"}
          </span>
        </div>

        <div className="detail-copy">
          <p className="eyebrow">{product.category}</p>
          <h1>{product.title}</h1>
          <p className="hero-subcopy">
            {product.bundleUseCase || product.description}
          </p>

          <div className="detail-price-card">
            <div>
              {promo ? (
                <span className="original-price">
                  {money(product.originalPrice!.amount)}
                </span>
              ) : null}
              <strong>{money(product.price.amount)}</strong>
              {product.promoLabel ? <small>{product.promoLabel}</small> : null}
            </div>
            <TrackedWhatsAppLink
              className="primary-button hero-cta"
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

          <DetailCommerceBadges product={product} />

          <div className="detail-spec-grid">
            {product.material ? (
              <span>
                <Leaf size={17} />
                {product.material}
              </span>
            ) : null}
            {product.diameterCm ? (
              <span>
                <ChefHat size={17} />
                {product.diameterCm} cm
              </span>
            ) : null}
            {product.capacity ? (
              <span>
                <Sparkles size={17} />
                {product.capacity}
              </span>
            ) : null}
            <span>
              <Truck size={17} />
              {commercialInfo(product).freeShippingLabel}
            </span>
            <span>
              <BadgeDollarSign size={17} />
              {commercialInfo(product).paymentMethodsLabel}
            </span>
            <span>
              <CookingPot size={17} />
              {commercialInfo(product).stoveCompatibility}
            </span>
            <span>
              <Timer size={17} />
              {product.stockSignal || `${product.stock} disponibles`}
            </span>
          </div>
        </div>
      </section>

      <section className="product-proof-section">
        <article>
          <ShieldCheck size={22} />
          <h2>Compra con criterio</h2>
          <p>
            {product.healthAngle ||
              "Alternativa a antiadherentes tradicionales para cocina diaria."}
          </p>
        </article>
        <article>
          <ClipboardCheck size={22} />
          <h2>Cuidado simple</h2>
          <p>
            {product.careTips ||
              "Usa utensilios suaves, fuego medio y esponja no abrasiva."}
          </p>
        </article>
        <article>
          <CheckCircle2 size={22} />
          <h2>Garantia y entrega</h2>
          <p>
            {product.warrantyText ||
              "Garantia y entrega se confirman por WhatsApp antes del pago."}
          </p>
        </article>
      </section>

      <section className="detail-layout">
        <div className="detail-panel">
          <p className="eyebrow">Para que sirve</p>
          <h2>Usos recomendados</h2>
          <ul>
            {useCases.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <aside className="detail-panel">
          <p className="eyebrow">Copy seguro</p>
          <h2>Sin miedo, sin promesas medicas</h2>
          <p>
            Hablamos de opcion sin teflon, menos aceite y eleccion informada.
            Claims como PFAS/PFOA/PTFE se publican solo con certificacion del
            proveedor.
          </p>
          <TrackedEventLink
            className="secondary-button"
            cta="product_detail_pfas_guide"
            href="/guias/teflon-pfas"
            placement="product_detail"
            type="campaign_click"
          >
            <BookOpen size={18} />
            Leer guia
          </TrackedEventLink>
        </aside>
      </section>

      {related.length ? (
        <>
          <section className="section-head">
            <div>
              <p className="eyebrow">Tambien combina con</p>
              <h2>Arma tu cocina por piezas</h2>
            </div>
          </section>
          <section
            className="related-products"
            aria-label="Productos relacionados"
          >
            {related.map((item) => (
              <article key={item.id}>
                <img alt={item.title} src={item.imageUrl} />
                <div>
                  <span>{item.category}</span>
                  <h2>{item.title}</h2>
                  <strong>{money(item.price.amount)}</strong>
                  <div className="inline-actions">
                    <a href={productPath(item)}>Ver ficha</a>
                    <TrackedWhatsAppLink
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
                      Ver promo por WhatsApp
                    </TrackedWhatsAppLink>
                  </div>
                </div>
              </article>
            ))}
          </section>
        </>
      ) : null}
    </main>
  )
}
