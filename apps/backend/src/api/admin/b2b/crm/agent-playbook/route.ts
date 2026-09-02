import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { crmService } from "../../_shared"
import { DEFAULT_AGENT_PLAYBOOK } from "../../../../../modules/b2b-crm/default-agent-playbook"

const PLAYBOOK_KEYS = new Set([
  "agent_objecion_precio",
  "agent_objecion_calidad",
  "agent_objecion_envio",
  "agent_objecion_pensarlo",
  "agent_preguntas_frecuentes",
  "agent_formas_de_pago",
  "agent_confianza",
  "agent_cierre",
])

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const errorId = `agent-playbook-${Date.now().toString(36)}`
  try {
    res.json({ items: await crmService(req).agentPlaybook() })
  } catch (error) {
    console.error({ errorId, error }, "CRM agent playbook unavailable")
    res.json({
      items: DEFAULT_AGENT_PLAYBOOK.map((item) => ({ ...item, active: true })),
      warning: "El CRM no respondió. Se cargaron las reglas base; puedes reintentar guardar.",
      errorId,
    })
  }
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
