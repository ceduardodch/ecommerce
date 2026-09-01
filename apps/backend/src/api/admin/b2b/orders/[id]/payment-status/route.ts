import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  crmService,
  decrementCatalogStockForOrder,
  serializeOrder,
  updateMedusaSalesOrderStatus,
} from "../../../_shared"

type PaymentStatus = "pending_payment" | "paid" | "payment_failed"

function isPaymentStatus(value: unknown): value is PaymentStatus {
  return ["pending_payment", "paid", "payment_failed"].includes(
    String(value),
  )
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params as { id: string }
  const payload = req.body as { status?: unknown; payment?: Record<string, unknown> }
  if (!isPaymentStatus(payload.status)) {
    return res.status(400).json({ error: "invalid_payment_status" })
  }

  const crm = crmService(req)
  const existing = await crm.findConversationalOrder(id)
  if (!existing) return res.status(404).json({ error: "order_not_found" })

  const now = new Date().toISOString()
  const payment = payload.payment || {}
  const fingerprint = JSON.stringify({ status: payload.status, payment })
  const duplicate = (existing.events || []).some(
    (event: any) =>
      event.type === "datafast_payment_status" &&
      event.payload?.fingerprint === fingerprint,
  )

  if (duplicate) {
    await updateMedusaSalesOrderStatus(
      req,
      existing.medusa_order_id,
      payload.status,
      payment,
      existing.total_amount,
    )
    return res.json({ order: serializeOrder(existing), idempotent: true })
  }

  await updateMedusaSalesOrderStatus(
    req,
    existing.medusa_order_id,
    payload.status,
    payment,
    existing.total_amount,
  )

  if (payload.status === "paid" && existing.status !== "paid") {
    try {
      await decrementCatalogStockForOrder(req, existing.quote?.lines || [])
    } catch (error) {
      // El cobro ya fue aprobado. Lo conservamos para auditoría, pero lo
      // sacamos de entrega automática si hubo una carrera de inventario.
      await updateMedusaSalesOrderStatus(
        req,
        existing.medusa_order_id,
        "paid",
        { ...payment, stock_exception: error instanceof Error ? error.message : "stock_exception" },
        existing.total_amount,
      )
    }
  }

  const order = await crm.updateConversationalOrder(id, {
    status: payload.status,
    events: [
      ...(existing.events || []),
      {
        type: "datafast_payment_status",
        at: now,
        payload: { ...payment, status: payload.status, fingerprint },
      },
    ],
    metadata: {
      paymentMethod: "datafast",
      paymentStatus: payload.status,
      fulfillmentStatus:
        payload.status === "paid" ? "pending_fulfillment" : "not_ready",
    },
  })

  if (payload.status === "paid" && existing.phone) {
    await crm.markPaid({
      externalOrderId: id,
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
      payload: payment,
      source: "datafast",
    })
  }

  res.json({ order: serializeOrder(order), idempotent: false })
}
