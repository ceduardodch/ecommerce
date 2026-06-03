import { z } from "zod"

const customerSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  whatsappConsent: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
})

export const lineInputSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional(),
  quantity: z.number().int().positive().default(1),
})

export const quoteInputSchema = z.object({
  items: z.array(lineInputSchema).min(1),
  customer: customerSchema.optional().default({}),
})

export const orderInputSchema = quoteInputSchema.extend({
  source: z.string().default("whatsapp"),
  notes: z.string().optional(),
})

export const payphoneInputSchema = z.object({
  orderId: z.string().min(1),
  description: z.string().optional(),
})

export const metaDraftInputSchema = z.object({
  productIds: z.array(z.string()).min(1),
  angle: z.string().default("producto"),
  includeMarketplace: z.boolean().default(true),
})

export const customerImportSchema = z
  .object({
    csv: z.string().optional(),
    customers: z
      .array(
        customerSchema.extend({
          phone: z.string().min(1),
          lastPurchaseAt: z.string().optional(),
          purchasedProducts: z
            .array(
              z.object({
                productId: z.string().default("legacy"),
                sku: z.string().default("LEGACY"),
                title: z.string().min(1),
                quantity: z.number().int().positive().default(1),
                purchasedAt: z.string().optional(),
                reorderAfterDays: z.number().int().positive().optional(),
              }),
            )
            .optional(),
          suggestedFrequencyDays: z.number().int().positive().optional(),
          nextFollowupAt: z.string().optional(),
          followupReason: z.string().optional(),
        }),
      )
      .optional(),
  })
  .refine((value) => value.csv || value.customers?.length, {
    message: "Enviar csv o customers",
  })

export const customerEventInputSchema = z.object({
  phone: z.string().min(1),
  type: z.enum([
    "page_view",
    "view_content",
    "video_interest",
    "product_interest",
    "search",
    "whatsapp_click",
    "whatsapp_opened",
    "lead_created",
    "quiz_completed",
    "guide_downloaded",
    "quote_started",
    "checkout_started",
    "purchase_confirmed",
    "campaign_click",
    "campaign_cta_click",
    "quote_created",
    "order_created",
    "paid",
    "payment_proof_received",
    "delivered",
    "followup_due",
    "followup_sent",
    "care_followup_due",
    "care_followup_sent",
    "complement_due",
    "reorder_due",
    "reorder_interest",
    "complement_interest",
    "lead_nuevo",
    "interes_video",
    "cotizacion_pendiente",
    "cliente_pagado",
    "cuidado_postventa",
    "complemento_30d",
    "recompra_90d",
    "opt_out",
    "no_response",
    "conversation_escalated",
  ]),
  at: z.string().optional(),
  payload: z.unknown().optional(),
  orderId: z.string().optional(),
  quoteId: z.string().optional(),
  source: z.string().optional(),
  nextFollowupAt: z.string().optional(),
  followupReason: z.string().optional(),
  whatsappConsent: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
})

const attributionSchema = z
  .object({
    utmSource: z.string().optional(),
    utmMedium: z.string().optional(),
    utmCampaign: z.string().optional(),
    utmContent: z.string().optional(),
    utmTerm: z.string().optional(),
    fbclid: z.string().optional(),
  })
  .optional()

const eventProductSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional(),
  sku: z.string().optional(),
  title: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  price: z.number().optional(),
  currency: z.string().default("USD"),
  quantity: z.number().int().positive().default(1),
  material: z.string().optional(),
  diameterCm: z.number().optional(),
  promoLabel: z.string().optional(),
  stockSignal: z.string().optional(),
  deliveryBadge: z.string().optional(),
  freeShipping: z.boolean().optional(),
  paymentMethods: z.array(z.string()).optional(),
  couponCode: z.string().optional(),
  stoveCompatibility: z.string().optional(),
})

export const toolsEventInputSchema = z.object({
  eventName: z.enum([
    "PageView",
    "ViewContent",
    "Search",
    "Contact",
    "Lead",
    "InitiateCheckout",
    "Purchase",
  ]),
  type: z
    .enum([
      "page_view",
      "view_content",
      "video_interest",
      "product_interest",
      "search",
      "whatsapp_click",
      "whatsapp_opened",
      "lead_created",
      "quiz_completed",
      "guide_downloaded",
      "quote_started",
      "checkout_started",
      "purchase_confirmed",
      "campaign_click",
      "campaign_cta_click",
      "quote_created",
      "order_created",
      "paid",
      "payment_proof_received",
      "delivered",
      "followup_due",
      "followup_sent",
      "care_followup_due",
      "care_followup_sent",
      "complement_due",
      "reorder_due",
      "complement_interest",
      "reorder_interest",
      "lead_nuevo",
      "interes_video",
      "cotizacion_pendiente",
      "cliente_pagado",
      "cuidado_postventa",
      "complemento_30d",
      "recompra_90d",
      "opt_out",
      "no_response",
      "conversation_escalated",
    ])
    .optional(),
  eventId: z.string().min(1).optional(),
  at: z.string().optional(),
  sessionId: z.string().min(1).optional(),
  leadId: z.string().min(1).optional(),
  source: z.string().default("storefront"),
  pageUrl: z.string().optional(),
  referrer: z.string().optional(),
  userAgent: z.string().optional(),
  clientIp: z.string().optional(),
  searchString: z.string().optional(),
  cta: z.string().optional(),
  placement: z.string().optional(),
  fbp: z.string().optional(),
  fbc: z.string().optional(),
  consent: z.boolean().optional(),
  customer: customerSchema.optional(),
  product: eventProductSchema.optional(),
  products: z.array(eventProductSchema).optional(),
  value: z.number().optional(),
  currency: z.string().default("USD"),
  attribution: attributionSchema,
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export type ToolsEventInput = z.infer<typeof toolsEventInputSchema>

export const saleFeedbackInputSchema = z.object({
  phone: z.string().min(1),
  sku: z.string().min(1),
  amount: z.number().positive().optional(),
  currency: z.string().default("USD"),
  quantity: z.number().int().positive().default(1),
  paymentMethod: z
    .enum(["transferencia", "deuna", "payphone", "tarjeta", "efectivo", "otro"])
    .optional(),
  leadId: z.string().min(1).optional(),
  sessionId: z.string().min(1).optional(),
  customerName: z.string().optional(),
  email: z.string().email().optional(),
  whatsappConsent: z.boolean().default(true),
  campaignSlug: z.string().optional(),
  source: z.string().default("manual_sales_feedback"),
  orderId: z.string().optional(),
  quoteId: z.string().optional(),
  notes: z.string().optional(),
  confirmedBy: z.string().optional(),
  at: z.string().optional(),
  consent: z.boolean().default(true),
})

export type SaleFeedbackInput = z.infer<typeof saleFeedbackInputSchema>

export const payphoneWebhookSchema = z
  .object({
    clientTransactionId: z.string().optional(),
    transactionId: z.union([z.string(), z.number()]).optional(),
    statusCode: z.union([z.string(), z.number()]).optional(),
    status: z.string().optional(),
    amount: z.union([z.string(), z.number()]).optional(),
  })
  .passthrough()
