"use client"

import { PageAmbient } from "../components/ui/page-ambient"

import { useState } from "react"
import { useCart } from "../../contexts/CartContext"
import { CartItemComponent } from "../components/cart/cart-item"
import { CartSummary } from "../components/cart/cart-summary"
import { CheckoutButton } from "../components/cart/checkout-button"

type FormData = {
  name: string
  city: string
}

export default function CartPage() {
  const { items, loaded, totalAmount } = useCart()
  const [formData, setFormData] = useState<FormData>({
    name: "",
    city: "",
  })

  const handleCheckout = () => {
    // The CheckoutButton handles tracking and WhatsApp link generation
    // This function is kept for future extensibility
    console.log("Checkout initiated via CheckoutButton")
  }

  // Detect vertical from hostname (client-side)
  const isWellness = typeof window !== "undefined" &&
    (window.location.hostname.includes("bienestar") ||
     window.location.hostname.includes("wellness"))

  const homeLink = isWellness ? "/bienestar" : "/"
  const homeLabel = isWellness ? "Bienestar" : "Home"
  const verticalName = isWellness ? "Bienestar" : "Cocina"

  if (!loaded) {
    return (
      <div className="relative isolate min-h-screen flex items-center justify-center bg-[#10160e]">
        <PageAmbient />
        <p className="text-[#b8c2ae]">Cargando carrito...</p>
      </div>
    )
  }

  return (
    <div className="relative isolate min-h-screen bg-[#10160e]">
      <PageAmbient />
      {/* Breadcrumb */}
      <div className="border-b border-white/10 bg-[#10160e]">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <nav className="text-[12px] text-[#b8c2ae]">
            <a href={homeLink} className="hover:text-white">
              {homeLabel}
            </a>
            <span className="mx-2">›</span>
            <span className="text-white">Carrito</span>
          </nav>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1
          className="text-[28px] font-semibold tracking-wide text-white mb-6"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Tu carrito
        </h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E8E2D8] p-8 text-center">
            <p className="text-[16px] text-[#1A1A18] mb-2">
              Tu carrito está vacío
            </p>
            <p className="text-[14px] text-[#6B6B66] mb-6">
              Agrega productos para comenzar tu pedido
            </p>
            <a
              href={homeLink}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-5 py-3 text-[14px] font-semibold text-[#FAF7F2] hover:opacity-85 transition-opacity cursor-pointer"
            >
              Explorar productos
            </a>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Items List (takes 2 columns on desktop) */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E8E2D8] p-4">
              <div className="space-y-0">
                {items.map((item) => (
                  <CartItemComponent key={item.id} item={item} />
                ))}
              </div>
            </div>

            {/* Checkout Form (takes 1 column on desktop) */}
            <div className="bg-white rounded-2xl border border-[#E8E2D8] p-4 h-fit">
              <h2 className="text-[18px] font-semibold text-[#1A1A18] mb-4">
                Finalizar pedido
              </h2>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-[14px] font-medium text-[#1A1A18] mb-1"
                  >
                    Tu nombre
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-[#E8E2D8] rounded-lg text-[14px] text-[#1A1A18] placeholder-[#6B6B66] focus:outline-none focus:border-[var(--accent)]"
                    placeholder="Ej: María García"
                  />
                </div>

                <div>
                  <label
                    htmlFor="city"
                    className="block text-[14px] font-medium text-[#1A1A18] mb-1"
                  >
                    Ciudad
                  </label>
                  <input
                    type="text"
                    id="city"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-[#E8E2D8] rounded-lg text-[14px] text-[#1A1A18] placeholder-[#6B6B66] focus:outline-none focus:border-[var(--accent)]"
                    placeholder="Ej: Quito"
                  />
                </div>

                <CartSummary />

                <CheckoutButton
                  customerName={formData.name}
                  customerCity={formData.city}
                  className="w-full rounded-full bg-[#25D366] px-5 py-3 text-[14px] font-semibold text-white hover:opacity-85 transition-opacity cursor-pointer"
                  label="Enviar pedido por WhatsApp"
                />

                <div className="flex items-center gap-3 py-1">
                  <span className="h-px flex-1 bg-[#E8E2D8]" />
                  <span className="text-[12px] text-[#6B6B66]">o</span>
                  <span className="h-px flex-1 bg-[#E8E2D8]" />
                </div>

                <a
                  href="/checkout/pago"
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-[var(--accent)] px-5 py-3 text-[14px] font-semibold text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[#FAF7F2] transition-colors cursor-pointer"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                  </svg>
                  Pagar con tarjeta
                </a>

                <p className="text-[12px] text-[#6B6B66] text-center">
                  WhatsApp: confirmas stock y pago con Vicky. Tarjeta: pago seguro
                  online por Datafast (IVA incluido).
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
