import type { AppConfig } from "./config.js"
import { loadProducts, searchProducts } from "./catalog.js"
import {
  buildFollowupAction,
  parseCustomerImport,
} from "./customers.js"
import { buildQuote } from "./quote.js"
import { createPayPhoneLink } from "./payphone.js"
import {
  addMedusaCustomerEvent,
  attachMedusaPaymentLink,
  createMedusaOrder,
  forwardPayphoneWebhook,
  getMedusaCustomer,
  getMedusaDashboard,
  getMedusaOrder,
  importMedusaCustomers,
  listMedusaDueFollowups,
} from "./medusa-admin.js"
import {
  crmPayloadForEvent,
  eventIdFor,
  eventTypeFor,
  identityForEvent,
  leadIdentity,
  sendMetaConversionEvent,
  sessionIdentity,
} from "./events.js"
import {
  addCustomerEvent,
  findCustomer,
  findOrder,
  findOrderByClientTransaction,
  listDueFollowups,
  readCustomers,
  readOrders,
  upsertCustomer,
  upsertOrder,
} from "./storage.js"
import { buildMetaCatalogCsv, buildMetaDraft } from "./meta.js"
import type { ToolsEventInput } from "./contracts.js"
import type {
  CustomerEventRecord,
  CustomerInput,
  OrderRecord,
  PurchasedProduct,
} from "./types.js"

function addDays(iso: string, days: number) {
  const date = new Date(iso)
  date.setDate(date.getDate() + days)
  return date.toISOString()
}

function nextReorderDays(items: Array<{ reorderAfterDays?: number }>) {
  const days = items
    .map((item) => item.reorderAfterDays)
    .filter((value): value is number => Number.isFinite(value))
  return days.length ? Math.min(...days) : 90
}

function isPaidStatus(status: string | undefined) {
  return ["paid", "success", "approved", "2", "3"].includes(
    String(status || "").toLowerCase(),
  )
}

function orderPurchaseEvent(order: OrderRecord): ToolsEventInput {
  return {
    eventName: "Purchase",
    type: "purchase_confirmed",
    eventId: `purchase:${order.id}`,
    at: new Date().toISOString(),
    source: "payphone",
    consent: order.customer.whatsappConsent,
    customer: order.customer,
    products: order.quote.lines.map((line) => ({
      productId: line.productId,
      variantId: line.variantId,
      sku: line.sku,
      title: line.title,
      price: line.unitPrice.amount,
      currency: line.unitPrice.currency,
      quantity: line.quantity,
    })),
    value: order.quote.total.amount,
    currency: order.quote.currency,
    metadata: {
      orderId: order.id,
      medusaOrderId: order.medusaOrderId,
      quoteId: order.quote.id,
    },
  }
}

function recentEventsFromCustomer(customer: unknown) {
  if (!customer || typeof customer !== "object") return []
  const events = (customer as { events?: unknown }).events
  return Array.isArray(events) ? events : []
}

function customerTags(customer: unknown) {
  if (!customer || typeof customer !== "object") return []
  const tags = (customer as { tags?: unknown }).tags
  return Array.isArray(tags) ? tags.filter((tag) => typeof tag === "string") : []
}

function eventTypes(events: unknown[]) {
  return events
    .map((event) =>
      event && typeof event === "object"
        ? String((event as { type?: unknown }).type || "")
        : "",
    )
    .filter(Boolean)
}

function suggestNextAction(customer: unknown, events: unknown[]) {
  const types = eventTypes(events)
  const tags = customerTags(customer)

  if (types.includes("opt_out")) {
    return "No contactar por WhatsApp. Mantener opt-out y pedir revision humana."
  }
  if (types.includes("payment_proof_received")) {
    return "Revisar comprobante de transferencia/deuna con humano antes de marcar pagado."
  }
  if (
    types.includes("checkout_started") ||
    types.includes("order_created") ||
    types.includes("cotizacion_pendiente")
  ) {
    return "Retomar pago pendiente con link PayPhone y confirmar entrega."
  }
  if (
    types.includes("care_followup_due") ||
    types.includes("care_followup_sent") ||
    types.includes("cuidado_postventa")
  ) {
    return "Enviar cuidado postventa: fuego medio, utensilios suaves y limpieza correcta."
  }
  if (
    types.includes("complement_due") ||
    types.includes("complemento_30d") ||
    types.includes("complement_interest")
  ) {
    return "Recomendar complemento compatible segun la pieza comprada o vista."
  }
  if (
    types.includes("reorder_due") ||
    types.includes("recompra_90d") ||
    types.includes("reorder_interest")
  ) {
    return "Proponer recompra, regalo o combo familiar con aprobacion humana."
  }
  if (
    types.includes("quiz_completed") ||
    types.includes("guide_downloaded") ||
    types.includes("whatsapp_click") ||
    types.includes("whatsapp_opened") ||
    types.includes("video_interest") ||
    types.includes("interes_video") ||
    types.includes("product_interest") ||
    types.includes("lead_created") ||
    types.includes("lead_nuevo")
  ) {
    return "Responder con contexto del producto visto y pedir uso, presupuesto y ciudad."
  }
  if (types.includes("paid") || types.includes("cliente_pagado")) {
    return "Ofrecer complemento, cuidado del producto o recompra segun historial."
  }
  if (tags.includes("web-anonymous")) {
    return "Identificar telefono del lead y asociar la conversacion al producto consultado."
  }

  return "Consultar necesidad de cocina y recomendar desde catalogo real antes de cotizar."
}

function payloadObject(event: unknown) {
  if (!event || typeof event !== "object") return {}
  const payload = (event as { payload?: unknown }).payload
  return payload && typeof payload === "object"
    ? (payload as Record<string, unknown>)
    : {}
}

function customerLifecycleSummary(events: unknown[]) {
  const latest = [...events].reverse()
  const types = eventTypes(events)
  const latestProduct = latest
    .map((event) => {
      const payload = payloadObject(event)
      const metadata =
        payload.metadata && typeof payload.metadata === "object"
          ? (payload.metadata as Record<string, unknown>)
          : {}
      const product =
        payload.product && typeof payload.product === "object"
          ? (payload.product as Record<string, unknown>)
          : {}
      return {
        sku:
          metadata.recommendedSku ||
          metadata.productInterestSku ||
          product.sku,
        videoSlot: metadata.videoSlot,
        city: metadata.city,
        householdPeople: metadata.householdPeople,
        journeyStage: metadata.journeyStage,
      }
    })
    .find((signal) => Object.values(signal).some(Boolean))

  return {
    journeyStage:
      latestProduct?.journeyStage ||
      (types.includes("paid")
        ? "cliente_pagado"
        : types.includes("payment_proof_received")
          ? "pago_en_revision"
          : types.includes("checkout_started")
          ? "cotizacion_pendiente"
          : types.includes("video_interest")
            ? "interes_video"
            : types.includes("quiz_completed")
              ? "lead_nuevo"
              : undefined),
    productInterestSku: latestProduct?.sku,
    videoSlot: latestProduct?.videoSlot,
    city: latestProduct?.city,
    householdPeople: latestProduct?.householdPeople,
  }
}

async function trackCustomerEvent(
  config: AppConfig,
  customer: CustomerInput | undefined,
  event: CustomerEventRecord,
  patch: Parameters<typeof addCustomerEvent>[3] = {},
) {
  if (!customer?.phone) return undefined

  if (config.crmBackend === "medusa") {
    return addMedusaCustomerEvent(config, {
      phone: customer.phone,
      type: event.type,
      at: event.at,
      payload: event.payload,
      orderId: event.orderId,
      quoteId: event.quoteId,
      source: event.source,
      nextFollowupAt: patch.nextFollowupAt,
      followupReason: patch.followupReason,
      whatsappConsent:
        event.type === "opt_out" ? false : patch.whatsappConsent,
      tags: patch.tags,
    })
  }

  await upsertCustomer(config.dataDir, customer)
  return addCustomerEvent(config.dataDir, customer.phone, event, patch)
}

export function createCommerceService(config: AppConfig) {
  async function getAnyCustomer(identity: string) {
    try {
      return config.crmBackend === "medusa"
        ? await getMedusaCustomer(config, identity)
        : await findCustomer(config.dataDir, identity)
    } catch {
      return undefined
    }
  }

  return {
    async products(input: {
      query?: string
      category?: string
      minPrice?: number
      maxPrice?: number
      limit?: number
      vertical?: "cocina" | "bienestar"
    }) {
      const products = await loadProducts(config)
      return searchProducts(products, input)
    },

    async quote(input: {
      items: Array<{ productId: string; variantId?: string; quantity: number }>
      customer?: CustomerInput
    }) {
      const products = await loadProducts(config)
      const quote = buildQuote(config, products, input.items)
      const now = new Date().toISOString()
      await trackCustomerEvent(config, input.customer, {
        type: "quote_created",
        at: now,
        quoteId: quote.id,
        source: "whatsapp",
        payload: {
          total: quote.total,
          items: quote.lines.map((line) => ({
            sku: line.sku,
            title: line.title,
            quantity: line.quantity,
          })),
        },
      })
      return quote
    },

    async createOrder(input: {
      items: Array<{ productId: string; variantId?: string; quantity: number }>
      customer?: CustomerInput
      source?: string
      notes?: string
    }) {
      const products = await loadProducts(config)
      const quote = buildQuote(config, products, input.items)

      if (config.crmBackend === "medusa") {
        return createMedusaOrder(config, {
          quote,
          customer: input.customer,
          source: input.source || "whatsapp",
          notes: input.notes,
        })
      }

      const now = new Date().toISOString()
      const order: OrderRecord = {
        id: `ETN-${Date.now().toString(36).toUpperCase()}`,
        quote,
        customer: input.customer || {},
        status: "pending_payment",
        createdAt: now,
        updatedAt: now,
        events: [
          {
            type: "created",
            at: now,
            payload: {
              source: input.source || "whatsapp",
              notes: input.notes,
              medusaSync:
                config.medusaAdminApiKey && config.medusaAdminApiUrl
                  ? "pending"
                  : "not_configured",
            },
          },
        ],
      }

      const saved = await upsertOrder(config.dataDir, order)
      await trackCustomerEvent(config, input.customer, {
        type: "order_created",
        at: now,
        orderId: saved.id,
        quoteId: quote.id,
        source: input.source || "whatsapp",
        payload: {
          status: saved.status,
          total: quote.total,
          notes: input.notes,
        },
      })
      return saved
    },

    async createPaymentLink(orderId: string) {
      const order =
        config.crmBackend === "medusa"
          ? await getMedusaOrder(config, orderId)
          : await findOrder(config.dataDir, orderId)
      if (!order) throw new Error(`Orden no encontrada: ${orderId}`)

      const link = await createPayPhoneLink(config, order)

      if (config.crmBackend === "medusa") {
        return attachMedusaPaymentLink(config, orderId, {
          paymentLink: link.url,
          clientTransactionId: link.clientTransactionId,
          payload: link,
        })
      }

      const now = new Date().toISOString()
      const updated: OrderRecord = {
        ...order,
        paymentLink: link.url,
        clientTransactionId: link.clientTransactionId,
        updatedAt: now,
        events: [
          ...order.events,
          {
            type: "payphone_link_created",
            at: now,
            payload: link,
          },
        ],
      }

      return upsertOrder(config.dataDir, updated)
    },

    async payphoneWebhook(payload: Record<string, unknown>) {
      if (config.crmBackend === "medusa") {
        const result = await forwardPayphoneWebhook(config, payload)
        if (isPaidStatus(result.status) && result.order) {
          await sendMetaConversionEvent(
            config,
            orderPurchaseEvent(result.order),
            `purchase:${result.order.id}`,
          )
        }
        return result
      }

      const clientTransactionId = String(payload.clientTransactionId || "")
      const order = clientTransactionId
        ? await findOrderByClientTransaction(
            config.dataDir,
            clientTransactionId,
          )
        : undefined

      if (!order) {
        return { matched: false, status: "unmatched", payload }
      }

      const rawStatus = String(payload.status || payload.statusCode || "")
      const paid = ["2", "3", "approved", "success", "paid"].includes(
        rawStatus.toLowerCase(),
      )
      const now = new Date().toISOString()
      const updated: OrderRecord = {
        ...order,
        status: paid ? "paid" : "payment_review",
        updatedAt: now,
        events: [
          ...order.events,
          {
            type: "payphone_notification",
            at: now,
            payload,
          },
        ],
      }

      await upsertOrder(config.dataDir, updated)
      if (updated.customer.phone && paid) {
        const suggestedFrequencyDays = nextReorderDays(updated.quote.lines)
        const purchasedProducts: PurchasedProduct[] = updated.quote.lines.map(
          (line) => ({
            productId: line.productId,
            sku: line.sku,
            title: line.title,
            quantity: line.quantity,
            purchasedAt: now,
            reorderAfterDays: line.reorderAfterDays,
          }),
        )

        await trackCustomerEvent(
          config,
          updated.customer,
          {
            type: "paid",
            at: now,
            orderId: updated.id,
            quoteId: updated.quote.id,
            source: "payphone",
            payload,
          },
          {
            lastPurchaseAt: now,
            purchasedProducts,
            suggestedFrequencyDays,
            nextFollowupAt: addDays(now, suggestedFrequencyDays),
            followupReason: "recompra_o_complemento_cocina",
          },
        )
        await sendMetaConversionEvent(
          config,
          orderPurchaseEvent(updated),
          `purchase:${updated.id}`,
        )
      }
      return { matched: true, status: updated.status, order: updated }
    },

    async metaCatalogCsv(input: { vertical?: "cocina" | "bienestar" } = {}) {
      const products = await loadProducts(config)
      return buildMetaCatalogCsv(
        searchProducts(products, { vertical: input.vertical, limit: 100 }),
      )
    },

    async metaDraft(input: { productIds: string[]; angle: string }) {
      const products = await loadProducts(config)
      const selected = products.filter((product) =>
        input.productIds.includes(product.id),
      )
      if (!selected.length) throw new Error("No se encontraron productos")
      return buildMetaDraft(selected, input.angle)
    },

    async importCustomers(input: Parameters<typeof parseCustomerImport>[0]) {
      const customers = parseCustomerImport(input)

      if (config.crmBackend === "medusa") {
        return importMedusaCustomers(config, customers)
      }

      const imported = []
      for (const customer of customers) {
        if (!customer.phone) continue
        imported.push(await upsertCustomer(config.dataDir, customer))
      }
      return { imported: imported.length, customers: imported }
    },

    async getCustomer(phone: string) {
      if (config.crmBackend === "medusa") {
        return getMedusaCustomer(config, phone)
      }

      return findCustomer(config.dataDir, phone)
    },

    async addCustomerEvent(input: {
      phone: string
      type: CustomerEventRecord["type"]
      at?: string
      payload?: unknown
      orderId?: string
      quoteId?: string
      source?: string
      nextFollowupAt?: string
      followupReason?: string
      whatsappConsent?: boolean
      tags?: string[]
    }) {
      if (config.crmBackend === "medusa") {
        return addMedusaCustomerEvent(config, input)
      }

      const at = input.at || new Date().toISOString()
      const customer = await upsertCustomer(config.dataDir, {
        phone: input.phone,
        whatsappConsent: input.whatsappConsent,
        tags: input.tags,
      })
      const updated = await addCustomerEvent(
        config.dataDir,
        customer.phone,
        {
          type: input.type,
          at,
          payload: input.payload,
          orderId: input.orderId,
          quoteId: input.quoteId,
          source: input.source || "manual",
        },
        {
          whatsappConsent:
            input.type === "opt_out" ? false : input.whatsappConsent,
          nextFollowupAt: input.nextFollowupAt,
          followupReason: input.followupReason,
          tags: input.tags,
        },
      )
      return updated
    },

    async recordEvent(input: ToolsEventInput) {
      const eventId = eventIdFor(input)
      const meta = await sendMetaConversionEvent(config, input, eventId)
      const identity = identityForEvent(input)

      if (!identity) {
        return {
          accepted: true,
          crmStored: false,
          reason: "missing_identity",
          eventId,
          eventName: input.eventName,
          meta,
        }
      }

      const type = eventTypeFor(input)
      const now = input.at || new Date().toISOString()
      const payload = crmPayloadForEvent(input, eventId, meta)
      const tags = input.customer?.tags || [
        input.customer?.phone ? "web-lead" : "web-anonymous",
      ]
      const customerPatch = {
        whatsappConsent: input.customer?.whatsappConsent,
        tags,
      }

      if (config.crmBackend === "medusa") {
        await addMedusaCustomerEvent(config, {
          phone: identity,
          type,
          at: now,
          payload,
          source: input.source || "storefront",
          whatsappConsent: customerPatch.whatsappConsent,
          tags: customerPatch.tags,
        })
      } else {
        await upsertCustomer(config.dataDir, {
          phone: identity,
          name: input.customer?.name,
          email: input.customer?.email,
          whatsappConsent: input.customer?.whatsappConsent,
          tags,
        })
        await addCustomerEvent(
          config.dataDir,
          identity,
          {
            type,
            at: now,
            payload,
            source: input.source || "storefront",
          },
          customerPatch,
        )
      }

      return {
        accepted: true,
        crmStored: true,
        identity,
        eventId,
        eventName: input.eventName,
        crmEventType: type,
        meta,
      }
    },

    async aiContext(
      phone: string,
      input: { leadId?: string; sessionId?: string } = {},
    ) {
      const identities = [
        phone,
        input.leadId ? leadIdentity(input.leadId) : undefined,
        input.sessionId ? sessionIdentity(input.sessionId) : undefined,
      ].filter((value): value is string => Boolean(value))

      const records = await Promise.all(identities.map(getAnyCustomer))
      const customer = records[0]
      const linkedRecords = records.filter(Boolean)
      const recentEvents = linkedRecords.flatMap(recentEventsFromCustomer)
      const webSignals = recentEvents.filter((event) => {
        if (!event || typeof event !== "object") return false
        return [
          "page_view",
          "view_content",
          "video_interest",
          "product_interest",
          "search",
          "whatsapp_click",
          "whatsapp_opened",
          "lead_created",
          "quiz_completed",
          "guide_downloaded",
          "interes_video",
          "lead_nuevo",
          "campaign_click",
          "payment_proof_received",
        ].includes(String((event as { type?: unknown }).type || ""))
      })

      return {
        customer,
        linkedIdentities: identities,
        linkedRecords,
        recentEvents,
        webSignals,
        lifecycle: customerLifecycleSummary(recentEvents),
        recommendedNextAction: suggestNextAction(customer, recentEvents),
      }
    },

    async dueFollowups(input: { asOf?: string; limit?: number }) {
      if (config.crmBackend === "medusa") {
        return listMedusaDueFollowups(config, input)
      }

      const customers = await listDueFollowups(
        config.dataDir,
        input.asOf || new Date().toISOString(),
        input.limit,
      )
      return customers.map(buildFollowupAction)
    },

    async dashboard(input: { asOf?: string }) {
      if (config.crmBackend === "medusa") {
        return getMedusaDashboard(config, input)
      }

      const asOf = input.asOf || new Date().toISOString()
      const [orders, customers, dueFollowups] = await Promise.all([
        readOrders(config.dataDir),
        readCustomers(config.dataDir),
        listDueFollowups(config.dataDir, asOf, 25),
      ])
      const pendingOrders = orders.filter(
        (order) => order.status === "pending_payment",
      )
      const paidOrders = orders.filter((order) => order.status === "paid")
      const leadCustomers = customers.filter((customer) =>
        customer.events.some((event) =>
          [
            "quiz_completed",
            "guide_downloaded",
            "quote_created",
            "order_created",
            "reorder_interest",
            "video_interest",
            "product_interest",
            "whatsapp_opened",
            "payment_proof_received",
          ].includes(event.type),
        ),
      )
      const enrichedDueFollowups = dueFollowups.map(buildFollowupAction)
      const hotLeads = leadCustomers.filter(
        (customer) =>
          !customer.events.some((event) =>
            ["paid", "opt_out"].includes(event.type),
          ),
      )
      const optOuts = customers.filter((customer) =>
        customer.events.some((event) => event.type === "opt_out"),
      )
      const reasonIncludes = (customer: { reason?: string }, values: string[]) =>
        values.some((value) => customer.reason?.includes(value))

      return {
        asOf,
        counts: {
          leads: leadCustomers.length,
          pendingOrders: pendingOrders.length,
          paidOrders: paidOrders.length,
          dueFollowups: dueFollowups.length,
          customers: customers.length,
        },
        pendingOrders,
        paidOrders: paidOrders.slice(-10),
        hotLeads: hotLeads.slice(0, 25),
        careFollowups: enrichedDueFollowups.filter((customer) =>
          reasonIncludes(customer, ["cuidado", "care"]),
        ),
        complementFollowups: enrichedDueFollowups.filter((customer) =>
          reasonIncludes(customer, ["complemento", "complement"]),
        ),
        reorderFollowups: enrichedDueFollowups.filter((customer) =>
          reasonIncludes(customer, ["recompra", "reorder"]),
        ),
        optOuts,
        dueFollowups: enrichedDueFollowups,
        campaignDraftQueue: enrichedDueFollowups
          .filter((customer) => customer.whatsappConsent)
          .map((customer) => ({
            phone: customer.phone,
            name: customer.name,
            reason: customer.reason,
            priority: customer.priority,
            recommendedProductSku: customer.recommendedProductSku,
            requiresHumanApproval: customer.requiresHumanApproval,
            nextFollowupAt: customer.nextFollowupAt,
            suggestedMessage: customer.suggestedMessage,
          })),
      }
    },
  }
}
