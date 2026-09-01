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

export async function sendWhatsappFreeform(
  config: AppConfig,
  phone: string,
  text: string,
): Promise<{ ok: boolean; detail?: string; messageId?: string }> {
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

    const body = await response.json().catch(() => ({})) as { messages?: Array<{ id?: string }> }
    return { ok: true, messageId: body.messages?.[0]?.id }
  } catch (cause) {
    return {
      ok: false,
      detail: `meta_error_${cause instanceof Error ? cause.name : "unknown"}`,
    }
  } finally {
    clearTimeout(timeout)
  }
}

export async function sendWhatsappCloudReply(
  config: AppConfig,
  input: WhatsappReplyInput,
  getCustomer: (phone: string) => Promise<unknown>,
  addCustomerEvent: (input: {
    phone: string
    type: string
    at: string
    source: string
    payload: unknown
    metadata: Record<string, unknown>
  }) => Promise<unknown>,
  sender: { type?: "ai" | "human"; actorId?: string } = {},
): Promise<{ ok: true; channel: "cloud_api_freeform"; sentAt: string } | { ok: false; status: number; error: string; detail?: string }> {
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
    return { ok: false, status: 409, error: "window_closed" }
  }

  const result = await sendWhatsappFreeform(config, input.phone, input.text)
  if (!result.ok) {
    return { ok: false, status: 502, error: "send_failed", detail: result.detail }
  }

  const sentAt = new Date().toISOString()
  await addCustomerEvent({
    phone: input.phone,
    type: "message_out",
    at: sentAt,
    source: "whatsapp_cloud_api",
    payload: {
      text: input.text,
      messageId: result.messageId,
      mediaType: "text",
      mediaUrl: null,
      senderType: sender.type || "ai",
      actor: sender.actorId ? { userId: sender.actorId } : undefined,
      status: "sent",
    },
    metadata: {},
  })

  return { ok: true, channel: "cloud_api_freeform", sentAt }
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

      const result = await sendWhatsappCloudReply(
        config,
        input,
        getCustomer,
        addCustomerEvent,
        {
          type: request.headers["x-crm-sender"] === "human" ? "human" : "ai",
          actorId: typeof request.headers["x-crm-actor-id"] === "string"
            ? request.headers["x-crm-actor-id"]
            : undefined,
        },
      )
      if (result.ok) return result
      return reply.code(result.status).send({ error: result.error, detail: result.detail })
    },
  )
}
