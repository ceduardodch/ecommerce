import { MedusaRequest, MedusaResponse } from "@medusajs/medusa"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const productReviewService = req.scope.resolve("productReviewService")

  try {
    const review = await productReviewService.createVerifiedReview(req.validatedBody)
    res.status(201).json({ review })
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Error al crear reseña" })
  }
}

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const productReviewService = req.scope.resolve("productReviewService")
  const { product_id } = req.query

  if (!product_id || typeof product_id !== "string") {
    return res.status(400).json({ error: "product_id es requerido" })
  }

  try {
    const reviews = await productReviewService.getByProduct(product_id)
    const averageRating = await productReviewService.getAverageRating(product_id)

    res.json({
      reviews,
      average_rating: averageRating,
      total_count: reviews.length
    })
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Error al obtener reseñas" })
  }
}
