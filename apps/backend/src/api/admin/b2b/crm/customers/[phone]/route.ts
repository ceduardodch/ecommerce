import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { crmService, serializeCustomer, serializeEvent } from "../../../_shared"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { phone } = req.params as { phone: string }
  const customer = await crmService(req).getCustomer(decodeURIComponent(phone))

  if (!customer) {
    return res.status(404).json({ error: "customer_not_found" })
  }

  const events = await crmService(req).listCustomerEvents(
    decodeURIComponent(phone),
    Number(req.query.limit || 50),
  )

  res.json({
    customer: {
      ...serializeCustomer(customer),
      events: events.map(serializeEvent),
    },
  })
}
