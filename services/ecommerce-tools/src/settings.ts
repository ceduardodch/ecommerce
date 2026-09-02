import type { AppConfig } from "./config.js"
import {
  getMedusaCommerceSettings,
  type CommerceSettingRecord,
} from "./medusa-admin.js"

/**
 * Configuración comercial viva.
 *
 * La fuente de verdad es el backend (`crm_setting`, editable en Admin → CRM
 * WhatsApp → Configuración). Antes esto eran variables de entorno de Coolify:
 * cambiar el cupón o el IVA exigía redeploy y la cuenta bancaria no tenía
 * dónde vivir sin quedar en un repo público.
 *
 * El objeto `AppConfig` se muta en sitio a propósito: todo el servicio ya lo
 * lee en cada llamada (`config.taxRate`, `config.whatsappSellerNumber`...), así
 * que actualizarlo aquí propaga el cambio sin tocar cada consumidor. Si el
 * backend no responde, se conserva lo último bueno y, en el peor caso, los
 * valores de arranque: el bot nunca se queda sin IVA ni sin número de venta.
 */

const REFRESH_INTERVAL_MS = 5 * 60 * 1000

/** Ajuste del backend → campo de AppConfig. */
const FIELD_BY_KEY = {
  pago_banco_nombre: "bankName",
  pago_banco_titular: "bankAccountHolder",
  pago_banco_ruc: "bankAccountTaxId",
  pago_banco_tipo_cuenta: "bankAccountType",
  pago_banco_numero: "bankAccountNumber",
  pago_datafast_nombre_comercial: "datafastCustomerName",
  marca_instagram_url: "brandInstagramUrl",
  marca_whatsapp_venta: "whatsappSellerNumber",
  comercial_cupon_cocina: "couponCodeCocina",
  comercial_cupon_bienestar: "couponCodeBienestar",
  comercial_meta_marca: "metaCatalogBrand",
} as const satisfies Record<string, keyof AppConfig>

let lastGood: CommerceSettingRecord[] | undefined
let timer: ReturnType<typeof setInterval> | undefined

export function applyCommerceSettings(
  config: AppConfig,
  items: CommerceSettingRecord[],
) {
  for (const item of items) {
    const value = (item.value ?? "").trim()
    // Un ajuste vacío significa "todavía no configurado": no debe borrar el
    // valor de arranque (por ejemplo, dejar la tienda sin cupón).
    if (!value) continue

    if (item.key === "pago_transferencia_activa") {
      config.bankTransferEnabled = value === "true"
      continue
    }

    if (item.key === "comercial_iva") {
      const parsed = Number(value)
      if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 1) {
        config.taxRate = parsed
      }
      continue
    }

    const field = FIELD_BY_KEY[item.key as keyof typeof FIELD_BY_KEY]
    if (field) {
      ;(config as unknown as Record<string, string>)[field] = value
    }
  }
  return config
}

/**
 * Recarga la configuración desde el backend. Nunca lanza: un fallo deja el
 * servicio con la última configuración conocida.
 */
export async function refreshCommerceSettings(
  config: AppConfig,
  loader: (config: AppConfig) => Promise<CommerceSettingRecord[]> = getMedusaCommerceSettings,
) {
  if (config.crmBackend !== "medusa" || !config.medusaAdminApiKey) {
    return lastGood
  }

  try {
    const items = await loader(config)
    if (Array.isArray(items) && items.length) {
      lastGood = items
      applyCommerceSettings(config, items)
    }
  } catch (error) {
    console.warn(
      `[settings] no se pudo leer la configuración comercial: ${
        error instanceof Error ? error.message : String(error)
      }`,
    )
    if (lastGood) applyCommerceSettings(config, lastGood)
  }

  return lastGood
}

export function startCommerceSettingsRefresh(
  config: AppConfig,
  intervalMs = REFRESH_INTERVAL_MS,
) {
  if (timer) clearInterval(timer)
  timer = setInterval(() => void refreshCommerceSettings(config), intervalMs)
  timer.unref?.()
  return timer
}

/** Solo para tests: olvida la caché en memoria. */
export function resetCommerceSettingsCache() {
  lastGood = undefined
  if (timer) clearInterval(timer)
  timer = undefined
}

/**
 * Subconjunto publicable: lo que el storefront puede pintar en la web. El
 * número de cuenta queda fuera a propósito — solo se entrega por WhatsApp.
 */
export function publicCommerceSettings(config: AppConfig) {
  return {
    coupons: {
      cocina: config.couponCodeCocina,
      bienestar: config.couponCodeBienestar,
    },
    taxRate: config.taxRate,
    whatsappSellerNumber: config.whatsappSellerNumber,
    instagramUrl: config.brandInstagramUrl,
    payment: {
      transferEnabled: config.bankTransferEnabled,
      bankName: config.bankName,
      accountHolder: config.bankAccountHolder,
      taxId: config.bankAccountTaxId,
      cardEnabled: true,
    },
  }
}
