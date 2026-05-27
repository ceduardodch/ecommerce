import type { Product } from "./types.js"

export const demoCatalog: Product[] = [
  {
    id: "prod-cctv-kit-4",
    variantId: "var-cctv-kit-4",
    sku: "B2B-CCTV-4CH",
    title: "Kit CCTV IP 4 camaras",
    description:
      "Kit de videovigilancia para local, oficina o bodega con cuatro camaras IP, NVR y soporte de instalacion.",
    category: "Seguridad",
    brand: "B2B",
    price: { amount: 389, currency: "USD" },
    stock: 8,
    imageUrl:
      "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1000&q=80",
    productUrl: "https://shop.b2b.com.ec/products/kit-cctv-ip-4-camaras",
    tags: ["camaras", "seguridad", "local", "bodega", "cctv"],
  },
  {
    id: "prod-router-wifi6",
    variantId: "var-router-wifi6",
    sku: "B2B-NET-WIFI6",
    title: "Router empresarial WiFi 6",
    description:
      "Router WiFi 6 para negocios con alta concurrencia, red de invitados y administracion remota.",
    category: "Redes",
    brand: "B2B",
    price: { amount: 169, currency: "USD" },
    stock: 14,
    imageUrl:
      "https://images.unsplash.com/photo-1606904825846-647eb07f5be2?auto=format&fit=crop&w=1000&q=80",
    productUrl: "https://shop.b2b.com.ec/products/router-empresarial-wifi-6",
    tags: ["wifi", "router", "redes", "oficina", "internet"],
  },
  {
    id: "prod-pos-movil",
    variantId: "var-pos-movil",
    sku: "B2B-POS-MOVIL",
    title: "POS movil para ventas por WhatsApp",
    description:
      "Terminal movil para cobros y ventas en campo, recomendado para negocios que venden por chat.",
    category: "Ventas",
    brand: "B2B",
    price: { amount: 119, currency: "USD" },
    stock: 11,
    imageUrl:
      "https://images.unsplash.com/photo-1556741533-6e6a62bd8b49?auto=format&fit=crop&w=1000&q=80",
    productUrl: "https://shop.b2b.com.ec/products/pos-movil-whatsapp",
    tags: ["pos", "ventas", "whatsapp", "cobro", "pago"],
  },
]
