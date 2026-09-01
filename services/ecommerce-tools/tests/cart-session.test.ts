import { mkdtemp } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { consumeCartSession, createCartSession } from "../src/cart-session.js"

describe("WhatsApp cart sessions", () => {
  it("stores only a hash and consumes an opaque link once", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "cart-session-"))
    const created = await createCartSession(dir, {
      phone: "+593999999999",
      customer: { name: "Ana", city: "Quito" },
      items: [{ productId: "p1", variantId: "v1", sku: "SKU", title: "Olla", quantity: 1, price: 20 }],
    })
    const session = await consumeCartSession(dir, created.token)
    expect(session?.customer.city).toBe("Quito")
    expect(await consumeCartSession(dir, created.token)).toBeUndefined()
  })
})
