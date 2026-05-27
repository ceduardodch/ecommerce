import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { crmService, serializeOrder } from "../../../_shared"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params as { id: string }
  const body = req.body as {
    paymentLink: string
    clientTransactionId: string
    payload?: unknown
  }

  const existing = await crmService(req).findConversationalOrder(id)
  if (!existing) {
    return res.status(404).json({ error: "order_not_found" })
  }

  const order = await crmService(req).updateConversationalOrder(id, {
    paymentLink: body.paymentLink,
    clientTransactionId: body.clientTransactionId,
    events: [
      ...(existing.events || []),
      {
        type: "payphone_link_created",
        at: new Date().toISOString(),
        payload: body.payload || {
          url: body.paymentLink,
          clientTransactionId: body.clientTransactionId,
        },
      },
    ],
  })

  res.json({ order: serializeOrder(order) })
}
