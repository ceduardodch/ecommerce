import type { AppConfig } from "./config.js"
import { demoCatalog } from "./demo-catalog.js"
import type { Product } from "./types.js"

type MedusaProduct = {
  id: string
  title: string
  description?: string
  handle?: string
  thumbnail?: string
  images?: Array<{ url?: string }>
  categories?: Array<{ name?: string }>
  collection?: { title?: string }
  variants?: Array<{
    id: string
    title?: string
    sku?: string
    calculated_price?: {
      calculated_amount?: number
      currency_code?: string
    }
    prices?: Array<{ amount?: number; currency_code?: string }>
  }>
  tags?: Array<{ value?: string }>
  metadata?: Record<string, unknown>
}

function productUrl(config: AppConfig, product: MedusaProduct) {
  const handle = product.handle || product.id
  return `${config.storePublicUrl.replace(/\/$/, "")}/products/${handle}`
}

function numberFromMetadata(value: unknown) {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : undefined
}

function stringFromMetadata(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined
}

function normalizeMedusaProduct(config: AppConfig, product: MedusaProduct): Product {
  const variant = product.variants?.[0]
  const rawPrice =
    variant?.calculated_price?.calculated_amount ??
    variant?.prices?.find((price) => price.currency_code === "usd")?.amount ??
    0

  const priceAmount = Number(rawPrice)
  const originalAmount = numberFromMetadata(product.metadata?.originalPrice)
  const discountPercent =
    numberFromMetadata(product.metadata?.discountPercent) ||
    (originalAmount && originalAmount > priceAmount
      ? Math.round(((originalAmount - priceAmount) / originalAmount) * 100)
      : undefined)

  return {
    id: product.id,
    variantId: variant?.id || product.id,
    sku: variant?.sku || product.id,
    title: product.title,
    description: product.description || "",
    category:
      product.categories?.[0]?.name ||
      product.collection?.title ||
      String(product.metadata?.category || "Catalogo"),
    brand: String(product.metadata?.brand || config.metaCatalogBrand),
    price: { amount: priceAmount, currency: "USD" },
    originalPrice: originalAmount
      ? { amount: originalAmount, currency: "USD" }
      : undefined,
    discountPercent,
    promoLabel: stringFromMetadata(product.metadata?.promoLabel),
    stockSignal: stringFromMetadata(product.metadata?.stockSignal),
    bundleEligible:
      product.metadata?.bundleEligible === true ||
      product.metadata?.bundleEligible === "true",
    deliveryBadge: stringFromMetadata(product.metadata?.deliveryBadge),
    stock: Number(product.metadata?.stock || 0),
    imageUrl: product.thumbnail || product.images?.[0]?.url || "",
    productUrl: productUrl(config, product),
    tags: [
      ...(product.tags?.map((tag) => tag.value).filter(Boolean) as string[]),
      product.title,
      product.description || "",
    ],
  }
}

export async function loadProducts(config: AppConfig): Promise<Product[]> {
  const url = new URL("/store/products", config.medusaStoreApiUrl)
  url.searchParams.set("limit", "100")
  url.searchParams.set("fields", "*variants,*images,*categories,*tags")

  const headers: Record<string, string> = {}
  if (config.medusaPublishableKey) {
    headers["x-publishable-api-key"] = config.medusaPublishableKey
  }

  try {
    const response = await fetch(url, { headers })
    if (!response.ok) {
      throw new Error(`Medusa products failed: ${response.status}`)
    }
    const body = (await response.json()) as { products?: MedusaProduct[] }
    const products = (body.products || []).map((product) =>
      normalizeMedusaProduct(config, product)
    )
    return products.length ? products : demoCatalog
  } catch {
    return demoCatalog
  }
}

export function searchProducts(
  products: Product[],
  input: {
    query?: string
    category?: string
    minPrice?: number
    maxPrice?: number
    limit?: number
  }
) {
  const terms = (input.query || "")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)

  return products
    .filter((product) => {
      if (input.category && product.category !== input.category) return false
      if (input.minPrice !== undefined && product.price.amount < input.minPrice) {
        return false
      }
      if (input.maxPrice !== undefined && product.price.amount > input.maxPrice) {
        return false
      }
      if (!terms.length) return true

      const haystack = [
        product.title,
        product.description,
        product.category,
        product.brand,
        product.sku,
        ...product.tags,
      ]
        .join(" ")
        .toLowerCase()

      return terms.every((term) => haystack.includes(term))
    })
    .slice(0, input.limit || 10)
}
