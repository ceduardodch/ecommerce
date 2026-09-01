import { createHash, randomBytes } from "node:crypto"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"

export type CartSessionLine = {
  productId: string
  variantId: string
  sku: string
  title: string
  quantity: number
  price: number
  comboPrice?: number
  comboMinimumItems?: number
  comboGroup?: string
  image?: string
  category?: string
}

export type CartSession = {
  tokenHash: string
  phone: string
  customer: { name?: string; city?: string }
  items: CartSessionLine[]
  createdAt: string
  expiresAt: string
  consumedAt?: string
}

function filePath(dataDir: string) {
  return path.join(dataDir, "whatsapp-cart-sessions.json")
}

function hash(token: string) {
  return createHash("sha256").update(token).digest("hex")
}

async function readAll(dataDir: string): Promise<CartSession[]> {
  try {
    return JSON.parse(await readFile(filePath(dataDir), "utf8")) as CartSession[]
  } catch {
    return []
  }
}

async function writeAll(dataDir: string, sessions: CartSession[]) {
  await mkdir(dataDir, { recursive: true })
  await writeFile(filePath(dataDir), `${JSON.stringify(sessions, null, 2)}\n`, "utf8")
}

/** Creates an opaque bearer token. Only its SHA-256 hash is persisted. */
export async function createCartSession(
  dataDir: string,
  input: Omit<CartSession, "tokenHash" | "createdAt" | "expiresAt">,
  now = new Date(),
) {
  const token = randomBytes(32).toString("base64url")
  const createdAt = now.toISOString()
  const expiresAt = new Date(now.getTime() + 30 * 60 * 1000).toISOString()
  const all = (await readAll(dataDir)).filter(
    (session) => Date.parse(session.expiresAt) > now.getTime(),
  )
  all.push({ ...input, tokenHash: hash(token), createdAt, expiresAt })
  await writeAll(dataDir, all)
  return { token, expiresAt }
}

/** Resolves a session once. Expired or already used links never reveal data. */
export async function consumeCartSession(dataDir: string, token: string, now = new Date()) {
  const all = await readAll(dataDir)
  const index = all.findIndex((session) => session.tokenHash === hash(token))
  if (index < 0) return undefined
  const session = all[index]
  if (session.consumedAt || Date.parse(session.expiresAt) <= now.getTime()) return undefined
  session.consumedAt = now.toISOString()
  await writeAll(dataDir, all)
  return session
}
