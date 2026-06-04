import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import type {
  CustomerEventRecord,
  CustomerInput,
  CustomerRecord,
  OrderRecord,
  PurchasedProduct,
} from "./types.js"

async function ensureDir(dataDir: string) {
  await mkdir(dataDir, { recursive: true })
}

function ordersPath(dataDir: string) {
  return path.join(dataDir, "orders.json")
}

function customersPath(dataDir: string) {
  return path.join(dataDir, "customers.json")
}

export function normalizePhone(phone: string) {
  const trimmed = phone.trim()
  if (/^(lead|session):[a-z0-9:_-]+$/i.test(trimmed)) {
    return trimmed.toLowerCase()
  }
  return trimmed.replace(/[^\d+]/g, "")
}

export async function readOrders(dataDir: string): Promise<OrderRecord[]> {
  await ensureDir(dataDir)
  try {
    const raw = await readFile(ordersPath(dataDir), "utf8")
    return JSON.parse(raw) as OrderRecord[]
  } catch {
    return []
  }
}

export async function writeOrders(dataDir: string, orders: OrderRecord[]) {
  await ensureDir(dataDir)
  await writeFile(ordersPath(dataDir), `${JSON.stringify(orders, null, 2)}\n`)
}

export async function upsertOrder(dataDir: string, order: OrderRecord) {
  const orders = await readOrders(dataDir)
  const index = orders.findIndex((candidate) => candidate.id === order.id)
  if (index >= 0) {
    orders[index] = order
  } else {
    orders.push(order)
  }
  await writeOrders(dataDir, orders)
  return order
}

export async function findOrder(dataDir: string, orderId: string) {
  const orders = await readOrders(dataDir)
  return orders.find((order) => order.id === orderId)
}

export async function findOrderByClientTransaction(
  dataDir: string,
  clientTransactionId: string,
) {
  const orders = await readOrders(dataDir)
  return orders.find(
    (order) => order.clientTransactionId === clientTransactionId,
  )
}

export async function readCustomers(
  dataDir: string,
): Promise<CustomerRecord[]> {
  await ensureDir(dataDir)
  try {
    const raw = await readFile(customersPath(dataDir), "utf8")
    return JSON.parse(raw) as CustomerRecord[]
  } catch {
    return []
  }
}

export async function writeCustomers(
  dataDir: string,
  customers: CustomerRecord[],
) {
  await ensureDir(dataDir)
  await writeFile(
    customersPath(dataDir),
    `${JSON.stringify(customers, null, 2)}\n`,
  )
}

export async function findCustomer(dataDir: string, phone: string) {
  const normalized = normalizePhone(phone)
  const customers = await readCustomers(dataDir)
  return customers.find((customer) => customer.phone === normalized)
}

export async function upsertCustomer(
  dataDir: string,
  input: CustomerInput & {
    lastPurchaseAt?: string
    purchasedProducts?: PurchasedProduct[]
    suggestedFrequencyDays?: number
    nextFollowupAt?: string
    followupReason?: string
    events?: CustomerEventRecord[]
  },
) {
  if (!input.phone) throw new Error("Cliente requiere telefono")

  const now = new Date().toISOString()
  const normalized = normalizePhone(input.phone)
  const customers = await readCustomers(dataDir)
  const index = customers.findIndex((customer) => customer.phone === normalized)
  const existing = index >= 0 ? customers[index] : undefined
  const mergedTags = [
    ...new Set(
      [...(existing?.tags || []), ...(input.tags || [])].filter(Boolean),
    ),
  ]

  const record: CustomerRecord = {
    phone: normalized,
    name: input.name || existing?.name,
    email: input.email || existing?.email,
    whatsappConsent:
      input.whatsappConsent !== undefined
        ? input.whatsappConsent
        : existing?.whatsappConsent || false,
    tags: mergedTags,
    lastPurchaseAt: input.lastPurchaseAt || existing?.lastPurchaseAt,
    purchasedProducts: [
      ...(existing?.purchasedProducts || []),
      ...(input.purchasedProducts || []),
    ],
    suggestedFrequencyDays:
      input.suggestedFrequencyDays || existing?.suggestedFrequencyDays,
    nextFollowupAt: input.nextFollowupAt || existing?.nextFollowupAt,
    followupReason: input.followupReason || existing?.followupReason,
    metadata: {
      ...(existing?.metadata || {}),
      ...(input.metadata || {}),
    },
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    events: [...(existing?.events || []), ...(input.events || [])],
  }

  if (index >= 0) {
    customers[index] = record
  } else {
    customers.push(record)
  }

  await writeCustomers(dataDir, customers)
  return record
}

export async function addCustomerEvent(
  dataDir: string,
  phone: string,
  event: CustomerEventRecord,
  patch: Partial<CustomerRecord> = {},
) {
  const customer = await upsertCustomer(dataDir, { phone })
  const updated: CustomerRecord = {
    ...customer,
    phone: customer.phone,
    name: patch.name || customer.name,
    email: patch.email || customer.email,
    whatsappConsent: patch.whatsappConsent ?? customer.whatsappConsent,
    tags: patch.tags || customer.tags,
    lastPurchaseAt: patch.lastPurchaseAt || customer.lastPurchaseAt,
    purchasedProducts: patch.purchasedProducts || customer.purchasedProducts,
    suggestedFrequencyDays:
      patch.suggestedFrequencyDays || customer.suggestedFrequencyDays,
    nextFollowupAt: patch.nextFollowupAt || customer.nextFollowupAt,
    followupReason: patch.followupReason || customer.followupReason,
    metadata: {
      ...(customer.metadata || {}),
      ...(patch.metadata || {}),
    },
    createdAt: customer.createdAt,
    events: [...customer.events, event],
    updatedAt: new Date().toISOString(),
  }

  const customers = await readCustomers(dataDir)
  const index = customers.findIndex(
    (candidate) => candidate.phone === updated.phone,
  )
  if (index >= 0) customers[index] = updated
  await writeCustomers(dataDir, customers)
  return updated
}

export async function listDueFollowups(
  dataDir: string,
  asOfIso: string,
  limit = 50,
) {
  const asOf = Date.parse(asOfIso)
  const customers = await readCustomers(dataDir)
  return customers
    .filter((customer) => {
      if (!customer.whatsappConsent || !customer.nextFollowupAt) return false
      const dueAt = Date.parse(customer.nextFollowupAt)
      return Number.isFinite(dueAt) && dueAt <= asOf
    })
    .sort((a, b) =>
      String(a.nextFollowupAt).localeCompare(String(b.nextFollowupAt)),
    )
    .slice(0, limit)
}
