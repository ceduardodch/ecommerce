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
  // Configuración comercial: valores de ARRANQUE. Los definitivos los sirve el
  // backend (`crm_setting`, Admin → CRM WhatsApp → Configuración) y los aplica
  // `settings.ts` sobre este mismo objeto. Ver docs/CONFIG_COMERCIAL.md.
  taxRate: number
  whatsappSellerNumber: string
  couponCodeCocina: string
  couponCodeBienestar: string
  // Datafast (DataFast Ecuador / ACI oppwa) — botón de pagos con tarjeta
  datafastEnv: "test" | "live"
  datafastDryRun: boolean
  datafastEntityId?: string
  datafastAccessToken?: string
  datafastMid?: string
  datafastTid?: string
  datafastEcommerceId?: string
  datafastServiceProviderId?: string
  datafastCustomerName?: string
  // Transferencia bancaria — la cuenta llega del backend, nunca del repo ni de
  // variables de entorno.
  bankTransferEnabled: boolean
  bankName: string
  bankAccountHolder?: string
  bankAccountTaxId?: string
  bankAccountType: string
  bankAccountNumber?: string
  brandInstagramUrl: string
  metaCatalogBrand: string
  metaApiVersion: string
  pixelEnabled: boolean
  metaPixelId?: string
  metaDatasetId?: string
  metaAccessToken?: string
  metaCapiTestEventCode?: string
  // WhatsApp Cloud API — webhook + outbound
  whatsappWebhookVerifyToken?: string
  whatsappAppSecret?: string
  whatsappPhoneNumberId?: string
  whatsappCloudAccessToken?: string
  whatsappMediaDir: string
  whatsappMediaMaxBytes: number
  whatsappAgentMode: "off" | "openai"
  openaiApiKey?: string
  openaiModel: string
}

function bool(value: string | undefined, fallback: boolean) {
  if (value === undefined || value === "") return fallback
  return ["1", "true", "yes", "y"].includes(value.toLowerCase())
}

/**
 * Número de venta de Eter Niu (Vicky), en formato internacional sin "+".
 *
 * Debe coincidir con `SELLER_WHATSAPP_NUMBER` del storefront
 * (`apps/storefront/lib/whatsapp.ts`). Antes cada servicio tenía el suyo y eran
 * números DISTINTOS: el chat caía en un teléfono o en otro según por dónde
 * entrara el cliente.
 */
const SELLER_WHATSAPP_NUMBER = "593987135207"

function normalizeWhatsappSellerNumber(value: string) {
  const digits = value.replace(/\D/g, "")
  if (digits === "593999999999" || digits === "9999999999") {
    return SELLER_WHATSAPP_NUMBER
  }
  if (digits.startsWith("0") && digits.length === 10) {
    return `593${digits.slice(1)}`
  }
  return digits || SELLER_WHATSAPP_NUMBER
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
    // ECOMMERCE_TAX_RATE y WHATSAPP_SELLER_NUMBER siguen leyéndose como
    // respaldo de arranque: un despliegue que hoy los tenga puestos no debe
    // cambiar de IVA ni de número de venta en silencio al desplegar. El ajuste
    // del backend pisa a ambos en cuanto responde.
    taxRate: Number(env.ECOMMERCE_TAX_RATE ?? 0.15),
    whatsappSellerNumber: normalizeWhatsappSellerNumber(
      env.WHATSAPP_SELLER_NUMBER || "0987135207",
    ),
    couponCodeCocina: "GRANITOHOY",
    couponCodeBienestar: "BIENESTARHOY",
    // Datafast: dry-run por defecto hasta tener credenciales aprobadas
    datafastEnv: env.DATAFAST_ENV === "live" ? "live" : "test",
    datafastDryRun: bool(env.DATAFAST_DRY_RUN, true),
    datafastEntityId: env.DATAFAST_ENTITY_ID,
    datafastAccessToken: env.DATAFAST_ACCESS_TOKEN,
    datafastMid: env.DATAFAST_MID,
    datafastTid: env.DATAFAST_TID,
    datafastEcommerceId: env.DATAFAST_ECOMMERCE_ID,
    datafastServiceProviderId: env.DATAFAST_SERVICE_PROVIDER_ID,
    datafastCustomerName: "ETERNIU",
    // Arranque de la transferencia. El número de cuenta llega SOLO del backend:
    // vacío aquí significa "sin configurar", y entonces el bot escala a un
    // humano en vez de dictar una cuenta inventada.
    bankTransferEnabled: true,
    bankName: "Banco Pichincha",
    bankAccountHolder: undefined,
    bankAccountTaxId: undefined,
    bankAccountType: "Ahorros",
    bankAccountNumber: undefined,
    brandInstagramUrl: "https://instagram.com/eter.niu",
    metaCatalogBrand: "Eter Niu Cocina",
    metaApiVersion: env.META_API_VERSION || "v23.0",
    pixelEnabled: bool(env.PIXEL_ENABLED || env.NEXT_PUBLIC_PIXEL_ENABLED, true),
    metaPixelId: env.META_PIXEL_ID || env.NEXT_PUBLIC_META_PIXEL_ID,
    metaDatasetId:
      env.META_DATASET_ID || env.META_PIXEL_ID || env.NEXT_PUBLIC_META_PIXEL_ID,
    metaAccessToken: env.META_ACCESS_TOKEN,
    metaCapiTestEventCode: env.META_CAPI_TEST_EVENT_CODE,
    // WhatsApp Cloud API
    whatsappWebhookVerifyToken: env.WHATSAPP_WEBHOOK_VERIFY_TOKEN,
    whatsappAppSecret: env.WHATSAPP_APP_SECRET,
    whatsappPhoneNumberId: env.WHATSAPP_PHONE_NUMBER_ID,
    whatsappCloudAccessToken: env.WHATSAPP_ACCESS_TOKEN,
    whatsappMediaDir: env.WHATSAPP_MEDIA_DIR || "/app/data/whatsapp-media",
    whatsappMediaMaxBytes: Number(env.WHATSAPP_MEDIA_MAX_BYTES || 50 * 1024 * 1024),
    whatsappAgentMode: env.WHATSAPP_AGENT_MODE === "openai" ? "openai" : "off",
    openaiApiKey: env.OPENAI_API_KEY,
    openaiModel: env.OPENAI_MODEL || "gpt-5-mini",
  }
}
