import type { Metadata } from "next"
import {
  BookOpen,
  ChefHat,
  ClipboardCheck,
  MessageCircle,
  ShieldCheck,
} from "lucide-react"
import { getProducts } from "../../lib/catalog"
import {
  TrackedEventLink,
  TrackedWhatsAppLink,
} from "../components/analytics"

export const metadata: Metadata = {
  title: "Guias de cocina saludable | Eter Niu Cocina",
  description:
    "Guias simples para elegir ollas de granito, cuidar el antiadherente y cocinar con menos aceite.",
}

export default async function GuidesPage() {
  const products = await getProducts()
  const featured = products[0]

  return (
    <main className="guide-page">
      <header className="topbar">
        <a className="brand-mark" href="/">
          <ChefHat size={22} />
          <span>Eter Niu Cocina</span>
        </a>
        <nav>
          <a href="/">Tienda</a>
          <a href="/guias/teflon-pfas">PFAS</a>
          <a href="/#club">Club</a>
        </nav>
      </header>

      <section className="guide-hero">
        <p className="eyebrow">Guia Cocina Saludable</p>
        <h1>Compra una olla pensando en tu cocina real.</h1>
        <p className="hero-subcopy">
          Tamano, cuidado, material y uso diario explicados sin promesas medicas
          ni lenguaje complicado.
        </p>
      </section>

      <section className="guide-layout">
        <div className="guide-list">
          <TrackedEventLink
            cta="guide_pfas_card"
            href="/guias/teflon-pfas"
            placement="guides_index"
            type="campaign_click"
          >
            <ShieldCheck size={24} />
            <h2>PFAS, PFOA y teflon explicado simple</h2>
            <p>
              Que significa elegir alternativas a antiadherentes tradicionales y
              por que los claims fuertes deben tener certificacion.
            </p>
          </TrackedEventLink>
          <TrackedEventLink
            cta="guide_sizes_card"
            href="/#productos"
            placement="guides_index"
            type="campaign_click"
          >
            <BookOpen size={24} />
            <h2>20 cm, 24 cm o wok 32 cm</h2>
            <p>
              20 cm para porciones pequenas, 24 cm para familia y wok 32 cm
              para recetas amplias, salteados y preparaciones con tapa.
            </p>
          </TrackedEventLink>
          <TrackedEventLink
            cta="guide_care_card"
            href="/#club"
            placement="guides_index"
            type="campaign_click"
          >
            <ClipboardCheck size={24} />
            <h2>Como cuidar una olla de granito</h2>
            <p>
              Fuego medio, utensilios suaves, limpieza con esponja no abrasiva y
              seguimiento postventa para mantener el recubrimiento.
            </p>
          </TrackedEventLink>
        </div>

        <aside className="article-aside">
          <h2>Asesoria rapida</h2>
          <p>
            Si no sabes que tamano elegir, la IA debe preguntarte para cuantas
            personas cocinas, tu cocina y que preparas mas seguido.
          </p>
          {featured ? (
            <TrackedWhatsAppLink
              className="primary-button"
              placement="guides_aside"
              product={featured}
            >
              <MessageCircle size={18} />
              Preguntar por WhatsApp
            </TrackedWhatsAppLink>
          ) : null}
        </aside>
      </section>
    </main>
  )
}
