"use client"

import Image from "next/image"
import { useCart } from "../../../contexts/CartContext"

type CartItemProps = {
  item: {
    id: string
    sku: string
    title: string
    price: number
    quantity: number
    image?: string
    category?: string
  }
}

export function CartItemComponent({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart()

  return (
    <div className="flex gap-3 py-3 border-b border-[#E8E2D8] last:border-b-0">
      {/* Image */}
      {item.image && (
        <div className="relative w-20 h-20 flex-shrink-0 bg-[#E8E2D8] rounded-lg overflow-hidden">
          <Image
            src={item.image}
            alt={item.title}
            fill
            sizes="80px"
            className="object-cover"
          />
        </div>
      )}

      {/* Info & Controls */}
      <div className="flex-grow flex flex-col justify-between">
        <div>
          <p className="text-[14px] font-medium text-[#1A1A18] line-clamp-2">
            {item.title}
          </p>
          <p className="mt-1 text-[16px] font-semibold text-[var(--accent)]">
            ${item.price.toFixed(2)}
          </p>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-[#E8E2D8] bg-white text-[#1A1A18] hover:bg-[#FAF7F2] transition-colors"
              aria-label="Disminuir cantidad"
            >
              −
            </button>
            <span className="text-[14px] font-medium text-[#1A1A18] min-w-[24px] text-center">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-[#E8E2D8] bg-white text-[#1A1A18] hover:bg-[#FAF7F2] transition-colors"
              aria-label="Aumentar cantidad"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={() => removeItem(item.id)}
            className="text-[12px] text-[#6B6B66] hover:text-[#1A1A18] underline"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}
