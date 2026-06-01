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

type KitchenProduct = {
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
  vertical: "cocina",
  freeShipping: true,
  paymentMethods: ["transferencia", "deuna", "payphone"],
  couponCode: "GRANITOHOY",
}

const products: KitchenProduct[] = [
  {
    title: "Wok 32 cm granito premium antiadherente",
    handle: "wok-granito-32cm-tapa",
    sku: "MGC-WOK-GRANITO-32",
    category: "Woks granito",
    description:
      "Wok de granito antiadherente libre de teflon y PFOA segun catalogo WhatsApp.",
    price: 151.2,
    originalPrice: 151.2,
    stock: 1,
    image: "https://cocina.b2b.com.ec/media/photo-receta-wok.jpg",
    metadata: {
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
      promoLabel: "Catalogo real WhatsApp",
      deliveryBadge: "Envio gratis Ecuador",
      stockSignal: "Stock por confirmar por WhatsApp",
      bundleEligible: true,
      brand: "Eter Niu Cocina",
      price: 151.2,
      stock: 1,
      originalPrice: 151.2,
    },
  },
  {
    title: "Olla de granito 20 cm",
    handle: "olla-granito-20cm",
    sku: "MGC-OLLA-GRANITO-20",
    category: "Ollas granito",
    description:
      "Olla de granito antiadherente libre de teflon y PFOA segun catalogo WhatsApp.",
    price: 75.6,
    originalPrice: 75.6,
    stock: 1,
    image: "https://cocina.b2b.com.ec/media/photo-product-olla-20.jpg",
    metadata: {
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
      healthAngle:
        "Alternativa a antiadherentes tradicionales para uso diario en casa.",
      warrantyText: "Garantia de fabrica a confirmar por WhatsApp.",
      sourceUrls: ["https://wa.me/c/593979854915"],
      contentAngles: [
        "olla 20 cm",
        "porciones pequenas",
        "uso diario en cocina real",
      ],
      certificationStatus:
        "Catalogo WhatsApp: certificaciones USA y Europeas; guardar respaldo del proveedor antes de pauta fuerte.",
      claimNote:
        "No publicar claims medicos; libre de teflon/PFOA queda sujeto a respaldo del proveedor.",
      reorderAfterDays: 180,
      promoLabel: "Uso diario",
      deliveryBadge: "Envio gratis 24-48h segun ciudad",
      stockSignal: "Stock por confirmar por WhatsApp",
      bundleEligible: true,
      brand: "Eter Niu Cocina",
      price: 75.6,
      stock: 1,
      originalPrice: 75.6,
    },
  },
  {
    title: "Olla 18 cm Granito Premium antiadherente",
    handle: "olla-granito-18cm",
    sku: "MGC-OLLA-GRANITO-18",
    category: "Ollas granito",
    description:
      "Olla de granito antiadherente libre de teflon y PFOA segun catalogo WhatsApp.",
    price: 63.6,
    originalPrice: 63.6,
    stock: 1,
    image: "https://cocina.b2b.com.ec/media/photo-product-olla-20.jpg",
    metadata: {
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
      contentAngles: [
        "olla 18 cm",
        "tamano compacto",
        "uso diario en hornilla",
      ],
      certificationStatus:
        "Catalogo WhatsApp: certificaciones USA y Europeas; guardar respaldo del proveedor antes de pauta fuerte.",
      claimNote:
        "No publicar claims medicos; libre de teflon/PFOA queda sujeto a respaldo del proveedor.",
      reorderAfterDays: 180,
      promoLabel: "Catalogo real WhatsApp",
      deliveryBadge: "Envio gratis con stock confirmado",
      stockSignal: "Stock por confirmar por WhatsApp",
      bundleEligible: true,
      brand: "Eter Niu Cocina",
      price: 63.6,
      stock: 1,
      originalPrice: 63.6,
    },
  },
  {
    title: "Cuchillo samurai Japones todo uso",
    handle: "cuchillo-samurai-japones-todo-uso",
    sku: "COC-CUCHILLO-SAMURAI-TODO-USO",
    category: "Cuchillos",
    description:
      "Cuchillo Samurai todo uso para cortes precisos en preparaciones diarias.",
    price: 30,
    originalPrice: 30,
    stock: 1,
    image: "https://cocina.b2b.com.ec/media/photo-product-utensilios.jpg",
    metadata: {
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
      claimNote:
        "No publicar promesas de durabilidad extrema sin ficha tecnica.",
      reorderAfterDays: 240,
      promoLabel: "Complemento",
      deliveryBadge: "Agregar al pedido con envio gratis",
      stockSignal: "Stock por confirmar por WhatsApp",
      bundleEligible: true,
      brand: "Eter Niu Cocina",
      price: 30,
      stock: 1,
      originalPrice: 30,
    },
  },
]

const legacyKitchenHandles = [
  "olla-granito-24cm-familiar",
  "set-mgc-ollas-sartenes-granito",
  "sarten-wok-granito-recetas-rapidas",
  "utensilios-compatibles-granito",
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
  seed: KitchenProduct,
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

export default async function kitchenCatalogSeed({
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
  const existingKitchenProducts = products.flatMap((product) => {
    const existing = existingByHandle.get(product.handle)
    return existing ? [{ seed: product, existing }] : []
  })
  const missingProducts = products.filter(
    (product) => !existingByHandle.has(product.handle),
  )
  const legacyProducts = legacyKitchenHandles.flatMap((handle) => {
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
      `Kitchen catalog seed archived ${legacyProducts.length} legacy products.`,
    )
  }

  if (existingKitchenProducts.length) {
    await updateProductsWorkflow(container).run({
      input: {
        products: existingKitchenProducts.map(({ seed, existing }) => ({
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
      `Kitchen catalog seed synced ${existingKitchenProducts.length} existing products.`,
    )
  }

  if (!missingProducts.length) {
    logger.info(
      "Kitchen catalog seed skipped creation: products already exist.",
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
    `Kitchen catalog seed created ${missingProducts.length} products.`,
  )
}
