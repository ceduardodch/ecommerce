import type { Metadata } from "next"
import { BookOpen, MessageCircle, ShieldCheck } from "lucide-react"
import { getProducts } from "../../../lib/catalog"
import {
  TrackedEventLink,
  TrackedWhatsAppLink,
} from "../../components/analytics"
import { PromoBar } from "../../components/ui/promo-bar"
import { SiteHeader } from "../../components/ui/site-header"

export const metadata: Metadata = {
  title: "PFAS, PFOA y teflón explicado simple | Eter Niu Cocina",
  description:
    "Guía educativa para elegir antiadherentes con información segura sobre PFAS, PFOA, PTFE y ollas de granito.",
}

export default async function TeflonPfasGuidePage() {
  const products = await getProducts()
  const featured =
    products.find((product) => product.id === "prod-wok-granito-32") ||
    products[0]

  return (
    <div data-theme="cocina">
      <PromoBar message="Envío gratis a todo Ecuador · Paga al recibir" />
      <SiteHeader
        vertical="cocina"
        compact
        surface="dark"
        backHref="/guias"
        compactTitle="PFAS y Teflón"
      />

      <main className="bg-[#10160e] pb-20">
        {/* Reading layout: max-w-[65ch], centred */}
        <div className="mx-auto max-w-[65ch] px-4">

          {/* Article hero */}
          <div className="pt-10 pb-8">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-[#d3fa99]">
              Elección informada
            </p>
            <h1
              className="text-[40px] font-medium leading-[1.15] text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              PFAS, PFOA y teflón sin sustos ni promesas médicas.
            </h1>
            <p className="mt-3 text-[16px] text-[#b8c2ae]">
              Esta guía explica por qué muchas familias buscan alternativas a
              antiadherentes tradicionales, y por qué no publicamos claims
              fuertes sin certificación del proveedor.
            </p>
          </div>

          {/* Article body — Fraunces on h2, prose with max-w-[65ch] already set */}
          <article className="space-y-8 text-[16px] text-white">

            <section>
              <h2
                className="mb-2 text-[28px] font-medium text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                La idea simple
              </h2>
              <p className="text-[#b8c2ae] leading-relaxed">
                PFAS es una familia amplia de sustancias usadas en productos que
                resisten aceite, agua, manchas o calor. Algunas se han usado en
                recubrimientos antiadherentes y otros materiales de contacto con
                alimentos. Por eso hablamos de elección informada, no de miedo.
              </p>
            </section>

            <section>
              <h2
                className="mb-2 text-[28px] font-medium text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Qué sí podemos decir
              </h2>
              <ul className="space-y-2 text-[#b8c2ae] leading-relaxed">
                <li className="flex items-start gap-2">
                  <ShieldCheck
                    size={16}
                    className="mt-1 flex-none text-[#d3fa99]"
                  />
                  Muchas personas prefieren alternativas a antiadherentes
                  tradicionales.
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck
                    size={16}
                    className="mt-1 flex-none text-[#d3fa99]"
                  />
                  El granito es una opción práctica para cocinar con menos
                  aceite.
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck
                    size={16}
                    className="mt-1 flex-none text-[#d3fa99]"
                  />
                  Una olla vieja, rayada o mal cuidada pierde confianza de uso.
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck
                    size={16}
                    className="mt-1 flex-none text-[#d3fa99]"
                  />
                  Las declaraciones sobre PFOA, PFAS o PTFE deben estar
                  respaldadas.
                </li>
              </ul>
            </section>

            <section>
              <h2
                className="mb-2 text-[28px] font-medium text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Qué no vamos a decir
              </h2>
              <p className="text-[#b8c2ae] leading-relaxed">
                No afirmamos que un material cause enfermedades, no damos
                diagnósticos y no prometemos beneficios médicos. Si un proveedor
                certifica una condición técnica, se publica con esa base; si no,
                se mantiene como "por confirmar".
              </p>
            </section>

            <section>
              <h2
                className="mb-2 text-[28px] font-medium text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Cómo elegir en casa
              </h2>
              <p className="text-[#b8c2ae] leading-relaxed">
                Si cocinas para una o dos personas, empieza por 20 cm. Para una
                familia, 24 cm suele ser más práctico. Si haces salteados,
                shakshuka, arroz o recetas amplias, el wok 32 cm es el producto
                estrella.
              </p>
            </section>

            <section>
              <h2
                className="mb-2 text-[20px] font-medium text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Fuentes editoriales
              </h2>
              <ul className="space-y-2 text-[14px]">
                <li>
                  <a
                    href="https://www.cancer.org/cancer/risk-prevention/chemicals/teflon-and-perfluorooctanoic-acid-pfoa.html"
                    className="text-[#d3fa99] underline underline-offset-2"
                    target="_blank"
                    rel="noreferrer"
                  >
                    American Cancer Society sobre PFOA, PFOS y PFAS
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.epa.gov/pfas/our-current-understanding-human-health-and-environmental-risks-pfas"
                    className="text-[#d3fa99] underline underline-offset-2"
                    target="_blank"
                    rel="noreferrer"
                  >
                    EPA sobre riesgos y exposición a PFAS
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.fda.gov/food/process-contaminants-food/questions-and-answers-pfas-food"
                    className="text-[#d3fa99] underline underline-offset-2"
                    target="_blank"
                    rel="noreferrer"
                  >
                    FDA preguntas y respuestas sobre PFAS en alimentos
                  </a>
                </li>
              </ul>
            </section>

          </article>

          {/* Inline advisory — no card box */}
          <div className="mt-12 border-t border-white/15 pt-8 pb-4 space-y-4">
            <div className="flex items-start gap-3">
              <ShieldCheck size={22} className="mt-0.5 flex-none text-[#d3fa99]" />
              <div>
                <h2
                  className="text-[20px] font-medium text-white"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Recomendación segura
                </h2>
                <p className="mt-1 text-[14px] text-[#b8c2ae]">
                  Recomendamos desde catálogo real, preguntamos por uso y
                  presupuesto, y evitamos frases médicas absolutas.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {featured ? (
                <TrackedWhatsAppLink
                  className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-[14px] font-semibold text-white"
                  placement="pfas_guide_aside"
                  product={featured}
                >
                  <MessageCircle size={18} />
                  Elegir mi olla
                </TrackedWhatsAppLink>
              ) : null}
              <TrackedEventLink
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-[14px] font-medium text-white hover:border-[var(--accent)] transition-colors"
                cta="pfas_guide_club"
                href="/#club"
                placement="pfas_guide_aside"
                type="guide_downloaded"
                metadata={{
                  journeyStage: "lead_nuevo",
                  leadMagnet: "guia_pfas",
                  followupSequence: [
                    "dia_0_guia",
                    "dia_2_tamano",
                    "dia_7_cuidado",
                    "dia_30_complemento",
                    "dia_90_recompra",
                  ],
                }}
              >
                <BookOpen size={18} />
                Recibir guía + cupón
              </TrackedEventLink>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
