export const defaultCouponCode = "GRANITOHOY"
export const defaultPaymentMethods = ["transferencia", "deuna", "payphone"]
export const defaultStoveCompatibility = "Gas, induccion y vitroceramica"
export const defaultFreeShippingLabel = "Envio gratis por Servientrega"

type CommercialProduct = {
  couponCode?: string
  freeShipping?: boolean
  paymentMethods?: string[]
  stoveCompatibility?: string
  deliveryBadge?: string
}

function paymentLabel(method: string) {
  const normalized = method.trim().toLowerCase()
  if (normalized === "deuna") return "deuna!"
  if (normalized === "payphone") return "PayPhone/tarjeta"
  if (normalized === "transferencia") return "transferencia"
  return method
}

export function formatPaymentMethods(methods?: string[]) {
  const values = methods?.length ? methods : defaultPaymentMethods
  return values.map(paymentLabel).join(", ")
}

export function commercialInfo(product?: CommercialProduct) {
  const paymentMethods = product?.paymentMethods?.length
    ? product.paymentMethods
    : defaultPaymentMethods
  const couponCode = product?.couponCode || defaultCouponCode
  const freeShipping = product?.freeShipping ?? true
  const stoveCompatibility =
    product?.stoveCompatibility || defaultStoveCompatibility

  return {
    couponCode,
    freeShipping,
    freeShippingLabel: freeShipping
      ? defaultFreeShippingLabel
      : product?.deliveryBadge || "Entrega coordinada",
    paymentMethods,
    paymentMethodsLabel: formatPaymentMethods(paymentMethods),
    stoveCompatibility,
  }
}
