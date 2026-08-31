import { MedusaContainer } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createInventoryItemsWorkflow,
  createInventoryLevelsWorkflow,
  createLinksWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  updateInventoryLevelsWorkflow,
  updateProductsWorkflow,
} from "@medusajs/medusa/core-flows";
import { august2026KitchenProducts } from "./kitchen-catalog-august-2026";

type KitchenProduct = {
  title: string;
  handle: string;
  sku: string;
  category: string;
  description: string;
  price: number;
  originalPrice: number;
  stock: number;
  image: string;
  metadata: Record<string, unknown>;
};

const commercialMetadata = {
  vertical: "cocina",
  freeShipping: true,
  paymentMethods: ["transferencia", "deuna", "payphone"],
  couponCode: "GRANITOHOY",
};

const kitchenPublicUrl = (
  process.env.COCINA_PUBLIC_URL ||
  process.env.STORE_PUBLIC_URL ||
  "https://shop.b2b.com.ec"
).replace(/\/$/, "");

const kitchenMediaUrl = (file: string) => `${kitchenPublicUrl}/media/${file}`;

const legacyKitchenProducts: KitchenProduct[] = [
  {
    title: "Wok 32 cm granito premium antiadherente",
    handle: "wok-granito-32cm-tapa",
    sku: "MGC-WOK-GRANITO-32",
    category: "Woks granito",
    description:
      "Wok de granito antiadherente para cocina diaria, salteados y porciones familiares.",
    price: 151.2,
    originalPrice: 151.2,
    stock: 1,
    image: kitchenMediaUrl("photo-receta-wok.jpg"),
    metadata: {
      brand: "Eter Niu Cocina",
      material: "Granito antiadherente",
      capacity: "Porciones familiares",
      pieces: 1,
      nivel: "Uso diario",
      bundleUseCase:
        "Salteados, arroz, recetas familiares y cocina con menos aceite",
      careTips:
        "Usar utensilios de silicona o madera, fuego medio y esponja suave.",
      healthAngle:
        "Opcion sin teflon para cocinar diario con una superficie antiadherente de granito.",
      warrantyText: "Garantia de fabrica a confirmar por WhatsApp.",
      sourceUrls: ["https://wa.me/c/593979854905"],
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
      price: 151.2,
      originalPrice: 151.2,
      stock: 1,
      coating: "Granito",
      teflonFree: true,
      pfoaFree: true,
      diameterCm: 32,
      stoveCompatibility: "Gas, induccion y vitroceramica",
      tipoCocina: "Familia y recetas",
    },
  },
  {
    title: "Olla 20 cm Granito Premium antiadherente",
    handle: "olla-granito-20cm",
    sku: "MGC-OLLA-GRANITO-20",
    category: "Ollas granito",
    description:
      "Olla de granito antiadherente para porciones pequenas y uso diario en casa.",
    price: 75.6,
    originalPrice: 75.6,
    stock: 1,
    image: kitchenMediaUrl("photo-product-olla-20.jpg"),
    metadata: {
      brand: "Eter Niu Cocina",
      material: "Granito antiadherente",
      capacity: "1 a 3 personas",
      pieces: 1,
      nivel: "Inicio saludable",
      bundleUseCase: "Salsas, avena, guarniciones y porciones pequenas",
      careTips:
        "Evitar metal, precalentar suave y lavar cuando la olla este tibia.",
      healthAngle:
        "Alternativa a antiadherentes tradicionales para uso diario.",
      warrantyText: "Garantia de fabrica a confirmar por WhatsApp.",
      sourceUrls: ["https://wa.me/c/593979854905"],
      contentAngles: ["olla 20 cm", "porciones pequenas", "uso diario"],
      certificationStatus:
        "Catalogo WhatsApp: certificaciones USA y Europeas; guardar respaldo del proveedor antes de pauta fuerte.",
      claimNote:
        "No publicar claims medicos; libre de teflon/PFOA queda sujeto a respaldo del proveedor.",
      reorderAfterDays: 180,
      promoLabel: "Uso diario",
      deliveryBadge: "Envio gratis 24-48h segun ciudad",
      stockSignal: "Stock por confirmar por WhatsApp",
      bundleEligible: true,
      price: 75.6,
      originalPrice: 75.6,
      stock: 1,
      coating: "Granito",
      teflonFree: true,
      pfoaFree: true,
      diameterCm: 20,
      stoveCompatibility: "Gas, induccion y vitroceramica",
      tipoCocina: "Diario ligero",
    },
  },
  {
    title: "Olla 18 cm Granito Premium antiadherente",
    handle: "olla-granito-18cm",
    sku: "MGC-OLLA-GRANITO-18",
    category: "Ollas granito",
    description:
      "Olla compacta de granito antiadherente para salsas, guarniciones y porciones pequenas.",
    price: 63.6,
    originalPrice: 63.6,
    stock: 1,
    image: kitchenMediaUrl("photo-product-olla-20.jpg"),
    metadata: {
      brand: "Eter Niu Cocina",
      material: "Granito antiadherente",
      capacity: "1 a 2 personas",
      pieces: 1,
      nivel: "Uso diario",
      bundleUseCase: "Porciones pequenas, salsas, guarniciones y cocina diaria",
      careTips:
        "Cocinar a fuego medio para conservar el recubrimiento por mas tiempo.",
      healthAngle:
        "Olla compacta sin teflon para empezar con granito en la cocina diaria.",
      warrantyText: "Garantia de fabrica a confirmar por WhatsApp.",
      sourceUrls: ["https://wa.me/c/593979854905"],
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
      price: 63.6,
      originalPrice: 63.6,
      stock: 1,
      coating: "Granito",
      teflonFree: true,
      pfoaFree: true,
      diameterCm: 18,
      stoveCompatibility: "Gas, induccion y vitroceramica",
      tipoCocina: "Diario ligero",
    },
  },
  {
    title: "Sarten plano 22 cm Granito Premium antiadherente",
    handle: "sarten-plano-granito-22cm",
    sku: "COC-SARTEN-PLANO-GRANITO-22",
    category: "Sartenes granito",
    description:
      "Sarten plano de granito antiadherente para desayunos, vegetales y preparaciones rapidas.",
    price: 62.4,
    originalPrice: 62.4,
    stock: 1,
    image: kitchenMediaUrl("photo-detalle-wok.jpg"),
    metadata: {
      brand: "Eter Niu Cocina",
      material: "Granito antiadherente",
      capacity: "1 a 3 personas",
      pieces: 1,
      nivel: "Uso diario",
      bundleUseCase: "Huevos, vegetales, pollo, tortillas y desayunos",
      careTips:
        "Usar fuego medio, utensilios suaves y evitar choque termico al lavar.",
      healthAngle:
        "Alternativa a antiadherentes tradicionales para recetas de todos los dias.",
      warrantyText: "Garantia y disponibilidad a confirmar por WhatsApp.",
      sourceUrls: ["https://wa.me/c/593979854905"],
      contentAngles: ["sarten 22 cm", "desayunos", "uso rapido"],
      certificationStatus:
        "Catalogo WhatsApp: certificaciones USA y Europeas; guardar respaldo del proveedor antes de pauta fuerte.",
      claimNote:
        "No publicar claims medicos; libre de teflon/PFOA queda sujeto a respaldo del proveedor.",
      reorderAfterDays: 180,
      promoLabel: "Catalogo real WhatsApp",
      deliveryBadge: "Envio gratis Ecuador",
      stockSignal: "Stock por confirmar por WhatsApp",
      bundleEligible: true,
      price: 62.4,
      originalPrice: 62.4,
      stock: 1,
      coating: "Granito",
      teflonFree: true,
      pfoaFree: true,
      diameterCm: 22,
      stoveCompatibility: "Gas, induccion y vitroceramica",
      tipoCocina: "Rapido diario",
    },
  },
  {
    title: "Cuchillo samurai Japones todo uso",
    handle: "cuchillo-samurai-japones-todo-uso",
    sku: "COC-CUCHILLO-SAMURAI-TODO-USO",
    category: "Cuchillos",
    description:
      "Cuchillo Samurai todo uso para cortes precisos en preparaciones diarias.",
    price: 29.99,
    originalPrice: 50,
    stock: 1,
    image: kitchenMediaUrl("photo-product-cuchillo-samurai.jpg"),
    metadata: {
      brand: "Eter Niu Cocina",
      material: "Acero inoxidable",
      capacity: "Todo uso",
      pieces: 1,
      nivel: "Uso diario",
      bundleUseCase: "Verduras, carnes, frutas y preparacion general",
      careTips: "Lavar y secar despues de usar; guardar protegido.",
      healthAngle:
        "Complemento practico para preparar ingredientes antes de cocinar.",
      warrantyText: "Garantia y disponibilidad a confirmar por WhatsApp.",
      sourceUrls: ["https://wa.me/c/593979854905"],
      contentAngles: ["cuchillo todo uso", "preparacion diaria"],
      certificationStatus: "No aplica",
      claimNote:
        "No publicar promesas de durabilidad extrema sin ficha tecnica.",
      reorderAfterDays: 240,
      promoLabel: "Oferta especial",
      deliveryBadge: "Envio gratis por Servientrega",
      stockSignal: "Stock por confirmar por WhatsApp",
      bundleEligible: true,
      price: 29.99,
      originalPrice: 50,
      stock: 1,
      stoveCompatibility: "No aplica; complemento de cocina",
      tipoCocina: "Corte diario",
    },
  },
];

// El catálogo público de agosto reemplaza los productos de muestra anteriores.
// Todas las referencias de agosto se publican; la variante roja indica que su
// imagen es referencial hasta recibir la foto física exacta.
const products: KitchenProduct[] = [...august2026KitchenProducts];

const publishableProducts = products.filter(
  (product) => product.metadata.catalogActive !== false,
);

const legacyKitchenHandles = [
  ...legacyKitchenProducts.map((product) => product.handle),
  ...august2026KitchenProducts
    .filter((product) => product.metadata.catalogActive === false)
    .map((product) => product.handle),
  "olla-granito-24cm-familiar",
  "set-mgc-ollas-sartenes-granito",
  "sarten-wok-granito-recetas-rapidas",
  "utensilios-compatibles-granito",
];

async function ensureCategories(container: MedusaContainer) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const categoryNames = [
    ...new Set(publishableProducts.map((product) => product.category)),
  ];
  const { data: existingCategories } = await query.graph({
    entity: "product_category",
    fields: ["id", "name"],
    pagination: { take: 100 },
  });

  const missing = categoryNames.filter(
    (name) => !existingCategories.some((category) => category.name === name),
  );

  let createdCategories: Array<{ id: string; name: string }> = [];
  if (missing.length) {
    const { result } = await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: missing.map((name) => ({
          name,
          is_active: true,
        })),
      },
    });
    createdCategories = result;
  }

  return [...existingCategories, ...createdCategories];
}

function updateVariantInput(
  seed: KitchenProduct,
  existing: Record<string, any>,
) {
  const variant = existing.variants?.[0];
  if (!variant?.id) return undefined;

  return [
    {
      id: variant.id,
      title: "Default",
      sku: seed.sku,
      manage_inventory: true,
      prices: [{ amount: seed.price, currency_code: "usd" }],
      metadata: {
        ...(variant.metadata || {}),
        stock: seed.stock,
        price: seed.price,
        originalPrice: seed.originalPrice,
      },
    },
  ];
}

async function syncInventoryLevels(
  container: MedusaContainer,
  products: KitchenProduct[],
) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const [{ data: locations }, { data: catalogProducts }] = await Promise.all([
    query.graph({
      entity: "stock_location",
      fields: ["id"],
      pagination: { take: 1 },
    }),
    query.graph({
      entity: "product",
      fields: [
        "handle",
        "variants.id",
        "variants.sku",
        "variants.inventory_items.inventory_item_id",
      ],
      pagination: { take: 500 },
    }),
  ]);
  const locationId = locations[0]?.id;
  if (!locationId) {
    throw new Error("No existe una ubicación de inventario para el catálogo.");
  }

  const variants = products.flatMap((seed) => {
    const product = catalogProducts.find(
      (candidate) => candidate.handle === seed.handle,
    );
    const variant = product?.variants?.find(
      (candidate) => candidate.sku === seed.sku,
    );
    return variant?.id ? [{ seed, variant }] : [];
  });

  const missingItems = variants.filter(
    ({ variant }) => !variant.inventory_items?.[0]?.inventory_item_id,
  );
  const createdInventoryItemByVariantId = new Map<string, string>();
  if (missingItems.length) {
    const { result: createdItems } = await createInventoryItemsWorkflow(
      container,
    ).run({
      input: { items: missingItems.map(({ seed }) => ({ sku: seed.sku })) },
    });
    await createLinksWorkflow(container).run({
      input: missingItems.map(({ variant }, index) => ({
        product: { variant_id: variant.id },
        inventory: { inventory_item_id: createdItems[index].id },
        data: { required_quantity: 1 },
      })),
    });
    missingItems.forEach(({ variant }, index) =>
      createdInventoryItemByVariantId.set(
        variant.id,
        createdItems[index].id,
      ),
    );
  }

  const inventoryItemIdFor = (variant: (typeof variants)[number]["variant"]) =>
    variant.inventory_items?.[0]?.inventory_item_id ||
    createdInventoryItemByVariantId.get(variant.id);
  const inventoryItemIds = variants
    .map(({ variant }) => inventoryItemIdFor(variant))
    .filter((id): id is string => Boolean(id));
  const { data: levels } = await query.graph({
    entity: "inventory_level",
    fields: ["id", "inventory_item_id", "location_id"],
    filters: { inventory_item_id: inventoryItemIds },
    pagination: { take: 500 },
  });

  const create = variants.flatMap(({ seed, variant }) => {
    const inventoryItemId = inventoryItemIdFor(variant);
    if (!inventoryItemId) return [];
    const exists = levels.some(
      (level) =>
        level.inventory_item_id === inventoryItemId &&
        level.location_id === locationId,
    );
    return exists
      ? []
      : [
          {
            inventory_item_id: inventoryItemId,
            location_id: locationId,
            stocked_quantity: seed.stock,
          },
        ];
  });
  if (create.length) {
    await createInventoryLevelsWorkflow(container).run({
      input: { inventory_levels: create },
    });
  }

  const updates = variants.flatMap(({ seed, variant }) => {
    const inventoryItemId = inventoryItemIdFor(variant);
    if (!inventoryItemId) return [];
    return [
      {
        inventory_item_id: inventoryItemId,
        location_id: locationId,
        stocked_quantity: seed.stock,
      },
    ];
  });
  if (updates.length) {
    await updateInventoryLevelsWorkflow(container).run({ input: { updates } });
  }
}

export default async function kitchenCatalogSeed({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

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
  ]);

  if (!channels?.[0]?.id || !shippingProfiles?.[0]?.id) {
    throw new Error(
      "Ejecuta primero el seed inicial de Medusa para crear canal y shipping profile.",
    );
  }

  const { data: existingProducts } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "metadata", "variants.id", "variants.metadata"],
    pagination: { take: 500 },
  });
  const categories = await ensureCategories(container);
  const existingByHandle = new Map(
    existingProducts.map((product) => [product.handle, product]),
  );
  const existingKitchenProducts = publishableProducts.flatMap((product) => {
    const existing = existingByHandle.get(product.handle);
    return existing ? [{ seed: product, existing }] : [];
  });
  const missingProducts = publishableProducts.filter(
    (product) => !existingByHandle.has(product.handle),
  );
  const legacyProducts = legacyKitchenHandles.flatMap((handle) => {
    const existing = existingByHandle.get(handle);
    return existing ? [existing] : [];
  });

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
    });

    logger.info(
      `Kitchen catalog seed archived ${legacyProducts.length} legacy products.`,
    );
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
    });

    logger.info(
      `Kitchen catalog seed synced ${existingKitchenProducts.length} existing products.`,
    );
  }

  if (!missingProducts.length) {
    await syncInventoryLevels(container, publishableProducts);
    logger.info("Kitchen catalog seed synced inventory for existing products.");
    return;
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
            manage_inventory: true,
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
  });

  logger.info(
    `Kitchen catalog seed created ${missingProducts.length} products.`,
  );
  await syncInventoryLevels(container, publishableProducts);
  logger.info("Kitchen catalog seed synced inventory levels.");
}
