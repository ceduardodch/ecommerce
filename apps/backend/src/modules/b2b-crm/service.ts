import { MedusaService } from "@medusajs/framework/utils"
import { normalizeEcPhone } from "../../lib/ec-phone"
import {
  ConversationalOrder,
  CrmCustomerEvent,
  CrmCustomerProfile,
  CrmMessageTemplate,
  ProductReview,
} from "./models"
import type {
  ConversationalOrderInput,
  CrmCustomerEventInput,
  CrmCustomerInput,
  PurchasedProduct,
} from "./types"
import { recompraMetrics as calculateRecompraMetrics } from "./recompra-metrics"
import { calculateRfm, type RfmSegment } from "./rfm"

type AnyB2bCrmService = {
  listCrmCustomerProfiles: (filters?: unknown, config?: unknown) => Promise<any[]>
  listAndCountCrmCustomerProfiles: (
    filters?: unknown,
    config?: unknown,
  ) => Promise<[any[], number]>
  createCrmCustomerProfiles: (data: unknown) => Promise<any>
  updateCrmCustomerProfiles: (data: unknown) => Promise<any>
  listCrmCustomerEvents: (filters?: unknown, config?: unknown) => Promise<any[]>
  createCrmCustomerEvents: (data: unknown) => Promise<any>
  listConversationalOrders: (filters?: unknown, config?: unknown) => Promise<any[]>
  createConversationalOrders: (data: unknown) => Promise<any>
  updateConversationalOrders: (data: unknown) => Promise<any>
  listCrmMessageTemplates: (filters?: unknown, config?: unknown) => Promise<any[]>
  createCrmMessageTemplates: (data: unknown) => Promise<any>
  updateCrmMessageTemplates: (data: unknown) => Promise<any>
  listProductReviews: (filters?: unknown, config?: unknown) => Promise<any[]>
  createProductReviews: (data: unknown) => Promise<any>
  updateProductReviews: (data: unknown) => Promise<any>
}

export type CustomerSearchInput = {
  q?: string
  consent?: boolean
  dueOnly?: boolean
  tag?: string
  stage?: string
  vertical?: "cocina" | "bienestar" | "cross-sell-cocina" | "cross-sell-bienestar"
  rfmSegment?: RfmSegment
  offset?: number
  limit?: number
}

/**
 * Calcula el segmento RFM de un cliente on-the-fly dado sus eventos.
 * Sin migración: usa los eventos existentes.
 */
export function computeRfmSegment(
  customer: { last_purchase_at?: Date | string | null },
  customerEvents: Array<{ type: string; at?: string | Date | null }>,
  conversationalOrders: Array<{ phone?: string; total_amount?: number; status?: string }>,
  asOf: Date = new Date(),
): RfmSegment {
  const paidEvents = customerEvents.filter((event) => event.type === "paid")
  const totalAmount = conversationalOrders
    .filter((order) => order.status === "paid" && order.total_amount)
    .reduce((sum, order) => sum + (order.total_amount || 0), 0)

  const result = calculateRfm({
    paidEvents: paidEvents.map((event) => ({ at: event.at as string | Date })),
    totalAmount,
    asOf,
  })

  return result.segment
}

export type CustomerProfilePatch = {
  name?: string
  email?: string
  tags?: string[]
  whatsappConsent?: boolean
  nextFollowupAt?: string | null
  followupReason?: string
  suggestedFrequencyDays?: number
  metadata?: Record<string, unknown>
}

export type CustomerImportResult = {
  created: number
  updated: number
  errors: Array<{ row: number; phone?: string; error: string }>
}

function normalizePhone(phone: string) {
  const trimmed = phone.trim()
  if (/^(lead|session):[a-z0-9:_-]+$/i.test(trimmed)) {
    return trimmed.toLowerCase()
  }
  return trimmed.replace(/[^\d+]/g, "")
}

function asDate(value?: string) {
  return value ? new Date(value) : undefined
}

function iso(value?: Date | string | null) {
  if (!value) return undefined
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString()
}

function uniqueTags(existing: string[] = [], incoming: string[] = []) {
  return [...new Set([...existing, ...incoming].filter(Boolean))]
}

function addDays(isoDate: string, days: number) {
  const date = new Date(isoDate)
  date.setDate(date.getDate() + days)
  return date.toISOString()
}

function nextReorderDays(items: PurchasedProduct[]) {
  const days = items
    .map((item) => item.reorderAfterDays)
    .filter((value): value is number => Number.isFinite(value))

  return days.length ? Math.min(...days) : 90
}

/**
 * Devuelve qué líneas compró un cliente, como flags independientes.
 * Un SKU es de cocina si empieza con COC- o MGC-; cualquier otro es bienestar.
 * Si no hay compras, usa metadata.vertical (lead sin compra aún).
 */
export function customerVerticals(customer: {
  purchased_products?: PurchasedProduct[]
  metadata?: Record<string, unknown>
}): { cocina: boolean; bienestar: boolean } {
  const products = customer.purchased_products || []
  if (products.length === 0) {
    const meta = customer.metadata?.vertical
    return { cocina: meta === "cocina", bienestar: meta === "bienestar" }
  }
  const isCocina = (sku?: string) =>
    Boolean(sku) &&
    (sku!.toUpperCase().startsWith("COC-") ||
      sku!.toUpperCase().startsWith("MGC-"))
  return {
    cocina: products.some((p) => isCocina(p.sku)),
    bienestar: products.some((p) => !isCocina(p.sku)),
  }
}

/**
 * Vertical primaria para mostrar (no para cross-sell). Si compró ambas,
 * prioriza cocina. Para segmentar cross-sell, usar customerVerticals().
 */
function detectVertical(customer: {
  purchased_products?: PurchasedProduct[]
  metadata?: Record<string, unknown>
}): "cocina" | "bienestar" | null {
  const { cocina, bienestar } = customerVerticals(customer)
  if (cocina) return "cocina"
  if (bienestar) return "bienestar"
  return null
}

function eventMetadata(payload: unknown) {
  if (!payload || typeof payload !== "object") return {}
  const metadata = (payload as { metadata?: unknown }).metadata
  return metadata && typeof metadata === "object"
    ? (metadata as Record<string, unknown>)
    : {}
}

function payloadWithMetadata(
  payload: unknown,
  metadata: Record<string, unknown>,
) {
  if (!Object.keys(metadata).length) return payload || {}
  if (!payload || typeof payload !== "object") return { metadata }

  const existing = payload as Record<string, unknown>
  const existingMetadata =
    existing.metadata && typeof existing.metadata === "object"
      ? (existing.metadata as Record<string, unknown>)
      : {}

  return {
    ...existing,
    metadata: {
      ...existingMetadata,
      ...metadata,
    },
  }
}

class B2bCrmModuleService extends MedusaService({
  ConversationalOrder,
  CrmCustomerEvent,
  CrmCustomerProfile,
  CrmMessageTemplate,
  ProductReview,
}) {
  private service_() {
    return this as unknown as AnyB2bCrmService
  }

  async upsertCustomer(input: CrmCustomerInput) {
    const phone = normalizePhone(input.phone)
    const service = this.service_()
    const [existing] = await service.listCrmCustomerProfiles(
      { phone },
      { take: 1 },
    )

    const purchasedProducts = [
      ...(existing?.purchased_products || []),
      ...(input.purchasedProducts || []),
    ]

    const data = {
      phone,
      name: input.name ?? existing?.name,
      email: input.email ?? existing?.email,
      medusa_customer_id:
        input.medusaCustomerId ?? existing?.medusa_customer_id,
      whatsapp_consent:
        input.whatsappConsent ?? existing?.whatsapp_consent ?? false,
      tags: uniqueTags(existing?.tags || [], input.tags || []),
      last_purchase_at:
        asDate(input.lastPurchaseAt) ?? existing?.last_purchase_at,
      purchased_products: purchasedProducts,
      suggested_frequency_days:
        input.suggestedFrequencyDays ?? existing?.suggested_frequency_days,
      next_followup_at:
        asDate(input.nextFollowupAt) ?? existing?.next_followup_at,
      followup_reason: input.followupReason ?? existing?.followup_reason,
      metadata: {
        ...(existing?.metadata || {}),
        ...(input.metadata || {}),
      },
    }

    if (existing?.id) {
      return service.updateCrmCustomerProfiles({ id: existing.id, ...data })
    }

    return service.createCrmCustomerProfiles(data)
  }

  async getCustomer(phone: string) {
    const [customer] = await this.service_().listCrmCustomerProfiles(
      { phone: normalizePhone(phone) },
      { take: 1 },
    )
    return customer
  }

  async listCustomers(limit = 100) {
    return this.service_().listCrmCustomerProfiles(
      {},
      { take: limit, order: { updated_at: "DESC" } },
    )
  }

  async searchCustomers(input: CustomerSearchInput = {}) {
    const service = this.service_()
    const offset = Math.max(0, input.offset ?? 0)
    const limit = Math.min(200, Math.max(1, input.limit ?? 25))

    const where: Record<string, unknown> = {}
    if (input.q) where.q = input.q
    if (typeof input.consent === "boolean") {
      where.whatsapp_consent = input.consent
    }
    if (input.dueOnly) {
      where.next_followup_at = { $lte: new Date() }
    }

    const needsMemoryFilter = Boolean(input.tag || input.stage || input.vertical || input.rfmSegment)

    if (!needsMemoryFilter) {
      const [customers, count] = await service.listAndCountCrmCustomerProfiles(
        where,
        { skip: offset, take: limit, order: { updated_at: "DESC" } },
      )
      return { customers, count }
    }

    const candidates = await service.listCrmCustomerProfiles(where, {
      take: 2000,
      order: { updated_at: "DESC" },
    })
    const stage = input.stage?.toLowerCase()
    const tag = input.tag?.toLowerCase()
    const vertical = input.vertical?.toLowerCase()
    const rfmSegmentFilter = input.rfmSegment

    // Para filtro RFM necesitamos eventos y órdenes de todos los candidatos
    let allEvents: Array<{ type: string; at?: string | Date | null; phone: string }> = []
    let allOrders: Array<{ phone?: string; total_amount?: number; status?: string }> = []
    if (rfmSegmentFilter) {
      const phones = candidates.map((c) => c.phone)
      // Cargamos eventos y órdenes de todos los candidatos en batch
      allEvents = await service.listCrmCustomerEvents({ phone: phones }, { take: 10000 })
      allOrders = await service.listConversationalOrders({}, { take: 5000 })
    }

    const filtered = candidates.filter((customer) => {
      if (tag) {
        const tags = (customer.tags || []).map((value: string) =>
          String(value).toLowerCase(),
        )
        if (!tags.includes(tag)) return false
      }
      if (stage) {
        const customerStage = String(
          customer.metadata?.journeyStage || customer.followup_reason || "",
        ).toLowerCase()
        if (!customerStage.includes(stage)) return false
      }
      if (vertical) {
        const { cocina, bienestar } = customerVerticals(customer)
        if (!cocina && !bienestar) return false

        // Cross-sell: compró una línea y NO la otra (candidato a la otra)
        if (vertical === "cross-sell-cocina") {
          return bienestar && !cocina
        }
        if (vertical === "cross-sell-bienestar") {
          return cocina && !bienestar
        }
        // Match directo de línea (incluye clientes con ambas)
        if (vertical === "cocina" && !cocina) return false
        if (vertical === "bienestar" && !bienestar) return false
      }
      if (rfmSegmentFilter) {
        const customerEvents = allEvents.filter((e) => e.phone === customer.phone)
        const customerOrders = allOrders.filter((o) => o.phone === customer.phone)
        const segment = computeRfmSegment(customer, customerEvents, customerOrders)
        if (segment !== rfmSegmentFilter) return false
      }
      return true
    })

    return {
      customers: filtered.slice(offset, offset + limit),
      count: filtered.length,
    }
  }

  async updateCustomerProfile(phone: string, patch: CustomerProfilePatch) {
    const existing = await this.getCustomer(phone)
    if (!existing) return undefined

    const data: Record<string, unknown> = { id: existing.id }
    if (patch.name !== undefined) data.name = patch.name || null
    if (patch.email !== undefined) data.email = patch.email || null
    if (patch.tags !== undefined) data.tags = patch.tags
    if (patch.whatsappConsent !== undefined) {
      data.whatsapp_consent = patch.whatsappConsent
    }
    if (patch.nextFollowupAt !== undefined) {
      data.next_followup_at = patch.nextFollowupAt
        ? new Date(patch.nextFollowupAt)
        : null
    }
    if (patch.followupReason !== undefined) {
      data.followup_reason = patch.followupReason || null
    }
    if (patch.suggestedFrequencyDays !== undefined) {
      data.suggested_frequency_days = patch.suggestedFrequencyDays
    }
    if (patch.metadata !== undefined) {
      data.metadata = {
        ...(existing.metadata || {}),
        ...patch.metadata,
      }
    }

    return this.service_().updateCrmCustomerProfiles(data)
  }

  async importCustomers(
    inputs: CrmCustomerInput[],
  ): Promise<CustomerImportResult> {
    const result: CustomerImportResult = { created: 0, updated: 0, errors: [] }

    for (const [index, input] of inputs.entries()) {
      const normalized = normalizeEcPhone(input.phone)
      const phone = normalized.phone
      if (!phone) {
        result.errors.push({
          row: index + 1,
          phone: input.phone,
          error: normalized.error || "telefono_invalido",
        })
        continue
      }

      try {
        const existing = await this.getCustomer(phone)
        await this.upsertCustomer({ ...input, phone })
        if (existing) {
          result.updated += 1
        } else {
          result.created += 1
        }
      } catch (cause) {
        result.errors.push({
          row: index + 1,
          phone,
          error: cause instanceof Error ? cause.message : "error_desconocido",
        })
      }
    }

    return result
  }

  async recordManualPurchase(input: {
    phone: string
    products: PurchasedProduct[]
    payload?: unknown
  }) {
    return this.markPaid({
      externalOrderId: `manual_${Date.now()}`,
      phone: input.phone,
      purchasedProducts: input.products,
      payload: input.payload,
      source: "manual",
    })
  }

  async snoozeFollowup(phone: string, untilIso: string, reason?: string) {
    const customer = await this.getCustomer(phone)
    if (!customer) return undefined

    await this.service_().updateCrmCustomerProfiles({
      id: customer.id,
      next_followup_at: new Date(untilIso),
      ...(reason ? { followup_reason: reason } : {}),
    })

    return this.service_().createCrmCustomerEvents({
      phone: customer.phone,
      type: "followup_snoozed",
      at: new Date(),
      source: "admin",
      payload: { until: untilIso, reason },
    })
  }

  async listCustomerEvents(phone: string, limit = 50) {
    return this.service_().listCrmCustomerEvents(
      { phone: normalizePhone(phone) },
      { take: limit, order: { at: "DESC" } },
    )
  }

  async addCustomerEvent(input: CrmCustomerEventInput) {
    const phone = normalizePhone(input.phone)
    const customer = input.customer || {}
    const metadata = {
      ...(customer.metadata || {}),
      ...eventMetadata(input.payload),
      ...(input.metadata || {}),
    }
    const tags = uniqueTags(customer.tags || [], input.tags || [])
    await this.upsertCustomer({
      phone,
      name: customer.name,
      email: customer.email,
      medusaCustomerId: customer.medusaCustomerId,
      whatsappConsent:
        input.type === "opt_out"
          ? false
          : input.whatsappConsent ?? customer.whatsappConsent,
      tags,
      nextFollowupAt: input.nextFollowupAt,
      followupReason:
        input.followupReason ||
        (typeof metadata.journeyStage === "string"
          ? metadata.journeyStage
          : undefined),
      metadata,
    })

    const event = await this.service_().createCrmCustomerEvents({
      phone,
      type: input.type,
      at: asDate(input.at) || new Date(),
      quote_id: input.quoteId,
      order_id: input.orderId,
      medusa_order_id: input.medusaOrderId,
      source: input.source,
      payload: payloadWithMetadata(input.payload, metadata),
    })

    // Al registrar un evento `delivered`, agendar followup NPS a +7 días,
    // SOLO si el cliente no tiene un followup más próximo.
    if (input.type === "delivered") {
      const customer = await this.getCustomer(phone)
      if (customer) {
        const npsAt = addDays(new Date().toISOString(), 7)
        const existing = customer.next_followup_at
        const shouldSchedule =
          !existing ||
          new Date(npsAt).getTime() < new Date(existing).getTime()
        if (shouldSchedule) {
          await this.service_().updateCrmCustomerProfiles({
            id: customer.id,
            next_followup_at: new Date(npsAt),
            followup_reason: "nps_postentrega",
          })
        }
      }
    }

    return event
  }

  async markPaid(input: {
    externalOrderId: string
    phone?: string
    quoteId?: string
    medusaOrderId?: string
    purchasedProducts: PurchasedProduct[]
    payload?: unknown
    source?: string
  }) {
    if (!input.phone) return undefined

    const now = new Date().toISOString()
    const suggestedFrequencyDays = nextReorderDays(input.purchasedProducts)

    await this.upsertCustomer({
      phone: input.phone,
      lastPurchaseAt: now,
      purchasedProducts: input.purchasedProducts.map((item) => ({
        ...item,
        purchasedAt: item.purchasedAt || now,
      })),
      suggestedFrequencyDays,
      nextFollowupAt: addDays(now, suggestedFrequencyDays),
      followupReason: "recompra_o_complemento_cocina",
    })

    return this.addCustomerEvent({
      phone: input.phone,
      type: "paid",
      at: now,
      quoteId: input.quoteId,
      orderId: input.externalOrderId,
      medusaOrderId: input.medusaOrderId,
      source: input.source || "payphone",
      payload: input.payload,
    })
  }

  async createConversationalOrder(input: ConversationalOrderInput) {
    return this.service_().createConversationalOrders({
      external_id: input.externalId,
      quote_id: input.quoteId,
      phone: input.phone ? normalizePhone(input.phone) : undefined,
      status: input.status,
      medusa_order_id: input.medusaOrderId,
      medusa_draft_order_id: input.medusaDraftOrderId,
      payment_link: input.paymentLink,
      client_transaction_id: input.clientTransactionId,
      total_amount: input.totalAmount,
      currency_code: input.currencyCode || "usd",
      quote: input.quote || {},
      customer: input.customer || {},
      events: input.events || [],
      metadata: input.metadata || {},
    })
  }

  async updateConversationalOrder(
    externalId: string,
    patch: Partial<ConversationalOrderInput>,
  ) {
    const order = await this.findConversationalOrder(externalId)
    if (!order) return undefined

    return this.service_().updateConversationalOrders({
      id: order.id,
      status: patch.status ?? order.status,
      medusa_order_id: patch.medusaOrderId ?? order.medusa_order_id,
      medusa_draft_order_id:
        patch.medusaDraftOrderId ?? order.medusa_draft_order_id,
      payment_link: patch.paymentLink ?? order.payment_link,
      client_transaction_id:
        patch.clientTransactionId ?? order.client_transaction_id,
      events: patch.events ?? order.events,
      metadata: {
        ...(order.metadata || {}),
        ...(patch.metadata || {}),
      },
    })
  }

  async findConversationalOrder(externalId: string) {
    const [order] = await this.service_().listConversationalOrders(
      { external_id: externalId },
      { take: 1 },
    )
    return order
  }

  async findConversationalOrderByClientTransaction(clientTransactionId: string) {
    const [order] = await this.service_().listConversationalOrders(
      { client_transaction_id: clientTransactionId },
      { take: 1 },
    )
    return order
  }

  async dueFollowups(asOfIso: string, limit = 50) {
    const asOf = Date.parse(asOfIso)
    const customers = await this.service_().listCrmCustomerProfiles(
      {},
      { take: 1000, order: { next_followup_at: "ASC" } },
    )

    return customers
      .filter((customer) => {
        if (!customer.whatsapp_consent || !customer.next_followup_at) {
          return false
        }
        const dueAt = Date.parse(iso(customer.next_followup_at) || "")
        return Number.isFinite(dueAt) && dueAt <= asOf
      })
      .slice(0, limit)
  }

  async dashboard(asOfIso: string) {
    const [customers, orders, events, dueFollowups] = await Promise.all([
      this.service_().listCrmCustomerProfiles({}, { take: 1000 }),
      this.service_().listConversationalOrders({}, { take: 1000 }),
      this.service_().listCrmCustomerEvents({}, { take: 1000 }),
      this.dueFollowups(asOfIso, 25),
    ])

    const pendingOrders = orders.filter(
      (order) => order.status === "pending_payment",
    )
    const paidOrders = orders.filter((order) => order.status === "paid")
    const leadPhones = new Set(
      events
        .filter((event) =>
          [
            "whatsapp_click",
            "whatsapp_opened",
            "video_interest",
            "lead_created",
            "quiz_completed",
            "guide_downloaded",
            "product_interest",
            "quote_started",
            "quote_created",
            "checkout_started",
            "order_created",
            "payment_proof_received",
            "complement_interest",
            "reorder_interest",
          ].includes(event.type),
        )
        .map((event) => event.phone),
    )
    const paidPhones = new Set(
      events.filter((event) => event.type === "paid").map((event) => event.phone),
    )
    const optOutPhones = new Set(
      events
        .filter((event) => event.type === "opt_out")
        .map((event) => event.phone),
    )
    const customerByPhone = new Map(
      customers.map((customer) => [customer.phone, customer]),
    )
    const hotLeads = [...leadPhones]
      .filter((phone) => !paidPhones.has(phone) && !optOutPhones.has(phone))
      .map((phone) => customerByPhone.get(phone))
      .filter(Boolean)
      .slice(0, 25)
    const reasonIncludes = (customer: any, values: string[]) => {
      const reason = String(customer.followup_reason || customer.metadata?.journeyStage || "")
      return values.some((value) => reason.includes(value))
    }

    return {
      asOf: asOfIso,
      counts: {
        leads: leadPhones.size,
        pendingOrders: pendingOrders.length,
        paidOrders: paidOrders.length,
        dueFollowups: dueFollowups.length,
        customers: customers.length,
      },
      customers,
      pendingOrders,
      paidOrders: paidOrders.slice(-10),
      dueFollowups,
      hotLeads,
      careFollowups: dueFollowups.filter((customer) =>
        reasonIncludes(customer, ["cuidado", "care"]),
      ),
      complementFollowups: dueFollowups.filter((customer) =>
        reasonIncludes(customer, ["complemento", "complement"]),
      ),
      reorderFollowups: dueFollowups.filter((customer) =>
        reasonIncludes(customer, ["recompra", "reorder"]),
      ),
      optOuts: customers.filter((customer) => optOutPhones.has(customer.phone)),
      recentEvents: events.slice(-25).reverse(),
    }
  }

  async listTemplates(activeOnly = true) {
    const service = this.service_()
    const templates = await service.listCrmMessageTemplates(
      activeOnly ? { active: true } : {},
      { order: { key: "ASC" } },
    )
    return templates
  }

  async getTemplate(key: string) {
    const service = this.service_()
    const [template] = await service.listCrmMessageTemplates(
      { key },
      { take: 1 },
    )
    return template
  }

  async updateTemplate(key: string, patch: { body?: string; active?: boolean }) {
    const existing = await this.getTemplate(key)
    if (!existing) return undefined

    const data: Record<string, unknown> = { id: existing.id }
    if (patch.body !== undefined) data.body = patch.body
    if (patch.active !== undefined) data.active = patch.active

    return this.service_().updateCrmMessageTemplates(data)
  }

  async recompraMetrics(asOfIso: string) {
    const service = this.service_()
    const [customers, events] = await Promise.all([
      service.listCrmCustomerProfiles({}, { take: 10000 }),
      service.listCrmCustomerEvents({}, { take: 10000 }),
    ])

    return calculateRecompraMetrics(events, customers, asOfIso)
  }

  async listRecentBroadcasts(limit = 50) {
    const events = await this.service_().listCrmCustomerEvents(
      { type: ["broadcast_sent", "broadcast_queued"] },
      { take: limit, order: { at: "DESC" } },
    )
    return events
  }

  // --- Product Review Methods ---

  /**
   * Verifica si el cliente compró el producto.
   */
  async verifyPurchase(phone: string, productId: string): Promise<boolean> {
    const customer = await this.getCustomer(phone)
    if (!customer) return false

    const purchasedProducts = customer.purchased_products || []
    return purchasedProducts.some(
      (p: any) => p.productId === productId || p.sku === productId
    )
  }

  /**
   * Crea una review con verificación de compra automática.
   */
  async createVerifiedReview(data: {
    product_id: string
    product_sku: string
    customer_phone: string
    customer_name: string
    rating: number
    title: string
    content: string
    photos?: string[]
  }) {
    const isVerified = await this.verifyPurchase(
      data.customer_phone,
      data.product_id
    )

    const service = this.service_()
    const review = await service.createProductReviews({
      ...data,
      verified_purchase: isVerified,
      photos: data.photos || [],
    })

    return review
  }

  /**
   * Obtiene reviews de un producto, ordenadas por fecha.
   */
  async getProductReviews(productId: string, limit = 10) {
    return this.service_().listProductReviews(
      { product_id: productId },
      { take: limit, order: { created_at: "DESC" } },
    )
  }

  /**
   * Marca una review como útil.
   */
  async markReviewHelpful(id: string) {
    const [review] = await this.service_().listProductReviews(
      { id },
      { take: 1 },
    )

    if (!review) return undefined

    return this.service_().updateProductReviews({
      id: review.id,
      helpful_count: (review.helpful_count || 0) + 1,
    })
  }

  /**
   * Calcula el rating promedio de un producto.
   */
  async getProductAverageRating(productId: string): Promise<number> {
    const reviews = await this.getProductReviews(productId, 1000)

    if (reviews.length === 0) return 0

    const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0)
    return Math.round((sum / reviews.length) * 10) / 10
  }
}

export default B2bCrmModuleService
