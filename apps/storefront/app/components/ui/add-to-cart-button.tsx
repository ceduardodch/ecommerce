"use client"

import { useState } from "react"
import { useCart } from "../../../contexts/CartContext"
import { trackStorefrontEvent } from "../analytics"
import type { Product } from "../../../lib/catalog"

type AddToCartButtonProps = {
  product: Product
  quantity?: number
  className?: string
  label?: string
}

export function AddToCartButton({
  product,
  quantity = 1,
  className = "",
  label = "Agregar al carrito",
}: AddToCartButtonProps) {
  const { addItem } = useCart()
  const [showFeedback, setShowFeedback] = useState(false)

  const handleClick = () => {
    // Add product to cart
    addItem(
      {
        id: product.id,
        sku: product.sku,
        title: product.title,
        price: product.price.amount,
        image: product.imageUrl,
        category: product.category,
      },
      quantity,
    )

    // Track add_to_cart event → "Lead"
    trackStorefrontEvent({
      eventName: "Lead",
      type: "add_to_cart",
      source: "storefront",
      product,
      value: product.price.amount * quantity,
      cta: "add_to_cart",
      placement: "product_card",
      metadata: {
        productId: product.id,
        sku: product.sku,
        quantity,
      },
    })

    // Show visual feedback
    setShowFeedback(true)
    setTimeout(() => setShowFeedback(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${className} relative overflow-hidden`}
    >
      {showFeedback ? (
        <span className="text-green-700">¡Agregado!</span>
      ) : (
        <span>{label}</span>
      )}
    </button>
  )
}
