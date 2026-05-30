import { createHash, randomUUID } from "node:crypto"
import type { AppConfig } from "./config.js"
import type { ToolsEventInput } from "./contracts.js"
import type { CustomerEventType } from "./types.js"

type MetaSendResult =
  | { sent: true; response: unknown }
  | { sent: false; reason: string }

const metaEventToCrm: Record<ToolsEventInput["eventName"], CustomerEventType> = {
  PageView: "page_view",
  ViewContent: "view_content",
  Search: "search",
  Contact: "whatsapp_opened",
  Lead: "whatsapp_opened",
  InitiateCheckout: "checkout_started",
  Purchase: "purchase_confirmed",
}

export function sanitizeTrackingId(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9:_-]/g, "")
    .slice(0, 96)
}

export function leadIdentity(leadId: string) {
  return `lead:${sanitizeTrackingId(leadId)}`
}

export function sessionIdentity(sessionId: string) {
  return `session:${sanitizeTrackingId(sessionId)}`
}

export function identityForEvent(input: ToolsEventInput) {
  if (input.customer?.phone) return input.customer.phone
  if (input.leadId) return leadIdentity(input.leadId)
  if (input.sessionId) return sessionIdentity(input.sessionId)
  return undefined
}

export function eventTypeFor(input: ToolsEventInput) {
  return input.type || metaEventToCrm[input.eventName]
}

export function eventIdFor(input: ToolsEventInput) {
  return input.eventId || `${input.eventName.toLowerCase()}_${randomUUID()}`
}

function normalizeForHash(value?: string) {
  return value?.trim().toLowerCase()
}

function normalizePhoneForHash(value?: string) {
  return value?.trim().replace(/[^\d]/g, "")
}

function sha256(value?: string) {
  const normalized = normalizeForHash(value)
  return normalized
    ? createHash("sha256").update(normalized).digest("hex")
    : undefined
}

function unixTime(value?: string) {
  const parsed = value ? Date.parse(value) : Date.now()
  return Math.floor((Number.isFinite(parsed) ? parsed : Date.now()) / 1000)
}

function eventProducts(input: ToolsEventInput) {
  return input.products?.length
    ? input.products
    : input.product
      ? [input.product]
      : []
}

function eventValue(input: ToolsEventInput) {
  if (Number.isFinite(input.value)) return input.value
  const products = eventProducts(input)
  if (!products.length) return undefined
  return products.reduce(
    (sum, product) => sum + (product.price || 0) * (product.quantity || 1),
    0,
  )
}

function buildCustomData(input: ToolsEventInput) {
  const products = eventProducts(input)
  const value = eventValue(input)
  const contentIds = products.map(
    (product) => product.sku || product.variantId || product.productId,
  )

  return {
    currency: input.currency || products[0]?.currency || "USD",
    value,
    search_string: input.searchString,
    content_ids: contentIds.length ? contentIds : undefined,
    content_type: products.length ? "product" : undefined,
    content_name: input.product?.title,
    content_category: input.product?.category,
    contents: products.length
      ? products.map((product) => ({
          id: product.sku || product.variantId || product.productId,
          quantity: product.quantity || 1,
          item_price: product.price,
        }))
      : undefined,
  }
}

function withoutUndefined<T extends Record<string, unknown>>(input: T) {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined),
  )
}

export async function sendMetaConversionEvent(
  config: AppConfig,
  input: ToolsEventInput,
  eventId: string,
): Promise<MetaSendResult> {
  if (input.type === "payment_proof_received") {
    return {
      sent: false,
      reason: "payment_proof_requires_human_confirmation",
    }
  }
  if (!config.pixelEnabled) return { sent: false, reason: "pixel_disabled" }
  if (input.consent === false) return { sent: false, reason: "no_consent" }
  if (!config.metaAccessToken) {
    return { sent: false, reason: "meta_access_token_missing" }
  }
  if (!config.metaDatasetId) {
    return { sent: false, reason: "meta_dataset_id_missing" }
  }

  const phoneHash = sha256(normalizePhoneForHash(input.customer?.phone))
  const emailHash = sha256(input.customer?.email)
  const userData = withoutUndefined({
    em: emailHash ? [emailHash] : undefined,
    ph: phoneHash ? [phoneHash] : undefined,
    fbp: input.fbp,
    fbc: input.fbc,
    client_ip_address: input.clientIp,
    client_user_agent: input.userAgent,
    external_id: input.customer?.phone
      ? [sha256(input.customer.phone)]
      : input.leadId
        ? [sha256(input.leadId)]
        : undefined,
  })

  const event = withoutUndefined({
    event_name: input.eventName,
    event_time: unixTime(input.at),
    event_id: eventId,
    action_source: "website",
    event_source_url: input.pageUrl,
    user_data: userData,
    custom_data: withoutUndefined(buildCustomData(input)),
  })

  const body = {
    data: [event],
    test_event_code: config.metaCapiTestEventCode || undefined,
  }
  const url = new URL(
    `https://graph.facebook.com/${config.metaApiVersion}/${config.metaDatasetId}/events`,
  )
  url.searchParams.set("access_token", config.metaAccessToken)

  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  })

  const responseBody = await response.json().catch(async () => ({
    raw: await response.text().catch(() => ""),
  }))

  if (!response.ok) {
    return {
      sent: false,
      reason: `meta_${response.status}_${JSON.stringify(responseBody)}`,
    }
  }

  return { sent: true, response: responseBody }
}

export function crmPayloadForEvent(
  input: ToolsEventInput,
  eventId: string,
  meta: MetaSendResult,
) {
  return {
    eventId,
    at: input.at,
    eventName: input.eventName,
    sessionId: input.sessionId,
    leadId: input.leadId,
    pageUrl: input.pageUrl,
    referrer: input.referrer,
    searchString: input.searchString,
    cta: input.cta,
    placement: input.placement,
    consent: input.consent,
    attribution: input.attribution,
    product: input.product,
    products: input.products,
    value: eventValue(input),
    currency: input.currency,
    metadata: input.metadata,
    meta: meta.sent
      ? { sent: true }
      : { sent: false, reason: meta.reason },
  }
}
