export type AppConfig = {
  port: number
  dataDir: string
  toolsApiToken?: string
  storePublicUrl: string
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
}

function bool(value: string | undefined, fallback: boolean) {
  if (value === undefined || value === "") return fallback
  return ["1", "true", "yes", "y"].includes(value.toLowerCase())
}

export function loadConfig(env = process.env): AppConfig {
  return {
    port: Number(env.PORT || env.TOOLS_PORT || 8787),
    dataDir: env.TOOLS_DATA_DIR || "./data",
    toolsApiToken: env.TOOLS_API_TOKEN,
    storePublicUrl: env.STORE_PUBLIC_URL || "https://shop.b2b.com.ec",
    medusaStoreApiUrl: env.MEDUSA_STORE_API_URL || "http://localhost:9000",
    medusaAdminApiUrl: env.MEDUSA_ADMIN_API_URL || "http://localhost:9000",
    medusaPublishableKey: env.MEDUSA_PUBLISHABLE_KEY,
    medusaAdminApiKey: env.MEDUSA_ADMIN_API_KEY,
    taxRate: Number(env.ECOMMERCE_TAX_RATE ?? 0.15),
    whatsappSellerNumber: env.WHATSAPP_SELLER_NUMBER || "593999999999",
    payphoneApiLinkUrl:
      env.PAYPHONE_API_LINK_URL ||
      "https://pay.payphonetodoesposible.com/api/Links",
    payphoneToken: env.PAYPHONE_TOKEN,
    payphoneStoreId: env.PAYPHONE_STORE_ID,
    payphoneDryRun: bool(env.PAYPHONE_DRY_RUN, true),
    metaCatalogBrand: env.META_CATALOG_BRAND || "B2B",
  }
}
