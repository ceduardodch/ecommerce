import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { crmService, serializeCustomer } from "../../_shared"
import { publishInboxEvent } from "../conversations/_events"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const input = req.body as {
    phone: string
    type: string
    at?: string
    customer?: {
      name?: string
      email?: string
      whatsappConsent?: boolean
      tags?: string[]
      metadata?: Record<string, unknown>
    }
    payload?: unknown
    metadata?: Record<string, unknown>
    orderId?: string
    quoteId?: string
    medusaOrderId?: string
    source?: string
    nextFollowupAt?: string
    followupReason?: string
    whatsappConsent?: boolean
    tags?: string[]
  }

  const recorded = await crmService(req).addCustomerEvent(input)
  const customer = await crmService(req).getCustomer(input.phone)

  if (input.type === "message_in" || input.type === "message_out") {
    const conversation = await crmService(req).getConversationByPhone(input.phone)
    if (conversation) {
      publishInboxEvent({
        type: "message.created",
        conversationId: conversation.id,
        at: new Date().toISOString(),
      })
    }
  }
  if (input.type === "message_status" && recorded && typeof recorded === "object") {
    const message = recorded as { conversation_id?: string }
    if (message.conversation_id) {
      publishInboxEvent({
        type: "message.status",
        conversationId: message.conversation_id,
        at: new Date().toISOString(),
      })
    }
  }

  res.json({ customer: serializeCustomer(customer) })
}
