/**
 * WhatsApp Cloud API — webhook entrante (W2).
 *
 * Funciones puras (parseWhatsappWebhookBody, validateHubSignature,
 * extractInboundMessages, isOptOutText) son la lógica testeable.
 *
 * mountWhatsappWebhookRoutes monta los endpoints en Fastify.
 */

import { createHmac, timingSafeEqual } from "node:crypto"
import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify"
import type { AppConfig } from "./config.js"

// ---------------------------------------------------------------------------
// Tipos de los mensajes que Meta envía al webhook
// ---------------------------------------------------------------------------

export type MetaWebhookMessage = {
  id: string
  from: string        // wa_id sin "+" (p.ej. "593979854915")
  timestamp: string   // unix epoch como string
  type: string        // "text" | "image" | "audio" | …
  text?: { body: string }
}

export type MetaWebhookChange = {
  value: {
    messaging_product?: string
    metadata?: { phone_number_id?: string; display_phone_number?: string }
    contacts?: Array<{ profile?: { name?: string }; wa_id?: string }>
    messages?: MetaWebhookMessage[]
    statuses?: unknown[]
  }
  field: string
}

export type MetaWebhookEntry = {
  id: string
  changes: MetaWebhookChange[]
}

export type MetaWebhookBody = {
  object?: string
  entry?: MetaWebhookEntry[]
}

// ---------------------------------------------------------------------------
// Lógica pura (testeable sin red)
// ---------------------------------------------------------------------------

/**
 * Valida la firma HMAC-SHA256 que Meta incluye en X-Hub-Signature-256.
 * Retorna true si la firma es válida. Usa comparación en tiempo constante.
 */
export function validateHubSignature(
  rawBody: Buffer | string,
  signatureHeader: string | undefined,
  appSecret: string,
): boolean {
  if (!signatureHeader) return false
  const body = typeof rawBody === "string" ? Buffer.from(rawBody) : rawBody
  const expected = createHmac("sha256", appSecret)
    .update(body)
    .digest("hex")
  const expectedHeader = `sha256=${expected}`
  // Comparación segura en tiempo constante
  try {
    const a = Buffer.from(signatureHeader)
    const b = Buffer.from(expectedHeader)
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}

/**
 * Extrae los mensajes de texto entrantes del payload de Meta.
 * Sólo mensajes de tipo "text" (ignora status, reacciones, etc.).
 */
export function extractInboundMessages(
  body: MetaWebhookBody,
): Array<{ waId: string; text: string; timestamp: number; messageId: string }> {
  const result: Array<{
    waId: string
    text: string
    timestamp: number
    messageId: string
  }> = []

  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      for (const msg of change.value?.messages ?? []) {
        if (msg.type === "text" && msg.text?.body) {
          result.push({
            waId: msg.from,
            text: msg.text.body,
            timestamp: Number(msg.timestamp),
            messageId: msg.id,
          })
        }
      }
    }
  }

  return result
}

/**
 * Detecta si el texto es una solicitud de opt-out.
 * "BAJA" al inicio o como mensaje completo (case-insensitive).
 */
export function isOptOutText(text: string): boolean {
  const trimmed = text.trim()
  const upper = trimmed.toUpperCase()
  return upper === "BAJA" || upper.startsWith("BAJA ")
}

/**
 * Parsea un score NPS de un mensaje de WhatsApp.
 * Retorna un número 1-10 si el texto es SOLO un número (con espacios permitidos),
 * o null si no es un score NPS válido.
 * Función pura exportada para tests unitarios.
 */
export function parseNpsScore(text: string): number | null {
  const trimmed = text.trim()
  if (!/^\d+$/.test(trimmed)) return null
  const score = Number(trimmed)
  if (!Number.isInteger(score) || score < 1 || score > 10) return null
  return score
}

/**
 * Decide qué acciones tomar cuando se recibe un mensaje en contexto NPS.
 * Retorna qué eventos registrar y si aplica seguimiento de referido.
 * Función pura para poder testearla sin red ni I/O.
 */
export function npsDecision(
  score: number,
  followupReason: string | undefined | null,
): {
  recordNpsScore: boolean
  scheduleReferido: boolean
} {
  const isNpsContext =
    typeof followupReason === "string" &&
    followupReason.toLowerCase().startsWith("nps")
  return {
    recordNpsScore: isNpsContext,
    scheduleReferido: isNpsContext && score >= 9,
  }
}

// ---------------------------------------------------------------------------
// Forward a Vicky (OpenClaw) — sin romper el webhook si Vicky no responde
// ---------------------------------------------------------------------------

async function forwardToVicky(
  config: AppConfig,
  payload: {
    phone: string
    text: string
    replyVia: "cloud_api"
  },
): Promise<void> {
  if (!config.openclawGatewayUrl) return

  const url = `${config.openclawGatewayUrl.replace(/\/$/, "")}${config.openclawHookPath}`
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5_000)

  try {
    await fetch(url, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(config.openclawHooksToken
          ? { Authorization: `Bearer ${config.openclawHooksToken}` }
          : {}),
      },
      body: JSON.stringify({
        name: "whatsapp-inbound",
        channel: "whatsapp",
        to: `+${payload.phone}`,
        deliver: true,
        message: payload.text,
        replyVia: payload.replyVia,
      }),
    })
  } catch {
    // Silenciar: Vicky no disponible no debe romper el webhook
    // Meta reintenta si devolvemos no-2xx, así que siempre respondemos 200
  } finally {
    clearTimeout(timeout)
  }
}

// ---------------------------------------------------------------------------
// Registro de eventos CRM (reutiliza el flujo existente de service)
// ---------------------------------------------------------------------------

async function recordInboundEvent(
  config: AppConfig,
  waId: string,
  text: string,
  timestamp: number,
  addCustomerEvent: (input: {
    phone: string
    type: string
    at: string
    source: string
    payload: unknown
    metadata: Record<string, unknown>
    nextFollowupAt?: string
    followupReason?: string
  }) => Promise<unknown>,
  isOptOut: boolean,
  customerFollowupReason?: string | null,
): Promise<void> {
  const phone = `+${waId}`
  const at = new Date(timestamp * 1000).toISOString()

  // Registrar message_in
  await addCustomerEvent({
    phone,
    type: "message_in",
    at,
    source: "whatsapp_cloud_api",
    payload: { text, mediaType: "text", mediaUrl: null },
    metadata: { lastInboundAt: at },
  })

  // Registrar opt_out si corresponde
  if (isOptOut) {
    await addCustomerEvent({
      phone,
      type: "opt_out",
      at: new Date().toISOString(),
      source: "whatsapp_cloud_api",
      payload: { trigger: "keyword_baja", originalText: text },
      metadata: {},
    })
    return
  }

  // Detección de score NPS
  const score = parseNpsScore(text)
  if (score !== null) {
    const { recordNpsScore, scheduleReferido } = npsDecision(score, customerFollowupReason)
    if (recordNpsScore) {
      await addCustomerEvent({
        phone,
        type: "nps_score",
        at: new Date().toISOString(),
        source: "whatsapp_cloud_api",
        payload: { score },
        metadata: {},
      })
      if (scheduleReferido) {
        const referidoAt = new Date()
        referidoAt.setDate(referidoAt.getDate() + 2)
        await addCustomerEvent({
          phone,
          type: "followup_snoozed",
          at: new Date().toISOString(),
          source: "whatsapp_cloud_api",
          payload: { reason: "referido", npsScore: score },
          metadata: {},
          nextFollowupAt: referidoAt.toISOString(),
          followupReason: "referido",
        })
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Montaje de rutas Fastify
// ---------------------------------------------------------------------------

export function mountWhatsappWebhookRoutes(
  app: FastifyInstance,
  config: AppConfig,
  addCustomerEvent: (input: {
    phone: string
    type: string
    at: string
    source: string
    payload: unknown
    metadata: Record<string, unknown>
    nextFollowupAt?: string
    followupReason?: string
  }) => Promise<unknown>,
  getCustomer?: (phone: string) => Promise<{ followup_reason?: string | null } | undefined>,
): void {
  const nodeEnv = process.env.NODE_ENV || "development"

  // GET /webhooks/whatsapp — verificación del webhook en Meta
  app.get(
    "/webhooks/whatsapp",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const query = request.query as Record<string, string | undefined>
      const mode = query["hub.mode"]
      const token = query["hub.verify_token"]
      const challenge = query["hub.challenge"]

      if (
        mode === "subscribe" &&
        token === config.whatsappWebhookVerifyToken &&
        challenge
      ) {
        return reply.code(200).send(challenge)
      }

      return reply.code(403).send({ error: "forbidden" })
    },
  )

  // POST /webhooks/whatsapp — mensajes entrantes
  app.post(
    "/webhooks/whatsapp",
    async (request: FastifyRequest, reply: FastifyReply) => {
      // Validar firma si WHATSAPP_APP_SECRET está configurado
      if (config.whatsappAppSecret) {
        // rawBodyBuffer se adjunta en index.ts mediante addContentTypeParser
        const rawBody = (request as unknown as { rawBodyBuffer?: Buffer }).rawBodyBuffer
        const signature = request.headers["x-hub-signature-256"] as
          | string
          | undefined
        const valid = validateHubSignature(
          rawBody ?? Buffer.from(JSON.stringify(request.body)),
          signature,
          config.whatsappAppSecret,
        )
        if (!valid) {
          return reply.code(401).send({ error: "invalid_signature" })
        }
      } else if (nodeEnv === "production") {
        // En producción, si no hay secret configurado, rechazar
        app.log.warn("WHATSAPP_APP_SECRET not set in production — rejecting webhook")
        return reply.code(500).send({ error: "webhook_not_configured" })
      }

      const body = request.body as MetaWebhookBody

      // Siempre responder 200 inmediatamente (Meta reintenta si no-2xx)
      // Procesar de forma async sin bloquear la respuesta
      const messages = extractInboundMessages(body)

      // Procesar mensajes en paralelo (fire-and-forget con log de errores)
      Promise.all(
        messages.map(async ({ waId, text, timestamp }) => {
          const optOut = isOptOutText(text)
          // Buscar el followup_reason del cliente para lógica NPS (opcional)
          let customerFollowupReason: string | null | undefined
          if (!optOut && getCustomer) {
            try {
              const customer = await getCustomer(`+${waId}`)
              customerFollowupReason = customer?.followup_reason
            } catch {
              // No bloquear el procesamiento si falla la búsqueda
            }
          }
          try {
            await recordInboundEvent(
              config,
              waId,
              text,
              timestamp,
              addCustomerEvent as Parameters<typeof recordInboundEvent>[4],
              optOut,
              customerFollowupReason,
            )
          } catch (err) {
            app.log.error({ err, waId }, "Error recording whatsapp inbound event")
          }
          // Forward a Vicky sólo si no es opt_out
          if (!optOut) {
            await forwardToVicky(config, {
              phone: waId,
              text,
              replyVia: "cloud_api",
            })
          }
        }),
      ).catch((err) => {
        app.log.error({ err }, "Error processing whatsapp webhook messages")
      })

      return reply.code(200).send({ status: "ok" })
    },
  )
}
