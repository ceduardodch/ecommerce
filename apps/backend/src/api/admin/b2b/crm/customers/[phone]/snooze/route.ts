import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { crmService, serializeCustomer } from "../../../../_shared"

type SnoozeBody = {
  until?: string
  days?: number
  reason?: string
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { phone } = req.params as { phone: string }
  const body = req.body as SnoozeBody

  let untilIso = body.until
  if (!untilIso && body.days) {
    const date = new Date()
    date.setDate(date.getDate() + body.days)
    untilIso = date.toISOString()
  }

  if (!untilIso || !Number.isFinite(Date.parse(untilIso))) {
    return res.status(400).json({ error: "fecha_invalida" })
  }

  const decodedPhone = decodeURIComponent(phone)
  const service = crmService(req)
  const event = await service.snoozeFollowup(decodedPhone, untilIso, body.reason)

  if (!event) {
    return res.status(404).json({ error: "customer_not_found" })
  }

  const customer = await service.getCustomer(decodedPhone)
  res.json({ customer: serializeCustomer(customer) })
}
