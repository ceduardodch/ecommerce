import { normalizeEcPhone } from "../../lib/ec-phone"

export type LeadField =
  | "phone"
  | "name"
  | "email"
  | "whatsappConsent"
  | "tags"
  | "lastPurchaseAt"
  | "productTitle"
  | "sku"
  | "quantity"
  | "suggestedFrequencyDays"
  | "nextFollowupAt"
  | "followupReason"
  | "city"
  | "journeyStage"
  | "campaignSlug"
  | "leadId"
  | "productInterestSku"
  | "ignore"

export const LEAD_FIELDS: Array<{
  field: LeadField
  label: string
  aliases: string[]
}> = [
  {
    field: "phone",
    label: "Teléfono (WhatsApp)",
    aliases: ["phone", "telefono", "teléfono", "whatsapp", "celular", "movil", "móvil", "numero", "número"],
  },
  { field: "name", label: "Nombre", aliases: ["name", "nombre", "cliente", "contacto"] },
  { field: "email", label: "Email", aliases: ["email", "correo", "mail"] },
  {
    field: "whatsappConsent",
    label: "Consentimiento WhatsApp",
    aliases: ["whatsappconsent", "whatsapp_consent", "consentimiento", "consent", "optin", "opt_in"],
  },
  { field: "tags", label: "Etiquetas (| o ;)", aliases: ["tags", "etiquetas"] },
  {
    field: "lastPurchaseAt",
    label: "Última compra (fecha)",
    aliases: ["lastpurchaseat", "last_purchase_at", "ultima_compra", "última_compra", "fecha_compra"],
  },
  {
    field: "productTitle",
    label: "Producto comprado",
    aliases: ["producttitle", "product_title", "producto", "ultimo_producto", "último_producto"],
  },
  { field: "sku", label: "SKU", aliases: ["sku", "codigo", "código"] },
  { field: "quantity", label: "Cantidad", aliases: ["quantity", "cantidad"] },
  {
    field: "suggestedFrequencyDays",
    label: "Frecuencia recompra (días)",
    aliases: ["suggestedfrequencydays", "suggested_frequency_days", "frecuencia_dias", "frecuencia_días", "reorderafterdays", "reorder_after_days"],
  },
  {
    field: "nextFollowupAt",
    label: "Próximo seguimiento (fecha)",
    aliases: ["nextfollowupat", "next_followup_at", "proximo_seguimiento", "próximo_seguimiento"],
  },
  {
    field: "followupReason",
    label: "Motivo seguimiento",
    aliases: ["followupreason", "followup_reason", "motivo_seguimiento", "motivo"],
  },
  { field: "city", label: "Ciudad", aliases: ["city", "ciudad"] },
  {
    field: "journeyStage",
    label: "Etapa",
    aliases: ["journeystage", "journey_stage", "etapa", "stage"],
  },
  {
    field: "campaignSlug",
    label: "Campaña",
    aliases: ["campaignslug", "campaign_slug", "campana", "campaña", "campaign"],
  },
  { field: "leadId", label: "Lead ID", aliases: ["leadid", "lead_id"] },
  {
    field: "productInterestSku",
    label: "SKU de interés",
    aliases: ["productinterestsku", "product_interest_sku", "sku_interes", "sku_interés"],
  },
]

export type ColumnMapping = Record<string, LeadField>

export function autoMapColumns(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {}
  const used = new Set<LeadField>()

  for (const header of headers) {
    const normalized = header.trim().toLowerCase().replace(/\s+/g, "_")
    const match = LEAD_FIELDS.find(
      (definition) =>
        !used.has(definition.field) && definition.aliases.includes(normalized),
    )
    mapping[header] = match ? match.field : "ignore"
    if (match) used.add(match.field)
  }

  return mapping
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
  return Number.isFinite(date.getTime()) ? date.toISOString() : undefined
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

export type ImportCustomerPayload = {
  phone: string
  name?: string
  email?: string
  whatsappConsent?: boolean
  tags?: string[]
  lastPurchaseAt?: string
  purchasedProducts?: Array<{
    productId: string
    sku: string
    title: string
    quantity: number
    purchasedAt?: string
    reorderAfterDays?: number
  }>
  suggestedFrequencyDays?: number
  nextFollowupAt?: string
  followupReason?: string
  metadata?: Record<string, unknown>
}

export type PreparedRow = {
  row: number
  raw: Record<string, string>
  customer?: ImportCustomerPayload
  error?: string
  duplicateOfRow?: number
}

export function prepareImportRows(
  rows: Array<Record<string, string>>,
  mapping: ColumnMapping,
): PreparedRow[] {
  const seenPhones = new Map<string, number>()

  return rows.map((raw, index) => {
    const rowNumber = index + 2 // +1 por cabecera, +1 por base 1
    const values: Partial<Record<LeadField, string>> = {}

    for (const [header, field] of Object.entries(mapping)) {
      if (field === "ignore") continue
      const value = String(raw[header] ?? "").trim()
      if (value) values[field] = value
    }

    const normalized = normalizeEcPhone(values.phone)
    if (!normalized.phone) {
      return {
        row: rowNumber,
        raw,
        error: normalized.error || "telefono_invalido",
      }
    }

    const lastPurchaseAt = isoFromText(values.lastPurchaseAt)
    const suggestedFrequencyDays = numberFromText(values.suggestedFrequencyDays)
    const purchasedProducts = values.productTitle
      ? [
          {
            productId: "legacy",
            sku: values.sku || "LEGACY",
            title: values.productTitle,
            quantity: numberFromText(values.quantity) || 1,
            purchasedAt: lastPurchaseAt || new Date().toISOString(),
            reorderAfterDays: suggestedFrequencyDays,
          },
        ]
      : []

    const customer: ImportCustomerPayload = {
      phone: normalized.phone,
      name: values.name,
      email: values.email,
      whatsappConsent: boolFromText(values.whatsappConsent),
      tags: tagsFromText(values.tags),
      lastPurchaseAt,
      purchasedProducts,
      suggestedFrequencyDays,
      nextFollowupAt:
        isoFromText(values.nextFollowupAt) ||
        (lastPurchaseAt && suggestedFrequencyDays
          ? addDays(lastPurchaseAt, suggestedFrequencyDays)
          : undefined),
      followupReason: values.followupReason,
      metadata: {
        ...(values.city ? { city: values.city } : {}),
        ...(values.campaignSlug ? { campaignSlug: values.campaignSlug } : {}),
        ...(values.leadId ? { leadId: values.leadId } : {}),
        ...(values.productInterestSku
          ? { productInterestSku: values.productInterestSku }
          : {}),
        ...(values.journeyStage ? { journeyStage: values.journeyStage } : {}),
      },
    }

    const duplicateOfRow = seenPhones.get(normalized.phone)
    if (duplicateOfRow === undefined) {
      seenPhones.set(normalized.phone, rowNumber)
    }

    return { row: rowNumber, raw, customer, duplicateOfRow }
  })
}
