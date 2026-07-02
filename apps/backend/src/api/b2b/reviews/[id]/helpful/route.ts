import { MedusaRequest, MedusaResponse } from "@medusajs/medusa"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const productReviewService = req.scope.resolve("productReviewService")
  const { id } = req.params

  try {
    const review = await productReviewService.markHelpful(id)
    if (!review) {
      return res.status(404).json({ error: "Reseña no encontrada" })
    }

    res.json({ helpful_count: review.helpful_count })
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Error al marcar útil" })
  }
}
