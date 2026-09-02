import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { crmService } from "../../_shared"
import {
  DEFAULT_COMMERCE_SETTINGS,
  validateCommerceSetting,
} from "../../../../../modules/b2b-crm/default-commerce-settings"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const errorId = `commerce-settings-${Date.now().toString(36)}`
  try {
    res.json({ items: await crmService(req).commerceSettings() })
  } catch (error) {
    console.error({ errorId, error }, "CRM commerce settings unavailable")
    // El panel debe seguir mostrando la configuración base durante un
    // despliegue: es preferible eso a una pantalla vacía sin contexto.
    res.json({
      items: DEFAULT_COMMERCE_SETTINGS.map((seed) => ({ ...seed, isDefault: true })),
      warning: "El CRM no respondió. Se cargó la configuración base; puedes reintentar guardar.",
      errorId,
    })
  }
}

export async function PUT(req: MedusaRequest, res: MedusaResponse) {
  const { items } = req.body as {
    items?: Array<{ key?: string; value?: string }>
  }

  if (!Array.isArray(items) || !items.length) {
    return res.status(400).json({ error: "Se requiere al menos un ajuste." })
  }

  const validated: Array<{ key: string; value: string }> = []
  for (const item of items) {
    if (!item.key) return res.status(400).json({ error: "Falta la clave del ajuste." })
    const result = validateCommerceSetting(item.key, item.value ?? "")
    if ("error" in result) return res.status(400).json({ error: result.error })
    validated.push({ key: item.key, value: result.value })
  }

  res.json({ items: await crmService(req).saveCommerceSettings(validated) })
}
