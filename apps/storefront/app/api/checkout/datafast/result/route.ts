import { NextRequest, NextResponse } from "next/server"

function toolsUrl() {
  return (
    process.env.TOOLS_API_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_TOOLS_API_URL ||
    "http://localhost:8787"
  )
}

// Consulta el estado del pago en Datafast (server-side).
export async function GET(request: NextRequest) {
  const id =
    request.nextUrl.searchParams.get("id") ||
    request.nextUrl.searchParams.get("checkoutId")
  if (!id) {
    return NextResponse.json({ error: "missing_checkout_id" }, { status: 400 })
  }
  const resourcePath = request.nextUrl.searchParams.get("resourcePath")

  const headers: Record<string, string> = {}
  if (process.env.TOOLS_API_TOKEN) {
    headers.authorization = `Bearer ${process.env.TOOLS_API_TOKEN}`
  }

  try {
    const params = new URLSearchParams({ id })
    if (resourcePath) params.set("resourcePath", resourcePath)
    const response = await fetch(
      `${toolsUrl()}/tools/datafast/result?${params.toString()}`,
      { headers, cache: "no-store" },
    )
    const body = await response
      .json()
      .catch(async () => ({ raw: await response.text().catch(() => "") }))
    return NextResponse.json(body, { status: response.ok ? 200 : response.status })
  } catch (error) {
    return NextResponse.json(
      {
        status: "failed",
        error: "datafast_proxy_unavailable",
        message: error instanceof Error ? error.message : "unknown",
      },
      { status: 502 },
    )
  }
}
