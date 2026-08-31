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

/**
 * Las fotografías de esta entrega documentan colecciones, no cada diámetro.
 * Por eso solo se asocian a la colección correspondiente y nunca se usan para
 * crear una variante o un color que no exista en el catálogo.
 */
export function productMedia(product: Product): ProductMediaItem[] {
  if (product.sku.startsWith("MGC-FR-") && !product.sku.endsWith("-RO")) {
    return frenchCollectionMedia
  }

  if (product.sku.startsWith("MGC-EU-")) {
    return europeanCollectionMedia
  }

  return [
    {
      id: "product-cover",
      type: "image",
      src: product.imageUrl,
      alt: product.title,
      label: "Vista principal",
    },
  ]
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
