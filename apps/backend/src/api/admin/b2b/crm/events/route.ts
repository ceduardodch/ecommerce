import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { crmService, serializeCustomer } from "../../_shared"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const input = req.body as {
    phone: string
    type: string
    at?: string
    payload?: unknown
    orderId?: string
    quoteId?: string
    medusaOrderId?: string
    source?: string
    nextFollowupAt?: string
    followupReason?: string
    whatsappConsent?: boolean
    tags?: string[]
  }

  await crmService(req).addCustomerEvent(input)
  const customer = await crmService(req).getCustomer(input.phone)

  res.json({ customer: serializeCustomer(customer) })
}
