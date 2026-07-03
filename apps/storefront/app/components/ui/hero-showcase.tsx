import type { Product } from "../../../lib/catalog"
import { productPath } from "../../../lib/catalog"
import { TrackedWhatsAppLink } from "../analytics"
import { FloatingProduct } from "./floating-product"
import { AddToCartButton } from "./add-to-cart-button"

// Hero del landing oscuro de cocina: producto protagonista GIGANTE flotando
// con destellos (FloatingProduct hero-dark) + copy editorial + CTA WhatsApp.
// Server component; TrackedWhatsAppLink es client island.

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

export function HeroShowcase({ product }: { product: Product }) {
  return (
    <section className="relative overflow-hidden bg-[#10160e]">
      {/* Vignette de profundidad detrás del hero */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(80% 60% at 50% 0%, #22331a 0%, #10160e 70%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 pt-10 pb-16 lg:grid lg:grid-cols-[1fr_1.15fr] lg:items-center lg:gap-10 lg:pt-16 lg:pb-24">
        {/* Copy */}
        <div className="text-center lg:text-left">
          <p className="hs-enter text-[11px] font-semibold uppercase tracking-[0.22em] text-[#d3fa99]">
            Granito premium · Wok 32 cm
          </p>
          <h1
            className="hs-enter mt-3 text-[clamp(36px,10vw,64px)] font-medium leading-[1.05] tracking-wide text-white"
            style={{ fontFamily: "var(--font-display)", animationDelay: "0.12s" }}
          >
            El wok que cocina con menos aceite.
          </h1>
          <p
            className="hs-enter mx-auto mt-4 max-w-[36ch] text-[15px] leading-relaxed text-[#b8c2ae] lg:mx-0"
            style={{ animationDelay: "0.24s" }}
          >
            Antiadherente de granito real: sella, saltea y dora sin que nada se
            pegue. Para todas las cocinas, incluida inducción.
          </p>

          {/* Producto (móvil: entre el copy y los CTAs) */}
          <div className="mt-8 lg:hidden">
            <FloatingProduct
              variant="hero-dark"
              priority
              imageUrl={product.imageUrl}
              alt={product.title}
              className="mx-auto max-w-[min(92vw,480px)]"
            />
          </div>

          <p
            className="hs-enter mt-8 text-[22px] font-semibold text-[#d3fa99] lg:mt-6"
            style={{ animationDelay: "0.36s" }}
          >
            ${product.price.amount.toFixed(2)}
          </p>

          <div
            className="hs-enter mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start"
            style={{ animationDelay: "0.48s" }}
          >
            <TrackedWhatsAppLink
              product={product}
              placement="home_hero"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 text-[14px] font-semibold text-white sm:w-auto"
            >
              <WhatsAppIcon />
              Pedir por WhatsApp
            </TrackedWhatsAppLink>
            <AddToCartButton
              product={product}
              label="Agregar al carrito"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#d3fa99] px-6 py-3.5 text-[14px] font-semibold text-[#10160e] hover:opacity-90 transition-opacity cursor-pointer sm:w-auto"
            />
          </div>

          <div
            className="hs-enter mt-5 flex flex-col items-center gap-2 lg:items-start"
            style={{ animationDelay: "0.6s" }}
          >
            <a
              href={productPath(product)}
              className="text-[13px] font-semibold text-[#d3fa99] underline underline-offset-4"
            >
              Ver detalles del producto
            </a>
            <p className="text-[12px] text-[#b8c2ae]">
              Envío gratis a todo Ecuador · Pagas al recibir
            </p>
          </div>
        </div>

        {/* Producto (desktop: columna derecha) */}
        <div className="hidden lg:block">
          <FloatingProduct
            variant="hero-dark"
            priority
            imageUrl={product.imageUrl}
            alt={product.title}
            className="mx-auto max-w-[620px]"
          />
        </div>
      </div>

      <style>{`
        @keyframes hs-up {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: none; }
        }
        .hs-enter {
          opacity: 0;
          animation: hs-up 0.7s cubic-bezier(0.22, 0.61, 0.21, 1) forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .hs-enter { animation: none; opacity: 1; }
        }
      `}</style>
    </section>
  )
}
