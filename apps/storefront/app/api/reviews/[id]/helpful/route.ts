import { NextResponse } from "next/server"
import { clientIp, medusaUrl, rateLimited, reviewsToken } from "../../lib"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  if (!/^[A-Za-z0-9_-]{1,64}$/.test(id)) {
    return NextResponse.json({ error: "id inválido" }, { status: 400 })
  }

  if (rateLimited(clientIp(req), 10, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Demasiados intentos." }, { status: 429 })
  }

  const token = reviewsToken()
  if (!token) {
    return NextResponse.json({ error: "No disponible." }, { status: 503 })
  }

  try {
    const res = await fetch(
      `${medusaUrl()}/b2b/reviews/${encodeURIComponent(id)}/helpful`,
      { method: "POST", headers: { "x-reviews-token": token } },
    )
    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ error: "No disponible." }, { status: 502 })
  }
}
