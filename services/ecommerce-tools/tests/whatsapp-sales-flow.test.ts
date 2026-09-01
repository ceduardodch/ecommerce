import { describe, expect, it, vi } from "vitest"
import { advanceWhatsappSale } from "../src/whatsapp-sales-flow.js"

const product = { id: "p1", variantId: "v1", sku: "OLLA", title: "Olla", description: "", category: "ollas", brand: "Eter", price: { amount: 20, currency: "USD" as const }, stock: 2, imageUrl: "", productUrl: "https://cocina.b2b.com.ec/products/olla", tags: [] }
const quote = { id: "Q1", lines: [], subtotal: { amount: 20, currency: "USD" as const }, tax: { amount: 3, currency: "USD" as const }, total: { amount: 23, currency: "USD" as const }, currency: "USD" as const, whatsappMessage: "Cotización" }

describe("advanceWhatsappSale", () => {
  it("crea cotización pero no crea carrito", async () => {
    const createCart = vi.fn()
    const result = await advanceWhatsappSale({ text: "quiero la olla", phone: "+5931", products: [product], quote: vi.fn().mockResolvedValue(quote), createCart })
    expect(result.event).toBe("quote_created")
    expect(createCart).not.toHaveBeenCalled()
  })

  it("exige nombre y ciudad antes de preparar el carrito", async () => {
    const createCart = vi.fn()
    const result = await advanceWhatsappSale({ text: "sí preparar carrito", phone: "+5931", products: [], state: { productId: "p1", variantId: "v1", quantity: 1, quoteId: "Q1" }, quote: vi.fn(), createCart })
    expect(result.text).toContain("nombre")
    expect(createCart).not.toHaveBeenCalled()
  })

  it("envía un carrito solo después de confirmar datos", async () => {
    const createCart = vi.fn().mockResolvedValue({ cartUrl: "https://cocina.b2b.com.ec/cart?session=opaque", expiresAt: "2026-01-01T00:00:00.000Z" })
    const result = await advanceWhatsappSale({ text: "sí, preparar carrito", phone: "+5931", products: [], state: { productId: "p1", variantId: "v1", quantity: 1, quoteId: "Q1", city: "Quito", customerName: "Ana" }, quote: vi.fn(), createCart })
    expect(result.event).toBe("cart_link_sent")
    expect(result.text).toContain("session=opaque")
    expect(createCart).toHaveBeenCalledOnce()
  })

  it("no duplica el carrito cuando el cliente repite la confirmación", async () => {
    const createCart = vi.fn()
    const result = await advanceWhatsappSale({ text: "sí", phone: "+5931", products: [], state: { productId: "p1", variantId: "v1", quantity: 1, city: "Quito", customerName: "Ana", cartUrl: "https://cocina.b2b.com.ec/cart?session=opaque" }, quote: vi.fn(), createCart })
    expect(result.text).toContain("ya está listo")
    expect(createCart).not.toHaveBeenCalled()
  })

  it("deriva factura y descuento a humano", async () => {
    const result = await advanceWhatsappSale({ text: "¿Me dan factura con descuento?", phone: "+5931", products: [], quote: vi.fn(), createCart: vi.fn() })
    expect(result.event).toBe("human_handoff")
  })
})
