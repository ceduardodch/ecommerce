import { PageAmbient } from "./components/ui/page-ambient";
import type { Metadata } from "next";
import { getProducts, type Product } from "../lib/catalog";
import { kitchenBaseUrl } from "../lib/domains";
import { buildOrganizationJsonLd, buildWebSiteJsonLd } from "../lib/seo";
import { PageAnalytics } from "./components/analytics";
import { PromoBar } from "./components/ui/promo-bar";
import { SiteHeader } from "./components/ui/site-header";
import { SiteFooter } from "./components/ui/site-footer";
import { StickyCTABar } from "./components/ui/sticky-cta-bar";
import { HeroShowcase } from "./components/ui/hero-showcase";
import { ProductShowcaseGrid } from "./components/ui/product-showcase-grid";
import { ComboBuilder } from "./components/sahara-combo-builder";
import { sellerWhatsappNumber } from "../lib/whatsapp";

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
  if (!hero) {
    const message = encodeURIComponent(
      "Hola Vicky, no pude ver el catálogo en la web. ¿Me ayudas a elegir un producto?",
    );
    return (
      <div data-theme="cocina" className="min-h-screen bg-[#10160e] text-[#fcfcf7]">
        <PageAmbient />
        <PromoBar message="Envío y disponibilidad sujetos a confirmación" />
        <SiteHeader vertical="cocina" surface="dark" />
        <main className="mx-auto flex min-h-[62vh] max-w-3xl items-center px-5 py-16">
          <section
            className="w-full rounded-[28px] border border-white/10 bg-white/[0.06] p-7 text-center shadow-2xl sm:p-12"
            aria-labelledby="catalog-unavailable-title"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d3fa99]">
              Catálogo en actualización
            </p>
            <h1
              id="catalog-unavailable-title"
              className="mt-3 text-3xl font-semibold sm:text-4xl"
            >
              Vicky puede ayudarte ahora
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-white/75">
              No mostramos precios ni stock hasta recuperar el catálogo real. Escríbenos y te ayudamos a elegir sin inventar datos.
            </p>
            <a
              href={`https://wa.me/${sellerWhatsappNumber()}?text=${message}`}
              className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-[#d3fa99] px-6 py-3 font-semibold text-[#10160e] no-underline transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d3fa99]"
            >
              Hablar con Vicky por WhatsApp
            </a>
          </section>
        </main>
        <SiteFooter />
      </div>
    );
  }
  const rest = cocina
    .filter((p) => p.sku !== hero.sku)
    .sort((a, b) => gridRank(a) - gridRank(b));

  const organizationJsonLd = buildOrganizationJsonLd(
    "Eter Niu Cocina",
    kitchenBaseUrl,
  );
  const websiteJsonLd = buildWebSiteJsonLd("Eter Niu Cocina", kitchenBaseUrl);

  return (
    <div data-theme="cocina" className="relative isolate bg-[#10160e]">
      <script
        type="application/ld+json"
        // El contenido lo construimos nosotros desde constantes del sitio, no
        // viene del usuario; JSON.stringify ya escapa las comillas del texto.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
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
