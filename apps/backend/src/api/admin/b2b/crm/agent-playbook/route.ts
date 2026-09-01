import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { crmService } from "../../_shared"

const PLAYBOOK_KEYS = new Set([
  "agent_objecion_precio",
  "agent_objecion_calidad",
  "agent_objecion_envio",
  "agent_objecion_pensarlo",
  "agent_preguntas_frecuentes",
  "agent_cierre",
])

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  res.json({ items: await crmService(req).agentPlaybook() })
}

export async function PUT(req: MedusaRequest, res: MedusaResponse) {
  const { items } = req.body as {
    items?: Array<{ key?: string; label?: string; body?: string; active?: boolean }>
  }

  if (!Array.isArray(items) || !items.length) {
    return res.status(400).json({ error: "Se requiere al menos una regla." })
  }

  const invalid = items.find((item) =>
    !item.key || !PLAYBOOK_KEYS.has(item.key) || !item.label?.trim() || !item.body?.trim() || item.body.trim().length < 20,
  )
  if (invalid) {
    return res.status(400).json({
      error: "Cada regla debe tener clave válida, nombre y al menos 20 caracteres.",
    })
  }

  await crmService(req).saveAgentPlaybook(items.map((item) => ({
    key: item.key!,
    label: item.label!.trim(),
    body: item.body!.trim(),
    active: item.active !== false,
  })))

  res.json({ items: await crmService(req).agentPlaybook() })
}
