import { PageAmbient } from "./components/ui/page-ambient"
import type { Metadata } from "next"
import { getProducts, type Product } from "../lib/catalog"
import { kitchenBaseUrl } from "../lib/domains"
import { PageAnalytics } from "./components/analytics"
import { PromoBar } from "./components/ui/promo-bar"
import { SiteHeader } from "./components/ui/site-header"
import { SiteFooter } from "./components/ui/site-footer"
import { StickyCTABar } from "./components/ui/sticky-cta-bar"
import { HeroShowcase } from "./components/ui/hero-showcase"
import { ProductShowcaseGrid } from "./components/ui/product-showcase-grid"

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

// ---- data -------------------------------------------------------------------

const HERO_SKU = "MGC-WOK-GRANITO-32"

// Orden del grid: separa las ollas 18/20 (comparten foto) y cierra con la promo.
const GRID_ORDER = [
  "MGC-OLLA-GRANITO-20",
  "COC-SARTEN-PLANO-GRANITO-22",
  "MGC-OLLA-GRANITO-18",
  "COC-CUCHILLO-SAMURAI-TODO-USO",
]

function gridRank(p: Product) {
  const i = GRID_ORDER.indexOf(p.sku)
  return i === -1 ? 99 : i
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
  const cocina = products.filter((p) => p.vertical === "cocina")
  const hero =
    cocina.find((p) => p.sku === HERO_SKU) || cocina[0] || products[0]
  const rest = cocina
    .filter((p) => p.sku !== hero.sku)
    .sort((a, b) => gridRank(a) - gridRank(b))

  const waHref = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_SELLER_NUMBER || "593979854905"}?text=${encodeURIComponent("Hola, quiero asesoría sobre ollas de granito Eter Niu.")}`

  return (
    <div data-theme="cocina" className="relative isolate bg-[#10160e]">
      <PageAmbient />
      <PageAnalytics
        category={selectedCategory}
        featured={hero}
        query={query}
      />

      {/* 1. Promo bar (ya oscura, funde con el canvas) */}
      <PromoBar message="Envío gratis a todo Ecuador · Paga al recibir" />

      {/* 2. Header dark */}
      <SiteHeader vertical="cocina" surface="dark" />

      <main className="bg-[#10160e] pb-28">
        {/* 3. Hero: producto protagonista con destellos */}
        <HeroShowcase product={hero} />

        {/* 4. Grid editorial de la colección */}
        <ProductShowcaseGrid products={rest} />
      </main>

      {/* 5. Footer (ya oscuro) */}
      <SiteFooter />

      {/* 6. Sticky WhatsApp del wok, aparece tras 300px (el hero ya tiene CTA) */}
      <StickyCTABar
        surface="dark"
        product={hero}
        placement="home_sticky_cta"
        price={`$${hero.price.amount.toFixed(2)}`}
        waHref={waHref}
        waLabel="Pedir por WhatsApp"
        alwaysVisible={false}
      />
    </div>
  )
}
