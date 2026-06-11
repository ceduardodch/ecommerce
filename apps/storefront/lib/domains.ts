export const brandBaseUrl =
  process.env.NEXT_PUBLIC_BRAND_URL || "https://www.eter-niu.com"
export const kitchenBaseUrl =
  process.env.NEXT_PUBLIC_COCINA_URL || "https://cocina.b2b.com.ec"
export const wellnessBaseUrl =
  process.env.NEXT_PUBLIC_BIENESTAR_URL || "https://bienestar.b2b.com.ec"
export const legacyShopBaseUrl =
  process.env.NEXT_PUBLIC_STORE_URL || "https://shop.b2b.com.ec"

export function publicBaseUrlForVertical(vertical?: "cocina" | "bienestar") {
  return vertical === "bienestar" ? wellnessBaseUrl : kitchenBaseUrl
}

export function publicCampaignPath(
  vertical: "cocina" | "bienestar",
  slug: string,
  sku: string,
  campaign = vertical === "bienestar" ? "bienestar_home" : "cocina_home",
) {
  const base = publicBaseUrlForVertical(vertical)
  const url = new URL(`/campanas/${slug}`, base)
  url.searchParams.set("sku", sku)
  url.searchParams.set("utm_source", "site")
  url.searchParams.set("utm_medium", "organic")
  url.searchParams.set("utm_campaign", campaign)
  return url.toString()
}
