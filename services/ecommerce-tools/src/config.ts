export type AppConfig = {
  port: number
  dataDir: string
  allowDemoCatalog: boolean
  crmBackend: "medusa" | "json"
  toolsApiToken?: string
  storePublicUrl: string
  kitchenPublicUrl: string
  wellnessPublicUrl: string
  medusaStoreApiUrl: string
  medusaAdminApiUrl: string
  medusaPublishableKey?: string
  medusaAdminApiKey?: string
  taxRate: number
  whatsappSellerNumber: string
  payphoneApiLinkUrl: string
  payphoneToken?: string
  payphoneStoreId?: string
  payphoneDryRun: boolean
  metaCatalogBrand: string
  metaApiVersion: string
  pixelEnabled: boolean
  metaPixelId?: string
  metaDatasetId?: string
  metaAccessToken?: string
  metaCapiTestEventCode?: string
}

function bool(value: string | undefined, fallback: boolean) {
  if (value === undefined || value === "") return fallback
  return ["1", "true", "yes", "y"].includes(value.toLowerCase())
}

function normalizeWhatsappSellerNumber(value: string) {
  const digits = value.replace(/\D/g, "")
  if (digits.startsWith("0") && digits.length === 10) {
    return `593${digits.slice(1)}`
  }
  return digits
}

export function loadConfig(env = process.env): AppConfig {
  const nodeEnv = env.NODE_ENV || "development"
  const crmBackend =
    env.CRM_BACKEND || (nodeEnv === "production" ? "medusa" : "json")
  const kitchenPublicUrl =
    env.COCINA_PUBLIC_URL ||
    env.NEXT_PUBLIC_COCINA_URL ||
    env.STORE_PUBLIC_URL ||
    "https://cocina.b2b.com.ec"
  const wellnessPublicUrl =
    env.BIENESTAR_PUBLIC_URL ||
    env.NEXT_PUBLIC_BIENESTAR_URL ||
    "https://bienestar.b2b.com.ec"

  return {
    port: Number(env.PORT || env.TOOLS_PORT || 8787),
    dataDir: env.TOOLS_DATA_DIR || "./data",
    allowDemoCatalog: bool(env.ALLOW_DEMO_CATALOG, nodeEnv !== "production"),
    crmBackend: crmBackend === "json" ? "json" : "medusa",
    toolsApiToken: env.TOOLS_API_TOKEN,
    storePublicUrl: env.STORE_PUBLIC_URL || kitchenPublicUrl,
    kitchenPublicUrl,
    wellnessPublicUrl,
    medusaStoreApiUrl: env.MEDUSA_STORE_API_URL || "http://localhost:9000",
    medusaAdminApiUrl: env.MEDUSA_ADMIN_API_URL || "http://localhost:9000",
    medusaPublishableKey: env.MEDUSA_PUBLISHABLE_KEY,
    medusaAdminApiKey: env.MEDUSA_ADMIN_API_KEY,
    taxRate: Number(env.ECOMMERCE_TAX_RATE ?? 0.15),
    whatsappSellerNumber: normalizeWhatsappSellerNumber(
      env.WHATSAPP_SELLER_NUMBER || "0979854915",
    ),
    payphoneApiLinkUrl:
      env.PAYPHONE_API_LINK_URL ||
      "https://pay.payphonetodoesposible.com/api/Links",
    payphoneToken: env.PAYPHONE_TOKEN,
    payphoneStoreId: env.PAYPHONE_STORE_ID,
    payphoneDryRun: bool(env.PAYPHONE_DRY_RUN, true),
    metaCatalogBrand: env.META_CATALOG_BRAND || "Eter Niu Cocina",
    metaApiVersion: env.META_API_VERSION || "v23.0",
    pixelEnabled: bool(env.PIXEL_ENABLED || env.NEXT_PUBLIC_PIXEL_ENABLED, true),
    metaPixelId: env.META_PIXEL_ID || env.NEXT_PUBLIC_META_PIXEL_ID,
    metaDatasetId:
      env.META_DATASET_ID || env.META_PIXEL_ID || env.NEXT_PUBLIC_META_PIXEL_ID,
    metaAccessToken: env.META_ACCESS_TOKEN,
    metaCapiTestEventCode: env.META_CAPI_TEST_EVENT_CODE,
  }
}
