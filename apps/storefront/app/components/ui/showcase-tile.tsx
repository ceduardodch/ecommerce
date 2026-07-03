import Image from "next/image"
import type { Product } from "../../../lib/catalog"
import { productPath } from "../../../lib/catalog"
import { TrackedWhatsAppLink } from "../analytics"
import { ScrollReveal } from "./scroll-reveal"
import { ImageReveal } from "./image-reveal"
import { AddToCartButton } from "./add-to-cart-button"

// Tile editorial del grid oscuro: foto GIGANTE edge-to-edge sobre tile blanco
// (sin borde ni sombra — el contraste con el canvas night es el efecto),
// revelado con zoom al scrollear, caption con precio y doble CTA:
// WhatsApp (flujo principal) + Agregar al carrito (camino a pago con tarjeta).

function WhatsAppIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

export function ShowcaseTile({
  product,
  delay = 0,
}: {
  product: Product
  delay?: number
}) {
  const hasPromo =
    product.originalPrice &&
    product.originalPrice.amount > product.price.amount

  return (
    <ScrollReveal delay={delay} distance={60}>
      <article>
        <a href={productPath(product)} className="block no-underline">
          <ImageReveal className="relative aspect-square w-full rounded-[2px] bg-white">
            <Image
              src={product.imageUrl}
              alt={product.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
            {hasPromo && (
              <span className="absolute left-4 top-4 rounded-full bg-[#1c3a13] px-3 py-1 text-[11px] font-semibold text-[#d3fa99]">
                -
                {Math.round(
                  ((product.originalPrice!.amount - product.price.amount) /
                    product.originalPrice!.amount) *
                    100,
                )}
                % hoy
              </span>
            )}
          </ImageReveal>
        </a>

        {/* Caption sobre el canvas oscuro */}
        <div className="mt-5 flex flex-col gap-1.5 px-1">
          <a href={productPath(product)} className="no-underline">
            <h3
              className="text-[22px] font-semibold leading-snug tracking-wide text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {product.title}
            </h3>
          </a>
          <div className="flex items-baseline gap-2">
            {hasPromo && (
              <s className="text-[13px] text-[#b8c2ae]">
                ${product.originalPrice!.amount.toFixed(2)}
              </s>
            )}
            <span className="text-[18px] font-semibold text-[#d3fa99]">
              ${product.price.amount.toFixed(2)}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2.5">
            <TrackedWhatsAppLink
              product={product}
              placement="home_showcase_tile"
              eventType="product_interest"
              className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-[13px] font-semibold text-white"
            >
              <WhatsAppIcon />
              Pedir por WhatsApp
            </TrackedWhatsAppLink>
            <AddToCartButton
              product={product}
              label="Agregar al carrito"
              className="inline-flex items-center gap-2 rounded-full bg-[#d3fa99] px-5 py-2.5 text-[13px] font-semibold text-[#10160e] hover:opacity-90 transition-opacity cursor-pointer"
            />
          </div>
        </div>
      </article>
    </ScrollReveal>
  )
}
