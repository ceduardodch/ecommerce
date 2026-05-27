import { z } from "zod"

export const lineInputSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional(),
  quantity: z.number().int().positive().default(1),
})

export const quoteInputSchema = z.object({
  items: z.array(lineInputSchema).min(1),
  customer: z
    .object({
      name: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().email().optional(),
    })
    .optional()
    .default({}),
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

export const payphoneWebhookSchema = z
  .object({
    clientTransactionId: z.string().optional(),
    transactionId: z.union([z.string(), z.number()]).optional(),
    statusCode: z.union([z.string(), z.number()]).optional(),
    status: z.string().optional(),
    amount: z.union([z.string(), z.number()]).optional(),
  })
  .passthrough()
