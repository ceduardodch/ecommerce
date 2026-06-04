import type {
  CustomerInput,
  CustomerRecord,
  PurchasedProduct,
} from "./types.js"

type CustomerEventPayload = {
  product?: { sku?: string }
  products?: Array<{ sku?: string }>
  metadata?: {
    city?: string
    campaignSlug?: string
    leadId?: string
    productInterestSku?: string
    recommendedSku?: string
    journeyStage?: string
    followupSequence?: string[]
  }
}

type ImportCustomer = CustomerInput & {
  phone: string
  lastPurchaseAt?: string
  purchasedProducts?: PurchasedProduct[]
  suggestedFrequencyDays?: number
  nextFollowupAt?: string
  followupReason?: string
}

function parseCsvLine(line: string) {
  const values: string[] = []
  let current = ""
  let quoted = false

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    const next = line[index + 1]

    if (char === '"' && quoted && next === '"') {
      current += '"'
      index += 1
    } else if (char === '"') {
      quoted = !quoted
    } else if (char === "," && !quoted) {
      values.push(current.trim())
      current = ""
    } else {
      current += char
    }
  }

  values.push(current.trim())
  return values
}

function parseCsv(csv: string) {
  const rows = csv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (!rows.length) return []
  const headers = parseCsvLine(rows[0]).map((header) => header.trim())
  return rows.slice(1).map((line) => {
    const values = parseCsvLine(line)
    return Object.fromEntries(
      headers.map((header, index) => [header, values[index] || ""]),
    )
  })
}

function boolFromText(value: string | undefined) {
  if (!value) return false
  return ["1", "true", "si", "sí", "yes", "y", "optin"].includes(
    value.trim().toLowerCase(),
  )
}

function numberFromText(value: string | undefined) {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : undefined
}

function isoFromText(value: string | undefined) {
  if (!value) return undefined
  const date = new Date(value)
  return Number.isFinite(date.getTime()) ? date.toISOString() : value
}

function tagsFromText(value: string | undefined) {
  return (value || "")
    .split(/[|;]/)
    .map((tag) => tag.trim())
    .filter(Boolean)
}

function addDays(iso: string, days: number) {
  const date = new Date(iso)
  if (!Number.isFinite(date.getTime())) return undefined
  date.setDate(date.getDate() + days)
  return date.toISOString()
}

export function parseCustomerImport(input: {
  csv?: string
  customers?: Array<
    CustomerInput & {
      phone: string
      lastPurchaseAt?: string
      purchasedProducts?: Array<{
        productId?: string
        sku?: string
        title: string
        quantity?: number
        purchasedAt?: string
        reorderAfterDays?: number
      }>
      suggestedFrequencyDays?: number
      nextFollowupAt?: string
      followupReason?: string
    }
  >
}) {
  if (input.customers?.length) {
    return input.customers.map((customer) => {
      const lastPurchaseAt = isoFromText(customer.lastPurchaseAt)
      const suggestedFrequencyDays = customer.suggestedFrequencyDays
      return {
        ...customer,
        lastPurchaseAt,
        purchasedProducts: (customer.purchasedProducts || []).map(
          (product) => ({
            productId: product.productId || "legacy",
            sku: product.sku || "LEGACY",
            title: product.title,
            quantity: product.quantity || 1,
            purchasedAt:
              isoFromText(product.purchasedAt) ||
              lastPurchaseAt ||
              new Date().toISOString(),
            reorderAfterDays: product.reorderAfterDays,
          }),
        ),
        nextFollowupAt:
          customer.nextFollowupAt ||
          (lastPurchaseAt && suggestedFrequencyDays
            ? addDays(lastPurchaseAt, suggestedFrequencyDays)
            : undefined),
      } satisfies ImportCustomer
    })
  }

  return parseCsv(input.csv || "").map((row) => {
    const lastPurchaseAt = isoFromText(
      row.lastPurchaseAt || row.last_purchase_at || row.ultima_compra,
    )
    const suggestedFrequencyDays =
      numberFromText(row.suggestedFrequencyDays) ||
      numberFromText(row.suggested_frequency_days) ||
      numberFromText(row.frecuencia_dias)
    const productTitle =
      row.productTitle ||
      row.product_title ||
      row.producto ||
      row.ultimo_producto
    const purchasedProducts = productTitle
      ? [
          {
            productId: row.productId || row.product_id || "legacy",
            sku: row.sku || "LEGACY",
            title: productTitle,
            quantity: numberFromText(row.quantity || row.cantidad) || 1,
            purchasedAt: lastPurchaseAt || new Date().toISOString(),
            reorderAfterDays: suggestedFrequencyDays,
          },
        ]
      : []

    return {
      phone: row.phone || row.telefono || row.whatsapp,
      name: row.name || row.nombre,
      email: row.email || row.correo,
      whatsappConsent: boolFromText(
        row.whatsappConsent || row.whatsapp_consent || row.consentimiento,
      ),
      tags: tagsFromText(row.tags || row.etiquetas),
      lastPurchaseAt,
      purchasedProducts,
      suggestedFrequencyDays,
      nextFollowupAt:
        row.nextFollowupAt ||
        row.next_followup_at ||
        row.proximo_seguimiento ||
        (lastPurchaseAt && suggestedFrequencyDays
          ? addDays(lastPurchaseAt, suggestedFrequencyDays)
          : undefined),
      followupReason:
        row.followupReason || row.followup_reason || row.motivo_seguimiento,
      metadata: {
        city: row.city || row.ciudad || undefined,
        campaignSlug: row.campaignSlug || row.campaign_slug || undefined,
        leadId: row.leadId || row.lead_id || undefined,
        productInterestSku:
          row.productInterestSku ||
          row.product_interest_sku ||
          row.sku_interes ||
          undefined,
        journeyStage:
          row.journeyStage || row.journey_stage || row.etapa || undefined,
      },
    } satisfies ImportCustomer
  })
}

export function buildFollowupDraft(customer: CustomerRecord) {
  const last = customer.purchasedProducts.at(-1)
  const name = customer.name ? ` ${customer.name}` : ""

  if (!last) {
    return `Hola${name}, te escribo de Eter Niu Cocina. Tenemos ollas y woks de granito para cocinar con menos aceite y cuidar el antiadherente. Si quieres, te recomiendo segun para cuantas personas cocinas.`
  }

  return `Hola${name}, soy Eter Niu Cocina. Vi que compraste ${last.title}. Te puedo ayudar con cuidado, utensilios compatibles o una olla de complemento segun tu uso diario.`
}

function payloadObject(payload: unknown): CustomerEventPayload {
  return payload && typeof payload === "object"
    ? (payload as CustomerEventPayload)
    : {}
}

export function recommendedProductSku(customer: CustomerRecord) {
  const last = customer.purchasedProducts.at(-1)
  if (last?.sku) return last.sku

  const events = [...customer.events].reverse()
  for (const event of events) {
    const payload = payloadObject(event.payload)
    const metadata = payload.metadata || {}
    const sku =
      metadata.recommendedSku ||
      metadata.productInterestSku ||
      payload.product?.sku ||
      payload.products?.find((product) => product.sku)?.sku
    if (sku) return sku
  }

  return undefined
}

export function followupReason(customer: CustomerRecord) {
  if (customer.followupReason) return customer.followupReason

  const eventTypes = customer.events.map((event) => event.type)
  if (eventTypes.includes("opt_out")) return "opt_out"
  if (eventTypes.includes("payment_proof_received")) return "pago_en_revision"
  if (eventTypes.includes("checkout_started") || eventTypes.includes("order_created")) {
    return "pago_pendiente"
  }
  if (eventTypes.includes("paid") || customer.lastPurchaseAt) {
    return "recompra_90d"
  }
  if (eventTypes.includes("quiz_completed") || eventTypes.includes("guide_downloaded")) {
    return "lead_nuevo"
  }
  if (eventTypes.includes("video_interest")) return "interes_video"

  return "seguimiento_comercial"
}

export function followupPriority(reason: string) {
  if (
    [
      "pago_pendiente",
      "pago_en_revision",
      "cotizacion_pendiente",
      "recompra_90d",
      "reorder_due",
    ].some((value) => reason.includes(value))
  ) {
    return "high"
  }
  if (
    ["complemento_30d", "complement_due", "interes_video", "lead_nuevo"].some(
      (value) => reason.includes(value),
    )
  ) {
    return "medium"
  }
  return "low"
}

export function buildFollowupAction(customer: CustomerRecord) {
  const reason = followupReason(customer)
  return {
    ...customer,
    suggestedMessage: buildFollowupDraft(customer),
    reason,
    priority: followupPriority(reason),
    recommendedProductSku: recommendedProductSku(customer),
    requiresHumanApproval: true,
  }
}
