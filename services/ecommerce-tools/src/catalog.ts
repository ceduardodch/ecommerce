import type { AppConfig } from "./config.js"
import { demoCatalog } from "./demo-catalog.js"
import type { Product } from "./types.js"

const defaultPaymentMethods = ["transferencia", "deuna", "payphone"]
const defaultStoveCompatibility = "Gas, induccion y vitroceramica"
const defaultCouponCode = "GRANITOHOY"
const defaultDeliveryBadge = "Envio gratis"
type ProductVertical = "cocina" | "bienestar"

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
    metadata?: Record<string, unknown>
  }>
  tags?: Array<{ value?: string }>
  metadata?: Record<string, unknown>
}

function baseUrlForVertical(config: AppConfig, vertical: ProductVertical) {
  return (
    vertical === "bienestar" ? config.wellnessPublicUrl : config.kitchenPublicUrl
  ).replace(/\/$/, "")
}

function productUrl(
  config: AppConfig,
  product: MedusaProduct,
  vertical: ProductVertical,
  sku: string,
) {
  const handle = product.handle || product.id
  if (vertical === "bienestar") {
    const url = new URL(
      `/campanas/${handle}`,
      baseUrlForVertical(config, vertical),
    )
    url.searchParams.set("sku", sku)
    return url.toString()
  }
  return `${baseUrlForVertical(config, vertical)}/products/${handle}`
}

function numberFromMetadata(value: unknown) {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : undefined
}

function stringFromMetadata(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined
}

function stringArrayFromMetadata(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean)
  }
  if (typeof value === "string" && value.trim()) {
    return value
      .split("|")
      .map((item) => item.trim())
      .filter(Boolean)
  }
  return undefined
}

function booleanFromMetadata(value: unknown) {
  return value === true || value === "true"
}

function publicMediaUrl(
  config: AppConfig,
  file: string,
  vertical: ProductVertical = "cocina",
) {
  return `${baseUrlForVertical(config, vertical)}/media/${file}`
}

function isGeneratedPlaceholder(url?: string) {
  return !url || url.includes("placehold.co")
}

function generatedImageForProduct(
  config: AppConfig,
  input: {
    sku?: string
    title?: string
    category?: string
    vertical?: ProductVertical
  },
) {
  const haystack =
    `${input.sku || ""} ${input.title || ""} ${input.category || ""}`
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
  if (input.vertical === "bienestar") {
    if (haystack.includes("botella") || haystack.includes("termica")) {
      return publicMediaUrl(config, "wellness-botella.svg", "bienestar")
    }
    if (haystack.includes("mat") || haystack.includes("yoga")) {
      return publicMediaUrl(config, "wellness-mat.svg", "bienestar")
    }
    if (haystack.includes("bowl") || haystack.includes("ceramica")) {
      return publicMediaUrl(config, "wellness-bowl.svg", "bienestar")
    }
    if (haystack.includes("aroma") || haystack.includes("calma")) {
      return publicMediaUrl(config, "wellness-aroma.svg", "bienestar")
    }
    return publicMediaUrl(config, "wellness-hero.svg", "bienestar")
  }
  if (haystack.includes("utensilio")) {
    return publicMediaUrl(config, "photo-product-utensilios.jpg")
  }
  if (haystack.includes("set")) {
    return publicMediaUrl(config, "photo-product-set-granito.jpg")
  }
  if (haystack.includes("24")) {
    return publicMediaUrl(config, "photo-product-olla-24.jpg")
  }
  if (haystack.includes("20")) {
    return publicMediaUrl(config, "photo-product-olla-20.jpg")
  }
  if (haystack.includes("sarten")) {
    return publicMediaUrl(config, "photo-detalle-wok.jpg")
  }
  if (haystack.includes("wok")) {
    return publicMediaUrl(config, "photo-receta-wok.jpg")
  }
  return publicMediaUrl(config, "photo-hero-cocina.jpg")
}

function imageForProduct(
  config: AppConfig,
  input: {
    sku?: string
    title?: string
    category?: string
    vertical?: ProductVertical
  },
  imageUrl?: string,
) {
  if (!isGeneratedPlaceholder(imageUrl)) return imageUrl!
  return generatedImageForProduct(config, input)
}

function withGeneratedImages(config: AppConfig, products: Product[]) {
  return products.map((product) => {
    const vertical = product.vertical || "cocina"
    return {
      ...product,
      vertical,
      imageUrl: imageForProduct(
        config,
        { ...product, vertical },
        product.imageUrl,
      ).replace("https://shop.b2b.com.ec", baseUrlForVertical(config, vertical)),
      productUrl: product.productUrl.replace(
        "https://shop.b2b.com.ec",
        baseUrlForVertical(config, vertical),
      ),
      deliveryBadge: product.deliveryBadge || defaultDeliveryBadge,
      freeShipping: product.freeShipping ?? true,
      paymentMethods: product.paymentMethods?.length
        ? product.paymentMethods
        : defaultPaymentMethods,
      couponCode: product.couponCode || defaultCouponCode,
      stoveCompatibility:
        product.stoveCompatibility ||
        (vertical === "bienestar"
          ? "No aplica"
          : product.category.toLowerCase().includes("complement")
            ? "No aplica; cuida ollas de granito"
            : defaultStoveCompatibility),
    }
  })
}

function normalizeMedusaProduct(
  config: AppConfig,
  product: MedusaProduct,
): Product {
  const variant = product.variants?.[0]
  const sku = variant?.sku || product.id
  const rawPrice =
    variant?.calculated_price?.calculated_amount ??
    variant?.prices?.find((price) => price.currency_code === "usd")?.amount ??
    numberFromMetadata(variant?.metadata?.price) ??
    numberFromMetadata(product.metadata?.price) ??
    0

  const priceAmount = Number(rawPrice)
  const originalAmount =
    numberFromMetadata(product.metadata?.originalPrice) ||
    numberFromMetadata(variant?.metadata?.originalPrice)
  const discountPercent =
    numberFromMetadata(product.metadata?.discountPercent) ||
    (originalAmount && originalAmount > priceAmount
      ? Math.round(((originalAmount - priceAmount) / originalAmount) * 100)
      : undefined)

  const category =
    product.categories?.[0]?.name ||
    product.collection?.title ||
    String(product.metadata?.category || "Catalogo")
  const vertical = inferVertical(product, category, sku)

  return {
    id: product.id,
    variantId: variant?.id || product.id,
    sku,
    vertical,
    title: product.title,
    description: product.description || "",
    category,
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
    deliveryBadge:
      stringFromMetadata(product.metadata?.deliveryBadge) ||
      defaultDeliveryBadge,
    freeShipping:
      product.metadata?.freeShipping === undefined
        ? true
        : booleanFromMetadata(product.metadata?.freeShipping),
    paymentMethods:
      stringArrayFromMetadata(product.metadata?.paymentMethods) ||
      defaultPaymentMethods,
    couponCode:
      stringFromMetadata(product.metadata?.couponCode) || defaultCouponCode,
    material: stringFromMetadata(product.metadata?.material),
    coating: stringFromMetadata(product.metadata?.coating),
    teflonFree: booleanFromMetadata(product.metadata?.teflonFree),
    pfoaFree: booleanFromMetadata(product.metadata?.pfoaFree),
    pfasFree: booleanFromMetadata(product.metadata?.pfasFree),
    ptfeFree: booleanFromMetadata(product.metadata?.ptfeFree),
    capacity: stringFromMetadata(product.metadata?.capacity),
    diameterCm: numberFromMetadata(product.metadata?.diameterCm),
    pieces: numberFromMetadata(product.metadata?.pieces),
    stoveCompatibility:
      stringFromMetadata(product.metadata?.stoveCompatibility) ||
      (category.toLowerCase().includes("complement")
        ? "No aplica; cuida ollas de granito"
        : defaultStoveCompatibility),
    tipoCocina: stringFromMetadata(product.metadata?.tipoCocina),
    nivel: stringFromMetadata(product.metadata?.nivel),
    bundleUseCase: stringFromMetadata(product.metadata?.bundleUseCase),
    careTips: stringFromMetadata(product.metadata?.careTips),
    healthAngle: stringFromMetadata(product.metadata?.healthAngle),
    warrantyText: stringFromMetadata(product.metadata?.warrantyText),
    instagramSourceUrl: stringFromMetadata(
      product.metadata?.instagramSourceUrl,
    ),
    sourceUrls: stringArrayFromMetadata(product.metadata?.sourceUrls),
    contentAngles: stringArrayFromMetadata(product.metadata?.contentAngles),
    certificationStatus: stringFromMetadata(
      product.metadata?.certificationStatus,
    ),
    claimNote: stringFromMetadata(product.metadata?.claimNote),
    reorderAfterDays: numberFromMetadata(product.metadata?.reorderAfterDays),
    stock: Number(product.metadata?.stock || variant?.metadata?.stock || 0),
    imageUrl: imageForProduct(
      config,
      { sku, title: product.title, category, vertical },
      product.thumbnail || product.images?.[0]?.url,
    ),
    productUrl: productUrl(config, product, vertical, sku),
    tags: [
      ...(product.tags?.map((tag) => tag.value).filter(Boolean) as string[]),
      product.title,
      product.description || "",
      stringFromMetadata(product.metadata?.material) || "",
      stringFromMetadata(product.metadata?.coating) || "",
      stringFromMetadata(product.metadata?.tipoCocina) || "",
      stringFromMetadata(product.metadata?.nivel) || "",
      stringFromMetadata(product.metadata?.bundleUseCase) || "",
      stringFromMetadata(product.metadata?.healthAngle) || "",
      stringFromMetadata(product.metadata?.vertical) || "",
      ...(stringArrayFromMetadata(product.metadata?.sourceUrls) || []),
      ...(stringArrayFromMetadata(product.metadata?.contentAngles) || []),
    ],
  }
}

const kitchenTerms = [
  "cocina",
  "olla",
  "ollas",
  "wok",
  "woks",
  "cuchillo",
  "cuchillos",
  "tabla",
  "tablas",
  "utensilio",
  "utensilios",
  "sarten",
  "sartenes",
  "combo",
  "reposicion",
  "granito",
  "mgc",
  "teflon",
  "pfoa",
  "pfas",
  "ptfe",
  "menos aceite",
  "granito real",
  "chef",
  "familia",
]

const wellnessTerms = [
  "bienestar",
  "wellness",
  "yoga",
  "mat",
  "botella",
  "termica",
  "hidratacion",
  "bowl",
  "ceramica",
  "aroma",
  "calma",
  "ritual",
  "mindful",
  "movimiento",
  "descanso",
]

function productHaystack(product: Product) {
  return [
    product.title,
    product.description,
    product.category,
    product.brand,
    product.sku,
    product.material || "",
    product.coating || "",
    product.tipoCocina || "",
    product.bundleUseCase || "",
    product.healthAngle || "",
    product.vertical || "",
    ...(product.sourceUrls || []),
    ...(product.contentAngles || []),
    ...product.tags,
  ]
    .join(" ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

function inferVertical(
  product: MedusaProduct,
  category: string,
  sku: string,
): ProductVertical {
  const explicit = stringFromMetadata(product.metadata?.vertical)?.toLowerCase()
  if (explicit === "bienestar" || explicit === "wellness") return "bienestar"
  if (explicit === "cocina" || explicit === "kitchen") return "cocina"
  const normalizedSku = sku.toUpperCase()
  if (normalizedSku.startsWith("BIEN-") || normalizedSku.startsWith("WELL-")) {
    return "bienestar"
  }

  const haystack = [
    product.title,
    product.description || "",
    category,
    product.collection?.title || "",
    ...(product.tags?.map((tag) => tag.value).filter(Boolean) as string[]),
    stringFromMetadata(product.metadata?.material) || "",
    stringFromMetadata(product.metadata?.bundleUseCase) || "",
    stringFromMetadata(product.metadata?.healthAngle) || "",
    ...(stringArrayFromMetadata(product.metadata?.contentAngles) || []),
  ]
    .join(" ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
  const isWellness = wellnessTerms.some((term) => haystack.includes(term))
  const isKitchen = kitchenTerms.some((term) => haystack.includes(term))
  return isWellness && !isKitchen ? "bienestar" : "cocina"
}

function isKitchenProduct(product: Product) {
  if (product.vertical === "cocina") return true
  if (product.vertical === "bienestar") return false
  const sku = product.sku.toUpperCase()
  if (sku.startsWith("COC-") || sku.startsWith("MGC-")) {
    return true
  }
  const haystack = productHaystack(product)
  return kitchenTerms.some((term) => haystack.includes(term))
}

function isWellnessProduct(product: Product) {
  if (product.vertical === "bienestar") return true
  if (product.vertical === "cocina") return false
  const sku = product.sku.toUpperCase()
  if (sku.startsWith("BIEN-") || sku.startsWith("WELL-")) {
    return true
  }
  const haystack = productHaystack(product)
  return wellnessTerms.some((term) => haystack.includes(term))
}

export function productsForVertical(
  products: Product[],
  vertical?: ProductVertical,
) {
  if (vertical === "bienestar") return products.filter(isWellnessProduct)
  if (vertical === "cocina") return products.filter(isKitchenProduct)
  return products.filter(
    (product) => isKitchenProduct(product) || isWellnessProduct(product),
  )
}

export async function loadProducts(config: AppConfig): Promise<Product[]> {
  const url = new URL("/store/products", config.medusaStoreApiUrl)
  url.searchParams.set("limit", "100")
  url.searchParams.set(
    "fields",
    "*variants,*images,*categories,*tags,+metadata",
  )

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
      normalizeMedusaProduct(config, product),
    )
    const supportedProducts = productsForVertical(products)
    return supportedProducts.length
      ? supportedProducts
      : config.allowDemoCatalog
        ? withGeneratedImages(config, demoCatalog)
        : []
  } catch {
    return config.allowDemoCatalog
      ? withGeneratedImages(config, demoCatalog)
      : []
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
    vertical?: ProductVertical
  },
) {
  const terms = (input.query || "").toLowerCase().split(/\s+/).filter(Boolean)

  return productsForVertical(products, input.vertical)
    .filter((product) => {
      if (input.category && product.category !== input.category) return false
      if (
        input.minPrice !== undefined &&
        product.price.amount < input.minPrice
      ) {
        return false
      }
      if (
        input.maxPrice !== undefined &&
        product.price.amount > input.maxPrice
      ) {
        return false
      }
      if (!terms.length) return true

      const haystack = [
        product.title,
        product.description,
        product.category,
        product.brand,
        product.sku,
        product.material || "",
        product.coating || "",
        product.tipoCocina || "",
        product.nivel || "",
        product.bundleUseCase || "",
        product.careTips || "",
        product.healthAngle || "",
        ...(product.sourceUrls || []),
        ...(product.contentAngles || []),
        ...product.tags,
      ]
        .join(" ")
        .toLowerCase()

      return terms.every((term) => haystack.includes(term))
    })
    .slice(0, input.limit || 10)
}
