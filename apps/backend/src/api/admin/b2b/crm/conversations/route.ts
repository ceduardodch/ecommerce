import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { crmService } from "../../_shared"
import { serializeConversation } from "./_shared"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.query as Record<string, string | undefined>
  const assignedUserId = query.assigned === "unassigned"
    ? "__unassigned__"
    : query.assignedUserId
  const result = await crmService(req).listConversations({
    status: query.status,
    mode: query.mode,
    assignedUserId,
    unreadOnly: query.unreadOnly === "true",
    q: query.q,
    offset: query.offset ? Number(query.offset) : 0,
    limit: query.limit ? Number(query.limit) : 50,
  })
  res.json({ conversations: result.conversations.map(serializeConversation), count: result.count })
}
