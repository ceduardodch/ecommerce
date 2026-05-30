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
  freeShipping?: boolean
  paymentMethods?: string[]
  couponCode?: string
  material?: string
  coating?: string
  teflonFree?: boolean
  pfoaFree?: boolean
  pfasFree?: boolean
  ptfeFree?: boolean
  capacity?: string
  diameterCm?: number
  pieces?: number
  stoveCompatibility?: string
  tipoCocina?: string
  nivel?: string
  bundleUseCase?: string
  careTips?: string
  healthAngle?: string
  warrantyText?: string
  instagramSourceUrl?: string
  sourceUrls?: string[]
  contentAngles?: string[]
  certificationStatus?: string
  claimNote?: string
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
  | "page_view"
  | "view_content"
  | "video_interest"
  | "product_interest"
  | "search"
  | "whatsapp_click"
  | "whatsapp_opened"
  | "lead_created"
  | "quiz_completed"
  | "guide_downloaded"
  | "quote_started"
  | "checkout_started"
  | "purchase_confirmed"
  | "campaign_click"
  | "quote_created"
  | "order_created"
  | "paid"
  | "payment_proof_received"
  | "delivered"
  | "followup_due"
  | "followup_sent"
  | "care_followup_due"
  | "care_followup_sent"
  | "complement_due"
  | "reorder_due"
  | "reorder_interest"
  | "complement_interest"
  | "lead_nuevo"
  | "interes_video"
  | "cotizacion_pendiente"
  | "cliente_pagado"
  | "cuidado_postventa"
  | "complemento_30d"
  | "recompra_90d"
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
  medusaOrderId?: string
  medusaDraftOrderId?: string
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
