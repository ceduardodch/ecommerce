export const defaultCouponCode = "GRANITOHOY"
/**
 * Solo hay DOS formas de pago: transferencia bancaria y tarjeta por Datafast.
 * No hay pago contra entrega — se despacha después de confirmar el pago.
 */
export const supportedPaymentMethods = ["transferencia", "tarjeta"] as const
export const defaultPaymentMethods: string[] = [...supportedPaymentMethods]
export const defaultStoveCompatibility = "Gas, induccion y vitroceramica"
export const defaultFreeShippingLabel = "Envio gratis por Servientrega"
/** Copy corto para los trust grids (reemplaza al viejo "Pagas al recibir"). */
export const paymentBadgeLabel = "Tarjeta o transferencia"

type CommercialProduct = {
  couponCode?: string
  freeShipping?: boolean
  paymentMethods?: string[]
  stoveCompatibility?: string
  deliveryBadge?: string
}

function paymentLabel(method: string) {
  const normalized = method.trim().toLowerCase()
  if (normalized === "tarjeta") return "tarjeta Datafast"
  if (normalized === "transferencia") return "transferencia"
  return method
}

/**
 * Descarta métodos legacy (deuna!, payphone) que sigan guardados en la
 * metadata de un producto en Medusa.
 */
export function normalizePaymentMethods(methods?: string[]) {
  const kept = (methods || []).filter((method) =>
    (supportedPaymentMethods as readonly string[]).includes(
      method.trim().toLowerCase(),
    ),
  )
  return kept.length ? kept : defaultPaymentMethods
}

export function formatPaymentMethods(methods?: string[]) {
  const values = normalizePaymentMethods(methods).map(paymentLabel)
  if (values.length <= 1) return values.join("")
  return `${values.slice(0, -1).join(", ")} o ${values[values.length - 1]}`
}

export function commercialInfo(product?: CommercialProduct) {
  const paymentMethods = normalizePaymentMethods(product?.paymentMethods)
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
