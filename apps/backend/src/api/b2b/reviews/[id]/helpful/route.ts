import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { reviewsWriteAuth } from "../../_shared"
import type B2bCrmModuleService from "../../../../../modules/b2b-crm/service"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const denied = reviewsWriteAuth(req)
  if (denied) {
    return res.status(denied.status).json({ error: denied.error })
  }

  const b2bCrm = req.scope.resolve("b2bCrm") as B2bCrmModuleService
  const { id } = req.params

  try {
    const review = await b2bCrm.markReviewHelpful(id)
    if (!review) {
      return res.status(404).json({ error: "Reseña no encontrada" })
    }

    res.json({ helpful_count: review.helpful_count })
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Error al marcar útil" })
  }
}
