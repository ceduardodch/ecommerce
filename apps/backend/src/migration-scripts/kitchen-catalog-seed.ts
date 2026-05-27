import { MedusaContainer } from "@medusajs/framework"
import {
  ContainerRegistrationKeys,
  ProductStatus,
} from "@medusajs/framework/utils"
import {
  createProductCategoriesWorkflow,
  createProductsWorkflow,
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

const products: KitchenProduct[] = [
  {
    title: "Bateria de ollas acero 7 piezas",
    handle: "bateria-ollas-acero-7-piezas",
    sku: "COC-OLLAS-7PZ",
    category: "Ollas",
    description:
      "Set de ollas en acero inoxidable para cocina diaria, emprendimientos y regalos familiares.",
    price: 119,
    originalPrice: 149,
    stock: 12,
    image:
      "https://images.unsplash.com/photo-1584990347449-a96e3d2398b2?auto=format&fit=crop&w=1000&q=80",
    metadata: {
      material: "Acero inoxidable",
      tipoCocina: "Casa y negocio",
      nivel: "Uso diario",
      bundleUseCase: "Base para cocina nueva",
      careTips: "Lavar con esponja suave y secar para conservar brillo.",
      reorderAfterDays: 365,
      promoLabel: "Set para empezar",
      discountPercent: 20,
      deliveryBadge: "Entrega Quito 24-48h",
      stockSignal: "12 sets listos para entrega",
      bundleEligible: true,
      brand: "B2B Cocina",
      stock: 12,
      originalPrice: 149,
    },
  },
  {
    title: "Juego de cuchillos chef 6 piezas",
    handle: "juego-cuchillos-chef-6-piezas",
    sku: "COC-CUCH-6PZ",
    category: "Cuchillos",
    description:
      "Cuchillos para preparar carnes, vegetales y mise en place con mejor control de corte.",
    price: 49,
    originalPrice: 65,
    stock: 18,
    image:
      "https://images.unsplash.com/photo-1593618998160-e34014e67546?auto=format&fit=crop&w=1000&q=80",
    metadata: {
      material: "Acero inoxidable",
      tipoCocina: "Chef/casa",
      nivel: "Intermedio",
      bundleUseCase: "Primer kit de preparacion",
      careTips: "Secar despues de lavar y afilar antes de jornadas largas.",
      reorderAfterDays: 180,
      promoLabel: "Mas pedido por WhatsApp",
      discountPercent: 25,
      deliveryBadge: "Despacho inmediato",
      stockSignal: "18 juegos disponibles",
      bundleEligible: true,
      brand: "B2B Cocina",
      stock: 18,
      originalPrice: 65,
    },
  },
  {
    title: "Tabla de corte doble cara",
    handle: "tabla-corte-doble-cara",
    sku: "COC-TABLA-DOBLE",
    category: "Tablas",
    description:
      "Tabla resistente para separar preparacion de carnes, vegetales y servicio diario.",
    price: 18,
    originalPrice: 24,
    stock: 34,
    image:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1000&q=80",
    metadata: {
      material: "Polipropileno grado cocina",
      tipoCocina: "Casa/restaurante",
      nivel: "Uso diario",
      bundleUseCase: "Complemento de cuchillos",
      careTips: "Usar una cara por tipo de alimento y lavar despues de cada uso.",
      reorderAfterDays: 180,
      promoLabel: "Agrega al combo",
      discountPercent: 25,
      deliveryBadge: "Entrega junto al set",
      stockSignal: "34 unidades disponibles",
      bundleEligible: true,
      brand: "B2B Cocina",
      stock: 34,
      originalPrice: 24,
    },
  },
  {
    title: "Combo emprendimiento de comida",
    handle: "combo-emprendimiento-comida",
    sku: "COC-COMBO-EMP",
    category: "Combos",
    description:
      "Set pensado para produccion pequena: ollas, sarten, cuchillos y tablas de trabajo.",
    price: 249,
    originalPrice: 305,
    stock: 4,
    image:
      "https://images.unsplash.com/photo-1556910096-6f5e72db6803?auto=format&fit=crop&w=1000&q=80",
    metadata: {
      material: "Acero + polipropileno",
      tipoCocina: "Emprendimiento",
      nivel: "Intensivo",
      bundleUseCase: "Produccion para pedidos",
      careTips: "Separar tablas por alimento y afilar cuchillos semanalmente.",
      reorderAfterDays: 120,
      promoLabel: "Para vender mas",
      discountPercent: 18,
      deliveryBadge: "Cotizacion prioritaria",
      stockSignal: "4 combos con entrega prioritaria",
      bundleEligible: true,
      brand: "B2B Cocina",
      stock: 4,
      originalPrice: 305,
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
    fields: ["id", "handle"],
    pagination: { take: 500 },
  })
  const categories = await ensureCategories(container)
  const missingProducts = products.filter(
    (product) =>
      !existingProducts.some((existing) => existing.handle === product.handle),
  )

  if (!missingProducts.length) {
    logger.info("Kitchen catalog seed skipped: products already exist.")
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
              originalPrice: product.originalPrice,
            },
          },
        ],
        sales_channels: [{ id: channels[0].id }],
      })),
    },
  })

  logger.info(`Kitchen catalog seed created ${missingProducts.length} products.`)
}
