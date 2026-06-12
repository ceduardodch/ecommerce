import type { Metadata } from "next"
import { BookOpen, MessageCircle, Truck, BadgeDollarSign, Sparkles } from "lucide-react"
import Image from "next/image"
import { getProducts, productPath, type Product } from "../lib/catalog"
import { commercialInfo } from "../lib/commercial"
import { kitchenBaseUrl } from "../lib/domains"
import { LeadCaptureForm } from "./components/lead-capture-form"
import { PotRecommendationQuiz } from "./components/pot-recommendation-quiz"
import { PageAnalytics, TrackedEventLink, TrackedWhatsAppLink } from "./components/analytics"
import { PromoBar } from "./components/ui/promo-bar"
import { SiteHeader } from "./components/ui/site-header"
import { VideoStories } from "./components/ui/video-stories"
import { SectionHead } from "./components/ui/section"
import { StickyCTABar } from "./components/ui/sticky-cta-bar"

export const metadata: Metadata = {
  title: "Eter Niu Cocina | Ollas de granito y guias por WhatsApp",
  description:
    "Ollas, woks y sets de granito para cocinar con menos aceite, videos de uso, guias de cuidado y cotizacion por WhatsApp.",
  metadataBase: new URL(kitchenBaseUrl),
  alternates: { canonical: kitchenBaseUrl },
  openGraph: {
    title: "Eter Niu Cocina",
    description:
      "Ollas y woks de granito con videos, guias y asesor por WhatsApp para elegir segun tu familia y uso diario.",
    url: kitchenBaseUrl,
    siteName: "Eter Niu Cocina",
    type: "website",
  },
}

// ---- helpers ----------------------------------------------------------------

function money(n: number) {
  return `$${n.toFixed(2)}`
}

function hasPromo(p: Product) {
  return p.originalPrice !== undefined && p.originalPrice.amount > p.price.amount
}

function starRank(p: Product) {
  const normalized = `${p.title} ${p.sku}`.toLowerCase()
  if (normalized.includes("wok") && normalized.includes("32")) return 0
  if (normalized.includes("20 cm")) return 1
  if (normalized.includes("18 cm")) return 2
  if (normalized.includes("cuchillo")) return 3
  return 99
}

function isStarProduct(p: Product) {
  return starRank(p) < 99
}

// ---- data -------------------------------------------------------------------

// 4 granito colour chips — narrativa de colección (no variantes reales todavía)
const granitColors = [
  { name: "Negro", hex: "#2B2B28" },
  { name: "Sage", hex: "#B7C4B1" },
  { name: "Crema", hex: "#E8DFCE" },
  { name: "Terracota", hex: "#C97B5A" },
]

// Video stories: 4 clips con poster generado por ffmpeg
const homeStories = [
  {
    src: "/media/hero-cocina.mp4",
    poster: "/media/poster-hero-cocina.jpg",
    label: "Wok en accion",
  },
  {
    src: "/media/detalle-wok.mp4",
    poster: "/media/poster-detalle-wok.jpg",
    label: "Granito de cerca",
  },
  {
    src: "/media/uso-diario-gas.mp4",
    poster: "/media/poster-uso-diario-gas.jpg",
    label: "En hornilla",
  },
  {
    src: "/media/receta-wok.mp4",
    poster: "/media/poster-receta-wok.jpg",
    label: "Receta completa",
  },
]

// Categorías 2×2 patrón Caraway
const categories = [
  { label: "Ollas", icon: "🍲", href: "#productos" },
  { label: "Sartenes", icon: "🍳", href: "#productos" },
  { label: "Woks", icon: "🥢", href: "#productos" },
  { label: "Cuchillos", icon: "🔪", href: "#productos" },
]

// ---- components -------------------------------------------------------------

function TrustRow({ product }: { product?: Product }) {
  const commerce = commercialInfo(product)
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 text-[12px] text-[#6B6B66]">
      <span className="flex items-center gap-1.5">
        <Truck size={14} />
        {commerce.freeShippingLabel}
      </span>
      <span className="flex items-center gap-1.5">
        <BadgeDollarSign size={14} />
        {commerce.paymentMethodsLabel}
      </span>
    </div>
  )
}

function GranitColorPicker({ colors }: { colors: typeof granitColors }) {
  // Static server component: shows the chips, active state handled by Tailwind
  // (Le Creuset pattern — purely visual, links to WhatsApp asesoría)
  return (
    <div className="flex flex-wrap items-center gap-2">
      {colors.map((c, i) => (
        <span key={c.name} className="flex items-center gap-1.5 group">
          <span
            className={`block h-7 w-7 rounded-full border-2 ${i === 0 ? "border-[var(--accent)]" : "border-white ring-1 ring-[#E8E2D8]"}`}
            style={{ background: c.hex }}
            title={c.name}
          />
          {i === 0 && (
            <span className="text-[12px] text-[#1A1A18]">{c.name}</span>
          )}
        </span>
      ))}
    </div>
  )
}

function FeaturedCard({ product }: { product: Product }) {
  const promo = hasPromo(product)
  return (
    <a
      href={productPath(product)}
      className="flex items-center gap-3 rounded-2xl border border-[#E8E2D8] bg-white p-3 no-underline hover:shadow-sm transition-shadow"
    >
      {/* Photo 76px square */}
      <div className="relative h-[76px] w-[76px] flex-none rounded-xl overflow-hidden bg-[#EFE9DD]">
        <Image
          src={product.imageUrl}
          alt={product.title}
          fill
          sizes="76px"
          className="object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium leading-snug text-[#1A1A18] line-clamp-2">
          {product.title}
        </p>
        {product.capacity && (
          <p className="mt-0.5 text-[11px] text-[#6B6B66]">{product.capacity}</p>
        )}
        <div className="mt-1.5 flex items-baseline gap-2">
          {promo && product.originalPrice && (
            <span className="text-[12px] text-[#6B6B66] line-through">
              {money(product.originalPrice.amount)}
            </span>
          )}
          <span className="text-[14px] font-medium text-[var(--accent)]">
            {money(product.price.amount)}
          </span>
        </div>
      </div>
    </a>
  )
}

function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {categories.map((cat) => (
        <a
          key={cat.label}
          href={cat.href}
          className="flex flex-col items-start gap-2 rounded-[14px] bg-[#EFE9DD] px-4 py-5 no-underline hover:bg-[#E8E2D8] transition-colors"
        >
          <span className="text-2xl leading-none" aria-hidden="true">
            {cat.icon}
          </span>
          <span className="text-[14px] font-medium text-[#1A1A18]">{cat.label}</span>
        </a>
      ))}
    </div>
  )
}

function ProductCard({ product }: { product: Product }) {
  const promo = hasPromo(product)
  return (
    <article className="flex flex-col rounded-2xl border border-[#E8E2D8] bg-white overflow-hidden">
      <a href={productPath(product)} className="block">
        <div className="relative w-full aspect-[4/5] bg-[#EFE9DD]">
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, 280px"
            className="object-cover"
          />
          {product.promoLabel && (
            <span className="absolute top-2 left-2 rounded-full bg-[var(--accent)] px-2 py-0.5 text-[11px] font-medium text-white">
              {product.promoLabel}
            </span>
          )}
        </div>
      </a>
      <div className="p-3 flex flex-col gap-2 flex-1">
        <div>
          <p className="text-[11px] text-[#6B6B66]">{product.category}</p>
          <h3 className="text-[14px] font-medium text-[#1A1A18] leading-snug line-clamp-2">
            {product.title}
          </h3>
        </div>
        <div className="mt-auto flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1.5">
            {promo && product.originalPrice && (
              <span className="text-[12px] text-[#6B6B66] line-through">
                {money(product.originalPrice.amount)}
              </span>
            )}
            <span className="text-[16px] font-medium text-[var(--accent)]">
              {money(product.price.amount)}
            </span>
          </div>
          <TrackedWhatsAppLink
            className="flex items-center gap-1.5 rounded-full bg-[#25D366] px-3 py-1.5 text-[12px] font-semibold text-white"
            eventType="product_interest"
            metadata={{
              journeyStage: "cotizacion_pendiente",
              productInterestSku: product.sku,
              recommendedSku: product.sku,
            }}
            placement="home_product_card"
            product={product}
            whatsappContext={{
              recommendation: product.bundleUseCase || product.title,
              recommendedSku: product.sku,
              journeyStage: "cotizacion_pendiente",
            }}
          >
            <MessageCircle size={13} />
            Pedir
          </TrackedWhatsAppLink>
        </div>
      </div>
    </article>
  )
}

// ---- page -------------------------------------------------------------------

type HomeProps = {
  searchParams?: Promise<{ q?: string; category?: string }>
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams
  const query = params?.q || ""
  const selectedCategory = params?.category || ""

  const products = await getProducts()
  const starProducts = products
    .filter(isStarProduct)
    .sort((a, b) => starRank(a) - starRank(b))
  const featured = starProducts[0] || products[0]
  const displayProducts = starProducts.length ? starProducts : products.slice(0, 4)

  const waHref = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_SELLER_NUMBER || "593979854915"}?text=${encodeURIComponent("Hola, quiero asesoría sobre ollas de granito Eter Niu.")}`

  return (
    <div data-theme="cocina">
      <PageAnalytics
        category={selectedCategory}
        featured={featured}
        query={query}
      />

      {/* 1. Promo bar */}
      <PromoBar message="Envío gratis a todo Ecuador · Paga al recibir" />

      {/* 2. Header */}
      <SiteHeader vertical="cocina" />

      <main className="bg-[#FAF7F2] pb-24">

        {/* 3. Video stories — patrón Our Place */}
        <div className="pt-5 pb-4">
          <VideoStories items={homeStories} />
        </div>

        {/* 4. H1 + subcopy */}
        <div className="px-4 pb-6">
          <h1
            className="text-[40px] font-medium leading-[1.15] text-[#1A1A18]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Cocina sano, sin esfuerzo.
          </h1>
          <p className="mt-2 text-[14px] text-[#6B6B66] max-w-[34ch]">
            Granito que se ve rico antes de llegar. Asesórate por WhatsApp y
            elige con stock confirmado.
          </p>
        </div>

        {/* 5. "Elige tu granito" — patrón Le Creuset */}
        <section className="px-4 pb-8" aria-label="Colección de granito">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[var(--accent)]">
            Elige tu granito
          </p>
          <GranitColorPicker colors={granitColors} />
          {featured && (
            <div className="mt-4">
              <FeaturedCard product={featured} />
            </div>
          )}
        </section>

        {/* 6. "Comprar por categoría" — patrón Caraway */}
        <section className="px-4 pb-8" id="productos" aria-label="Categorías">
          <SectionHead eyebrow="Comprar por categoría" title="Elige tu pieza" />
          <CategoryGrid />
        </section>

        {/* 7a. Quiz recomendador — lógica intacta, envuelto en nuevo estilo */}
        <section className="px-4 pb-8">
          <SectionHead
            eyebrow="Elige tu olla ideal"
            title="Vicky recomienda según tu cocina."
          />
          <PotRecommendationQuiz
            products={starProducts.length ? starProducts : products}
          />
        </section>

        {/* 7b. Videos demo — productos en uso */}
        <section className="px-4 pb-8" id="videos" aria-label="Videos de cocina">
          <SectionHead
            eyebrow="Visto en redes"
            title="3 pruebas antes de escribir."
          />
          <div className="space-y-4">
            {displayProducts.slice(0, 3).map((product) => (
              <article key={product.id} className="flex gap-3 rounded-2xl border border-[#E8E2D8] bg-white p-3">
                <div className="relative h-20 w-20 flex-none rounded-xl overflow-hidden bg-[#EFE9DD]">
                  <Image
                    src={product.imageUrl}
                    alt={product.title}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col justify-between flex-1 min-w-0">
                  <div>
                    <p className="text-[11px] text-[#6B6B66]">{product.category}</p>
                    <p className="text-[14px] font-medium text-[#1A1A18] leading-snug line-clamp-2">
                      {product.title}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[14px] font-medium text-[var(--accent)]">
                      {money(product.price.amount)}
                    </span>
                    <TrackedWhatsAppLink
                      className="flex items-center gap-1.5 rounded-full bg-[#25D366] px-3 py-1.5 text-[12px] font-semibold text-white"
                      eventType="product_interest"
                      metadata={{
                        journeyStage: "cotizacion_pendiente",
                        productInterestSku: product.sku,
                        recommendedSku: product.sku,
                      }}
                      placement="home_video_card"
                      product={product}
                      whatsappContext={{
                        recommendation: product.bundleUseCase || product.title,
                        recommendedSku: product.sku,
                        journeyStage: "cotizacion_pendiente",
                      }}
                    >
                      <MessageCircle size={13} />
                      Pedir
                    </TrackedWhatsAppLink>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* 7c. Club / lead-magnet — lógica de submit intacta */}
        <section className="px-4 pb-8" id="club" aria-label="Club Cocina Saludable">
          <SectionHead
            eyebrow="Club Cocina Saludable"
            title="Guía + cupón para decidir hoy."
          />
          <p className="mb-4 text-[14px] text-[#6B6B66]">
            Recibe una guía corta, el cupón y recomendaciones según cuántas
            personas comen en casa.
          </p>
          <div className="flex gap-2 mb-5 text-[11px] text-[#6B6B66]">
            <span>Día 0 guía</span>
            <span>·</span>
            <span>Día 2 tamaño</span>
            <span>·</span>
            <span>Día 7 cuidado</span>
          </div>
          <LeadCaptureForm
            products={products.slice(0, 8).map((p) => ({
              id: p.id,
              sku: p.sku,
              title: p.title,
            }))}
          />
          <div className="mt-4">
            <TrackedEventLink
              className="flex items-center gap-2 text-[14px] text-[#6B6B66] underline-offset-2 underline"
              cta="club_read_guides"
              href="/guias"
              placement="club_secondary"
              type="campaign_click"
            >
              <BookOpen size={15} />
              Ver guías completas
            </TrackedEventLink>
          </div>
        </section>

        {/* Trust row */}
        <div className="px-4 pb-6">
          <TrustRow product={featured} />
        </div>

      </main>

      {/* 8. Sticky bar — asesoría genérica en home (sin product, fallback permitido) */}
      <StickyCTABar
        waHref={waHref}
        waLabel="Asesoría por WhatsApp"
        alwaysVisible={false}
      />
    </div>
  )
}
