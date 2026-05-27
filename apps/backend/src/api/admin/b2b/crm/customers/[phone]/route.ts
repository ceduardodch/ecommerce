import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { crmService, serializeCustomer } from "../../../_shared"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { phone } = req.params as { phone: string }
  const customer = await crmService(req).getCustomer(decodeURIComponent(phone))

  if (!customer) {
    return res.status(404).json({ error: "customer_not_found" })
  }

  res.json({ customer: serializeCustomer(customer) })
}
