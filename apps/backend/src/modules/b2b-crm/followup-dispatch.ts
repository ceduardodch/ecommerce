import type { MedusaContainer } from "@medusajs/framework/types"
import { B2B_CRM_MODULE } from "./index"
import type B2bCrmModuleService from "./service"

/**
 * `draft` encola para envío manual; `meta` envía por WhatsApp Cloud API.
 *
 * Existió un tercer modo, `openclaw`, que empujaba el mensaje a un gateway
 * externo. Ese runtime se retiró: hoy el bot vive dentro de `ecommerce-tools`.
 * Un `CRM_FOLLOWUP_DISPATCH_MODE=openclaw` heredado cae a `draft`, que encola
 * sin enviar — es lo seguro frente a hablarle a un gateway que ya no existe.
 */
export type DispatchMode = "draft" | "meta"

export type FollowupDispatchConfig = {
  enabled: boolean
  mode: DispatchMode
  cooldownDays: number
  maxPerRun: number
  retryDays: number
  windowStartHour: number
  windowEndHour: number
  timezoneOffsetHours: number
  // Meta Cloud API
  whatsappPhoneNumberId?: string
  whatsappAccessToken?: string
  metaApiVersion: string
}

export function loadDispatchConfig(
  env: NodeJS.ProcessEnv = process.env,
): FollowupDispatchConfig {
  const [windowStart, windowEnd] = String(env.CRM_FOLLOWUP_WINDOW || "9-19")
    .split("-")
    .map((value) => Number(value))

  const mode: DispatchMode =
    env.CRM_FOLLOWUP_DISPATCH_MODE === "meta" ? "meta" : "draft"

  return {
    enabled: !["0", "false", "no"].includes(
      String(env.CRM_FOLLOWUP_ENABLED ?? "true").toLowerCase(),
    ),
    mode,
    cooldownDays: Number(env.CRM_FOLLOWUP_COOLDOWN_DAYS || 7),
    maxPerRun: Number(env.CRM_FOLLOWUP_MAX_PER_RUN || 20),
    retryDays: Number(env.CRM_FOLLOWUP_RETRY_DAYS || 7),
    windowStartHour: Number.isFinite(windowStart) ? windowStart : 9,
    windowEndHour: Number.isFinite(windowEnd) ? windowEnd : 19,
    // America/Guayaquil es UTC-5 todo el año (sin horario de verano)
    timezoneOffsetHours: Number(env.CRM_FOLLOWUP_TZ_OFFSET_HOURS ?? -5),
    // Meta Cloud API
    whatsappPhoneNumberId: env.WHATSAPP_PHONE_NUMBER_ID,
    whatsappAccessToken: env.WHATSAPP_ACCESS_TOKEN,
    metaApiVersion: env.META_API_VERSION || "v23.0",
  }
}

export function isWithinSendWindow(
  config: Pick<
    FollowupDispatchConfig,
    "windowStartHour" | "windowEndHour" | "timezoneOffsetHours"
  >,
  now: Date = new Date(),
) {
  const localHour =
    (((now.getUTCHours() + config.timezoneOffsetHours) % 24) + 24) % 24
  return (
    localHour >= config.windowStartHour && localHour < config.windowEndHour
  )
}

type CustomerLike = {
  phone: string
  [key: string]: unknown
}

type EventLike = {
  type: string
  at?: string | Date | null
}

export function selectDispatchTargets<T extends CustomerLike>(
  customers: T[],
  eventsByPhone: Map<string, EventLike[]>,
  options: { cooldownDays: number; maxPerRun: number; now?: Date },
): { targets: T[]; skipped: Array<{ phone: string; reason: string }> } {
  const now = options.now || new Date()
  const cooldownMs = options.cooldownDays * 24 * 60 * 60 * 1000
  const targets: T[] = []
  const skipped: Array<{ phone: string; reason: string }> = []

  for (const customer of customers) {
    const events = eventsByPhone.get(customer.phone) || []

    if (events.some((event) => event.type === "opt_out")) {
      skipped.push({ phone: customer.phone, reason: "opt_out" })
      continue
    }

    const recentDispatch = events.some((event) => {
      if (!["followup_sent", "followup_queued", "broadcast_sent", "broadcast_queued"].includes(event.type)) {
        return false
      }
      const at = event.at ? new Date(event.at).getTime() : NaN
      return Number.isFinite(at) && now.getTime() - at < cooldownMs
    })
    if (recentDispatch) {
      skipped.push({ phone: customer.phone, reason: "cooldown" })
      continue
    }

    if (targets.length >= options.maxPerRun) {
      skipped.push({ phone: customer.phone, reason: "max_per_run" })
      continue
    }

    targets.push(customer)
  }

  return { targets, skipped }
}

export type TemplateCustomer = {
  name?: string | null
  purchased_products?: Array<{ title?: string }> | null
  followup_reason?: string | null
}

/**
 * Devuelve el primer nombre para personalizar mensajes sin alterar el nombre
 * completo guardado en el CRM. Tolera espacios de contactos importados y
 * caracteres invisibles comunes en archivos VCF.
 */
export function campaignFirstName(name?: string | null): string {
  const normalized = String(name || "")
    .normalize("NFKC")
    .replace(/[\u200B-\u200D\u2060\uFEFF]/g, " ")
    .trim()

  return normalized.split(/\s+/)[0] || "Cliente"
}

export function buildFollowupMessage(customer: TemplateCustomer) {
  const products = customer.purchased_products || []
  const lastProduct = products[products.length - 1]
  const firstName = campaignFirstName(customer.name)
  const greeting = customer.name ? `Hola ${firstName}` : "Hola"

  if (lastProduct?.title) {
    return `${greeting}, vi que compraste ${lastProduct.title}. Te puedo ayudar con mantenimiento, complemento o reposicion para que sigas equipando tu cocina?`
  }

  return `${greeting}, tenemos nuevas opciones de ollas, cuchillos y combos de cocina. Te preparo una cotizacion corta por WhatsApp?`
}

/**
 * Renderiza una plantilla con variables del cliente.
 * Esta función será usada por el dispatcher y por el admin para consistencia.
 *
 * @param template - Plantilla con body que puede contener {nombre}, {producto}, {dias}
 * @param customer - Cliente con nombre, productos comprados y días desde última compra
 * @returns Mensaje renderizado
 */
export function renderTemplate(
  template: { body: string },
  customer: TemplateCustomer & { daysSincePurchase?: number }
) {
  const products = customer.purchased_products || []
  const lastProduct = products[products.length - 1]
  const firstName = campaignFirstName(customer.name)
  const productName = lastProduct?.title || "tu compra"
  const days = customer.daysSincePurchase || 30

  let message = template.body
    .replace(/\{nombre\}/gi, firstName)
    .replace(/\{producto\}/gi, String(productName))
    .replace(/\{dias\}/gi, String(days))

  return message
}

/**
 * Mapea un followup_reason a una key de plantilla.
 * Si no hay match, devuelve 'generico'.
 */
export function templateKeyFromReason(reason?: string | null): string {
  if (!reason) return "generico"

  const normalized = reason.toLowerCase()

  if (normalized.includes("recompra") || normalized.includes("reorder")) {
    return "recompra"
  }
  if (normalized.includes("complemento") || normalized.includes("complement")) {
    return "complemento"
  }
  if (normalized.includes("cuidado") || normalized.includes("care")) {
    return "cuidado"
  }
  if (normalized.includes("estacional")) {
    return "estacional"
  }
  if (normalized.includes("cross_sell_cocina")) {
    return "cross_sell_cocina"
  }
  if (normalized.includes("cross_sell_bienestar")) {
    return "cross_sell_bienestar"
  }
  if (normalized.startsWith("nps")) {
    return "nps"
  }
  if (normalized.includes("referido")) {
    return "referido"
  }

  return "generico"
}

// ---------------------------------------------------------------------------
// Meta Cloud API: mapeo de templateKey → nombre de plantilla en Meta
// ---------------------------------------------------------------------------

const META_TEMPLATE_MAP: Record<string, string> = {
  recompra: "eterniu_recompra",
  complemento: "eterniu_complemento",
  cuidado: "eterniu_cuidado",
  estacional: "eterniu_estacional",
  cross_sell_cocina: "eterniu_xsell_cocina",
  cross_sell_bienestar: "eterniu_xsell_bienestar",
  nps: "eterniu_nps",
  referido: "eterniu_referido",
  generico: "eterniu_recompra",
  promo_coleccion_exotica: "eterniu_promo_onyx_video",
}

export type MetaTemplatePayload = {
  messaging_product: "whatsapp"
  to: string
  type: "template"
  template: {
    name: string
    language: { code: string }
    components: Array<
      | {
          type: "body"
          parameters: Array<{ type: "text"; text: string }>
        }
      | {
          type: "header"
          parameters: Array<{
            type: MediaKind
            video?: { link: string }
            image?: { link: string }
            document?: { link: string }
          }>
        }
    >
  }
}

export type MetaFreeformPayload = {
  messaging_product: "whatsapp"
  to: string
  type: "text"
  text: { body: string }
}

export type MediaKind = "video" | "image" | "document"

export type TemplateMedia = {
  url: string
  kind: MediaKind
}

export type MetaMediaPayload = {
  messaging_product: "whatsapp"
  to: string
  type: MediaKind
  video?: { link: string; caption?: string }
  image?: { link: string; caption?: string }
  document?: { link: string; caption?: string }
}

/**
 * Mensaje con adjunto (video/imagen/documento) por Cloud API.
 * Solo válido DENTRO de la ventana de servicio de 24h; fuera de ella Meta
 * exige plantilla aprobada (con header de media si se quiere adjunto).
 */
export function buildMetaMediaPayload(
  phone: string,
  media: TemplateMedia,
  caption?: string,
): MetaMediaPayload {
  const body = { link: media.url, ...(caption ? { caption } : {}) }
  return {
    messaging_product: "whatsapp",
    to: phone,
    type: media.kind,
    ...(media.kind === "video"
      ? { video: body }
      : media.kind === "image"
        ? { image: body }
        : { document: body }),
  }
}

/**
 * Construye el payload de plantilla para la Cloud API de Meta.
 * Variables {{1}}=nombre, {{2}}=producto, {{3}}=dias.
 * Lógica pura: sin red.
 */
export function buildMetaTemplatePayload(
  phone: string,
  templateKey: string,
  vars: { nombre: string; producto: string; dias: string },
  media?: TemplateMedia | null,
): MetaTemplatePayload {
  const templateName = META_TEMPLATE_MAP[templateKey] ?? "eterniu_recompra"
  const promotionalVideo = templateKey === "promo_coleccion_exotica"
  const firstName = campaignFirstName(vars.nombre)
  const components: MetaTemplatePayload["template"]["components"] = []
  if (promotionalVideo && media) {
    components.push({
      type: "header",
      parameters: [{
        type: media.kind,
        ...(media.kind === "video"
          ? { video: { link: media.url } }
          : media.kind === "image"
            ? { image: { link: media.url } }
            : { document: { link: media.url } }),
      }],
    })
  }
  components.push({
    type: "body",
    parameters: promotionalVideo
      ? [{ type: "text", text: firstName }]
      : [
          { type: "text", text: firstName },
          { type: "text", text: vars.producto },
          { type: "text", text: vars.dias },
        ],
  })

  return {
    messaging_product: "whatsapp",
    to: phone,
    type: "template",
    template: {
      name: templateName,
      language: { code: "es" },
      components,
    },
  }
}

/**
 * Construye el payload de mensaje free-form (texto libre) para Cloud API.
 * Solo válido dentro de la ventana de servicio de 24h.
 * Lógica pura: sin red.
 */
export function buildMetaFreeformPayload(
  phone: string,
  text: string,
): MetaFreeformPayload {
  return {
    messaging_product: "whatsapp",
    to: phone,
    type: "text",
    text: { body: text },
  }
}

/**
 * Envía un mensaje vía Cloud API de Meta (template o free-form).
 * Ante error 131049 (frequency cap) o cualquier error HTTP/red → degrada a queued.
 */
export async function dispatchMetaMessage(
  payload: MetaTemplatePayload | MetaFreeformPayload | MetaMediaPayload,
  config: Pick<
    FollowupDispatchConfig,
    "whatsappPhoneNumberId" | "whatsappAccessToken" | "metaApiVersion"
  >,
): Promise<DispatchOutcome> {
  if (!config.whatsappPhoneNumberId || !config.whatsappAccessToken) {
    return { status: "queued", detail: "meta_credentials_missing" }
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
        Authorization: `Bearer ${config.whatsappAccessToken}`,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const body = await response.json().catch(() => ({})) as Record<string, unknown>
      const errorCode = (body as { error?: { code?: number } }).error?.code
      if (errorCode === 131049) {
        return { status: "queued", detail: "meta_frequency_cap" }
      }
      return { status: "queued", detail: `meta_http_${response.status}` }
    }

    const body = await response.json().catch(() => ({})) as {
      messages?: Array<{ id?: string }>
    }
    return { status: "sent", messageId: body.messages?.[0]?.id }
  } catch (cause) {
    return {
      status: "queued",
      detail: `meta_error_${cause instanceof Error ? cause.name : "unknown"}`,
    }
  } finally {
    clearTimeout(timeout)
  }
}

export type DispatchOutcome = {
  status: "sent" | "queued"
  detail?: string
  /** ID wamid devuelto por Meta; permite casar sent/delivered/read. */
  messageId?: string
}

export async function dispatchFollowup(
  customer: { phone: string; name?: string | null },
  message: string,
  config: FollowupDispatchConfig,
  extra?: {
    templateKey?: string
    vars?: { nombre: string; producto: string; dias: string }
    /** Si existe y < 24h desde ahora → free-form; si no → template */
    lastInboundAt?: Date | null
    now?: Date
    /** Adjunto opcional de la plantilla (video/imagen/documento). */
    media?: TemplateMedia | null
  },
): Promise<DispatchOutcome> {
  if (config.mode === "meta") {
    const now = extra?.now ?? new Date()
    const windowOpen =
      extra?.lastInboundAt instanceof Date &&
      now.getTime() - extra.lastInboundAt.getTime() < 24 * 60 * 60 * 1000

    if (windowOpen) {
      // Ventana abierta → free-form (gratis). Con adjunto va como
      // video/imagen + caption; sin adjunto, texto simple.
      return dispatchMetaMessage(
        extra?.media
          ? buildMetaMediaPayload(customer.phone, extra.media, message)
          : buildMetaFreeformPayload(customer.phone, message),
        config,
      )
    }

    // Fuera de ventana → plantilla
    const templateKey = extra?.templateKey ?? "generico"
    const firstName = campaignFirstName(customer.name)
    const vars = extra?.vars ?? {
      nombre: firstName,
      producto: "tu compra",
      dias: "30",
    }
    return dispatchMetaMessage(
      buildMetaTemplatePayload(customer.phone, templateKey, vars, extra?.media),
      config,
    )
  }

  return { status: "queued", detail: "modo_draft" }
}

export type DispatchRunResult = {
  mode: DispatchMode | "meta_template" | "meta_freeform"
  dryRun: boolean
  due: number
  sent: number
  queued: number
  skipped: number
  results: Array<{
    phone: string
    status: "sent" | "queued" | "skipped" | "dry_run"
    reason?: string
  }>
}

export async function runFollowupDispatch(
  container: MedusaContainer,
  options: {
    dryRun?: boolean
    limit?: number
    phone?: string
    enforceWindow?: boolean
    config?: FollowupDispatchConfig
  } = {},
): Promise<DispatchRunResult> {
  const config = options.config || loadDispatchConfig()
  const crm = container.resolve(B2B_CRM_MODULE) as B2bCrmModuleService
  const now = new Date()

  const empty: DispatchRunResult = {
    mode: config.mode,
    dryRun: Boolean(options.dryRun),
    due: 0,
    sent: 0,
    queued: 0,
    skipped: 0,
    results: [],
  }

  if (!config.enabled) {
    return empty
  }

  if (options.enforceWindow && !isWithinSendWindow(config, now)) {
    return empty
  }

  let due = await crm.dueFollowups(now.toISOString(), options.limit || 200)
  if (options.phone) {
    due = due.filter((customer: any) => customer.phone === options.phone)
  }

  const eventsByPhone = new Map<string, EventLike[]>()
  for (const customer of due) {
    eventsByPhone.set(
      customer.phone,
      await crm.listCustomerEvents(customer.phone, 50),
    )
  }

  const { targets, skipped } = selectDispatchTargets(due, eventsByPhone, {
    cooldownDays: config.cooldownDays,
    maxPerRun: options.limit ?? config.maxPerRun,
    now,
  })

  const result: DispatchRunResult = {
    ...empty,
    due: due.length,
    skipped: skipped.length,
    results: skipped.map((entry) => ({
      phone: entry.phone,
      status: "skipped" as const,
      reason: entry.reason,
    })),
  }

  for (const customer of targets) {
    // Usar plantillas en lugar del mensaje hardcoded
    const templateKey = templateKeyFromReason((customer as any).followup_reason)
    const template = await crm.getTemplate(templateKey)

    let message: string
    if (template?.body) {
      // Calcular días desde la última compra
      const lastPurchase = customer.last_purchase_at
        ? new Date(customer.last_purchase_at)
        : undefined
      const daysSincePurchase = lastPurchase
        ? Math.floor((now.getTime() - lastPurchase.getTime()) / (1000 * 60 * 60 * 24))
        : undefined

      message = renderTemplate(template, {
        name: customer.name,
        purchased_products: customer.purchased_products,
        daysSincePurchase,
      })
    } else {
      // Fallback al mensaje legacy si no hay plantilla
      message = buildFollowupMessage(customer as any)
    }

    if (options.dryRun) {
      result.results.push({ phone: customer.phone, status: "dry_run" })
      continue
    }

    // Para modo meta: calcular ventana y variables de plantilla
    const lastInboundRaw = (customer as any).metadata?.lastInboundAt as string | undefined
    const lastInboundAt = lastInboundRaw ? new Date(lastInboundRaw) : null
    const windowOpen =
      lastInboundAt instanceof Date &&
      now.getTime() - lastInboundAt.getTime() < 24 * 60 * 60 * 1000

    const firstName = campaignFirstName((customer as any).name)
    const lastPurchaseTitleForMeta =
      ((customer as any).purchased_products as Array<{ title?: string }> | null)?.slice(-1)[0]?.title || "tu compra"
    const daysSincePurchaseMeta = (customer as any).last_purchase_at
      ? Math.floor((now.getTime() - new Date((customer as any).last_purchase_at).getTime()) / (1000 * 60 * 60 * 24))
      : 30

    const media =
      template?.media_url && template?.media_type
        ? { url: String(template.media_url), kind: String(template.media_type) as MediaKind }
        : null

    const outcome = await dispatchFollowup(customer as any, message, config, {
      templateKey,
      vars: {
        nombre: firstName,
        producto: lastPurchaseTitleForMeta,
        dias: String(daysSincePurchaseMeta),
      },
      lastInboundAt,
      now,
      media,
    })

    const metaMode = config.mode === "meta"
      ? (outcome.status === "sent" && windowOpen ? "meta_freeform" : "meta_template")
      : config.mode

    const retryAt = new Date(now)
    retryAt.setDate(retryAt.getDate() + config.retryDays)

    await crm.addCustomerEvent({
      phone: customer.phone,
      type: outcome.status === "sent" ? "followup_sent" : "followup_queued",
      at: now.toISOString(),
      // Solo el modo `meta` llega a "sent"; `draft` siempre encola.
      source: outcome.status === "sent" ? "meta-dispatch" : "crm-job",
      nextFollowupAt: retryAt.toISOString(),
      payload: {
        suggestedMessage: message,
        reason: (customer as any).followup_reason || undefined,
        mode: metaMode,
        detail: outcome.detail,
      },
    })

    if (outcome.status === "sent") {
      result.sent += 1
    } else {
      result.queued += 1
    }
    result.results.push({
      phone: customer.phone,
      status: outcome.status,
      reason: outcome.detail,
    })
  }

  return result
}
