import { describe, expect, it } from "vitest"
import {
  august2026FallbackProducts,
  cocinaFallbackProducts,
  isPublicCatalogProduct,
  mgcSaharaPanProducts,
  normalizeProduct,
  productPath,
  productSlug,
  type Product,
} from "../lib/catalog"

function comboTotal(products: Product[]) {
  return Number(
    products
      .reduce(
        (sum, product) =>
          sum + (product.comboPrice?.amount ?? product.price.amount),
        0,
      )
      .toFixed(2),
  )
}

function baseProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: "prod-1",
    variantId: "var-1",
    sku: "MGC-WOK-GRANITO-32",
    title: "Wok 32 cm granito premium antiadherente",
    description: "Wok de granito antiadherente.",
    category: "Woks granito",
    brand: "Eter Niu Cocina",
    price: { amount: 55, currency: "USD" },
    imageUrl: "https://cocina.b2b.com.ec/media/product-wok-granito-32.jpg",
    productUrl: "https://cocina.b2b.com.ec/products/wok-granito-32cm-tapa",
    stock: 5,
    tags: [],
    ...overrides,
  } as Product
}

describe("productSlug", () => {
  it("extrae el slug de productUrl cuando trae /products/<slug>", () => {
    const product = baseProduct({
      productUrl: "https://cocina.b2b.com.ec/products/wok-granito-32cm-tapa",
    })

    expect(productSlug(product)).toBe("wok-granito-32cm-tapa")
  })

  it("decodifica caracteres escapados en el slug de la URL", () => {
    const product = baseProduct({
      productUrl: "https://cocina.b2b.com.ec/products/sart%C3%A9n-20cm",
    })

    expect(productSlug(product)).toBe("sartén-20cm")
  })

  it("ignora query string y hash al extraer el slug", () => {
    const product = baseProduct({
      productUrl: "https://cocina.b2b.com.ec/products/olla-20cm?utm_source=meta#top",
    })

    expect(productSlug(product)).toBe("olla-20cm")
  })

  it("cae a slugify(title) cuando productUrl no tiene el patrón /products/<slug>", () => {
    const product = baseProduct({
      title: "Wok 32 cm Granito Premium",
      productUrl: "https://cocina.b2b.com.ec/otra-ruta",
    })

    expect(productSlug(product)).toBe("wok-32-cm-granito-premium")
  })

  it("cae a slugify(title) cuando productUrl no es una URL válida", () => {
    const product = baseProduct({
      title: "Olla 20 cm",
      productUrl: "no-es-una-url",
    })

    expect(productSlug(product)).toBe("olla-20-cm")
  })

  it("normaliza acentos y elimina caracteres no alfanuméricos al hacer slugify", () => {
    const product = baseProduct({
      title: "Sartén Añejo — Edición Limitada!",
      productUrl: "no-es-una-url",
    })

    expect(productSlug(product)).toBe("sarten-anejo-edicion-limitada")
  })

  it("usa el sku como último recurso cuando el título está vacío", () => {
    const product = baseProduct({
      title: "",
      sku: "MGC-OLLA-20",
      productUrl: "no-es-una-url",
    })

    expect(productSlug(product)).toBe("mgc-olla-20")
  })
})

describe("productPath", () => {
  it("arma la ruta /products/<slug>", () => {
    const product = baseProduct({
      productUrl: "https://cocina.b2b.com.ec/products/wok-granito-32cm-tapa",
    })

    expect(productPath(product)).toBe("/products/wok-granito-32cm-tapa")
  })
})

describe("normalizeProduct", () => {
  it("aplica los valores comerciales por defecto cuando faltan", () => {
    const product = baseProduct({
      brand: "",
      deliveryBadge: undefined,
      freeShipping: undefined,
      paymentMethods: undefined,
      couponCode: undefined,
      stoveCompatibility: undefined,
      tags: undefined,
    })

    const normalized = normalizeProduct(product, "cocina")

    expect(normalized.brand).toBe("Eter Niu Cocina")
    expect(normalized.freeShipping).toBe(true)
    expect(normalized.paymentMethods).toEqual(["transferencia", "deuna", "tarjeta"])
    expect(normalized.couponCode).toBe("GRANITOHOY")
    expect(normalized.stoveCompatibility).toBe("Gas, induccion y vitroceramica")
    expect(normalized.tags).toEqual([])
  })

  it("respeta los valores explícitos del producto por encima de los defaults", () => {
    const product = baseProduct({
      brand: "Marca propia",
      freeShipping: false,
      paymentMethods: ["tarjeta"],
      couponCode: "MIOFERTA",
      stoveCompatibility: "Solo inducción",
    })

    const normalized = normalizeProduct(product, "cocina")

    expect(normalized.brand).toBe("Marca propia")
    expect(normalized.freeShipping).toBe(false)
    expect(normalized.paymentMethods).toEqual(["tarjeta"])
    expect(normalized.couponCode).toBe("MIOFERTA")
    expect(normalized.stoveCompatibility).toBe("Solo inducción")
  })

  it("marca la vertical bienestar y usa su marca por defecto cuando el parámetro lo indica", () => {
    const product = baseProduct({
      vertical: undefined,
      brand: "",
      sku: "BIEN-TERMO-1",
      category: "Termos",
    })

    const normalized = normalizeProduct(product, "bienestar")

    expect(normalized.vertical).toBe("bienestar")
    expect(normalized.brand).toBe("Eter Niu Bienestar")
    expect(normalized.stoveCompatibility).toBe("No aplica")
  })

  it("no pisa vertical/brand si el producto ya los trae", () => {
    const product = baseProduct({ vertical: "bienestar", brand: "Ya tiene marca" })

    const normalized = normalizeProduct(product, "cocina")

    expect(normalized.vertical).toBe("bienestar")
    expect(normalized.brand).toBe("Ya tiene marca")
  })

  it("marca 'No aplica' en cocina cuando la categoría es un complemento", () => {
    const product = baseProduct({
      category: "Complementos de cocina",
      stoveCompatibility: undefined,
    })

    const normalized = normalizeProduct(product, "cocina")

    expect(normalized.stoveCompatibility).toBe("No aplica; cuida ollas de granito")
  })
})

describe("catálogo de campaña", () => {
  it("no expone el producto temporal de prueba DataFast", () => {
    expect(
      cocinaFallbackProducts.some((product) =>
        product.sku.includes("DATAFAST-TEST"),
      ),
    ).toBe(false)
  })

  it("oculta la prueba DataFast aunque Medusa todavía la devuelva", () => {
    expect(
      isPublicCatalogProduct(
        baseProduct({ sku: "MGC-PALETA-WOK-DATAFAST-TEST" }),
      ),
    ).toBe(false)
    expect(isPublicCatalogProduct(baseProduct())).toBe(true)
  })

  it("no ofrece por unidad una pieza reservada para un juego", () => {
    expect(
      isPublicCatalogProduct(
        baseProduct({ sku: "MGC-FR-WOK-32-GN", bundleOnly: true }),
      ),
    ).toBe(false)
    expect(
      august2026FallbackProducts.find(
        (product) => product.sku === "MGC-FR-WOK-32-GN",
      )?.bundleOnly,
    ).toBe(true)
  })

  it("usa los nombres corregidos de Juego Negro y Oceánico", () => {
    expect(
      august2026FallbackProducts.find(
        (product) => product.sku === "MGC-FR-SARTEN-20-GN",
      ),
    ).toMatchObject({ title: "Sartén Juego Negro 20 cm", collection: "Juego Negro" })
    expect(
      august2026FallbackProducts.find(
        (product) => product.sku === "MGC-EU-SARTEN-20-AZ",
      ),
    ).toMatchObject({ title: "Sartén Oceánico 20 cm", collection: "Oceánico" })
  })

  it("mantiene los cuatro totales anunciados al armar el combo", () => {
    const onyx = august2026FallbackProducts.filter(
      (product) =>
        product.sku.startsWith("MGC-FR-") && !product.sku.endsWith("-RO"),
    )
    const ebano = onyx.filter(
      (product) => product.sku !== "MGC-FR-WOK-32-GN",
    )
    const azul = august2026FallbackProducts.filter((product) =>
      product.sku.startsWith("MGC-EU-"),
    )
    const sahara = mgcSaharaPanProducts.filter(
      (product) => product.color === "Negro",
    )

    expect(comboTotal(onyx)).toBe(426.96)
    expect(comboTotal(ebano)).toBe(296.97)
    expect(comboTotal(sahara)).toBe(149.97)
    expect(comboTotal(azul)).toBe(325)
  })
})
