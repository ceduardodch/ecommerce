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
    "\n",
  )
}

export function buildMetaDraft(products: Product[], angle: string) {
  const names = products.map((product) => product.title).join(", ")
  const priceAnchor = products
    .map((product) => {
      const material = product.material ? ` (${product.material})` : ""
      const promo = product.promoLabel ? ` - ${product.promoLabel}` : ""
      return `${product.title}${material}: $${product.price.amount.toFixed(2)}${promo}`
    })
    .join("\n")

  return {
    facebook:
      `Cocina lista para vender y cocinar mejor: ${names}.\n\n` +
      `Enfoque: ${angle}. Te ayudamos por WhatsApp a escoger olla, cuchillo, combo o reposicion segun tu uso real.\n\n` +
      priceAnchor,
    instagram: `${names}\n\nCombos de cocina, promociones reales y cotizacion por WhatsApp. Escribenos para confirmar stock y entrega.`,
    marketplace: products.map((product) => ({
      title: product.title.slice(0, 80),
      price: product.price.amount,
      description: `${product.description}\n\nMaterial: ${product.material || "Por confirmar"}.\nUso recomendado: ${product.tipoCocina || "cocina diaria"}.\nStock: ${product.stock}. Pago por link PayPhone. Entrega y factura se confirman por WhatsApp.`,
      checklist: [
        "Confirmar stock antes de publicar",
        "Usar fotos reales del producto en bodega",
        "Revisar categoria hogar/cocina y ubicacion en Facebook Marketplace",
        "Publicar manualmente o con navegador supervisado",
      ],
    })),
  }
}
