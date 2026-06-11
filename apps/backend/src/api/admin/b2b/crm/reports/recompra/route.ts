import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { crmService } from "../../../_shared"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const asOf = String(req.query.asOf || new Date().toISOString())
  const crm = crmService(req)
  const metrics = await crm.recompraMetrics(asOf)

  res.json(metrics)
}
