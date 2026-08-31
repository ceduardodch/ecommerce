type KitchenCatalogProduct = {
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

const publicUrl = (
  process.env.COCINA_PUBLIC_URL ||
  process.env.STORE_PUBLIC_URL ||
  "https://shop.b2b.com.ec"
).replace(/\/$/, "")

const imageUrl = (file: string) => `${publicUrl}/media/mgc-agosto-2026/${file}`

function cookware(input: {
  sku: string
  title: string
  handle: string
  category: string
  collection: "Francesa" | "Europea"
  color: "Gris negro" | "Azul" | "Rojo"
  diameter: number
  stock: number
  pvp: number
  negotiable: number
  distributor: number
  image?: string
}): KitchenCatalogProduct {
  const hasImage = Boolean(input.image)
  return {
    title: input.title,
    handle: input.handle,
    sku: input.sku,
    category: input.category,
    description: `${input.title} de granito con mango de madera.${input.color === "Rojo" ? " Imagen referencial de color; confirma el acabado con el vendedor por WhatsApp." : ""} Confirma disponibilidad, compatibilidad y garantía por WhatsApp.`,
    price: input.pvp,
    originalPrice: input.pvp,
    stock: input.stock,
    image: hasImage ? imageUrl(input.image!) : "",
    metadata: {
      brand: "MGC",
      material: "Granito; mango de madera",
      collection: input.collection,
      color: input.color,
      diameterCm: input.diameter,
      pieces: 1,
      price: input.pvp,
      originalPrice: input.pvp,
      negotiatedPrice: input.negotiable,
      comboMinimumItems: 3,
      distributorPrice: input.distributor,
      distributorMinimumOrderUsd: 260,
      stock: input.stock,
      promoLabel: "Consulta promociones por WhatsApp",
      stockSignal: input.color === "Rojo"
        ? "Imagen referencial de color; stock confirmado en importación"
        : hasImage
        ? "Stock confirmado en importación; entrega por confirmar"
        : "No publicar hasta contar con foto real",
      bundleEligible: true,
      deliveryBadge: "Entrega y costo de envío por confirmar",
      careTips:
        "Usar utensilios de silicona o madera y lavar con esponja suave.",
      warrantyText: "Garantía por confirmar con el proveedor.",
      claimNote:
        "No publicar compatibilidad, certificaciones ni claims de salud sin respaldo del proveedor.",
      catalogActive: hasImage,
    },
  }
}

export const august2026KitchenProducts: KitchenCatalogProduct[] = [
  cookware({
    sku: "MGC-FR-SARTEN-20-GN",
    title: "Sartén francesa 20 cm",
    handle: "sarten-francesa-20cm-gris-negro",
    category: "Sartenes granito",
    collection: "Francesa",
    color: "Gris negro",
    diameter: 20,
    stock: 96,
    pvp: 55,
    negotiable: 39.99,
    distributor: 28.56,
    image: "catalogo-sarten-con-tapa-gris-negro.jpg",
  }),
  cookware({
    sku: "MGC-FR-SARTEN-24-GN",
    title: "Sartén francesa 24 cm",
    handle: "sarten-francesa-24cm-gris-negro",
    category: "Sartenes granito",
    collection: "Francesa",
    color: "Gris negro",
    diameter: 24,
    stock: 96,
    pvp: 60,
    negotiable: 49.99,
    distributor: 36.92,
    image: "catalogo-sarten-con-tapa-gris-negro.jpg",
  }),
  cookware({
    sku: "MGC-FR-SARTEN-28-GN",
    title: "Sartén francesa 28 cm",
    handle: "sarten-francesa-28cm-gris-negro",
    category: "Sartenes granito",
    collection: "Francesa",
    color: "Gris negro",
    diameter: 28,
    stock: 96,
    pvp: 65,
    negotiable: 59.99,
    distributor: 48.8,
    image: "catalogo-sarten-con-tapa-gris-negro.jpg",
  }),
  cookware({
    sku: "MGC-FR-LECHERA-18-GN",
    title: "Olla lechera francesa 18 cm",
    handle: "olla-lechera-francesa-18cm-gris-negro",
    category: "Ollas granito",
    collection: "Francesa",
    color: "Gris negro",
    diameter: 18,
    stock: 48,
    pvp: 53,
    negotiable: 39,
    distributor: 35.12,
    image: "catalogo-sarten-con-tapa-gris-negro.jpg",
  }),
  cookware({
    sku: "MGC-FR-OLLA-20-GN",
    title: "Olla francesa 20 cm",
    handle: "olla-francesa-20cm-gris-negro",
    category: "Ollas granito",
    collection: "Francesa",
    color: "Gris negro",
    diameter: 20,
    stock: 32,
    pvp: 63,
    negotiable: 49,
    distributor: 45.84,
    image: "catalogo-sarten-con-tapa-gris-negro.jpg",
  }),
  cookware({
    sku: "MGC-FR-OLLA-24-GN",
    title: "Olla francesa 24 cm",
    handle: "olla-francesa-24cm-gris-negro",
    category: "Ollas granito",
    collection: "Francesa",
    color: "Gris negro",
    diameter: 24,
    stock: 32,
    pvp: 73,
    negotiable: 59,
    distributor: 60.72,
    image: "catalogo-sarten-con-tapa-gris-negro.jpg",
  }),
  cookware({
    sku: "MGC-FR-WOK-32-GN",
    title: "Wok francés 32 cm",
    handle: "wok-frances-32cm-gris-negro",
    category: "Woks granito",
    collection: "Francesa",
    color: "Gris negro",
    diameter: 32,
    stock: 18,
    pvp: 139.99,
    negotiable: 129.99,
    distributor: 86.32,
    image: "catalogo-sarten-con-tapa-gris-negro.jpg",
  }),
  cookware({
    sku: "MGC-FR-SARTEN-24-RO",
    title: "Sartén francesa angular 24 cm",
    handle: "sarten-francesa-angular-24cm-roja",
    category: "Sartenes granito",
    collection: "Francesa",
    color: "Rojo",
    diameter: 24,
    stock: 8,
    pvp: 60,
    negotiable: 55,
    distributor: 46.44,
    image: "catalogo-sarten-angular-roja-referencial.png",
  }),
  cookware({
    sku: "MGC-EU-SARTEN-20-AZ",
    title: "Sartén europea 20 cm",
    handle: "sarten-europea-20cm-azul",
    category: "Sartenes granito",
    collection: "Europea",
    color: "Azul",
    diameter: 20,
    stock: 16,
    pvp: 55,
    negotiable: 45,
    distributor: 35.72,
    image: "catalogo-coleccion-europea-azul.jpg",
  }),
  cookware({
    sku: "MGC-EU-SARTEN-24-AZ",
    title: "Sartén europea 24 cm",
    handle: "sarten-europea-24cm-azul",
    category: "Sartenes granito",
    collection: "Europea",
    color: "Azul",
    diameter: 24,
    stock: 16,
    pvp: 60,
    negotiable: 55,
    distributor: 39.28,
    image: "catalogo-coleccion-europea-azul.jpg",
  }),
  cookware({
    sku: "MGC-EU-SARTEN-28-AZ",
    title: "Sartén europea 28 cm",
    handle: "sarten-europea-28cm-azul",
    category: "Sartenes granito",
    collection: "Europea",
    color: "Azul",
    diameter: 28,
    stock: 16,
    pvp: 65,
    negotiable: 60,
    distributor: 50.6,
    image: "catalogo-coleccion-europea-azul.jpg",
  }),
  cookware({
    sku: "MGC-EU-LECHERA-16-AZ",
    title: "Olla lechera europea 16 cm",
    handle: "olla-lechera-europea-16cm-azul",
    category: "Ollas granito",
    collection: "Europea",
    color: "Azul",
    diameter: 16,
    stock: 8,
    pvp: 53,
    negotiable: 45,
    distributor: 35.72,
    image: "catalogo-coleccion-europea-azul.jpg",
  }),
  cookware({
    sku: "MGC-EU-OLLA-20-AZ",
    title: "Olla europea 20 cm",
    handle: "olla-europea-20cm-azul",
    category: "Ollas granito",
    collection: "Europea",
    color: "Azul",
    diameter: 20,
    stock: 8,
    pvp: 63,
    negotiable: 55,
    distributor: 45.24,
    image: "catalogo-coleccion-europea-azul.jpg",
  }),
  cookware({
    sku: "MGC-EU-OLLA-24-AZ",
    title: "Olla europea 24 cm",
    handle: "olla-europea-24cm-azul",
    category: "Ollas granito",
    collection: "Europea",
    color: "Azul",
    diameter: 24,
    stock: 8,
    pvp: 73,
    negotiable: 65,
    distributor: 56.56,
    image: "catalogo-coleccion-europea-azul.jpg",
  }),
]
