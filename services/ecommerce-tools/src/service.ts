import type { AppConfig } from "./config.js"
import { loadProducts, searchProducts } from "./catalog.js"
import { buildFollowupAction, parseCustomerImport } from "./customers.js"
import { buildQuote } from "./quote.js"
import {
  consumeCartSession,
  createCartSession,
  type CartSessionLine,
} from "./cart-session.js"
import {
  addMedusaCustomerEvent,
  createMedusaOrder,
  getMedusaCustomer,
  getMedusaConversationByPhone,
  getMedusaDashboard,
  getMedusaOrder,
  importMedusaCustomers,
  listMedusaDueFollowups,
  updateMedusaPaymentStatus,
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
  findDatafastCheckout,
  listDueFollowups,
  readDatafastCheckouts,
  readCustomers,
  readOrders,
  upsertCustomer,
  upsertDatafastCheckout,
  upsertOrder,
} from "./storage.js"
import {
  createDatafastCheckout,
  getDatafastResult,
  voidDatafastPayment,
  type DatafastCheckoutInput,
} from "./datafast.js"
import { sendWhatsappFreeform } from "./whatsapp-reply.js"
import { buildMetaCatalogCsv, buildMetaDraft } from "./meta.js"
import type { SaleFeedbackInput, ToolsEventInput } from "./contracts.js"
import type {
  CustomerEventRecord,
  CustomerInput,
  DatafastCheckoutRecord,
  OrderRecord,
  PurchasedProduct,
  Product,
  Quote,
} from "./types.js"

// Guard anti-carrera: evita pedido/WhatsApp duplicados si el cliente
// refresca /checkout/resultado mientras el primer request sigue en vuelo.
const inflightDatafastResults = new Set<string>()

// Ventana del barrido de checkouts pendientes (reconcilePendingDatafastCheckouts).
/** Margen para no interrumpir a quien todavía está pagando en el widget. */
const DATAFAST_PENDING_GRACE_MS = 10 * 60 * 1000
/** Datafast deja de exponer los checkouts viejos; más allá no hay nada que consultar. */
const DATAFAST_PENDING_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000
/** Tope por pasada para no martillar la API de Datafast. */
const DATAFAST_PENDING_MAX_PER_RUN = 25

type CheckoutCatalogEntry = readonly [
  sku: string,
  title: string,
  pvp: number,
  stock: number,
  combo?: number,
  comboGroup?: string,
]

function checkoutCatalogProduct([
  sku,
  title,
  pvp,
  stock,
  combo,
  comboGroup,
]: CheckoutCatalogEntry): Product {
  return {
    id: `prod-${sku.toLowerCase()}`,
    variantId: `var-${sku.toLowerCase()}`,
    sku,
    vertical: "cocina",
    title,
    description: `${title}. Precio validado por el catálogo de checkout.`,
    category: "Cocina MGC",
    brand: "MGC",
    price: { amount: pvp, currency: "USD" },
    originalPrice: { amount: pvp, currency: "USD" },
    ...(combo
      ? {
          comboPrice: { amount: combo, currency: "USD" as const },
          comboMinimumItems: 3,
          ...(comboGroup ? { comboGroup } : {}),
        }
      : {}),
    stock,
    imageUrl: "",
    productUrl: "",
    tags: ["mgc", "checkout"],
  }
}

// Catálogo que autoriza cobros DataFast. Sus SKU y valores deben mantenerse
// iguales a los publicados por la tienda y al seed de Medusa.
const checkoutCatalogEntries = [
  ["MGC-FR-SARTEN-20-GN", "Sartén Onyx Imperial 20 cm", 55, 96, 39.99],
  ["MGC-FR-SARTEN-24-GN", "Sartén Onyx Imperial 24 cm", 60, 96, 49.99],
  ["MGC-FR-SARTEN-28-GN", "Sartén Onyx Imperial 28 cm", 65, 96, 59.99],
  ["MGC-FR-LECHERA-18-GN", "Olla lechera Onyx Imperial 18 cm", 53, 48, 39],
  ["MGC-FR-OLLA-20-GN", "Olla Onyx Imperial 20 cm", 63, 32, 49],
  ["MGC-FR-OLLA-24-GN", "Olla Onyx Imperial 24 cm", 73, 32, 59],
  ["MGC-FR-WOK-32-GN", "Wok Onyx Imperial 32 cm", 139.99, 18, 129.99],
  ["MGC-FR-SARTEN-24-RO", "Sartén francesa angular 24 cm", 60, 8, 55],
  ["MGC-EU-SARTEN-20-AZ", "Sartén Azul Oceánico 20 cm", 55, 16, 45],
  ["MGC-EU-SARTEN-24-AZ", "Sartén Azul Oceánico 24 cm", 60, 16, 55],
  ["MGC-EU-SARTEN-28-AZ", "Sartén Azul Oceánico 28 cm", 65, 16, 60],
  ["MGC-EU-LECHERA-16-AZ", "Olla lechera Azul Oceánico 16 cm", 53, 8, 45],
  ["MGC-EU-OLLA-20-AZ", "Olla Azul Oceánico 20 cm", 63, 8, 55],
  ["MGC-EU-OLLA-24-AZ", "Olla Azul Oceánico 24 cm", 73, 8, 65],
  ["MGC-SAHARA-NEGRO-SARTEN-20", "Sartén Sahara negro 20 cm", 55, 1, 39.99, "sahara-negro"],
  ["MGC-SAHARA-NEGRO-SARTEN-24", "Sartén Sahara negro 24 cm", 60, 1, 49.99, "sahara-negro"],
  ["MGC-SAHARA-NEGRO-SARTEN-28", "Sartén Sahara negro 28 cm", 65, 1, 59.99, "sahara-negro"],
  ["MGC-SAHARA-GRIS-SARTEN-20", "Sartén Sahara gris 20 cm", 55, 1, 39.99, "sahara-gris"],
  ["MGC-SAHARA-GRIS-SARTEN-24", "Sartén Sahara gris 24 cm", 60, 1, 49.99, "sahara-gris"],
  ["MGC-SAHARA-GRIS-SARTEN-28", "Sartén Sahara gris 28 cm", 65, 1, 59.99, "sahara-gris"],
  ["MGC-PALETA-WOK-DATAFAST-TEST", "Paleta para wok · prueba DataFast", 1, 1],
] satisfies CheckoutCatalogEntry[]

export const checkoutCatalogProducts = checkoutCatalogEntries.map(
  checkoutCatalogProduct,
)

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

/** Normaliza teléfono ecuatoriano a formato +593 para casar con el CRM. */
function toEcPhone(raw?: string): string | undefined {
  if (!raw) return undefined
  const digits = raw.replace(/[^\d+]/g, "")
  if (digits.startsWith("+")) return digits
  if (digits.startsWith("593")) return `+${digits}`
  if (digits.startsWith("0") && digits.length === 10)
    return `+593${digits.slice(1)}`
  if (digits.length === 9) return `+593${digits}`
  return digits ? `+${digits}` : undefined
}

function recentEventsFromCustomer(customer: unknown) {
  if (!customer || typeof customer !== "object") return []
  const events = (customer as { events?: unknown }).events
  return Array.isArray(events) ? events : []
}

function customerTags(customer: unknown) {
  if (!customer || typeof customer !== "object") return []
  const tags = (customer as { tags?: unknown }).tags
  return Array.isArray(tags)
    ? tags.filter((tag) => typeof tag === "string")
    : []
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
    return "Retomar el carrito pendiente y confirmar entrega antes del checkout DataFast."
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

function payloadWithMetadata(
  payload: unknown,
  metadata?: Record<string, unknown>,
) {
  if (!metadata || !Object.keys(metadata).length) return payload
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
          metadata.recommendedSku || metadata.productInterestSku || product.sku,
        videoSlot: metadata.videoSlot,
        city: metadata.city,
        householdPeople: metadata.householdPeople,
        journeyStage: metadata.journeyStage,
        campaignSlug: metadata.campaignSlug,
        couponClaimed: metadata.couponClaimed,
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
          : types.includes("checkout_started") ||
              types.includes("campaign_cta_click")
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
    campaignSlug: latestProduct?.campaignSlug,
    couponClaimed: latestProduct?.couponClaimed,
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
      customer,
      payload: event.payload,
      orderId: event.orderId,
      quoteId: event.quoteId,
      source: event.source,
      nextFollowupAt: patch.nextFollowupAt,
      followupReason: patch.followupReason,
      whatsappConsent: event.type === "opt_out" ? false : patch.whatsappConsent,
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

  async function recordTrackingEvent(input: ToolsEventInput) {
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
      name: input.customer?.name,
      email: input.customer?.email,
      whatsappConsent: input.customer?.whatsappConsent,
      tags,
      metadata: {
        ...(input.customer?.metadata || {}),
        ...(input.metadata || {}),
      },
    }

    if (config.crmBackend === "medusa") {
      await addMedusaCustomerEvent(config, {
        phone: identity,
        type,
        at: now,
        customer: input.customer,
        payload,
        metadata: input.metadata,
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
  }

  async function recordSaleFeedbackEvent(
    input: SaleFeedbackInput & {
      status: "payment_proof_received" | "paid"
    },
  ) {
    const products = await loadProducts(config)
    const product = products.find((item) => item.sku === input.sku)
    if (!product)
      throw new Error(`Producto no encontrado por SKU: ${input.sku}`)

    const amount = input.amount ?? product.price.amount
    const eventName = input.status === "paid" ? "Purchase" : "Lead"
    const eventId = `${input.status}:${input.phone}:${input.sku}:${Date.now()}`
    const source =
      input.source ||
      (input.status === "paid"
        ? "manual_sale_confirmation"
        : "manual_payment_review")

    return recordTrackingEvent({
      eventName,
      type: input.status,
      eventId,
      at: input.at,
      leadId: input.leadId,
      sessionId: input.sessionId,
      source,
      consent: input.consent,
      customer: {
        phone: input.phone,
        name: input.customerName,
        email: input.email,
        whatsappConsent: input.whatsappConsent,
        tags:
          input.status === "paid"
            ? ["cliente-pagado", "venta-confirmada"]
            : ["pago-en-revision", "comprobante-recibido"],
      },
      product: {
        productId: product.id,
        variantId: product.variantId,
        sku: product.sku,
        title: product.title,
        category: product.category,
        brand: product.brand,
        price: amount,
        currency: input.currency,
        quantity: input.quantity,
        material: product.material,
        diameterCm: product.diameterCm,
        promoLabel: product.promoLabel,
        stockSignal: product.stockSignal,
        deliveryBadge: product.deliveryBadge,
        freeShipping: product.freeShipping,
        paymentMethods: product.paymentMethods,
        couponCode: product.couponCode,
        stoveCompatibility: product.stoveCompatibility,
      },
      value: amount * input.quantity,
      currency: input.currency,
      metadata: {
        ...(input.metadata || {}),
        journeyStage:
          input.status === "paid" ? "cliente_pagado" : "pago_en_revision",
        leadId: input.leadId,
        campaignSlug: input.campaignSlug,
        productInterestSku: product.sku,
        paymentMethod: input.paymentMethod,
        orderId: input.orderId,
        quoteId: input.quoteId,
        notes: input.notes,
        confirmedBy: input.confirmedBy,
        requiresHumanApproval: input.status === "payment_proof_received",
      },
    })
  }

  async function resolveDatafastMedusaOrder(
    record: DatafastCheckoutRecord,
  ): Promise<DatafastCheckoutRecord> {
    if (config.crmBackend !== "medusa" || record.orderId) return record

    // Los checkouts creados antes de la orden pendiente pueden no guardar el
    // enlace. La referencia DataFast es también el external_id único del CRM.
    const linkedOrder = await getMedusaOrder(config, record.reference)
    if (!linkedOrder?.id) return record

    const linkedRecord = {
      ...record,
      orderId: linkedOrder.id,
      medusaOrderId: linkedOrder.medusaOrderId || record.medusaOrderId,
      updatedAt: new Date().toISOString(),
    }
    await upsertDatafastCheckout(config.dataDir, linkedRecord)
    return linkedRecord
  }

  // Con nombre para que un método pueda reutilizar a otro (el barrido de
  // pendientes reaprovecha `datafastResult`, que ya es idempotente) sin
  // depender de cómo se invoque el servicio desde fuera.
  const api = {
    /** Recupera pagos verificados tras reinicios o callbacks expirados. */
    async reconcileDatafastLedger() {
      if (config.crmBackend !== "medusa") {
        return { scanned: 0, synchronized: 0 }
      }

      const records = await readDatafastCheckouts(config.dataDir)
      let synchronized = 0
      let failed = 0
      for (const record of records) {
        try {
          const linkedRecord = await resolveDatafastMedusaOrder(record)
          if (linkedRecord.status !== "paid" || !linkedRecord.orderId) continue
          await updateMedusaPaymentStatus(config, linkedRecord.orderId, {
            status: "paid",
            payment: {
              reference: linkedRecord.reference,
              checkoutId: linkedRecord.checkoutId,
              code: linkedRecord.resultCode,
              paymentId: linkedRecord.paymentId,
              authorizationCode: linkedRecord.authorizationCode,
            },
          })
          synchronized += 1
        } catch (error) {
          failed += 1
          console.error(
            `[datafast] Medusa reconciliation failed for ${record.reference}:`,
            error instanceof Error ? error.message : error,
          )
        }
      }
      return { scanned: records.length, synchronized, failed }
    },

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

    /**
     * El enlace es un portador opaco y de un solo uso. El precio mostrado se
     * toma del catálogo actual; DataFast vuelve a validar cada SKU antes del
     * cobro, por lo que este objeto nunca autoriza un monto por sí mismo.
     */
    async createWhatsappCart(input: {
      phone: string
      customer: { name?: string; city?: string }
      items: Array<{ productId: string; variantId?: string; quantity: number }>
    }) {
      const products = await loadProducts(config)
      const lines: CartSessionLine[] = input.items.map((item) => {
        const product = products.find(
          (candidate) => candidate.id === item.productId &&
            (!item.variantId || candidate.variantId === item.variantId),
        )
        if (!product) throw new Error("Producto no disponible en el catálogo actual")
        if (product.stock < item.quantity) {
          throw new Error(`Stock insuficiente para ${product.title}`)
        }
        return {
          productId: product.id,
          variantId: product.variantId,
          sku: product.sku,
          title: product.title,
          quantity: item.quantity,
          price: product.price.amount,
          comboPrice: product.comboPrice?.amount,
          comboMinimumItems: product.comboMinimumItems,
          comboGroup: product.comboGroup,
          image: product.imageUrl,
          category: product.category,
        }
      })
      const session = await createCartSession(config.dataDir, {
        phone: toEcPhone(input.phone) || input.phone,
        customer: input.customer,
        items: lines,
      })
      const baseUrl = config.kitchenPublicUrl.replace(/\/$/, "")
      const cartUrl = `${baseUrl}/cart?session=${encodeURIComponent(session.token)}`
      await trackCustomerEvent(config, { phone: input.phone, name: input.customer.name, metadata: { city: input.customer.city, journeyStage: "carrito_enviado" } }, {
        type: "cart_link_sent",
        at: new Date().toISOString(),
        source: "whatsapp_ai",
        payload: { itemCount: lines.reduce((sum, line) => sum + line.quantity, 0), expiresAt: session.expiresAt },
      }, { metadata: { journeyStage: "carrito_enviado" } })
      return { cartUrl, expiresAt: session.expiresAt }
    },

    async consumeWhatsappCart(token: string) {
      return consumeCartSession(config.dataDir, token)
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

    // ─── Datafast: crear checkout + recordar contexto para confirmación ───
    async datafastCheckout(input: {
      reference?: string
      items: DatafastCheckoutInput["items"]
      customer?: DatafastCheckoutInput["customer"]
    }) {
      const reference = input.reference || `etn_${Date.now()}`
      // El navegador nunca define el valor cobrable. Recalculamos cada línea
      // contra el catálogo y aplicamos la misma regla del precio verde. En
      // pruebas se permiten fixtures sin SKU de catálogo; en producción no.
      const medusaCatalog = await loadProducts(config)
      // En producción no hay lista alternativa: un SKU que Medusa no conoce
      // no llega al formulario de DataFast. Los fixtures sólo existen para
      // pruebas locales con ALLOW_DEMO_CATALOG=true.
      const catalog = config.allowDemoCatalog
        ? [...medusaCatalog, ...checkoutCatalogProducts]
        : medusaCatalog
      const live = config.datafastEnv === "live"
      const requested = input.items.map((item) => {
        const sku = item.sku?.trim()
        const product = sku
          ? catalog.find(
              (candidate) => candidate.sku === sku || candidate.id === sku,
            )
          : undefined
        if (!product) {
          if (live || !config.allowDemoCatalog) {
            throw new Error(
              `Producto no reconocido en el catálogo: ${sku || item.title}`,
            )
          }
          return { item }
        }
        if (product.stock < item.quantity) {
          throw new Error(`Stock insuficiente para ${product.title}`)
        }
        return { item, product }
      })
      const comboGroups = new Map<string, { items: number; minimum: number }>()
      requested.forEach(({ item, product }) => {
        if (!product?.comboPrice) return
        const group = product.comboGroup || "general"
        const current = comboGroups.get(group) || {
          items: 0,
          minimum: product.comboMinimumItems || 3,
        }
        current.items += item.quantity
        current.minimum = Math.min(current.minimum, product.comboMinimumItems || 3)
        comboGroups.set(group, current)
      })
      const activeComboGroups = new Set(
        [...comboGroups].flatMap(([group, state]) =>
          state.items >= state.minimum ? [group] : [],
        ),
      )
      const pricedItems = requested.map(({ item, product }) =>
        product
          ? {
              title: product.title,
              sku: product.sku,
              quantity: item.quantity,
              unitPrice:
                product.comboPrice &&
                activeComboGroups.has(product.comboGroup || "general")
                  ? product.comboPrice.amount
                  : product.price.amount,
              description: product.description,
              zeroRated: item.zeroRated,
            }
          : { ...item },
      )
      const now = new Date().toISOString()
      const quote: Quote = {
        id: `datafast-${reference}`,
        lines: requested.map(({ item, product }, index) => {
          const priced = pricedItems[index]
          if (!priced) {
            throw new Error(`Producto no reconocido en el catálogo: ${item.sku || item.title}`)
          }
          // Sólo para fixtures locales. En producción el SKU ya fue rechazado
          // arriba si Medusa no lo devolvió.
          if (!product) {
            return {
              productId: item.sku || `fixture-${index}`,
              variantId: item.sku || `fixture-${index}`,
              sku: item.sku || item.title,
              title: item.title,
              quantity: item.quantity,
              unitPrice: { amount: priced.unitPrice, currency: "USD" as const },
              lineTotal: {
                amount: Math.round(priced.unitPrice * item.quantity * 100) / 100,
                currency: "USD" as const,
              },
            }
          }
          return {
            productId: product.id,
            variantId: product.variantId,
            sku: product.sku,
            title: product.title,
            quantity: item.quantity,
            unitPrice: { amount: priced.unitPrice, currency: "USD" },
            lineTotal: {
              amount: Math.round(priced.unitPrice * item.quantity * 100) / 100,
              currency: "USD",
            },
            reorderAfterDays: product.reorderAfterDays,
          }
        }),
        subtotal: {
          amount: Math.round(pricedItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0) * 100) / 100,
          currency: "USD",
        },
        tax: { amount: 0, currency: "USD" },
        total: { amount: 0, currency: "USD" },
        currency: "USD",
        whatsappMessage: "",
      }
      quote.total = { ...quote.subtotal }

      const customer = input.customer?.phone
        ? {
            phone: toEcPhone(input.customer.phone),
            name: [input.customer.givenName, input.customer.surname].filter(Boolean).join(" ") || undefined,
            email: input.customer.email,
            metadata: input.customer.street
              ? {
                  shippingAddress: {
                    street: input.customer.street,
                    city: input.customer.city,
                    countryCode: input.customer.countryCode || "EC",
                  },
                }
              : undefined,
          }
        : undefined
      const pendingOrder = config.crmBackend === "medusa"
        ? await createMedusaOrder(config, {
            externalId: reference,
            quote,
            customer,
            source: "datafast_web",
            notes: "Checkout DataFast iniciado; pendiente de confirmación.",
            paymentStatus: "pending_payment",
          })
        : undefined

      const checkout = await createDatafastCheckout(config, {
        reference,
        items: pricedItems,
        customer: input.customer,
      })
      await upsertDatafastCheckout(config.dataDir, {
        reference,
        checkoutId: checkout.checkoutId,
        amount: checkout.amount,
        status: "pending",
        registered: false,
        orderId: pendingOrder?.id,
        medusaOrderId: pendingOrder?.medusaOrderId,
        customer: {
          phone: toEcPhone(input.customer?.phone),
          name:
            [input.customer?.givenName, input.customer?.surname]
              .filter(Boolean)
              .join(" ")
              .trim() || undefined,
          email: input.customer?.email,
        },
        items: pricedItems.map((it) => ({
          title: it.title,
          sku: it.sku,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
        })),
        createdAt: now,
        updatedAt: now,
      })
      return { reference, ...checkout }
    },

    // ─── Datafast: consultar resultado + registrar venta en CRM (idempotente) ───
    async datafastResult(checkoutId: string, resourcePath?: string) {
      const result = await getDatafastResult(config, checkoutId, resourcePath)
      const storedRecord = await findDatafastCheckout(config.dataDir, checkoutId)
      const record = storedRecord
        ? await resolveDatafastMedusaOrder(storedRecord)
        : undefined

      // DataFast puede dejar de exponer un checkout antiguo. Si el ledger ya
      // conserva una aprobación verificada, esa venta sigue siendo válida y
      // debe completar la sincronización nativa de Medusa al reconsultarla.
      if (
        record?.status === "paid" &&
        record.orderId &&
        config.crmBackend === "medusa"
      ) {
        await updateMedusaPaymentStatus(config, record.orderId, {
          status: "paid",
          payment: {
            reference: record.reference,
            checkoutId,
            code: record.resultCode,
            paymentId: record.paymentId,
            authorizationCode: record.authorizationCode,
          },
        })
        return {
          ...result,
          status: "paid" as const,
          code: record.resultCode || result.code,
          description: record.resultDescription || result.description,
          reference: record.resultReference || record.reference,
          paymentBrand: record.paymentBrand || result.paymentBrand,
        }
      }

      if (
        result.status === "paid" &&
        record &&
        !inflightDatafastResults.has(record.reference)
      ) {
        inflightDatafastResults.add(record.reference)
        try {
        const now = new Date().toISOString()
        const isFirstRegistration = !record.registered
        if (!record.registered && record.customer?.phone) {
          const purchasedProducts: PurchasedProduct[] = record.items.map(
            (it) => ({
              productId: it.sku || it.title,
              sku: it.sku || it.title,
              title: it.title,
              quantity: it.quantity,
              purchasedAt: now,
            }),
          )
          const freq = nextReorderDays(purchasedProducts)
          await trackCustomerEvent(
            config,
            {
              phone: record.customer.phone,
              name: record.customer.name,
              email: record.customer.email,
            },
            {
              type: "paid",
              at: now,
              orderId: record.reference,
              source: "datafast",
              payload: { checkoutId, amount: record.amount, code: result.code },
            },
            {
              lastPurchaseAt: now,
              purchasedProducts,
              suggestedFrequencyDays: freq,
              nextFollowupAt: addDays(now, freq),
              followupReason: "recompra_datafast",
            },
          )
          // El Purchase de Meta se dispara más abajo, en el mismo punto de
          // registro único (isFirstRegistration): ver sendDatafastPurchaseToMeta.
        }
        // La orden se creó al iniciar el checkout. Aquí sólo se marca el
        // resultado; por eso una recarga o callback duplicado no duplica nada.
        let orderId = record.orderId
        let medusaOrderId = record.medusaOrderId
        try {
          const quote: Quote = {
            id: `datafast-${record.reference}`,
            lines: record.items.map((item) => ({
              productId: item.sku || item.title,
              variantId: item.sku || item.title,
              sku: item.sku || item.title,
              title: item.title,
              quantity: item.quantity,
              unitPrice: { amount: item.unitPrice, currency: "USD" },
              lineTotal: {
                amount: Math.round(item.unitPrice * item.quantity * 100) / 100,
                currency: "USD",
              },
            })),
            subtotal: { amount: record.amount, currency: "USD" },
            tax: { amount: 0, currency: "USD" },
            total: { amount: record.amount, currency: "USD" },
            currency: "USD",
            whatsappMessage: "",
          }
          const orderCustomer = record.customer?.phone
            ? {
                phone: record.customer.phone,
                name: record.customer.name,
                email: record.customer.email,
              }
            : undefined
          const notes = `PAGADO con tarjeta (Datafast ${result.code}). Ref ${record.reference}${
            result.paymentId ? ` · paymentId ${result.paymentId}` : ""
          }${result.authorizationCode ? ` · aut. ${result.authorizationCode}` : ""}`
          if (orderId && config.crmBackend === "medusa") {
            await updateMedusaPaymentStatus(config, orderId, {
              status: "paid",
              payment: {
                reference: record.reference,
                checkoutId,
                code: result.code,
                paymentId: result.paymentId,
                authorizationCode: result.authorizationCode,
              },
            })
          } else if (!orderId && config.crmBackend === "medusa") {
            const order = await createMedusaOrder(config, {
              externalId: record.reference,
              quote,
              customer: orderCustomer,
              source: "datafast_web",
              notes,
              paymentStatus: "paid",
            })
            orderId = order.id
            medusaOrderId = order.medusaOrderId
          } else if (!orderId) {
            const order: OrderRecord = {
              id: record.reference,
              quote,
              customer: orderCustomer || {},
              status: "paid",
              createdAt: now,
              updatedAt: now,
              events: [
                { type: "created", at: now, payload: { source: "datafast_web" } },
                { type: "paid", at: now, payload: { code: result.code, paymentId: result.paymentId } },
              ],
            }
            await upsertOrder(config.dataDir, order)
            orderId = order.id
          }
          if (isFirstRegistration && orderId && record.customer?.phone) {
            void notifyPurchaseByWhatsapp(config, {
              phone: record.customer.phone,
              name: record.customer.name,
              orderId,
              total: record.amount,
              items: record.items.map((it) => ({ title: it.title, quantity: it.quantity })),
            })
          }
          // El Purchase de Meta va fuera del try de creación de pedido: el
          // cobro está aprobado aunque Medusa falle, y la conversión debe
          // reportarse igual.
        } catch (cause) {
          // El pedido/aviso no debe romper la confirmación del pago:
          // la venta ya quedó registrada en el CRM y en el ledger.
          console.error(
            `[datafast] fallo creando pedido/aviso para ${record.reference}:`,
            cause instanceof Error ? cause.message : cause,
          )
        }
        if (isFirstRegistration) {
          await sendDatafastPurchaseToMeta(config, record, result)
        }
        await upsertDatafastCheckout(config.dataDir, {
          ...record,
          status: "paid",
          registered: true,
          orderId,
          medusaOrderId,
          resultCode: result.code,
          resultDescription: result.description,
          resultReference: result.reference,
          paymentBrand: result.paymentBrand,
          paymentId: result.paymentId,
          ndc: result.ndc,
          authorizationCode: result.authorizationCode,
          updatedAt: now,
        })
        } finally {
          inflightDatafastResults.delete(record.reference)
        }
      } else if (result.status === "failed" && record && record.status === "pending") {
        if (record.orderId && config.crmBackend === "medusa") {
          await updateMedusaPaymentStatus(config, record.orderId, {
            status: "payment_failed",
            payment: {
              reference: record.reference,
              checkoutId,
              code: result.code,
              paymentId: result.paymentId,
              authorizationCode: result.authorizationCode,
            },
          })
        }
        await upsertDatafastCheckout(config.dataDir, {
          ...record,
          status: "failed",
          resultCode: result.code,
          resultDescription: result.description,
          resultReference: result.reference,
          paymentBrand: result.paymentBrand,
          paymentId: result.paymentId,
          ndc: result.ndc,
          authorizationCode: result.authorizationCode,
          updatedAt: new Date().toISOString(),
        })
      }

      return result
    },

    // ─── Datafast: anulación (paymentType=RF, guía §7) — script de certificación ───
    async datafastVoid(input: {
      paymentId: string
      amount: number
      currency?: string
    }) {
      return voidDatafastPayment(
        config,
        input.paymentId,
        input.amount,
        input.currency || "USD",
      )
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

    async isWhatsappAiPaused(phone: string) {
      if (config.crmBackend !== "medusa") return false
      const conversation = await getMedusaConversationByPhone(config, phone)
      return conversation?.mode === "human"
    },

    async addCustomerEvent(input: {
      phone: string
      type: CustomerEventRecord["type"]
      at?: string
      customer?: CustomerInput
      payload?: unknown
      metadata?: Record<string, unknown>
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
      const tags =
        input.customer?.tags?.length || input.tags?.length
          ? [
              ...new Set([
                ...(input.customer?.tags || []),
                ...(input.tags || []),
              ]),
            ]
          : undefined
      const customer = await upsertCustomer(config.dataDir, {
        phone: input.phone,
        name: input.customer?.name,
        email: input.customer?.email,
        whatsappConsent:
          input.whatsappConsent ?? input.customer?.whatsappConsent,
        tags,
        metadata: {
          ...(input.customer?.metadata || {}),
          ...(input.metadata || {}),
        },
      })
      const updated = await addCustomerEvent(
        config.dataDir,
        customer.phone,
        {
          type: input.type,
          at,
          payload: payloadWithMetadata(input.payload, input.metadata),
          orderId: input.orderId,
          quoteId: input.quoteId,
          source: input.source || "manual",
        },
        {
          name: input.customer?.name,
          email: input.customer?.email,
          whatsappConsent:
            input.type === "opt_out"
              ? false
              : (input.whatsappConsent ?? input.customer?.whatsappConsent),
          nextFollowupAt: input.nextFollowupAt,
          followupReason: input.followupReason,
          metadata: {
            ...(input.customer?.metadata || {}),
            ...(input.metadata || {}),
          },
          tags,
        },
      )
      return updated
    },

    async recordEvent(input: ToolsEventInput) {
      return recordTrackingEvent(input)
    },

    async recordSaleFeedback(
      input: SaleFeedbackInput & {
        status: "payment_proof_received" | "paid"
      },
    ) {
      return recordSaleFeedbackEvent(input)
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
          "campaign_cta_click",
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
      const reasonIncludes = (
        customer: { reason?: string },
        values: string[],
      ) => values.some((value) => customer.reason?.includes(value))

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

    /**
     * Cobros aprobados de los que nunca nos enteramos.
     *
     * `datafastResult` solo corre cuando el navegador vuelve a
     * /checkout/resultado. Si al cliente se le cae la conexión, cierra la
     * pestaña o el banco tarda más que su paciencia, el cargo a la tarjeta
     * existe y nosotros nos quedamos con el checkout en `pending`: sin pedido,
     * sin evento en el CRM, sin aviso por WhatsApp y sin Purchase a Meta.
     *
     * Este barrido le pregunta a Datafast por los pendientes y los resuelve
     * por el mismo camino que el callback del navegador, que ya es idempotente
     * (`registered` + `inflightDatafastResults`), así que un cobro no puede
     * registrarse dos veces aunque el cliente vuelva justo a la vez.
     *
     * Nunca lanza: es un trabajo de fondo, un fallo suyo no puede tumbar el
     * servicio que está cobrando.
     */
    async reconcilePendingDatafastCheckouts(
      options: { asOf?: string; maxPerRun?: number } = {},
    ) {
      const now = options.asOf ? Date.parse(options.asOf) : Date.now()
      const maxPerRun = options.maxPerRun ?? DATAFAST_PENDING_MAX_PER_RUN
      const records = await readDatafastCheckouts(config.dataDir)

      const candidates = records
        .filter((record) => record.status === "pending")
        .filter((record) => {
          const age = now - Date.parse(record.createdAt)
          if (!Number.isFinite(age)) return false
          // Ni recién nacidos (el cliente puede seguir en el widget) ni
          // fósiles: Datafast deja de exponer los checkouts viejos y seguir
          // preguntando por ellos es ruido en cada arranque.
          return age >= DATAFAST_PENDING_GRACE_MS && age <= DATAFAST_PENDING_MAX_AGE_MS
        })
        .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt))
        .slice(0, maxPerRun)

      let recovered = 0
      let stillPending = 0
      let failed = 0

      for (const record of candidates) {
        try {
          const result = await api.datafastResult(record.checkoutId)
          if (result.status === "paid") recovered += 1
          else stillPending += 1
        } catch {
          // Un checkout que Datafast ya no reconoce no debe cortar el barrido
          // del resto.
          failed += 1
        }
      }

      return { scanned: candidates.length, recovered, stillPending, failed }
    },
  }

  return api
}

// ─── Aviso de compra por WhatsApp Cloud API ─────────────────────────────────
// Nunca lanza: si la mensajería no está disponible, el pago se confirma igual.
async function notifyPurchaseByWhatsapp(
  config: AppConfig,
  input: {
    phone: string
    name?: string
    orderId: string
    total?: number
    items: Array<{ title: string; quantity: number }>
  },
) {
  const firstName = input.name?.trim().split(/\s+/)[0]
  const lines = input.items
    .map((it) => `• ${it.quantity}× ${it.title}`)
    .join("\n")
  const message =
    `¡Hola${firstName ? ` ${firstName}` : ""}! Soy Vicky de Eter Niu 🌿\n` +
    `Tu pago con tarjeta fue aprobado ✅\n\n` +
    `Pedido ${input.orderId}${
      typeof input.total === "number" ? ` · $${input.total.toFixed(2)}` : ""
    }\n${lines}\n\n` +
    `Por este chat te aviso apenas tu pedido salga con Servientrega. ` +
    `¡Gracias por tu compra!`
  try {
    await sendWhatsappFreeform(config, input.phone.replace(/^\+/, ""), message)
  } catch {
    // El aviso no debe romper la confirmación del pago.
  }
}

// ─── Purchase de Meta (CAPI) del pago con tarjeta ───────────────────────────
/**
 * Se dispara AQUÍ y no en el navegador, por dos motivos:
 *
 * 1. El storefront no puede declarar una compra. `/api/events` es público, así
 *    que cualquiera podía inyectar un `Purchase` con el valor que quisiera y
 *    Meta optimizaba las campañas contra esa señal falsa.
 * 2. Un `Purchase` disparado en el render del resultado se pierde si el cliente
 *    cierra la pestaña o se le corta la conexión — justo el caso en que sí pagó.
 *
 * El monto y los ítems salen del ledger (lo COBRADO), no del carrito del
 * cliente. `event_id` es estable por referencia: si Meta recibe el mismo evento
 * dos veces lo deduplica. Solo cuenta la aprobación de PRODUCCIÓN
 * (`000.000.000`); los códigos del script de certificación de Datafast no
 * contaminan las campañas.
 *
 * Nunca lanza: el pago ya está aprobado y confirmado al cliente.
 */
async function sendDatafastPurchaseToMeta(
  config: AppConfig,
  record: DatafastCheckoutRecord,
  result: { code?: string },
) {
  if (result.code !== "000.000.000") return
  try {
    await sendMetaConversionEvent(
      config,
      {
        eventName: "Purchase",
        type: "purchase_confirmed",
        source: "datafast",
        currency: "USD",
        value: record.amount,
        customer: {
          phone: record.customer?.phone,
          email: record.customer?.email,
          name: record.customer?.name,
        },
        products: record.items.map((item) => ({
          productId: item.sku || item.title,
          sku: item.sku,
          title: item.title,
          quantity: item.quantity,
          price: item.unitPrice,
          currency: "USD",
        })),
        metadata: { reference: record.reference, provider: "datafast" },
      } as ToolsEventInput,
      `datafast_purchase_${record.reference}`,
    )
  } catch {
    // Meta caída no debe romper la confirmación del pago.
  }
}
