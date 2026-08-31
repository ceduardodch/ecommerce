"use client"

import { useCart } from "../../../contexts/CartContext"

export function CartSummary() {
  const {
    totalItems,
    comboEligibleItems,
    subtotalAmount,
    comboDiscount,
    comboApplied,
    totalAmount,
  } = useCart()

  return (
    <div className="border-t border-[#E8E2D8] pt-4 space-y-3">
      <div className="flex justify-between items-baseline">
        <span className="text-[14px] text-[#6B6B66]">
          Subtotal ({totalItems} {totalItems === 1 ? "producto" : "productos"})
        </span>
        <span className="text-[16px] font-medium text-[#1A1A18]">
          ${subtotalAmount.toFixed(2)}
        </span>
      </div>

      {comboApplied ? (
        <div className="flex justify-between items-baseline rounded-lg bg-emerald-50 px-3 py-2 text-emerald-800">
          <span className="text-[13px] font-semibold">
            Precio verde por combo
          </span>
          <span className="text-[14px] font-semibold">
            −${comboDiscount.toFixed(2)}
          </span>
        </div>
      ) : (
        <p className="rounded-lg bg-[#F4F7EF] px-3 py-2 text-[12px] text-[#36572A]">
          Agrega {Math.max(0, 3 - comboEligibleItems)} producto
          {Math.max(0, 3 - comboEligibleItems) === 1 ? "" : "s"} elegible
          {Math.max(0, 3 - comboEligibleItems) === 1 ? "" : "s"} para activar el
          precio verde.
        </p>
      )}

      <div className="flex justify-between items-baseline">
        <span className="text-[14px] font-semibold text-[#1A1A18]">Total</span>
        <span className="text-[20px] font-semibold text-[#1A1A18]">
          ${totalAmount.toFixed(2)}
        </span>
      </div>

      <p className="text-[12px] text-[#6B6B66]">
        Precios finales incluyen envío gratis por Servientrega. Se confirma
        stock y formas de pago por WhatsApp.
      </p>
    </div>
  )
}
