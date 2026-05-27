import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { crmService, serializeCustomer } from "../../../_shared"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const asOf = String(req.query.asOf || new Date().toISOString())
  const limit = Number(req.query.limit || 50)
  const customers = await crmService(req).dueFollowups(asOf, limit)

  res.json({ customers: customers.map(serializeCustomer) })
}
