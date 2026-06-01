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
  freeShipping: true,
  paymentMethods: ["transferencia", "deuna", "payphone"],
  couponCode: "GRANITOHOY",
}

const products: KitchenProduct[] = [
  {
    title: "Wok de granito 32 cm con tapa",
    handle: "wok-granito-32cm-tapa",
    sku: "MGC-WOK-GRANITO-32",
    category: "Woks granito",
    description:
      "Wok amplio para recetas diarias, salteados y preparaciones familiares con menos aceite.",
    price: 150,
    originalPrice: 179,
    stock: 8,
    image: "https://cocina.b2b.com.ec/media/photo-receta-wok.jpg",
    metadata: {
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
      promoLabel: "Producto estrella",
      discountPercent: 16,
      deliveryBadge: "Envio gratis Ecuador",
      stockSignal: "8 woks listos para entrega",
      bundleEligible: true,
      brand: "Eter Niu Cocina",
      price: 150,
      stock: 8,
      originalPrice: 179,
    },
  },
  {
    title: "Olla de granito 20 cm",
    handle: "olla-granito-20cm",
    sku: "MGC-OLLA-GRANITO-20",
    category: "Ollas granito",
    description:
      "Olla compacta para el dia a dia, porciones pequenas y cocina practica en casa.",
    price: 95,
    originalPrice: 119,
    stock: 10,
    image: "https://cocina.b2b.com.ec/media/photo-product-olla-20.jpg",
    metadata: {
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
      healthAngle:
        "Alternativa a antiadherentes tradicionales para uso diario.",
      warrantyText: "Garantia de fabrica a confirmar por WhatsApp.",
      instagramSourceUrl: "https://www.instagram.com/p/DWfKOWXhvJs/",
      sourceUrls: ["https://www.instagram.com/p/DWfKOWXhvJs/"],
      contentAngles: [
        "tamano compacto para porciones pequenas",
        "granito visible en olla 20 cm",
        "uso diario en cocina real",
      ],
      certificationStatus: "Proveedor por confirmar",
      claimNote:
        "Mantener copy educativo; no publicar claims medicos absolutos.",
      reorderAfterDays: 180,
      promoLabel: "Uso diario",
      discountPercent: 20,
      deliveryBadge: "Envio gratis 24-48h segun ciudad",
      stockSignal: "10 ollas disponibles",
      bundleEligible: true,
      brand: "Eter Niu Cocina",
      price: 95,
      stock: 10,
      originalPrice: 119,
    },
  },
  {
    title: "Olla de granito 24 cm familiar",
    handle: "olla-granito-24cm-familiar",
    sku: "MGC-OLLA-GRANITO-24",
    category: "Ollas granito",
    description:
      "Olla familiar para porciones grandes, sopas, guisos y cocina diaria con acabado granito.",
    price: 130,
    originalPrice: 159,
    stock: 12,
    image: "https://cocina.b2b.com.ec/media/photo-product-olla-24.jpg",
    metadata: {
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
      promoLabel: "Familiar",
      discountPercent: 18,
      deliveryBadge: "Envio gratis con stock confirmado",
      stockSignal: "12 ollas familiares disponibles",
      bundleEligible: true,
      brand: "Eter Niu Cocina",
      price: 130,
      stock: 12,
      originalPrice: 159,
    },
  },
  {
    title: "Set MGC ollas y sartenes de granito",
    handle: "set-mgc-ollas-sartenes-granito",
    sku: "MGC-SET-GRANITO-FAMILIAR",
    category: "Sets granito",
    description:
      "Linea MGC para cambiar ollas rayadas por un set de granito de uso diario.",
    price: 249,
    originalPrice: 299,
    stock: 5,
    image: "https://cocina.b2b.com.ec/media/photo-product-set-granito.jpg",
    metadata: {
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
      promoLabel: "Cambio saludable",
      discountPercent: 17,
      deliveryBadge: "Envio gratis coordinado",
      stockSignal: "5 sets armados",
      bundleEligible: true,
      brand: "Eter Niu Cocina",
      price: 249,
      stock: 5,
      originalPrice: 299,
    },
  },
  {
    title: "Sarten wok granito para recetas rapidas",
    handle: "sarten-wok-granito-recetas-rapidas",
    sku: "MGC-SARTEN-WOK-GRANITO-28",
    category: "Sartenes granito",
    description:
      "Sarten tipo wok para vegetales, pollo y recetas rapidas con menos aceite.",
    price: 85,
    originalPrice: 105,
    stock: 14,
    image: "https://cocina.b2b.com.ec/media/photo-detalle-wok.jpg",
    metadata: {
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
      careTips:
        "Usar fuego medio y evitar aerosoles que saturen la superficie.",
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
      promoLabel: "Menos aceite",
      discountPercent: 19,
      deliveryBadge: "Envio gratis con despacho rapido",
      stockSignal: "14 sartenes disponibles",
      bundleEligible: true,
      brand: "Eter Niu Cocina",
      price: 85,
      stock: 14,
      originalPrice: 105,
    },
  },
  {
    title: "Utensilios compatibles para granito",
    handle: "utensilios-compatibles-granito",
    sku: "MGC-UTENSILIOS-CUIDADO",
    category: "Complementos",
    description:
      "Kit de utensilios suaves para cuidar ollas y sartenes de granito sin rayarlas.",
    price: 28,
    originalPrice: 35,
    stock: 20,
    image: "https://cocina.b2b.com.ec/media/photo-product-utensilios.jpg",
    metadata: {
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
      promoLabel: "Cuida tu olla",
      discountPercent: 20,
      deliveryBadge: "Agregar al pedido con envio gratis",
      stockSignal: "20 kits disponibles",
      bundleEligible: true,
      brand: "Eter Niu Cocina",
      price: 28,
      stock: 20,
      originalPrice: 35,
    },
  },
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
    fields: ["id", "handle", "metadata"],
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
