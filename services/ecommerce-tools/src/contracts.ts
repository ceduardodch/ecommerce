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
    "quote_created",
    "order_created",
    "paid",
    "delivered",
    "followup_due",
    "followup_sent",
    "reorder_interest",
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

export const payphoneWebhookSchema = z
  .object({
    clientTransactionId: z.string().optional(),
    transactionId: z.union([z.string(), z.number()]).optional(),
    statusCode: z.union([z.string(), z.number()]).optional(),
    status: z.string().optional(),
    amount: z.union([z.string(), z.number()]).optional(),
  })
  .passthrough()
