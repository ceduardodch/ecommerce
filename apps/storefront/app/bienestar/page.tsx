import type { Metadata } from "next"
import {
  ArrowRight,
  Droplets,
  HeartHandshake,
  Leaf,
  MessageCircle,
  Moon,
  Sparkles,
  SunMedium,
  Truck,
} from "lucide-react"
import {
  getWellnessProducts,
  productSlug,
  type Product,
} from "../../lib/catalog"
import { commercialInfo } from "../../lib/commercial"
import { kitchenBaseUrl, publicCampaignPath, wellnessBaseUrl } from "../../lib/domains"
import { wellnessOpeningLine } from "../../lib/wellness"
import { TrackedWhatsAppLink } from "../components/analytics"
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

function WellnessProductCard({ product }: { product: Product }) {
  const commerce = commercialInfo(product)

  return (
    <article className="wellness-product-card">
      <a href={campaignPath(product)} className="wellness-product-media">
        <img alt={product.title} src={product.imageUrl} />
        <span>{product.promoLabel || product.category}</span>
      </a>
      <div>
        <p>{product.category}</p>
        <h2>{product.title}</h2>
        <small>{product.description}</small>
        <div className="wellness-product-meta">
          <strong>{money(product.price.amount)}</strong>
          <span>{product.stockSignal}</span>
          <span>{commerce.freeShippingLabel}</span>
        </div>
        <div className="wellness-card-actions">
          <a className="secondary-button" href={campaignPath(product)}>
            Ver landing
            <ArrowRight size={16} />
          </a>
          <TrackedWhatsAppLink
            className="primary-button"
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
            WhatsApp
          </TrackedWhatsAppLink>
        </div>
      </div>
    </article>
  )
}

export default async function WellnessPage() {
  const products = await getWellnessProducts()
  const featured = products[0]

  return (
    <main className="wellness-page">
      <WellnessAnalytics
        context={{
          vertical: "bienestar",
          journeyStage: "vertical_home",
        }}
        placement="wellness_home"
        product={featured}
      />

      <header className="wellness-topbar">
        <a className="brand-mark" href={wellnessBaseUrl}>
          <HeartHandshake size={21} />
          <span>Eter Niu Bienestar</span>
        </a>
        <nav>
          <a href={kitchenBaseUrl}>Cocina</a>
          <a href="#productos">Productos</a>
          <a href="#rutinas">Rutinas</a>
        </nav>
      </header>

      <section className="wellness-hero">
        <div className="wellness-hero-copy">
          <p className="eyebrow">Nuevo vertical</p>
          <h1>Bienestar diario para crear pausas en casa.</h1>
          <p>
            Productos para hidratacion, movimiento suave, sonido, regalos y
            rincones de calma, con asesoria directa por WhatsApp.
          </p>
          <div className="wellness-hero-actions">
            <a className="primary-button" href="#productos">
              Ver productos bienestar
              <ArrowRight size={18} />
            </a>
            {featured ? (
              <TrackedWhatsAppLink
                className="secondary-button"
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
                Asesoria por WhatsApp
              </TrackedWhatsAppLink>
            ) : null}
          </div>
        </div>
        <div className="wellness-hero-media">
          <img
            alt="Productos de sonido y pausa Eter Niu"
            src="/media/wellness-tambor-lengua-real.jpg"
          />
          <div>
            <strong>Producto real del catalogo</strong>
            <span>Sonido, pausa y regalos con stock confirmado por WhatsApp.</span>
          </div>
        </div>
      </section>

      <section className="wellness-rhythm-grid" id="rutinas">
        <article>
          <Droplets size={25} />
          <strong>Hidratacion</strong>
          <span>Botellas y rutinas diarias para oficina o movimiento.</span>
        </article>
        <article>
          <SunMedium size={25} />
          <strong>Movimiento suave</strong>
          <span>Mat, pausas activas y contenido para redes.</span>
        </article>
        <article>
          <Moon size={25} />
          <strong>Pausa en casa</strong>
          <span>Aroma, decoracion y regalos de autocuidado sin claims medicos.</span>
        </article>
      </section>

      <section className="campaign-section-head" id="productos">
        <div>
          <p className="eyebrow">Catalogo piloto</p>
          <h2>Productos listos para pedir por WhatsApp.</h2>
        </div>
        <span>Bienestar separado de cocina</span>
      </section>

      {products.length ? (
        <section className="wellness-product-grid">
          {products.map((product) => (
            <WellnessProductCard key={product.id} product={product} />
          ))}
        </section>
      ) : (
        <section className="wellness-empty">
          <Leaf size={26} />
          <h2>Bienestar esta listo para productos reales.</h2>
          <p>
            Carga productos en Medusa con tag o metadata `bienestar` para que
            aparezcan aqui sin mezclar con cocina.
          </p>
        </section>
      )}

      <section className="wellness-operating-strip">
        <article>
          <Truck size={24} />
          <strong>Envio y pago claros</strong>
          <span>El cliente llega al chat sabiendo precio, envio y formas de pago.</span>
        </article>
        <article>
          <MessageCircle size={24} />
          <strong>Vicky sin menu generico</strong>
          <span>El primer mensaje incluye SKU, vertical, Lead y fuente.</span>
        </article>
        <article>
          <Sparkles size={24} />
          <strong>Campanas reutilizables</strong>
          <span>Meta puede apuntar a una landing por producto, no al catalogo largo.</span>
        </article>
      </section>
    </main>
  )
}
