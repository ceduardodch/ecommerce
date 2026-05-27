import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { crmService, serializeOrder } from "../../_shared"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params as { id: string }
  const order = await crmService(req).findConversationalOrder(id)

  if (!order) {
    return res.status(404).json({ error: "order_not_found" })
  }

  res.json({ order: serializeOrder(order) })
}
