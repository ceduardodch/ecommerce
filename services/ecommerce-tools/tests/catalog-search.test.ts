import { describe, expect, it } from "vitest"
import { inferProductVerticalFromQuery, searchProducts } from "../src/catalog.js"
import type { Product } from "../src/types.js"

const products: Product[] = [{
  id: "wellness",
  variantId: "wellness-v1",
  sku: "BIEN-01",
  vertical: "bienestar",
  title: "Pistola de percusión",
  description: "Producto de bienestar",
  category: "bienestar",
  brand: "Eter Niu",
  price: { amount: 45, currency: "USD" },
  stock: 2,
  imageUrl: "",
  productUrl: "https://example.com/bienestar",
  tags: [],
}, {
  id: "kitchen-pot",
  variantId: "kitchen-pot-v1",
  sku: "COC-OLLA-24",
  vertical: "cocina",
  title: "Olla francesa 24 cm",
  description: "Olla para cocinar en familia",
  category: "ollas",
  brand: "Eter Niu",
  price: { amount: 39, currency: "USD" },
  stock: 4,
  imageUrl: "",
  productUrl: "https://example.com/olla",
  tags: [],
}, {
  id: "kitchen-pan",
  variantId: "kitchen-pan-v1",
  sku: "COC-SARTEN-24",
  vertical: "cocina",
  title: "Sartén francesa 24 cm",
  description: "Sartén para uso diario",
  category: "sartenes",
  brand: "Eter Niu",
  price: { amount: 29, currency: "USD" },
  stock: 5,
  imageUrl: "",
  productUrl: "https://example.com/sarten",
  tags: [],
}]

describe("búsqueda de catálogo para WhatsApp", () => {
  it("entiende una consulta natural por el área de cocina", () => {
    expect(inferProductVerticalFromQuery("Busco cocina que me puedes ofrecer"))
      .toBe("cocina")
    expect(searchProducts(products, { query: "Busco cocina que me puedes ofrecer" }))
      .toEqual([products[1], products[2]])
  })

  it("quita palabras de conversación y normaliza ollas a olla", () => {
    expect(searchProducts(products, { query: "Como si tienes ollas" }))
      .toEqual([products[1]])
  })

  it("no mezcla bienestar cuando la intención es cocina", () => {
    const result = searchProducts(products, { query: "¿Qué productos de cocina tienes?" })
    expect(result.map((product) => product.vertical)).toEqual(["cocina", "cocina"])
  })

  it("no devuelve el SKU temporal retirado aunque Medusa lo conserve", () => {
    const retired = {
      ...products[1],
      id: "datafast-test",
      variantId: "datafast-test-v1",
      sku: "MGC-PALETA-WOK-DATAFAST-TEST",
      title: "Paleta para wok · prueba DataFast",
    }
    const result = searchProducts([...products, retired], { vertical: "cocina" })

    expect(result.map((product) => product.sku)).not.toContain(retired.sku)
  })

  it("oculta piezas que solo se venden dentro de un juego", () => {
    const wok = {
      ...products[1],
      id: "wok-juego",
      variantId: "wok-juego-v1",
      sku: "MGC-FR-WOK-32-GN",
      title: "Wok del Juego Negro 32 cm",
      bundleOnly: true,
    }
    const juego = {
      ...products[1],
      id: "juego-negro",
      variantId: "juego-negro-v1",
      sku: "MGC-SET-ONYX-IMPERIAL-15",
      title: "Juego Negro · 15 piezas",
      bundleItems: [{
        productId: wok.id,
        variantId: wok.variantId,
        sku: wok.sku,
        title: wok.title,
        quantity: 1,
      }],
    }

    const result = searchProducts([...products, wok, juego], { vertical: "cocina" })

    expect(result.map((product) => product.sku)).not.toContain(wok.sku)
    expect(result.map((product) => product.sku)).toContain(juego.sku)
  })
})
