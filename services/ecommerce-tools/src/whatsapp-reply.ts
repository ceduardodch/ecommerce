/**
 * WhatsApp Cloud API — respuesta libre de Vicky (W3).
 *
 * POST /tools/whatsapp/reply  (requiere auth interna)
 * { phone, text }
 *  → consulta perfil CRM para lastInboundAt
 *  → si now - lastInboundAt < 24h → POST free-form a Cloud API + message_out → 200
 *  → si no → 409 { error: "window_closed" }
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify"
import { z } from "zod"
import type { AppConfig } from "./config.js"

// ---------------------------------------------------------------------------
// Schema de entrada
// ---------------------------------------------------------------------------

export const whatsappReplyInputSchema = z.object({
  phone: z.string().min(1),
  text: z.string().min(1),
})

export type WhatsappReplyInput = z.infer<typeof whatsappReplyInputSchema>

// ---------------------------------------------------------------------------
// Lógica pura (testeable sin red)
// ---------------------------------------------------------------------------

const WINDOW_MS = 24 * 60 * 60 * 1000 // 24 horas en milisegundos

/**
 * Devuelve true si lastInboundAt existe y la ventana de 24h sigue abierta.
 */
export function isWindowOpen(
  lastInboundAt: string | null | undefined,
  now: Date = new Date(),
): boolean {
  if (!lastInboundAt) return false
  const ts = new Date(lastInboundAt).getTime()
  if (!Number.isFinite(ts)) return false
  return now.getTime() - ts < WINDOW_MS
}

// ---------------------------------------------------------------------------
// Envío free-form a Cloud API
// ---------------------------------------------------------------------------

async function sendFreeform(
  config: AppConfig,
  phone: string,
  text: string,
): Promise<{ ok: boolean; detail?: string }> {
  if (!config.whatsappPhoneNumberId || !config.whatsappCloudAccessToken) {
    return { ok: false, detail: "meta_credentials_missing" }
  }

  const url = `https://graph.facebook.com/${config.metaApiVersion}/${config.whatsappPhoneNumberId}/messages`
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000)

  try {
    const response = await fetch(url, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.whatsappCloudAccessToken}`,
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phone,
        type: "text",
        text: { body: text },
      }),
    })

    if (!response.ok) {
      const body = await response.json().catch(() => ({})) as Record<string, unknown>
      const code = (body as { error?: { code?: number } }).error?.code
      return { ok: false, detail: `meta_http_${response.status}${code ? `_${code}` : ""}` }
    }

    return { ok: true }
  } catch (cause) {
    return {
      ok: false,
      detail: `meta_error_${cause instanceof Error ? cause.name : "unknown"}`,
    }
  } finally {
    clearTimeout(timeout)
  }
}

// ---------------------------------------------------------------------------
// Montaje de ruta Fastify
// ---------------------------------------------------------------------------

export function mountWhatsappReplyRoute(
  app: FastifyInstance,
  config: AppConfig,
  getCustomer: (phone: string) => Promise<unknown>,
  addCustomerEvent: (input: {
    phone: string
    type: string
    at: string
    source: string
    payload: unknown
    metadata: Record<string, unknown>
  }) => Promise<unknown>,
): void {
  app.post(
    "/tools/whatsapp/reply",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const input = whatsappReplyInputSchema.parse(request.body)

      // Consultar perfil CRM para obtener lastInboundAt
      let lastInboundAt: string | null | undefined
      try {
        const customer = (await getCustomer(input.phone)) as
          | { metadata?: { lastInboundAt?: string } }
          | null
          | undefined
        lastInboundAt = customer?.metadata?.lastInboundAt
      } catch {
        lastInboundAt = null
      }

      if (!isWindowOpen(lastInboundAt)) {
        return reply.code(409).send({ error: "window_closed" })
      }

      // Enviar free-form por Cloud API
      const result = await sendFreeform(config, input.phone, input.text)

      const now = new Date().toISOString()

      if (result.ok) {
        // Registrar message_out
        await addCustomerEvent({
          phone: input.phone,
          type: "message_out",
          at: now,
          source: "whatsapp_cloud_api",
          payload: { text: input.text, mediaType: "text", mediaUrl: null },
          metadata: {},
        }).catch((err) => {
          app.log.error({ err }, "Error recording message_out event")
        })

        return { ok: true, channel: "cloud_api_freeform", sentAt: now }
      }

      // Envío falló pero la ventana estaba abierta
      return reply.code(502).send({
        error: "send_failed",
        detail: result.detail,
      })
    },
  )
}
