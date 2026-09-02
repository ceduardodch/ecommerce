import type { Product } from "./catalog";

export type ProductMediaItem = {
  id: string;
  type: "image" | "video";
  src: string;
  alt: string;
  label: string;
  poster?: string;
};

const europeanCollectionMedia: ProductMediaItem[] = [
  {
    id: "azul-oceanico-conjunto-real",
    type: "image",
    src: "/media/mgc-azul-oceanico/azul-oceanico-conjunto-real.jpeg",
    alt: "Conjunto Oceánico MGC real, con sartenes y ollas azules sobre mesa de madera",
    label: "Conjunto real",
  },
  {
    id: "azul-oceanico-superior",
    type: "image",
    src: "/media/mgc-azul-oceanico/azul-oceanico-conjunto-superior.jpeg",
    alt: "Vista superior real del conjunto Oceánico MGC",
    label: "Vista superior real",
  },
  {
    id: "azul-oceanico-video-real",
    type: "video",
    src: "/media/mgc-azul-oceanico/azul-oceanico-conjunto-real.mp4",
    poster: "/media/mgc-azul-oceanico/oceanico-video-poster.jpeg",
    alt: "Video real del conjunto Oceánico MGC",
    label: "Conjunto real en video",
  },
];

function importedSeries(
  id: string,
  dir: string,
  alt: string,
): ProductMediaItem[] {
  return [1, 2, 3, 4].map((view) => ({
    id: `${id}-vista-${view}`,
    type: "image" as const,
    src: `/media/mgc-productos/${dir}/vista-${String(view).padStart(2, "0")}.jpg`,
    alt: `${alt}. Vista real ${view}.`,
    label: `Vista real ${view}`,
  }));
}

const importedMediaBySku: Record<string, ProductMediaItem[]> = {
  "MGC-FR-SARTEN-20-GN": importedSeries(
    "juego-negro-sarten-20",
    "juego-negro/sarten-20",
    "Sartén Juego Negro MGC de 20 cm",
  ),
  "MGC-FR-SARTEN-24-GN": importedSeries(
    "juego-negro-sarten-24",
    "juego-negro/sarten-24",
    "Sartén Juego Negro MGC de 24 cm",
  ),
  "MGC-FR-SARTEN-28-GN": importedSeries(
    "juego-negro-sarten-28",
    "juego-negro/sarten-28",
    "Sartén Juego Negro MGC de 28 cm",
  ),
  "MGC-FR-LECHERA-18-GN": importedSeries(
    "juego-negro-olla-18",
    "juego-negro/olla-18",
    "Olla lechera Juego Negro MGC de 18 cm",
  ),
  "MGC-FR-OLLA-20-GN": importedSeries(
    "juego-negro-olla-20",
    "juego-negro/olla-20",
    "Olla Juego Negro MGC de 20 cm",
  ),
  "MGC-FR-OLLA-24-GN": importedSeries(
    "juego-negro-olla-24",
    "juego-negro/olla-24",
    "Olla Juego Negro MGC de 24 cm",
  ),
  "MGC-FR-SARTEN-24-RO": importedSeries(
    "rojo-sarten-24",
    "rojo/sarten-24",
    "Sartén roja MGC de 24 cm",
  ),
  "MGC-EU-LECHERA-16-AZ": importedSeries(
    "oceanico-item-01",
    "oceanico/item-01",
    "Pieza Oceánico MGC identificada en la fuente como item 01; confirma la medida",
  ),
  "MGC-EU-OLLA-20-AZ": importedSeries(
    "oceanico-item-02",
    "oceanico/item-02",
    "Olla Oceánico MGC identificada en la fuente como item 02; confirma la medida",
  ),
  "MGC-EU-OLLA-24-AZ": importedSeries(
    "oceanico-item-02",
    "oceanico/item-02",
    "Olla Oceánico MGC identificada en la fuente como item 02; confirma la medida",
  ),
};

const wokMedia: ProductMediaItem[] = [
  {
    id: "juego-negro-wok-contexto-real",
    type: "image",
    src: "/media/mgc-imperial/juego-negro-wok-contexto-real.jpeg",
    alt: "Wok del Juego Negro MGC real con tapa de vidrio, mango de madera y espátula",
    label: "Wok incluido en el juego",
  },
  {
    id: "wok-tapa-rectangular-real",
    type: "image",
    src: "/media/mgc-imperial/onyx-wok-32-tapa-rectangular-real.png",
    alt: "Wok MGC real de 32 cm, con tapa de vidrio y asa de madera rectangular",
    label: "Wok 32 cm · pieza real",
  },
];

const ebanoPlataImportedMedia: ProductMediaItem[] = [
  ["sarten-20", "Sartén gris MGC de 20 cm"],
  ["sarten-24", "Sartén gris MGC de 24 cm"],
  ["sarten-28", "Sartén gris MGC de 28 cm"],
  ["olla-18", "Olla gris MGC de 18 cm"],
  ["olla-20", "Olla gris MGC de 20 cm"],
  ["olla-24", "Olla gris MGC de 24 cm"],
].map(([piece, alt]) => ({
  id: `ebano-plata-${piece}`,
  type: "image" as const,
  src: `/media/mgc-productos/ebano-plata/${piece}/vista-01.jpg`,
  alt: `${alt}. Foto real organizada por pieza.`,
  label: alt,
}));

const ebanoPlataVideo: ProductMediaItem = {
  id: "ebano-plata-video-real",
  type: "video",
  src: "/media/mgc-ebano-plata/ebano-plata-conjunto-real.mp4",
  poster: "/media/mgc-ebano-plata/ebano-plata-conjunto-real.jpg",
  alt: "Video real del combo Ébano & Plata MGC",
  label: "Combo real en video",
};

const onyxImperialSetMedia: ProductMediaItem[] = [
  {
    id: "onyx-conjunto-video",
    type: "video",
    src: "/media/mgc-imperial/onyx-imperial-conjunto-actual-real.mp4",
    poster: "/media/mgc-imperial/onyx-imperial-conjunto-actual-real.jpeg",
    alt: "Video real de las piezas del Juego Negro MGC",
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
  const importedMedia = importedMediaBySku[product.sku] || [];

  if (product.sku === "MGC-SET-ONYX-IMPERIAL-15") {
    return [productCover(product), ...onyxImperialSetMedia];
  }

  if (product.sku === "MGC-SET-EBANO-PLATA-12") {
    return [...ebanoPlataImportedMedia, ebanoPlataVideo];
  }

  if (product.sku === "MGC-FR-WOK-32-GN") {
    return [...wokMedia, ...onyxImperialSetMedia];
  }

  if (product.sku.startsWith("MGC-FR-") && !product.sku.endsWith("-RO")) {
    return [...importedMedia, ...onyxImperialSetMedia];
  }

  const cover = productCover(product);

  if (product.sku.startsWith("MGC-EU-")) {
    return [...importedMedia, ...europeanCollectionMedia];
  }

  if (product.sku.startsWith("MGC-SAHARA-")) {
    const color = product.sku.includes("-GRIS-") ? "gris" : "negro";
    return [
      ...importedMedia,
      {
        id: `sahara-${color}-video-real`,
        type: "video",
        src: `/media/mgc-sahara/sahara-${color}-set-real.mp4`,
        poster: `/media/mgc-sahara/sahara-${color}-set-real.jpeg`,
        alt: `Video real del set Sahara ${color} MGC`,
        label: "Set real en video",
      },
    ];
  }

  return importedMedia.length ? importedMedia : [cover];
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
