import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { crmService } from "../../../_shared"

/**
 * Siembra las plantillas base en español. Idempotente: NO pisa las que ya
 * existen, para no borrar los textos ajustados desde el admin.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const result = await crmService(req).seedTemplates()
  res.json({
    created: result.created,
    kept: result.kept,
    message: `${result.created.length} plantillas creadas, ${result.kept.length} ya existían.`,
  })
}
