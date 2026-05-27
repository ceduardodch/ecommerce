export type WhatsappProduct = {
  id: string
  variantId?: string
  sku: string
  title: string
  category?: string
  brand?: string
  price: { amount: number; currency: "USD" }
  promoLabel?: string
  stockSignal?: string
  deliveryBadge?: string
  material?: string
  diameterCm?: number
}

type WhatsappContext = {
  leadId?: string
  sessionId?: string
  source?: string
  placement?: string
}

export function whatsappLink(
  product: WhatsappProduct,
  context: WhatsappContext = {},
) {
  const seller =
    process.env.NEXT_PUBLIC_WHATSAPP_SELLER_NUMBER || "593999999999"
  const details = [
    `SKU: ${product.sku}`,
    `Precio: $${product.price.amount.toFixed(2)}`,
    product.material ? `Material: ${product.material}` : undefined,
    product.diameterCm ? `Diametro: ${product.diameterCm} cm` : undefined,
    product.stockSignal ? `Stock: ${product.stockSignal}` : undefined,
    product.deliveryBadge ? `Entrega: ${product.deliveryBadge}` : undefined,
    product.promoLabel ? `Promo: ${product.promoLabel}` : undefined,
  ]
    .filter(Boolean)
    .join(" | ")
  const tracking = [
    `ProductoID: ${product.id}`,
    product.variantId ? `Variante: ${product.variantId}` : undefined,
    `SKU: ${product.sku}`,
    `Precio: ${product.price.amount.toFixed(2)} ${product.price.currency}`,
    product.material ? `Material: ${product.material}` : undefined,
    product.diameterCm ? `Diametro: ${product.diameterCm} cm` : undefined,
    context.leadId ? `Lead: ${context.leadId}` : undefined,
    context.sessionId ? `Sesion: ${context.sessionId}` : undefined,
    context.source ? `Fuente: ${context.source}` : undefined,
    context.placement ? `Ubicacion: ${context.placement}` : undefined,
  ]
    .filter(Boolean)
    .join(" | ")
  const text =
    `Hola, quiero la olla de granito ${product.title}. Cocino para __ personas. Me confirmas stock y entrega?` +
    `\n\n${details}` +
    `\n\n${tracking}`

  return `https://wa.me/${seller}?text=${encodeURIComponent(text)}`
}
