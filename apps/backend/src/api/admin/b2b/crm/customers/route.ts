import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { crmService, serializeCustomer } from "../../_shared"

type ImportBody = {
  customers?: Array<{
    phone: string
    name?: string
    email?: string
    medusaCustomerId?: string
    whatsappConsent?: boolean
    tags?: string[]
    lastPurchaseAt?: string
    purchasedProducts?: Array<{
      productId: string
      sku: string
      title: string
      quantity: number
      purchasedAt?: string
      reorderAfterDays?: number
    }>
    suggestedFrequencyDays?: number
    nextFollowupAt?: string
    followupReason?: string
    metadata?: Record<string, unknown>
  }>
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const limit = Number(req.query.limit || 100)
  const customers = await crmService(req).listCustomers(limit)
  res.json({ customers: customers.map(serializeCustomer) })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = req.body as ImportBody
  const input = body.customers || []
  const imported: unknown[] = []

  for (const customer of input) {
    if (!customer.phone) continue
    imported.push(await crmService(req).upsertCustomer(customer))
  }

  res.json({
    imported: imported.length,
    customers: imported.map(serializeCustomer),
  })
}
