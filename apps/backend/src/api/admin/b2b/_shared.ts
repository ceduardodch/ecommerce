import type { MedusaRequest } from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
  OrderStatus,
} from "@medusajs/framework/utils"
import {
  createCustomersWorkflow,
  createOrderWorkflow,
} from "@medusajs/medusa/core-flows"
import { B2B_CRM_MODULE } from "../../../modules/b2b-crm"
import type B2bCrmModuleService from "../../../modules/b2b-crm/service"
import type { CrmCustomerInput } from "../../../modules/b2b-crm/types"

type CustomerPayload = {
  name?: string
  phone?: string
  email?: string
  whatsappConsent?: boolean
  tags?: string[]
}

type QuoteLinePayload = {
  productId: string
  variantId?: string
  sku: string
  title: string
  quantity: number
  unitPrice: { amount: number; currency: string }
  lineTotal: { amount: number; currency: string }
  reorderAfterDays?: number
}

export type B2bOrderPayload = {
  externalId?: string
  quote: {
    id: string
    lines: QuoteLinePayload[]
    total: { amount: number; currency: string }
    currency: string
  }
  customer?: CustomerPayload
  source?: string
  notes?: string
  regionId?: string
  currencyCode?: string
}

export function crmService(req: MedusaRequest) {
  return req.scope.resolve(B2B_CRM_MODULE) as B2bCrmModuleService
}

export function normalizePhone(phone: string) {
  const trimmed = phone.trim()
  if (/^(lead|session):[a-z0-9:_-]+$/i.test(trimmed)) {
    return trimmed.toLowerCase()
  }
  return trimmed.replace(/[^\d+]/g, "")
}

function iso(value?: Date | string | null) {
  if (!value) return undefined
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString()
}

export function serializeCustomer(customer: any) {
  if (!customer) return undefined

  return {
    phone: customer.phone,
    name: customer.name,
    email: customer.email,
    medusaCustomerId: customer.medusa_customer_id,
    whatsappConsent: customer.whatsapp_consent,
    tags: customer.tags || [],
    lastPurchaseAt: iso(customer.last_purchase_at),
    purchasedProducts: customer.purchased_products || [],
    suggestedFrequencyDays: customer.suggested_frequency_days,
    nextFollowupAt: iso(customer.next_followup_at),
    followupReason: customer.followup_reason,
    createdAt: iso(customer.created_at),
    updatedAt: iso(customer.updated_at),
    suggestedMessage: buildFollowupDraft(customer),
  }
}

export function serializeEvent(event: any) {
  return {
    type: event.type,
    at: iso(event.at),
    payload: event.payload,
    orderId: event.order_id,
    quoteId: event.quote_id,
    medusaOrderId: event.medusa_order_id,
    source: event.source,
    phone: event.phone,
  }
}

export function serializeOrder(order: any) {
  if (!order) return undefined

  return {
    id: order.external_id,
    medusaOrderId: order.medusa_order_id,
    medusaDraftOrderId: order.medusa_draft_order_id,
    quote: order.quote || {},
    customer: order.customer || {},
    status: order.status,
    paymentLink: order.payment_link,
    clientTransactionId: order.client_transaction_id,
    createdAt: iso(order.created_at),
    updatedAt: iso(order.updated_at),
    events: order.events || [],
  }
}

export function buildFollowupDraft(customer: any) {
  const products = customer.purchased_products || []
  const lastProduct = products[products.length - 1]
  const firstName = customer.name ? String(customer.name).split(" ")[0] : ""
  const greeting = firstName ? `Hola ${firstName}` : "Hola"

  if (lastProduct?.title) {
    return `${greeting}, vi que compraste ${lastProduct.title}. Te puedo ayudar con mantenimiento, complemento o reposicion para que sigas equipando tu cocina?`
  }

  return `${greeting}, tenemos nuevas opciones de ollas, cuchillos y combos de cocina. Te preparo una cotizacion corta por WhatsApp?`
}

function generatedEmail(phone?: string) {
  const normalized = phone ? normalizePhone(phone).replace(/[^\d]/g, "") : ""
  return normalized
    ? `wa-${normalized}@customers.shop.b2b.com.ec`
    : `wa-${Date.now()}@customers.shop.b2b.com.ec`
}

function customerNameParts(name?: string) {
  if (!name) return { first_name: "Cliente", last_name: "WhatsApp" }
  const [firstName, ...rest] = name.trim().split(/\s+/)
  return {
    first_name: firstName || "Cliente",
    last_name: rest.join(" ") || "WhatsApp",
  }
}

export async function findOrCreateMedusaCustomer(
  req: MedusaRequest,
  customer: CustomerPayload = {},
) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const email = customer.email || generatedEmail(customer.phone)

  const { data } = await query.graph({
    entity: "customer",
    fields: ["id", "email", "phone"],
    filters: { email },
    pagination: { take: 1 },
  })

  if (data?.[0]) return data[0]

  const createCustomers = createCustomersWorkflow(req.scope)
  const { result } = await createCustomers.run({
    input: {
      customersData: [
        {
          email,
          phone: customer.phone ? normalizePhone(customer.phone) : undefined,
          ...customerNameParts(customer.name),
          created_by:
            (req as unknown as { auth_context?: { actor_id?: string } })
              .auth_context?.actor_id || "b2b-tools",
          metadata: {
            source: "whatsapp",
            whatsapp_consent: customer.whatsappConsent || false,
          },
        },
      ],
    },
  })

  return result[0]
}

export async function firstRegion(req: MedusaRequest, preferredId?: string) {
  if (preferredId) return { id: preferredId, currency_code: "usd" }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const usdRegion = await query.graph({
    entity: "region",
    fields: ["id", "currency_code"],
    filters: { currency_code: "usd" },
    pagination: { take: 1 },
  })

  if (usdRegion.data?.[0]) {
    return usdRegion.data[0]
  }

  const { data } = await query.graph({
    entity: "region",
    fields: ["id", "currency_code"],
    pagination: { take: 1 },
  })

  if (!data?.[0]) {
    throw new Error("No hay region Medusa configurada para crear ordenes")
  }

  return data[0]
}

export async function createMedusaDraftOrder(
  req: MedusaRequest,
  input: B2bOrderPayload,
  medusaCustomer: { id: string; email?: string | null },
) {
  const region = await firstRegion(req, input.regionId)
  const currencyCode =
    input.currencyCode ||
    input.quote.currency?.toLowerCase() ||
    region.currency_code ||
    "usd"

  const workflowInput = {
      status: OrderStatus.DRAFT,
      is_draft_order: true,
      region_id: region.id,
      currency_code: currencyCode,
      email: medusaCustomer.email || undefined,
      customer_id: medusaCustomer.id,
      no_notification: true,
      items: input.quote.lines.map((line) => ({
        title: line.title,
        variant_id: line.variantId?.startsWith("variant_")
          ? line.variantId
          : undefined,
        variant_sku: line.sku,
        unit_price: line.unitPrice.amount,
        quantity: line.quantity,
        metadata: {
          source: input.source || "whatsapp",
          product_id: line.productId,
          sku: line.sku,
          reorder_after_days: line.reorderAfterDays,
        },
      })),
      metadata: {
        source: input.source || "whatsapp",
        notes: input.notes,
        quote_id: input.quote.id,
        external_order_id: input.externalId,
        channel: "b2b_ecommerce_tools",
      },
    }

  const { result } = await createOrderWorkflow(req.scope).run({
    input: workflowInput as any,
  })

  return result
}

export function customerInputFromPayload(
  payload: CustomerPayload | undefined,
  medusaCustomerId?: string,
): CrmCustomerInput | undefined {
  if (!payload?.phone) return undefined

  return {
    phone: payload.phone,
    name: payload.name,
    email: payload.email,
    medusaCustomerId,
    whatsappConsent: payload.whatsappConsent,
    tags: payload.tags,
  }
}
