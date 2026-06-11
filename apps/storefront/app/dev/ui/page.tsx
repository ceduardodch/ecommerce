/**
 * /dev/ui — Página de revisión del sistema de diseño
 * Muestra todos los componentes en ambos themes (cocina + bienestar) a 390px y 1280px.
 * robots: noindex — no indexar.
 */
import type { Metadata } from "next"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { ColorPickerDemo } from "./color-picker-demo"
import { FormField } from "../../components/ui/form-field"
import { Isotipo } from "../../components/ui/isotipo"
import { MaterialMacro } from "../../components/ui/material-macro"
import { PriceTag } from "../../components/ui/price-tag"
import { ProductCard } from "../../components/ui/product-card"
import { PromoBar } from "../../components/ui/promo-bar"
import { Section, SectionHead } from "../../components/ui/section"
import { SiteFooter } from "../../components/ui/site-footer"
import { SiteHeader } from "../../components/ui/site-header"
import { SpecTable } from "../../components/ui/spec-table"
import { VideoStoriesDemo } from "./video-stories-demo"

export const metadata: Metadata = {
  title: "UI Kit — Eter Niu Dev",
  robots: { index: false, follow: false },
}

const sampleProduct = {
  title: "Set MGC Granito 5 piezas",
  subtitle: "Antiadherente sin PFAS · todas las cocinas",
  price: "$89",
  originalPrice: "$149",
  image: "/media/hero-cocina.mp4", // fallback to placeholder
  href: "/products/set-mgc-granito",
  badge: "−40%",
}

const specRows = [
  { label: "Diámetro", value: "24 cm" },
  { label: "Cocinas", value: "Gas · vitro · inducción" },
  { label: "Material", value: "Granito antiadherente" },
  { label: "Garantía", value: "6 meses" },
  { label: "Libre de PFAS", value: "Sí" },
]

const macroItems = [
  { image: "/media/granito-macro-1.jpg", caption: "Granito antiadherente" },
  { image: "/media/granito-macro-2.jpg", caption: "Base inducción" },
  { image: "/media/granito-macro-3.jpg", caption: "Mango soft-touch" },
]

function ThemeSection({
  theme,
  label,
}: {
  theme: "cocina" | "bienestar"
  label: string
}) {
  return (
    <div
      data-theme={theme}
      className="rounded-3xl border border-[#E8E2D8] bg-[#FAF7F2] p-6 space-y-10"
    >
      <h2
        className="text-[20px] font-medium text-[#1A1A18]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Theme: {label}
      </h2>

      {/* PromoBar */}
      <div>
        <p className="mb-2 text-[11px] uppercase tracking-widest text-[#6B6B66]">PromoBar</p>
        <PromoBar />
      </div>

      {/* SiteHeader */}
      <div>
        <p className="mb-2 text-[11px] uppercase tracking-widest text-[#6B6B66]">SiteHeader</p>
        <div className="overflow-hidden rounded-xl border border-[#E8E2D8]">
          <SiteHeader vertical={theme} />
        </div>
      </div>

      {/* SiteHeader compact */}
      <div>
        <p className="mb-2 text-[11px] uppercase tracking-widest text-[#6B6B66]">SiteHeader (compact)</p>
        <div className="overflow-hidden rounded-xl border border-[#E8E2D8]">
          <SiteHeader compact compactTitle="Cuchillo Samurai" />
        </div>
      </div>

      {/* Isotipo */}
      <div>
        <p className="mb-2 text-[11px] uppercase tracking-widest text-[#6B6B66]">Isotipo</p>
        <div className="flex items-center gap-4">
          <Isotipo size={24} color="#1A1A18" />
          <Isotipo size={36} color="#1A1A18" />
          <Isotipo size={56} color="#1A1A18" />
          <Isotipo size={72} color="#1A1A18" />
        </div>
      </div>

      {/* Badges */}
      <div>
        <p className="mb-2 text-[11px] uppercase tracking-widest text-[#6B6B66]">Badge</p>
        <div className="flex flex-wrap gap-2">
          <Badge tone="accent">−40% hoy</Badge>
          <Badge tone="neutral">Stock limitado</Badge>
          <Badge tone="accent">Envío gratis</Badge>
        </div>
      </div>

      {/* Buttons */}
      <div>
        <p className="mb-2 text-[11px] uppercase tracking-widest text-[#6B6B66]">Button</p>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" href="#">Ver productos</Button>
          <Button variant="secondary" href="#">Saber más</Button>
          <Button variant="whatsapp" href="#">WhatsApp (sin tracking)</Button>
        </div>
      </div>

      {/* PriceTag */}
      <div>
        <p className="mb-2 text-[11px] uppercase tracking-widest text-[#6B6B66]">PriceTag</p>
        <div className="space-y-3">
          <PriceTag price="$89" originalPrice="$149" note="stock por WhatsApp" />
          <PriceTag price="$29.99" />
        </div>
      </div>

      {/* SectionHead */}
      <div>
        <p className="mb-2 text-[11px] uppercase tracking-widest text-[#6B6B66]">SectionHead</p>
        <SectionHead eyebrow="Colección granito" title="Elige tu granito" />
      </div>

      {/* Section wrapper */}
      <div>
        <p className="mb-2 text-[11px] uppercase tracking-widest text-[#6B6B66]">Section</p>
        <div className="border border-dashed border-[#E8E2D8] rounded-xl overflow-hidden">
          <Section eyebrow="Categorías" title="Comprar por categoría">
            <p className="text-[14px] text-[#6B6B66]">Contenido de la sección aquí.</p>
          </Section>
        </div>
      </div>

      {/* ProductCard */}
      <div>
        <p className="mb-2 text-[11px] uppercase tracking-widest text-[#6B6B66]">ProductCard</p>
        <div className="grid grid-cols-2 gap-3 max-w-sm">
          <ProductCard product={sampleProduct} />
          <ProductCard
            product={{
              title: "Cuchillo Samurai todo uso",
              price: "$29.99",
              originalPrice: "$49.99",
              image: "/media/cuchillo-hero.jpg",
              href: "/products/cuchillo-samurai",
            }}
          />
        </div>
      </div>

      {/* SpecTable */}
      <div>
        <p className="mb-2 text-[11px] uppercase tracking-widest text-[#6B6B66]">SpecTable</p>
        <SpecTable rows={specRows} />
      </div>

      {/* MaterialMacro */}
      <div>
        <p className="mb-2 text-[11px] uppercase tracking-widest text-[#6B6B66]">MaterialMacro</p>
        <MaterialMacro items={macroItems} />
      </div>

      {/* ColorPicker (client) */}
      <div>
        <p className="mb-2 text-[11px] uppercase tracking-widest text-[#6B6B66]">ColorPicker</p>
        <ColorPickerDemo />
      </div>

      {/* VideoStories (client) */}
      <div>
        <p className="mb-2 text-[11px] uppercase tracking-widest text-[#6B6B66]">VideoStories</p>
        <VideoStoriesDemo />
      </div>

      {/* FormField */}
      <div>
        <p className="mb-2 text-[11px] uppercase tracking-widest text-[#6B6B66]">FormField</p>
        <div className="space-y-3 max-w-sm">
          <FormField label="Tu nombre" type="text" placeholder="Ej. María García" />
          <FormField label="WhatsApp" type="tel" placeholder="0999 123 456" />
        </div>
      </div>

      {/* SiteFooter */}
      <div>
        <p className="mb-2 text-[11px] uppercase tracking-widest text-[#6B6B66]">SiteFooter</p>
        <div className="overflow-hidden rounded-xl border border-[#E8E2D8]">
          <SiteFooter />
        </div>
      </div>
    </div>
  )
}

export default function UIKitPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-8 space-y-10">
      <div className="mx-auto max-w-5xl">
        <h1
          className="mb-2 text-[40px] font-medium text-[#1A1A18]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Eter Niu UI Kit
        </h1>
        <p className="mb-10 text-[14px] text-[#6B6B66]">
          Revisión de todos los componentes del sistema de diseño — Sprint A (WFND-3).
          Noindex. Solo visible en desarrollo/preview.
        </p>

        <div className="space-y-10">
          <ThemeSection theme="cocina" label="Cocina (--accent: clay #C4502A)" />
          <ThemeSection theme="bienestar" label="Bienestar (--accent: moss #2F5D43)" />
        </div>
      </div>
    </main>
  )
}
