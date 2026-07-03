import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const b2bCrm = req.scope.resolve("b2bCrm")

  try {
    const review = await b2bCrm.createVerifiedReview(req.validatedBody as any)
    res.status(201).json({ review })
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Error al crear reseña" })
  }
}

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const b2bCrm = req.scope.resolve("b2bCrm")
  const { product_id } = req.query

  if (!product_id || typeof product_id !== "string") {
    return res.status(400).json({ error: "product_id es requerido" })
  }

  try {
    const reviews = await b2bCrm.getProductReviews(product_id)
    const averageRating = await b2bCrm.getProductAverageRating(product_id)

    res.json({
      reviews,
      average_rating: averageRating,
      total_count: reviews.length
    })
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Error al obtener reseñas" })
  }
}
