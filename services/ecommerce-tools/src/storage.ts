import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import type { OrderRecord } from "./types.js"

async function ensureDir(dataDir: string) {
  await mkdir(dataDir, { recursive: true })
}

function ordersPath(dataDir: string) {
  return path.join(dataDir, "orders.json")
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
  clientTransactionId: string
) {
  const orders = await readOrders(dataDir)
  return orders.find((order) => order.clientTransactionId === clientTransactionId)
}
