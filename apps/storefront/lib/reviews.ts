/**
 * Resumen de reseñas leído en el servidor.
 *
 * El componente `CustomerReviews` ya las pide desde el navegador para pintarlas,
 * pero Google no ejecuta ese fetch al rastrear: para que `aggregateRating` del
 * JSON-LD cuente, el dato tiene que venir en el HTML del servidor.
 */
export type ReviewSummary = {
  averageRating: number
  totalCount: number
}

function medusaUrl() {
  return (
    process.env.MEDUSA_INTERNAL_URL ||
    process.env.MEDUSA_BACKEND_URL ||
    "http://localhost:9000"
  )
}

/**
 * Devuelve `undefined` si no hay reseñas o si el backend no responde. Nunca
 * lanza: una ficha de producto no puede romperse porque el servicio de reseñas
 * esté caído, y un `aggregateRating` inventado es motivo de acción manual de
 * Google.
 */
export async function getReviewSummary(
  productId: string,
): Promise<ReviewSummary | undefined> {
  try {
    // Cacheado como el catálogo: un `no-store` aquí volvería dinámica toda la
    // ficha y anularía su `revalidate`. El bloque de reseñas que ve el usuario
    // se sigue pidiendo en vivo desde el navegador; esto es solo para el
    // JSON-LD, donde 5 minutos de desfase no cambian nada.
    const response = await fetch(
      `${medusaUrl()}/b2b/reviews?product_id=${encodeURIComponent(productId)}`,
      { next: { revalidate: 300, tags: ["reviews"] } },
    )
    if (!response.ok) return undefined

    const data = (await response.json()) as {
      average_rating?: number
      total_count?: number
    }
    const totalCount = Number(data.total_count) || 0
    const averageRating = Number(data.average_rating) || 0
    if (totalCount < 1 || averageRating <= 0) return undefined

    return { averageRating, totalCount }
  } catch {
    return undefined
  }
}
