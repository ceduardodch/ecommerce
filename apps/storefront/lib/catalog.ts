export type Product = {
  id: string
  variantId: string
  sku: string
  title: string
  description: string
  category: string
  brand: string
  price: { amount: number; currency: "USD" }
  stock: number
  imageUrl: string
  productUrl: string
  tags: string[]
}

export const fallbackProducts: Product[] = [
  {
    id: "prod-cctv-kit-4",
    variantId: "var-cctv-kit-4",
    sku: "B2B-CCTV-4CH",
    title: "Kit CCTV IP 4 camaras",
    description:
      "Videovigilancia para local, oficina o bodega con NVR y soporte de instalacion.",
    category: "Seguridad",
    brand: "B2B",
    price: { amount: 389, currency: "USD" },
    stock: 8,
    imageUrl:
      "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1000&q=80",
    productUrl: "https://shop.b2b.com.ec/products/kit-cctv-ip-4-camaras",
    tags: ["seguridad", "camaras", "cctv"],
  },
  {
    id: "prod-router-wifi6",
    variantId: "var-router-wifi6",
    sku: "B2B-NET-WIFI6",
    title: "Router empresarial WiFi 6",
    description:
      "Red estable para negocios con alta concurrencia, invitados y administracion remota.",
    category: "Redes",
    brand: "B2B",
    price: { amount: 169, currency: "USD" },
    stock: 14,
    imageUrl:
      "https://images.unsplash.com/photo-1606904825846-647eb07f5be2?auto=format&fit=crop&w=1000&q=80",
    productUrl: "https://shop.b2b.com.ec/products/router-empresarial-wifi-6",
    tags: ["wifi", "router", "redes"],
  },
  {
    id: "prod-pos-movil",
    variantId: "var-pos-movil",
    sku: "B2B-POS-MOVIL",
    title: "POS movil para ventas por WhatsApp",
    description:
      "Terminal movil para cobros y ventas en campo, recomendado para ventas por chat.",
    category: "Ventas",
    brand: "B2B",
    price: { amount: 119, currency: "USD" },
    stock: 11,
    imageUrl:
      "https://images.unsplash.com/photo-1556741533-6e6a62bd8b49?auto=format&fit=crop&w=1000&q=80",
    productUrl: "https://shop.b2b.com.ec/products/pos-movil-whatsapp",
    tags: ["pos", "ventas", "whatsapp"],
  },
]

export async function getProducts() {
  const toolsUrl =
    process.env.TOOLS_API_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_TOOLS_API_URL ||
    "http://localhost:8787"

  try {
    const response = await fetch(`${toolsUrl}/tools/search-products?limit=12`, {
      next: { revalidate: 60 },
    })
    if (!response.ok) throw new Error("tools unavailable")
    const data = (await response.json()) as { products?: Product[] }
    return data.products?.length ? data.products : fallbackProducts
  } catch {
    return fallbackProducts
  }
}

export function whatsappLink(product: Product) {
  const seller = process.env.NEXT_PUBLIC_WHATSAPP_SELLER_NUMBER || "593999999999"
  const text = `Hola, quiero cotizar ${product.title} (${product.sku}).`
  return `https://wa.me/${seller}?text=${encodeURIComponent(text)}`
}
