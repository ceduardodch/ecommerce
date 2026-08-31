import { PageAmbient } from "./components/ui/page-ambient";
import type { Metadata } from "next";
import { getProducts, type Product } from "../lib/catalog";
import { kitchenBaseUrl } from "../lib/domains";
import { PageAnalytics } from "./components/analytics";
import { PromoBar } from "./components/ui/promo-bar";
import { SiteHeader } from "./components/ui/site-header";
import { SiteFooter } from "./components/ui/site-footer";
import { StickyCTABar } from "./components/ui/sticky-cta-bar";
import { HeroShowcase } from "./components/ui/hero-showcase";
import { ProductShowcaseGrid } from "./components/ui/product-showcase-grid";
import { ComboBuilder } from "./components/sahara-combo-builder";

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
};

// ---- data -------------------------------------------------------------------

const HERO_SKU = "MGC-FR-WOK-32-GN";

// Orden visual: primero la colección francesa y después la europea.
const GRID_ORDER = [
  "MGC-FR-SARTEN-20-GN",
  "MGC-FR-SARTEN-24-GN",
  "MGC-FR-SARTEN-28-GN",
  "MGC-FR-LECHERA-18-GN",
  "MGC-FR-OLLA-20-GN",
  "MGC-FR-OLLA-24-GN",
  "MGC-EU-SARTEN-20-AZ",
  "MGC-EU-SARTEN-24-AZ",
  "MGC-EU-SARTEN-28-AZ",
  "MGC-EU-LECHERA-16-AZ",
  "MGC-EU-OLLA-20-AZ",
  "MGC-EU-OLLA-24-AZ",
];

function gridRank(p: Product) {
  const i = GRID_ORDER.indexOf(p.sku);
  return i === -1 ? 99 : i;
}

// ---- page -------------------------------------------------------------------

type HomeProps = {
  searchParams?: Promise<{ q?: string; category?: string }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const query = params?.q || "";
  const selectedCategory = params?.category || "";

  const products = await getProducts();
  const cocina = products.filter((p) => p.vertical === "cocina");
  const hero =
    cocina.find((p) => p.sku === HERO_SKU) || cocina[0] || products[0];
  const rest = cocina
    .filter((p) => p.sku !== hero.sku)
    .sort((a, b) => gridRank(a) - gridRank(b));

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
        {/* 3. Portada: constructor de combos, la oferta principal. */}
        <ComboBuilder />

        {/* 4. Hero: producto protagonista con destellos */}
        <HeroShowcase product={hero} />

        {/* 5. Grid editorial de la colección */}
        <ProductShowcaseGrid products={rest} />
      </main>

      {/* 6. Footer (ya oscuro) */}
      <SiteFooter />

      {/* 7. Carrito disponible para armar el combo antes de contactar al vendedor. */}
      <StickyCTABar
        surface="dark"
        product={hero}
        placement="home_sticky_cta"
        price={`$${hero.price.amount.toFixed(2)}`}
        waLabel="Agregar al carrito"
        alwaysVisible={false}
      />
    </div>
  );
}
