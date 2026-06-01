import { NextRequest } from "next/server"
import {
  fallbackProducts,
  wellnessFallbackProducts,
} from "../../../../lib/catalog"
import { kitchenBaseUrl, wellnessBaseUrl } from "../../../../lib/domains"

export const dynamic = "force-dynamic"
export const revalidate = 0

function csv(value: string | number) {
  const text = String(value ?? "")
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`
  return text
}

function verticalFromRequest(request: NextRequest) {
  const queryVertical = request.nextUrl.searchParams.get("vertical")
  if (queryVertical === "bienestar" || queryVertical === "cocina") {
    return queryVertical
  }
  const host = (request.headers.get("host") || "").toLowerCase()
  return host.includes("bienestar") ? "bienestar" : "cocina"
}

function baseUrlForVertical(vertical: "cocina" | "bienestar") {
  return vertical === "bienestar" ? wellnessBaseUrl : kitchenBaseUrl
}

function absoluteImageLink(imageUrl: string, vertical: "cocina" | "bienestar") {
  if (!imageUrl.startsWith("/")) return imageUrl
  const storeUrl = baseUrlForVertical(vertical)
  return `${storeUrl.replace(/\/$/, "")}${imageUrl}`
}

function fallbackCsv(vertical: "cocina" | "bienestar") {
  const products =
    vertical === "bienestar" ? wellnessFallbackProducts : fallbackProducts
  const columns = [
    "id",
    "title",
    "description",
    "availability",
    "condition",
    "price",
    "link",
    "image_link",
    "brand",
    "sale_price",
  ]
  const rows = products.map((product) => [
    product.sku || product.id,
    product.title,
    product.description,
    product.stock > 0 ? "in stock" : "out of stock",
    "new",
    product.originalPrice && product.originalPrice.amount > product.price.amount
      ? `${product.originalPrice.amount.toFixed(2)} USD`
      : `${product.price.amount.toFixed(2)} USD`,
    product.productUrl,
    absoluteImageLink(product.imageUrl, vertical),
    product.brand,
    product.originalPrice && product.originalPrice.amount > product.price.amount
      ? `${product.price.amount.toFixed(2)} USD`
      : "",
  ])

  return [columns.join(","), ...rows.map((row) => row.map(csv).join(","))].join(
    "\n",
  )
}

export async function GET(request: NextRequest) {
  const vertical = verticalFromRequest(request)
  const toolsUrl =
    process.env.TOOLS_API_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_TOOLS_API_URL ||
    "http://localhost:8787"
  const allowDemoCatalog =
    process.env.ALLOW_DEMO_CATALOG === "true" ||
    process.env.NEXT_PUBLIC_ALLOW_DEMO_CATALOG === "true" ||
    process.env.NODE_ENV !== "production"

  try {
    const url = new URL("/feeds/meta/catalog.csv", toolsUrl)
    url.searchParams.set("vertical", vertical)
    const response = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(2000),
    })
    if (!response.ok) throw new Error("catalog feed unavailable")
    const csv = await response.text()
    return new Response(csv, {
      headers: {
        "cache-control": "no-store, no-cache, must-revalidate",
        "content-type": "text/csv; charset=utf-8",
      },
    })
  } catch {
    if (!allowDemoCatalog) {
      return new Response(fallbackCsv(vertical).split("\n")[0] + "\n", {
        headers: {
          "cache-control": "no-store, no-cache, must-revalidate",
          "content-type": "text/csv; charset=utf-8",
        },
      })
    }

    return new Response(fallbackCsv(vertical), {
      headers: {
        "cache-control": "no-store, no-cache, must-revalidate",
        "content-type": "text/csv; charset=utf-8",
      },
    })
  }
}
