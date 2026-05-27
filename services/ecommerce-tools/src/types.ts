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
  material?: string
  tipoCocina?: string
  nivel?: string
  bundleUseCase?: string
  careTips?: string
  reorderAfterDays?: number
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
  reorderAfterDays?: number
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
  whatsappConsent?: boolean
  tags?: string[]
}

export type CustomerEventType =
  | "quote_created"
  | "order_created"
  | "paid"
  | "delivered"
  | "followup_due"
  | "followup_sent"
  | "reorder_interest"
  | "opt_out"
  | "no_response"
  | "conversation_escalated"

export type CustomerEventRecord = {
  type: CustomerEventType
  at: string
  payload?: unknown
  orderId?: string
  quoteId?: string
  source?: string
}

export type PurchasedProduct = {
  productId: string
  sku: string
  title: string
  quantity: number
  purchasedAt: string
  reorderAfterDays?: number
}

export type CustomerRecord = {
  phone: string
  name?: string
  email?: string
  whatsappConsent: boolean
  tags: string[]
  lastPurchaseAt?: string
  purchasedProducts: PurchasedProduct[]
  suggestedFrequencyDays?: number
  nextFollowupAt?: string
  followupReason?: string
  createdAt: string
  updatedAt: string
  events: CustomerEventRecord[]
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
