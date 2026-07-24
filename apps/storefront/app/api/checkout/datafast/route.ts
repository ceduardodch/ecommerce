import { NextRequest, NextResponse } from "next/server"
import { rateLimited } from "../../reviews/lib"

function toolsUrl() {
  return (
    process.env.TOOLS_API_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_TOOLS_API_URL ||
    "http://localhost:8787"
  )
}

function clientIp(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    undefined
  )
}

// Crea el checkout en Datafast (server-side: el secreto vive en ecommerce-tools).
export async function POST(request: NextRequest) {
  // Anti-spam: 10 checkouts por IP cada 10 min (holgado para la certificación,
  // corta el abuso del API de Datafast y el inflado del ledger).
  if (rateLimited(`datafast:${clientIp(request) || "unknown"}`, 10, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: "too_many_requests", message: "Demasiados intentos. Espera unos minutos." },
      { status: 429 },
    )
  }
  const payload = (await request.json().catch(() => ({}))) as Record<
    string,
    unknown
  >
  const headers: Record<string, string> = { "content-type": "application/json" }
  if (process.env.TOOLS_API_TOKEN) {
    headers.authorization = `Bearer ${process.env.TOOLS_API_TOKEN}`
  }

  try {
    const response = await fetch(`${toolsUrl()}/tools/datafast/checkout`, {
      method: "POST",
      headers: {
        ...headers,
        "x-forwarded-for": clientIp(request) || "",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    })
    const body = await response
      .json()
      .catch(async () => ({ raw: await response.text().catch(() => "") }))
    return NextResponse.json(body, { status: response.ok ? 200 : response.status })
  } catch (error) {
    return NextResponse.json(
      {
        error: "datafast_proxy_unavailable",
        message: error instanceof Error ? error.message : "unknown",
      },
      { status: 502 },
    )
  }
}
