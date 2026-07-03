import { NextResponse } from "next/server"
import { clientIp, medusaUrl, rateLimited, reviewsToken } from "./lib"

// Proxy server-side de reseñas: el navegador habla con /api/reviews y este
// route habla con el backend Medusa (/b2b/reviews) inyectando el token de
// escritura. El token nunca llega al cliente.

const EMPTY = { reviews: [], average_rating: 0, total_count: 0 }

export async function GET(req: Request) {
  const url = new URL(req.url)
  const productId = url.searchParams.get("product_id")
  if (!productId) {
    return NextResponse.json({ error: "product_id es requerido" }, { status: 400 })
  }

  try {
    const res = await fetch(
      `${medusaUrl()}/b2b/reviews?product_id=${encodeURIComponent(productId)}`,
      { cache: "no-store" },
    )
    if (!res.ok) {
      return NextResponse.json(EMPTY)
    }
    return NextResponse.json(await res.json())
  } catch {
    // Backend caído: la ficha muestra "sin reseñas" en vez de romperse.
    return NextResponse.json(EMPTY)
  }
}

export async function POST(req: Request) {
  if (rateLimited(clientIp(req), 3, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Demasiados intentos, espera unos minutos." },
      { status: 429 },
    )
  }

  const token = reviewsToken()
  if (!token) {
    return NextResponse.json(
      { error: "Reseñas deshabilitadas temporalmente." },
      { status: 503 },
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 })
  }

  // Honeypot: los bots suelen llenar todos los campos.
  if (body && typeof body === "object" && (body as Record<string, unknown>).website) {
    return NextResponse.json({ ok: true })
  }

  try {
    const res = await fetch(`${medusaUrl()}/b2b/reviews`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-reviews-token": token,
      },
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json(
      { error: "No se pudo enviar la reseña, intenta más tarde." },
      { status: 502 },
    )
  }
}
