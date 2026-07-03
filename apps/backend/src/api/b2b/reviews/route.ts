import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { normalizeEcPhone } from "../../../lib/ec-phone"
import { reviewsWriteAuth } from "./_shared"

const createReviewSchema = z.object({
  product_id: z.string().min(1).max(120),
  product_sku: z.string().min(1).max(120),
  customer_phone: z.string().min(9).max(20),
  customer_name: z.string().trim().min(2).max(80),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().min(3).max(120),
  content: z.string().trim().min(10).max(2000),
})

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const denied = reviewsWriteAuth(req)
  if (denied) {
    return res.status(denied.status).json({ error: denied.error })
  }

  const parsed = createReviewSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      error: "Datos inválidos",
      details: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
    })
  }

  const phone = normalizeEcPhone(parsed.data.customer_phone)
  if ("error" in phone) {
    return res.status(400).json({ error: "Teléfono inválido (usa formato ecuatoriano 09XXXXXXXX)" })
  }

  const b2bCrm = req.scope.resolve("b2bCrm")

  try {
    const review = await b2bCrm.createVerifiedReview({
      ...parsed.data,
      customer_phone: phone.phone,
      photos: [],
    })
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
    const { reviews, count } = await b2bCrm.getProductReviewsWithCount(product_id)
    const averageRating = await b2bCrm.getProductAverageRating(product_id)

    res.json({
      reviews,
      average_rating: averageRating,
      total_count: count,
    })
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Error al obtener reseñas" })
  }
}
