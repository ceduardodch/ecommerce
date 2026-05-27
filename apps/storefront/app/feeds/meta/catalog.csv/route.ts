import { fallbackProducts } from "../../../../lib/catalog"

export const dynamic = "force-dynamic"
export const revalidate = 0

function csv(value: string | number) {
  const text = String(value ?? "")
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`
  return text
}

function absoluteImageLink(imageUrl: string) {
  if (!imageUrl.startsWith("/")) return imageUrl
  const storeUrl =
    process.env.NEXT_PUBLIC_STORE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://shop.b2b.com.ec"
  return `${storeUrl.replace(/\/$/, "")}${imageUrl}`
}

function fallbackCsv() {
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
  const rows = fallbackProducts.map((product) => [
    product.sku || product.id,
    product.title,
    product.description,
    product.stock > 0 ? "in stock" : "out of stock",
    "new",
    product.originalPrice && product.originalPrice.amount > product.price.amount
      ? `${product.originalPrice.amount.toFixed(2)} USD`
      : `${product.price.amount.toFixed(2)} USD`,
    product.productUrl,
    absoluteImageLink(product.imageUrl),
    product.brand,
    product.originalPrice && product.originalPrice.amount > product.price.amount
      ? `${product.price.amount.toFixed(2)} USD`
      : "",
  ])

  return [columns.join(","), ...rows.map((row) => row.map(csv).join(","))].join(
    "\n",
  )
}

export async function GET() {
  const toolsUrl =
    process.env.TOOLS_API_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_TOOLS_API_URL ||
    "http://localhost:8787"
  const allowDemoCatalog =
    process.env.ALLOW_DEMO_CATALOG === "true" ||
    process.env.NEXT_PUBLIC_ALLOW_DEMO_CATALOG === "true" ||
    process.env.NODE_ENV !== "production"

  try {
    const response = await fetch(`${toolsUrl}/feeds/meta/catalog.csv`, {
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
      return new Response(fallbackCsv().split("\n")[0] + "\n", {
        headers: {
          "cache-control": "no-store, no-cache, must-revalidate",
          "content-type": "text/csv; charset=utf-8",
        },
      })
    }

    return new Response(fallbackCsv(), {
      headers: {
        "cache-control": "no-store, no-cache, must-revalidate",
        "content-type": "text/csv; charset=utf-8",
      },
    })
  }
}
