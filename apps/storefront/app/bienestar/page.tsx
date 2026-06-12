import type { Metadata } from "next"
import {
  ArrowRight,
  Droplets,
  Leaf,
  MessageCircle,
  Moon,
  SunMedium,
  Truck,
  BadgeDollarSign,
} from "lucide-react"
import Image from "next/image"
import {
  getWellnessProducts,
  productSlug,
  type Product,
} from "../../lib/catalog"
import { commercialInfo } from "../../lib/commercial"
import { kitchenBaseUrl, publicCampaignPath, wellnessBaseUrl } from "../../lib/domains"
import { wellnessOpeningLine } from "../../lib/wellness"
import { TrackedWhatsAppLink } from "../components/analytics"
import { PromoBar } from "../components/ui/promo-bar"
import { SiteHeader } from "../components/ui/site-header"
import { SectionHead } from "../components/ui/section"
import { StickyCTABar } from "../components/ui/sticky-cta-bar"
import { WellnessAnalytics } from "./components/wellness-interactions"

export const metadata: Metadata = {
  title: "Eter Niu Bienestar | Rutinas, pausa y regalos",
  description:
    "Vertical de bienestar para campanas por producto, asesoria por WhatsApp y seguimiento CRM.",
  alternates: {
    canonical: wellnessBaseUrl,
  },
  openGraph: {
    title: "Eter Niu Bienestar",
    description:
      "Productos para hidratacion, movimiento suave y pausas en casa.",
    images: ["/media/wellness-tambor-lengua-real.jpg"],
    type: "website",
    url: wellnessBaseUrl,
    siteName: "Eter Niu Bienestar",
  },
}

function money(amount: number) {
  return `$${amount.toFixed(2)}`
}

function campaignPath(product: Product) {
  return publicCampaignPath("bienestar", productSlug(product), product.sku)
}

// ---- Components ------------------------------------------------------------

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

function WellnessProductCard({ product }: { product: Product }) {
  const commerce = commercialInfo(product)

  return (
    <article className="flex flex-col rounded-2xl border border-[#E8E2D8] bg-white overflow-hidden">
      <a href={campaignPath(product)} className="block">
        <div className="relative w-full aspect-[4/5] bg-[#EFE9DD]">
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, 280px"
            className="object-cover"
          />
          {(product.promoLabel || product.category) && (
            <span className="absolute top-2 left-2 rounded-full bg-[var(--accent)] px-2 py-0.5 text-[11px] font-medium text-white">
              {product.promoLabel || product.category}
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
          {product.description && (
            <p className="mt-0.5 text-[11px] text-[#6B6B66] line-clamp-2">
              {product.description}
            </p>
          )}
        </div>
        <div className="mt-auto space-y-2">
          <div className="flex items-center gap-2 text-[11px] text-[#6B6B66]">
            <span className="text-[14px] font-medium text-[var(--accent)]">
              {money(product.price.amount)}
            </span>
            {product.stockSignal && <span>· {product.stockSignal}</span>}
            <span>· {commerce.freeShippingLabel}</span>
          </div>
          <div className="flex gap-2">
            <a
              href={campaignPath(product)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-[#E8E2D8] px-3 py-2 text-[12px] font-medium text-[#1A1A18] hover:border-[var(--accent)] transition-colors"
            >
              Ver landing
              <ArrowRight size={13} />
            </a>
            <TrackedWhatsAppLink
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#25D366] px-3 py-2 text-[12px] font-semibold text-white"
              cta="wellness_card_whatsapp"
              eventType="product_interest"
              extraEventTypes={["whatsapp_opened"]}
              leadId={`lead_bienestar_home_${product.sku}_card`}
              metadata={{
                vertical: "bienestar",
                productInterestSku: product.sku,
                recommendedSku: product.sku,
                journeyStage: "product_interest",
              }}
              placement="wellness_product_card"
              product={product}
              source="storefront"
              whatsappContext={{
                openingLine: wellnessOpeningLine(product),
                vertical: "bienestar",
                source: "storefront",
                recommendation: product.bundleUseCase || product.title,
                recommendedSku: product.sku,
                journeyStage: "product_interest",
              }}
            >
              <MessageCircle size={13} />
              WhatsApp
            </TrackedWhatsAppLink>
          </div>
        </div>
      </div>
    </article>
  )
}

// ---- Page ------------------------------------------------------------------

export default async function WellnessPage() {
  const products = await getWellnessProducts()
  const featured = products[0]

  const waHref = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_SELLER_NUMBER || "593979854905"}?text=${encodeURIComponent("Hola, quiero asesoría sobre productos de bienestar Eter Niu.")}`

  return (
    <div data-theme="bienestar">
      <WellnessAnalytics
        context={{
          vertical: "bienestar",
          journeyStage: "vertical_home",
        }}
        placement="wellness_home"
        product={featured}
      />

      {/* 1. Promo bar */}
      <PromoBar message="Envío gratis a todo Ecuador · Paga al recibir" />

      {/* 2. Header */}
      <SiteHeader vertical="bienestar" />

      <main className="bg-[#FAF7F2] pb-24">

        {/* 3. Hero */}
        <section className="px-4 pt-8 pb-6" aria-label="Bienestar diario">
          <div className="relative overflow-hidden rounded-2xl bg-[#EFE9DD] aspect-[4/5] max-h-[480px]">
            <Image
              src="/media/wellness-tambor-lengua-real.jpg"
              alt="Productos de sonido y pausa Eter Niu"
              fill
              priority
              sizes="(max-width: 640px) 100vw, 640px"
              className="object-cover"
            />
            {/* Scrim for legibility — functional gradient (approved) */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A18]/70 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-[#B7C4B1]">
                Eter Niu Bienestar
              </p>
              <h1
                className="text-[40px] font-medium leading-[1.15] text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Bienestar diario para crear pausas en casa.
              </h1>
              <p className="mt-2 text-[14px] text-[#EFE9DD] max-w-[36ch]">
                Elevan tu alma y tu hogar. Productos para hidratación,
                movimiento suave y regalos conscientes.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3">
            <a
              href="#productos"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-5 py-3 text-[14px] font-semibold text-white"
            >
              Ver productos bienestar
              <ArrowRight size={18} />
            </a>
            {featured ? (
              <TrackedWhatsAppLink
                className="flex w-full items-center justify-center gap-2 rounded-full border border-[#E8E2D8] bg-white px-5 py-3 text-[14px] font-medium text-[#1A1A18]"
                cta="wellness_hero_whatsapp"
                eventType="product_interest"
                extraEventTypes={["whatsapp_opened"]}
                leadId={`lead_bienestar_home_${featured.sku}_hero`}
                metadata={{
                  vertical: "bienestar",
                  productInterestSku: featured.sku,
                  recommendedSku: featured.sku,
                  journeyStage: "vertical_home",
                }}
                placement="wellness_hero"
                product={featured}
                source="storefront"
                whatsappContext={{
                  openingLine: wellnessOpeningLine(featured),
                  vertical: "bienestar",
                  source: "storefront",
                  recommendation: "asesoria de bienestar por producto",
                  recommendedSku: featured.sku,
                  journeyStage: "vertical_home",
                }}
              >
                <MessageCircle size={18} />
                Asesoría por WhatsApp
              </TrackedWhatsAppLink>
            ) : null}
          </div>
        </section>

        {/* 4. Rhythm grid — pilares del vertical */}
        <section
          className="px-4 pb-8"
          id="rutinas"
          aria-label="Pilares de bienestar"
        >
          <SectionHead eyebrow="Tu rutina" title="Tres pilares de bienestar." />
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                icon: <Droplets size={22} className="text-[var(--accent)]" />,
                label: "Hidratación",
                desc: "Botellas y rutinas para oficina o movimiento.",
              },
              {
                icon: <SunMedium size={22} className="text-[var(--accent)]" />,
                label: "Movimiento",
                desc: "Mat, pausas activas y accesorios de yoga.",
              },
              {
                icon: <Moon size={22} className="text-[var(--accent)]" />,
                label: "Pausa",
                desc: "Aroma, sonido y regalos de autocuidado.",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center gap-2 rounded-[14px] bg-[#EFE9DD] p-3 text-center"
              >
                {item.icon}
                <span className="text-[12px] font-medium text-[#1A1A18]">
                  {item.label}
                </span>
                <span className="text-[11px] text-[#6B6B66] leading-snug">
                  {item.desc}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Product grid */}
        <section className="px-4 pb-8" id="productos" aria-label="Catálogo de bienestar">
          <SectionHead
            eyebrow="Catálogo piloto"
            title="Productos listos para pedir por WhatsApp."
          />
          {products.length ? (
            <div className="grid grid-cols-2 gap-3">
              {products.map((product) => (
                <WellnessProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#E8E2D8] bg-white py-12 text-center">
              <Leaf size={26} className="text-[var(--accent)]" />
              <h2
                className="text-[20px] font-medium text-[#1A1A18]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Bienestar está listo para productos reales.
              </h2>
              <p className="text-[14px] text-[#6B6B66] max-w-[40ch]">
                Carga productos en Medusa con tag o metadata{" "}
                <code className="text-[12px]">bienestar</code> para que
                aparezcan aquí sin mezclar con cocina.
              </p>
            </div>
          )}
        </section>

        {/* 6. Operating strip — propuesta de valor */}
        <section
          className="px-4 pb-8"
          aria-label="Cómo funciona"
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {[
              {
                icon: <Truck size={22} className="text-[var(--accent)]" />,
                title: "Envío y pago claros",
                desc: "El cliente llega al chat sabiendo precio, envío y formas de pago.",
              },
              {
                icon: <MessageCircle size={22} className="text-[var(--accent)]" />,
                title: "Vicky sin menú genérico",
                desc: "El primer mensaje incluye SKU, vertical, Lead y fuente.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex gap-3 rounded-2xl border border-[#E8E2D8] bg-white p-4"
              >
                <div className="flex-none pt-0.5">{item.icon}</div>
                <div>
                  <p className="text-[13px] font-semibold text-[#1A1A18]">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-[12px] text-[#6B6B66]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Trust row */}
        <div className="px-4 pb-6">
          <TrustRow product={featured} />
        </div>

        {/* Link to cocina */}
        <div className="px-4 pb-4 text-center">
          <a
            href={kitchenBaseUrl}
            className="text-[13px] text-[#6B6B66] underline underline-offset-2"
          >
            Ver también: Cocina →
          </a>
        </div>

      </main>

      {/* Sticky advisory bar — no product on home, generic fallback */}
      <StickyCTABar
        waHref={waHref}
        waLabel="Asesoría por WhatsApp"
        alwaysVisible={false}
      />
    </div>
  )
}
