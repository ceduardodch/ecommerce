import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { crmService, serializeOrder } from "../../_shared"

function isPaidStatus(payload: Record<string, unknown>) {
  const rawStatus = String(payload.status || payload.statusCode || "")
  return ["2", "3", "approved", "success", "paid"].includes(
    rawStatus.toLowerCase(),
  )
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const payload = req.body as Record<string, unknown>
  const clientTransactionId = String(payload.clientTransactionId || "")
  const crm = crmService(req)
  const existing = clientTransactionId
    ? await crm.findConversationalOrderByClientTransaction(clientTransactionId)
    : undefined

  if (!existing) {
    return res.json({ matched: false, status: "unmatched", payload })
  }

  const paid = isPaidStatus(payload)
  const now = new Date().toISOString()
  const order = await crm.updateConversationalOrder(existing.external_id, {
    status: paid ? "paid" : "payment_review",
    events: [
      ...(existing.events || []),
      {
        type: "payphone_notification",
        at: now,
        payload,
      },
    ],
  })

  if (paid) {
    await crm.markPaid({
      externalOrderId: existing.external_id,
      phone: existing.phone,
      quoteId: existing.quote_id,
      medusaOrderId: existing.medusa_order_id,
      purchasedProducts: (existing.quote?.lines || []).map((line: any) => ({
        productId: line.productId,
        sku: line.sku,
        title: line.title,
        quantity: line.quantity,
        purchasedAt: now,
        reorderAfterDays: line.reorderAfterDays,
      })),
      payload,
    })
  }

  res.json({
    matched: true,
    status: order?.status,
    order: serializeOrder(order),
  })
}
