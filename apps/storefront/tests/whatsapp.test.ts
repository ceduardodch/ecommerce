import { afterEach, describe, expect, it } from "vitest"
import {
  SELLER_WHATSAPP_NUMBER,
  generateCartMessage,
  sellerWhatsappNumber,
  whatsappCartLink,
  whatsappLink,
  type CartItem,
  type WhatsappProduct,
} from "../lib/whatsapp"

function product(overrides: Partial<WhatsappProduct> = {}): WhatsappProduct {
  return {
    id: "prod-1",
    sku: "MGC-WOK-GRANITO-32",
    title: "Wok 32 cm granito",
    category: "Woks granito",
    price: { amount: 55, currency: "USD" },
    ...overrides,
  }
}

describe("sellerWhatsappNumber", () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_WHATSAPP_SELLER_NUMBER
  })

  it("usa el número por defecto cuando no hay variable de entorno", () => {
    expect(sellerWhatsappNumber()).toBe(SELLER_WHATSAPP_NUMBER)
  })

  it("normaliza un número local (10 dígitos con 0) a formato internacional", () => {
    process.env.NEXT_PUBLIC_WHATSAPP_SELLER_NUMBER = "0987135207"
    expect(sellerWhatsappNumber()).toBe("593987135207")
  })

  it("deja pasar un número ya en formato internacional", () => {
    process.env.NEXT_PUBLIC_WHATSAPP_SELLER_NUMBER = "593912345678"
    expect(sellerWhatsappNumber()).toBe("593912345678")
  })

  it("cae al número por defecto si la variable es el placeholder de prueba", () => {
    process.env.NEXT_PUBLIC_WHATSAPP_SELLER_NUMBER = "9999999999"
    expect(sellerWhatsappNumber()).toBe(SELLER_WHATSAPP_NUMBER)
  })
})

describe("whatsappLink", () => {
  it("arma el link con el número de venta, precio y cupón por defecto", () => {
    const link = whatsappLink(product())
    const url = new URL(link)

    expect(url.hostname).toBe("wa.me")
    expect(url.pathname).toBe(`/${SELLER_WHATSAPP_NUMBER}`)

    const text = url.searchParams.get("text") || ""
    expect(text).toContain("$55.00")
    expect(text).toContain("GRANITOHOY")
    expect(text).toContain("Ref: MGC-WOK-GRANITO-32")
  })

  it("usa el leadId como referencia cuando se pasa por contexto", () => {
    const link = whatsappLink(product(), { leadId: "lead_abc_123" })
    const text = new URL(link).searchParams.get("text") || ""

    expect(text).toContain("Ref: lead_abc_123")
  })

  it("usa la apertura de bienestar cuando el contexto es esa vertical", () => {
    const link = whatsappLink(product({ sku: "BIEN-TERMO-1" }), {
      vertical: "bienestar",
    })
    const text = new URL(link).searchParams.get("text") || ""

    expect(text).toMatch(/^Hola, quiero reclamar la promo de/)
  })

  it("distingue un cuchillo como complemento de cocina, sin la pregunta de personas", () => {
    const link = whatsappLink(
      product({ title: "Cuchillo Santoku", sku: "COC-CUCHILLO-SANTOKU" }),
    )
    const text = new URL(link).searchParams.get("text") || ""

    expect(text).not.toContain("Cocino para __ personas")
  })

  it("respeta un openingLine explícito del contexto por encima del default", () => {
    const link = whatsappLink(product(), { openingLine: "Hola, texto custom" })
    const text = new URL(link).searchParams.get("text") || ""

    expect(text.startsWith("Hola, texto custom")).toBe(true)
  })
})

describe("generateCartMessage", () => {
  const items: CartItem[] = [
    { id: "1", sku: "SKU-1", title: "Wok 32", price: 55, quantity: 1 },
    { id: "2", sku: "SKU-2", title: "Olla 20", price: 30, quantity: 2 },
  ]

  it("lista cada item con su subtotal y el total del pedido", () => {
    const message = generateCartMessage(items, 115)

    expect(message).toContain("1x Wok 32 - $55.00")
    expect(message).toContain("2x Olla 20 - $60.00")
    expect(message).toContain("Total: $115.00")
  })

  it("incluye el nombre y ciudad del cliente cuando se proveen", () => {
    const message = generateCartMessage(items, 115, "María", "Quito")

    expect(message).toContain("Hola, soy María")
    expect(message).toContain("de Quito.")
  })

  it("marca 'precio combo aplicado' solo cuando el combo se activa de verdad", () => {
    const comboItems: CartItem[] = [
      { id: "1", sku: "SKU-1", title: "Sartén 20", price: 20, comboPrice: 15, comboMinimumItems: 3, quantity: 3 },
    ]
    const message = generateCartMessage(comboItems, 45)

    expect(message).toContain("precio verde aplicado")
    expect(message).toContain("(precio combo)")
  })

  it("no menciona el combo cuando no se activó", () => {
    const message = generateCartMessage(items, 115)

    expect(message).not.toContain("precio combo")
  })
})

describe("whatsappCartLink", () => {
  it("arma el link al número de venta con la referencia del carrito", () => {
    const items: CartItem[] = [
      { id: "1", sku: "SKU-1", title: "Wok 32", price: 55, quantity: 1 },
    ]
    const link = whatsappCartLink(items, 55)
    const url = new URL(link)

    expect(url.hostname).toBe("wa.me")
    expect(url.pathname).toBe(`/${SELLER_WHATSAPP_NUMBER}`)
    expect(url.searchParams.get("text")).toContain("Ref: cart")
  })

  it("usa la referencia de sesión cuando se provee sessionId", () => {
    const items: CartItem[] = [
      { id: "1", sku: "SKU-1", title: "Wok 32", price: 55, quantity: 1 },
    ]
    const link = whatsappCartLink(items, 55, "", "", "sess-42")
    const text = new URL(link).searchParams.get("text") || ""

    expect(text).toContain("Ref: cart_sess-42")
  })
})
