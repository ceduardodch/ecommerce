// Utilidades del proxy de reseñas (server-side only).

export function medusaUrl() {
  return (
    process.env.MEDUSA_INTERNAL_URL ||
    process.env.MEDUSA_BACKEND_URL ||
    "http://localhost:9000"
  )
}

export function reviewsToken() {
  return process.env.REVIEWS_API_TOKEN || ""
}

// Rate limit simple en memoria por IP (suficiente para una instancia).
const hits = new Map<string, number[]>()

export function rateLimited(ip: string, max: number, windowMs: number) {
  const now = Date.now()
  const windowStart = now - windowMs
  const prev = (hits.get(ip) || []).filter((t) => t > windowStart)
  if (prev.length >= max) {
    hits.set(ip, prev)
    return true
  }
  prev.push(now)
  hits.set(ip, prev)
  // Poda ocasional para no crecer sin límite
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (!v.some((t) => t > windowStart)) hits.delete(k)
    }
  }
  return false
}

export function clientIp(req: Request) {
  const fwd = req.headers.get("x-forwarded-for")
  return (fwd ? fwd.split(",")[0] : "").trim() || "unknown"
}
