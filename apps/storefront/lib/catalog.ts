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
    title: "Wok 32 cm granito premium antiadherente",
    description:
      "Wok de granito antiadherente libre de teflon y PFOA segun catalogo WhatsApp.",
    category: "Woks granito",
    brand: "Eter Niu Cocina",
    price: { amount: 151.2, currency: "USD" },
    promoLabel: "Catalogo real WhatsApp",
    stockSignal: "Stock por confirmar por WhatsApp",
    bundleEligible: true,
    deliveryBadge: "Envio gratis Ecuador",
    material: "Granito antiadherente",
    coating: "Granito",
    teflonFree: true,
    pfoaFree: true,
    capacity: "Porciones familiares",
    diameterCm: 32,
    pieces: 1,
    stoveCompatibility: "Gas, induccion y vitroceramica",
    tipoCocina: "Familia y recetas",
    nivel: "Uso diario",
    bundleUseCase:
      "Salteados, arroz, recetas familiares y cocina con menos aceite",
    careTips:
      "Usar utensilios de silicona o madera, fuego medio y esponja suave.",
    healthAngle:
      "Opcion sin teflon para cocinar diario con una superficie antiadherente de granito.",
    warrantyText: "Garantia de fabrica a confirmar por WhatsApp.",
    sourceUrls: ["https://wa.me/c/593979854915"],
    contentAngles: [
      "granito premium",
      "wok 32 cm",
      "menos aceite",
      "cocina familiar",
    ],
    certificationStatus:
      "Catalogo WhatsApp: certificaciones USA y Europeas; guardar respaldo del proveedor antes de pauta fuerte.",
    claimNote:
      "No publicar claims medicos; libre de teflon/PFOA queda sujeto a respaldo del proveedor.",
    reorderAfterDays: 180,
    stock: 1,
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
      "Olla de granito antiadherente libre de teflon y PFOA segun catalogo WhatsApp.",
    category: "Ollas granito",
    brand: "Eter Niu Cocina",
    price: { amount: 75.6, currency: "USD" },
    promoLabel: "Uso diario",
    stockSignal: "Stock por confirmar por WhatsApp",
    bundleEligible: true,
    deliveryBadge: "Envio gratis 24-48h segun ciudad",
    material: "Granito antiadherente",
    coating: "Granito",
    teflonFree: true,
    pfoaFree: true,
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
    sourceUrls: ["https://wa.me/c/593979854915"],
    contentAngles: ["olla 20 cm", "porciones pequenas", "uso diario"],
    certificationStatus:
      "Catalogo WhatsApp: certificaciones USA y Europeas; guardar respaldo del proveedor antes de pauta fuerte.",
    claimNote:
      "No publicar claims medicos; libre de teflon/PFOA queda sujeto a respaldo del proveedor.",
    reorderAfterDays: 180,
    stock: 1,
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
    id: "prod-olla-granito-18",
    variantId: "var-olla-granito-18",
    sku: "MGC-OLLA-GRANITO-18",
    vertical: "cocina",
    title: "Olla 18 cm Granito Premium antiadherente",
    description:
      "Olla de granito antiadherente libre de teflon y PFOA segun catalogo WhatsApp.",
    category: "Ollas granito",
    brand: "Eter Niu Cocina",
    price: { amount: 63.6, currency: "USD" },
    promoLabel: "Catalogo real WhatsApp",
    stockSignal: "Stock por confirmar por WhatsApp",
    bundleEligible: true,
    deliveryBadge: "Envio gratis con stock confirmado",
    material: "Granito antiadherente",
    coating: "Granito",
    teflonFree: true,
    pfoaFree: true,
    capacity: "1 a 2 personas",
    diameterCm: 18,
    pieces: 1,
    stoveCompatibility: "Gas, induccion y vitroceramica",
    tipoCocina: "Diario ligero",
    nivel: "Uso diario",
    bundleUseCase: "Porciones pequenas, salsas, guarniciones y cocina diaria",
    careTips:
      "Cocinar a fuego medio para conservar el recubrimiento por mas tiempo.",
    healthAngle:
      "Olla compacta sin teflon para empezar con granito en la cocina diaria.",
    warrantyText: "Garantia de fabrica a confirmar por WhatsApp.",
    sourceUrls: ["https://wa.me/c/593979854915"],
    contentAngles: ["olla 18 cm", "tamano compacto", "uso diario en hornilla"],
    certificationStatus:
      "Catalogo WhatsApp: certificaciones USA y Europeas; guardar respaldo del proveedor antes de pauta fuerte.",
    claimNote:
      "No publicar claims medicos; libre de teflon/PFOA queda sujeto a respaldo del proveedor.",
    reorderAfterDays: 180,
    stock: 1,
    imageUrl: "/media/photo-product-olla-20.jpg",
    productUrl: `${kitchenBaseUrl}/products/olla-granito-18cm`,
    tags: [
      "olla",
      "granito",
      "18cm",
      "compacta",
      "porciones pequenas",
      "menos aceite",
    ],
  },
  {
    id: "prod-cuchillo-samurai",
    variantId: "var-cuchillo-samurai",
    sku: "COC-CUCHILLO-SAMURAI-TODO-USO",
    vertical: "cocina",
    title: "Cuchillo samurai Japones todo uso",
    description:
      "Cuchillo Samurai todo uso para cortes precisos en preparaciones diarias.",
    category: "Cuchillos",
    brand: "Eter Niu Cocina",
    price: { amount: 30, currency: "USD" },
    promoLabel: "Complemento",
    stockSignal: "Stock por confirmar por WhatsApp",
    bundleEligible: true,
    deliveryBadge: "Agregar al pedido con envio gratis",
    material: "Acero inoxidable",
    capacity: "Todo uso",
    pieces: 1,
    stoveCompatibility: "No aplica; complemento de cocina",
    tipoCocina: "Corte diario",
    nivel: "Uso diario",
    bundleUseCase: "Verduras, carnes, frutas y preparacion general",
    careTips: "Lavar y secar despues de usar; guardar protegido.",
    healthAngle:
      "Complemento practico para preparar ingredientes antes de cocinar.",
    warrantyText: "Garantia y disponibilidad a confirmar por WhatsApp.",
    sourceUrls: ["https://wa.me/c/593979854915"],
    contentAngles: [
      "cuchillo todo uso",
      "preparacion diaria",
      "complemento para ollas de granito",
    ],
    certificationStatus: "No aplica",
    claimNote: "No publicar promesas de durabilidad extrema sin ficha tecnica.",
    reorderAfterDays: 240,
    stock: 1,
    imageUrl: "/media/photo-product-utensilios.jpg",
    productUrl: `${kitchenBaseUrl}/products/cuchillo-samurai-japones-todo-uso`,
    tags: ["cuchillo", "samurai", "japones", "todo uso", "cocina"],
  },
]

type WellnessFallbackProductInput = Omit<
  Product,
  | "variantId"
  | "vertical"
  | "brand"
  | "deliveryBadge"
  | "freeShipping"
  | "paymentMethods"
  | "couponCode"
  | "stoveCompatibility"
  | "productUrl"
> & {
  handle: string
}

const wellnessFallbackCatalog: WellnessFallbackProductInput[] = [
  {
    id: "prod-bien-juego-te-aaa",
    sku: "BIEN-JUEGO-TE-AAA",
    handle: "juegos-de-te-aaa",
    title: "Juegos de te AAA",
    description:
      "Juego de te para rituales de mesa, regalos y momentos de pausa en casa.",
    category: "Hogar Zen",
    price: { amount: 139, currency: "USD" },
    promoLabel: "Hogar Zen",
    stockSignal: "Stock por confirmar por WhatsApp",
    bundleEligible: true,
    material: "Ceramica y accesorios",
    capacity: "Set de te",
    pieces: 1,
    nivel: "Ritual de mesa",
    bundleUseCase: "Infusiones, mesa consciente y regalo de bienestar",
    careTips: "Lavar con esponja suave y evitar golpes termicos.",
    healthAngle: "Producto para crear una pausa de te sin claims medicos.",
    warrantyText: "Garantia y disponibilidad a confirmar por WhatsApp.",
    sourceUrls: ["https://wa.me/c/593979854915"],
    contentAngles: ["ritual de te", "mesa zen", "regalo premium"],
    certificationStatus: "Proveedor por confirmar",
    claimNote: "No prometer beneficios medicos de infusiones.",
    reorderAfterDays: 180,
    stock: 1,
    imageUrl: "/media/wellness-bowl.svg",
    tags: ["bienestar", "te", "hogar zen", "regalo", "mesa"],
  },
  {
    id: "prod-bien-termo-sus304-500",
    sku: "BIEN-TERMO-SUS304-500",
    handle: "termo-acero-sus304-500ml",
    title: "Termo acero inoxidable SUS 304 500 ml",
    description:
      "Termo de acero inoxidable SUS 304 de 500 ml para agua, te o bebidas del dia.",
    category: "Hogar Zen",
    price: { amount: 20, currency: "USD" },
    promoLabel: "Uso diario",
    stockSignal: "Stock por confirmar por WhatsApp",
    bundleEligible: true,
    material: "Acero inoxidable SUS 304",
    capacity: "500 ml",
    pieces: 1,
    nivel: "Uso diario",
    bundleUseCase: "Hidratacion, oficina, auto y rutina diaria",
    careTips: "Lavar a mano, secar abierto y evitar bebidas carbonatadas.",
    healthAngle: "Ayuda a organizar una rutina practica de hidratacion.",
    warrantyText: "Garantia y disponibilidad a confirmar por WhatsApp.",
    sourceUrls: ["https://wa.me/c/593979854915"],
    contentAngles: ["termo 500 ml", "SUS 304", "uso diario"],
    certificationStatus: "Proveedor por confirmar",
    claimNote: "No prometer beneficios medicos por hidratacion.",
    reorderAfterDays: 120,
    stock: 1,
    imageUrl: "/media/wellness-botella.svg",
    tags: ["bienestar", "termo", "sus304", "hidratacion", "500ml"],
  },
  {
    id: "prod-bien-termo-sus304-1000",
    sku: "BIEN-TERMO-SUS304-1000",
    handle: "termo-acero-sus304-1000ml",
    title: "Termo de acero SUS304 1000 ml",
    description:
      "Termo de acero SUS304 de 1000 ml para llevar bebida durante el dia.",
    category: "Hogar Zen",
    price: { amount: 28.5, currency: "USD" },
    promoLabel: "Uso diario",
    stockSignal: "Stock por confirmar por WhatsApp",
    bundleEligible: true,
    material: "Acero inoxidable SUS 304",
    capacity: "1000 ml",
    pieces: 1,
    nivel: "Uso diario",
    bundleUseCase: "Hidratacion para viajes, oficina y movimiento",
    careTips: "Lavar a mano, secar abierto y evitar bebidas carbonatadas.",
    healthAngle: "Formato grande para mantener agua o infusiones a mano.",
    warrantyText: "Garantia y disponibilidad a confirmar por WhatsApp.",
    sourceUrls: ["https://wa.me/c/593979854915"],
    contentAngles: ["termo 1000 ml", "SUS 304", "dia completo"],
    certificationStatus: "Proveedor por confirmar",
    claimNote: "No prometer beneficios medicos por hidratacion.",
    reorderAfterDays: 120,
    stock: 1,
    imageUrl: "/media/wellness-botella.svg",
    tags: ["bienestar", "termo", "sus304", "hidratacion", "1000ml"],
  },
  {
    id: "prod-bien-yoga-mat-suede",
    sku: "BIEN-YOGA-MAT-SUEDE-4MM",
    handle: "yoga-mat-suede-4mm-premium",
    title: "Yoga Mat Suede 4 mm Premium",
    description:
      "Mat premium de suede de 4 mm para yoga, estiramiento y movimiento suave.",
    category: "Yoga & Movimiento",
    price: { amount: 79.99, currency: "USD" },
    promoLabel: "Movimiento premium",
    stockSignal: "Stock por confirmar por WhatsApp",
    bundleEligible: true,
    material: "Suede",
    capacity: "Uso personal",
    pieces: 1,
    nivel: "Premium",
    bundleUseCase: "Yoga, estiramiento, respiracion y rutina de casa",
    careTips: "Limpiar con pano humedo y guardar enrollado sin doblar.",
    healthAngle:
      "Producto para acompanar movimiento consciente, sin promesas terapeuticas.",
    warrantyText: "Garantia y disponibilidad a confirmar por WhatsApp.",
    sourceUrls: ["https://wa.me/c/593979854915"],
    contentAngles: ["mat suede", "4 mm", "movimiento suave"],
    certificationStatus: "Proveedor por confirmar",
    claimNote: "No prometer tratamiento fisico ni resultado medico.",
    reorderAfterDays: 180,
    stock: 1,
    imageUrl: "/media/wellness-mat.svg",
    tags: ["bienestar", "yoga", "mat", "suede", "movimiento"],
  },
  {
    id: "prod-bien-meditador-mandala",
    sku: "BIEN-MEDITADOR-MANDALA-70",
    handle: "meditador-mandala-pu-rubber-70cm",
    title: "Meditador Mandala PU Rubber 70 cm",
    description:
      "Meditador mandala de PU rubber de 70 cm para rincones de yoga, meditacion y pausa.",
    category: "Yoga & Movimiento",
    price: { amount: 33, currency: "USD" },
    promoLabel: "Pausa visual",
    stockSignal: "Stock por confirmar por WhatsApp",
    bundleEligible: true,
    material: "PU rubber",
    capacity: "70 cm diametro",
    pieces: 1,
    nivel: "Pausa en casa",
    bundleUseCase: "Meditacion, respiracion y espacio personal",
    careTips: "Limpiar con pano humedo y guardar seco.",
    healthAngle: "Ayuda a crear un espacio visual de pausa en casa.",
    warrantyText: "Garantia y disponibilidad a confirmar por WhatsApp.",
    sourceUrls: ["https://wa.me/c/593979854915"],
    contentAngles: ["mandala", "70 cm", "rincon de meditacion"],
    certificationStatus: "No aplica",
    claimNote: "No prometer relajacion clinica ni efectos terapeuticos.",
    reorderAfterDays: 180,
    stock: 1,
    imageUrl: "/media/wellness-mat.svg",
    tags: ["bienestar", "mandala", "meditacion", "yoga", "70cm"],
  },
  {
    id: "prod-bien-pistola-percusion",
    sku: "BIEN-PISTOLA-PERCUSION-PRO",
    handle: "pistola-percusion-profesional-30-niveles",
    title: "Pistola de percusion profesional 30 niveles",
    description:
      "Pistola de percusion profesional con 30 niveles para masaje muscular de rutina.",
    category: "Yoga & Movimiento",
    price: { amount: 199, currency: "USD" },
    promoLabel: "Movimiento",
    stockSignal: "Stock por confirmar por WhatsApp",
    bundleEligible: true,
    material: "Equipo de masaje",
    capacity: "30 niveles",
    pieces: 1,
    nivel: "Profesional",
    bundleUseCase: "Masaje de rutina, entrenamiento y recuperacion no medica",
    careTips: "Usar segun manual y evitar zonas sensibles o lesionadas.",
    healthAngle:
      "Equipo para masaje de bienestar; no reemplaza evaluacion profesional.",
    warrantyText: "Garantia y disponibilidad a confirmar por WhatsApp.",
    sourceUrls: ["https://wa.me/c/593979854915"],
    contentAngles: ["30 niveles", "masaje muscular", "rutina deportiva"],
    certificationStatus: "Proveedor por confirmar",
    claimNote: "No prometer tratamiento, cura ni recuperacion clinica.",
    reorderAfterDays: 240,
    stock: 1,
    imageUrl: "/media/wellness-mat.svg",
    tags: ["bienestar", "pistola", "percusion", "masaje", "movimiento"],
  },
  {
    id: "prod-bien-cuenco-8",
    sku: "BIEN-CUENCO-BRONCE-8",
    handle: "cuenco-bronce-grabado-sanscrito-8cm",
    title: "Cuenco de bronce con grabado sanscrito 8 cm",
    description:
      "Cuenco de bronce a maquina con grabado sanscrito de 8 cm para rituales de sonido.",
    category: "Energia & Bienestar",
    price: { amount: 45, currency: "USD" },
    promoLabel: "Sonido",
    stockSignal: "Stock por confirmar por WhatsApp",
    bundleEligible: true,
    material: "Bronce",
    capacity: "8 cm",
    pieces: 1,
    nivel: "Ritual de sonido",
    bundleUseCase: "Meditacion, sonido ambiental y regalo espiritual",
    careTips: "Limpiar con pano seco y guardar lejos de humedad.",
    healthAngle: "Accesorio de sonido para crear una pausa sensorial.",
    warrantyText: "Garantia y disponibilidad a confirmar por WhatsApp.",
    sourceUrls: ["https://wa.me/c/593979854915"],
    contentAngles: ["cuenco 8 cm", "bronce", "sonido"],
    certificationStatus: "No aplica",
    claimNote: "No prometer beneficios terapeuticos.",
    reorderAfterDays: 240,
    stock: 1,
    imageUrl: "/media/wellness-aroma.svg",
    tags: ["bienestar", "cuenco", "bronce", "sonido", "meditacion"],
  },
  {
    id: "prod-bien-cuenco-9",
    sku: "BIEN-CUENCO-BRONCE-9",
    handle: "cuenco-bronce-grabado-sanscrito-9cm",
    title: "Cuenco de bronce con grabado sanscrito 9 cm",
    description:
      "Cuenco de bronce a maquina con grabado sanscrito de 9 cm para rituales de sonido.",
    category: "Energia & Bienestar",
    price: { amount: 65, currency: "USD" },
    promoLabel: "Sonido",
    stockSignal: "Stock por confirmar por WhatsApp",
    bundleEligible: true,
    material: "Bronce",
    capacity: "9 cm",
    pieces: 1,
    nivel: "Ritual de sonido",
    bundleUseCase: "Meditacion, sonido ambiental y regalo espiritual",
    careTips: "Limpiar con pano seco y guardar lejos de humedad.",
    healthAngle: "Accesorio de sonido para crear una pausa sensorial.",
    warrantyText: "Garantia y disponibilidad a confirmar por WhatsApp.",
    sourceUrls: ["https://wa.me/c/593979854915"],
    contentAngles: ["cuenco 9 cm", "bronce", "sonido"],
    certificationStatus: "No aplica",
    claimNote: "No prometer beneficios terapeuticos.",
    reorderAfterDays: 240,
    stock: 1,
    imageUrl: "/media/wellness-aroma.svg",
    tags: ["bienestar", "cuenco", "bronce", "sonido", "meditacion"],
  },
  {
    id: "prod-bien-tambor-lengua",
    sku: "BIEN-TAMBOR-LENGUA-8-NOTAS",
    handle: "tambor-lengua-8-notas",
    title: "Tambor de lengua 8 notas",
    description: "Tambor de lengua de 8 notas para sonido ambiental y pausa.",
    category: "Energia & Bienestar",
    price: { amount: 65, currency: "USD" },
    promoLabel: "Sonido",
    stockSignal: "Stock por confirmar por WhatsApp",
    bundleEligible: true,
    material: "Metal",
    capacity: "8 notas",
    pieces: 1,
    nivel: "Sonido",
    bundleUseCase: "Meditacion, musica suave, regalo y espacios de calma",
    careTips: "Guardar seco y limpiar con pano suave.",
    healthAngle: "Instrumento de sonido para acompanar pausas personales.",
    warrantyText: "Garantia y disponibilidad a confirmar por WhatsApp.",
    sourceUrls: ["https://wa.me/c/593979854915"],
    contentAngles: ["8 notas", "sonido", "regalo"],
    certificationStatus: "No aplica",
    claimNote: "No prometer beneficios terapeuticos.",
    reorderAfterDays: 240,
    stock: 1,
    imageUrl: "/media/wellness-aroma.svg",
    tags: ["bienestar", "tambor", "sonido", "8 notas", "regalo"],
  },
  {
    id: "prod-bien-argollas-plata",
    sku: "BIEN-ARGOLLAS-PLATA-925",
    handle: "argollas-plata-925",
    title: "Argollas plata 925",
    description: "Argollas de plata 925 para uso diario o regalo especial.",
    category: "Tesoros Plata & Acero",
    price: { amount: 43, currency: "USD" },
    promoLabel: "Plata 925",
    stockSignal: "Stock por confirmar por WhatsApp",
    bundleEligible: true,
    material: "Plata 925",
    capacity: "Uso personal",
    pieces: 1,
    nivel: "Regalo",
    bundleUseCase: "Accesorio personal, regalo y estilo diario",
    careTips: "Guardar seco y limpiar con pano para plata.",
    healthAngle: "Accesorio personal sin claims de salud.",
    warrantyText: "Garantia y disponibilidad a confirmar por WhatsApp.",
    sourceUrls: ["https://wa.me/c/593979854915"],
    contentAngles: ["plata 925", "regalo", "uso diario"],
    certificationStatus: "Proveedor por confirmar",
    claimNote:
      "Confirmar material con ficha o proveedor antes de pauta fuerte.",
    reorderAfterDays: 240,
    stock: 1,
    imageUrl: "/media/wellness-aroma.svg",
    tags: ["bienestar", "plata", "argollas", "joyeria", "regalo"],
  },
  {
    id: "prod-bien-dije-om",
    sku: "BIEN-DIJE-OM-PLATA-925",
    handle: "dije-om-grande",
    title: "Dije OM grande",
    description:
      "Dije OM grande para regalo, uso personal o practica espiritual.",
    category: "Tesoros Plata & Acero",
    price: { amount: 74, currency: "USD" },
    promoLabel: "Simbolo OM",
    stockSignal: "Stock por confirmar por WhatsApp",
    bundleEligible: true,
    material: "Plata 925 por confirmar",
    capacity: "Dije grande",
    pieces: 1,
    nivel: "Regalo",
    bundleUseCase: "Accesorio simbolico, regalo y estilo personal",
    careTips: "Guardar seco y limpiar con pano suave.",
    healthAngle: "Accesorio simbolico sin promesas de salud.",
    warrantyText: "Garantia y disponibilidad a confirmar por WhatsApp.",
    sourceUrls: ["https://wa.me/c/593979854915"],
    contentAngles: ["simbolo OM", "regalo", "accesorio espiritual"],
    certificationStatus: "Proveedor por confirmar",
    claimNote: "Confirmar material exacto antes de publicar como plata 925.",
    reorderAfterDays: 240,
    stock: 1,
    imageUrl: "/media/wellness-aroma.svg",
    tags: ["bienestar", "om", "dije", "joyeria", "regalo"],
  },
  {
    id: "prod-bien-amuleto-hindu",
    sku: "BIEN-AMULETO-HINDU-PLATA-925",
    handle: "amuleto-hindu-plata-925",
    title: "Amuleto Hindu plata 925",
    description: "Amuleto hindu de plata 925 para uso personal o regalo.",
    category: "Tesoros Plata & Acero",
    price: { amount: 38, currency: "USD" },
    promoLabel: "Plata 925",
    stockSignal: "Stock por confirmar por WhatsApp",
    bundleEligible: true,
    material: "Plata 925",
    capacity: "Amuleto",
    pieces: 1,
    nivel: "Regalo",
    bundleUseCase: "Accesorio simbolico y regalo personal",
    careTips: "Guardar seco y limpiar con pano para plata.",
    healthAngle: "Accesorio simbolico sin promesas de proteccion o salud.",
    warrantyText: "Garantia y disponibilidad a confirmar por WhatsApp.",
    sourceUrls: ["https://wa.me/c/593979854915"],
    contentAngles: ["amuleto", "plata 925", "regalo"],
    certificationStatus: "Proveedor por confirmar",
    claimNote: "No prometer proteccion, energia ni resultados espirituales.",
    reorderAfterDays: 240,
    stock: 1,
    imageUrl: "/media/wellness-aroma.svg",
    tags: ["bienestar", "amuleto", "plata", "joyeria", "regalo"],
  },
  {
    id: "prod-bien-cascada-humo",
    sku: "BIEN-CASCADA-HUMO-OM-GANESHA-TORRE",
    handle: "cascadas-humo-om-ganesha-torre",
    title: "Cascadas de humo OM, Ganesha y Torre",
    description:
      "Cascadas de humo con disenos OM, Ganesha y Torre para ambientar espacios.",
    category: "Energia & Bienestar",
    price: { amount: 12, currency: "USD" },
    promoLabel: "Ambiente",
    stockSignal: "Stock por confirmar por WhatsApp",
    bundleEligible: true,
    material: "Accesorio decorativo",
    capacity: "1 cascada",
    pieces: 1,
    nivel: "Ambiente",
    bundleUseCase: "Escritorio, sala, dormitorio o rincon de meditacion",
    careTips:
      "Usar en superficie estable y ventilada; no dejar encendido sin vigilancia.",
    healthAngle: "Accesorio decorativo para crear ambiente visual.",
    warrantyText: "Garantia y disponibilidad a confirmar por WhatsApp.",
    sourceUrls: ["https://wa.me/c/593979854915"],
    contentAngles: ["humo", "OM", "Ganesha"],
    certificationStatus: "No aplica",
    claimNote: "No prometer purificacion, cura ni beneficios clinicos.",
    reorderAfterDays: 90,
    stock: 1,
    imageUrl: "/media/wellness-aroma.svg",
    tags: ["bienestar", "humo", "om", "ganesha", "decoracion"],
  },
  {
    id: "prod-bien-pendulo-chakras",
    sku: "BIEN-PENDULO-7-CHAKRAS",
    handle: "pendulo-7-chakras",
    title: "Pendulo 7 chakras",
    description:
      "Pendulo 7 chakras para practica personal y accesorios energeticos.",
    category: "Energia & Bienestar",
    price: { amount: 13.33, currency: "USD" },
    promoLabel: "7 chakras",
    stockSignal: "Stock por confirmar por WhatsApp",
    bundleEligible: true,
    material: "Piedras y metal por confirmar",
    capacity: "Uso personal",
    pieces: 1,
    nivel: "Practica personal",
    bundleUseCase: "Ritual personal, regalo y accesorios de energia",
    careTips: "Guardar seco y limpiar con pano suave.",
    healthAngle: "Accesorio de practica personal sin claims medicos.",
    warrantyText: "Garantia y disponibilidad a confirmar por WhatsApp.",
    sourceUrls: ["https://wa.me/c/593979854915"],
    contentAngles: ["7 chakras", "pendulo", "regalo pequeno"],
    certificationStatus: "No aplica",
    claimNote: "No prometer diagnostico, proteccion ni resultados energeticos.",
    reorderAfterDays: 180,
    stock: 1,
    imageUrl: "/media/wellness-aroma.svg",
    tags: ["bienestar", "pendulo", "chakras", "regalo", "energia"],
  },
  {
    id: "prod-bien-lampara-sal",
    sku: "BIEN-LAMPARA-SAL-HIMALAYA-10KG",
    handle: "lampara-sal-himalaya-10kg-grande",
    title: "Lampara de sal Himalaya 10 kilos grande",
    description:
      "Lampara de sal Himalaya grande de 10 kilos para luz calida y decoracion.",
    category: "Energia & Bienestar",
    price: { amount: 65, currency: "USD" },
    promoLabel: "Luz calida",
    stockSignal: "Stock por confirmar por WhatsApp",
    bundleEligible: true,
    material: "Sal del Himalaya",
    capacity: "10 kilos",
    pieces: 1,
    nivel: "Decoracion",
    bundleUseCase: "Dormitorio, sala, estudio o rincon de pausa",
    careTips: "Mantener en lugar seco y limpiar con pano seco.",
    healthAngle: "Lampara decorativa de luz calida para ambiente tranquilo.",
    warrantyText: "Garantia y disponibilidad a confirmar por WhatsApp.",
    sourceUrls: ["https://wa.me/c/593979854915"],
    contentAngles: ["10 kilos", "luz calida", "decoracion"],
    certificationStatus: "Proveedor por confirmar",
    claimNote: "No prometer purificacion de aire ni beneficios medicos.",
    reorderAfterDays: 240,
    stock: 1,
    imageUrl: "/media/wellness-aroma.svg",
    tags: ["bienestar", "lampara", "sal", "himalaya", "decoracion"],
  },
]

export const wellnessFallbackProducts: Product[] = wellnessFallbackCatalog.map(
  (product) => ({
    ...product,
    variantId: product.id.replace("prod-", "var-"),
    vertical: "bienestar",
    brand: "Eter Niu Bienestar",
    deliveryBadge: "Envio gratis Ecuador",
    freeShipping: true,
    paymentMethods: defaultPaymentMethods,
    couponCode: "BIENESTARHOY",
    stoveCompatibility: "No aplica",
    productUrl: `${wellnessBaseUrl}/campanas/${product.handle}?sku=${product.sku}`,
  }),
)

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
    if (haystack.includes("bowl") || haystack.includes("te ")) {
      return "/media/wellness-bowl.svg"
    }
    if (haystack.includes("aroma") || haystack.includes("calma")) {
      return "/media/wellness-aroma.svg"
    }
    if (
      haystack.includes("botella") ||
      haystack.includes("hidrat") ||
      haystack.includes("termo")
    ) {
      return "/media/wellness-botella.svg"
    }
    if (
      haystack.includes("cuenco") ||
      haystack.includes("tambor") ||
      haystack.includes("pendulo") ||
      haystack.includes("lampara") ||
      haystack.includes("plata") ||
      haystack.includes("amuleto") ||
      haystack.includes("humo")
    ) {
      return "/media/wellness-aroma.svg"
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
  if (haystack.includes("18")) {
    return "/media/photo-product-olla-20.jpg"
  }
  if (haystack.includes("cuchillo")) {
    return "/media/photo-product-utensilios.jpg"
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
  "termo",
  "hidratacion",
  "bowl",
  "te",
  "ceramica",
  "aroma",
  "calma",
  "pausa",
  "autocuidado",
  "movimiento",
  "mandala",
  "meditacion",
  "cuenco",
  "tambor",
  "pendulo",
  "chakras",
  "lampara",
  "plata",
  "amuleto",
  "ganesha",
  "humo",
  "himalaya",
  "masaje",
  "percusion",
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
  const isWellness =
    vertical === "bienestar" || product.vertical === "bienestar"

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

export async function getProductsForVertical(vertical: "cocina" | "bienestar") {
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
