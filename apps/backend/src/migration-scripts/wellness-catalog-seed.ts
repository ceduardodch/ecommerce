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
    title: "Botella termica para rutina diaria",
    handle: "botella-termica",
    sku: "BIEN-BOTELLA-TERMICA-750",
    category: "Bienestar hidratacion",
    description:
      "Botella para hidratarte en casa, oficina o entrenamiento sin depender de envases descartables.",
    price: 24,
    originalPrice: 32,
    stock: 0,
    image: "https://bienestar.b2b.com.ec/media/wellness-botella.svg",
    metadata: {
      brand: "Eter Niu Bienestar",
      material: "Acero inoxidable",
      capacity: "750 ml",
      pieces: 1,
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
      promoLabel: "Rutina diaria",
      discountPercent: 25,
      deliveryBadge: "Envio gratis Ecuador",
      stockSignal: "Stock por confirmar para campana piloto",
      bundleEligible: true,
      price: 24,
      originalPrice: 32,
      stock: 0,
    },
  },
  {
    title: "Mat antideslizante para movimiento suave",
    handle: "mat-movimiento",
    sku: "BIEN-MAT-YOGA-ANTIDESLIZANTE",
    category: "Bienestar movimiento",
    description: "Mat para estiramiento, yoga suave y pausas activas en casa.",
    price: 39,
    originalPrice: 49,
    stock: 0,
    image: "https://bienestar.b2b.com.ec/media/wellness-mat.svg",
    metadata: {
      brand: "Eter Niu Bienestar",
      material: "Superficie antideslizante",
      capacity: "Uso personal",
      pieces: 1,
      nivel: "Inicio",
      bundleUseCase: "Estiramiento, respiracion y movimiento en casa",
      careTips: "Limpiar con pano humedo y guardar extendido o enrollado suave.",
      healthAngle:
        "Producto para acompanar pausas de movimiento, sin promesas terapeuticas.",
      warrantyText: "Garantia y disponibilidad a confirmar por WhatsApp.",
      contentAngles: ["pausa activa", "movimiento suave", "rutina de casa"],
      certificationStatus: "Proveedor por confirmar",
      claimNote: "No prometer tratamiento fisico ni resultado medico.",
      reorderAfterDays: 180,
      promoLabel: "Pausa activa",
      discountPercent: 20,
      deliveryBadge: "Envio gratis Ecuador",
      stockSignal: "Stock por confirmar para campana piloto",
      bundleEligible: true,
      price: 39,
      originalPrice: 49,
      stock: 0,
    },
  },
  {
    title: "Bowl ceramico para desayuno consciente",
    handle: "bowl-ceramico",
    sku: "BIEN-BOWL-CERAMICA-RITUAL",
    category: "Bienestar mesa",
    description:
      "Bowl para desayuno, snacks o rituales de mesa con una estetica tranquila.",
    price: 18,
    originalPrice: 24,
    stock: 0,
    image: "https://bienestar.b2b.com.ec/media/wellness-bowl.svg",
    metadata: {
      brand: "Eter Niu Bienestar",
      material: "Ceramica",
      capacity: "Desayuno o snack",
      pieces: 1,
      nivel: "Uso diario",
      bundleUseCase: "Avena, frutas, snacks y mesa visual para redes",
      careTips: "Lavar con esponja suave y evitar golpes termicos.",
      healthAngle:
        "Ayuda a construir momentos de pausa alrededor de la comida diaria.",
      warrantyText: "Garantia y disponibilidad a confirmar por WhatsApp.",
      contentAngles: ["desayuno consciente", "mesa tranquila", "regalo practico"],
      certificationStatus: "No aplica",
      claimNote: "No prometer beneficios nutricionales.",
      reorderAfterDays: 180,
      promoLabel: "Mesa consciente",
      discountPercent: 25,
      deliveryBadge: "Envio gratis Ecuador",
      stockSignal: "Stock por confirmar para campana piloto",
      bundleEligible: true,
      price: 18,
      originalPrice: 24,
      stock: 0,
    },
  },
  {
    title: "Kit de aroma para pausa en casa",
    handle: "kit-aroma",
    sku: "BIEN-KIT-AROMA-CALMA",
    category: "Bienestar pausa",
    description:
      "Kit para crear una pausa visual y aromatica en escritorio, sala o dormitorio.",
    price: 29,
    originalPrice: 38,
    stock: 0,
    image: "https://bienestar.b2b.com.ec/media/wellness-aroma.svg",
    metadata: {
      brand: "Eter Niu Bienestar",
      material: "Accesorios decorativos",
      capacity: "1 ambiente",
      pieces: 3,
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
      promoLabel: "Momento calma",
      discountPercent: 24,
      deliveryBadge: "Envio gratis Ecuador",
      stockSignal: "Stock por confirmar para campana piloto",
      bundleEligible: true,
      price: 29,
      originalPrice: 38,
      stock: 0,
    },
  },
]

async function ensureCategories(container: MedusaContainer) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const categoryNames = [...new Set(products.map((product) => product.category))]
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
    fields: ["id", "handle", "metadata"],
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
    logger.info("Wellness catalog seed skipped creation: products already exist.")
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

  logger.info(`Wellness catalog seed created ${missingProducts.length} products.`)
}
