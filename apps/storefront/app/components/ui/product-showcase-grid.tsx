import type { Product } from "../../../lib/catalog"
import { ShowcaseTile } from "./showcase-tile"
import { ScrollReveal } from "./scroll-reveal"

// Grid editorial oscuro del landing cocina: fotos protagonistas enormes con
// scroll-reveal + zoom. 1 columna móvil (imagen full-width), 2 columnas desktop.

export function ProductShowcaseGrid({ products }: { products: Product[] }) {
  return (
    <section id="productos" className="bg-[#10160e] px-4 pb-24 pt-8">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal distance={40}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#d3fa99]">
            La colección
          </p>
          <h2
            className="mt-2 text-[clamp(26px,6vw,40px)] font-medium leading-tight tracking-wide text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Granito para toda tu cocina
          </h2>
        </ScrollReveal>

        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-16 md:grid-cols-2">
          {products.map((product, i) => (
            <ShowcaseTile
              key={product.sku}
              product={product}
              delay={(i % 2) * 0.12}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
