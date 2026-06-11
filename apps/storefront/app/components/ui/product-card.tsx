import Image from "next/image"
import { Badge } from "./badge"

export type ProductCardData = {
  title: string
  subtitle?: string
  price: string
  originalPrice?: string
  image: string
  href: string
  badge?: string
}

export function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <a
      href={product.href}
      className="block rounded-2xl border border-[#E8E2D8] bg-white overflow-hidden no-underline text-[#1A1A18] hover:shadow-sm transition-shadow"
    >
      {/* Image 4:5 */}
      <div className="relative w-full aspect-[4/5] bg-[#E8E2D8]">
        <Image
          src={product.image}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
          className="object-cover"
        />
        {product.badge && (
          <div className="absolute top-2 left-2">
            <Badge tone="accent">{product.badge}</Badge>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-[14px] font-medium leading-snug text-[#1A1A18] line-clamp-2">
          {product.title}
        </p>
        {product.subtitle && (
          <p className="mt-0.5 text-[11px] text-[#6B6B66]">{product.subtitle}</p>
        )}
        <div className="mt-2 flex items-baseline gap-2">
          {product.originalPrice && (
            <span className="text-[13px] text-[#6B6B66] line-through">
              {product.originalPrice}
            </span>
          )}
          <span className="text-[16px] font-medium text-[var(--accent)]">
            {product.price}
          </span>
        </div>
      </div>
    </a>
  )
}
