import type { MedusaRequest } from "@medusajs/framework/http"

// Escrituras de reseñas protegidas por token compartido (lo inyecta el proxy
// del storefront). Sin REVIEWS_API_TOKEN configurado, la escritura queda
// deshabilitada (fail-closed).
export function reviewsWriteAuth(
  req: MedusaRequest,
): { status: number; error: string } | null {
  const token = process.env.REVIEWS_API_TOKEN
  if (!token) {
    return { status: 503, error: "Reseñas deshabilitadas (falta REVIEWS_API_TOKEN)" }
  }
  if (req.headers["x-reviews-token"] !== token) {
    return { status: 401, error: "No autorizado" }
  }
  return null
}
