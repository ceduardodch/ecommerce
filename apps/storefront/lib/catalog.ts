import {
  defaultCouponCode,
  defaultPaymentMethods,
  defaultStoveCompatibility,
  defaultFreeShippingLabel,
} from "./commercial"
import { kitchenBaseUrl, wellnessBaseUrl } from "./domains"

export { whatsappLink } from "./whatsapp"

export type Product = {
  id: string
  variantId: string
  sku: string
  vertical?: "cocina" | "bienestar"
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
  freeShipping?: boolean
  paymentMethods?: string[]
  couponCode?: string
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
    vertical: "cocina",
    title: "Wok de granito 32 cm con tapa",
    description:
      "Wok amplio para recetas diarias, salteados y preparaciones familiares con menos aceite.",
    category: "Woks granito",
    brand: "Eter Niu Cocina",
    price: { amount: 150, currency: "USD" },
    originalPrice: { amount: 179, currency: "USD" },
    discountPercent: 16,
    promoLabel: "Producto estrella",
    stockSignal: "8 woks listos para entrega",
    bundleEligible: true,
    deliveryBadge: "Envio gratis Ecuador",
    material: "Granito antiadherente",
    coating: "Granito",
    teflonFree: true,
    capacity: "Porciones familiares",
    diameterCm: 32,
    pieces: 2,
    stoveCompatibility: "Gas, induccion y vitroceramica",
    tipoCocina: "Familia y recetas",
    nivel: "Uso diario",
    bundleUseCase: "Shakshuka, arroz, salteados y vegetales con menos aceite",
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
      "granito y tapa visibles",
      "shakshuka en wok 32 cm",
      "tapa de vidrio templado",
    ],
    certificationStatus: "Proveedor por confirmar",
    claimNote:
      "Publicar PFOA, PFAS o PTFE solo si el proveedor entrega certificacion.",
    reorderAfterDays: 180,
    stock: 8,
    imageUrl: "/media/photo-receta-wok.jpg",
    productUrl: `${kitchenBaseUrl}/products/wok-granito-32cm-tapa`,
    tags: [
      "wok",
      "granito",
      "32cm",
      "menos aceite",
      "granito real",
      "shakshuka",
      "producto estrella",
    ],
  },
  {
    id: "prod-olla-granito-20",
    variantId: "var-olla-granito-20",
    sku: "MGC-OLLA-GRANITO-20",
    vertical: "cocina",
    title: "Olla de granito 20 cm",
    description:
      "Olla compacta para el dia a dia, porciones pequenas y cocina practica en casa.",
    category: "Ollas granito",
    brand: "Eter Niu Cocina",
    price: { amount: 95, currency: "USD" },
    originalPrice: { amount: 119, currency: "USD" },
    discountPercent: 20,
    promoLabel: "Uso diario",
    stockSignal: "10 ollas disponibles",
    bundleEligible: true,
    deliveryBadge: "Envio gratis 24-48h segun ciudad",
    material: "Granito antiadherente",
    coating: "Granito",
    teflonFree: true,
    capacity: "1 a 3 personas",
    diameterCm: 20,
    pieces: 1,
    stoveCompatibility: "Gas, induccion y vitroceramica",
    tipoCocina: "Diario ligero",
    nivel: "Inicio saludable",
    bundleUseCase: "Salsas, avena, guarniciones y porciones pequenas",
    careTips:
      "Evitar metal, precalentar suave y lavar cuando la olla este tibia.",
    healthAngle: "Alternativa a antiadherentes tradicionales para uso diario.",
    warrantyText: "Garantia de fabrica a confirmar por WhatsApp.",
    instagramSourceUrl: "https://www.instagram.com/p/DWfKOWXhvJs/",
    sourceUrls: ["https://www.instagram.com/p/DWfKOWXhvJs/"],
    contentAngles: [
      "tamano compacto para porciones pequenas",
      "granito visible en olla 20 cm",
      "uso diario en cocina real",
    ],
    certificationStatus: "Proveedor por confirmar",
    claimNote: "Mantener copy educativo; no publicar claims medicos absolutos.",
    reorderAfterDays: 180,
    stock: 10,
    imageUrl: "/media/photo-product-olla-20.jpg",
    productUrl: `${kitchenBaseUrl}/products/olla-granito-20cm`,
    tags: [
      "olla",
      "granito",
      "20cm",
      "uso diario",
      "porciones pequenas",
      "granito visible",
      "menos aceite",
    ],
  },
  {
    id: "prod-olla-granito-24",
    variantId: "var-olla-granito-24",
    sku: "MGC-OLLA-GRANITO-24",
    vertical: "cocina",
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
    deliveryBadge: "Envio gratis con stock confirmado",
    material: "Granito antiadherente",
    coating: "Granito",
    teflonFree: true,
    capacity: "3 a 5 personas",
    diameterCm: 24,
    pieces: 1,
    stoveCompatibility: "Gas, induccion y vitroceramica",
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
      "uso diario en hornilla",
    ],
    certificationStatus: "Proveedor por confirmar",
    claimNote:
      "Si se menciona libre de PFOA/PFAS/PTFE, pedir certificacion previa.",
    reorderAfterDays: 180,
    stock: 12,
    imageUrl: "/media/photo-product-olla-24.jpg",
    productUrl: `${kitchenBaseUrl}/products/olla-granito-24cm-familiar`,
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
    vertical: "cocina",
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
    deliveryBadge: "Envio gratis coordinado",
    material: "Granito antiadherente",
    coating: "Granito",
    teflonFree: true,
    capacity: "Cocina completa",
    pieces: 5,
    stoveCompatibility: "Gas, induccion y vitroceramica",
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
      `${kitchenBaseUrl}/products/set-mgc-ollas-sartenes-granito`,
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
    vertical: "cocina",
    title: "Sarten wok granito para recetas rapidas",
    description:
      "Sarten tipo wok para vegetales, pollo y recetas rapidas con menos aceite.",
    category: "Sartenes granito",
    brand: "Eter Niu Cocina",
    price: { amount: 85, currency: "USD" },
    originalPrice: { amount: 105, currency: "USD" },
    discountPercent: 19,
    promoLabel: "Menos aceite",
    stockSignal: "14 sartenes disponibles",
    bundleEligible: true,
    deliveryBadge: "Envio gratis con despacho rapido",
    material: "Granito antiadherente",
    coating: "Granito",
    teflonFree: true,
    capacity: "1 a 4 personas",
    diameterCm: 28,
    pieces: 1,
    stoveCompatibility: "Gas, induccion y vitroceramica",
    tipoCocina: "Recetas rapidas",
    nivel: "Uso diario",
    bundleUseCase: "Vegetales, pollo y salteados de semana",
    careTips: "Usar fuego medio y evitar aerosoles que saturen la superficie.",
    healthAngle: "Pensado para cocinar ligero sin depender de mucho aceite.",
    warrantyText: "Garantia de fabrica a confirmar por WhatsApp.",
    instagramSourceUrl: "https://www.instagram.com/p/DV7N5cXmICF/",
    sourceUrls: [
      "https://www.instagram.com/p/DV7N5cXmICF/",
      "https://www.instagram.com/p/DVXbLrPiHnd/",
    ],
    contentAngles: [
      "detalle de granito y uso rapido",
      "recetas rapidas entre semana",
      "salteados y desayuno",
    ],
    certificationStatus: "Proveedor por confirmar",
    claimNote:
      "Hablar de menos aceite como uso culinario, no como tratamiento de salud.",
    reorderAfterDays: 180,
    stock: 14,
    imageUrl: "/media/photo-detalle-wok.jpg",
    productUrl:
      `${kitchenBaseUrl}/products/sarten-wok-granito-recetas-rapidas`,
    tags: [
      "sarten",
      "wok",
      "granito",
      "28cm",
      "recetas rapidas",
      "recetas rapidas",
    ],
  },
  {
    id: "prod-utensilios-granito",
    variantId: "var-utensilios-granito",
    sku: "MGC-UTENSILIOS-CUIDADO",
    vertical: "cocina",
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
    deliveryBadge: "Agregar al pedido con envio gratis",
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
      `${kitchenBaseUrl}/products/utensilios-compatibles-granito`,
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

export const wellnessFallbackProducts: Product[] = [
  {
    id: "prod-bien-botella-termica",
    variantId: "var-bien-botella-termica",
    sku: "BIEN-BOTELLA-TERMICA-750",
    vertical: "bienestar",
    title: "Botella termica para rutina diaria",
    description:
      "Botella para hidratarte en casa, oficina o entrenamiento sin depender de envases descartables.",
    category: "Hidratacion",
    brand: "Eter Niu Bienestar",
    price: { amount: 24, currency: "USD" },
    originalPrice: { amount: 32, currency: "USD" },
    discountPercent: 25,
    promoLabel: "Rutina diaria",
    stockSignal: "Stock por confirmar para campana piloto",
    bundleEligible: true,
    deliveryBadge: "Envio gratis Ecuador",
    freeShipping: true,
    paymentMethods: defaultPaymentMethods,
    couponCode: "BIENESTARHOY",
    material: "Acero inoxidable",
    capacity: "750 ml",
    pieces: 1,
    stoveCompatibility: "No aplica",
    tipoCocina: "No aplica",
    nivel: "Uso diario",
    bundleUseCase: "Agua, infusiones frias y rutina de oficina o gimnasio",
    careTips: "Lavar a mano, secar abierta y evitar bebidas carbonatadas.",
    healthAngle:
      "Ayuda a crear una rutina de hidratacion practica durante el dia.",
    warrantyText: "Garantia y disponibilidad a confirmar por WhatsApp.",
    contentAngles: [
      "hidratacion diaria",
      "oficina y movimiento",
      "regalo practico de bienestar",
    ],
    certificationStatus: "Proveedor por confirmar",
    claimNote: "No publicar claims medicos; hablar de rutina y uso practico.",
    reorderAfterDays: 120,
    stock: 0,
    imageUrl: "/media/wellness-botella.svg",
    productUrl:
      `${wellnessBaseUrl}/campanas/botella-termica?sku=BIEN-BOTELLA-TERMICA-750`,
    tags: [
      "bienestar",
      "hidratacion",
      "botella",
      "rutina",
      "oficina",
      "movimiento",
    ],
  },
  {
    id: "prod-bien-mat-yoga",
    variantId: "var-bien-mat-yoga",
    sku: "BIEN-MAT-YOGA-ANTIDESLIZANTE",
    vertical: "bienestar",
    title: "Mat antideslizante para movimiento suave",
    description:
      "Mat para estiramiento, yoga suave y pausas activas en casa.",
    category: "Movimiento",
    brand: "Eter Niu Bienestar",
    price: { amount: 39, currency: "USD" },
    originalPrice: { amount: 49, currency: "USD" },
    discountPercent: 20,
    promoLabel: "Pausa activa",
    stockSignal: "Stock por confirmar para campana piloto",
    bundleEligible: true,
    deliveryBadge: "Envio gratis Ecuador",
    freeShipping: true,
    paymentMethods: defaultPaymentMethods,
    couponCode: "BIENESTARHOY",
    material: "Superficie antideslizante",
    capacity: "Uso personal",
    pieces: 1,
    stoveCompatibility: "No aplica",
    tipoCocina: "No aplica",
    nivel: "Inicio",
    bundleUseCase: "Estiramiento, respiracion y movimiento en casa",
    careTips: "Limpiar con pano humedo y guardar extendido o enrollado suave.",
    healthAngle:
      "Producto para acompanar pausas de movimiento, sin promesas terapeuticas.",
    warrantyText: "Garantia y disponibilidad a confirmar por WhatsApp.",
    contentAngles: [
      "pausa activa",
      "movimiento suave",
      "rutina de casa",
    ],
    certificationStatus: "Proveedor por confirmar",
    claimNote: "No prometer tratamiento fisico ni resultado medico.",
    reorderAfterDays: 180,
    stock: 0,
    imageUrl: "/media/wellness-mat.svg",
    productUrl:
      `${wellnessBaseUrl}/campanas/mat-movimiento?sku=BIEN-MAT-YOGA-ANTIDESLIZANTE`,
    tags: ["bienestar", "yoga", "mat", "movimiento", "pausa activa"],
  },
  {
    id: "prod-bien-bowl-ceramica",
    variantId: "var-bien-bowl-ceramica",
    sku: "BIEN-BOWL-CERAMICA-RITUAL",
    vertical: "bienestar",
    title: "Bowl ceramico para desayuno consciente",
    description:
      "Bowl para desayuno, snacks o rituales de mesa con una estetica tranquila.",
    category: "Mesa consciente",
    brand: "Eter Niu Bienestar",
    price: { amount: 18, currency: "USD" },
    originalPrice: { amount: 24, currency: "USD" },
    discountPercent: 25,
    promoLabel: "Mesa consciente",
    stockSignal: "Stock por confirmar para campana piloto",
    bundleEligible: true,
    deliveryBadge: "Envio gratis Ecuador",
    freeShipping: true,
    paymentMethods: defaultPaymentMethods,
    couponCode: "BIENESTARHOY",
    material: "Ceramica",
    capacity: "Desayuno o snack",
    pieces: 1,
    stoveCompatibility: "No aplica",
    tipoCocina: "No aplica",
    nivel: "Uso diario",
    bundleUseCase: "Avena, frutas, snacks y mesa visual para redes",
    careTips: "Lavar con esponja suave y evitar golpes termicos.",
    healthAngle:
      "Ayuda a construir momentos de pausa alrededor de la comida diaria.",
    warrantyText: "Garantia y disponibilidad a confirmar por WhatsApp.",
    contentAngles: [
      "desayuno consciente",
      "mesa tranquila",
      "regalo practico",
    ],
    certificationStatus: "No aplica",
    claimNote: "No prometer beneficios nutricionales.",
    reorderAfterDays: 180,
    stock: 0,
    imageUrl: "/media/wellness-bowl.svg",
    productUrl:
      `${wellnessBaseUrl}/campanas/bowl-ceramico?sku=BIEN-BOWL-CERAMICA-RITUAL`,
    tags: ["bienestar", "bowl", "ceramica", "mesa", "desayuno"],
  },
  {
    id: "prod-bien-kit-aroma",
    variantId: "var-bien-kit-aroma",
    sku: "BIEN-KIT-AROMA-CALMA",
    vertical: "bienestar",
    title: "Kit de aroma para pausa en casa",
    description:
      "Kit para crear una pausa visual y aromatica en escritorio, sala o dormitorio.",
    category: "Pausa en casa",
    brand: "Eter Niu Bienestar",
    price: { amount: 29, currency: "USD" },
    originalPrice: { amount: 38, currency: "USD" },
    discountPercent: 24,
    promoLabel: "Momento calma",
    stockSignal: "Stock por confirmar para campana piloto",
    bundleEligible: true,
    deliveryBadge: "Envio gratis Ecuador",
    freeShipping: true,
    paymentMethods: defaultPaymentMethods,
    couponCode: "BIENESTARHOY",
    material: "Accesorios decorativos",
    capacity: "1 ambiente",
    pieces: 3,
    stoveCompatibility: "No aplica",
    tipoCocina: "No aplica",
    nivel: "Regalo",
    bundleUseCase: "Escritorio, dormitorio o regalo de autocuidado",
    careTips: "Usar en superficies estables y lejos de ninos o mascotas.",
    healthAngle:
      "Producto decorativo para crear un ritual de pausa, sin claims medicos.",
    warrantyText: "Garantia y disponibilidad a confirmar por WhatsApp.",
    contentAngles: ["pausa en casa", "regalo", "ambiente tranquilo"],
    certificationStatus: "Proveedor por confirmar",
    claimNote: "No prometer relajacion clinica ni efectos terapeuticos.",
    reorderAfterDays: 90,
    stock: 0,
    imageUrl: "/media/wellness-aroma.svg",
    productUrl:
      `${wellnessBaseUrl}/campanas/kit-aroma?sku=BIEN-KIT-AROMA-CALMA`,
    tags: ["bienestar", "aroma", "decoracion", "pausa", "regalo"],
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
  if (
    product.vertical === "bienestar" ||
    product.sku.startsWith("BIEN-") ||
    haystack.includes("bienestar")
  ) {
    if (haystack.includes("mat") || haystack.includes("yoga")) {
      return "/media/wellness-mat.svg"
    }
    if (haystack.includes("bowl")) {
      return "/media/wellness-bowl.svg"
    }
    if (haystack.includes("aroma") || haystack.includes("calma")) {
      return "/media/wellness-aroma.svg"
    }
    if (haystack.includes("botella") || haystack.includes("hidrat")) {
      return "/media/wellness-botella.svg"
    }
    return "/media/wellness-hero.svg"
  }
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
    return "/media/photo-detalle-wok.jpg"
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
  "granito real",
  "familia",
  "utensilio",
  "utensilios",
  "complemento",
  "cuchillo",
  "cuchillos",
]

function isKitchenProduct(product: Product) {
  if (product.vertical === "cocina") return true
  if (product.vertical === "bienestar") return false
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

const wellnessTerms = [
  "bienestar",
  "wellness",
  "yoga",
  "mat",
  "botella",
  "hidratacion",
  "bowl",
  "ceramica",
  "aroma",
  "calma",
  "pausa",
  "autocuidado",
  "movimiento",
  "rutina",
  "decoracion",
  "lifestyle",
]

function isWellnessProduct(product: Product) {
  if (product.vertical === "bienestar") return true
  if (product.vertical === "cocina") return false
  if (product.sku.startsWith("BIEN-")) return true
  const haystack = [
    product.title,
    product.description,
    product.category,
    product.brand,
    product.material || "",
    product.bundleUseCase || "",
    product.healthAngle || "",
    ...(product.sourceUrls || []),
    ...(product.contentAngles || []),
    ...product.tags,
  ]
    .join(" ")
    .toLowerCase()
  return wellnessTerms.some((term) => haystack.includes(term))
}

function normalizeProduct(
  product: Product,
  vertical: "cocina" | "bienestar" = "cocina",
): Product {
  const isComplement = product.category.toLowerCase().includes("complement")
  const isWellness = vertical === "bienestar" || product.vertical === "bienestar"

  return {
    ...product,
    vertical: product.vertical || vertical,
    brand:
      product.brand || (isWellness ? "Eter Niu Bienestar" : "Eter Niu Cocina"),
    imageUrl: placeholderForProduct(product),
    deliveryBadge: product.deliveryBadge || defaultFreeShippingLabel,
    freeShipping: product.freeShipping ?? true,
    paymentMethods: product.paymentMethods?.length
      ? product.paymentMethods
      : defaultPaymentMethods,
    couponCode: product.couponCode || defaultCouponCode,
    stoveCompatibility:
      product.stoveCompatibility ||
      (isWellness
        ? "No aplica"
        : isComplement
          ? "No aplica; cuida ollas de granito"
          : defaultStoveCompatibility),
    tags: product.tags || [],
  }
}

async function fetchProducts(vertical?: "cocina" | "bienestar") {
  const toolsUrl =
    process.env.TOOLS_API_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_TOOLS_API_URL ||
    "http://localhost:8787"

  try {
    const headers: Record<string, string> = {}
    if (process.env.TOOLS_API_TOKEN) {
      headers.authorization = `Bearer ${process.env.TOOLS_API_TOKEN}`
    }

    const url = new URL("/tools/search-products", toolsUrl)
    url.searchParams.set("limit", "100")
    if (vertical) url.searchParams.set("vertical", vertical)
    const response = await fetch(url, {
      cache: "no-store",
      headers,
    })
    if (!response.ok) throw new Error("tools unavailable")
    const data = (await response.json()) as { products?: Product[] }
    return data.products || []
  } catch {
    return undefined
  }
}

export async function getProductsForVertical(
  vertical: "cocina" | "bienestar",
) {
  const allowDemoCatalog =
    process.env.ALLOW_DEMO_CATALOG === "true" ||
    process.env.NEXT_PUBLIC_ALLOW_DEMO_CATALOG === "true" ||
    process.env.NODE_ENV !== "production"
  const fallback =
    vertical === "bienestar" ? wellnessFallbackProducts : fallbackProducts
  const products = await fetchProducts(vertical)

  if (products) {
    const verticalProducts = products
      .filter(vertical === "bienestar" ? isWellnessProduct : isKitchenProduct)
      .map((product) => normalizeProduct(product, vertical))
    return verticalProducts.length
      ? verticalProducts
      : allowDemoCatalog
        ? fallback.map((product) => normalizeProduct(product, vertical))
        : []
  }

  return allowDemoCatalog
    ? fallback.map((product) => normalizeProduct(product, vertical))
    : []
}

export async function getProducts() {
  return getProductsForVertical("cocina")
}

export async function getWellnessProducts() {
  return getProductsForVertical("bienestar")
}

export async function getAllProducts() {
  const allowDemoCatalog =
    process.env.ALLOW_DEMO_CATALOG === "true" ||
    process.env.NEXT_PUBLIC_ALLOW_DEMO_CATALOG === "true" ||
    process.env.NODE_ENV !== "production"
  const products = await fetchProducts()

  if (products) {
    const normalized = products.map((product) =>
      normalizeProduct(
        product,
        isWellnessProduct(product) ? "bienestar" : "cocina",
      ),
    )
    return normalized.length
      ? normalized
      : allowDemoCatalog
        ? [
            ...fallbackProducts.map((product) => normalizeProduct(product)),
            ...wellnessFallbackProducts.map((product) =>
              normalizeProduct(product, "bienestar"),
            ),
          ]
        : []
  }

  return allowDemoCatalog
    ? [
        ...fallbackProducts.map((product) => normalizeProduct(product)),
        ...wellnessFallbackProducts.map((product) =>
          normalizeProduct(product, "bienestar"),
        ),
      ]
    : []
}

export async function getProductBySlug(slug: string) {
  const products = await getAllProducts()
  const normalizedSlug = decodeURIComponent(slug)
  return products.find((product) => productSlug(product) === normalizedSlug)
}
