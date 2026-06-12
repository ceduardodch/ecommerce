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

function normalizeWhatsappSellerNumber(value: string) {
  const digits = value.replace(/\D/g, "")
  if (digits === "593999999999" || digits === "9999999999") {
    return "593979854905"
  }
  if (digits.startsWith("0") && digits.length === 10) {
    return `593${digits.slice(1)}`
  }
  return digits || "593979854905"
}

function isKnifeProduct(product: WhatsappProduct) {
  return [product.category, product.title, product.sku]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes("cuchillo")
}

function isKitchenComplement(product: WhatsappProduct) {
  return (
    isKnifeProduct(product) ||
    product.stoveCompatibility?.toLowerCase().includes("no aplica")
  )
}

function defaultOpeningLine(
  product: WhatsappProduct,
  context: WhatsappContext,
) {
  if (context.vertical === "bienestar") {
    return `Hola, quiero reclamar la promo de ${product.title}.`
  }

  if (isKnifeProduct(product)) {
    const title = product.title.replace(/^cuchillo\b/i, "cuchillo")
    return `Hola, quiero reclamar la promo del ${title}.`
  }

  if (isKitchenComplement(product)) {
    return `Hola, quiero reclamar la promo de ${product.title}.`
  }

  return `Hola, quiero reclamar la promo de la olla de granito ${product.title}.`
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
  const seller = normalizeWhatsappSellerNumber(
    process.env.NEXT_PUBLIC_WHATSAPP_SELLER_NUMBER || "593979854905",
  )
  const fitQuestion =
    context.fitQuestion ||
    (context.vertical === "bienestar" || isKitchenComplement(product)
      ? "Me confirmas stock, envio gratis por Servientrega y formas de pago?"
      : "Cocino para __ personas. Me confirmas stock, envio gratis por Servientrega y formas de pago?")
  const priceLine = `Vi la promo de $${product.price.amount.toFixed(2)} con cupon ${commerce.couponCode}.`
  const reference = context.leadId || product.sku
  const text = [
    context.openingLine || defaultOpeningLine(product, context),
    "",
    priceLine,
    fitQuestion,
    "",
    `Ref: ${reference}`,
  ].join("\n")

  return `https://wa.me/${seller}?text=${encodeURIComponent(text)}`
}
