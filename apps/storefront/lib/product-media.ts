import type { Product } from "./catalog"

export type ProductMediaItem = {
  id: string
  type: "image" | "video"
  src: string
  alt: string
  label: string
  poster?: string
}

const frenchCollectionMedia: ProductMediaItem[] = [
  {
    id: "french-sartenes-studio",
    type: "image",
    src: "/media/mgc-catalog/french-gris-negro-sartenes-estudio.png",
    alt: "Tres sartenes de la colección francesa gris negro MGC sobre fondo blanco",
    label: "Sartenes de la colección",
  },
  {
    id: "french-portada",
    type: "image",
    src: "/media/mgc-catalog/french-gris-negro-portada-iluminada.png",
    alt: "Sartén de la colección francesa gris negro MGC con tapa de vidrio sobre fondo blanco",
    label: "Vista principal de la colección",
  },
  {
    id: "french-lateral",
    type: "image",
    src: "/media/mgc-catalog/french-gris-negro-lateral-tapa.jpg",
    alt: "Vista lateral de sartén MGC gris negro con tapa de vidrio",
    label: "Vista lateral con tapa",
  },
  {
    id: "french-superior",
    type: "image",
    src: "/media/mgc-catalog/french-gris-negro-superior.jpg",
    alt: "Vista superior de sartén MGC gris negro y su tapa",
    label: "Vista superior",
  },
  {
    id: "french-mango",
    type: "image",
    src: "/media/mgc-catalog/french-gris-negro-mango.jpg",
    alt: "Detalle del mango de madera de la colección francesa MGC",
    label: "Detalle del mango",
  },
  {
    id: "french-interior",
    type: "image",
    src: "/media/mgc-catalog/french-gris-negro-interior.jpg",
    alt: "Detalle del interior con acabado granito de la colección francesa MGC",
    label: "Interior granito",
  },
  {
    id: "french-collection",
    type: "image",
    src: "/media/mgc-catalog/french-gris-negro-coleccion.jpg",
    alt: "Conjunto de sartenes gris negro de la colección francesa MGC",
    label: "Vista de la colección",
  },
  {
    id: "french-video",
    type: "video",
    src: "/media/mgc-catalog/french-gris-negro-en-movimiento.mp4",
    poster: "/media/mgc-catalog/french-gris-negro-portada-iluminada.png",
    alt: "Video de la colección francesa gris negro MGC en movimiento",
    label: "Ver en movimiento",
  },
]

const europeanCollectionMedia: ProductMediaItem[] = [
  {
    id: "european-collection-studio",
    type: "image",
    src: "/media/mgc-catalog/europea-azul-coleccion-estudio.png",
    alt: "Conjunto real de la colección europea azul MGC sobre fondo blanco",
    label: "Colección en estudio",
  },
  {
    id: "european-collection",
    type: "image",
    src: "/media/mgc-catalog/europea-azul-coleccion.jpg",
    alt: "Conjunto de la colección europea azul MGC con tapas de vidrio",
    label: "Vista de la colección",
  },
  {
    id: "european-top",
    type: "image",
    src: "/media/mgc-catalog/europea-azul-vista-superior.jpg",
    alt: "Vista superior de las piezas de la colección europea azul MGC",
    label: "Vista superior",
  },
  {
    id: "european-video",
    type: "video",
    src: "/media/mgc-catalog/europea-azul-en-movimiento.mp4",
    poster: "/media/mgc-catalog/europea-azul-coleccion.jpg",
    alt: "Video de la colección europea azul MGC en movimiento",
    label: "Ver en movimiento",
  },
]

function productCover(product: Product): ProductMediaItem {
  if (product.sku === "MGC-FR-WOK-32-GN") {
    return {
      id: "wok-32-principal",
      type: "image",
      src: "/media/mgc-catalog/french-gris-negro-portada-iluminada.png",
      alt: "Wok francés MGC de 32 cm gris negro con tapa de vidrio sobre fondo blanco",
      label: "Wok 32 cm · vista principal",
    }
  }

  return {
    id: "product-cover",
    type: "image",
    src: product.imageUrl,
    alt: `${product.title}. Foto de su colección MGC.`,
    label: "Foto de la colección",
  }
}

/**
 * Solo el wok 32 está documentado con foto de la pieza aislada. Las demás
 * fotos se muestran como colección para no atribuir un diámetro no verificado.
 */
export function productMedia(product: Product): ProductMediaItem[] {
  const cover = productCover(product)

  if (product.sku.startsWith("MGC-FR-") && !product.sku.endsWith("-RO")) {
    return [cover, ...frenchCollectionMedia]
  }

  if (product.sku.startsWith("MGC-EU-")) {
    return [cover, ...europeanCollectionMedia]
  }

  return [cover]
}

const comparableSkuGroups = [
  ["MGC-FR-SARTEN-20-GN", "MGC-EU-SARTEN-20-AZ"],
  [
    "MGC-FR-SARTEN-24-GN",
    "MGC-EU-SARTEN-24-AZ",
    "MGC-FR-SARTEN-24-RO",
  ],
  ["MGC-FR-SARTEN-28-GN", "MGC-EU-SARTEN-28-AZ"],
  ["MGC-FR-OLLA-20-GN", "MGC-EU-OLLA-20-AZ"],
  ["MGC-FR-OLLA-24-GN", "MGC-EU-OLLA-24-AZ"],
]

/** Only exposes products that are explicitly declared comparable by size/type. */
export function comparableMgcProducts(product: Product, products: Product[]) {
  const skus = comparableSkuGroups.find((group) => group.includes(product.sku))
  if (!skus) return []

  return skus
    .map((sku) => products.find((candidate) => candidate.sku === sku))
    .filter((candidate): candidate is Product => Boolean(candidate))
}
