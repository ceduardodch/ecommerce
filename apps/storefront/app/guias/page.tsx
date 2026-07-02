import type { Metadata } from "next"
import {
  BookOpen,
  ClipboardCheck,
  MessageCircle,
  ShieldCheck,
} from "lucide-react"
import { getProducts } from "../../lib/catalog"
import {
  TrackedEventLink,
  TrackedWhatsAppLink,
} from "../components/analytics"
import { PromoBar } from "../components/ui/promo-bar"
import { SiteHeader } from "../components/ui/site-header"
import { SiteFooter } from "../components/ui/site-footer"

export const metadata: Metadata = {
  title: "Guías de cocina saludable | Eter Niu Cocina",
  description:
    "Guías simples para elegir ollas de granito, cuidar el antiadherente y cocinar con menos aceite.",
}

export default async function GuidesPage() {
  const products = await getProducts()
  const featured = products[0]

  return (
    <div data-theme="cocina">
      <PromoBar message="Envío gratis a todo Ecuador · Paga al recibir" />
      <SiteHeader vertical="cocina" compact surface="dark" backHref="/" compactTitle="Guías" />

      <main className="bg-[#10160e] pb-20">
        {/* Reading layout: max-w-[65ch], centred */}
        <div className="mx-auto max-w-[65ch] px-4">

          {/* Hero */}
          <div className="pt-10 pb-8">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-[#d3fa99]">
              Guía Cocina Saludable
            </p>
            <h1
              className="text-[40px] font-medium leading-[1.15] text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Compra una olla pensando en tu cocina real.
            </h1>
            <p className="mt-3 text-[16px] text-[#b8c2ae]">
              Tamaño, cuidado, material y uso diario explicados sin promesas
              médicas ni lenguaje complicado.
            </p>
          </div>

          {/* Guide list — no cards, plain editorial links */}
          <nav aria-label="Guías disponibles">
            <ul className="space-y-0 divide-y divide-white/10">
              <li>
                <TrackedEventLink
                  className="group flex items-start gap-4 py-5 no-underline"
                  cta="guide_pfas_card"
                  href="/guias/teflon-pfas"
                  placement="guides_index"
                  type="campaign_click"
                >
                  <ShieldCheck
                    size={22}
                    className="mt-0.5 flex-none text-[#d3fa99]"
                  />
                  <div>
                    <h2
                      className="text-[20px] font-medium text-white group-hover:text-[#d3fa99] transition-colors"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      PFAS, PFOA y teflón explicado simple
                    </h2>
                    <p className="mt-1 text-[14px] text-[#b8c2ae]">
                      Qué significa elegir alternativas a antiadherentes
                      tradicionales y por qué los claims fuertes deben tener
                      certificación.
                    </p>
                  </div>
                </TrackedEventLink>
              </li>

              <li>
                <TrackedEventLink
                  className="group flex items-start gap-4 py-5 no-underline"
                  cta="guide_sizes_card"
                  href="/#productos"
                  placement="guides_index"
                  type="campaign_click"
                >
                  <BookOpen
                    size={22}
                    className="mt-0.5 flex-none text-[#d3fa99]"
                  />
                  <div>
                    <h2
                      className="text-[20px] font-medium text-white group-hover:text-[#d3fa99] transition-colors"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      20 cm, 24 cm o wok 32 cm
                    </h2>
                    <p className="mt-1 text-[14px] text-[#b8c2ae]">
                      20 cm para porciones pequeñas, 24 cm para familia y wok
                      32 cm para recetas amplias, salteados y preparaciones con
                      tapa.
                    </p>
                  </div>
                </TrackedEventLink>
              </li>

              <li>
                <TrackedEventLink
                  className="group flex items-start gap-4 py-5 no-underline"
                  cta="guide_care_card"
                  href="/#club"
                  placement="guides_index"
                  type="campaign_click"
                >
                  <ClipboardCheck
                    size={22}
                    className="mt-0.5 flex-none text-[#d3fa99]"
                  />
                  <div>
                    <h2
                      className="text-[20px] font-medium text-white group-hover:text-[#d3fa99] transition-colors"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      Cómo cuidar una olla de granito
                    </h2>
                    <p className="mt-1 text-[14px] text-[#b8c2ae]">
                      Fuego medio, utensilios suaves, limpieza con esponja no
                      abrasiva y seguimiento postventa para mantener el
                      recubrimiento.
                    </p>
                  </div>
                </TrackedEventLink>
              </li>
            </ul>
          </nav>

          {/* Aside-style advisory — inline, no card box */}
          <div className="mt-10 border-t border-[#E8E2D8] pt-8 pb-4">
            <h2
              className="text-[20px] font-medium text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Asesoría rápida
            </h2>
            <p className="mt-2 mb-5 text-[14px] text-[#b8c2ae]">
              Si no sabes qué tamaño elegir, cuéntanos para cuántas personas
              cocinas, tu tipo de cocina y qué preparas más seguido.
            </p>
            {featured ? (
              <TrackedWhatsAppLink
                className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-[14px] font-semibold text-white"
                placement="guides_aside"
                product={featured}
              >
                <MessageCircle size={18} />
                Preguntar por WhatsApp
              </TrackedWhatsAppLink>
            ) : null}
          </div>

        </div>
      </main>

      {/* Footer 4 columnas — INTEG-5 */}
      <SiteFooter />
    </div>
  )
}
