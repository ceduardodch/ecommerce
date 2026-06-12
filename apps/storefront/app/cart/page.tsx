"use client"

import { useState } from "react"
import { useCart } from "../../contexts/CartContext"
import { CartItemComponent } from "../components/cart/cart-item"
import { CartSummary } from "../components/cart/cart-summary"
import { trackStorefrontEvent } from "../components/analytics"

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
    // Track initiate_checkout event
    trackStorefrontEvent({
      eventName: "InitiateCheckout",
      type: "initiate_checkout",
      source: "storefront",
      products: items.map((item) => ({
        id: item.id,
        variantId: item.id,
        sku: item.sku,
        title: item.title,
        category: item.category || "",
        brand: "Eter Niu",
        price: { amount: item.price, currency: "USD" },
        imageUrl: item.image || "",
        productUrl: "",
        tags: [],
        stock: 0,
      })),
      value: totalAmount,
      cta: "checkout_whatsapp",
      placement: "cart_page",
      metadata: {
        cartSize: items.length,
        customerName: formData.name || undefined,
        customerCity: formData.city || undefined,
      },
    })

    // TODO: Generate WhatsApp message and open WhatsApp
    // This will be implemented in CART-5
    console.log("Checkout would generate WhatsApp message here (CART-5)")
  }

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[#6B6B66]">Cargando carrito...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-[#E8E2D8]">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <nav className="text-[12px] text-[#6B6B66]">
            <a href="/" className="hover:text-[#1A1A18]">
              Home
            </a>
            <span className="mx-2">›</span>
            <span className="text-[#1A1A18]">Carrito</span>
          </nav>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-[28px] font-semibold text-[#1A1A18] mb-6">
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
              href="/"
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

                <button
                  type="button"
                  onClick={handleCheckout}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-[14px] font-semibold text-white hover:opacity-85 transition-opacity cursor-pointer"
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
                  Enviar pedido por WhatsApp
                </button>

                <p className="text-[12px] text-[#6B6B66] text-center">
                  Al hacer clic, se abrirá WhatsApp con un resumen de tu pedido
                  para confirmar stock y formas de pago.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
