import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { crmService } from "../../../../_shared"
import { publishInboxEvent } from "../../_events"
import { conversationActor } from "../../_shared"

const noteSchema = z.object({ body: z.string().trim().min(1).max(4000) })

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params as { id: string }
  const input = noteSchema.parse(req.body)
  const note = await crmService(req).addInternalNote(id, input.body, conversationActor(req))
  if (!note) return res.status(404).json({ error: "conversation_not_found" })
  publishInboxEvent({ type: "conversation.updated", conversationId: id, at: new Date().toISOString() })
  res.status(201).json({ note })
}
