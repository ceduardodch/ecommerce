import { NextRequest, NextResponse } from "next/server"

function toolsUrl() {
  return process.env.TOOLS_API_INTERNAL_URL || process.env.NEXT_PUBLIC_TOOLS_API_URL || "http://localhost:8787"
}

/** Server-side bridge: the browser never needs the ecommerce-tools token. */
export async function POST(_request: NextRequest, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params
  const headers: Record<string, string> = { "content-type": "application/json" }
  if (process.env.TOOLS_API_TOKEN) headers.authorization = `Bearer ${process.env.TOOLS_API_TOKEN}`
  try {
    const response = await fetch(`${toolsUrl()}/tools/whatsapp-cart-sessions/${encodeURIComponent(token)}/consume`, {
      method: "POST",
      headers,
      cache: "no-store",
    })
    const body = await response.json().catch(() => ({ error: "cart_session_unavailable" }))
    return NextResponse.json(body, { status: response.status })
  } catch {
    return NextResponse.json({ error: "cart_session_unavailable" }, { status: 502 })
  }
}
