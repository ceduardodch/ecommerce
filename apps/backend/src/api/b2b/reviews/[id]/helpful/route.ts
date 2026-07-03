import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const b2bCrm = req.scope.resolve("b2bCrm")
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
