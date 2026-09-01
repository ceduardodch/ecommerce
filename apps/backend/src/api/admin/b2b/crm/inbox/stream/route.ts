import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { subscribeInboxEvent } from "../../conversations/_events"

export async function GET(_req: MedusaRequest, res: MedusaResponse) {
  const raw = (res as unknown as { raw: { writeHead: (status: number, headers: Record<string, string>) => void; write: (value: string) => void; on: (event: string, listener: () => void) => void } }).raw
  raw.writeHead(200, {
    "content-type": "text/event-stream",
    "cache-control": "no-cache, no-transform",
    connection: "keep-alive",
    "x-accel-buffering": "no",
  })
  raw.write(`event: ready\ndata: ${JSON.stringify({ at: new Date().toISOString() })}\n\n`)
  const unsubscribe = subscribeInboxEvent((event) => {
    raw.write(`event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`)
  })
  const heartbeat = setInterval(() => raw.write(`event: ping\ndata: {}\n\n`), 25_000)
  raw.on("close", () => {
    clearInterval(heartbeat)
    unsubscribe()
  })
}
