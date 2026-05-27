import type { AppConfig } from "./config.js"
import type { Product, Quote, QuoteLine } from "./types.js"

function roundMoney(amount: number) {
  return Math.round((amount + Number.EPSILON) * 100) / 100
}

function formatUsd(amount: number) {
  return `$${amount.toFixed(2)}`
}

export function buildQuote(
  config: AppConfig,
  products: Product[],
  items: Array<{ productId: string; variantId?: string; quantity: number }>,
): Quote {
  const lines: QuoteLine[] = items.map((item) => {
    const product = products.find(
      (candidate) =>
        candidate.id === item.productId ||
        candidate.variantId === item.variantId ||
        candidate.sku === item.productId,
    )

    if (!product) {
      throw new Error(`Producto no encontrado: ${item.productId}`)
    }

    return {
      productId: product.id,
      variantId: product.variantId,
      sku: product.sku,
      title: product.title,
      quantity: item.quantity,
      unitPrice: product.price,
      lineTotal: {
        amount: roundMoney(product.price.amount * item.quantity),
        currency: "USD",
      },
      reorderAfterDays: product.reorderAfterDays,
    }
  })

  const subtotal = roundMoney(
    lines.reduce((total, line) => total + line.lineTotal.amount, 0),
  )
  const tax = roundMoney(subtotal * config.taxRate)
  const total = roundMoney(subtotal + tax)
  const id = `QT-${Date.now().toString(36).toUpperCase()}`

  const itemText = lines
    .map(
      (line) =>
        `- ${line.quantity} x ${line.title}: ${formatUsd(
          line.lineTotal.amount,
        )}`,
    )
    .join("\n")

  return {
    id,
    lines,
    subtotal: { amount: subtotal, currency: "USD" },
    tax: { amount: tax, currency: "USD" },
    total: { amount: total, currency: "USD" },
    currency: "USD",
    whatsappMessage: [
      "Te comparto la cotizacion:",
      itemText,
      `Subtotal: ${formatUsd(subtotal)}`,
      `Impuestos/configuracion: ${formatUsd(tax)}`,
      `Total: ${formatUsd(total)}`,
      "Si estas de acuerdo, te envio el link de pago PayPhone y coordinamos entrega por WhatsApp.",
    ].join("\n"),
  }
}
