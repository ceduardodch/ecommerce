/**
 * WhatsApp Cloud API — webhook entrante (W2).
 *
 * Funciones puras (parseWhatsappWebhookBody, validateHubSignature,
 * extractInboundMessages, isOptOutText) son la lógica testeable.
 *
 * mountWhatsappWebhookRoutes monta los endpoints en Fastify.
 */

import { createHmac, timingSafeEqual } from "node:crypto"
import { mkdir, readFile, rename, writeFile } from "node:fs/promises"
import path from "node:path"
import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify"
import type { AppConfig } from "./config.js"
import { downloadWhatsappMedia, type WhatsappMediaReference } from "./whatsapp-media.js"
import type { CustomerEventRecord, Product, PurchasedProduct } from "./types.js"
import { createWhatsAppAgentReply } from "./whatsapp-agent.js"
import { advanceWhatsappSale, type CommerceState } from "./whatsapp-sales-flow.js"

// ---------------------------------------------------------------------------
// Tipos de los mensajes que Meta envía al webhook
// ---------------------------------------------------------------------------

export type MetaWebhookMessage = {
  id: string
  from: string        // wa_id sin "+" (p.ej. "593979854915")
  timestamp: string   // unix epoch como string
  type: string        // "text" | "image" | "audio" | …
  text?: { body: string }
  image?: WhatsappMediaReference
  audio?: WhatsappMediaReference
  document?: WhatsappMediaReference
  video?: WhatsappMediaReference
}

export type MetaWebhookStatus = {
  id: string
  status: "sent" | "delivered" | "read" | "failed" | string
  timestamp?: string
  errors?: Array<{ code?: number; title?: string }>
}

export type MetaWebhookChange = {
  value: {
    messaging_product?: string
    metadata?: { phone_number_id?: string; display_phone_number?: string }
    contacts?: Array<{ profile?: { name?: string }; wa_id?: string }>
    messages?: MetaWebhookMessage[]
    statuses?: MetaWebhookStatus[]
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

const WEBHOOK_DEDUPE_TTL_MS = 7 * 24 * 60 * 60 * 1000

type WebhookDedupeRecord = Record<string, number>

/**
 * Conserva los IDs de Meta ya procesados en el volumen de datos. Meta puede
 * reenviar el mismo evento; sólo el primer recibo puede disparar una respuesta.
 */
class WebhookMessageDeduper {
  private readonly filePath: string
  private readonly ids = new Map<string, number>()
  private readonly loaded: Promise<void>

  constructor(dataDir: string) {
    this.filePath = path.join(dataDir, "whatsapp-webhook-dedupe.json")
    this.loaded = this.load()
  }

  private async load() {
    try {
      const raw = await readFile(this.filePath, "utf8")
      const records = JSON.parse(raw) as WebhookDedupeRecord
      for (const [id, at] of Object.entries(records)) {
        if (Number.isFinite(at) && at > Date.now() - WEBHOOK_DEDUPE_TTL_MS) {
          this.ids.set(id, at)
        }
      }
    } catch {
      // El primer arranque no tiene archivo; se crea al aceptar el primer evento.
    }
  }

  private async persist() {
    await mkdir(path.dirname(this.filePath), { recursive: true })
    const retained = Object.fromEntries(this.ids)
    const temporary = `${this.filePath}.tmp`
    await writeFile(temporary, `${JSON.stringify(retained)}\n`, "utf8")
    await rename(temporary, this.filePath)
  }

  async claim(messageId: string): Promise<boolean> {
    await this.loaded
    if (this.ids.has(messageId)) return false

    const cutoff = Date.now() - WEBHOOK_DEDUPE_TTL_MS
    for (const [id, at] of this.ids) {
      if (at < cutoff) this.ids.delete(id)
    }
    this.ids.set(messageId, Date.now())
    await this.persist()
    return true
  }
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

export function extractInboundMediaMessages(
  body: MetaWebhookBody,
): Array<{ waId: string; text: string; timestamp: number; messageId: string; mediaType: string; media: WhatsappMediaReference }> {
  const result: Array<{ waId: string; text: string; timestamp: number; messageId: string; mediaType: string; media: WhatsappMediaReference }> = []
  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      for (const msg of change.value?.messages ?? []) {
        const mediaType = ["image", "audio", "document", "video"].find((kind) => Boolean(msg[kind as keyof MetaWebhookMessage]))
        if (!mediaType) continue
        const media = msg[mediaType as keyof MetaWebhookMessage] as WhatsappMediaReference | undefined
        if (!media?.id) continue
        result.push({ waId: msg.from, text: media.caption || "", timestamp: Number(msg.timestamp), messageId: msg.id, mediaType, media })
      }
    }
  }
  return result
}

export function extractMessageStatuses(body: MetaWebhookBody): MetaWebhookStatus[] {
  return body.entry?.flatMap((entry) => entry.changes.flatMap((change) => change.value?.statuses || [])) || []
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
  messageId?: string,
  media?: { type: string; path: string; name: string; mimeType: string; size: number },
): Promise<void> {
  const phone = `+${waId}`
  const at = new Date(timestamp * 1000).toISOString()

  // Registrar message_in
  await addCustomerEvent({
    phone,
    type: "message_in",
    at,
    source: "whatsapp_cloud_api",
    payload: { text, messageId, mediaType: media?.type || "text", mediaUrl: media?.path || null, media },
    metadata: { lastInboundAt: at, whatsappMessageId: messageId },
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
  getCustomer?: (phone: string) => Promise<{
    followupReason?: string | null
    nextFollowupAt?: string
    purchasedProducts?: PurchasedProduct[]
    metadata?: Record<string, unknown>
    name?: string
    email?: string
    events?: CustomerEventRecord[]
  } | undefined>,
  searchProducts?: (query: string) => Promise<Product[]>,
  sendReply?: (input: { phone: string; text: string }) => Promise<unknown>,
  commerce?: {
    quote: (input: { items: Array<{ productId: string; variantId?: string; quantity: number }>; customer?: { phone?: string; name?: string; email?: string; metadata?: Record<string, unknown> } }) => Promise<any>
    createCart: (input: { phone: string; customer: { name: string; city: string }; items: Array<{ productId: string; variantId: string; quantity: number }> }) => Promise<{ cartUrl: string; expiresAt: string }>
  },
  isAiPaused?: (phone: string) => Promise<boolean>,
): void {
  const nodeEnv = process.env.NODE_ENV || "development"
  const deduper = new WebhookMessageDeduper(config.dataDir)

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
      const mediaMessages = extractInboundMediaMessages(body)
      const statuses = extractMessageStatuses(body)

      // Procesar mensajes en paralelo (fire-and-forget con log de errores)
      const inbound = [
        ...messages.map((message) => ({ ...message, mediaType: undefined as string | undefined, media: undefined as WhatsappMediaReference | undefined })),
        ...mediaMessages,
      ]
      Promise.all([
        ...inbound.map(async ({ waId, text, timestamp, messageId, mediaType, media: mediaReference }) => {
          if (!(await deduper.claim(messageId))) {
            app.log.info({ messageId }, "Ignoring duplicate WhatsApp webhook event")
            return
          }
          const optOut = isOptOutText(text)
          // Se consulta ANTES de registrar el mensaje entrante: así el
          // historial y el contexto que recibe Vicky (y el followupReason
          // para NPS) reflejan el estado previo a este turno, sin duplicar
          // el mensaje actual (ya en camino a guardarse) dentro del propio
          // prompt.
          let customer: Awaited<ReturnType<NonNullable<typeof getCustomer>>> | undefined
          if (!optOut && getCustomer) {
            try {
              customer = await getCustomer(`+${waId}`)
            } catch {
              // No bloquear el procesamiento si falla la búsqueda
            }
          }
          try {
            let media
            if (mediaType && mediaReference) {
              try { media = await downloadWhatsappMedia(config, mediaType, messageId, mediaReference) }
              catch (err) { app.log.error({ err, messageId }, "Unable to download WhatsApp media") }
            }
            await recordInboundEvent(
              config,
              waId,
              text,
              timestamp,
              addCustomerEvent as Parameters<typeof recordInboundEvent>[4],
              optOut,
              // Antes decía `customer?.followup_reason` (snake_case): el
              // campo real es `followupReason` en ambos backends
              // (`CustomerRecord` local y `serializeCustomer` de Medusa), así
              // que esto siempre leía `undefined` y la lógica de NPS nunca
              // detectaba que un cliente estaba en seguimiento NPS.
              customer?.followupReason,
              messageId,
              media,
            )
          } catch (err) {
            app.log.error({ err, waId }, "Error recording whatsapp inbound event")
          }
          // Un caso tomado por un vendedor no puede disparar una respuesta de Vicky.
          if (!optOut && searchProducts && sendReply && !(await isAiPaused?.(`+${waId}`))) {
            const products = await searchProducts(text).catch(() => [])
            const sale = commerce ? await advanceWhatsappSale({
              text, phone: `+${waId}`, products, customer: customer ? { name: customer.name, email: customer.email, metadata: customer.metadata } : undefined,
              state: customer?.metadata?.agentCommerce as CommerceState | undefined,
              quote: commerce.quote,
              createCart: commerce.createCart,
            }).catch(() => undefined) : undefined
            if (sale?.state) await addCustomerEvent({ phone: `+${waId}`, type: sale.event || "note", at: new Date().toISOString(), source: "whatsapp_ai", payload: { agentCommerce: sale.state }, metadata: { agentCommerce: sale.state, journeyStage: sale.event === "cart_link_sent" ? "carrito_enviado" : sale.event === "human_handoff" ? "revision_humana" : "cotizacion_pendiente" } })
            const customerContext = customer ? {
              purchasedProducts: customer.purchasedProducts,
              journeyStage: customer.metadata?.journeyStage as string | undefined,
              nextFollowupAt: customer.nextFollowupAt,
              followupReason: customer.followupReason ?? undefined,
            } : undefined
            const replyText = sale?.text || await createWhatsAppAgentReply(config, { text, products, history: customer?.events, customerContext })
            if (replyText) {
              await sendReply({ phone: `+${waId}`, text: replyText })
            }
          }
        }),
        ...statuses.map(async (status) => {
          await addCustomerEvent({
            phone: "status",
            type: "message_status",
            at: status.timestamp ? new Date(Number(status.timestamp) * 1000).toISOString() : new Date().toISOString(),
            source: "whatsapp_cloud_api",
            payload: { messageId: status.id, status: status.status, failedReason: status.errors?.[0]?.title || status.errors?.[0]?.code },
            metadata: {},
          }).catch((err) => app.log.error({ err, statusId: status.id }, "Error recording WhatsApp message status"))
        }),
      ]).catch((err) => {
        app.log.error({ err }, "Error processing whatsapp webhook messages")
      })

      return reply.code(200).send({ status: "ok" })
    },
  )
}
