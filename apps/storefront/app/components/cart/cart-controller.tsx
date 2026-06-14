"use client"

import { useCart } from "../../../contexts/CartContext"
import { CartDrawer } from "./cart-drawer"
import { CartModal } from "./cart-modal"

/**
 * CartController — mounts CartDrawer (mobile <lg) and CartModal (desktop ≥lg)
 * once in the layout tree. Driven by isOpen/openCart/closeCart from CartContext.
 * Checkout goes to /cart page where the full form lives.
 * INTEG-1
 */
export function CartController() {
  const { isOpen, closeCart } = useCart()

  const handleCheckout = () => {
    closeCart()
    window.location.href = "/cart"
  }

  return (
    <>
      {/* Mobile drawer — visible below lg breakpoint */}
      <div className="lg:hidden">
        <CartDrawer isOpen={isOpen} onClose={closeCart} onCheckout={handleCheckout} />
      </div>

      {/* Desktop modal — visible at lg and above */}
      <div className="hidden lg:block">
        <CartModal isOpen={isOpen} onClose={closeCart} onCheckout={handleCheckout} />
      </div>
    </>
  )
}
