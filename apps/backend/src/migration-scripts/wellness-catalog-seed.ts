import { MedusaContainer } from "@medusajs/framework"
import {
  ContainerRegistrationKeys,
  ProductStatus,
} from "@medusajs/framework/utils"
import {
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  updateProductsWorkflow,
} from "@medusajs/medusa/core-flows"

type WellnessProduct = {
  title: string
  handle: string
  sku: string
  category: string
  description: string
  price: number
  originalPrice: number
  stock: number
  image: string
  metadata: Record<string, unknown>
}

const commercialMetadata = {
  vertical: "bienestar",
  freeShipping: true,
  paymentMethods: ["transferencia", "deuna", "payphone"],
  couponCode: "BIENESTARHOY",
  stoveCompatibility: "No aplica",
}

const products: WellnessProduct[] = [
  {
    title: "Juegos de te AAA",
    handle: "juegos-de-te-aaa",
    sku: "BIEN-JUEGO-TE-AAA",
    category: "Hogar Zen",
    description:
      "Juego de te para rituales de mesa, regalos y momentos de pausa en casa.",
    price: 139,
    originalPrice: 139,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-bowl.svg",
    metadata: {
      brand: "Eter Niu Bienestar",
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
      promoLabel: "Hogar Zen",
      deliveryBadge: "Envio gratis Ecuador",
      stockSignal: "Stock por confirmar por WhatsApp",
      bundleEligible: true,
      price: 139,
      originalPrice: 139,
      stock: 1,
    },
  },
  {
    title: "Termo acero inoxidable SUS 304 500 ml",
    handle: "termo-acero-sus304-500ml",
    sku: "BIEN-TERMO-SUS304-500",
    category: "Hogar Zen",
    description:
      "Termo de acero inoxidable SUS 304 de 500 ml para agua, te o bebidas del dia.",
    price: 20,
    originalPrice: 20,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-botella.svg",
    metadata: {
      brand: "Eter Niu Bienestar",
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
      promoLabel: "Uso diario",
      deliveryBadge: "Envio gratis Ecuador",
      stockSignal: "Stock por confirmar por WhatsApp",
      bundleEligible: true,
      price: 20,
      originalPrice: 20,
      stock: 1,
    },
  },
  {
    title: "Termo de acero SUS304 1000 ml",
    handle: "termo-acero-sus304-1000ml",
    sku: "BIEN-TERMO-SUS304-1000",
    category: "Hogar Zen",
    description:
      "Termo de acero SUS304 de 1000 ml para llevar bebida durante el dia.",
    price: 28.5,
    originalPrice: 28.5,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-botella.svg",
    metadata: {
      brand: "Eter Niu Bienestar",
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
      promoLabel: "Uso diario",
      deliveryBadge: "Envio gratis Ecuador",
      stockSignal: "Stock por confirmar por WhatsApp",
      bundleEligible: true,
      price: 28.5,
      originalPrice: 28.5,
      stock: 1,
    },
  },
  {
    title: "Yoga Mat Suede 4 mm Premium",
    handle: "yoga-mat-suede-4mm-premium",
    sku: "BIEN-YOGA-MAT-SUEDE-4MM",
    category: "Yoga & Movimiento",
    description:
      "Mat premium de suede de 4 mm para yoga, estiramiento y movimiento suave.",
    price: 79.99,
    originalPrice: 79.99,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-mat.svg",
    metadata: {
      brand: "Eter Niu Bienestar",
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
      promoLabel: "Movimiento premium",
      deliveryBadge: "Envio gratis Ecuador",
      stockSignal: "Stock por confirmar por WhatsApp",
      bundleEligible: true,
      price: 79.99,
      originalPrice: 79.99,
      stock: 1,
    },
  },
  {
    title: "Meditador Mandala PU Rubber 70 cm",
    handle: "meditador-mandala-pu-rubber-70cm",
    sku: "BIEN-MEDITADOR-MANDALA-70",
    category: "Yoga & Movimiento",
    description:
      "Meditador mandala de PU rubber de 70 cm para rincones de yoga, meditacion y pausa.",
    price: 33,
    originalPrice: 33,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-mat.svg",
    metadata: {
      brand: "Eter Niu Bienestar",
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
      promoLabel: "Pausa visual",
      deliveryBadge: "Envio gratis Ecuador",
      stockSignal: "Stock por confirmar por WhatsApp",
      bundleEligible: true,
      price: 33,
      originalPrice: 33,
      stock: 1,
    },
  },
  {
    title: "Pistola de percusion profesional 30 niveles",
    handle: "pistola-percusion-profesional-30-niveles",
    sku: "BIEN-PISTOLA-PERCUSION-PRO",
    category: "Yoga & Movimiento",
    description:
      "Pistola de percusion profesional con 30 niveles para masaje muscular de rutina.",
    price: 199,
    originalPrice: 199,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-mat.svg",
    metadata: {
      brand: "Eter Niu Bienestar",
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
      promoLabel: "Movimiento",
      deliveryBadge: "Envio gratis Ecuador",
      stockSignal: "Stock por confirmar por WhatsApp",
      bundleEligible: true,
      price: 199,
      originalPrice: 199,
      stock: 1,
    },
  },
  {
    title: "Cuenco de bronce con grabado sanscrito 8 cm",
    handle: "cuenco-bronce-grabado-sanscrito-8cm",
    sku: "BIEN-CUENCO-BRONCE-8",
    category: "Energia & Bienestar",
    description:
      "Cuenco de bronce a maquina con grabado sanscrito de 8 cm para rituales de sonido.",
    price: 45,
    originalPrice: 45,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-aroma.svg",
    metadata: {
      brand: "Eter Niu Bienestar",
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
      promoLabel: "Sonido",
      deliveryBadge: "Envio gratis Ecuador",
      stockSignal: "Stock por confirmar por WhatsApp",
      bundleEligible: true,
      price: 45,
      originalPrice: 45,
      stock: 1,
    },
  },
  {
    title: "Cuenco de bronce con grabado sanscrito 9 cm",
    handle: "cuenco-bronce-grabado-sanscrito-9cm",
    sku: "BIEN-CUENCO-BRONCE-9",
    category: "Energia & Bienestar",
    description:
      "Cuenco de bronce a maquina con grabado sanscrito de 9 cm para rituales de sonido.",
    price: 65,
    originalPrice: 65,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-aroma.svg",
    metadata: {
      brand: "Eter Niu Bienestar",
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
      promoLabel: "Sonido",
      deliveryBadge: "Envio gratis Ecuador",
      stockSignal: "Stock por confirmar por WhatsApp",
      bundleEligible: true,
      price: 65,
      originalPrice: 65,
      stock: 1,
    },
  },
  {
    title: "Tambor de lengua 8 notas",
    handle: "tambor-lengua-8-notas",
    sku: "BIEN-TAMBOR-LENGUA-8-NOTAS",
    category: "Energia & Bienestar",
    description: "Tambor de lengua de 8 notas para sonido ambiental y pausa.",
    price: 65,
    originalPrice: 65,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-tambor-lengua-real.jpg",
    metadata: {
      brand: "Eter Niu Bienestar",
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
      promoLabel: "Sonido",
      deliveryBadge: "Envio gratis Ecuador",
      stockSignal: "Stock por confirmar por WhatsApp",
      bundleEligible: true,
      price: 65,
      originalPrice: 65,
      stock: 1,
    },
  },
  {
    title: "Argollas plata 925",
    handle: "argollas-plata-925",
    sku: "BIEN-ARGOLLAS-PLATA-925",
    category: "Tesoros Plata & Acero",
    description: "Argollas de plata 925 para uso diario o regalo especial.",
    price: 43,
    originalPrice: 43,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-aroma.svg",
    metadata: {
      brand: "Eter Niu Bienestar",
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
      promoLabel: "Plata 925",
      deliveryBadge: "Envio gratis Ecuador",
      stockSignal: "Stock por confirmar por WhatsApp",
      bundleEligible: true,
      price: 43,
      originalPrice: 43,
      stock: 1,
    },
  },
  {
    title: "Dije OM grande",
    handle: "dije-om-grande",
    sku: "BIEN-DIJE-OM-PLATA-925",
    category: "Tesoros Plata & Acero",
    description:
      "Dije OM grande para regalo, uso personal o practica espiritual.",
    price: 74,
    originalPrice: 74,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-aroma.svg",
    metadata: {
      brand: "Eter Niu Bienestar",
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
      promoLabel: "Simbolo OM",
      deliveryBadge: "Envio gratis Ecuador",
      stockSignal: "Stock por confirmar por WhatsApp",
      bundleEligible: true,
      price: 74,
      originalPrice: 74,
      stock: 1,
    },
  },
  {
    title: "Amuleto Hindu plata 925",
    handle: "amuleto-hindu-plata-925",
    sku: "BIEN-AMULETO-HINDU-PLATA-925",
    category: "Tesoros Plata & Acero",
    description: "Amuleto hindu de plata 925 para uso personal o regalo.",
    price: 38,
    originalPrice: 38,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-aroma.svg",
    metadata: {
      brand: "Eter Niu Bienestar",
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
      promoLabel: "Plata 925",
      deliveryBadge: "Envio gratis Ecuador",
      stockSignal: "Stock por confirmar por WhatsApp",
      bundleEligible: true,
      price: 38,
      originalPrice: 38,
      stock: 1,
    },
  },
  {
    title: "Cascadas de humo OM, Ganesha y Torre",
    handle: "cascadas-humo-om-ganesha-torre",
    sku: "BIEN-CASCADA-HUMO-OM-GANESHA-TORRE",
    category: "Energia & Bienestar",
    description:
      "Cascadas de humo con disenos OM, Ganesha y Torre para ambientar espacios.",
    price: 12,
    originalPrice: 12,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-aroma.svg",
    metadata: {
      brand: "Eter Niu Bienestar",
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
      promoLabel: "Ambiente",
      deliveryBadge: "Envio gratis Ecuador",
      stockSignal: "Stock por confirmar por WhatsApp",
      bundleEligible: true,
      price: 12,
      originalPrice: 12,
      stock: 1,
    },
  },
  {
    title: "Pendulo 7 chakras",
    handle: "pendulo-7-chakras",
    sku: "BIEN-PENDULO-7-CHAKRAS",
    category: "Energia & Bienestar",
    description:
      "Pendulo 7 chakras para practica personal y accesorios energeticos.",
    price: 13.33,
    originalPrice: 13.33,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-aroma.svg",
    metadata: {
      brand: "Eter Niu Bienestar",
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
      claimNote:
        "No prometer diagnostico, proteccion ni resultados energeticos.",
      reorderAfterDays: 180,
      promoLabel: "7 chakras",
      deliveryBadge: "Envio gratis Ecuador",
      stockSignal: "Stock por confirmar por WhatsApp",
      bundleEligible: true,
      price: 13.33,
      originalPrice: 13.33,
      stock: 1,
    },
  },
  {
    title: "Lampara de sal Himalaya 10 kilos grande",
    handle: "lampara-sal-himalaya-10kg-grande",
    sku: "BIEN-LAMPARA-SAL-HIMALAYA-10KG",
    category: "Energia & Bienestar",
    description:
      "Lampara de sal Himalaya grande de 10 kilos para luz calida y decoracion.",
    price: 65,
    originalPrice: 65,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-aroma.svg",
    metadata: {
      brand: "Eter Niu Bienestar",
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
      promoLabel: "Luz calida",
      deliveryBadge: "Envio gratis Ecuador",
      stockSignal: "Stock por confirmar por WhatsApp",
      bundleEligible: true,
      price: 65,
      originalPrice: 65,
      stock: 1,
    },
  },
]

const legacyWellnessHandles = [
  "botella-termica",
  "mat-movimiento",
  "bowl-ceramico",
  "kit-aroma",
]

async function ensureCategories(container: MedusaContainer) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const categoryNames = [
    ...new Set(products.map((product) => product.category)),
  ]
  const { data: existingCategories } = await query.graph({
    entity: "product_category",
    fields: ["id", "name"],
    pagination: { take: 100 },
  })

  const missing = categoryNames.filter(
    (name) => !existingCategories.some((category) => category.name === name),
  )

  let createdCategories: Array<{ id: string; name: string }> = []
  if (missing.length) {
    const { result } = await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: missing.map((name) => ({
          name,
          is_active: true,
        })),
      },
    })
    createdCategories = result
  }

  return [...existingCategories, ...createdCategories]
}

function updateVariantInput(
  seed: WellnessProduct,
  existing: Record<string, any>,
) {
  const variant = existing.variants?.[0]
  if (!variant?.id) return undefined

  return [
    {
      id: variant.id,
      title: "Default",
      sku: seed.sku,
      prices: [{ amount: seed.price, currency_code: "usd" }],
      metadata: {
        ...(variant.metadata || {}),
        stock: seed.stock,
        price: seed.price,
        originalPrice: seed.originalPrice,
      },
    },
  ]
}

export default async function wellnessCatalogSeed({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const [{ data: channels }, { data: shippingProfiles }] = await Promise.all([
    query.graph({
      entity: "sales_channel",
      fields: ["id"],
      pagination: { take: 1 },
    }),
    query.graph({
      entity: "shipping_profile",
      fields: ["id"],
      pagination: { take: 1 },
    }),
  ])

  if (!channels?.[0]?.id || !shippingProfiles?.[0]?.id) {
    throw new Error(
      "Ejecuta primero el seed inicial de Medusa para crear canal y shipping profile.",
    )
  }

  const { data: existingProducts } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "metadata", "variants.id", "variants.metadata"],
    pagination: { take: 500 },
  })
  const categories = await ensureCategories(container)
  const existingByHandle = new Map(
    existingProducts.map((product) => [product.handle, product]),
  )
  const existingWellnessProducts = products.flatMap((product) => {
    const existing = existingByHandle.get(product.handle)
    return existing ? [{ seed: product, existing }] : []
  })
  const missingProducts = products.filter(
    (product) => !existingByHandle.has(product.handle),
  )
  const legacyProducts = legacyWellnessHandles.flatMap((handle) => {
    const existing = existingByHandle.get(handle)
    return existing ? [existing] : []
  })

  if (legacyProducts.length) {
    await updateProductsWorkflow(container).run({
      input: {
        products: legacyProducts.map((existing) => ({
          id: existing.id,
          status: ProductStatus.DRAFT,
          metadata: {
            ...(existing.metadata || {}),
            catalogActive: false,
            archivedFromWhatsappCatalog: true,
            archiveReason: "No aparece en el catalogo real de WhatsApp.",
          },
        })),
      },
    })

    logger.info(
      `Wellness catalog seed archived ${legacyProducts.length} legacy products.`,
    )
  }

  if (existingWellnessProducts.length) {
    await updateProductsWorkflow(container).run({
      input: {
        products: existingWellnessProducts.map(({ seed, existing }) => ({
          id: existing.id,
          title: seed.title,
          handle: seed.handle,
          description: seed.description,
          status: ProductStatus.PUBLISHED,
          thumbnail: seed.image,
          images: [{ url: seed.image }],
          variants: updateVariantInput(seed, existing),
          metadata: {
            ...(existing.metadata || {}),
            ...commercialMetadata,
            ...seed.metadata,
            category: seed.category,
          },
        })),
      },
    })

    logger.info(
      `Wellness catalog seed synced ${existingWellnessProducts.length} existing products.`,
    )
  }

  if (!missingProducts.length) {
    logger.info(
      "Wellness catalog seed skipped creation: products already exist.",
    )
    return
  }

  await createProductsWorkflow(container).run({
    input: {
      products: missingProducts.map((product) => ({
        title: product.title,
        handle: product.handle,
        description: product.description,
        status: ProductStatus.PUBLISHED,
        shipping_profile_id: shippingProfiles[0].id,
        category_ids: [
          categories.find((category) => category.name === product.category)!.id,
        ],
        thumbnail: product.image,
        images: [{ url: product.image }],
        metadata: {
          ...commercialMetadata,
          ...product.metadata,
          category: product.category,
        },
        options: [{ title: "Presentacion", values: ["Default"] }],
        variants: [
          {
            title: "Default",
            sku: product.sku,
            options: { Presentacion: "Default" },
            prices: [{ amount: product.price, currency_code: "usd" }],
            metadata: {
              stock: product.stock,
              price: product.price,
              originalPrice: product.originalPrice,
            },
          },
        ],
        sales_channels: [{ id: channels[0].id }],
      })),
    },
  })

  logger.info(
    `Wellness catalog seed created ${missingProducts.length} products.`,
  )
}
