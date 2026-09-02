import type { AppConfig } from "./config.js"
import type { Product, Quote, QuoteLine } from "./types.js"
import { expandCommerceItems } from "./combo-catalog.js"

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
  const expandedItems = expandCommerceItems(products, items)
  const comboGroups = new Map<string, { items: number; minimum: number }>()
  expandedItems.forEach((item) => {
    const product = products.find((candidate) =>
      candidate.id === item.productId ||
      candidate.variantId === item.variantId ||
      candidate.sku === item.productId,
    )
    if (!product?.comboPrice) return
    const group = product.comboGroup || "general"
    const current = comboGroups.get(group) || {
      items: 0,
      minimum: product.comboMinimumItems || 3,
    }
    current.items += item.quantity
    current.minimum = Math.min(current.minimum, product.comboMinimumItems || 3)
    comboGroups.set(group, current)
  })
  const activeComboGroups = new Set(
    [...comboGroups].flatMap(([group, state]) => state.items >= state.minimum ? [group] : []),
  )

  const lines: QuoteLine[] = expandedItems.map((item) => {
    const product = products.find(
      (candidate) =>
        candidate.id === item.productId ||
        candidate.variantId === item.variantId ||
        candidate.sku === item.productId,
    )

    if (!product) {
      throw new Error(`Producto no encontrado: ${item.productId}`)
    }

    const unitPrice = product.comboPrice && activeComboGroups.has(product.comboGroup || "general")
      ? product.comboPrice
      : product.price

    return {
      productId: product.id,
      variantId: product.variantId,
      sku: product.sku,
      title: product.title,
      quantity: item.quantity,
      unitPrice,
      lineTotal: {
        amount: roundMoney(unitPrice.amount * item.quantity),
        currency: "USD",
      },
      reorderAfterDays: product.reorderAfterDays,
    }
  })

  // Los precios del catalogo son PVP final con IVA incluido, igual que el
  // carrito web y DataFast. Separamos la base y el IVA para mostrar el
  // desglose, pero nunca lo sumamos otra vez.
  const total = roundMoney(
    lines.reduce((total, line) => total + line.lineTotal.amount, 0),
  )
  const subtotal = roundMoney(total / (1 + config.taxRate))
  const tax = roundMoney(total - subtotal)
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
      `IVA incluido: ${formatUsd(tax)}`,
      `Total: ${formatUsd(total)}`,
      "Si estás de acuerdo, preparo tu carrito para que revises el pedido y pagues con tarjeta en DataFast.",
    ].join("\n"),
  }
}
