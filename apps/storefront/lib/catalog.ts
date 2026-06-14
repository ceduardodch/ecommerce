import {
  defaultCouponCode,
  defaultPaymentMethods,
  defaultStoveCompatibility,
  defaultFreeShippingLabel,
} from "./commercial";
import { kitchenBaseUrl, wellnessBaseUrl } from "./domains";

export { whatsappLink } from "./whatsapp";

export type Product = {
  id: string;
  variantId: string;
  sku: string;
  vertical?: "cocina" | "bienestar";
  title: string;
  description: string;
  category: string;
  brand: string;
  price: { amount: number; currency: "USD" };
  originalPrice?: { amount: number; currency: "USD" };
  discountPercent?: number;
  promoLabel?: string;
  stockSignal?: string;
  bundleEligible?: boolean;
  deliveryBadge?: string;
  freeShipping?: boolean;
  paymentMethods?: string[];
  couponCode?: string;
  material?: string;
  coating?: string;
  teflonFree?: boolean;
  pfoaFree?: boolean;
  pfasFree?: boolean;
  ptfeFree?: boolean;
  capacity?: string;
  diameterCm?: number;
  pieces?: number;
  stoveCompatibility?: string;
  tipoCocina?: string;
  nivel?: string;
  bundleUseCase?: string;
  careTips?: string;
  healthAngle?: string;
  warrantyText?: string;
  instagramSourceUrl?: string;
  sourceUrls?: string[];
  contentAngles?: string[];
  certificationStatus?: string;
  claimNote?: string;
  reorderAfterDays?: number;
  stock: number;
  imageUrl: string;
  productUrl: string;
  tags: string[];
};

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function productSlug(product: Product) {
  try {
    const url = new URL(product.productUrl);
    const [, slug] = url.pathname.match(/\/products\/([^/?#]+)/) || [];
    if (slug) return decodeURIComponent(slug);
  } catch {
    const [, slug] = product.productUrl.match(/\/products\/([^/?#]+)/) || [];
    if (slug) return decodeURIComponent(slug);
  }

  return slugify(product.title || product.sku || product.id);
}

export function productPath(product: Product) {
  return `/products/${productSlug(product)}`;
}

export const fallbackProducts: Product[] = [
  {
    "id": "prod-wok-granito-32",
    "variantId": "var-wok-granito-32",
    "sku": "MGC-WOK-GRANITO-32",
    "vertical": "cocina",
    "title": "Wok 32 cm granito premium antiadherente",
    "description": "Wok de granito antiadherente para cocina diaria, salteados y porciones familiares.",
    "category": "Woks granito",
    "brand": "Eter Niu Cocina",
    "price": {
      "amount": 151.2,
      "currency": "USD"
    },
    "originalPrice": {
      "amount": 151.2,
      "currency": "USD"
    },
    "promoLabel": "Catalogo real WhatsApp",
    "stockSignal": "Stock por confirmar por WhatsApp",
    "bundleEligible": true,
    "deliveryBadge": "Envio gratis Ecuador",
    "material": "Granito antiadherente",
    "coating": "Granito",
    "teflonFree": true,
    "pfoaFree": true,
    "capacity": "Porciones familiares",
    "diameterCm": 32,
    "pieces": 1,
    "stoveCompatibility": "Gas, induccion y vitroceramica",
    "tipoCocina": "Familia y recetas",
    "nivel": "Uso diario",
    "bundleUseCase": "Salteados, arroz, recetas familiares y cocina con menos aceite",
    "careTips": "Usar utensilios de silicona o madera, fuego medio y esponja suave.",
    "healthAngle": "Opcion sin teflon para cocinar diario con una superficie antiadherente de granito.",
    "warrantyText": "Garantia de fabrica a confirmar por WhatsApp.",
    "sourceUrls": [
      "https://wa.me/c/593979854905"
    ],
    "contentAngles": [
      "granito premium",
      "wok 32 cm",
      "menos aceite",
      "cocina familiar"
    ],
    "certificationStatus": "Catalogo WhatsApp: certificaciones USA y Europeas; guardar respaldo del proveedor antes de pauta fuerte.",
    "claimNote": "No publicar claims medicos; libre de teflon/PFOA queda sujeto a respaldo del proveedor.",
    "reorderAfterDays": 180,
    "stock": 1,
    "imageUrl": "/media/photo-receta-wok.jpg",
    "tags": [
      "wok",
      "granito",
      "32cm",
      "menos aceite",
      "granito real",
      "producto estrella"
    ],
    "productUrl": `${kitchenBaseUrl}/products/wok-granito-32cm-tapa`
  },
  {
    "id": "prod-olla-granito-20",
    "variantId": "var-olla-granito-20",
    "sku": "MGC-OLLA-GRANITO-20",
    "vertical": "cocina",
    "title": "Olla 20 cm Granito Premium antiadherente",
    "description": "Olla de granito antiadherente para porciones pequenas y uso diario en casa.",
    "category": "Ollas granito",
    "brand": "Eter Niu Cocina",
    "price": {
      "amount": 75.6,
      "currency": "USD"
    },
    "originalPrice": {
      "amount": 75.6,
      "currency": "USD"
    },
    "promoLabel": "Uso diario",
    "stockSignal": "Stock por confirmar por WhatsApp",
    "bundleEligible": true,
    "deliveryBadge": "Envio gratis 24-48h segun ciudad",
    "material": "Granito antiadherente",
    "coating": "Granito",
    "teflonFree": true,
    "pfoaFree": true,
    "capacity": "1 a 3 personas",
    "diameterCm": 20,
    "pieces": 1,
    "stoveCompatibility": "Gas, induccion y vitroceramica",
    "tipoCocina": "Diario ligero",
    "nivel": "Inicio saludable",
    "bundleUseCase": "Salsas, avena, guarniciones y porciones pequenas",
    "careTips": "Evitar metal, precalentar suave y lavar cuando la olla este tibia.",
    "healthAngle": "Alternativa a antiadherentes tradicionales para uso diario.",
    "warrantyText": "Garantia de fabrica a confirmar por WhatsApp.",
    "sourceUrls": [
      "https://wa.me/c/593979854905"
    ],
    "contentAngles": [
      "olla 20 cm",
      "porciones pequenas",
      "uso diario"
    ],
    "certificationStatus": "Catalogo WhatsApp: certificaciones USA y Europeas; guardar respaldo del proveedor antes de pauta fuerte.",
    "claimNote": "No publicar claims medicos; libre de teflon/PFOA queda sujeto a respaldo del proveedor.",
    "reorderAfterDays": 180,
    "stock": 1,
    "imageUrl": "/media/photo-product-olla-20.jpg",
    "tags": [
      "olla",
      "granito",
      "20cm",
      "uso diario",
      "menos aceite"
    ],
    "productUrl": `${kitchenBaseUrl}/products/olla-granito-20cm`
  },
  {
    "id": "prod-olla-granito-18",
    "variantId": "var-olla-granito-18",
    "sku": "MGC-OLLA-GRANITO-18",
    "vertical": "cocina",
    "title": "Olla 18 cm Granito Premium antiadherente",
    "description": "Olla compacta de granito antiadherente para salsas, guarniciones y porciones pequenas.",
    "category": "Ollas granito",
    "brand": "Eter Niu Cocina",
    "price": {
      "amount": 63.6,
      "currency": "USD"
    },
    "originalPrice": {
      "amount": 63.6,
      "currency": "USD"
    },
    "promoLabel": "Catalogo real WhatsApp",
    "stockSignal": "Stock por confirmar por WhatsApp",
    "bundleEligible": true,
    "deliveryBadge": "Envio gratis con stock confirmado",
    "material": "Granito antiadherente",
    "coating": "Granito",
    "teflonFree": true,
    "pfoaFree": true,
    "capacity": "1 a 2 personas",
    "diameterCm": 18,
    "pieces": 1,
    "stoveCompatibility": "Gas, induccion y vitroceramica",
    "tipoCocina": "Diario ligero",
    "nivel": "Uso diario",
    "bundleUseCase": "Porciones pequenas, salsas, guarniciones y cocina diaria",
    "careTips": "Cocinar a fuego medio para conservar el recubrimiento por mas tiempo.",
    "healthAngle": "Olla compacta sin teflon para empezar con granito en la cocina diaria.",
    "warrantyText": "Garantia de fabrica a confirmar por WhatsApp.",
    "sourceUrls": [
      "https://wa.me/c/593979854905"
    ],
    "contentAngles": [
      "olla 18 cm",
      "tamano compacto",
      "uso diario en hornilla"
    ],
    "certificationStatus": "Catalogo WhatsApp: certificaciones USA y Europeas; guardar respaldo del proveedor antes de pauta fuerte.",
    "claimNote": "No publicar claims medicos; libre de teflon/PFOA queda sujeto a respaldo del proveedor.",
    "reorderAfterDays": 180,
    "stock": 1,
    "imageUrl": "/media/photo-product-olla-20.jpg",
    "tags": [
      "olla",
      "granito",
      "18cm",
      "compacta",
      "menos aceite"
    ],
    "productUrl": `${kitchenBaseUrl}/products/olla-granito-18cm`
  },
  {
    "id": "prod-sarten-plano-granito-22",
    "variantId": "var-sarten-plano-granito-22",
    "sku": "COC-SARTEN-PLANO-GRANITO-22",
    "vertical": "cocina",
    "title": "Sarten plano 22 cm Granito Premium antiadherente",
    "description": "Sarten plano de granito antiadherente para desayunos, vegetales y preparaciones rapidas.",
    "category": "Sartenes granito",
    "brand": "Eter Niu Cocina",
    "price": {
      "amount": 62.4,
      "currency": "USD"
    },
    "originalPrice": {
      "amount": 62.4,
      "currency": "USD"
    },
    "promoLabel": "Catalogo real WhatsApp",
    "stockSignal": "Stock por confirmar por WhatsApp",
    "bundleEligible": true,
    "deliveryBadge": "Envio gratis Ecuador",
    "material": "Granito antiadherente",
    "coating": "Granito",
    "teflonFree": true,
    "pfoaFree": true,
    "capacity": "1 a 3 personas",
    "diameterCm": 22,
    "pieces": 1,
    "stoveCompatibility": "Gas, induccion y vitroceramica",
    "tipoCocina": "Rapido diario",
    "nivel": "Uso diario",
    "bundleUseCase": "Huevos, vegetales, pollo, tortillas y desayunos",
    "careTips": "Usar fuego medio, utensilios suaves y evitar choque termico al lavar.",
    "healthAngle": "Alternativa a antiadherentes tradicionales para recetas de todos los dias.",
    "warrantyText": "Garantia y disponibilidad a confirmar por WhatsApp.",
    "sourceUrls": [
      "https://wa.me/c/593979854905"
    ],
    "contentAngles": [
      "sarten 22 cm",
      "desayunos",
      "uso rapido"
    ],
    "certificationStatus": "Catalogo WhatsApp: certificaciones USA y Europeas; guardar respaldo del proveedor antes de pauta fuerte.",
    "claimNote": "No publicar claims medicos; libre de teflon/PFOA queda sujeto a respaldo del proveedor.",
    "reorderAfterDays": 180,
    "stock": 1,
    "imageUrl": "/media/photo-detalle-wok.jpg",
    "tags": [
      "sarten",
      "granito",
      "22cm",
      "desayunos",
      "menos aceite"
    ],
    "productUrl": `${kitchenBaseUrl}/products/sarten-plano-granito-22cm`
  },
  {
    "id": "prod-cuchillo-samurai",
    "variantId": "var-cuchillo-samurai",
    "sku": "COC-CUCHILLO-SAMURAI-TODO-USO",
    "vertical": "cocina",
    "title": "Cuchillo samurai Japones todo uso",
    "description": "Cuchillo Samurai todo uso para cortes precisos en preparaciones diarias.",
    "category": "Cuchillos",
    "brand": "Eter Niu Cocina",
    "price": {
      "amount": 29.99,
      "currency": "USD"
    },
    "originalPrice": {
      "amount": 50,
      "currency": "USD"
    },
    "promoLabel": "Oferta especial",
    "stockSignal": "Stock por confirmar por WhatsApp",
    "bundleEligible": true,
    "deliveryBadge": "Envio gratis por Servientrega",
    "material": "Acero inoxidable",
    "capacity": "Todo uso",
    "pieces": 1,
    "stoveCompatibility": "No aplica; complemento de cocina",
    "tipoCocina": "Corte diario",
    "nivel": "Uso diario",
    "bundleUseCase": "Verduras, carnes, frutas y preparacion general",
    "careTips": "Lavar y secar despues de usar; guardar protegido.",
    "healthAngle": "Complemento practico para preparar ingredientes antes de cocinar.",
    "warrantyText": "Garantia y disponibilidad a confirmar por WhatsApp.",
    "sourceUrls": [
      "https://wa.me/c/593979854905"
    ],
    "contentAngles": [
      "cuchillo todo uso",
      "preparacion diaria"
    ],
    "certificationStatus": "No aplica",
    "claimNote": "No publicar promesas de durabilidad extrema sin ficha tecnica.",
    "reorderAfterDays": 240,
    "stock": 1,
    "imageUrl": "/media/photo-product-cuchillo-samurai.jpg",
    "tags": [
      "cuchillo",
      "samurai",
      "japones",
      "todo uso",
      "cocina"
    ],
    "productUrl": `${kitchenBaseUrl}/products/cuchillo-samurai-japones-todo-uso`
  },
]

type WellnessFallbackProductInput = Omit<
  Product,
  | "variantId"
  | "vertical"
  | "brand"
  | "deliveryBadge"
  | "freeShipping"
  | "paymentMethods"
  | "couponCode"
  | "stoveCompatibility"
  | "productUrl"
> & {
  handle: string;
};

const wellnessFallbackCatalog: WellnessFallbackProductInput[] = [
  {
    "id": "prod-juegos-de-te-aaa",
    "sku": "BIEN-JUEGO-TE-AAA",
    "handle": "juegos-de-te-aaa",
    "title": "Juegos de te AAA",
    "description": "Juego de te para rituales de mesa, regalos y momentos de pausa en casa.",
    "category": "Hogar Zen",
    "price": {
      "amount": 139,
      "currency": "USD"
    },
    "promoLabel": "Hogar Zen",
    "stockSignal": "Stock por confirmar por WhatsApp",
    "bundleEligible": true,
    "material": "Ceramica y accesorios",
    "capacity": "Set de te",
    "pieces": 1,
    "nivel": "Hogar Zen",
    "bundleUseCase": "Juego de te para rituales de mesa, regalos y momentos de pausa en casa.",
    "careTips": "Confirmar cuidados y disponibilidad por WhatsApp.",
    "healthAngle": "Producto de bienestar sin promesas medicas ni terapeuticas.",
    "warrantyText": "Garantia y disponibilidad a confirmar por WhatsApp.",
    "sourceUrls": [
      "https://wa.me/c/593979854905"
    ],
    "contentAngles": [
      "ritual de te",
      "mesa zen",
      "regalo premium"
    ],
    "certificationStatus": "Proveedor por confirmar",
    "claimNote": "No prometer beneficios medicos de infusiones.",
    "reorderAfterDays": 180,
    "stock": 1,
    "imageUrl": "/media/wellness-juego-te-japones.jpg",
    "tags": [
      "bienestar",
      "ritual de te",
      "mesa zen",
      "regalo premium"
    ]
  },
  {
    "id": "prod-termo-acero-sus304-500ml",
    "sku": "BIEN-TERMO-SUS304-500",
    "handle": "termo-acero-sus304-500ml",
    "title": "Termo acero inoxidable SUS 304 500 ml",
    "description": "Termo de acero inoxidable SUS 304 de 500 ml para agua, te o bebidas del dia.",
    "category": "Hogar Zen",
    "price": {
      "amount": 20,
      "currency": "USD"
    },
    "promoLabel": "Uso diario",
    "stockSignal": "Stock por confirmar por WhatsApp",
    "bundleEligible": true,
    "material": "Acero inoxidable SUS 304",
    "capacity": "500 ml",
    "pieces": 1,
    "nivel": "Hogar Zen",
    "bundleUseCase": "Termo de acero inoxidable SUS 304 de 500 ml para agua, te o bebidas del dia.",
    "careTips": "Confirmar cuidados y disponibilidad por WhatsApp.",
    "healthAngle": "Producto de bienestar sin promesas medicas ni terapeuticas.",
    "warrantyText": "Garantia y disponibilidad a confirmar por WhatsApp.",
    "sourceUrls": [
      "https://wa.me/c/593979854905"
    ],
    "contentAngles": [
      "termo 500 ml",
      "SUS 304",
      "uso diario"
    ],
    "certificationStatus": "Proveedor por confirmar",
    "claimNote": "No prometer beneficios medicos por hidratacion.",
    "reorderAfterDays": 180,
    "stock": 1,
    "imageUrl": "/media/wellness-termo-sus304.jpg",
    "tags": [
      "bienestar",
      "termo 500 ml",
      "SUS 304",
      "uso diario"
    ]
  },
  {
    "id": "prod-termo-acero-sus304-1000ml",
    "sku": "BIEN-TERMO-SUS304-1000",
    "handle": "termo-acero-sus304-1000ml",
    "title": "Termo de acero SUS304 1000 ml",
    "description": "Termo de acero SUS304 de 1000 ml para llevar bebida durante el dia.",
    "category": "Hogar Zen",
    "price": {
      "amount": 28.5,
      "currency": "USD"
    },
    "promoLabel": "Uso diario",
    "stockSignal": "Stock por confirmar por WhatsApp",
    "bundleEligible": true,
    "material": "Acero inoxidable SUS 304",
    "capacity": "1000 ml",
    "pieces": 1,
    "nivel": "Hogar Zen",
    "bundleUseCase": "Termo de acero SUS304 de 1000 ml para llevar bebida durante el dia.",
    "careTips": "Confirmar cuidados y disponibilidad por WhatsApp.",
    "healthAngle": "Producto de bienestar sin promesas medicas ni terapeuticas.",
    "warrantyText": "Garantia y disponibilidad a confirmar por WhatsApp.",
    "sourceUrls": [
      "https://wa.me/c/593979854905"
    ],
    "contentAngles": [
      "termo 1000 ml",
      "SUS 304",
      "dia completo"
    ],
    "certificationStatus": "Proveedor por confirmar",
    "claimNote": "No prometer beneficios medicos por hidratacion.",
    "reorderAfterDays": 180,
    "stock": 1,
    "imageUrl": "/media/wellness-termo-sus304.jpg",
    "tags": [
      "bienestar",
      "termo 1000 ml",
      "SUS 304",
      "dia completo"
    ]
  },
  {
    "id": "prod-yoga-mat-suede-4mm-premium",
    "sku": "BIEN-YOGA-MAT-SUEDE-4MM",
    "handle": "yoga-mat-suede-4mm-premium",
    "title": "Yoga Mat Suede 4 mm Premium",
    "description": "Mat premium de suede de 4 mm para yoga, estiramiento y movimiento suave.",
    "category": "Yoga & Movimiento",
    "price": {
      "amount": 79.99,
      "currency": "USD"
    },
    "promoLabel": "Movimiento premium",
    "stockSignal": "Stock por confirmar por WhatsApp",
    "bundleEligible": true,
    "material": "Suede",
    "capacity": "Uso personal",
    "pieces": 1,
    "nivel": "Yoga & Movimiento",
    "bundleUseCase": "Mat premium de suede de 4 mm para yoga, estiramiento y movimiento suave.",
    "careTips": "Confirmar cuidados y disponibilidad por WhatsApp.",
    "healthAngle": "Producto de bienestar sin promesas medicas ni terapeuticas.",
    "warrantyText": "Garantia y disponibilidad a confirmar por WhatsApp.",
    "sourceUrls": [
      "https://wa.me/c/593979854905"
    ],
    "contentAngles": [
      "mat suede",
      "4 mm",
      "movimiento suave"
    ],
    "certificationStatus": "Proveedor por confirmar",
    "claimNote": "No prometer tratamiento fisico ni resultado medico.",
    "reorderAfterDays": 180,
    "stock": 1,
    "imageUrl": "/media/wellness-yoga-mat-suede.jpg",
    "tags": [
      "bienestar",
      "mat suede",
      "4 mm",
      "movimiento suave"
    ]
  },
  {
    "id": "prod-meditador-mandala-pu-rubber-70cm",
    "sku": "BIEN-MEDITADOR-MANDALA-70",
    "handle": "meditador-mandala-pu-rubber-70cm",
    "title": "Meditador Mandala PU Rubber 70 cm",
    "description": "Meditador mandala de PU rubber de 70 cm para rincones de yoga, meditacion y pausa.",
    "category": "Yoga & Movimiento",
    "price": {
      "amount": 33,
      "currency": "USD"
    },
    "promoLabel": "Pausa visual",
    "stockSignal": "Stock por confirmar por WhatsApp",
    "bundleEligible": true,
    "material": "PU rubber",
    "capacity": "70 cm diametro",
    "pieces": 1,
    "nivel": "Yoga & Movimiento",
    "bundleUseCase": "Meditador mandala de PU rubber de 70 cm para rincones de yoga, meditacion y pausa.",
    "careTips": "Confirmar cuidados y disponibilidad por WhatsApp.",
    "healthAngle": "Producto de bienestar sin promesas medicas ni terapeuticas.",
    "warrantyText": "Garantia y disponibilidad a confirmar por WhatsApp.",
    "sourceUrls": [
      "https://wa.me/c/593979854905"
    ],
    "contentAngles": [
      "mandala",
      "70 cm",
      "rincon de meditacion"
    ],
    "certificationStatus": "Proveedor por confirmar",
    "claimNote": "No prometer relajacion clinica ni efectos terapeuticos.",
    "reorderAfterDays": 180,
    "stock": 1,
    "imageUrl": "/media/wellness-meditador-mandala.jpg",
    "tags": [
      "bienestar",
      "mandala",
      "70 cm",
      "rincon de meditacion"
    ]
  },
  {
    "id": "prod-pistola-percusion-profesional-30-niveles",
    "sku": "BIEN-PISTOLA-PERCUSION-PRO",
    "handle": "pistola-percusion-profesional-30-niveles",
    "title": "Pistola de percusion profesional 30 niveles",
    "description": "Pistola de percusion profesional con 30 niveles para masaje muscular de rutina.",
    "category": "Yoga & Movimiento",
    "price": {
      "amount": 199,
      "currency": "USD"
    },
    "promoLabel": "Movimiento",
    "stockSignal": "Stock por confirmar por WhatsApp",
    "bundleEligible": true,
    "material": "Equipo de masaje",
    "capacity": "30 niveles",
    "pieces": 1,
    "nivel": "Yoga & Movimiento",
    "bundleUseCase": "Pistola de percusion profesional con 30 niveles para masaje muscular de rutina.",
    "careTips": "Confirmar cuidados y disponibilidad por WhatsApp.",
    "healthAngle": "Producto de bienestar sin promesas medicas ni terapeuticas.",
    "warrantyText": "Garantia y disponibilidad a confirmar por WhatsApp.",
    "sourceUrls": [
      "https://wa.me/c/593979854905"
    ],
    "contentAngles": [
      "30 niveles",
      "masaje muscular",
      "rutina deportiva"
    ],
    "certificationStatus": "Proveedor por confirmar",
    "claimNote": "No prometer tratamiento, cura ni recuperacion clinica.",
    "reorderAfterDays": 180,
    "stock": 1,
    "imageUrl": "/media/wellness-pistola-percusion.jpg",
    "tags": [
      "bienestar",
      "30 niveles",
      "masaje muscular",
      "rutina deportiva"
    ]
  },
  {
    "id": "prod-cuenco-bronce-grabado-sanscrito-8cm",
    "sku": "BIEN-CUENCO-BRONCE-8",
    "handle": "cuenco-bronce-grabado-sanscrito-8cm",
    "title": "Cuenco de bronce con grabado sanscrito 8 cm",
    "description": "Cuenco de bronce con grabado sanscrito de 8 cm para rituales de sonido.",
    "category": "Energia & Bienestar",
    "price": {
      "amount": 45,
      "currency": "USD"
    },
    "promoLabel": "Sonido",
    "stockSignal": "Stock por confirmar por WhatsApp",
    "bundleEligible": true,
    "material": "Bronce",
    "capacity": "8 cm",
    "pieces": 1,
    "nivel": "Energia & Bienestar",
    "bundleUseCase": "Cuenco de bronce con grabado sanscrito de 8 cm para rituales de sonido.",
    "careTips": "Confirmar cuidados y disponibilidad por WhatsApp.",
    "healthAngle": "Producto de bienestar sin promesas medicas ni terapeuticas.",
    "warrantyText": "Garantia y disponibilidad a confirmar por WhatsApp.",
    "sourceUrls": [
      "https://wa.me/c/593979854905"
    ],
    "contentAngles": [
      "cuenco 8 cm",
      "bronce",
      "sonido"
    ],
    "certificationStatus": "Proveedor por confirmar",
    "claimNote": "No prometer beneficios terapeuticos.",
    "reorderAfterDays": 180,
    "stock": 1,
    "imageUrl": "/media/wellness-cuenco-bronce.jpg",
    "tags": [
      "bienestar",
      "cuenco 8 cm",
      "bronce",
      "sonido"
    ]
  },
  {
    "id": "prod-cuenco-bronce-grabado-sanscrito-9cm",
    "sku": "BIEN-CUENCO-BRONCE-9",
    "handle": "cuenco-bronce-grabado-sanscrito-9cm",
    "title": "Cuenco de bronce con grabado sanscrito 9 cm",
    "description": "Cuenco de bronce con grabado sanscrito de 9 cm para rituales de sonido.",
    "category": "Energia & Bienestar",
    "price": {
      "amount": 65,
      "currency": "USD"
    },
    "promoLabel": "Sonido",
    "stockSignal": "Stock por confirmar por WhatsApp",
    "bundleEligible": true,
    "material": "Bronce",
    "capacity": "9 cm",
    "pieces": 1,
    "nivel": "Energia & Bienestar",
    "bundleUseCase": "Cuenco de bronce con grabado sanscrito de 9 cm para rituales de sonido.",
    "careTips": "Confirmar cuidados y disponibilidad por WhatsApp.",
    "healthAngle": "Producto de bienestar sin promesas medicas ni terapeuticas.",
    "warrantyText": "Garantia y disponibilidad a confirmar por WhatsApp.",
    "sourceUrls": [
      "https://wa.me/c/593979854905"
    ],
    "contentAngles": [
      "cuenco 9 cm",
      "bronce",
      "sonido"
    ],
    "certificationStatus": "Proveedor por confirmar",
    "claimNote": "No prometer beneficios terapeuticos.",
    "reorderAfterDays": 180,
    "stock": 1,
    "imageUrl": "/media/wellness-cuenco-bronce.jpg",
    "tags": [
      "bienestar",
      "cuenco 9 cm",
      "bronce",
      "sonido"
    ]
  },
  {
    "id": "prod-tambor-lengua-8-notas",
    "sku": "BIEN-TAMBOR-LENGUA-8-NOTAS",
    "handle": "tambor-lengua-8-notas",
    "title": "Tambor de lengua 8 notas",
    "description": "Tambor de lengua de 8 notas para sonido ambiental, regalos y pausas personales.",
    "category": "Energia & Bienestar",
    "price": {
      "amount": 65,
      "currency": "USD"
    },
    "promoLabel": "Sonido",
    "stockSignal": "Stock por confirmar por WhatsApp",
    "bundleEligible": true,
    "material": "Metal",
    "capacity": "8 notas",
    "pieces": 1,
    "nivel": "Energia & Bienestar",
    "bundleUseCase": "Tambor de lengua de 8 notas para sonido ambiental, regalos y pausas personales.",
    "careTips": "Confirmar cuidados y disponibilidad por WhatsApp.",
    "healthAngle": "Producto de bienestar sin promesas medicas ni terapeuticas.",
    "warrantyText": "Garantia y disponibilidad a confirmar por WhatsApp.",
    "sourceUrls": [
      "https://wa.me/c/593979854905"
    ],
    "contentAngles": [
      "8 notas",
      "sonido",
      "regalo"
    ],
    "certificationStatus": "Proveedor por confirmar",
    "claimNote": "No prometer beneficios terapeuticos.",
    "reorderAfterDays": 180,
    "stock": 1,
    "imageUrl": "/media/wellness-tambor-lengua.jpg",
    "tags": [
      "bienestar",
      "8 notas",
      "sonido",
      "regalo"
    ]
  },
  {
    "id": "prod-argollas-plata-925",
    "sku": "BIEN-ARGOLLAS-PLATA-925",
    "handle": "argollas-plata-925",
    "title": "Argollas plata 925",
    "description": "Argollas de plata 925 para uso diario o regalo especial.",
    "category": "Tesoros Plata & Acero",
    "price": {
      "amount": 43,
      "currency": "USD"
    },
    "promoLabel": "Plata 925",
    "stockSignal": "Stock por confirmar por WhatsApp",
    "bundleEligible": true,
    "material": "Plata 925",
    "capacity": "Uso personal",
    "pieces": 1,
    "nivel": "Tesoros Plata & Acero",
    "bundleUseCase": "Argollas de plata 925 para uso diario o regalo especial.",
    "careTips": "Confirmar cuidados y disponibilidad por WhatsApp.",
    "healthAngle": "Producto de bienestar sin promesas medicas ni terapeuticas.",
    "warrantyText": "Garantia y disponibilidad a confirmar por WhatsApp.",
    "sourceUrls": [
      "https://wa.me/c/593979854905"
    ],
    "contentAngles": [
      "plata 925",
      "regalo",
      "uso diario"
    ],
    "certificationStatus": "Proveedor por confirmar",
    "claimNote": "Confirmar material con ficha o proveedor antes de pauta fuerte.",
    "reorderAfterDays": 180,
    "stock": 1,
    "imageUrl": "/media/wellness-aroma.svg",
    "tags": [
      "bienestar",
      "plata 925",
      "regalo",
      "uso diario"
    ]
  },
  {
    "id": "prod-dije-om-grande",
    "sku": "BIEN-DIJE-OM-PLATA-925",
    "handle": "dije-om-grande",
    "title": "Dije OM grande",
    "description": "Dije OM grande para regalo, uso personal o practica espiritual.",
    "category": "Tesoros Plata & Acero",
    "price": {
      "amount": 74,
      "currency": "USD"
    },
    "promoLabel": "Simbolo OM",
    "stockSignal": "Stock por confirmar por WhatsApp",
    "bundleEligible": true,
    "material": "Plata 925 por confirmar",
    "capacity": "Dije grande",
    "pieces": 1,
    "nivel": "Tesoros Plata & Acero",
    "bundleUseCase": "Dije OM grande para regalo, uso personal o practica espiritual.",
    "careTips": "Confirmar cuidados y disponibilidad por WhatsApp.",
    "healthAngle": "Producto de bienestar sin promesas medicas ni terapeuticas.",
    "warrantyText": "Garantia y disponibilidad a confirmar por WhatsApp.",
    "sourceUrls": [
      "https://wa.me/c/593979854905"
    ],
    "contentAngles": [
      "simbolo OM",
      "regalo",
      "accesorio espiritual"
    ],
    "certificationStatus": "Proveedor por confirmar",
    "claimNote": "Confirmar material exacto antes de publicar como plata 925.",
    "reorderAfterDays": 180,
    "stock": 1,
    "imageUrl": "/media/wellness-aroma.svg",
    "tags": [
      "bienestar",
      "simbolo OM",
      "regalo",
      "accesorio espiritual"
    ]
  },
  {
    "id": "prod-amuleto-hindu-plata-925",
    "sku": "BIEN-AMULETO-HINDU-PLATA-925",
    "handle": "amuleto-hindu-plata-925",
    "title": "Amuleto Hindu plata 925",
    "description": "Amuleto hindu de plata 925 para uso personal o regalo.",
    "category": "Tesoros Plata & Acero",
    "price": {
      "amount": 38,
      "currency": "USD"
    },
    "promoLabel": "Plata 925",
    "stockSignal": "Stock por confirmar por WhatsApp",
    "bundleEligible": true,
    "material": "Plata 925",
    "capacity": "Amuleto",
    "pieces": 1,
    "nivel": "Tesoros Plata & Acero",
    "bundleUseCase": "Amuleto hindu de plata 925 para uso personal o regalo.",
    "careTips": "Confirmar cuidados y disponibilidad por WhatsApp.",
    "healthAngle": "Producto de bienestar sin promesas medicas ni terapeuticas.",
    "warrantyText": "Garantia y disponibilidad a confirmar por WhatsApp.",
    "sourceUrls": [
      "https://wa.me/c/593979854905"
    ],
    "contentAngles": [
      "amuleto",
      "plata 925",
      "regalo"
    ],
    "certificationStatus": "Proveedor por confirmar",
    "claimNote": "No prometer proteccion, energia ni resultados espirituales.",
    "reorderAfterDays": 180,
    "stock": 1,
    "imageUrl": "/media/wellness-aroma.svg",
    "tags": [
      "bienestar",
      "amuleto",
      "plata 925",
      "regalo"
    ]
  },
  {
    "id": "prod-cascadas-humo-om-ganesha-torre",
    "sku": "BIEN-CASCADA-HUMO-OM-GANESHA-TORRE",
    "handle": "cascadas-humo-om-ganesha-torre",
    "title": "Cascadas de humo OM, Ganesha y Torre",
    "description": "Cascadas de humo con disenos OM, Ganesha y Torre para ambientar espacios.",
    "category": "Energia & Bienestar",
    "price": {
      "amount": 12,
      "currency": "USD"
    },
    "promoLabel": "Ambiente",
    "stockSignal": "Stock por confirmar por WhatsApp",
    "bundleEligible": true,
    "material": "Accesorio decorativo",
    "capacity": "1 cascada",
    "pieces": 1,
    "nivel": "Energia & Bienestar",
    "bundleUseCase": "Cascadas de humo con disenos OM, Ganesha y Torre para ambientar espacios.",
    "careTips": "Confirmar cuidados y disponibilidad por WhatsApp.",
    "healthAngle": "Producto de bienestar sin promesas medicas ni terapeuticas.",
    "warrantyText": "Garantia y disponibilidad a confirmar por WhatsApp.",
    "sourceUrls": [
      "https://wa.me/c/593979854905"
    ],
    "contentAngles": [
      "humo",
      "OM",
      "Ganesha"
    ],
    "certificationStatus": "Proveedor por confirmar",
    "claimNote": "No prometer purificacion, cura ni beneficios clinicos.",
    "reorderAfterDays": 180,
    "stock": 1,
    "imageUrl": "/media/wellness-cascada-humo.jpg",
    "tags": [
      "bienestar",
      "humo",
      "OM",
      "Ganesha"
    ]
  },
  {
    "id": "prod-pendulo-7-chakras",
    "sku": "BIEN-PENDULO-7-CHAKRAS",
    "handle": "pendulo-7-chakras",
    "title": "Pendulo 7 chakras",
    "description": "Pendulo 7 chakras para practica personal y accesorios energeticos.",
    "category": "Energia & Bienestar",
    "price": {
      "amount": 13.33,
      "currency": "USD"
    },
    "promoLabel": "7 chakras",
    "stockSignal": "Stock por confirmar por WhatsApp",
    "bundleEligible": true,
    "material": "Piedras y metal por confirmar",
    "capacity": "Uso personal",
    "pieces": 1,
    "nivel": "Energia & Bienestar",
    "bundleUseCase": "Pendulo 7 chakras para practica personal y accesorios energeticos.",
    "careTips": "Confirmar cuidados y disponibilidad por WhatsApp.",
    "healthAngle": "Producto de bienestar sin promesas medicas ni terapeuticas.",
    "warrantyText": "Garantia y disponibilidad a confirmar por WhatsApp.",
    "sourceUrls": [
      "https://wa.me/c/593979854905"
    ],
    "contentAngles": [
      "7 chakras",
      "pendulo",
      "regalo pequeno"
    ],
    "certificationStatus": "Proveedor por confirmar",
    "claimNote": "No prometer diagnostico, proteccion ni resultados energeticos.",
    "reorderAfterDays": 180,
    "stock": 1,
    "imageUrl": "/media/wellness-aroma.svg",
    "tags": [
      "bienestar",
      "7 chakras",
      "pendulo",
      "regalo pequeno"
    ]
  },
  {
    "id": "prod-lampara-sal-himalaya-10kg-grande",
    "sku": "BIEN-LAMPARA-SAL-HIMALAYA-10KG",
    "handle": "lampara-sal-himalaya-10kg-grande",
    "title": "Lampara de sal Himalaya 10 kilos grande",
    "description": "Lampara de sal Himalaya grande de 10 kilos para luz calida y decoracion.",
    "category": "Energia & Bienestar",
    "price": {
      "amount": 65,
      "currency": "USD"
    },
    "promoLabel": "Luz calida",
    "stockSignal": "Stock por confirmar por WhatsApp",
    "bundleEligible": true,
    "material": "Sal del Himalaya",
    "capacity": "10 kilos",
    "pieces": 1,
    "nivel": "Energia & Bienestar",
    "bundleUseCase": "Lampara de sal Himalaya grande de 10 kilos para luz calida y decoracion.",
    "careTips": "Confirmar cuidados y disponibilidad por WhatsApp.",
    "healthAngle": "Producto de bienestar sin promesas medicas ni terapeuticas.",
    "warrantyText": "Garantia y disponibilidad a confirmar por WhatsApp.",
    "sourceUrls": [
      "https://wa.me/c/593979854905"
    ],
    "contentAngles": [
      "10 kilos",
      "luz calida",
      "decoracion"
    ],
    "certificationStatus": "Proveedor por confirmar",
    "claimNote": "No prometer purificacion de aire ni beneficios medicos.",
    "reorderAfterDays": 180,
    "stock": 1,
    "imageUrl": "/media/wellness-lampara-sal.jpg",
    "tags": [
      "bienestar",
      "10 kilos",
      "luz calida",
      "decoracion"
    ]
  },
  {
    "id": "prod-moxas-chinas",
    "sku": "BIEN-MOXAS-CHINAS",
    "handle": "moxas-chinas",
    "title": "Moxas Chinas",
    "description": "Moxas chinas para practica personal supervisada y rituales tradicionales.",
    "category": "Energia & Bienestar",
    "price": {
      "amount": 20,
      "currency": "USD"
    },
    "promoLabel": "Tradicional",
    "stockSignal": "Stock por confirmar por WhatsApp",
    "bundleEligible": true,
    "material": "Moxa por confirmar",
    "capacity": "Set de moxas",
    "pieces": 1,
    "nivel": "Energia & Bienestar",
    "bundleUseCase": "Moxas chinas para practica personal supervisada y rituales tradicionales.",
    "careTips": "Confirmar cuidados y disponibilidad por WhatsApp.",
    "healthAngle": "Producto de bienestar sin promesas medicas ni terapeuticas.",
    "warrantyText": "Garantia y disponibilidad a confirmar por WhatsApp.",
    "sourceUrls": [
      "https://wa.me/c/593979854905"
    ],
    "contentAngles": [
      "moxas",
      "tradicion",
      "ritual"
    ],
    "certificationStatus": "Proveedor por confirmar",
    "claimNote": "No prometer alivio, tratamiento ni resultado terapeutico.",
    "reorderAfterDays": 180,
    "stock": 1,
    "imageUrl": "/media/wellness-moxas-chinas.jpg",
    "tags": [
      "bienestar",
      "moxas",
      "tradicion",
      "ritual"
    ]
  },
  {
    "id": "prod-bloques-yoga-3-capas",
    "sku": "BIEN-BLOQUES-YOGA-3-CAPAS",
    "handle": "bloques-yoga-3-capas",
    "title": "Bloques de yoga 3 capas",
    "description": "Bloque de yoga de 3 capas para soporte en posturas y estiramiento.",
    "category": "Yoga & Movimiento",
    "price": {
      "amount": 15,
      "currency": "USD"
    },
    "promoLabel": "Soporte yoga",
    "stockSignal": "Stock por confirmar por WhatsApp",
    "bundleEligible": true,
    "material": "EVA por confirmar",
    "capacity": "1 bloque",
    "pieces": 1,
    "nivel": "Yoga & Movimiento",
    "bundleUseCase": "Bloque de yoga de 3 capas para soporte en posturas y estiramiento.",
    "careTips": "Confirmar cuidados y disponibilidad por WhatsApp.",
    "healthAngle": "Producto de bienestar sin promesas medicas ni terapeuticas.",
    "warrantyText": "Garantia y disponibilidad a confirmar por WhatsApp.",
    "sourceUrls": [
      "https://wa.me/c/593979854905"
    ],
    "contentAngles": [
      "bloque yoga",
      "soporte",
      "movimiento"
    ],
    "certificationStatus": "Proveedor por confirmar",
    "claimNote": "No prometer correccion fisica ni beneficio clinico.",
    "reorderAfterDays": 180,
    "stock": 1,
    "imageUrl": "/media/wellness-mat.svg",
    "tags": [
      "bienestar",
      "bloque yoga",
      "soporte",
      "movimiento"
    ]
  },
  {
    "id": "prod-portaincienso-horizontal-madera",
    "sku": "BIEN-PORTAINCIENSO-HORIZONTAL-MADERA",
    "handle": "portaincienso-horizontal-madera",
    "title": "Portaincienso horizontal de madera",
    "description": "Portaincienso horizontal de madera para rutinas de aroma y decoracion.",
    "category": "Energia & Bienestar",
    "price": {
      "amount": 12,
      "currency": "USD"
    },
    "promoLabel": "Aroma",
    "stockSignal": "Stock por confirmar por WhatsApp",
    "bundleEligible": true,
    "material": "Madera",
    "capacity": "1 portaincienso",
    "pieces": 1,
    "nivel": "Energia & Bienestar",
    "bundleUseCase": "Portaincienso horizontal de madera para rutinas de aroma y decoracion.",
    "careTips": "Confirmar cuidados y disponibilidad por WhatsApp.",
    "healthAngle": "Producto de bienestar sin promesas medicas ni terapeuticas.",
    "warrantyText": "Garantia y disponibilidad a confirmar por WhatsApp.",
    "sourceUrls": [
      "https://wa.me/c/593979854905"
    ],
    "contentAngles": [
      "incienso",
      "madera",
      "decoracion"
    ],
    "certificationStatus": "Proveedor por confirmar",
    "claimNote": "Usar con ventilacion y sin prometer beneficios medicos.",
    "reorderAfterDays": 180,
    "stock": 1,
    "imageUrl": "/media/wellness-aroma.svg",
    "tags": [
      "bienestar",
      "incienso",
      "madera",
      "decoracion"
    ]
  },
  {
    "id": "prod-cadena-hombre-rasgado",
    "sku": "BIEN-CADENA-HOMBRE-RASGADO",
    "handle": "cadena-hombre-rasgado",
    "title": "Cadena hombre rasgado",
    "description": "Cadena de hombre estilo rasgado para uso personal o regalo premium.",
    "category": "Tesoros Plata & Acero",
    "price": {
      "amount": 350,
      "currency": "USD"
    },
    "promoLabel": "Regalo premium",
    "stockSignal": "Stock por confirmar por WhatsApp",
    "bundleEligible": true,
    "material": "Metal por confirmar",
    "capacity": "Cadena",
    "pieces": 1,
    "nivel": "Tesoros Plata & Acero",
    "bundleUseCase": "Cadena de hombre estilo rasgado para uso personal o regalo premium.",
    "careTips": "Confirmar cuidados y disponibilidad por WhatsApp.",
    "healthAngle": "Producto de bienestar sin promesas medicas ni terapeuticas.",
    "warrantyText": "Garantia y disponibilidad a confirmar por WhatsApp.",
    "sourceUrls": [
      "https://wa.me/c/593979854905"
    ],
    "contentAngles": [
      "cadena",
      "hombre",
      "regalo premium"
    ],
    "certificationStatus": "Proveedor por confirmar",
    "claimNote": "Confirmar material exacto antes de pauta fuerte.",
    "reorderAfterDays": 180,
    "stock": 1,
    "imageUrl": "/media/wellness-aroma.svg",
    "tags": [
      "bienestar",
      "cadena",
      "hombre",
      "regalo premium"
    ]
  },
  {
    "id": "prod-dijes-animales-galapagos-plata-925",
    "sku": "BIEN-DIJES-ANIMALES-GALAPAGOS-PLATA-925",
    "handle": "dijes-animales-galapagos-plata-925",
    "title": "Dijes Animales Galapagos plata 925",
    "description": "Dijes de animales Galapagos en plata 925 para regalo y uso personal.",
    "category": "Tesoros Plata & Acero",
    "price": {
      "amount": 15,
      "currency": "USD"
    },
    "promoLabel": "Plata 925",
    "stockSignal": "Stock por confirmar por WhatsApp",
    "bundleEligible": true,
    "material": "Plata 925 por confirmar",
    "capacity": "Dije",
    "pieces": 1,
    "nivel": "Tesoros Plata & Acero",
    "bundleUseCase": "Dijes de animales Galapagos en plata 925 para regalo y uso personal.",
    "careTips": "Confirmar cuidados y disponibilidad por WhatsApp.",
    "healthAngle": "Producto de bienestar sin promesas medicas ni terapeuticas.",
    "warrantyText": "Garantia y disponibilidad a confirmar por WhatsApp.",
    "sourceUrls": [
      "https://wa.me/c/593979854905"
    ],
    "contentAngles": [
      "galapagos",
      "dije",
      "regalo"
    ],
    "certificationStatus": "Proveedor por confirmar",
    "claimNote": "Confirmar material exacto antes de publicar como plata 925.",
    "reorderAfterDays": 180,
    "stock": 1,
    "imageUrl": "/media/wellness-aroma.svg",
    "tags": [
      "bienestar",
      "galapagos",
      "dije",
      "regalo"
    ]
  },
  {
    "id": "prod-portaincienso-metal",
    "sku": "BIEN-PORTAINCIENSO-METAL",
    "handle": "portaincienso-metal",
    "title": "Portaincienso metal",
    "description": "Portaincienso de metal para aroma, decoracion y uso diario.",
    "category": "Energia & Bienestar",
    "price": {
      "amount": 15,
      "currency": "USD"
    },
    "promoLabel": "Aroma",
    "stockSignal": "Stock por confirmar por WhatsApp",
    "bundleEligible": true,
    "material": "Metal",
    "capacity": "1 portaincienso",
    "pieces": 1,
    "nivel": "Energia & Bienestar",
    "bundleUseCase": "Portaincienso de metal para aroma, decoracion y uso diario.",
    "careTips": "Confirmar cuidados y disponibilidad por WhatsApp.",
    "healthAngle": "Producto de bienestar sin promesas medicas ni terapeuticas.",
    "warrantyText": "Garantia y disponibilidad a confirmar por WhatsApp.",
    "sourceUrls": [
      "https://wa.me/c/593979854905"
    ],
    "contentAngles": [
      "incienso",
      "metal",
      "decoracion"
    ],
    "certificationStatus": "Proveedor por confirmar",
    "claimNote": "Usar con ventilacion y sin prometer beneficios medicos.",
    "reorderAfterDays": 180,
    "stock": 1,
    "imageUrl": "/media/wellness-portaincienso-metal.jpg",
    "tags": [
      "bienestar",
      "incienso",
      "metal",
      "decoracion"
    ]
  },
  {
    "id": "prod-portaincienso-vertical-bronce",
    "sku": "BIEN-PORTAINCIENSO-VERTICAL-BRONCE",
    "handle": "portaincienso-vertical-bronce",
    "title": "Portaincienso vertical de bronce",
    "description": "Portaincienso vertical de bronce para rincones de aroma y decoracion.",
    "category": "Energia & Bienestar",
    "price": {
      "amount": 29.99,
      "currency": "USD"
    },
    "promoLabel": "Bronce",
    "stockSignal": "Stock por confirmar por WhatsApp",
    "bundleEligible": true,
    "material": "Bronce",
    "capacity": "1 portaincienso",
    "pieces": 1,
    "nivel": "Energia & Bienestar",
    "bundleUseCase": "Portaincienso vertical de bronce para rincones de aroma y decoracion.",
    "careTips": "Confirmar cuidados y disponibilidad por WhatsApp.",
    "healthAngle": "Producto de bienestar sin promesas medicas ni terapeuticas.",
    "warrantyText": "Garantia y disponibilidad a confirmar por WhatsApp.",
    "sourceUrls": [
      "https://wa.me/c/593979854905"
    ],
    "contentAngles": [
      "incienso",
      "bronce",
      "decoracion"
    ],
    "certificationStatus": "Proveedor por confirmar",
    "claimNote": "Usar con ventilacion y sin prometer beneficios medicos.",
    "reorderAfterDays": 180,
    "stock": 1,
    "imageUrl": "/media/wellness-portaincienso-metal.jpg",
    "tags": [
      "bienestar",
      "incienso",
      "bronce",
      "decoracion"
    ]
  },
  {
    "id": "prod-saumador-palo-santo-bronce",
    "sku": "BIEN-SAUMADOR-PALO-SANTO-BRONCE",
    "handle": "saumador-palo-santo-bronce",
    "title": "Saumador de palo Santo en bronce",
    "description": "Saumador de bronce para palo santo, aroma y decoracion.",
    "category": "Energia & Bienestar",
    "price": {
      "amount": 39.99,
      "currency": "USD"
    },
    "promoLabel": "Bronce",
    "stockSignal": "Stock por confirmar por WhatsApp",
    "bundleEligible": true,
    "material": "Bronce",
    "capacity": "1 saumador",
    "pieces": 1,
    "nivel": "Energia & Bienestar",
    "bundleUseCase": "Saumador de bronce para palo santo, aroma y decoracion.",
    "careTips": "Confirmar cuidados y disponibilidad por WhatsApp.",
    "healthAngle": "Producto de bienestar sin promesas medicas ni terapeuticas.",
    "warrantyText": "Garantia y disponibilidad a confirmar por WhatsApp.",
    "sourceUrls": [
      "https://wa.me/c/593979854905"
    ],
    "contentAngles": [
      "palo santo",
      "bronce",
      "aroma"
    ],
    "certificationStatus": "Proveedor por confirmar",
    "claimNote": "No prometer limpieza energetica ni beneficios medicos.",
    "reorderAfterDays": 180,
    "stock": 1,
    "imageUrl": "/media/wellness-aroma.svg",
    "tags": [
      "bienestar",
      "palo santo",
      "bronce",
      "aroma"
    ]
  },
  {
    "id": "prod-aretes-acero-inoxidable",
    "sku": "BIEN-ARETES-ACERO-INOXIDABLE",
    "handle": "aretes-acero-inoxidable",
    "title": "Aretes acero inoxidable",
    "description": "Aretes de acero inoxidable para uso diario y regalo.",
    "category": "Tesoros Plata & Acero",
    "price": {
      "amount": 15,
      "currency": "USD"
    },
    "promoLabel": "Acero inoxidable",
    "stockSignal": "Stock por confirmar por WhatsApp",
    "bundleEligible": true,
    "material": "Acero inoxidable",
    "capacity": "Par de aretes",
    "pieces": 1,
    "nivel": "Tesoros Plata & Acero",
    "bundleUseCase": "Aretes de acero inoxidable para uso diario y regalo.",
    "careTips": "Confirmar cuidados y disponibilidad por WhatsApp.",
    "healthAngle": "Producto de bienestar sin promesas medicas ni terapeuticas.",
    "warrantyText": "Garantia y disponibilidad a confirmar por WhatsApp.",
    "sourceUrls": [
      "https://wa.me/c/593979854905"
    ],
    "contentAngles": [
      "aretes",
      "acero inoxidable",
      "regalo"
    ],
    "certificationStatus": "Proveedor por confirmar",
    "claimNote": "Confirmar material exacto antes de pauta fuerte.",
    "reorderAfterDays": 180,
    "stock": 1,
    "imageUrl": "/media/wellness-aroma.svg",
    "tags": [
      "bienestar",
      "aretes",
      "acero inoxidable",
      "regalo"
    ]
  },
  {
    "id": "prod-aretes-plata-925",
    "sku": "BIEN-ARETES-PLATA-925",
    "handle": "aretes-plata-925",
    "title": "Aretes Plata 925",
    "description": "Aretes de plata 925 para uso diario o regalo especial.",
    "category": "Tesoros Plata & Acero",
    "price": {
      "amount": 33,
      "currency": "USD"
    },
    "promoLabel": "Plata 925",
    "stockSignal": "Stock por confirmar por WhatsApp",
    "bundleEligible": true,
    "material": "Plata 925",
    "capacity": "Par de aretes",
    "pieces": 1,
    "nivel": "Tesoros Plata & Acero",
    "bundleUseCase": "Aretes de plata 925 para uso diario o regalo especial.",
    "careTips": "Confirmar cuidados y disponibilidad por WhatsApp.",
    "healthAngle": "Producto de bienestar sin promesas medicas ni terapeuticas.",
    "warrantyText": "Garantia y disponibilidad a confirmar por WhatsApp.",
    "sourceUrls": [
      "https://wa.me/c/593979854905"
    ],
    "contentAngles": [
      "aretes",
      "plata 925",
      "regalo"
    ],
    "certificationStatus": "Proveedor por confirmar",
    "claimNote": "Confirmar material exacto antes de publicar como plata 925.",
    "reorderAfterDays": 180,
    "stock": 1,
    "imageUrl": "/media/wellness-aroma.svg",
    "tags": [
      "bienestar",
      "aretes",
      "plata 925",
      "regalo"
    ]
  },
  {
    "id": "prod-argollas-plata-925-2999",
    "sku": "BIEN-ARGOLLAS-PLATA-925-2999",
    "handle": "argollas-plata-925-2999",
    "title": "Argollas de Plata 925",
    "description": "Argollas de plata 925 para uso diario o regalo.",
    "category": "Tesoros Plata & Acero",
    "price": {
      "amount": 29.99,
      "currency": "USD"
    },
    "promoLabel": "Plata 925",
    "stockSignal": "Stock por confirmar por WhatsApp",
    "bundleEligible": true,
    "material": "Plata 925",
    "capacity": "Par de argollas",
    "pieces": 1,
    "nivel": "Tesoros Plata & Acero",
    "bundleUseCase": "Argollas de plata 925 para uso diario o regalo.",
    "careTips": "Confirmar cuidados y disponibilidad por WhatsApp.",
    "healthAngle": "Producto de bienestar sin promesas medicas ni terapeuticas.",
    "warrantyText": "Garantia y disponibilidad a confirmar por WhatsApp.",
    "sourceUrls": [
      "https://wa.me/c/593979854905"
    ],
    "contentAngles": [
      "argollas",
      "plata 925",
      "regalo"
    ],
    "certificationStatus": "Proveedor por confirmar",
    "claimNote": "Confirmar material exacto antes de publicar como plata 925.",
    "reorderAfterDays": 180,
    "stock": 1,
    "imageUrl": "/media/wellness-aroma.svg",
    "tags": [
      "bienestar",
      "argollas",
      "plata 925",
      "regalo"
    ]
  },
  {
    "id": "prod-anillos-hombre-acero-inoxidable",
    "sku": "BIEN-ANILLOS-HOMBRE-ACERO",
    "handle": "anillos-hombre-acero-inoxidable",
    "title": "Anillos hombre Acero Inoxidable",
    "description": "Anillos de hombre en acero inoxidable para uso diario.",
    "category": "Tesoros Plata & Acero",
    "price": {
      "amount": 19.99,
      "currency": "USD"
    },
    "promoLabel": "Acero inoxidable",
    "stockSignal": "Stock por confirmar por WhatsApp",
    "bundleEligible": true,
    "material": "Acero inoxidable",
    "capacity": "1 anillo",
    "pieces": 1,
    "nivel": "Tesoros Plata & Acero",
    "bundleUseCase": "Anillos de hombre en acero inoxidable para uso diario.",
    "careTips": "Confirmar cuidados y disponibilidad por WhatsApp.",
    "healthAngle": "Producto de bienestar sin promesas medicas ni terapeuticas.",
    "warrantyText": "Garantia y disponibilidad a confirmar por WhatsApp.",
    "sourceUrls": [
      "https://wa.me/c/593979854905"
    ],
    "contentAngles": [
      "anillos hombre",
      "acero inoxidable",
      "regalo"
    ],
    "certificationStatus": "Proveedor por confirmar",
    "claimNote": "Confirmar tallas y material antes de pauta fuerte.",
    "reorderAfterDays": 180,
    "stock": 1,
    "imageUrl": "/media/wellness-aroma.svg",
    "tags": [
      "bienestar",
      "anillos hombre",
      "acero inoxidable",
      "regalo"
    ]
  },
  {
    "id": "prod-anillos-acero-inoxidable-mujer-ajustables",
    "sku": "BIEN-ANILLOS-MUJER-ACERO-AJUSTABLES",
    "handle": "anillos-acero-inoxidable-mujer-ajustables",
    "title": "Anillos Acero Inoxidable mujer ajustables",
    "description": "Anillos ajustables de acero inoxidable para mujer.",
    "category": "Tesoros Plata & Acero",
    "price": {
      "amount": 9.99,
      "currency": "USD"
    },
    "promoLabel": "Ajustables",
    "stockSignal": "Stock por confirmar por WhatsApp",
    "bundleEligible": true,
    "material": "Acero inoxidable",
    "capacity": "1 anillo ajustable",
    "pieces": 1,
    "nivel": "Tesoros Plata & Acero",
    "bundleUseCase": "Anillos ajustables de acero inoxidable para mujer.",
    "careTips": "Confirmar cuidados y disponibilidad por WhatsApp.",
    "healthAngle": "Producto de bienestar sin promesas medicas ni terapeuticas.",
    "warrantyText": "Garantia y disponibilidad a confirmar por WhatsApp.",
    "sourceUrls": [
      "https://wa.me/c/593979854905"
    ],
    "contentAngles": [
      "anillos mujer",
      "ajustables",
      "acero inoxidable"
    ],
    "certificationStatus": "Proveedor por confirmar",
    "claimNote": "Confirmar material exacto antes de pauta fuerte.",
    "reorderAfterDays": 180,
    "stock": 1,
    "imageUrl": "/media/wellness-aroma.svg",
    "tags": [
      "bienestar",
      "anillos mujer",
      "ajustables",
      "acero inoxidable"
    ]
  },
  {
    "id": "prod-dije-om-acero-inoxidable",
    "sku": "BIEN-DIJE-OM-ACERO",
    "handle": "dije-om-acero-inoxidable",
    "title": "Dije OM Acero inoxidable",
    "description": "Dije OM de acero inoxidable para accesorio personal o regalo pequeno.",
    "category": "Tesoros Plata & Acero",
    "price": {
      "amount": 5,
      "currency": "USD"
    },
    "promoLabel": "Simbolo OM",
    "stockSignal": "Stock por confirmar por WhatsApp",
    "bundleEligible": true,
    "material": "Acero inoxidable",
    "capacity": "Dije",
    "pieces": 1,
    "nivel": "Tesoros Plata & Acero",
    "bundleUseCase": "Dije OM de acero inoxidable para accesorio personal o regalo pequeno.",
    "careTips": "Confirmar cuidados y disponibilidad por WhatsApp.",
    "healthAngle": "Producto de bienestar sin promesas medicas ni terapeuticas.",
    "warrantyText": "Garantia y disponibilidad a confirmar por WhatsApp.",
    "sourceUrls": [
      "https://wa.me/c/593979854905"
    ],
    "contentAngles": [
      "OM",
      "acero inoxidable",
      "regalo pequeno"
    ],
    "certificationStatus": "Proveedor por confirmar",
    "claimNote": "No prometer proteccion ni beneficios espirituales.",
    "reorderAfterDays": 180,
    "stock": 1,
    "imageUrl": "/media/wellness-aroma.svg",
    "tags": [
      "bienestar",
      "OM",
      "acero inoxidable",
      "regalo pequeno"
    ]
  },
  {
    "id": "prod-aretes-largos-acero-inoxidable-plateados",
    "sku": "BIEN-ARETES-LARGOS-ACERO-PLATEADOS",
    "handle": "aretes-largos-acero-inoxidable-plateados",
    "title": "Aretes largos Acero inoxidable plateados",
    "description": "Aretes largos plateados de acero inoxidable para regalo o uso personal.",
    "category": "Tesoros Plata & Acero",
    "price": {
      "amount": 19.99,
      "currency": "USD"
    },
    "promoLabel": "Plateados",
    "stockSignal": "Stock por confirmar por WhatsApp",
    "bundleEligible": true,
    "material": "Acero inoxidable",
    "capacity": "Par de aretes",
    "pieces": 1,
    "nivel": "Tesoros Plata & Acero",
    "bundleUseCase": "Aretes largos plateados de acero inoxidable para regalo o uso personal.",
    "careTips": "Confirmar cuidados y disponibilidad por WhatsApp.",
    "healthAngle": "Producto de bienestar sin promesas medicas ni terapeuticas.",
    "warrantyText": "Garantia y disponibilidad a confirmar por WhatsApp.",
    "sourceUrls": [
      "https://wa.me/c/593979854905"
    ],
    "contentAngles": [
      "aretes largos",
      "plateados",
      "acero inoxidable"
    ],
    "certificationStatus": "Proveedor por confirmar",
    "claimNote": "Confirmar material exacto antes de pauta fuerte.",
    "reorderAfterDays": 180,
    "stock": 1,
    "imageUrl": "/media/wellness-aroma.svg",
    "tags": [
      "bienestar",
      "aretes largos",
      "plateados",
      "acero inoxidable"
    ]
  },
  {
    "id": "prod-aretes-largos-acero-inoxidable-dorados",
    "sku": "BIEN-ARETES-LARGOS-ACERO-DORADOS",
    "handle": "aretes-largos-acero-inoxidable-dorados",
    "title": "Aretes largos Acero inoxidable dorados",
    "description": "Aretes largos dorados de acero inoxidable para regalo o uso personal.",
    "category": "Tesoros Plata & Acero",
    "price": {
      "amount": 19.99,
      "currency": "USD"
    },
    "promoLabel": "Dorados",
    "stockSignal": "Stock por confirmar por WhatsApp",
    "bundleEligible": true,
    "material": "Acero inoxidable",
    "capacity": "Par de aretes",
    "pieces": 1,
    "nivel": "Tesoros Plata & Acero",
    "bundleUseCase": "Aretes largos dorados de acero inoxidable para regalo o uso personal.",
    "careTips": "Confirmar cuidados y disponibilidad por WhatsApp.",
    "healthAngle": "Producto de bienestar sin promesas medicas ni terapeuticas.",
    "warrantyText": "Garantia y disponibilidad a confirmar por WhatsApp.",
    "sourceUrls": [
      "https://wa.me/c/593979854905"
    ],
    "contentAngles": [
      "aretes largos",
      "dorados",
      "acero inoxidable"
    ],
    "certificationStatus": "Proveedor por confirmar",
    "claimNote": "Confirmar material exacto antes de pauta fuerte.",
    "reorderAfterDays": 180,
    "stock": 1,
    "imageUrl": "/media/wellness-aroma.svg",
    "tags": [
      "bienestar",
      "aretes largos",
      "dorados",
      "acero inoxidable"
    ]
  },
  {
    "id": "prod-aretes-acero-inoxidable-oro-rosado",
    "sku": "BIEN-ARETES-ACERO-ORO-ROSADO",
    "handle": "aretes-acero-inoxidable-oro-rosado",
    "title": "Aretes Acero Inoxidable oro rosado",
    "description": "Aretes color oro rosado de acero inoxidable para uso diario.",
    "category": "Tesoros Plata & Acero",
    "price": {
      "amount": 15,
      "currency": "USD"
    },
    "promoLabel": "Oro rosado",
    "stockSignal": "Stock por confirmar por WhatsApp",
    "bundleEligible": true,
    "material": "Acero inoxidable",
    "capacity": "Par de aretes",
    "pieces": 1,
    "nivel": "Tesoros Plata & Acero",
    "bundleUseCase": "Aretes color oro rosado de acero inoxidable para uso diario.",
    "careTips": "Confirmar cuidados y disponibilidad por WhatsApp.",
    "healthAngle": "Producto de bienestar sin promesas medicas ni terapeuticas.",
    "warrantyText": "Garantia y disponibilidad a confirmar por WhatsApp.",
    "sourceUrls": [
      "https://wa.me/c/593979854905"
    ],
    "contentAngles": [
      "aretes",
      "oro rosado",
      "acero inoxidable"
    ],
    "certificationStatus": "Proveedor por confirmar",
    "claimNote": "Confirmar material exacto antes de pauta fuerte.",
    "reorderAfterDays": 180,
    "stock": 1,
    "imageUrl": "/media/wellness-aroma.svg",
    "tags": [
      "bienestar",
      "aretes",
      "oro rosado",
      "acero inoxidable"
    ]
  },
  {
    "id": "prod-aretes-pequenos-acero-inoxidable",
    "sku": "BIEN-ARETES-PEQUENOS-ACERO",
    "handle": "aretes-pequenos-acero-inoxidable",
    "title": "Aretes pequenos Acero inoxidable",
    "description": "Aretes pequenos de acero inoxidable para uso diario.",
    "category": "Tesoros Plata & Acero",
    "price": {
      "amount": 9.99,
      "currency": "USD"
    },
    "promoLabel": "Uso diario",
    "stockSignal": "Stock por confirmar por WhatsApp",
    "bundleEligible": true,
    "material": "Acero inoxidable",
    "capacity": "Par de aretes",
    "pieces": 1,
    "nivel": "Tesoros Plata & Acero",
    "bundleUseCase": "Aretes pequenos de acero inoxidable para uso diario.",
    "careTips": "Confirmar cuidados y disponibilidad por WhatsApp.",
    "healthAngle": "Producto de bienestar sin promesas medicas ni terapeuticas.",
    "warrantyText": "Garantia y disponibilidad a confirmar por WhatsApp.",
    "sourceUrls": [
      "https://wa.me/c/593979854905"
    ],
    "contentAngles": [
      "aretes pequenos",
      "acero inoxidable",
      "regalo"
    ],
    "certificationStatus": "Proveedor por confirmar",
    "claimNote": "Confirmar material exacto antes de pauta fuerte.",
    "reorderAfterDays": 180,
    "stock": 1,
    "imageUrl": "/media/wellness-aroma.svg",
    "tags": [
      "bienestar",
      "aretes pequenos",
      "acero inoxidable",
      "regalo"
    ]
  },
  {
    "id": "prod-collares-quarzos-naturales",
    "sku": "BIEN-COLLARES-QUARZOS-NATURALES",
    "handle": "collares-quarzos-naturales",
    "title": "Collares de Quarzos Naturales",
    "description": "Collares de quarzos naturales para accesorio personal o regalo.",
    "category": "Tesoros Plata & Acero",
    "price": {
      "amount": 19.99,
      "currency": "USD"
    },
    "promoLabel": "Quarzos",
    "stockSignal": "Stock por confirmar por WhatsApp",
    "bundleEligible": true,
    "material": "Quarzos naturales por confirmar",
    "capacity": "1 collar",
    "pieces": 1,
    "nivel": "Tesoros Plata & Acero",
    "bundleUseCase": "Collares de quarzos naturales para accesorio personal o regalo.",
    "careTips": "Confirmar cuidados y disponibilidad por WhatsApp.",
    "healthAngle": "Producto de bienestar sin promesas medicas ni terapeuticas.",
    "warrantyText": "Garantia y disponibilidad a confirmar por WhatsApp.",
    "sourceUrls": [
      "https://wa.me/c/593979854905"
    ],
    "contentAngles": [
      "quarzos",
      "collar",
      "regalo"
    ],
    "certificationStatus": "Proveedor por confirmar",
    "claimNote": "No prometer propiedades curativas, energeticas ni terapeuticas.",
    "reorderAfterDays": 180,
    "stock": 1,
    "imageUrl": "/media/wellness-aroma.svg",
    "tags": [
      "bienestar",
      "quarzos",
      "collar",
      "regalo"
    ]
  },
  {
    "id": "prod-velas-grandes-caja-mandala",
    "sku": "BIEN-VELAS-GRANDES-CAJA-MANDALA",
    "handle": "velas-grandes-caja-mandala",
    "title": "Velas grandes caja mandala",
    "description": "Velas grandes en caja mandala para ambientar espacios.",
    "category": "Energia & Bienestar",
    "price": {
      "amount": 4.99,
      "currency": "USD"
    },
    "promoLabel": "Ambiente",
    "stockSignal": "Stock por confirmar por WhatsApp",
    "bundleEligible": true,
    "material": "Cera por confirmar",
    "capacity": "Caja mandala",
    "pieces": 1,
    "nivel": "Energia & Bienestar",
    "bundleUseCase": "Velas grandes en caja mandala para ambientar espacios.",
    "careTips": "Confirmar cuidados y disponibilidad por WhatsApp.",
    "healthAngle": "Producto de bienestar sin promesas medicas ni terapeuticas.",
    "warrantyText": "Garantia y disponibilidad a confirmar por WhatsApp.",
    "sourceUrls": [
      "https://wa.me/c/593979854905"
    ],
    "contentAngles": [
      "velas",
      "mandala",
      "decoracion"
    ],
    "certificationStatus": "Proveedor por confirmar",
    "claimNote": "Usar con supervision y sin prometer beneficios medicos.",
    "reorderAfterDays": 180,
    "stock": 1,
    "imageUrl": "/media/wellness-velas-mandala.jpg",
    "tags": [
      "bienestar",
      "velas",
      "mandala",
      "decoracion"
    ]
  },
  {
    "id": "prod-velas-pequenas-caja-mandala",
    "sku": "BIEN-VELAS-PEQUENAS-CAJA-MANDALA",
    "handle": "velas-pequenas-caja-mandala",
    "title": "Velas pequenas caja mandala",
    "description": "Velas pequenas en caja mandala para ambientar espacios.",
    "category": "Energia & Bienestar",
    "price": {
      "amount": 3.99,
      "currency": "USD"
    },
    "promoLabel": "Ambiente",
    "stockSignal": "Stock por confirmar por WhatsApp",
    "bundleEligible": true,
    "material": "Cera por confirmar",
    "capacity": "Caja mandala",
    "pieces": 1,
    "nivel": "Energia & Bienestar",
    "bundleUseCase": "Velas pequenas en caja mandala para ambientar espacios.",
    "careTips": "Confirmar cuidados y disponibilidad por WhatsApp.",
    "healthAngle": "Producto de bienestar sin promesas medicas ni terapeuticas.",
    "warrantyText": "Garantia y disponibilidad a confirmar por WhatsApp.",
    "sourceUrls": [
      "https://wa.me/c/593979854905"
    ],
    "contentAngles": [
      "velas pequenas",
      "mandala",
      "decoracion"
    ],
    "certificationStatus": "Proveedor por confirmar",
    "claimNote": "Usar con supervision y sin prometer beneficios medicos.",
    "reorderAfterDays": 180,
    "stock": 1,
    "imageUrl": "/media/wellness-velas-mandala.jpg",
    "tags": [
      "bienestar",
      "velas pequenas",
      "mandala",
      "decoracion"
    ]
  },
  {
    "id": "prod-piedra-alumbre",
    "sku": "BIEN-PIEDRA-ALUMBRE",
    "handle": "piedra-alumbre",
    "title": "Piedra Alumbre",
    "description": "Piedra alumbre para rutina de cuidado personal, segun uso tradicional.",
    "category": "Cuidado Personal",
    "price": {
      "amount": 5,
      "currency": "USD"
    },
    "promoLabel": "Cuidado personal",
    "stockSignal": "Stock por confirmar por WhatsApp",
    "bundleEligible": true,
    "material": "Alumbre",
    "capacity": "1 piedra",
    "pieces": 1,
    "nivel": "Cuidado Personal",
    "bundleUseCase": "Piedra alumbre para rutina de cuidado personal, segun uso tradicional.",
    "careTips": "Confirmar cuidados y disponibilidad por WhatsApp.",
    "healthAngle": "Producto de bienestar sin promesas medicas ni terapeuticas.",
    "warrantyText": "Garantia y disponibilidad a confirmar por WhatsApp.",
    "sourceUrls": [
      "https://wa.me/c/593979854905"
    ],
    "contentAngles": [
      "alumbre",
      "cuidado personal",
      "rutina"
    ],
    "certificationStatus": "Proveedor por confirmar",
    "claimNote": "Evitar claims antibacteriales o dermatologicos sin respaldo regulatorio.",
    "reorderAfterDays": 180,
    "stock": 1,
    "imageUrl": "/media/wellness-piedra-alumbre.jpg",
    "tags": [
      "bienestar",
      "alumbre",
      "cuidado personal",
      "rutina"
    ]
  },
  {
    "id": "prod-lampara-ghee-bronce-100",
    "sku": "BIEN-LAMPARA-GHEE-BRONCE",
    "handle": "lampara-ghee-bronce-100",
    "title": "Lampara de ghee Bronce 100%",
    "description": "Lampara de ghee de bronce para ritual, decoracion y ambiente.",
    "category": "Energia & Bienestar",
    "price": {
      "amount": 11,
      "currency": "USD"
    },
    "promoLabel": "Bronce",
    "stockSignal": "Stock por confirmar por WhatsApp",
    "bundleEligible": true,
    "material": "Bronce",
    "capacity": "1 lampara",
    "pieces": 1,
    "nivel": "Energia & Bienestar",
    "bundleUseCase": "Lampara de ghee de bronce para ritual, decoracion y ambiente.",
    "careTips": "Confirmar cuidados y disponibilidad por WhatsApp.",
    "healthAngle": "Producto de bienestar sin promesas medicas ni terapeuticas.",
    "warrantyText": "Garantia y disponibilidad a confirmar por WhatsApp.",
    "sourceUrls": [
      "https://wa.me/c/593979854905"
    ],
    "contentAngles": [
      "ghee",
      "bronce",
      "ritual"
    ],
    "certificationStatus": "Proveedor por confirmar",
    "claimNote": "No prometer beneficios espirituales absolutos.",
    "reorderAfterDays": 180,
    "stock": 1,
    "imageUrl": "/media/wellness-lampara-ghee-bronce.jpg",
    "tags": [
      "bienestar",
      "ghee",
      "bronce",
      "ritual"
    ]
  },
  {
    "id": "prod-nataraj-bronce",
    "sku": "BIEN-NATARAJ-BRONCE",
    "handle": "nataraj-bronce",
    "title": "Nataraj Bronce",
    "description": "Figura Nataraj de bronce para decoracion y espacios de pausa.",
    "category": "Energia & Bienestar",
    "price": {
      "amount": 55,
      "currency": "USD"
    },
    "promoLabel": "Bronce",
    "stockSignal": "Stock por confirmar por WhatsApp",
    "bundleEligible": true,
    "material": "Bronce",
    "capacity": "Figura decorativa",
    "pieces": 1,
    "nivel": "Energia & Bienestar",
    "bundleUseCase": "Figura Nataraj de bronce para decoracion y espacios de pausa.",
    "careTips": "Confirmar cuidados y disponibilidad por WhatsApp.",
    "healthAngle": "Producto de bienestar sin promesas medicas ni terapeuticas.",
    "warrantyText": "Garantia y disponibilidad a confirmar por WhatsApp.",
    "sourceUrls": [
      "https://wa.me/c/593979854905"
    ],
    "contentAngles": [
      "nataraj",
      "bronce",
      "decoracion"
    ],
    "certificationStatus": "Proveedor por confirmar",
    "claimNote": "No prometer beneficios espirituales absolutos.",
    "reorderAfterDays": 180,
    "stock": 1,
    "imageUrl": "/media/wellness-nataraj-bronce.jpg",
    "tags": [
      "bienestar",
      "nataraj",
      "bronce",
      "decoracion"
    ]
  },
  {
    "id": "prod-inciensos-stick-jumbo",
    "sku": "BIEN-INCIENSOS-STICK-JUMBO",
    "handle": "inciensos-stick-jumbo",
    "title": "Inciensos Stick Jumbo",
    "description": "Inciensos stick jumbo para aroma y ambiente en casa.",
    "category": "Energia & Bienestar",
    "price": {
      "amount": 4.99,
      "currency": "USD"
    },
    "promoLabel": "Aroma",
    "stockSignal": "Stock por confirmar por WhatsApp",
    "bundleEligible": true,
    "material": "Incienso",
    "capacity": "Stick jumbo",
    "pieces": 1,
    "nivel": "Energia & Bienestar",
    "bundleUseCase": "Inciensos stick jumbo para aroma y ambiente en casa.",
    "careTips": "Confirmar cuidados y disponibilidad por WhatsApp.",
    "healthAngle": "Producto de bienestar sin promesas medicas ni terapeuticas.",
    "warrantyText": "Garantia y disponibilidad a confirmar por WhatsApp.",
    "sourceUrls": [
      "https://wa.me/c/593979854905"
    ],
    "contentAngles": [
      "incienso jumbo",
      "aroma",
      "ambiente"
    ],
    "certificationStatus": "Proveedor por confirmar",
    "claimNote": "Usar con ventilacion y sin prometer beneficios medicos.",
    "reorderAfterDays": 180,
    "stock": 1,
    "imageUrl": "/media/wellness-incienso-ullas.jpg",
    "tags": [
      "bienestar",
      "incienso jumbo",
      "aroma",
      "ambiente"
    ]
  },
  {
    "id": "prod-straps-18-metros",
    "sku": "BIEN-STRAP-1-8M",
    "handle": "straps-18-metros",
    "title": "Straps 1.8 metros",
    "description": "Strap de 1.8 metros para yoga, estiramiento y movilidad suave.",
    "category": "Yoga & Movimiento",
    "price": {
      "amount": 9,
      "currency": "USD"
    },
    "promoLabel": "Yoga",
    "stockSignal": "Stock por confirmar por WhatsApp",
    "bundleEligible": true,
    "material": "Tela por confirmar",
    "capacity": "1.8 metros",
    "pieces": 1,
    "nivel": "Yoga & Movimiento",
    "bundleUseCase": "Strap de 1.8 metros para yoga, estiramiento y movilidad suave.",
    "careTips": "Confirmar cuidados y disponibilidad por WhatsApp.",
    "healthAngle": "Producto de bienestar sin promesas medicas ni terapeuticas.",
    "warrantyText": "Garantia y disponibilidad a confirmar por WhatsApp.",
    "sourceUrls": [
      "https://wa.me/c/593979854905"
    ],
    "contentAngles": [
      "strap 1.8 m",
      "yoga",
      "movimiento"
    ],
    "certificationStatus": "Proveedor por confirmar",
    "claimNote": "No prometer correccion fisica ni beneficio clinico.",
    "reorderAfterDays": 180,
    "stock": 1,
    "imageUrl": "/media/wellness-straps.jpg",
    "tags": [
      "bienestar",
      "strap 1.8 m",
      "yoga",
      "movimiento"
    ]
  },
  {
    "id": "prod-straps-3-metros",
    "sku": "BIEN-STRAP-3M",
    "handle": "straps-3-metros",
    "title": "Straps 3 metros",
    "description": "Strap de 3 metros para yoga, estiramiento y movilidad suave.",
    "category": "Yoga & Movimiento",
    "price": {
      "amount": 11,
      "currency": "USD"
    },
    "promoLabel": "Yoga",
    "stockSignal": "Stock por confirmar por WhatsApp",
    "bundleEligible": true,
    "material": "Tela por confirmar",
    "capacity": "3 metros",
    "pieces": 1,
    "nivel": "Yoga & Movimiento",
    "bundleUseCase": "Strap de 3 metros para yoga, estiramiento y movilidad suave.",
    "careTips": "Confirmar cuidados y disponibilidad por WhatsApp.",
    "healthAngle": "Producto de bienestar sin promesas medicas ni terapeuticas.",
    "warrantyText": "Garantia y disponibilidad a confirmar por WhatsApp.",
    "sourceUrls": [
      "https://wa.me/c/593979854905"
    ],
    "contentAngles": [
      "strap 3 m",
      "yoga",
      "movimiento"
    ],
    "certificationStatus": "Proveedor por confirmar",
    "claimNote": "No prometer correccion fisica ni beneficio clinico.",
    "reorderAfterDays": 180,
    "stock": 1,
    "imageUrl": "/media/wellness-straps.jpg",
    "tags": [
      "bienestar",
      "strap 3 m",
      "yoga",
      "movimiento"
    ]
  },
  {
    "id": "prod-limpiador-lengua-cobre-100-virgen",
    "sku": "BIEN-LIMPIADOR-LENGUA-COBRE",
    "handle": "limpiador-lengua-cobre-100-virgen",
    "title": "Limpiador de Lengua Cobre 100% Virgen hecho a mano",
    "description": "Limpiador de lengua de cobre hecho a mano para rutina diaria de cuidado personal.",
    "category": "Cuidado Personal",
    "price": {
      "amount": 15,
      "currency": "USD"
    },
    "promoLabel": "Cobre",
    "stockSignal": "Stock por confirmar por WhatsApp",
    "bundleEligible": true,
    "material": "Cobre",
    "capacity": "1 limpiador",
    "pieces": 1,
    "nivel": "Cuidado Personal",
    "bundleUseCase": "Limpiador de lengua de cobre hecho a mano para rutina diaria de cuidado personal.",
    "careTips": "Confirmar cuidados y disponibilidad por WhatsApp.",
    "healthAngle": "Producto de bienestar sin promesas medicas ni terapeuticas.",
    "warrantyText": "Garantia y disponibilidad a confirmar por WhatsApp.",
    "sourceUrls": [
      "https://wa.me/c/593979854905"
    ],
    "contentAngles": [
      "limpiador lengua",
      "cobre",
      "rutina diaria"
    ],
    "certificationStatus": "Proveedor por confirmar",
    "claimNote": "No prometer detox, cura, antibacterial ni beneficios medicos sin respaldo.",
    "reorderAfterDays": 180,
    "stock": 1,
    "imageUrl": "/media/wellness-limpiador-lengua-cobre.jpg",
    "tags": [
      "bienestar",
      "limpiador lengua",
      "cobre",
      "rutina diaria"
    ]
  },
  {
    "id": "prod-tetera-vidrio-450ml",
    "sku": "BIEN-TETERA-VIDRIO-450",
    "handle": "tetera-vidrio-450ml",
    "title": "Tetera vidrio 450 ml",
    "description": "Tetera de vidrio de 450 ml para infusiones y rituales de mesa.",
    "category": "Hogar Zen",
    "price": {
      "amount": 15,
      "currency": "USD"
    },
    "promoLabel": "Te",
    "stockSignal": "Stock por confirmar por WhatsApp",
    "bundleEligible": true,
    "material": "Vidrio",
    "capacity": "450 ml",
    "pieces": 1,
    "nivel": "Hogar Zen",
    "bundleUseCase": "Tetera de vidrio de 450 ml para infusiones y rituales de mesa.",
    "careTips": "Confirmar cuidados y disponibilidad por WhatsApp.",
    "healthAngle": "Producto de bienestar sin promesas medicas ni terapeuticas.",
    "warrantyText": "Garantia y disponibilidad a confirmar por WhatsApp.",
    "sourceUrls": [
      "https://wa.me/c/593979854905"
    ],
    "contentAngles": [
      "tetera 450 ml",
      "vidrio",
      "infusiones"
    ],
    "certificationStatus": "Proveedor por confirmar",
    "claimNote": "No prometer beneficios medicos por infusiones.",
    "reorderAfterDays": 180,
    "stock": 1,
    "imageUrl": "/media/wellness-tetera-vidrio-450.jpg",
    "tags": [
      "bienestar",
      "tetera 450 ml",
      "vidrio",
      "infusiones"
    ]
  },
  {
    "id": "prod-incienso-organicos-ullas-hechos-a-mano",
    "sku": "BIEN-INCIENSO-ORGANICOS-ULLAS",
    "handle": "incienso-organicos-ullas-hechos-a-mano",
    "title": "Incienso Organicos Ullas hechos a mano",
    "description": "Inciensos organicos Ullas hechos a mano para aroma y ambiente.",
    "category": "Energia & Bienestar",
    "price": {
      "amount": 4.99,
      "currency": "USD"
    },
    "promoLabel": "Aroma",
    "stockSignal": "Stock por confirmar por WhatsApp",
    "bundleEligible": true,
    "material": "Incienso organico por confirmar",
    "capacity": "Caja de incienso",
    "pieces": 1,
    "nivel": "Energia & Bienestar",
    "bundleUseCase": "Inciensos organicos Ullas hechos a mano para aroma y ambiente.",
    "careTips": "Confirmar cuidados y disponibilidad por WhatsApp.",
    "healthAngle": "Producto de bienestar sin promesas medicas ni terapeuticas.",
    "warrantyText": "Garantia y disponibilidad a confirmar por WhatsApp.",
    "sourceUrls": [
      "https://wa.me/c/593979854905"
    ],
    "contentAngles": [
      "incienso organico",
      "hecho a mano",
      "ambiente"
    ],
    "certificationStatus": "Proveedor por confirmar",
    "claimNote": "Usar con ventilacion y sin prometer beneficios medicos.",
    "reorderAfterDays": 180,
    "stock": 1,
    "imageUrl": "/media/wellness-incienso-ullas.jpg",
    "tags": [
      "bienestar",
      "incienso organico",
      "hecho a mano",
      "ambiente"
    ]
  },
  {
    "id": "prod-tetera-vidrio-1600ml-infusor",
    "sku": "BIEN-TETERA-VIDRIO-1600-INFUSOR",
    "handle": "tetera-vidrio-1600ml-infusor",
    "title": "Tetera vidrio 1600 ml con infusor",
    "description": "Tetera de vidrio de 1600 ml con infusor para compartir infusiones.",
    "category": "Hogar Zen",
    "price": {
      "amount": 15,
      "currency": "USD"
    },
    "promoLabel": "Te",
    "stockSignal": "Stock por confirmar por WhatsApp",
    "bundleEligible": true,
    "material": "Vidrio",
    "capacity": "1600 ml",
    "pieces": 1,
    "nivel": "Hogar Zen",
    "bundleUseCase": "Tetera de vidrio de 1600 ml con infusor para compartir infusiones.",
    "careTips": "Confirmar cuidados y disponibilidad por WhatsApp.",
    "healthAngle": "Producto de bienestar sin promesas medicas ni terapeuticas.",
    "warrantyText": "Garantia y disponibilidad a confirmar por WhatsApp.",
    "sourceUrls": [
      "https://wa.me/c/593979854905"
    ],
    "contentAngles": [
      "tetera 1600 ml",
      "infusor",
      "vidrio"
    ],
    "certificationStatus": "Proveedor por confirmar",
    "claimNote": "No prometer beneficios medicos por infusiones.",
    "reorderAfterDays": 180,
    "stock": 1,
    "imageUrl": "/media/wellness-tetera-vidrio-1600.jpg",
    "tags": [
      "bienestar",
      "tetera 1600 ml",
      "infusor",
      "vidrio"
    ]
  },
  {
    "id": "prod-bolsters-cuadrados",
    "sku": "BIEN-BOLSTERS-CUADRADOS",
    "handle": "bolsters-cuadrados",
    "title": "Bolsters cuadrados",
    "description": "Bolster cuadrado para apoyo en yoga, descanso y estiramiento suave.",
    "category": "Yoga & Movimiento",
    "price": {
      "amount": 35,
      "currency": "USD"
    },
    "promoLabel": "Soporte yoga",
    "stockSignal": "Stock por confirmar por WhatsApp",
    "bundleEligible": true,
    "material": "Textil por confirmar",
    "capacity": "1 bolster",
    "pieces": 1,
    "nivel": "Yoga & Movimiento",
    "bundleUseCase": "Bolster cuadrado para apoyo en yoga, descanso y estiramiento suave.",
    "careTips": "Confirmar cuidados y disponibilidad por WhatsApp.",
    "healthAngle": "Producto de bienestar sin promesas medicas ni terapeuticas.",
    "warrantyText": "Garantia y disponibilidad a confirmar por WhatsApp.",
    "sourceUrls": [
      "https://wa.me/c/593979854905"
    ],
    "contentAngles": [
      "bolster",
      "yoga",
      "descanso"
    ],
    "certificationStatus": "Proveedor por confirmar",
    "claimNote": "No prometer correccion fisica ni beneficio clinico.",
    "reorderAfterDays": 180,
    "stock": 1,
    "imageUrl": "/media/wellness-mat.svg",
    "tags": [
      "bienestar",
      "bolster",
      "yoga",
      "descanso"
    ]
  },
  {
    "id": "prod-juegos-de-te-japoneses",
    "sku": "BIEN-JUEGOS-TE-JAPONESES",
    "handle": "juegos-de-te-japoneses",
    "title": "Juegos de te Japoneses",
    "description": "Juego de te japones para mesa, regalos y pausas en casa.",
    "category": "Hogar Zen",
    "price": {
      "amount": 39.99,
      "currency": "USD"
    },
    "promoLabel": "Te",
    "stockSignal": "Stock por confirmar por WhatsApp",
    "bundleEligible": true,
    "material": "Ceramica por confirmar",
    "capacity": "Set de te",
    "pieces": 1,
    "nivel": "Hogar Zen",
    "bundleUseCase": "Juego de te japones para mesa, regalos y pausas en casa.",
    "careTips": "Confirmar cuidados y disponibilidad por WhatsApp.",
    "healthAngle": "Producto de bienestar sin promesas medicas ni terapeuticas.",
    "warrantyText": "Garantia y disponibilidad a confirmar por WhatsApp.",
    "sourceUrls": [
      "https://wa.me/c/593979854905"
    ],
    "contentAngles": [
      "te japones",
      "set de te",
      "regalo"
    ],
    "certificationStatus": "Proveedor por confirmar",
    "claimNote": "No prometer beneficios medicos de infusiones.",
    "reorderAfterDays": 180,
    "stock": 1,
    "imageUrl": "/media/wellness-juego-te-japones.jpg",
    "tags": [
      "bienestar",
      "te japones",
      "set de te",
      "regalo"
    ]
  },
  {
    "id": "prod-billete-1-millon",
    "sku": "BIEN-BILLETE-1-MILLON",
    "handle": "billete-1-millon",
    "title": "Billete 1 Millon",
    "description": "Billete decorativo de 1 millon para regalo simbolico o detalle.",
    "category": "Energia & Bienestar",
    "price": {
      "amount": 3.5,
      "currency": "USD"
    },
    "promoLabel": "Detalle",
    "stockSignal": "Stock por confirmar por WhatsApp",
    "bundleEligible": true,
    "material": "Papel decorativo",
    "capacity": "1 billete",
    "pieces": 1,
    "nivel": "Energia & Bienestar",
    "bundleUseCase": "Billete decorativo de 1 millon para regalo simbolico o detalle.",
    "careTips": "Confirmar cuidados y disponibilidad por WhatsApp.",
    "healthAngle": "Producto de bienestar sin promesas medicas ni terapeuticas.",
    "warrantyText": "Garantia y disponibilidad a confirmar por WhatsApp.",
    "sourceUrls": [
      "https://wa.me/c/593979854905"
    ],
    "contentAngles": [
      "billete 1 millon",
      "detalle",
      "regalo"
    ],
    "certificationStatus": "Proveedor por confirmar",
    "claimNote": "No prometer abundancia, suerte ni resultados economicos.",
    "reorderAfterDays": 180,
    "stock": 1,
    "imageUrl": "/media/wellness-billete-1-millon.jpg",
    "tags": [
      "bienestar",
      "billete 1 millon",
      "detalle",
      "regalo"
    ]
  },
]

export const wellnessFallbackProducts: Product[] = wellnessFallbackCatalog.map(
  (product) => ({
    ...product,
    variantId: product.id.replace("prod-", "var-"),
    vertical: "bienestar",
    brand: "Eter Niu Bienestar",
    deliveryBadge: "Envio gratis Ecuador",
    freeShipping: true,
    paymentMethods: defaultPaymentMethods,
    couponCode: "BIENESTARHOY",
    stoveCompatibility: "No aplica",
    productUrl: `${wellnessBaseUrl}/campanas/${product.handle}?sku=${product.sku}`,
  }),
);

function isGeneratedPlaceholder(url?: string) {
  return !url || url.includes("placehold.co");
}

function localMediaUrl(url?: string) {
  if (!url) return "";
  if (url.startsWith("/media/")) return url;

  try {
    const parsed = new URL(url);
    const legacyMediaHosts = new Set([
      "shop.b2b.com.ec",
      "cocina.b2b.com.ec",
      "bienestar.b2b.com.ec",
      "cocina.eter-niu.com",
      "bienestar.eter-niu.com",
      "www.eter-niu.com",
      "eter-niu.com",
    ]);

    if (legacyMediaHosts.has(parsed.hostname) && parsed.pathname.startsWith("/media/")) {
      return parsed.pathname;
    }
  } catch {
    return url;
  }

  return url;
}

function generatedImageForProduct(product: Product) {
  const haystack = `${product.sku} ${product.title} ${product.category}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  if (
    product.vertical === "bienestar" ||
    product.sku.startsWith("BIEN-") ||
    haystack.includes("bienestar")
  ) {
    if (haystack.includes("mat") || haystack.includes("yoga")) {
      return "/media/wellness-mat.svg";
    }
    if (haystack.includes("bowl") || haystack.includes("te ")) {
      return "/media/wellness-bowl.svg";
    }
    if (haystack.includes("aroma") || haystack.includes("calma")) {
      return "/media/wellness-aroma.svg";
    }
    if (
      haystack.includes("botella") ||
      haystack.includes("hidrat") ||
      haystack.includes("termo")
    ) {
      return "/media/wellness-botella.svg";
    }
    if (
      haystack.includes("tambor") ||
      haystack.includes("lengua") ||
      haystack.includes("8 notas")
    ) {
      return "/media/wellness-tambor-lengua-real.jpg";
    }
    if (
      haystack.includes("cuenco") ||
      haystack.includes("pendulo") ||
      haystack.includes("lampara") ||
      haystack.includes("plata") ||
      haystack.includes("amuleto") ||
      haystack.includes("humo")
    ) {
      return "/media/wellness-aroma.svg";
    }
    return "/media/wellness-hero.svg";
  }
  if (haystack.includes("utensilio")) {
    return "/media/photo-product-utensilios.jpg";
  }
  if (haystack.includes("set")) {
    return "/media/photo-product-set-granito.jpg";
  }
  if (haystack.includes("24")) {
    return "/media/photo-product-olla-24.jpg";
  }
  if (haystack.includes("20")) {
    return "/media/photo-product-olla-20.jpg";
  }
  if (haystack.includes("18")) {
    return "/media/photo-product-olla-20.jpg";
  }
  if (haystack.includes("cuchillo")) {
    return "/media/photo-product-utensilios.jpg";
  }
  if (haystack.includes("sarten")) {
    return "/media/photo-detalle-wok.jpg";
  }
  if (haystack.includes("wok")) {
    return "/media/photo-receta-wok.jpg";
  }
  return "/media/photo-hero-cocina.jpg";
}

function placeholderForProduct(product: Product) {
  if (!isGeneratedPlaceholder(product.imageUrl)) return localMediaUrl(product.imageUrl);
  return generatedImageForProduct(product);
}

const kitchenTerms = [
  "cocina",
  "olla",
  "ollas",
  "wok",
  "woks",
  "sarten",
  "sartenes",
  "set",
  "granito",
  "mgc",
  "teflon",
  "pfoa",
  "pfas",
  "ptfe",
  "menos aceite",
  "granito real",
  "familia",
  "utensilio",
  "utensilios",
  "complemento",
  "cuchillo",
  "cuchillos",
];

function isKitchenProduct(product: Product) {
  if (product.vertical === "cocina") return true;
  if (product.vertical === "bienestar") return false;
  if (product.sku.startsWith("COC-") || product.sku.startsWith("MGC-")) {
    return true;
  }
  const haystack = [
    product.title,
    product.description,
    product.category,
    product.brand,
    product.material || "",
    product.coating || "",
    product.tipoCocina || "",
    product.bundleUseCase || "",
    product.healthAngle || "",
    ...(product.sourceUrls || []),
    ...(product.contentAngles || []),
    ...product.tags,
  ]
    .join(" ")
    .toLowerCase();
  return kitchenTerms.some((term) => haystack.includes(term));
}

const wellnessTerms = [
  "bienestar",
  "wellness",
  "yoga",
  "mat",
  "botella",
  "termo",
  "hidratacion",
  "bowl",
  "te",
  "ceramica",
  "aroma",
  "calma",
  "pausa",
  "autocuidado",
  "movimiento",
  "mandala",
  "meditacion",
  "cuenco",
  "tambor",
  "pendulo",
  "chakras",
  "lampara",
  "plata",
  "amuleto",
  "ganesha",
  "humo",
  "himalaya",
  "masaje",
  "percusion",
  "rutina",
  "decoracion",
  "lifestyle",
];

function isWellnessProduct(product: Product) {
  if (product.vertical === "bienestar") return true;
  if (product.vertical === "cocina") return false;
  if (product.sku.startsWith("BIEN-")) return true;
  const haystack = [
    product.title,
    product.description,
    product.category,
    product.brand,
    product.material || "",
    product.bundleUseCase || "",
    product.healthAngle || "",
    ...(product.sourceUrls || []),
    ...(product.contentAngles || []),
    ...product.tags,
  ]
    .join(" ")
    .toLowerCase();
  return wellnessTerms.some((term) => haystack.includes(term));
}

function normalizeProduct(
  product: Product,
  vertical: "cocina" | "bienestar" = "cocina",
): Product {
  const isComplement = product.category.toLowerCase().includes("complement");
  const isWellness =
    vertical === "bienestar" || product.vertical === "bienestar";

  return {
    ...product,
    vertical: product.vertical || vertical,
    brand:
      product.brand || (isWellness ? "Eter Niu Bienestar" : "Eter Niu Cocina"),
    imageUrl: placeholderForProduct(product),
    deliveryBadge: product.deliveryBadge || defaultFreeShippingLabel,
    freeShipping: product.freeShipping ?? true,
    paymentMethods: product.paymentMethods?.length
      ? product.paymentMethods
      : defaultPaymentMethods,
    couponCode: product.couponCode || defaultCouponCode,
    stoveCompatibility:
      product.stoveCompatibility ||
      (isWellness
        ? "No aplica"
        : isComplement
          ? "No aplica; cuida ollas de granito"
          : defaultStoveCompatibility),
    tags: product.tags || [],
  };
}

async function fetchProducts(vertical?: "cocina" | "bienestar") {
  const toolsUrl =
    process.env.TOOLS_API_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_TOOLS_API_URL ||
    "http://localhost:8787";

  try {
    const headers: Record<string, string> = {};
    if (process.env.TOOLS_API_TOKEN) {
      headers.authorization = `Bearer ${process.env.TOOLS_API_TOKEN}`;
    }

    const url = new URL("/tools/search-products", toolsUrl);
    url.searchParams.set("limit", "100");
    if (vertical) url.searchParams.set("vertical", vertical);
    const response = await fetch(url, {
      cache: "no-store",
      headers,
    });
    if (!response.ok) throw new Error("tools unavailable");
    const data = (await response.json()) as { products?: Product[] };
    return data.products || [];
  } catch {
    return undefined;
  }
}

export async function getProductsForVertical(vertical: "cocina" | "bienestar") {
  const allowDemoCatalog =
    process.env.ALLOW_DEMO_CATALOG === "true" ||
    process.env.NEXT_PUBLIC_ALLOW_DEMO_CATALOG === "true" ||
    process.env.NODE_ENV !== "production";
  const fallback =
    vertical === "bienestar" ? wellnessFallbackProducts : fallbackProducts;
  const products = await fetchProducts(vertical);

  if (products) {
    const verticalProducts = products
      .filter(vertical === "bienestar" ? isWellnessProduct : isKitchenProduct)
      .map((product) => normalizeProduct(product, vertical));
    return verticalProducts.length
      ? verticalProducts
      : allowDemoCatalog
        ? fallback.map((product) => normalizeProduct(product, vertical))
        : [];
  }

  return allowDemoCatalog
    ? fallback.map((product) => normalizeProduct(product, vertical))
    : [];
}

export async function getProducts() {
  return getProductsForVertical("cocina");
}

export async function getWellnessProducts() {
  return getProductsForVertical("bienestar");
}

export async function getAllProducts() {
  const allowDemoCatalog =
    process.env.ALLOW_DEMO_CATALOG === "true" ||
    process.env.NEXT_PUBLIC_ALLOW_DEMO_CATALOG === "true" ||
    process.env.NODE_ENV !== "production";
  const products = await fetchProducts();

  if (products) {
    const normalized = products.map((product) =>
      normalizeProduct(
        product,
        isWellnessProduct(product) ? "bienestar" : "cocina",
      ),
    );
    return normalized.length
      ? normalized
      : allowDemoCatalog
        ? [
            ...fallbackProducts.map((product) => normalizeProduct(product)),
            ...wellnessFallbackProducts.map((product) =>
              normalizeProduct(product, "bienestar"),
            ),
          ]
        : [];
  }

  return allowDemoCatalog
    ? [
        ...fallbackProducts.map((product) => normalizeProduct(product)),
        ...wellnessFallbackProducts.map((product) =>
          normalizeProduct(product, "bienestar"),
        ),
      ]
    : [];
}

export async function getProductBySlug(slug: string) {
  const products = await getAllProducts();
  const normalizedSlug = decodeURIComponent(slug);
  return products.find((product) => productSlug(product) === normalizedSlug);
}
