"use client"

import { useCart } from "../../../contexts/CartContext"
import { CartBadge } from "./cart-badge"

/**
 * CartBagButton — client island: shopping bag icon that opens the cart overlay.
 * Renders CartBadge with live totalItems count.
 * Replaces the old static <a href="/productos"> bag link in SiteHeader.
 * INTEG-1, INTEG-3
 */
function ShoppingBagIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  )
}

export function CartBagButton({
  surface = "light",
}: {
  surface?: "light" | "dark"
}) {
  const { openCart, totalItems } = useCart()

  return (
    <button
      type="button"
      onClick={openCart}
      className={`relative flex h-9 w-9 items-center justify-center rounded-full ${
        surface === "dark" ? "text-[#fcfcf7]" : "text-[#1A1A18]"
      }`}
      aria-label={`Carrito${totalItems > 0 ? `, ${totalItems} productos` : ""}`}
    >
      <ShoppingBagIcon />
      <CartBadge count={totalItems} />
    </button>
  )
}
