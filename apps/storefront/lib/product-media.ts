import type { Product } from "./catalog";

export type ProductMediaItem = {
  id: string;
  type: "image" | "video";
  src: string;
  alt: string;
  label: string;
  poster?: string;
};

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
];

const europeanCollectionMedia: ProductMediaItem[] = [
  {
    id: "azul-oceanico-conjunto-real",
    type: "image",
    src: "/media/mgc-azul-oceanico/azul-oceanico-conjunto-real.jpeg",
    alt: "Conjunto Azul Oceánico MGC real, con sartenes y ollas sobre mesa de madera",
    label: "Conjunto real",
  },
  {
    id: "azul-oceanico-superior",
    type: "image",
    src: "/media/mgc-azul-oceanico/azul-oceanico-conjunto-superior.jpeg",
    alt: "Vista superior real del conjunto Azul Oceánico MGC",
    label: "Vista superior real",
  },
  {
    id: "azul-oceanico-video-real",
    type: "video",
    src: "/media/mgc-azul-oceanico/azul-oceanico-conjunto-real.mp4",
    poster: "/media/mgc-azul-oceanico/azul-oceanico-conjunto-real.jpeg",
    alt: "Video real del conjunto Azul Oceánico MGC",
    label: "Conjunto real en video",
  },
];

const onyxImperialMediaBySku: Record<string, ProductMediaItem[]> = {
  "MGC-FR-SARTEN-20-GN": [
    {
      id: "onyx-sarten-real",
      type: "image",
      src: "/media/mgc-imperial/onyx-sarten-real.jpeg",
      alt: "Sartén Onyx Imperial MGC real, con tapa de vidrio",
      label: "Pieza real",
    },
  ],
  "MGC-FR-SARTEN-24-GN": [
    {
      id: "onyx-sarten-real",
      type: "image",
      src: "/media/mgc-imperial/onyx-sarten-real.jpeg",
      alt: "Sartén Onyx Imperial MGC real, con tapa de vidrio",
      label: "Pieza real",
    },
  ],
  "MGC-FR-SARTEN-28-GN": [
    {
      id: "onyx-sarten-real",
      type: "image",
      src: "/media/mgc-imperial/onyx-sarten-real.jpeg",
      alt: "Sartén Onyx Imperial MGC real, con tapa de vidrio",
      label: "Pieza real",
    },
  ],
  "MGC-FR-LECHERA-18-GN": [
    {
      id: "onyx-lechera-real",
      type: "image",
      src: "/media/mgc-imperial/onyx-lechera-18-real.jpeg",
      alt: "Olla lechera Onyx Imperial MGC real, con tapa de vidrio",
      label: "Pieza real",
    },
  ],
  "MGC-FR-OLLA-20-GN": [
    {
      id: "onyx-olla-20-real",
      type: "image",
      src: "/media/mgc-imperial/onyx-olla-20-real.jpeg",
      alt: "Olla Onyx Imperial MGC real, con tapa de vidrio",
      label: "Pieza real",
    },
  ],
  "MGC-FR-OLLA-24-GN": [
    {
      id: "onyx-olla-24-real",
      type: "image",
      src: "/media/mgc-imperial/onyx-olla-24-real.jpeg",
      alt: "Olla Onyx Imperial MGC real, con tapa de vidrio",
      label: "Pieza real",
    },
  ],
  "MGC-FR-WOK-32-GN": [
    {
      id: "wok-tapa-redonda-real",
      type: "image",
      src: "/media/mgc-ebano-plata/ebano-plata-conjunto-frontal.jpg",
      alt: "Conjunto MGC real con sartén amplia y tapa de pomo redondo",
      label: "Tapa real de la colección",
    },
  ],
};

const onyxImperialSetMedia: ProductMediaItem[] = [
  {
    id: "onyx-conjunto-video",
    type: "video",
    src: "/media/mgc-imperial/onyx-imperial-conjunto-real.mp4",
    poster: "/media/mgc-imperial/onyx-wok-32-real.jpeg",
    alt: "Video real de las piezas del combo Onyx Imperial MGC",
    label: "Conjunto real en video",
  },
];

function productCover(product: Product): ProductMediaItem {
  if (product.sku === "MGC-FR-WOK-32-GN") {
    return {
      id: "wok-32-principal",
      type: "image",
      src: "/media/mgc-catalog/french-gris-negro-portada-iluminada.png",
      alt: "Wok francés MGC de 32 cm gris negro con tapa de vidrio sobre fondo blanco",
      label: "Wok 32 cm · vista principal",
    };
  }

  return {
    id: "product-cover",
    type: "image",
    src: product.imageUrl,
    alt: `${product.title}. Foto de su colección MGC.`,
    label: "Foto de la colección",
  };
}

/**
 * Solo el wok 32 está documentado con foto de la pieza aislada. Las demás
 * fotos se muestran como colección para no atribuir un diámetro no verificado.
 */
export function productMedia(product: Product): ProductMediaItem[] {
  const onyxMedia = onyxImperialMediaBySku[product.sku];
  if (onyxMedia) return [...onyxMedia, ...onyxImperialSetMedia];

  const cover = productCover(product);

  if (product.sku.startsWith("MGC-FR-") && !product.sku.endsWith("-RO")) {
    return [cover, ...frenchCollectionMedia];
  }

  if (product.sku.startsWith("MGC-EU-")) {
    return europeanCollectionMedia;
  }

  return [cover];
}

const comparableSkuGroups = [
  ["MGC-FR-SARTEN-20-GN", "MGC-EU-SARTEN-20-AZ"],
  ["MGC-FR-SARTEN-24-GN", "MGC-EU-SARTEN-24-AZ", "MGC-FR-SARTEN-24-RO"],
  ["MGC-FR-SARTEN-28-GN", "MGC-EU-SARTEN-28-AZ"],
  ["MGC-FR-OLLA-20-GN", "MGC-EU-OLLA-20-AZ"],
  ["MGC-FR-OLLA-24-GN", "MGC-EU-OLLA-24-AZ"],
];

/** Only exposes products that are explicitly declared comparable by size/type. */
export function comparableMgcProducts(product: Product, products: Product[]) {
  const skus = comparableSkuGroups.find((group) => group.includes(product.sku));
  if (!skus) return [];

  return skus
    .map((sku) => products.find((candidate) => candidate.sku === sku))
    .filter((candidate): candidate is Product => Boolean(candidate));
}
