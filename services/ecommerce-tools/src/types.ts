export type Money = {
  amount: number
  currency: "USD"
}

export type Product = {
  id: string
  variantId: string
  sku: string
  title: string
  description: string
  category: string
  brand: string
  price: Money
  originalPrice?: Money
  discountPercent?: number
  promoLabel?: string
  stockSignal?: string
  bundleEligible?: boolean
  deliveryBadge?: string
  stock: number
  imageUrl: string
  productUrl: string
  tags: string[]
}

export type QuoteLine = {
  productId: string
  variantId: string
  sku: string
  title: string
  quantity: number
  unitPrice: Money
  lineTotal: Money
}

export type Quote = {
  id: string
  lines: QuoteLine[]
  subtotal: Money
  tax: Money
  total: Money
  currency: "USD"
  whatsappMessage: string
}

export type CustomerInput = {
  name?: string
  phone?: string
  email?: string
}

export type OrderRecord = {
  id: string
  quote: Quote
  customer: CustomerInput
  status: "pending_payment" | "paid" | "payment_review" | "cancelled"
  paymentLink?: string
  clientTransactionId?: string
  createdAt: string
  updatedAt: string
  events: Array<{
    type: string
    at: string
    payload: unknown
  }>
}
