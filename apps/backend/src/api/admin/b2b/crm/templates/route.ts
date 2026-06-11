import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { crmService } from "../../_shared"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const activeOnly = req.query.active !== "false"
  const templates = await crmService(req).listTemplates(activeOnly)

  res.json({
    templates: templates.map((t) => ({
      id: t.id,
      key: t.key,
      body: t.body,
      active: t.active,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
    })),
  })
}

export async function PATCH(req: MedusaRequest, res: MedusaResponse) {
  const { key, body, active } = req.body as { key?: string; body?: string; active?: boolean }

  if (!key) {
    return res.status(400).json({ error: "Se requiere 'key' para actualizar" })
  }

  const updated = await crmService(req).updateTemplate(key, { body, active })

  if (!updated) {
    return res.status(404).json({ error: "Plantilla no encontrada" })
  }

  res.json({
    template: {
      id: updated.id,
      key: updated.key,
      body: updated.body,
      active: updated.active,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
    },
  })
}
