import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { crmService, serializeCustomer } from "../../_shared"
import { calculateRfmFromProfile, type RfmSegment } from "../../../../../modules/b2b-crm/rfm"

type ImportBody = {
  customers?: Array<{
    phone: string
    name?: string
    email?: string
    medusaCustomerId?: string
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
  }>
}

function boolParam(value: unknown) {
  if (value === undefined) return undefined
  return ["1", "true", "si", "sí", "yes"].includes(
    String(value).toLowerCase(),
  )
}

const VALID_RFM_SEGMENTS: RfmSegment[] = [
  "vip", "leal", "prometedor", "nuevo", "dormido", "en_riesgo",
]

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const limit = Number(req.query.limit || 100)
  const offset = Number(req.query.offset || 0)
  const rfmParam = req.query.rfmSegment ? String(req.query.rfmSegment) : undefined
  const rfmSegment = rfmParam && VALID_RFM_SEGMENTS.includes(rfmParam as RfmSegment)
    ? (rfmParam as RfmSegment)
    : undefined

  const { customers, count } = await crmService(req).searchCustomers({
    q: req.query.q ? String(req.query.q) : undefined,
    consent: boolParam(req.query.consent),
    dueOnly: boolParam(req.query.due) === true,
    tag: req.query.tag ? String(req.query.tag) : undefined,
    stage: req.query.stage ? String(req.query.stage) : undefined,
    vertical: req.query.vertical
      ? (String(req.query.vertical) as any)
      : undefined,
    rfmSegment,
    offset,
    limit,
  })

  // Enrich with RFM segment on-the-fly from profile data (no extra DB calls)
  const enriched = customers.map((customer: any) => {
    const rfmScore = calculateRfmFromProfile(customer)
    return { ...customer, _rfmSegment: rfmScore }
  })

  res.json({
    customers: enriched.map(serializeCustomer),
    count,
    offset,
    limit,
  })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = req.body as ImportBody
  const input = body.customers || []
  const imported: unknown[] = []

  for (const customer of input) {
    if (!customer.phone) continue
    imported.push(await crmService(req).upsertCustomer(customer))
  }

  res.json({
    imported: imported.length,
    customers: imported.map(serializeCustomer),
  })
}
