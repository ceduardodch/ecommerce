"use client"

import { useEffect, useState } from "react"
import type { Product } from "../../../lib/catalog"
import { AddToCartButton } from "./add-to-cart-button"

type StickyCTABarProps = {
  /** Optional price label (for product/campaign pages) */
  price?: string
  /** Fallback link for generic sticky CTAs. */
  waHref?: string
  /** Button label */
  waLabel?: string
  /**
   * When true the bar is ALWAYS visible (product/campaign pages).
   * When false (default) the bar fades in after 300px scroll (home).
   */
  alwaysVisible?: boolean
  /** Product to add; WhatsApp is only offered from the cart. */
  product?: Product
  /** Retained for compatible callers. */
  placement?: string
  /** "dark" = barra sobre canvas night (landing cocina). Default light. */
  surface?: "light" | "dark"
}

export function StickyCTABar({
  price,
  waHref,
  waLabel = "Agregar al carrito",
  alwaysVisible = false,
  product,
  surface = "light",
}: StickyCTABarProps) {
  const dark = surface === "dark"
  const [visible, setVisible] = useState(alwaysVisible)

  useEffect(() => {
    if (alwaysVisible) return
    const update = () => setVisible(window.scrollY > 300)
    update()
    window.addEventListener("scroll", update, { passive: true })
    return () => window.removeEventListener("scroll", update)
  }, [alwaysVisible])

  return (
    <div
      aria-hidden={!visible}
      className={`fixed bottom-0 left-0 right-0 z-50 px-4 py-3 transition-all duration-300 ${
        dark
          ? "border-t border-white/10 bg-[#16200f]/95 backdrop-blur"
          : "border-t border-[#E8E2D8] bg-white shadow-[0_-2px_12px_rgba(26,26,24,0.08)]"
      } ${visible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`}
    >
      <div className="mx-auto flex max-w-lg items-center gap-3">
        {price && (
          <div className="flex flex-col leading-none">
            <span className={`text-[11px] ${dark ? "text-[#b8c2ae]" : "text-[#6B6B66]"}`}>
              PVP
            </span>
            <span
              className={`text-[16px] font-medium ${
                dark ? "text-[#d3fa99]" : "text-[var(--accent)]"
              }`}
            >
              {price}
            </span>
          </div>
        )}
        {product ? (
          <AddToCartButton
            product={product}
            label={waLabel}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#d3fa99] px-5 py-3 text-[14px] font-semibold text-[#10160e] hover:opacity-90 transition-opacity cursor-pointer"
          />
        ) : (
          <a
            href={waHref || "/cart"}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#1c3a13] px-5 py-3 text-[14px] font-semibold text-white"
          >
            {waLabel}
          </a>
        )}
      </div>
    </div>
  )
}
