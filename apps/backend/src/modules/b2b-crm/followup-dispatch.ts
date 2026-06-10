import type { MedusaContainer } from "@medusajs/framework/types"
import { B2B_CRM_MODULE } from "./index"
import type B2bCrmModuleService from "./service"

export type DispatchMode = "draft" | "openclaw"

export type FollowupDispatchConfig = {
  enabled: boolean
  mode: DispatchMode
  gatewayUrl?: string
  gatewayHookPath: string
  gatewayToken?: string
  cooldownDays: number
  maxPerRun: number
  retryDays: number
  windowStartHour: number
  windowEndHour: number
  timezoneOffsetHours: number
}

export function loadDispatchConfig(
  env: NodeJS.ProcessEnv = process.env,
): FollowupDispatchConfig {
  const [windowStart, windowEnd] = String(env.CRM_FOLLOWUP_WINDOW || "9-19")
    .split("-")
    .map((value) => Number(value))

  return {
    enabled: !["0", "false", "no"].includes(
      String(env.CRM_FOLLOWUP_ENABLED ?? "true").toLowerCase(),
    ),
    mode:
      env.CRM_FOLLOWUP_DISPATCH_MODE === "openclaw" ? "openclaw" : "draft",
    gatewayUrl: env.OPENCLAW_GATEWAY_URL,
    gatewayHookPath: env.OPENCLAW_GATEWAY_HOOK_PATH || "/hooks/agent",
    gatewayToken: env.OPENCLAW_HOOKS_TOKEN,
    cooldownDays: Number(env.CRM_FOLLOWUP_COOLDOWN_DAYS || 7),
    maxPerRun: Number(env.CRM_FOLLOWUP_MAX_PER_RUN || 20),
    retryDays: Number(env.CRM_FOLLOWUP_RETRY_DAYS || 7),
    windowStartHour: Number.isFinite(windowStart) ? windowStart : 9,
    windowEndHour: Number.isFinite(windowEnd) ? windowEnd : 19,
    // America/Guayaquil es UTC-5 todo el año (sin horario de verano)
    timezoneOffsetHours: Number(env.CRM_FOLLOWUP_TZ_OFFSET_HOURS ?? -5),
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
      if (!["followup_sent", "followup_queued"].includes(event.type)) {
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

export function buildFollowupMessage(customer: {
  name?: string | null
  purchased_products?: Array<{ title?: string }> | null
}) {
  const products = customer.purchased_products || []
  const lastProduct = products[products.length - 1]
  const firstName = customer.name ? String(customer.name).split(" ")[0] : ""
  const greeting = firstName ? `Hola ${firstName}` : "Hola"

  if (lastProduct?.title) {
    return `${greeting}, vi que compraste ${lastProduct.title}. Te puedo ayudar con mantenimiento, complemento o reposicion para que sigas equipando tu cocina?`
  }

  return `${greeting}, tenemos nuevas opciones de ollas, cuchillos y combos de cocina. Te preparo una cotizacion corta por WhatsApp?`
}

export type DispatchOutcome = {
  status: "sent" | "queued"
  detail?: string
}

export async function dispatchFollowup(
  customer: { phone: string; name?: string | null },
  message: string,
  config: FollowupDispatchConfig,
): Promise<DispatchOutcome> {
  if (config.mode !== "openclaw" || !config.gatewayUrl) {
    return { status: "queued", detail: "modo_draft" }
  }

  const url = `${config.gatewayUrl.replace(/\/$/, "")}${config.gatewayHookPath}`
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000)

  try {
    const response = await fetch(url, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(config.gatewayToken
          ? { Authorization: `Bearer ${config.gatewayToken}` }
          : {}),
      },
      body: JSON.stringify({
        name: "crm-followup",
        channel: "whatsapp",
        to: customer.phone,
        deliver: true,
        message,
      }),
    })

    if (!response.ok) {
      return { status: "queued", detail: `gateway_http_${response.status}` }
    }

    return { status: "sent" }
  } catch (cause) {
    return {
      status: "queued",
      detail: `gateway_error_${cause instanceof Error ? cause.name : "unknown"}`,
    }
  } finally {
    clearTimeout(timeout)
  }
}

export type DispatchRunResult = {
  mode: DispatchMode
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
    const message = buildFollowupMessage(customer as any)

    if (options.dryRun) {
      result.results.push({ phone: customer.phone, status: "dry_run" })
      continue
    }

    const outcome = await dispatchFollowup(customer as any, message, config)
    const retryAt = new Date(now)
    retryAt.setDate(retryAt.getDate() + config.retryDays)

    await crm.addCustomerEvent({
      phone: customer.phone,
      type: outcome.status === "sent" ? "followup_sent" : "followup_queued",
      at: now.toISOString(),
      source: outcome.status === "sent" ? "openclaw-dispatch" : "crm-job",
      nextFollowupAt: retryAt.toISOString(),
      payload: {
        suggestedMessage: message,
        reason: (customer as any).followup_reason || undefined,
        mode: config.mode,
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
