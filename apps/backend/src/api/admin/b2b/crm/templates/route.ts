import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { crmService } from "../../_shared"
import { canonicalizeEterNiuPublicUrls } from "../../../../../modules/b2b-crm/followup-dispatch"

const MEDIA_KINDS = ["video", "image", "document"] as const
type MediaKind = (typeof MEDIA_KINDS)[number]

function serialize(t: any) {
  return {
    id: t.id,
    key: t.key,
    label: t.label,
    body: t.body,
    mediaUrl: t.media_url,
    mediaType: t.media_type,
    active: t.active,
    createdAt: t.created_at,
    updatedAt: t.updated_at,
  }
}

/** El adjunto debe ser una URL pública https (Meta la descarga por su cuenta). */
function validateMedia(mediaUrl?: string | null, mediaType?: string | null) {
  if (!mediaUrl) return { ok: true as const }
  if (!/^https:\/\/[^\s]+$/i.test(mediaUrl)) {
    return { ok: false as const, error: "El adjunto debe ser una URL https pública." }
  }
  if (!mediaType || !MEDIA_KINDS.includes(mediaType as MediaKind)) {
    return {
      ok: false as const,
      error: `mediaType debe ser uno de: ${MEDIA_KINDS.join(", ")}.`,
    }
  }
  return { ok: true as const }
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const activeOnly = req.query.active !== "false"
  const templates = await crmService(req).listTemplates(activeOnly)
  res.json({ templates: templates.map(serialize) })
}

/** Crea una plantilla nueva (o actualiza si la key ya existe). */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { key, body, label, active, mediaUrl, mediaType } = req.body as {
    key?: string
    body?: string
    label?: string
    active?: boolean
    mediaUrl?: string | null
    mediaType?: string | null
  }

  if (!key || !/^[a-z0-9_]{2,40}$/.test(key)) {
    return res.status(400).json({
      error: "Se requiere 'key' en minúsculas, sin espacios (a-z, 0-9, _).",
    })
  }
  if (!body || body.trim().length < 10) {
    return res.status(400).json({ error: "El mensaje debe tener al menos 10 caracteres." })
  }

  const media = validateMedia(mediaUrl, mediaType)
  if (!media.ok) return res.status(400).json({ error: media.error })

  const template = await crmService(req).upsertTemplate({
    key,
    body: canonicalizeEterNiuPublicUrls(body),
    label,
    active,
    mediaUrl: mediaUrl ? canonicalizeEterNiuPublicUrls(mediaUrl) : null,
    mediaType: mediaType ?? null,
  })

  res.json({ template: serialize(template) })
}

export async function PATCH(req: MedusaRequest, res: MedusaResponse) {
  const { key, body, active, label, mediaUrl, mediaType } = req.body as {
    key?: string
    body?: string
    active?: boolean
    label?: string
    mediaUrl?: string | null
    mediaType?: string | null
  }

  if (!key) {
    return res.status(400).json({ error: "Se requiere 'key' para actualizar" })
  }

  const media = validateMedia(mediaUrl, mediaType)
  if (!media.ok) return res.status(400).json({ error: media.error })

  const updated = await crmService(req).updateTemplate(key, {
    body: body ? canonicalizeEterNiuPublicUrls(body) : body,
    active,
    label,
    mediaUrl: mediaUrl ? canonicalizeEterNiuPublicUrls(mediaUrl) : mediaUrl,
    mediaType,
  })

  if (!updated) {
    return res.status(404).json({ error: "Plantilla no encontrada" })
  }

  res.json({ template: serialize(updated) })
}
