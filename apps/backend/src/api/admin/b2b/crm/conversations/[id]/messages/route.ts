import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { crmService } from "../../../../_shared"
import { publishInboxEvent } from "../../_events"
import { conversationActor } from "../../_shared"

const messageSchema = z.object({ text: z.string().trim().min(1).max(4096) })

function toolsUrl() {
  return process.env.ECOMMERCE_TOOLS_INTERNAL_URL || "http://ecommerce-tools:8787"
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params as { id: string }
  const input = messageSchema.parse(req.body)
  const conversation = await crmService(req).getConversation(id)
  if (!conversation) return res.status(404).json({ error: "conversation_not_found" })
  const token = process.env.TOOLS_API_TOKEN
  if (!token) return res.status(503).json({ error: "tools_not_configured" })
  const response = await fetch(`${toolsUrl()}/tools/whatsapp/reply`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${token}`, "x-crm-sender": "human", "x-crm-actor-id": conversationActor(req).userId || "admin" },
    body: JSON.stringify({ phone: conversation.phone, text: input.text }),
  })
  const result = await response.json().catch(() => ({})) as Record<string, unknown>
  if (!response.ok) return res.status(response.status).json(result)
  await crmService(req).updateConversation(id, { status: "waiting_customer", mode: "human" }, conversationActor(req))
  publishInboxEvent({ type: "message.created", conversationId: id, at: new Date().toISOString() })
  res.status(201).json(result)
}
