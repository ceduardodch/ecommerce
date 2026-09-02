import type { AppConfig } from "./config.js"
import type { Product } from "./types.js"

type ComboRecipe = {
  sku: string
  title: string
  pieces: number
  componentSkus: string[]
  aliases: string[]
  image: string
}

/**
 * Recetas comerciales de la landing. Los precios y el stock no viven aqui:
 * se calculan desde los SKU reales que devuelve Medusa.
 */
export const COMBO_RECIPES: ComboRecipe[] = [
  {
    sku: "MGC-SET-ONYX-IMPERIAL-15",
    title: "Juego Negro · 15 piezas",
    pieces: 15,
    componentSkus: [
      "MGC-FR-SARTEN-20-GN",
      "MGC-FR-SARTEN-24-GN",
      "MGC-FR-SARTEN-28-GN",
      "MGC-FR-LECHERA-18-GN",
      "MGC-FR-OLLA-20-GN",
      "MGC-FR-OLLA-24-GN",
      "MGC-FR-WOK-32-GN",
    ],
    aliases: ["juego negro", "combo negro", "onyx", "onyx imperial", "coleccion exotica", "combo 15 piezas"],
    image: "mgc-imperial/onyx-imperial-conjunto-actual-real.jpeg",
  },
  {
    sku: "MGC-SET-EBANO-PLATA-12",
    title: "Combo Ébano & Plata · 12 piezas",
    pieces: 12,
    componentSkus: [
      "MGC-FR-SARTEN-20-GN",
      "MGC-FR-SARTEN-24-GN",
      "MGC-FR-SARTEN-28-GN",
      "MGC-FR-LECHERA-18-GN",
      "MGC-FR-OLLA-20-GN",
      "MGC-FR-OLLA-24-GN",
    ],
    aliases: ["ebano", "ebano y plata", "ebano plata", "combo 12 piezas"],
    image: "mgc-ebano-plata/ebano-plata-conjunto-real.jpg",
  },
  {
    sku: "MGC-SET-AZUL-OCEANICO-12",
    title: "Oceánico · 12 piezas",
    pieces: 12,
    componentSkus: [
      "MGC-EU-SARTEN-20-AZ",
      "MGC-EU-SARTEN-24-AZ",
      "MGC-EU-SARTEN-28-AZ",
      "MGC-EU-LECHERA-16-AZ",
      "MGC-EU-OLLA-20-AZ",
      "MGC-EU-OLLA-24-AZ",
    ],
    aliases: ["oceanico", "azul", "azul oceanico", "combo azul", "combo 12 piezas"],
    image: "mgc-azul-oceanico/azul-oceanico-conjunto-real.jpeg",
  },
  {
    sku: "MGC-SET-SAHARA-NEGRO-6",
    title: "Combo Sahara negro · 6 piezas",
    pieces: 6,
    componentSkus: [
      "MGC-SAHARA-NEGRO-SARTEN-20",
      "MGC-SAHARA-NEGRO-SARTEN-24",
      "MGC-SAHARA-NEGRO-SARTEN-28",
    ],
    aliases: ["sahara", "sahara negro", "combo 6 piezas"],
    image: "mgc-sahara/sahara-negro-set-real.jpeg",
  },
  {
    sku: "MGC-SET-SAHARA-GRIS-6",
    title: "Combo Sahara gris · 6 piezas",
    pieces: 6,
    componentSkus: [
      "MGC-SAHARA-GRIS-SARTEN-20",
      "MGC-SAHARA-GRIS-SARTEN-24",
      "MGC-SAHARA-GRIS-SARTEN-28",
    ],
    aliases: ["sahara", "sahara gris", "combo 6 piezas"],
    image: "mgc-sahara/sahara-gris-set-real.jpeg",
  },
]

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

/** Agrega productos virtuales buscables sin duplicar inventario ni precios. */
export function withCommerceCombos(config: AppConfig, products: Product[]): Product[] {
  const bySku = new Map(products.map((product) => [product.sku, product]))
  const combos = COMBO_RECIPES.flatMap((recipe): Product[] => {
    if (bySku.has(recipe.sku)) return []
    const components = recipe.componentSkus.map((sku) => bySku.get(sku))
    if (components.some((product) => !product)) return []
    const realComponents = components as Product[]
    const promoTotal = roundMoney(realComponents.reduce(
      (total, product) => total + (product.comboPrice?.amount ?? product.price.amount),
      0,
    ))
    const regularTotal = roundMoney(realComponents.reduce(
      (total, product) => total + product.price.amount,
      0,
    ))
    const stock = Math.min(...realComponents.map((product) => product.stock))
    const baseUrl = config.kitchenPublicUrl.replace(/\/$/, "")

    return [{
      id: `combo-${recipe.sku.toLowerCase()}`,
      variantId: `combo-variant-${recipe.sku.toLowerCase()}`,
      sku: recipe.sku,
      vertical: "cocina",
      title: recipe.title,
      description: `${realComponents.map((product) => product.title).join("; ")}. Puedes cambiar las piezas en la tienda antes de pagar.`,
      category: "Combos de cocina",
      brand: "MGC",
      price: { amount: promoTotal, currency: "USD" },
      originalPrice: { amount: regularTotal, currency: "USD" },
      promoLabel: `Ahorra $${roundMoney(regularTotal - promoTotal).toFixed(2)}`,
      stockSignal: "Disponibilidad validada con las piezas del catálogo",
      bundleEligible: true,
      deliveryBadge: "Entrega y costo de envío por confirmar",
      paymentMethods: ["tarjeta DataFast"],
      material: "Granito; mangos de madera",
      pieces: recipe.pieces,
      collection: recipe.title.replace(/^Combo /, "").replace(/ ·.*$/, ""),
      stock,
      imageUrl: `${baseUrl}/media/${recipe.image}`,
      productUrl: `${baseUrl}/?utm_source=whatsapp&utm_medium=vicky&utm_campaign=combos#arma-tu-combo`,
      tags: ["mgc", "combo", "set", ...recipe.aliases],
      bundleItems: realComponents.map((product) => ({
        productId: product.id,
        variantId: product.variantId,
        sku: product.sku,
        title: product.title,
        quantity: 1,
      })),
    }]
  })

  return [...products, ...combos]
}

/** Convierte un combo comercial en sus SKU cobrables. */
export function expandCommerceItems(
  products: Product[],
  items: Array<{ productId: string; variantId?: string; quantity: number }>,
) {
  return items.flatMap((item) => {
    const product = products.find((candidate) =>
      candidate.id === item.productId ||
      candidate.variantId === item.variantId ||
      candidate.sku === item.productId,
    )
    if (!product?.bundleItems?.length) return [item]
    return product.bundleItems.map((component) => ({
      productId: component.productId,
      variantId: component.variantId,
      quantity: component.quantity * item.quantity,
    }))
  })
}

/** Impide cobrar una pieza reservada para juegos cuando llega como selección directa. */
export function assertDirectItemsSellable(
  products: Product[],
  items: Array<{ productId: string; variantId?: string; quantity: number }>,
) {
  for (const item of items) {
    const product = products.find((candidate) =>
      candidate.id === item.productId ||
      candidate.variantId === item.variantId ||
      candidate.sku === item.productId,
    )
    if (product?.bundleOnly && !product.bundleItems?.length) {
      throw new Error(`${product.title} solo está disponible dentro de un juego`)
    }
  }
}
