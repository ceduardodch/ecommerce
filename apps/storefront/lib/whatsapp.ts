import { commercialInfo } from "./commercial"

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
  freeShipping?: boolean
  paymentMethods?: string[]
  couponCode?: string
  material?: string
  diameterCm?: number
  stoveCompatibility?: string
}

type WhatsappContext = {
  openingLine?: string
  fitQuestion?: string
  vertical?: string
  leadId?: string
  sessionId?: string
  source?: string
  placement?: string
  campaignSlug?: string
  recommendation?: string
  city?: string
  householdPeople?: string
  useCase?: string
  budget?: string
  recommendedSku?: string
  journeyStage?: string
  videoSlot?: string
  couponCode?: string
  freeShipping?: boolean
  paymentMethods?: string[]
  stoveCompatibility?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmContent?: string
  utmTerm?: string
  fbclid?: string
}

export function whatsappLink(
  product: WhatsappProduct,
  context: WhatsappContext = {},
) {
  const commerce = commercialInfo({
    ...product,
    couponCode: context.couponCode || product.couponCode,
    freeShipping: context.freeShipping ?? product.freeShipping,
    paymentMethods: context.paymentMethods || product.paymentMethods,
    stoveCompatibility:
      context.stoveCompatibility || product.stoveCompatibility,
  })
  const seller =
    process.env.NEXT_PUBLIC_WHATSAPP_SELLER_NUMBER || "593999999999"
  const details = [
    `SKU: ${product.sku}`,
    `Precio: $${product.price.amount.toFixed(2)}`,
    `Cupon: ${commerce.couponCode}`,
    product.material ? `Material: ${product.material}` : undefined,
    product.diameterCm ? `Diametro: ${product.diameterCm} cm` : undefined,
    product.stockSignal ? `Stock: ${product.stockSignal}` : undefined,
    `Envio: ${commerce.freeShippingLabel}`,
    `Pago: ${commerce.paymentMethodsLabel}`,
    `Compatibilidad: ${commerce.stoveCompatibility}`,
    product.promoLabel ? `Promo: ${product.promoLabel}` : undefined,
    context.recommendation ? `Recomendacion: ${context.recommendation}` : undefined,
    context.city ? `Ciudad: ${context.city}` : undefined,
    context.householdPeople
      ? `Personas en casa: ${context.householdPeople}`
      : undefined,
    context.useCase ? `Uso: ${context.useCase}` : undefined,
    context.budget ? `Presupuesto: ${context.budget}` : undefined,
  ]
    .filter(Boolean)
    .join(" | ")
  const tracking = [
    context.vertical ? `Vertical: ${context.vertical}` : undefined,
    context.campaignSlug ? `Campana: ${context.campaignSlug}` : undefined,
    `ProductoID: ${product.id}`,
    product.variantId ? `Variante: ${product.variantId}` : undefined,
    `SKU: ${product.sku}`,
    `Precio: ${product.price.amount.toFixed(2)} ${product.price.currency}`,
    `Cupon: ${commerce.couponCode}`,
    product.material ? `Material: ${product.material}` : undefined,
    product.diameterCm ? `Diametro: ${product.diameterCm} cm` : undefined,
    `Envio gratis: ${commerce.freeShipping ? "si" : "no"}`,
    `Metodos de pago: ${commerce.paymentMethodsLabel}`,
    `Compatibilidad: ${commerce.stoveCompatibility}`,
    context.leadId ? `Lead: ${context.leadId}` : undefined,
    context.sessionId ? `Sesion: ${context.sessionId}` : undefined,
    context.source ? `Fuente: ${context.source}` : undefined,
    context.placement ? `Ubicacion: ${context.placement}` : undefined,
    context.utmSource ? `utm_source: ${context.utmSource}` : undefined,
    context.utmMedium ? `utm_medium: ${context.utmMedium}` : undefined,
    context.utmCampaign ? `utm_campaign: ${context.utmCampaign}` : undefined,
    context.utmContent ? `utm_content: ${context.utmContent}` : undefined,
    context.utmTerm ? `utm_term: ${context.utmTerm}` : undefined,
    context.fbclid ? `fbclid: ${context.fbclid}` : undefined,
    context.recommendedSku ? `SKU recomendado: ${context.recommendedSku}` : undefined,
    context.journeyStage ? `Etapa: ${context.journeyStage}` : undefined,
    context.videoSlot ? `Video: ${context.videoSlot}` : undefined,
  ]
    .filter(Boolean)
    .join(" | ")
  const fitQuestion =
    context.fitQuestion ||
    (context.vertical === "bienestar"
      ? "Lo quiero para __. Me confirmas stock y entrega?"
      : "Cocino para __ personas. Me confirmas stock y entrega?")
  const text =
    (context.openingLine || `Hola, quiero la olla de granito ${product.title}.`) +
    `\n${fitQuestion}` +
    `\n\n${details}` +
    `\n\n${tracking}`

  return `https://wa.me/${seller}?text=${encodeURIComponent(text)}`
}
