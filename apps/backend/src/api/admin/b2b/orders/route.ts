import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  B2bOrderPayload,
  createMedusaSalesOrder,
  crmService,
  customerInputFromPayload,
  findOrCreateMedusaCustomer,
  normalizePhone,
  serializeOrder,
} from "../_shared"

function externalOrderId() {
  return `B2B-${Date.now().toString(36).toUpperCase()}`
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const input = req.body as B2bOrderPayload
  const crm = crmService(req)
  const externalId = input.externalId || externalOrderId()
  const paymentStatus = input.paymentStatus || "pending_payment"
  const customerPayload = input.customer || {}
  const phone = customerPayload.phone
    ? normalizePhone(customerPayload.phone)
    : undefined

  const existing = await crm.findConversationalOrder(externalId)
  if (existing) {
    return res.json({ order: serializeOrder(existing), idempotent: true })
  }

  const medusaCustomer = await findOrCreateMedusaCustomer(req, customerPayload)
  const medusaOrder = await createMedusaSalesOrder(
    req,
    { ...input, externalId },
    medusaCustomer,
  )

  const crmCustomer = customerInputFromPayload(
    customerPayload,
    medusaCustomer.id,
  )
  if (crmCustomer) {
    await crm.upsertCustomer(crmCustomer)
    await crm.addCustomerEvent({
      phone: crmCustomer.phone,
      type: "order_created",
      at: new Date().toISOString(),
      orderId: externalId,
      quoteId: input.quote.id,
      medusaOrderId: medusaOrder.id,
      source: input.source || "whatsapp",
      payload: {
        total: input.quote.total,
        notes: input.notes,
      },
    })
  }

  const order = await crm.createConversationalOrder({
    externalId,
    quoteId: input.quote.id,
    phone,
    status: paymentStatus,
    medusaOrderId: medusaOrder.id,
    totalAmount: input.quote.total.amount,
    currencyCode: input.quote.currency?.toLowerCase() || "usd",
    quote: input.quote,
    customer: {
      ...customerPayload,
      phone,
      medusaCustomerId: medusaCustomer.id,
    },
    events: [
      {
        type: "created",
        at: new Date().toISOString(),
        payload: {
          source: input.source || "whatsapp",
          notes: input.notes,
          medusaOrderId: medusaOrder.id,
        },
      },
      ...(paymentStatus === "paid"
        ? [
            {
              type: "paid",
              at: new Date().toISOString(),
              payload: { source: input.source || "whatsapp" },
            },
          ]
        : []),
    ],
  })

  res.json({ order: serializeOrder(order), idempotent: false })
}
