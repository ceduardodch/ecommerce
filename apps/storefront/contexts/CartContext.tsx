"use client"

import { createContext, useContext, useEffect, useState } from "react"

export type CartItem = {
  id: string
  sku: string
  title: string
  price: number
  quantity: number
  image?: string
  category?: string
}

type CartContextType = {
  items: CartItem[]
  loaded: boolean
  addItem: (product: Omit<CartItem, "quantity">, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalAmount: number
  generateWhatsAppMessage: (customerName?: string, customerCity?: string) => string
  // UI state (INTEG-1)
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = "eter_niu_cart"

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loaded, setLoaded] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const openCart = () => setIsOpen(true)
  const closeCart = () => setIsOpen(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setItems(parsed)
        }
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error)
    } finally {
      setLoaded(true)
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (loaded) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
      } catch (error) {
        console.error("Error saving cart to localStorage:", error)
      }
    }
  }, [items, loaded])

  const addItem = (
    product: Omit<CartItem, "quantity">,
    quantity: number = 1,
  ) => {
    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.id === product.id)

      if (existingIndex > -1) {
        // Product already exists, update quantity
        const updated = [...prevItems]
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        }
        return updated
      }

      // New product
      return [...prevItems, { ...product, quantity }]
    })
  }

  const removeItem = (productId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity } : item,
      ),
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  const totalAmount = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  )

  const generateWhatsAppMessage = (
    customerName: string = "",
    customerCity: string = "",
  ) => {
    const itemsList = items
      .map(
        (item) =>
          `${item.quantity}x ${item.title} - $${(item.price * item.quantity).toFixed(2)}`,
      )
      .join("\n")

    const message = [
      customerName ? `Hola, soy ${customerName}` : "Hola",
      customerCity ? `de ${customerCity}.` : "",
      "",
      "Quiero pedir:",
      "",
      itemsList,
      "",
      `Total: $${totalAmount.toFixed(2)}`,
      "",
      "Me confirmas stock, envío gratis por Servientrega y formas de pago?",
    ]
      .filter(Boolean)
      .join("\n")

    return message
  }

  return (
    <CartContext.Provider
      value={{
        items,
        loaded,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalAmount,
        generateWhatsAppMessage,
        isOpen,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
