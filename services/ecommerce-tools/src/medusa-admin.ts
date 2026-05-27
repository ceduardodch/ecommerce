import type { AppConfig } from "./config.js"
import type { CustomerEventRecord, CustomerInput, OrderRecord } from "./types.js"

function authHeader(config: AppConfig) {
  if (!config.medusaAdminApiKey) {
    throw new Error("MEDUSA_ADMIN_API_KEY required for Medusa CRM backend")
  }

  return `Basic ${Buffer.from(`${config.medusaAdminApiKey}:`).toString("base64")}`
}

async function medusaAdminFetch<T>(
  config: AppConfig,
  path: string,
  init: RequestInit = {},
) {
  const response = await fetch(new URL(path, config.medusaAdminApiUrl), {
    ...init,
    headers: {
      "content-type": "application/json",
      authorization: authHeader(config),
      ...(init.headers || {}),
    },
  })

  if (!response.ok) {
    const body = await response.text().catch(() => "")
    throw new Error(`Medusa admin ${path} failed: ${response.status} ${body}`)
  }

  return (await response.json()) as T
}

export async function createMedusaOrder(
  config: AppConfig,
  input: {
    quote: OrderRecord["quote"]
    customer?: CustomerInput
    source?: string
    notes?: string
  },
) {
  const result = await medusaAdminFetch<{ order: OrderRecord }>(
    config,
    "/admin/b2b/orders",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  )

  return result.order
}

export async function getMedusaOrder(config: AppConfig, orderId: string) {
  const result = await medusaAdminFetch<{ order: OrderRecord }>(
    config,
    `/admin/b2b/orders/${encodeURIComponent(orderId)}`,
  )

  return result.order
}

export async function attachMedusaPaymentLink(
  config: AppConfig,
  orderId: string,
  input: {
    paymentLink: string
    clientTransactionId: string
    payload?: unknown
  },
) {
  const result = await medusaAdminFetch<{ order: OrderRecord }>(
    config,
    `/admin/b2b/orders/${encodeURIComponent(orderId)}/payment-link`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  )

  return result.order
}

export async function forwardPayphoneWebhook(
  config: AppConfig,
  payload: Record<string, unknown>,
) {
  return medusaAdminFetch<{
    matched: boolean
    status: string
    order?: OrderRecord
    payload?: Record<string, unknown>
  }>(config, "/admin/b2b/orders/payphone-webhook", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function importMedusaCustomers(
  config: AppConfig,
  customers: unknown[],
) {
  return medusaAdminFetch<{ imported: number; customers: unknown[] }>(
    config,
    "/admin/b2b/crm/customers",
    {
      method: "POST",
      body: JSON.stringify({ customers }),
    },
  )
}

export async function getMedusaCustomer(config: AppConfig, phone: string) {
  const result = await medusaAdminFetch<{ customer: unknown }>(
    config,
    `/admin/b2b/crm/customers/${encodeURIComponent(phone)}`,
  )

  return result.customer
}

export async function addMedusaCustomerEvent(
  config: AppConfig,
  input: {
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
  },
) {
  const result = await medusaAdminFetch<{ customer: unknown }>(
    config,
    "/admin/b2b/crm/events",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  )

  return result.customer
}

export async function listMedusaDueFollowups(
  config: AppConfig,
  input: { asOf?: string; limit?: number },
) {
  const url = new URL("/admin/b2b/crm/followups/due", config.medusaAdminApiUrl)
  if (input.asOf) url.searchParams.set("asOf", input.asOf)
  if (input.limit) url.searchParams.set("limit", String(input.limit))

  const result = await medusaAdminFetch<{ customers: unknown[] }>(
    config,
    `${url.pathname}${url.search}`,
  )

  return result.customers
}

export async function getMedusaDashboard(
  config: AppConfig,
  input: { asOf?: string },
) {
  const url = new URL("/admin/b2b/crm/dashboard", config.medusaAdminApiUrl)
  if (input.asOf) url.searchParams.set("asOf", input.asOf)

  return medusaAdminFetch<unknown>(config, `${url.pathname}${url.search}`)
}
