import { MedusaService } from "@medusajs/framework/utils"
import {
  ConversationalOrder,
  CrmCustomerEvent,
  CrmCustomerProfile,
} from "./models"
import type {
  ConversationalOrderInput,
  CrmCustomerEventInput,
  CrmCustomerInput,
  PurchasedProduct,
} from "./types"

type AnyB2bCrmService = {
  listCrmCustomerProfiles: (filters?: unknown, config?: unknown) => Promise<any[]>
  createCrmCustomerProfiles: (data: unknown) => Promise<any>
  updateCrmCustomerProfiles: (data: unknown) => Promise<any>
  listCrmCustomerEvents: (filters?: unknown, config?: unknown) => Promise<any[]>
  createCrmCustomerEvents: (data: unknown) => Promise<any>
  listConversationalOrders: (filters?: unknown, config?: unknown) => Promise<any[]>
  createConversationalOrders: (data: unknown) => Promise<any>
  updateConversationalOrders: (data: unknown) => Promise<any>
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

    return this.service_().createCrmCustomerEvents({
      phone,
      type: input.type,
      at: asDate(input.at) || new Date(),
      quote_id: input.quoteId,
      order_id: input.orderId,
      medusa_order_id: input.medusaOrderId,
      source: input.source,
      payload: payloadWithMetadata(input.payload, metadata),
    })
  }

  async markPaid(input: {
    externalOrderId: string
    phone?: string
    quoteId?: string
    medusaOrderId?: string
    purchasedProducts: PurchasedProduct[]
    payload?: unknown
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
      source: "payphone",
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
}

export default B2bCrmModuleService
