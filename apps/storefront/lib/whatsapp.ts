import { commercialInfo } from "./commercial"
import { calculateCartPricing } from "./cart-pricing"

export type CartItem = {
  id: string
  sku: string
  title: string
  price: number
  comboPrice?: number
  comboMinimumItems?: number
  quantity: number
  image?: string
  category?: string
}

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

/**
 * Número de venta de Eter Niu (Vicky), en formato internacional sin "+".
 *
 * Fuente única: antes cada archivo llevaba su propio literal y había DOS
 * números distintos conviviendo entre el storefront y `ecommerce-tools`, así
 * que según por dónde entrara el cliente el chat caía en un teléfono o en otro.
 * Cualquier CTA, enlace `tel:` o texto legal debe salir de aquí o de
 * `NEXT_PUBLIC_WHATSAPP_SELLER_NUMBER`.
 */
export const SELLER_WHATSAPP_NUMBER = "593987135207"

/** El mismo número en formato local ecuatoriano, para textos legales. */
export const SELLER_WHATSAPP_LOCAL = "0987135207"

/** Para enlaces `tel:`. */
export const SELLER_PHONE_TEL = "+593987135207"

/** Para mostrarlo al cliente. */
export const SELLER_PHONE_DISPLAY = "+593 98 713 5207"

function normalizeWhatsappSellerNumber(value: string) {
  const digits = value.replace(/\D/g, "")
  if (digits === "593999999999" || digits === "9999999999") {
    return SELLER_WHATSAPP_NUMBER
  }
  if (digits.startsWith("0") && digits.length === 10) {
    return `593${digits.slice(1)}`
  }
  return digits || SELLER_WHATSAPP_NUMBER
}

/** Número de venta efectivo: el del entorno si está configurado, o el nuestro. */
export function sellerWhatsappNumber() {
  return normalizeWhatsappSellerNumber(
    process.env.NEXT_PUBLIC_WHATSAPP_SELLER_NUMBER || SELLER_WHATSAPP_NUMBER,
  )
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
  const seller = sellerWhatsappNumber()
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

export function generateCartMessage(
  items: CartItem[],
  total: number,
  customerName?: string,
  customerCity?: string,
): string {
  const { comboApplied, unitPriceForItem } = calculateCartPricing(items)
  const itemsList = items
    .map((item) => {
      const unitPrice = unitPriceForItem(item)
      const comboText = comboApplied && item.comboPrice ? " (precio combo)" : ""
      return `${item.quantity}x ${item.title} - $${(unitPrice * item.quantity).toFixed(2)}${comboText}`
    })
    .join("\n")

  const message = [
    customerName ? `Hola, soy ${customerName}` : "Hola",
    customerCity ? `de ${customerCity}.` : "",
    "",
    "Quiero cotizar este pedido y armar mi combo:",
    "",
    itemsList,
    "",
    `Total: $${total.toFixed(2)}${comboApplied ? " · precio verde aplicado" : ""}`,
    "",
    "Ayúdame a confirmar stock, precio de combo, envío y formas de pago.",
  ]
    .filter(Boolean)
    .join("\n")

  return message
}

export function whatsappCartLink(
  items: CartItem[],
  total: number,
  customerName: string = "",
  customerCity: string = "",
  sessionId?: string,
): string {
  const seller = sellerWhatsappNumber()

  const message = generateCartMessage(items, total, customerName, customerCity)
  const reference = sessionId ? `Ref: cart_${sessionId}` : "Ref: cart"

  const text = [message, "", reference].join("\n")

  return `https://wa.me/${seller}?text=${encodeURIComponent(text)}`
}
