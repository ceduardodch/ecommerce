import { MedusaService } from "@medusajs/framework/utils"
import ProductReview from "../models/product-review"

interface CreateReviewDTO {
  product_id: string
  product_sku: string
  customer_phone: string
  customer_name: string
  rating: number
  title: string
  content: string
  photos?: string[]
}

class ProductReviewService extends MedusaService({
  ProductReview,
}) {
  private service_() {
    return this as unknown as any
  }

  /**
   * Verifica si el cliente compró el producto.
   * Revisa el perfil del cliente y su historial de purchased_products.
   */
  async verifyPurchase(phone: string, productId: string): Promise<boolean> {
    const crmService = (this as any).__moduleContainer__.resolve("b2bCrm")
    const [customer] = await crmService.service_().listCrmCustomerProfiles(
      { phone },
      { take: 1 },
    )

    if (!customer) return false

    const purchasedProducts = customer.purchased_products || []
    return purchasedProducts.some(
      (p: any) => p.productId === productId || p.sku === productId
    )
  }

  /**
   * Crea una review con verificación de compra automática.
   */
  async createVerifiedReview(data: CreateReviewDTO) {
    const isVerified = await this.verifyPurchase(
      data.customer_phone,
      data.product_id
    )

    const review = await this.service_().createProductReviews({
      ...data,
      verified_purchase: isVerified,
      photos: data.photos || [],
    })

    return review
  }

  /**
   * Obtiene reviews de un producto, ordenadas por fecha (más recientes primero).
   */
  async getByProduct(productId: string, limit = 10) {
    return this.service_().listProductReviews(
      { product_id: productId },
      { take: limit, order: { created_at: "DESC" } },
    )
  }

  /**
   * Marca una review como útil (helpful).
   */
  async markHelpful(id: string) {
    const [review] = await this.service_().listProductReviews(
      { id },
      { take: 1 },
    )

    if (!review) return undefined

    return this.service_().updateProductReviews({
      id: review.id,
      helpful_count: (review.helpful_count || 0) + 1,
    })
  }

  /**
   * Calcula el rating promedio de un producto.
   */
  async getAverageRating(productId: string): Promise<number> {
    const reviews = await this.getByProduct(productId, 1000)

    if (reviews.length === 0) return 0

    const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0)
    return Math.round((sum / reviews.length) * 10) / 10
  }

  /**
   * Obtiene el resumen de reviews de un producto.
   */
  async getProductReviewSummary(productId: string) {
    const reviews = await this.getByProduct(productId, 100)
    const averageRating = await this.getAverageRating(productId)

    // Distribución de ratings
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    reviews.forEach((r) => {
      const rating = r.rating || 0
      if (rating >= 1 && rating <= 5) {
        distribution[rating as keyof typeof distribution]++
      }
    })

    return {
      product_id: productId,
      total_count: reviews.length,
      average_rating: averageRating,
      distribution,
      reviews: reviews.slice(0, 10), // Primeras 10 reviews
    }
  }
}

export default ProductReviewService
