import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { basename, resolve } from "node:path"
import { readFile } from "node:fs/promises"
import { crmService } from "../../../../../_shared"

const mediaDir = () => process.env.CRM_WHATSAPP_MEDIA_DIR || "/app/data/whatsapp-media"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { id, messageId } = req.params as { id: string; messageId: string }
  const detail = await crmService(req).conversationDetail(id)
  if (!detail) return res.status(404).json({ error: "conversation_not_found" })
  const message = detail.messages.find((item: any) => item.id === messageId)
  if (!message?.media_path) return res.status(404).json({ error: "media_not_found" })
  const filename = basename(String(message.media_path))
  const filePath = resolve(mediaDir(), filename)
  if (!filePath.startsWith(resolve(mediaDir()))) return res.status(400).json({ error: "invalid_media_path" })
  try {
    const content = await readFile(filePath)
    res.setHeader("content-type", message.media_mime_type || "application/octet-stream")
    res.setHeader("content-disposition", `inline; filename="${String(message.media_name || filename).replace(/[^a-zA-Z0-9._-]/g, "_")}"`)
    return res.send(content)
  } catch {
    return res.status(404).json({ error: "media_not_found" })
  }
}
