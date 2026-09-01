import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { crmService, serializeCustomer, serializeOrder } from "../../../_shared"
import { publishInboxEvent } from "../_events"
import { conversationActor, serializeConversation, serializeMessage } from "../_shared"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params as { id: string }
  const detail = await crmService(req).conversationDetail(id)
  if (!detail) return res.status(404).json({ error: "conversation_not_found" })
  await crmService(req).markConversationRead(id)
  res.json({
    conversation: serializeConversation({ ...detail.conversation, unread_count: 0 }),
    messages: detail.messages.map(serializeMessage),
    notes: detail.notes.map((note: any) => ({ id: note.id, body: note.body, authorUserId: note.author_user_id, authorUserName: note.author_user_name, at: note.at?.toISOString?.() || note.at })),
    assignments: detail.assignments.map((assignment: any) => ({ action: assignment.action, assignedUserId: assignment.assigned_user_id, assignedUserName: assignment.assigned_user_name, actorUserName: assignment.actor_user_name, at: assignment.at?.toISOString?.() || assignment.at })),
    customer: serializeCustomer(detail.customer),
    orders: detail.orders.map(serializeOrder),
  })
}

export async function PATCH(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params as { id: string }
  const body = req.body as {
    status?: string; mode?: "ai" | "human"; assignedUserId?: string | null; assignedUserName?: string | null
    assignToCurrentUser?: boolean; clearAssignment?: boolean
  }
  const allowedStatuses = new Set(["new", "ai_active", "requires_human", "assigned", "waiting_customer", "closed"])
  if (body.status && !allowedStatuses.has(body.status)) return res.status(400).json({ error: "invalid_status" })
  if (body.mode && !["ai", "human"].includes(body.mode)) return res.status(400).json({ error: "invalid_mode" })
  const actor = conversationActor(req)
  const patch = {
    status: body.status,
    mode: body.mode,
    assignedUserId: body.clearAssignment ? null : body.assignToCurrentUser ? actor.userId : body.assignedUserId,
    assignedUserName: body.clearAssignment ? null : body.assignToCurrentUser ? actor.userName : body.assignedUserName,
  }
  const updated = await crmService(req).updateConversation(id, patch, actor)
  if (!updated) return res.status(404).json({ error: "conversation_not_found" })
  publishInboxEvent({ type: body.assignedUserId !== undefined || body.assignToCurrentUser || body.clearAssignment ? "assignment.changed" : "conversation.updated", conversationId: id, at: new Date().toISOString() })
  res.json({ conversation: serializeConversation(updated) })
}
