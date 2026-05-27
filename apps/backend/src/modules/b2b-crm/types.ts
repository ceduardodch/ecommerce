export type PurchasedProduct = {
  productId: string
  sku: string
  title: string
  quantity: number
  purchasedAt?: string
  reorderAfterDays?: number
}

export type CrmCustomerInput = {
  phone: string
  name?: string
  email?: string
  medusaCustomerId?: string
  whatsappConsent?: boolean
  tags?: string[]
  lastPurchaseAt?: string
  purchasedProducts?: PurchasedProduct[]
  suggestedFrequencyDays?: number
  nextFollowupAt?: string
  followupReason?: string
  metadata?: Record<string, unknown>
}

export type CrmCustomerEventInput = {
  phone: string
  type: string
  at?: string
  quoteId?: string
  orderId?: string
  medusaOrderId?: string
  source?: string
  payload?: unknown
  nextFollowupAt?: string
  followupReason?: string
  whatsappConsent?: boolean
  tags?: string[]
}

export type ConversationalOrderInput = {
  externalId: string
  quoteId?: string
  phone?: string
  status: string
  medusaOrderId?: string
  medusaDraftOrderId?: string
  paymentLink?: string
  clientTransactionId?: string
  totalAmount?: number
  currencyCode?: string
  quote?: unknown
  customer?: unknown
  events?: unknown[]
  metadata?: Record<string, unknown>
}
