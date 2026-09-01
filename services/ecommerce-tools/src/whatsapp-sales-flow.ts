import type { CustomerInput, Product, Quote } from "./types.js"

export type CommerceState = {
  productId: string
  variantId: string
  quantity: number
  city?: string
  customerName?: string
  quoteId?: string
  cartUrl?: string
  cartExpiresAt?: string
  stage?: "cotizacion" | "datos" | "carrito" | "humano"
}

export function isConfirmation(text: string) {
  return /^(si|sí|confirmo|confirmar|de acuerdo|ok|dale|lo quiero|envíame|enviame)(?:\s|,|$)/i.test(text.trim())
}

export function cityFromText(text: string) {
  const match = text.match(/(?:soy de|desde|vivo en|entrega en|ciudad[: ]+)\s+([a-záéíóúñ ]{3,40})/i)
  return match?.[1]?.trim().replace(/[.,!?].*$/, "")
}

export function nameFromText(text: string) {
  const match = text.match(/(?:me llamo|mi nombre es|soy)\s+([a-záéíóúñ ]{2,60})/i)
  return match?.[1]?.trim().replace(/[.,!?].*$/, "")
}

function requiresHuman(text: string) {
  return /\b(factura|garant[ií]a|descuento|rebaja|env[ií]o urgente|hoy mismo|stock exacto)\b/i.test(text)
}

export async function advanceWhatsappSale(input: {
  text: string
  phone: string
  products: Product[]
  state?: CommerceState
  customer?: CustomerInput
  quote: (input: { items: Array<{ productId: string; variantId: string; quantity: number }>; customer: CustomerInput }) => Promise<Quote>
  createCart: (input: { phone: string; customer: { name: string; city: string }; items: Array<{ productId: string; variantId: string; quantity: number }> }) => Promise<{ cartUrl: string; expiresAt: string }>
}): Promise<{ text?: string; state?: CommerceState; event?: "quote_created" | "cart_link_sent" | "human_handoff" }> {
  if (requiresHuman(input.text)) {
    return { text: "Para confirmar eso sin inventarte datos, te conecto con una persona del equipo.", state: input.state ? { ...input.state, stage: "humano" } : undefined, event: "human_handoff" }
  }

  const metadata = input.customer?.metadata || {}
  const city = cityFromText(input.text) || input.state?.city || (typeof metadata.city === "string" ? metadata.city : undefined)
  const customerName = nameFromText(input.text) || input.state?.customerName || input.customer?.name

  if (!input.state && input.products.length) {
    const product = input.products[0]
    const quote = await input.quote({
      items: [{ productId: product.id, variantId: product.variantId, quantity: 1 }],
      customer: { ...input.customer, phone: input.phone, name: customerName, metadata: { ...metadata, ...(city ? { city } : {}) } },
    })
    return {
      text: `${quote.whatsappMessage}\n\nSi esta opción te sirve, dime tu nombre y ciudad. Luego te preparo el carrito para que revises todo antes de pagar con tarjeta.`,
      state: { productId: product.id, variantId: product.variantId, quantity: 1, city, customerName, quoteId: quote.id, stage: "datos" },
      event: "quote_created",
    }
  }

  if (!input.state) return {}
  const state = { ...input.state, city, customerName }
  if (state.cartUrl) return { text: `Tu carrito ya está listo: ${state.cartUrl}\n\nEl enlace es temporal. Revisa el pedido y completa el pago seguro con tarjeta en DataFast.`, state }
  if (!city || !customerName) {
    const missing = [!customerName ? "tu nombre" : "", !city ? "tu ciudad" : ""].filter(Boolean).join(" y ")
    return { text: `Para preparar tu carrito necesito confirmar ${missing}.`, state: { ...state, stage: "datos" } }
  }
  if (!isConfirmation(input.text)) {
    return { text: "Ya tengo el producto, cantidad, nombre y ciudad. Responde “sí, preparar carrito” y te envío el enlace para revisar y pagar con tarjeta.", state: { ...state, stage: "carrito" } }
  }

  const cart = await input.createCart({ phone: input.phone, customer: { name: customerName, city }, items: [{ productId: state.productId, variantId: state.variantId, quantity: state.quantity }] })
  return {
    text: `Listo, preparé tu carrito: ${cart.cartUrl}\n\nRevísalo y completa tus datos de envío. El pago con tarjeta se hace de forma segura en DataFast.`,
    state: { ...state, cartUrl: cart.cartUrl, cartExpiresAt: cart.expiresAt, stage: "carrito" },
    event: "cart_link_sent",
  }
}
