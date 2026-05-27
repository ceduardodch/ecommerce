import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  B2bOrderPayload,
  createMedusaDraftOrder,
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
  const customerPayload = input.customer || {}
  const phone = customerPayload.phone
    ? normalizePhone(customerPayload.phone)
    : undefined

  const medusaCustomer = await findOrCreateMedusaCustomer(req, customerPayload)
  const medusaDraftOrder = await createMedusaDraftOrder(
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
      medusaOrderId: medusaDraftOrder.id,
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
    status: "pending_payment",
    medusaOrderId: medusaDraftOrder.id,
    medusaDraftOrderId: medusaDraftOrder.id,
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
          medusaDraftOrderId: medusaDraftOrder.id,
        },
      },
    ],
  })

  res.json({ order: serializeOrder(order) })
}
