export { whatsappLink } from "./whatsapp"

export type Product = {
  id: string
  variantId: string
  sku: string
  title: string
  description: string
  category: string
  brand: string
  price: { amount: number; currency: "USD" }
  originalPrice?: { amount: number; currency: "USD" }
  discountPercent?: number
  promoLabel?: string
  stockSignal?: string
  bundleEligible?: boolean
  deliveryBadge?: string
  material?: string
  coating?: string
  teflonFree?: boolean
  pfoaFree?: boolean
  pfasFree?: boolean
  ptfeFree?: boolean
  capacity?: string
  diameterCm?: number
  pieces?: number
  stoveCompatibility?: string
  tipoCocina?: string
  nivel?: string
  bundleUseCase?: string
  careTips?: string
  healthAngle?: string
  warrantyText?: string
  instagramSourceUrl?: string
  sourceUrls?: string[]
  contentAngles?: string[]
  certificationStatus?: string
  claimNote?: string
  reorderAfterDays?: number
  stock: number
  imageUrl: string
  productUrl: string
  tags: string[]
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function productSlug(product: Product) {
  try {
    const url = new URL(product.productUrl)
    const [, slug] = url.pathname.match(/\/products\/([^/?#]+)/) || []
    if (slug) return decodeURIComponent(slug)
  } catch {
    const [, slug] = product.productUrl.match(/\/products\/([^/?#]+)/) || []
    if (slug) return decodeURIComponent(slug)
  }

  return slugify(product.title || product.sku || product.id)
}

export function productPath(product: Product) {
  return `/products/${productSlug(product)}`
}

export const fallbackProducts: Product[] = [
  {
    id: "prod-wok-granito-32",
    variantId: "var-wok-granito-32",
    sku: "MGC-WOK-GRANITO-32",
    title: "Wok de granito 32 cm con tapa",
    description:
      "Wok amplio para recetas diarias, salteados, huevos y preparaciones con menos aceite.",
    category: "Woks granito",
    brand: "Eter Niu Cocina",
    price: { amount: 150, currency: "USD" },
    originalPrice: { amount: 179, currency: "USD" },
    discountPercent: 16,
    promoLabel: "Producto estrella",
    stockSignal: "8 woks listos para entrega",
    bundleEligible: true,
    deliveryBadge: "Envio coordinado Ecuador",
    material: "Granito antiadherente",
    coating: "Granito",
    teflonFree: true,
    capacity: "Porciones familiares",
    diameterCm: 32,
    pieces: 2,
    stoveCompatibility: "Gas, electrica y vitro segun proveedor",
    tipoCocina: "Familia y recetas",
    nivel: "Uso diario",
    bundleUseCase: "Shakshuka, arroz, salteados y huevos con menos aceite",
    careTips:
      "Usar utensilios de silicona o madera, fuego medio y esponja suave.",
    healthAngle: "Opcion sin teflon para cocinar con menos aceite.",
    warrantyText: "Garantia de fabrica a confirmar por WhatsApp.",
    instagramSourceUrl: "https://www.instagram.com/p/DUhZTX2FSeo/",
    sourceUrls: [
      "https://www.instagram.com/p/DYdciw8oTmW/",
      "https://www.instagram.com/p/DV7N5cXmICF/",
      "https://www.instagram.com/p/DVXbLrPiHnd/",
      "https://www.instagram.com/p/DUhZTX2FSeo/",
      "https://www.instagram.com/p/DSIitliCMDg/",
    ],
    contentAngles: [
      "6 anos usando el wok",
      "huevo con menos aceite",
      "shakshuka en wok 32 cm",
      "tapa de vidrio templado",
    ],
    certificationStatus: "Proveedor por confirmar",
    claimNote:
      "Publicar PFOA, PFAS o PTFE solo si el proveedor entrega certificacion.",
    reorderAfterDays: 180,
    stock: 8,
    imageUrl: "/media/photo-receta-wok.jpg",
    productUrl: "https://shop.b2b.com.ec/products/wok-granito-32cm-tapa",
    tags: [
      "wok",
      "granito",
      "32cm",
      "menos aceite",
      "no se pega",
      "shakshuka",
      "producto estrella",
    ],
  },
  {
    id: "prod-olla-granito-20",
    variantId: "var-olla-granito-20",
    sku: "MGC-OLLA-GRANITO-20",
    title: "Olla de granito 20 cm",
    description:
      "Olla compacta para el dia a dia, porciones pequenas y pruebas de no pega con limpieza facil.",
    category: "Ollas granito",
    brand: "Eter Niu Cocina",
    price: { amount: 95, currency: "USD" },
    originalPrice: { amount: 119, currency: "USD" },
    discountPercent: 20,
    promoLabel: "No se pega",
    stockSignal: "10 ollas disponibles",
    bundleEligible: true,
    deliveryBadge: "Entrega 24-48h segun ciudad",
    material: "Granito antiadherente",
    coating: "Granito",
    teflonFree: true,
    capacity: "1 a 3 personas",
    diameterCm: 20,
    pieces: 1,
    stoveCompatibility: "Gas, electrica y vitro segun proveedor",
    tipoCocina: "Diario ligero",
    nivel: "Inicio saludable",
    bundleUseCase: "Salsas, huevos, queso, avena y porciones pequenas",
    careTips:
      "Evitar metal, precalentar suave y lavar cuando la olla este tibia.",
    healthAngle: "Alternativa a antiadherentes tradicionales para uso diario.",
    warrantyText: "Garantia de fabrica a confirmar por WhatsApp.",
    instagramSourceUrl: "https://www.instagram.com/p/DWfKOWXhvJs/",
    sourceUrls: ["https://www.instagram.com/p/DWfKOWXhvJs/"],
    contentAngles: [
      "prueba queso y huevo",
      "no se pega",
      "limpieza facil en olla 20 cm",
    ],
    certificationStatus: "Proveedor por confirmar",
    claimNote: "Mantener copy educativo; no publicar claims medicos absolutos.",
    reorderAfterDays: 180,
    stock: 10,
    imageUrl: "/media/photo-product-olla-20.jpg",
    productUrl: "https://shop.b2b.com.ec/products/olla-granito-20cm",
    tags: [
      "olla",
      "granito",
      "20cm",
      "no se pega",
      "queso",
      "limpieza facil",
      "menos aceite",
    ],
  },
  {
    id: "prod-olla-granito-24",
    variantId: "var-olla-granito-24",
    sku: "MGC-OLLA-GRANITO-24",
    title: "Olla de granito 24 cm familiar",
    description:
      "Olla familiar para porciones grandes, sopas, guisos y cocina diaria con acabado granito.",
    category: "Ollas granito",
    brand: "Eter Niu Cocina",
    price: { amount: 130, currency: "USD" },
    originalPrice: { amount: 159, currency: "USD" },
    discountPercent: 18,
    promoLabel: "Familiar",
    stockSignal: "12 ollas familiares disponibles",
    bundleEligible: true,
    deliveryBadge: "Stock confirmado",
    material: "Granito antiadherente",
    coating: "Granito",
    teflonFree: true,
    capacity: "3 a 5 personas",
    diameterCm: 24,
    pieces: 1,
    stoveCompatibility: "Gas, electrica y vitro segun proveedor",
    tipoCocina: "Familia",
    nivel: "Uso diario",
    bundleUseCase: "Porciones grandes, sopas, arroz y guisos familiares",
    careTips:
      "Cocinar a fuego medio para conservar el recubrimiento por mas tiempo.",
    healthAngle:
      "Granito para familias que quieren una opcion practica sin teflon.",
    warrantyText: "Garantia de fabrica a confirmar por WhatsApp.",
    instagramSourceUrl: "https://www.instagram.com/p/DVNNNRsFYj0/",
    sourceUrls: [
      "https://www.instagram.com/p/DVewP3viHey/",
      "https://www.instagram.com/p/DVNNNRsFYj0/",
    ],
    contentAngles: [
      "24 cm para porciones familiares",
      "menos aceite en olla familiar",
      "no se pega en uso diario",
    ],
    certificationStatus: "Proveedor por confirmar",
    claimNote:
      "Si se menciona libre de PFOA/PFAS/PTFE, pedir certificacion previa.",
    reorderAfterDays: 180,
    stock: 12,
    imageUrl: "/media/photo-product-olla-24.jpg",
    productUrl: "https://shop.b2b.com.ec/products/olla-granito-24cm-familiar",
    tags: [
      "olla",
      "granito",
      "24cm",
      "familia",
      "porciones grandes",
      "menos aceite",
    ],
  },
  {
    id: "prod-set-mgc-granito",
    variantId: "var-set-mgc-granito",
    sku: "MGC-SET-GRANITO-FAMILIAR",
    title: "Set MGC ollas y sartenes de granito",
    description:
      "Linea MGC para cambiar ollas rayadas por un set de granito de uso diario.",
    category: "Sets granito",
    brand: "Eter Niu Cocina",
    price: { amount: 249, currency: "USD" },
    originalPrice: { amount: 299, currency: "USD" },
    discountPercent: 17,
    promoLabel: "Cambio saludable",
    stockSignal: "5 sets armados",
    bundleEligible: true,
    deliveryBadge: "Entrega coordinada",
    material: "Granito antiadherente",
    coating: "Granito",
    teflonFree: true,
    capacity: "Cocina completa",
    pieces: 5,
    stoveCompatibility: "Gas, electrica y vitro segun proveedor",
    tipoCocina: "Casa completa",
    nivel: "Kit familiar",
    bundleUseCase: "Reemplazar ollas viejas y equipar la cocina principal",
    careTips:
      "Guardar sin raspar piezas entre si y usar protectores si se apilan.",
    healthAngle:
      "Set de granito para cocinar todos los dias con menos preocupacion.",
    warrantyText: "Garantia de fabrica a confirmar por WhatsApp.",
    instagramSourceUrl: "https://www.instagram.com/p/DU_bJI4iCTW/",
    sourceUrls: [
      "https://www.instagram.com/p/DU_bJI4iCTW/",
      "https://www.instagram.com/p/DUmeEY_FR2i/",
      "https://www.instagram.com/p/DSIitliCMDg/",
    ],
    contentAngles: [
      "cambiar ollas viejas o rayadas",
      "linea MGC granito",
      "cocina diaria con menos preocupacion",
    ],
    certificationStatus: "Proveedor por confirmar",
    claimNote: "Set saludable como eleccion informada, sin promesas medicas.",
    reorderAfterDays: 210,
    stock: 5,
    imageUrl: "/media/photo-product-set-granito.jpg",
    productUrl:
      "https://shop.b2b.com.ec/products/set-mgc-ollas-sartenes-granito",
    tags: [
      "set",
      "mgc",
      "granito",
      "ollas",
      "sartenes",
      "cambio saludable",
      "cocina completa",
    ],
  },
  {
    id: "prod-sarten-wok-granito-28",
    variantId: "var-sarten-wok-granito-28",
    sku: "MGC-SARTEN-WOK-GRANITO-28",
    title: "Sarten wok granito para recetas rapidas",
    description:
      "Sarten tipo wok para huevos, vegetales y recetas rapidas con menos aceite.",
    category: "Sartenes granito",
    brand: "Eter Niu Cocina",
    price: { amount: 85, currency: "USD" },
    originalPrice: { amount: 105, currency: "USD" },
    discountPercent: 19,
    promoLabel: "Menos aceite",
    stockSignal: "14 sartenes disponibles",
    bundleEligible: true,
    deliveryBadge: "Despacho rapido",
    material: "Granito antiadherente",
    coating: "Granito",
    teflonFree: true,
    capacity: "1 a 4 personas",
    diameterCm: 28,
    pieces: 1,
    stoveCompatibility: "Gas, electrica y vitro segun proveedor",
    tipoCocina: "Recetas rapidas",
    nivel: "Uso diario",
    bundleUseCase: "Huevos, vegetales, pollo y salteados de semana",
    careTips: "Usar fuego medio y evitar aerosoles que saturen la superficie.",
    healthAngle: "Pensado para cocinar ligero sin depender de mucho aceite.",
    warrantyText: "Garantia de fabrica a confirmar por WhatsApp.",
    instagramSourceUrl: "https://www.instagram.com/p/DV7N5cXmICF/",
    sourceUrls: [
      "https://www.instagram.com/p/DV7N5cXmICF/",
      "https://www.instagram.com/p/DVXbLrPiHnd/",
    ],
    contentAngles: [
      "huevo sin depender de mucho aceite",
      "recetas rapidas entre semana",
      "salteados y desayuno",
    ],
    certificationStatus: "Proveedor por confirmar",
    claimNote:
      "Hablar de menos aceite como uso culinario, no como tratamiento de salud.",
    reorderAfterDays: 180,
    stock: 14,
    imageUrl: "/media/photo-prueba-huevo.jpg",
    productUrl:
      "https://shop.b2b.com.ec/products/sarten-wok-granito-recetas-rapidas",
    tags: [
      "sarten",
      "wok",
      "granito",
      "28cm",
      "huevo sin aceite",
      "recetas rapidas",
    ],
  },
  {
    id: "prod-utensilios-granito",
    variantId: "var-utensilios-granito",
    sku: "MGC-UTENSILIOS-CUIDADO",
    title: "Utensilios compatibles para granito",
    description:
      "Kit de utensilios suaves para cuidar ollas y sartenes de granito sin rayarlas.",
    category: "Complementos",
    brand: "Eter Niu Cocina",
    price: { amount: 28, currency: "USD" },
    originalPrice: { amount: 35, currency: "USD" },
    discountPercent: 20,
    promoLabel: "Cuida tu olla",
    stockSignal: "20 kits disponibles",
    bundleEligible: true,
    deliveryBadge: "Agregar al pedido",
    material: "Silicona y madera",
    capacity: "Kit de cuidado",
    pieces: 4,
    tipoCocina: "Complemento",
    nivel: "Cuidado",
    bundleUseCase: "Evitar rayones y alargar la vida del recubrimiento",
    careTips: "No apoyar sobre llama directa y lavar despues de cada uso.",
    healthAngle:
      "Complemento para mantener el antiadherente sin usar utensilios metalicos.",
    warrantyText: "Garantia de fabrica a confirmar por WhatsApp.",
    sourceUrls: [
      "https://www.facebook.com/infintyimportsec/photos",
      "https://www.instagram.com/stories/highlights/18046750105530201/",
    ],
    contentAngles: [
      "cuidado del recubrimiento",
      "utensilios suaves para no rayar",
      "complemento recomendado tras compra",
    ],
    certificationStatus: "No aplica",
    claimNote:
      "Complemento operativo para cuidado; no usarlo como claim de salud.",
    reorderAfterDays: 120,
    stock: 20,
    imageUrl: "/media/photo-product-utensilios.jpg",
    productUrl:
      "https://shop.b2b.com.ec/products/utensilios-compatibles-granito",
    tags: [
      "utensilios",
      "granito",
      "silicona",
      "madera",
      "cuidado",
      "complemento",
    ],
  },
]

function isGeneratedPlaceholder(url?: string) {
  return !url || url.includes("placehold.co")
}

function generatedImageForProduct(product: Product) {
  const haystack = `${product.sku} ${product.title} ${product.category}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
  if (haystack.includes("utensilio")) {
    return "/media/photo-product-utensilios.jpg"
  }
  if (haystack.includes("set")) {
    return "/media/photo-product-set-granito.jpg"
  }
  if (haystack.includes("24")) {
    return "/media/photo-product-olla-24.jpg"
  }
  if (haystack.includes("20")) {
    return "/media/photo-product-olla-20.jpg"
  }
  if (haystack.includes("sarten")) {
    return "/media/photo-prueba-huevo.jpg"
  }
  if (haystack.includes("wok")) {
    return "/media/photo-receta-wok.jpg"
  }
  return "/media/photo-hero-cocina.jpg"
}

function placeholderForProduct(product: Product) {
  if (!isGeneratedPlaceholder(product.imageUrl)) return product.imageUrl
  return generatedImageForProduct(product)
}

const kitchenTerms = [
  "cocina",
  "olla",
  "ollas",
  "wok",
  "woks",
  "sarten",
  "sartenes",
  "set",
  "granito",
  "mgc",
  "teflon",
  "pfoa",
  "pfas",
  "ptfe",
  "menos aceite",
  "no se pega",
  "familia",
  "utensilio",
  "utensilios",
  "complemento",
  "cuchillo",
  "cuchillos",
]

function isKitchenProduct(product: Product) {
  if (product.sku.startsWith("COC-") || product.sku.startsWith("MGC-")) {
    return true
  }
  const haystack = [
    product.title,
    product.description,
    product.category,
    product.brand,
    product.material || "",
    product.coating || "",
    product.tipoCocina || "",
    product.bundleUseCase || "",
    product.healthAngle || "",
    ...(product.sourceUrls || []),
    ...(product.contentAngles || []),
    ...product.tags,
  ]
    .join(" ")
    .toLowerCase()
  return kitchenTerms.some((term) => haystack.includes(term))
}

function normalizeProduct(product: Product): Product {
  return {
    ...product,
    brand: product.brand || "Eter Niu Cocina",
    imageUrl: placeholderForProduct(product),
    tags: product.tags || [],
  }
}

export async function getProducts() {
  const toolsUrl =
    process.env.TOOLS_API_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_TOOLS_API_URL ||
    "http://localhost:8787"
  const allowDemoCatalog =
    process.env.ALLOW_DEMO_CATALOG === "true" ||
    process.env.NEXT_PUBLIC_ALLOW_DEMO_CATALOG === "true" ||
    process.env.NODE_ENV !== "production"

  try {
    const headers: Record<string, string> = {}
    if (process.env.TOOLS_API_TOKEN) {
      headers.authorization = `Bearer ${process.env.TOOLS_API_TOKEN}`
    }

    const response = await fetch(`${toolsUrl}/tools/search-products?limit=12`, {
      cache: "no-store",
      headers,
    })
    if (!response.ok) throw new Error("tools unavailable")
    const data = (await response.json()) as { products?: Product[] }
    const kitchenProducts = (data.products || [])
      .map(normalizeProduct)
      .filter(isKitchenProduct)
    return kitchenProducts.length
      ? kitchenProducts
      : allowDemoCatalog
        ? fallbackProducts
        : []
  } catch {
    return allowDemoCatalog ? fallbackProducts : []
  }
}

export async function getProductBySlug(slug: string) {
  const products = await getProducts()
  const normalizedSlug = decodeURIComponent(slug)
  return products.find((product) => productSlug(product) === normalizedSlug)
}
