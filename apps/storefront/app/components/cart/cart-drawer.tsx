"use client"

import { useEffect, useState } from "react"
import { useCart } from "../../../contexts/CartContext"
import { CartItemComponent } from "./cart-item"
import { CartSummary } from "./cart-summary"

type CartDrawerProps = {
  isOpen: boolean
  onClose: () => void
  onCheckout: () => void
}

export function CartDrawer({ isOpen, onClose, onCheckout }: CartDrawerProps) {
  const { items, loaded } = useCart()
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true)
      document.body.style.overflow = "hidden"
    } else {
      setIsAnimating(false)
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Drawer from bottom (mobile) */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[85vh] flex flex-col transition-transform duration-300 ease-out ${
          isAnimating ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Handle for swipe close indicator */}
        <div className="flex justify-center py-3 cursor-pointer" onClick={onClose}>
          <div className="w-12 h-1 bg-[#E8E2D8] rounded-full" />
        </div>

        {/* Header */}
        <div className="px-4 pb-3 border-b border-[#E8E2D8]">
          <div className="flex justify-between items-center">
            <h2 className="text-[18px] font-semibold text-[#1A1A18]">
              Tu carrito
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-[#6B6B66] hover:text-[#1A1A18] text-[24px] leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Items List */}
        <div className="flex-grow overflow-y-auto px-4 py-3">
          {!loaded ? (
            <div className="text-center py-8 text-[#6B6B66]">
              Cargando carrito...
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-8 text-[#6B6B66]">
              <p className="text-[14px]">Tu carrito está vacío</p>
              <p className="text-[12px] mt-1">
                Agrega productos para comenzar tu pedido
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              {items.map((item) => (
                <CartItemComponent key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer with Summary and Checkout */}
        {items.length > 0 && (
          <div className="border-t border-[#E8E2D8] px-4 py-4 bg-[#FAF7F2]">
            <CartSummary />

            <button
              type="button"
              onClick={() => {
                onCheckout()
                onClose()
              }}
              className="w-full mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-[14px] font-semibold text-white hover:opacity-85 transition-opacity cursor-pointer"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Finalizar pedido por WhatsApp
            </button>

            <a
              href="/checkout/pago"
              onClick={onClose}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-full border border-[var(--accent)] px-5 py-3 text-[14px] font-semibold text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[#FAF7F2] transition-colors cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
              Pagar con tarjeta
            </a>
            {/* INTEG-3: enlace directo a /cart */}
            <a
              href="/cart"
              onClick={onClose}
              className="mt-2 block text-center text-[12px] text-[#6B6B66] underline underline-offset-2 hover:text-[#1A1A18] transition-colors"
            >
              Ver carrito completo
            </a>
          </div>
        )}
      </div>
    </>
  )
}
