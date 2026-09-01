import { afterEach, describe, expect, it, vi } from "vitest"
import { loadProducts } from "../src/catalog.js"
import { loadConfig } from "../src/config.js"

describe("contrato Medusa → checkout", () => {
  afterEach(() => vi.unstubAllGlobals())

  it("conserva SKU, precio, stock cero y regla de combo de Medusa", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => ({
        products: [{
          id: "prod_sahara",
          title: "Sartén Sahara negro 20 cm",
          handle: "sarten-sahara-negro-20cm",
          tags: [],
          metadata: {
            vertical: "cocina",
            stock: 0,
            negotiatedPrice: 39.99,
            comboMinimumItems: 3,
            comboGroup: "sahara-negro",
          },
          variants: [{
            id: "variant_sahara",
            sku: "MGC-SAHARA-NEGRO-SARTEN-20",
            prices: [{ amount: 55, currency_code: "usd" }],
          }],
        }],
      }),
    }) as Response))

    const [product] = await loadProducts(
      loadConfig({ ALLOW_DEMO_CATALOG: "false", MEDUSA_STORE_API_URL: "http://medusa:9000" }),
    )

    expect(product).toMatchObject({
      sku: "MGC-SAHARA-NEGRO-SARTEN-20",
      stock: 0,
      comboGroup: "sahara-negro",
      comboMinimumItems: 3,
      comboPrice: { amount: 39.99, currency: "USD" },
    })
  })
})
