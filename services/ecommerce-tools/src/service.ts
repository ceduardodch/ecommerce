import type { AppConfig } from "./config.js"
import { loadProducts, searchProducts } from "./catalog.js"
import { buildQuote } from "./quote.js"
import { createPayPhoneLink } from "./payphone.js"
import { findOrder, findOrderByClientTransaction, upsertOrder } from "./storage.js"
import { buildMetaCatalogCsv, buildMetaDraft } from "./meta.js"
import type { CustomerInput, OrderRecord } from "./types.js"

export function createCommerceService(config: AppConfig) {
  return {
    async products(input: {
      query?: string
      category?: string
      minPrice?: number
      maxPrice?: number
      limit?: number
    }) {
      const products = await loadProducts(config)
      return searchProducts(products, input)
    },

    async quote(input: {
      items: Array<{ productId: string; variantId?: string; quantity: number }>
    }) {
      const products = await loadProducts(config)
      return buildQuote(config, products, input.items)
    },

    async createOrder(input: {
      items: Array<{ productId: string; variantId?: string; quantity: number }>
      customer?: CustomerInput
      source?: string
      notes?: string
    }) {
      const products = await loadProducts(config)
      const quote = buildQuote(config, products, input.items)
      const now = new Date().toISOString()
      const order: OrderRecord = {
        id: `B2B-${Date.now().toString(36).toUpperCase()}`,
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

      return upsertOrder(config.dataDir, order)
    },

    async createPaymentLink(orderId: string) {
      const order = await findOrder(config.dataDir, orderId)
      if (!order) throw new Error(`Orden no encontrada: ${orderId}`)

      const link = await createPayPhoneLink(config, order)
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
      const clientTransactionId = String(payload.clientTransactionId || "")
      const order = clientTransactionId
        ? await findOrderByClientTransaction(config.dataDir, clientTransactionId)
        : undefined

      if (!order) {
        return { matched: false, status: "unmatched", payload }
      }

      const rawStatus = String(payload.status || payload.statusCode || "")
      const paid = ["2", "3", "approved", "success", "paid"].includes(
        rawStatus.toLowerCase()
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
      return { matched: true, status: updated.status, order: updated }
    },

    async metaCatalogCsv() {
      const products = await loadProducts(config)
      return buildMetaCatalogCsv(products)
    },

    async metaDraft(input: { productIds: string[]; angle: string }) {
      const products = await loadProducts(config)
      const selected = products.filter((product) =>
        input.productIds.includes(product.id)
      )
      if (!selected.length) throw new Error("No se encontraron productos")
      return buildMetaDraft(selected, input.angle)
    },
  }
}
