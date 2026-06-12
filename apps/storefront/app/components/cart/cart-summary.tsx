"use client"

import { useCart } from "../../../contexts/CartContext"

export function CartSummary() {
  const { totalItems, totalAmount } = useCart()

  return (
    <div className="border-t border-[#E8E2D8] pt-4 space-y-3">
      <div className="flex justify-between items-baseline">
        <span className="text-[14px] text-[#6B6B66]">
          Subtotal ({totalItems} {totalItems === 1 ? "producto" : "productos"})
        </span>
        <span className="text-[20px] font-semibold text-[#1A1A18]">
          ${totalAmount.toFixed(2)}
        </span>
      </div>

      <p className="text-[12px] text-[#6B6B66]">
        Precios finales incluyen envío gratis por Servientrega. Se confirma stock
        y formas de pago por WhatsApp.
      </p>
    </div>
  )
}
