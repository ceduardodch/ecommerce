import type { Product } from "./types.js"

function csv(value: string | number) {
  const text = String(value ?? "")
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`
  return text
}

function withUtm(
  url: string,
  source: string,
  medium = "social",
  campaign = "kitchen_catalog",
) {
  try {
    const target = new URL(url)
    target.searchParams.set("utm_source", source)
    target.searchParams.set("utm_medium", medium)
    target.searchParams.set("utm_campaign", campaign)
    return target.toString()
  } catch {
    return url
  }
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
    withUtm(product.productUrl, "meta_catalog", "catalog"),
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
  const safeAngle =
    angle ||
    "cocina diaria con granito, menos aceite y limpieza facil"
  const priceAnchor = products
    .map((product) => {
      const material = product.material ? ` (${product.material})` : ""
      const promo = product.promoLabel ? ` - ${product.promoLabel}` : ""
      const diameter = product.diameterCm ? ` ${product.diameterCm} cm` : ""
      return `${product.title}${diameter}${material}: $${product.price.amount.toFixed(2)}${promo}\n${withUtm(product.productUrl, "organic_meta")}`
    })
    .join("\n")
  const sourceAngles = products
    .map((product) => {
      if (product.contentAngles?.length) {
        return `${product.title}: ${product.contentAngles.join(", ")}.`
      }
      if (product.id.includes("wok-granito-32")) {
        return "Wok 32 cm: receta completa, shakshuka, salteados y prueba de uso diario."
      }
      if (product.id.includes("olla-granito-20")) {
        return "Olla 20 cm: prueba queso/huevo, no se pega y se limpia rapido."
      }
      if (product.id.includes("olla-granito-24")) {
        return "Olla 24 cm: porciones familiares y cocina con menos aceite."
      }
      if (product.id.includes("set-mgc")) {
        return "Set MGC: cambiar ollas viejas o rayadas por granito de uso diario."
      }
      return product.healthAngle || "Granito para cocinar diario con menos aceite."
    })
    .join("\n")

  return {
    facebook:
      `Ollas de granito para cocinar mejor en casa: ${names}.\n\n` +
      `Enfoque: ${safeAngle}. Te ayudamos por WhatsApp a escoger 20 cm, 24 cm o wok 32 cm segun cuantas personas cocinan y que recetas haces.\n\n` +
      `${sourceAngles}\n\n${priceAnchor}`,
    instagram:
      `${names}\n\nMenos aceite, no se pega y limpieza facil con uso correcto. ` +
      "Escribenos por WhatsApp para confirmar stock, entrega y que tamano te conviene.",
    marketplace: products.map((product) => ({
      title: product.title.slice(0, 80),
      price: product.price.amount,
      description: `${product.description}\n\nMaterial: ${product.material || "Por confirmar"}.\nDiametro: ${product.diameterCm ? `${product.diameterCm} cm` : "Por confirmar"}.\nUso recomendado: ${product.tipoCocina || "cocina diaria"}.\nStock: ${product.stock}. Pago por link PayPhone. Entrega y factura se confirman por WhatsApp.\n\nAngulo sugerido: ${(product.contentAngles || [product.healthAngle || "granito para cocina diaria"])[0]}.\nNota: ${product.claimNote || "declaraciones como PFOA, PFAS o PTFE solo se publican si el proveedor entrega certificacion."}\n\nVer producto: ${withUtm(product.productUrl, "marketplace", "organic", "marketplace_kitchen")}`,
      checklist: [
        "Confirmar stock antes de publicar",
        "Usar fotos reales del producto en bodega",
        "Revisar categoria hogar/cocina y ubicacion en Facebook Marketplace",
        "No publicar claims medicos ni frases de causalidad sobre enfermedades",
        "Publicar manualmente o con navegador supervisado",
      ],
    })),
  }
}
