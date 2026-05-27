import type { Product } from "./types.js"

function csv(value: string | number) {
  const text = String(value ?? "")
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`
  return text
}

export function buildMetaCatalogCsv(products: Product[]) {
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

export function buildMetaDraft(products: Product[], angle: string) {
  const names = products.map((product) => product.title).join(", ")
  const priceAnchor = products
    .map((product) => `${product.title}: $${product.price.amount.toFixed(2)}`)
    .join("\n")

  return {
    facebook:
      `Tenemos disponible ${names}.\n\n` +
      `Enfoque: ${angle}. Resolvemos por WhatsApp: recomendacion, cotizacion y link de pago.\n\n` +
      priceAnchor,
    instagram:
      `${names}\n\nVenta por WhatsApp, cotizacion rapida y pago con link. Escribenos para confirmar stock.`,
    marketplace: products.map((product) => ({
      title: product.title.slice(0, 80),
      price: product.price.amount,
      description:
        `${product.description}\n\nStock: ${product.stock}. Pago por link PayPhone. Entrega y factura se confirman por WhatsApp.`,
      checklist: [
        "Confirmar stock antes de publicar",
        "Usar fotos reales si el producto ya esta en bodega",
        "Revisar categoria y ubicacion en Facebook Marketplace",
        "Publicar manualmente o con navegador supervisado",
      ],
    })),
  }
}
