export const ETER_NIU_PUBLIC_URLS = {
  brand: "https://eter-niu.com",
  kitchen: "https://cocina.eter-niu.com",
  wellness: "https://bienestar.eter-niu.com",
  admin: "https://admin.eter-niu.com",
} as const

/** Corrige URLs heredadas antes de exponer catálogo, carrito o mensajes. */
export function canonicalizeEterNiuPublicUrls(value: string): string {
  return value
    .replace(
      /https?:\/\/(?:www\.)?cocina\.b2b\.com\.ec/gi,
      ETER_NIU_PUBLIC_URLS.kitchen,
    )
    .replace(
      /https?:\/\/(?:www\.)?bienestar\.b2b\.com\.ec/gi,
      ETER_NIU_PUBLIC_URLS.wellness,
    )
    .replace(
      /https?:\/\/(?:www\.)?shop\.b2b\.com\.ec/gi,
      ETER_NIU_PUBLIC_URLS.brand,
    )
    .replace(
      /https?:\/\/(?:www\.)?adminshop\.b2b\.com\.ec/gi,
      ETER_NIU_PUBLIC_URLS.admin,
    )
}
