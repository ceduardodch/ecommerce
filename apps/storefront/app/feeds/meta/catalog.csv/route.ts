import { fallbackProducts } from "../../../../lib/catalog"

export const dynamic = "force-dynamic"
export const revalidate = 0

function csv(value: string | number) {
  const text = String(value ?? "")
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`
  return text
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
    `${product.price.amount.toFixed(2)} USD`,
    product.productUrl,
    product.imageUrl,
    product.brand,
    product.originalPrice && product.originalPrice.amount > product.price.amount
      ? `${product.price.amount.toFixed(2)} USD`
      : "",
  ])

  return [columns.join(","), ...rows.map((row) => row.map(csv).join(","))].join(
    "\n"
  )
}

export async function GET() {
  const toolsUrl =
    process.env.TOOLS_API_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_TOOLS_API_URL ||
    "http://localhost:8787"

  try {
    const response = await fetch(`${toolsUrl}/feeds/meta/catalog.csv`, {
      cache: "no-store",
      signal: AbortSignal.timeout(2000),
    })
    if (!response.ok) throw new Error("catalog feed unavailable")
    const csv = await response.text()
    return new Response(csv, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
      },
    })
  } catch {
    return new Response(fallbackCsv(), {
      headers: {
        "content-type": "text/csv; charset=utf-8",
      },
    })
  }
}
