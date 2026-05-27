import type { Metadata } from "next"
import { BookOpen, ChefHat, MessageCircle, ShieldCheck } from "lucide-react"
import { getProducts } from "../../../lib/catalog"
import {
  TrackedEventLink,
  TrackedWhatsAppLink,
} from "../../components/analytics"

export const metadata: Metadata = {
  title: "PFAS, PFOA y teflon explicado simple | Eter Niu Cocina",
  description:
    "Guia educativa para elegir antiadherentes con informacion segura sobre PFAS, PFOA, PTFE y ollas de granito.",
}

export default async function TeflonPfasGuidePage() {
  const products = await getProducts()
  const featured =
    products.find((product) => product.id === "prod-wok-granito-32") ||
    products[0]

  return (
    <main className="article-page">
      <header className="topbar">
        <a className="brand-mark" href="/">
          <ChefHat size={22} />
          <span>Eter Niu Cocina</span>
        </a>
        <nav>
          <a href="/">Tienda</a>
          <a href="/guias">Guias</a>
          <a href="/#club">Club</a>
        </nav>
      </header>

      <section className="article-hero">
        <p className="eyebrow">Eleccion informada</p>
        <h1>PFAS, PFOA y teflon sin sustos ni promesas medicas.</h1>
        <p className="hero-subcopy">
          Esta guia explica por que muchas familias buscan alternativas a
          antiadherentes tradicionales, y por que no publicamos claims fuertes
          sin certificacion del proveedor.
        </p>
      </section>

      <section className="article-layout">
        <article className="article-body">
          <section>
            <h2>La idea simple</h2>
            <p>
              PFAS es una familia amplia de sustancias usadas en productos que
              resisten aceite, agua, manchas o calor. Algunas se han usado en
              recubrimientos antiadherentes y otros materiales de contacto con
              alimentos. Por eso hablamos de eleccion informada, no de miedo.
            </p>
          </section>

          <section>
            <h2>Que si podemos decir</h2>
            <ul>
              <li>Muchas personas prefieren alternativas a antiadherentes tradicionales.</li>
              <li>El granito es una opcion practica para cocinar con menos aceite.</li>
              <li>Una olla vieja, rayada o mal cuidada pierde confianza de uso.</li>
              <li>Las declaraciones sobre PFOA, PFAS o PTFE deben estar respaldadas.</li>
            </ul>
          </section>

          <section>
            <h2>Que no vamos a decir</h2>
            <p>
              No afirmamos que un material cause enfermedades, no damos
              diagnosticos y no prometemos beneficios medicos. Si un proveedor
              certifica una condicion tecnica, se publica con esa base; si no,
              se mantiene como "por confirmar".
            </p>
          </section>

          <section>
            <h2>Como elegir en casa</h2>
            <p>
              Si cocinas para una o dos personas, empieza por 20 cm. Para una
              familia, 24 cm suele ser mas practico. Si haces salteados,
              shakshuka, arroz o recetas amplias, el wok 32 cm es el producto
              estrella.
            </p>
          </section>

          <section>
            <h2>Fuentes editoriales</h2>
            <ul className="source-list">
              <li>
                <a href="https://www.cancer.org/cancer/risk-prevention/chemicals/teflon-and-perfluorooctanoic-acid-pfoa.html">
                  American Cancer Society sobre PFOA, PFOS y PFAS
                </a>
              </li>
              <li>
                <a href="https://www.epa.gov/pfas/our-current-understanding-human-health-and-environmental-risks-pfas">
                  EPA sobre riesgos y exposicion a PFAS
                </a>
              </li>
              <li>
                <a href="https://www.fda.gov/food/process-contaminants-food/questions-and-answers-pfas-food">
                  FDA preguntas y respuestas sobre PFAS en alimentos
                </a>
              </li>
            </ul>
          </section>
        </article>

        <aside className="article-aside">
          <ShieldCheck size={28} />
          <h2>Recomendacion segura</h2>
          <p>
            El vendedor IA debe recomendar desde catalogo real, preguntar por
            uso y presupuesto, y evitar frases medicas absolutas.
          </p>
          {featured ? (
            <TrackedWhatsAppLink
              className="primary-button"
              placement="pfas_guide_aside"
              product={featured}
            >
              <MessageCircle size={18} />
              Elegir mi olla
            </TrackedWhatsAppLink>
          ) : null}
          <TrackedEventLink
            className="secondary-button"
            cta="pfas_guide_club"
            href="/#club"
            placement="pfas_guide_aside"
            type="lead_created"
            metadata={{ leadMagnet: "guia_pfas" }}
          >
            <BookOpen size={18} />
            Recibir guia + cupon
          </TrackedEventLink>
        </aside>
      </section>
    </main>
  )
}
