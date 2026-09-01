import { NextRequest, NextResponse } from "next/server"
import { rateLimited } from "../reviews/lib"

/**
 * Eventos que el navegador NO puede declarar.
 *
 * Esta ruta es pública (el token de tools vive del lado servidor, no en el
 * cliente), así que cualquiera puede llamarla. Una compra declarada desde el
 * navegador es señal falsificable: Meta optimizaría las campañas contra
 * conversiones inventadas y el CRM registraría ventas que no existen.
 *
 * El `Purchase` real lo emite `ecommerce-tools` al confirmar el cobro con
 * Datafast, con el monto del ledger (ver `sendDatafastPurchaseToMeta`).
 */
const SERVER_ONLY_EVENTS = new Set(["Purchase"])

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

export async function POST(request: NextRequest) {
  // Una sesión normal dispara PageView + ViewContent + algún clic. 120 eventos
  // en 5 min es holgado para un usuario real y corta el flood que ensucia el
  // CRM y el dataset de Meta.
  const ip = clientIp(request) || "unknown"
  if (rateLimited(`events:${ip}`, 120, 5 * 60 * 1000)) {
    return NextResponse.json(
      { accepted: false, error: "too_many_requests" },
      { status: 429 },
    )
  }

  const payload = (await request.json().catch(() => ({}))) as Record<
    string,
    unknown
  >

  if (SERVER_ONLY_EVENTS.has(String(payload.eventName))) {
    return NextResponse.json(
      { accepted: false, error: "event_not_allowed_from_client" },
      { status: 403 },
    )
  }

  const headers: Record<string, string> = {
    "content-type": "application/json",
  }

  if (process.env.TOOLS_API_TOKEN) {
    headers.authorization = `Bearer ${process.env.TOOLS_API_TOKEN}`
  }

  try {
    const response = await fetch(`${toolsUrl()}/tools/events`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        ...payload,
        userAgent:
          payload.userAgent || request.headers.get("user-agent") || undefined,
        clientIp: payload.clientIp || clientIp(request),
      }),
      cache: "no-store",
    })

    const body = await response.json().catch(async () => ({
      raw: await response.text().catch(() => ""),
    }))

    return NextResponse.json(body, {
      status: response.ok ? 200 : response.status,
    })
  } catch (error) {
    return NextResponse.json(
      {
        accepted: false,
        error: "events_proxy_unavailable",
        message: error instanceof Error ? error.message : "unknown",
      },
      { status: 202 },
    )
  }
}
