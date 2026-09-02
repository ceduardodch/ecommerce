import { describe, expect, it } from "vitest"
import { loadConfig } from "../src/config.js"
import { assertDirectItemsSellable, expandCommerceItems, withCommerceCombos } from "../src/combo-catalog.js"
import { searchProducts } from "../src/catalog.js"
import { buildQuote } from "../src/quote.js"
import type { Product } from "../src/types.js"

const specs = [
  ["MGC-FR-SARTEN-20-GN", 55, 39.99, "onyx imperial"],
  ["MGC-FR-SARTEN-24-GN", 60, 49.99, "onyx imperial"],
  ["MGC-FR-SARTEN-28-GN", 65, 59.99, "onyx imperial"],
  ["MGC-FR-LECHERA-18-GN", 53, 39, "onyx imperial"],
  ["MGC-FR-OLLA-20-GN", 63, 49, "onyx imperial"],
  ["MGC-FR-OLLA-24-GN", 73, 59, "onyx imperial"],
  ["MGC-FR-WOK-32-GN", 139.99, 129.99, "onyx imperial"],
  ["MGC-EU-SARTEN-20-AZ", 55, 45, "azul oceanico"],
  ["MGC-EU-SARTEN-24-AZ", 60, 55, "azul oceanico"],
  ["MGC-EU-SARTEN-28-AZ", 65, 60, "azul oceanico"],
  ["MGC-EU-LECHERA-16-AZ", 53, 45, "azul oceanico"],
  ["MGC-EU-OLLA-20-AZ", 63, 55, "azul oceanico"],
  ["MGC-EU-OLLA-24-AZ", 73, 65, "azul oceanico"],
  ["MGC-SAHARA-NEGRO-SARTEN-20", 55, 39.99, "sahara-negro"],
  ["MGC-SAHARA-NEGRO-SARTEN-24", 60, 49.99, "sahara-negro"],
  ["MGC-SAHARA-NEGRO-SARTEN-28", 65, 59.99, "sahara-negro"],
  ["MGC-SAHARA-GRIS-SARTEN-20", 55, 39.99, "sahara-gris"],
  ["MGC-SAHARA-GRIS-SARTEN-24", 60, 49.99, "sahara-gris"],
  ["MGC-SAHARA-GRIS-SARTEN-28", 65, 59.99, "sahara-gris"],
] as const

const products: Product[] = specs.map(([sku, pvp, combo, group]) => ({
  id: `prod-${sku.toLowerCase()}`,
  variantId: `var-${sku.toLowerCase()}`,
  sku,
  vertical: "cocina",
  title: sku,
  description: sku,
  category: "Cocina MGC",
  brand: "MGC",
  price: { amount: pvp, currency: "USD" },
  comboPrice: { amount: combo, currency: "USD" },
  comboMinimumItems: 3,
  comboGroup: group,
  stock: 8,
  imageUrl: "",
  productUrl: "",
  tags: [group],
}))

describe("catalogo de combos para Vicky", () => {
  const config = loadConfig({ ECOMMERCE_TAX_RATE: "0.15" })
  const catalog = withCommerceCombos(config, products)

  it("publica los cuatro combos de la landing con su precio calculado", () => {
    const prices = Object.fromEntries(
      catalog.filter((product) => product.bundleItems).map((product) => [product.sku, product.price.amount]),
    )

    expect(prices).toMatchObject({
      "MGC-SET-ONYX-IMPERIAL-15": 426.96,
      "MGC-SET-EBANO-PLATA-12": 296.97,
      "MGC-SET-AZUL-OCEANICO-12": 325,
      "MGC-SET-SAHARA-NEGRO-6": 149.97,
    })
  })

  it("encuentra Juego Negro y conserva Onyx como alias", () => {
    expect(searchProducts(catalog, { query: "juego negro", limit: 10 }).map((product) => product.sku))
      .toContain("MGC-SET-ONYX-IMPERIAL-15")
    expect(searchProducts(catalog, { query: "combo onyx", limit: 10 }).map((product) => product.sku))
      .toContain("MGC-SET-ONYX-IMPERIAL-15")
    expect(searchProducts(catalog, { query: "combos", limit: 20 }).filter((product) => product.bundleItems))
      .toHaveLength(5)
  })

  it("expande Onyx a siete SKU reales y cotiza el PVP final con IVA incluido", () => {
    const onyx = catalog.find((product) => product.sku === "MGC-SET-ONYX-IMPERIAL-15")!
    const expanded = expandCommerceItems(catalog, [{ productId: onyx.id, quantity: 1 }])
    const quote = buildQuote(config, catalog, [{ productId: onyx.id, quantity: 1 }])

    expect(expanded).toHaveLength(7)
    expect(quote.lines).toHaveLength(7)
    expect(quote.total.amount).toBe(426.96)
    expect(quote.subtotal.amount + quote.tax.amount).toBe(426.96)
    expect(quote.whatsappMessage).toContain("IVA incluido")
  })

  it("nombra el juego azul como Oceánico", () => {
    expect(
      catalog.find((product) => product.sku === "MGC-SET-AZUL-OCEANICO-12")?.title,
    ).toBe("Oceánico · 12 piezas")
  })

  it("bloquea el wok por unidad y lo permite dentro del Juego Negro", () => {
    const wok = products.find((product) => product.sku === "MGC-FR-WOK-32-GN")!
    wok.bundleOnly = true
    const juego = catalog.find((product) => product.sku === "MGC-SET-ONYX-IMPERIAL-15")!

    expect(() => assertDirectItemsSellable(catalog, [{ productId: wok.id, quantity: 1 }]))
      .toThrow("solo está disponible dentro de un juego")
    expect(() => buildQuote(config, catalog, [{ productId: wok.id, quantity: 1 }]))
      .toThrow("solo está disponible dentro de un juego")
    expect(() => assertDirectItemsSellable(catalog, [{ productId: juego.id, quantity: 1 }]))
      .not.toThrow()
  })
})
