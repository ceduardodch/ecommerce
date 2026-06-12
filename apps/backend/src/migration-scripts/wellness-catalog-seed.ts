import { MedusaContainer } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  updateProductsWorkflow,
} from "@medusajs/medusa/core-flows";

type WellnessProduct = {
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
  vertical: "bienestar",
  freeShipping: true,
  paymentMethods: ["transferencia", "deuna", "payphone"],
  couponCode: "BIENESTARHOY",
  stoveCompatibility: "No aplica",
};

const products: WellnessProduct[] = [
  {
    title: "Juegos de te AAA",
    handle: "juegos-de-te-aaa",
    sku: "BIEN-JUEGO-TE-AAA",
    category: "Hogar Zen",
    description: "Juego de te para rituales de mesa, regalos y momentos de pausa en casa.",
    price: 139,
    originalPrice: 139,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-juego-te-japones.jpg",
    metadata: {
        "brand": "Eter Niu Bienestar",
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
        "promoLabel": "Hogar Zen",
        "deliveryBadge": "Envio gratis Ecuador",
        "stockSignal": "Stock por confirmar por WhatsApp",
        "bundleEligible": true,
        "price": 139,
        "originalPrice": 139,
        "stock": 1
    },
  },
  {
    title: "Termo acero inoxidable SUS 304 500 ml",
    handle: "termo-acero-sus304-500ml",
    sku: "BIEN-TERMO-SUS304-500",
    category: "Hogar Zen",
    description: "Termo de acero inoxidable SUS 304 de 500 ml para agua, te o bebidas del dia.",
    price: 20,
    originalPrice: 20,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-termo-sus304.jpg",
    metadata: {
        "brand": "Eter Niu Bienestar",
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
        "promoLabel": "Uso diario",
        "deliveryBadge": "Envio gratis Ecuador",
        "stockSignal": "Stock por confirmar por WhatsApp",
        "bundleEligible": true,
        "price": 20,
        "originalPrice": 20,
        "stock": 1
    },
  },
  {
    title: "Termo de acero SUS304 1000 ml",
    handle: "termo-acero-sus304-1000ml",
    sku: "BIEN-TERMO-SUS304-1000",
    category: "Hogar Zen",
    description: "Termo de acero SUS304 de 1000 ml para llevar bebida durante el dia.",
    price: 28.5,
    originalPrice: 28.5,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-termo-sus304.jpg",
    metadata: {
        "brand": "Eter Niu Bienestar",
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
        "promoLabel": "Uso diario",
        "deliveryBadge": "Envio gratis Ecuador",
        "stockSignal": "Stock por confirmar por WhatsApp",
        "bundleEligible": true,
        "price": 28.5,
        "originalPrice": 28.5,
        "stock": 1
    },
  },
  {
    title: "Yoga Mat Suede 4 mm Premium",
    handle: "yoga-mat-suede-4mm-premium",
    sku: "BIEN-YOGA-MAT-SUEDE-4MM",
    category: "Yoga & Movimiento",
    description: "Mat premium de suede de 4 mm para yoga, estiramiento y movimiento suave.",
    price: 79.99,
    originalPrice: 79.99,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-yoga-mat-suede.jpg",
    metadata: {
        "brand": "Eter Niu Bienestar",
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
        "promoLabel": "Movimiento premium",
        "deliveryBadge": "Envio gratis Ecuador",
        "stockSignal": "Stock por confirmar por WhatsApp",
        "bundleEligible": true,
        "price": 79.99,
        "originalPrice": 79.99,
        "stock": 1
    },
  },
  {
    title: "Meditador Mandala PU Rubber 70 cm",
    handle: "meditador-mandala-pu-rubber-70cm",
    sku: "BIEN-MEDITADOR-MANDALA-70",
    category: "Yoga & Movimiento",
    description: "Meditador mandala de PU rubber de 70 cm para rincones de yoga, meditacion y pausa.",
    price: 33,
    originalPrice: 33,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-meditador-mandala.jpg",
    metadata: {
        "brand": "Eter Niu Bienestar",
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
        "promoLabel": "Pausa visual",
        "deliveryBadge": "Envio gratis Ecuador",
        "stockSignal": "Stock por confirmar por WhatsApp",
        "bundleEligible": true,
        "price": 33,
        "originalPrice": 33,
        "stock": 1
    },
  },
  {
    title: "Pistola de percusion profesional 30 niveles",
    handle: "pistola-percusion-profesional-30-niveles",
    sku: "BIEN-PISTOLA-PERCUSION-PRO",
    category: "Yoga & Movimiento",
    description: "Pistola de percusion profesional con 30 niveles para masaje muscular de rutina.",
    price: 199,
    originalPrice: 199,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-pistola-percusion.jpg",
    metadata: {
        "brand": "Eter Niu Bienestar",
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
        "promoLabel": "Movimiento",
        "deliveryBadge": "Envio gratis Ecuador",
        "stockSignal": "Stock por confirmar por WhatsApp",
        "bundleEligible": true,
        "price": 199,
        "originalPrice": 199,
        "stock": 1
    },
  },
  {
    title: "Cuenco de bronce con grabado sanscrito 8 cm",
    handle: "cuenco-bronce-grabado-sanscrito-8cm",
    sku: "BIEN-CUENCO-BRONCE-8",
    category: "Energia & Bienestar",
    description: "Cuenco de bronce con grabado sanscrito de 8 cm para rituales de sonido.",
    price: 45,
    originalPrice: 45,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-cuenco-bronce.jpg",
    metadata: {
        "brand": "Eter Niu Bienestar",
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
        "promoLabel": "Sonido",
        "deliveryBadge": "Envio gratis Ecuador",
        "stockSignal": "Stock por confirmar por WhatsApp",
        "bundleEligible": true,
        "price": 45,
        "originalPrice": 45,
        "stock": 1
    },
  },
  {
    title: "Cuenco de bronce con grabado sanscrito 9 cm",
    handle: "cuenco-bronce-grabado-sanscrito-9cm",
    sku: "BIEN-CUENCO-BRONCE-9",
    category: "Energia & Bienestar",
    description: "Cuenco de bronce con grabado sanscrito de 9 cm para rituales de sonido.",
    price: 65,
    originalPrice: 65,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-cuenco-bronce.jpg",
    metadata: {
        "brand": "Eter Niu Bienestar",
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
        "promoLabel": "Sonido",
        "deliveryBadge": "Envio gratis Ecuador",
        "stockSignal": "Stock por confirmar por WhatsApp",
        "bundleEligible": true,
        "price": 65,
        "originalPrice": 65,
        "stock": 1
    },
  },
  {
    title: "Tambor de lengua 8 notas",
    handle: "tambor-lengua-8-notas",
    sku: "BIEN-TAMBOR-LENGUA-8-NOTAS",
    category: "Energia & Bienestar",
    description: "Tambor de lengua de 8 notas para sonido ambiental, regalos y pausas personales.",
    price: 65,
    originalPrice: 65,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-tambor-lengua.jpg",
    metadata: {
        "brand": "Eter Niu Bienestar",
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
        "promoLabel": "Sonido",
        "deliveryBadge": "Envio gratis Ecuador",
        "stockSignal": "Stock por confirmar por WhatsApp",
        "bundleEligible": true,
        "price": 65,
        "originalPrice": 65,
        "stock": 1
    },
  },
  {
    title: "Argollas plata 925",
    handle: "argollas-plata-925",
    sku: "BIEN-ARGOLLAS-PLATA-925",
    category: "Tesoros Plata & Acero",
    description: "Argollas de plata 925 para uso diario o regalo especial.",
    price: 43,
    originalPrice: 43,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-aroma.svg",
    metadata: {
        "brand": "Eter Niu Bienestar",
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
        "promoLabel": "Plata 925",
        "deliveryBadge": "Envio gratis Ecuador",
        "stockSignal": "Stock por confirmar por WhatsApp",
        "bundleEligible": true,
        "price": 43,
        "originalPrice": 43,
        "stock": 1
    },
  },
  {
    title: "Dije OM grande",
    handle: "dije-om-grande",
    sku: "BIEN-DIJE-OM-PLATA-925",
    category: "Tesoros Plata & Acero",
    description: "Dije OM grande para regalo, uso personal o practica espiritual.",
    price: 74,
    originalPrice: 74,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-aroma.svg",
    metadata: {
        "brand": "Eter Niu Bienestar",
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
        "promoLabel": "Simbolo OM",
        "deliveryBadge": "Envio gratis Ecuador",
        "stockSignal": "Stock por confirmar por WhatsApp",
        "bundleEligible": true,
        "price": 74,
        "originalPrice": 74,
        "stock": 1
    },
  },
  {
    title: "Amuleto Hindu plata 925",
    handle: "amuleto-hindu-plata-925",
    sku: "BIEN-AMULETO-HINDU-PLATA-925",
    category: "Tesoros Plata & Acero",
    description: "Amuleto hindu de plata 925 para uso personal o regalo.",
    price: 38,
    originalPrice: 38,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-aroma.svg",
    metadata: {
        "brand": "Eter Niu Bienestar",
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
        "promoLabel": "Plata 925",
        "deliveryBadge": "Envio gratis Ecuador",
        "stockSignal": "Stock por confirmar por WhatsApp",
        "bundleEligible": true,
        "price": 38,
        "originalPrice": 38,
        "stock": 1
    },
  },
  {
    title: "Cascadas de humo OM, Ganesha y Torre",
    handle: "cascadas-humo-om-ganesha-torre",
    sku: "BIEN-CASCADA-HUMO-OM-GANESHA-TORRE",
    category: "Energia & Bienestar",
    description: "Cascadas de humo con disenos OM, Ganesha y Torre para ambientar espacios.",
    price: 12,
    originalPrice: 12,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-cascada-humo.jpg",
    metadata: {
        "brand": "Eter Niu Bienestar",
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
        "reorderAfterDays": 45,
        "promoLabel": "Ambiente",
        "deliveryBadge": "Envio gratis Ecuador",
        "stockSignal": "Stock por confirmar por WhatsApp",
        "bundleEligible": true,
        "price": 12,
        "originalPrice": 12,
        "stock": 1
    },
  },
  {
    title: "Pendulo 7 chakras",
    handle: "pendulo-7-chakras",
    sku: "BIEN-PENDULO-7-CHAKRAS",
    category: "Energia & Bienestar",
    description: "Pendulo 7 chakras para practica personal y accesorios energeticos.",
    price: 13.33,
    originalPrice: 13.33,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-aroma.svg",
    metadata: {
        "brand": "Eter Niu Bienestar",
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
        "promoLabel": "7 chakras",
        "deliveryBadge": "Envio gratis Ecuador",
        "stockSignal": "Stock por confirmar por WhatsApp",
        "bundleEligible": true,
        "price": 13.33,
        "originalPrice": 13.33,
        "stock": 1
    },
  },
  {
    title: "Lampara de sal Himalaya 10 kilos grande",
    handle: "lampara-sal-himalaya-10kg-grande",
    sku: "BIEN-LAMPARA-SAL-HIMALAYA-10KG",
    category: "Energia & Bienestar",
    description: "Lampara de sal Himalaya grande de 10 kilos para luz calida y decoracion.",
    price: 65,
    originalPrice: 65,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-lampara-sal.jpg",
    metadata: {
        "brand": "Eter Niu Bienestar",
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
        "promoLabel": "Luz calida",
        "deliveryBadge": "Envio gratis Ecuador",
        "stockSignal": "Stock por confirmar por WhatsApp",
        "bundleEligible": true,
        "price": 65,
        "originalPrice": 65,
        "stock": 1
    },
  },
  {
    title: "Moxas Chinas",
    handle: "moxas-chinas",
    sku: "BIEN-MOXAS-CHINAS",
    category: "Energia & Bienestar",
    description: "Moxas chinas para practica personal supervisada y rituales tradicionales.",
    price: 20,
    originalPrice: 20,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-moxas-chinas.jpg",
    metadata: {
        "brand": "Eter Niu Bienestar",
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
        "reorderAfterDays": 60,
        "promoLabel": "Tradicional",
        "deliveryBadge": "Envio gratis Ecuador",
        "stockSignal": "Stock por confirmar por WhatsApp",
        "bundleEligible": true,
        "price": 20,
        "originalPrice": 20,
        "stock": 1
    },
  },
  {
    title: "Bloques de yoga 3 capas",
    handle: "bloques-yoga-3-capas",
    sku: "BIEN-BLOQUES-YOGA-3-CAPAS",
    category: "Yoga & Movimiento",
    description: "Bloque de yoga de 3 capas para soporte en posturas y estiramiento.",
    price: 15,
    originalPrice: 15,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-mat.svg",
    metadata: {
        "brand": "Eter Niu Bienestar",
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
        "promoLabel": "Soporte yoga",
        "deliveryBadge": "Envio gratis Ecuador",
        "stockSignal": "Stock por confirmar por WhatsApp",
        "bundleEligible": true,
        "price": 15,
        "originalPrice": 15,
        "stock": 1
    },
  },
  {
    title: "Portaincienso horizontal de madera",
    handle: "portaincienso-horizontal-madera",
    sku: "BIEN-PORTAINCIENSO-HORIZONTAL-MADERA",
    category: "Energia & Bienestar",
    description: "Portaincienso horizontal de madera para rutinas de aroma y decoracion.",
    price: 12,
    originalPrice: 12,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-aroma.svg",
    metadata: {
        "brand": "Eter Niu Bienestar",
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
        "promoLabel": "Aroma",
        "deliveryBadge": "Envio gratis Ecuador",
        "stockSignal": "Stock por confirmar por WhatsApp",
        "bundleEligible": true,
        "price": 12,
        "originalPrice": 12,
        "stock": 1
    },
  },
  {
    title: "Cadena hombre rasgado",
    handle: "cadena-hombre-rasgado",
    sku: "BIEN-CADENA-HOMBRE-RASGADO",
    category: "Tesoros Plata & Acero",
    description: "Cadena de hombre estilo rasgado para uso personal o regalo premium.",
    price: 350,
    originalPrice: 350,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-aroma.svg",
    metadata: {
        "brand": "Eter Niu Bienestar",
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
        "promoLabel": "Regalo premium",
        "deliveryBadge": "Envio gratis Ecuador",
        "stockSignal": "Stock por confirmar por WhatsApp",
        "bundleEligible": true,
        "price": 350,
        "originalPrice": 350,
        "stock": 1
    },
  },
  {
    title: "Dijes Animales Galapagos plata 925",
    handle: "dijes-animales-galapagos-plata-925",
    sku: "BIEN-DIJES-ANIMALES-GALAPAGOS-PLATA-925",
    category: "Tesoros Plata & Acero",
    description: "Dijes de animales Galapagos en plata 925 para regalo y uso personal.",
    price: 15,
    originalPrice: 15,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-aroma.svg",
    metadata: {
        "brand": "Eter Niu Bienestar",
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
        "promoLabel": "Plata 925",
        "deliveryBadge": "Envio gratis Ecuador",
        "stockSignal": "Stock por confirmar por WhatsApp",
        "bundleEligible": true,
        "price": 15,
        "originalPrice": 15,
        "stock": 1
    },
  },
  {
    title: "Portaincienso metal",
    handle: "portaincienso-metal",
    sku: "BIEN-PORTAINCIENSO-METAL",
    category: "Energia & Bienestar",
    description: "Portaincienso de metal para aroma, decoracion y uso diario.",
    price: 15,
    originalPrice: 15,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-portaincienso-metal.jpg",
    metadata: {
        "brand": "Eter Niu Bienestar",
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
        "promoLabel": "Aroma",
        "deliveryBadge": "Envio gratis Ecuador",
        "stockSignal": "Stock por confirmar por WhatsApp",
        "bundleEligible": true,
        "price": 15,
        "originalPrice": 15,
        "stock": 1
    },
  },
  {
    title: "Portaincienso vertical de bronce",
    handle: "portaincienso-vertical-bronce",
    sku: "BIEN-PORTAINCIENSO-VERTICAL-BRONCE",
    category: "Energia & Bienestar",
    description: "Portaincienso vertical de bronce para rincones de aroma y decoracion.",
    price: 29.99,
    originalPrice: 29.99,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-portaincienso-metal.jpg",
    metadata: {
        "brand": "Eter Niu Bienestar",
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
        "promoLabel": "Bronce",
        "deliveryBadge": "Envio gratis Ecuador",
        "stockSignal": "Stock por confirmar por WhatsApp",
        "bundleEligible": true,
        "price": 29.99,
        "originalPrice": 29.99,
        "stock": 1
    },
  },
  {
    title: "Saumador de palo Santo en bronce",
    handle: "saumador-palo-santo-bronce",
    sku: "BIEN-SAUMADOR-PALO-SANTO-BRONCE",
    category: "Energia & Bienestar",
    description: "Saumador de bronce para palo santo, aroma y decoracion.",
    price: 39.99,
    originalPrice: 39.99,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-aroma.svg",
    metadata: {
        "brand": "Eter Niu Bienestar",
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
        "promoLabel": "Bronce",
        "deliveryBadge": "Envio gratis Ecuador",
        "stockSignal": "Stock por confirmar por WhatsApp",
        "bundleEligible": true,
        "price": 39.99,
        "originalPrice": 39.99,
        "stock": 1
    },
  },
  {
    title: "Aretes acero inoxidable",
    handle: "aretes-acero-inoxidable",
    sku: "BIEN-ARETES-ACERO-INOXIDABLE",
    category: "Tesoros Plata & Acero",
    description: "Aretes de acero inoxidable para uso diario y regalo.",
    price: 15,
    originalPrice: 15,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-aroma.svg",
    metadata: {
        "brand": "Eter Niu Bienestar",
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
        "promoLabel": "Acero inoxidable",
        "deliveryBadge": "Envio gratis Ecuador",
        "stockSignal": "Stock por confirmar por WhatsApp",
        "bundleEligible": true,
        "price": 15,
        "originalPrice": 15,
        "stock": 1
    },
  },
  {
    title: "Aretes Plata 925",
    handle: "aretes-plata-925",
    sku: "BIEN-ARETES-PLATA-925",
    category: "Tesoros Plata & Acero",
    description: "Aretes de plata 925 para uso diario o regalo especial.",
    price: 33,
    originalPrice: 33,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-aroma.svg",
    metadata: {
        "brand": "Eter Niu Bienestar",
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
        "promoLabel": "Plata 925",
        "deliveryBadge": "Envio gratis Ecuador",
        "stockSignal": "Stock por confirmar por WhatsApp",
        "bundleEligible": true,
        "price": 33,
        "originalPrice": 33,
        "stock": 1
    },
  },
  {
    title: "Argollas de Plata 925",
    handle: "argollas-plata-925-2999",
    sku: "BIEN-ARGOLLAS-PLATA-925-2999",
    category: "Tesoros Plata & Acero",
    description: "Argollas de plata 925 para uso diario o regalo.",
    price: 29.99,
    originalPrice: 29.99,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-aroma.svg",
    metadata: {
        "brand": "Eter Niu Bienestar",
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
        "promoLabel": "Plata 925",
        "deliveryBadge": "Envio gratis Ecuador",
        "stockSignal": "Stock por confirmar por WhatsApp",
        "bundleEligible": true,
        "price": 29.99,
        "originalPrice": 29.99,
        "stock": 1
    },
  },
  {
    title: "Anillos hombre Acero Inoxidable",
    handle: "anillos-hombre-acero-inoxidable",
    sku: "BIEN-ANILLOS-HOMBRE-ACERO",
    category: "Tesoros Plata & Acero",
    description: "Anillos de hombre en acero inoxidable para uso diario.",
    price: 19.99,
    originalPrice: 19.99,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-aroma.svg",
    metadata: {
        "brand": "Eter Niu Bienestar",
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
        "promoLabel": "Acero inoxidable",
        "deliveryBadge": "Envio gratis Ecuador",
        "stockSignal": "Stock por confirmar por WhatsApp",
        "bundleEligible": true,
        "price": 19.99,
        "originalPrice": 19.99,
        "stock": 1
    },
  },
  {
    title: "Anillos Acero Inoxidable mujer ajustables",
    handle: "anillos-acero-inoxidable-mujer-ajustables",
    sku: "BIEN-ANILLOS-MUJER-ACERO-AJUSTABLES",
    category: "Tesoros Plata & Acero",
    description: "Anillos ajustables de acero inoxidable para mujer.",
    price: 9.99,
    originalPrice: 9.99,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-aroma.svg",
    metadata: {
        "brand": "Eter Niu Bienestar",
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
        "promoLabel": "Ajustables",
        "deliveryBadge": "Envio gratis Ecuador",
        "stockSignal": "Stock por confirmar por WhatsApp",
        "bundleEligible": true,
        "price": 9.99,
        "originalPrice": 9.99,
        "stock": 1
    },
  },
  {
    title: "Dije OM Acero inoxidable",
    handle: "dije-om-acero-inoxidable",
    sku: "BIEN-DIJE-OM-ACERO",
    category: "Tesoros Plata & Acero",
    description: "Dije OM de acero inoxidable para accesorio personal o regalo pequeno.",
    price: 5,
    originalPrice: 5,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-aroma.svg",
    metadata: {
        "brand": "Eter Niu Bienestar",
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
        "promoLabel": "Simbolo OM",
        "deliveryBadge": "Envio gratis Ecuador",
        "stockSignal": "Stock por confirmar por WhatsApp",
        "bundleEligible": true,
        "price": 5,
        "originalPrice": 5,
        "stock": 1
    },
  },
  {
    title: "Aretes largos Acero inoxidable plateados",
    handle: "aretes-largos-acero-inoxidable-plateados",
    sku: "BIEN-ARETES-LARGOS-ACERO-PLATEADOS",
    category: "Tesoros Plata & Acero",
    description: "Aretes largos plateados de acero inoxidable para regalo o uso personal.",
    price: 19.99,
    originalPrice: 19.99,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-aroma.svg",
    metadata: {
        "brand": "Eter Niu Bienestar",
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
        "promoLabel": "Plateados",
        "deliveryBadge": "Envio gratis Ecuador",
        "stockSignal": "Stock por confirmar por WhatsApp",
        "bundleEligible": true,
        "price": 19.99,
        "originalPrice": 19.99,
        "stock": 1
    },
  },
  {
    title: "Aretes largos Acero inoxidable dorados",
    handle: "aretes-largos-acero-inoxidable-dorados",
    sku: "BIEN-ARETES-LARGOS-ACERO-DORADOS",
    category: "Tesoros Plata & Acero",
    description: "Aretes largos dorados de acero inoxidable para regalo o uso personal.",
    price: 19.99,
    originalPrice: 19.99,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-aroma.svg",
    metadata: {
        "brand": "Eter Niu Bienestar",
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
        "promoLabel": "Dorados",
        "deliveryBadge": "Envio gratis Ecuador",
        "stockSignal": "Stock por confirmar por WhatsApp",
        "bundleEligible": true,
        "price": 19.99,
        "originalPrice": 19.99,
        "stock": 1
    },
  },
  {
    title: "Aretes Acero Inoxidable oro rosado",
    handle: "aretes-acero-inoxidable-oro-rosado",
    sku: "BIEN-ARETES-ACERO-ORO-ROSADO",
    category: "Tesoros Plata & Acero",
    description: "Aretes color oro rosado de acero inoxidable para uso diario.",
    price: 15,
    originalPrice: 15,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-aroma.svg",
    metadata: {
        "brand": "Eter Niu Bienestar",
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
        "promoLabel": "Oro rosado",
        "deliveryBadge": "Envio gratis Ecuador",
        "stockSignal": "Stock por confirmar por WhatsApp",
        "bundleEligible": true,
        "price": 15,
        "originalPrice": 15,
        "stock": 1
    },
  },
  {
    title: "Aretes pequenos Acero inoxidable",
    handle: "aretes-pequenos-acero-inoxidable",
    sku: "BIEN-ARETES-PEQUENOS-ACERO",
    category: "Tesoros Plata & Acero",
    description: "Aretes pequenos de acero inoxidable para uso diario.",
    price: 9.99,
    originalPrice: 9.99,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-aroma.svg",
    metadata: {
        "brand": "Eter Niu Bienestar",
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
        "promoLabel": "Uso diario",
        "deliveryBadge": "Envio gratis Ecuador",
        "stockSignal": "Stock por confirmar por WhatsApp",
        "bundleEligible": true,
        "price": 9.99,
        "originalPrice": 9.99,
        "stock": 1
    },
  },
  {
    title: "Collares de Quarzos Naturales",
    handle: "collares-quarzos-naturales",
    sku: "BIEN-COLLARES-QUARZOS-NATURALES",
    category: "Tesoros Plata & Acero",
    description: "Collares de quarzos naturales para accesorio personal o regalo.",
    price: 19.99,
    originalPrice: 19.99,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-aroma.svg",
    metadata: {
        "brand": "Eter Niu Bienestar",
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
        "promoLabel": "Quarzos",
        "deliveryBadge": "Envio gratis Ecuador",
        "stockSignal": "Stock por confirmar por WhatsApp",
        "bundleEligible": true,
        "price": 19.99,
        "originalPrice": 19.99,
        "stock": 1
    },
  },
  {
    title: "Velas grandes caja mandala",
    handle: "velas-grandes-caja-mandala",
    sku: "BIEN-VELAS-GRANDES-CAJA-MANDALA",
    category: "Energia & Bienestar",
    description: "Velas grandes en caja mandala para ambientar espacios.",
    price: 4.99,
    originalPrice: 4.99,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-velas-mandala.jpg",
    metadata: {
        "brand": "Eter Niu Bienestar",
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
        "reorderAfterDays": 45,
        "promoLabel": "Ambiente",
        "deliveryBadge": "Envio gratis Ecuador",
        "stockSignal": "Stock por confirmar por WhatsApp",
        "bundleEligible": true,
        "price": 4.99,
        "originalPrice": 4.99,
        "stock": 1
    },
  },
  {
    title: "Velas pequenas caja mandala",
    handle: "velas-pequenas-caja-mandala",
    sku: "BIEN-VELAS-PEQUENAS-CAJA-MANDALA",
    category: "Energia & Bienestar",
    description: "Velas pequenas en caja mandala para ambientar espacios.",
    price: 3.99,
    originalPrice: 3.99,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-velas-mandala.jpg",
    metadata: {
        "brand": "Eter Niu Bienestar",
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
        "reorderAfterDays": 30,
        "promoLabel": "Ambiente",
        "deliveryBadge": "Envio gratis Ecuador",
        "stockSignal": "Stock por confirmar por WhatsApp",
        "bundleEligible": true,
        "price": 3.99,
        "originalPrice": 3.99,
        "stock": 1
    },
  },
  {
    title: "Piedra Alumbre",
    handle: "piedra-alumbre",
    sku: "BIEN-PIEDRA-ALUMBRE",
    category: "Cuidado Personal",
    description: "Piedra alumbre para rutina de cuidado personal, segun uso tradicional.",
    price: 5,
    originalPrice: 5,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-piedra-alumbre.jpg",
    metadata: {
        "brand": "Eter Niu Bienestar",
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
        "reorderAfterDays": 60,
        "promoLabel": "Cuidado personal",
        "deliveryBadge": "Envio gratis Ecuador",
        "stockSignal": "Stock por confirmar por WhatsApp",
        "bundleEligible": true,
        "price": 5,
        "originalPrice": 5,
        "stock": 1
    },
  },
  {
    title: "Lampara de ghee Bronce 100%",
    handle: "lampara-ghee-bronce-100",
    sku: "BIEN-LAMPARA-GHEE-BRONCE",
    category: "Energia & Bienestar",
    description: "Lampara de ghee de bronce para ritual, decoracion y ambiente.",
    price: 11,
    originalPrice: 11,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-lampara-ghee-bronce.jpg",
    metadata: {
        "brand": "Eter Niu Bienestar",
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
        "promoLabel": "Bronce",
        "deliveryBadge": "Envio gratis Ecuador",
        "stockSignal": "Stock por confirmar por WhatsApp",
        "bundleEligible": true,
        "price": 11,
        "originalPrice": 11,
        "stock": 1
    },
  },
  {
    title: "Nataraj Bronce",
    handle: "nataraj-bronce",
    sku: "BIEN-NATARAJ-BRONCE",
    category: "Energia & Bienestar",
    description: "Figura Nataraj de bronce para decoracion y espacios de pausa.",
    price: 55,
    originalPrice: 55,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-nataraj-bronce.jpg",
    metadata: {
        "brand": "Eter Niu Bienestar",
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
        "promoLabel": "Bronce",
        "deliveryBadge": "Envio gratis Ecuador",
        "stockSignal": "Stock por confirmar por WhatsApp",
        "bundleEligible": true,
        "price": 55,
        "originalPrice": 55,
        "stock": 1
    },
  },
  {
    title: "Inciensos Stick Jumbo",
    handle: "inciensos-stick-jumbo",
    sku: "BIEN-INCIENSOS-STICK-JUMBO",
    category: "Energia & Bienestar",
    description: "Inciensos stick jumbo para aroma y ambiente en casa.",
    price: 4.99,
    originalPrice: 4.99,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-incienso-ullas.jpg",
    metadata: {
        "brand": "Eter Niu Bienestar",
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
        "reorderAfterDays": 30,
        "promoLabel": "Aroma",
        "deliveryBadge": "Envio gratis Ecuador",
        "stockSignal": "Stock por confirmar por WhatsApp",
        "bundleEligible": true,
        "price": 4.99,
        "originalPrice": 4.99,
        "stock": 1
    },
  },
  {
    title: "Straps 1.8 metros",
    handle: "straps-18-metros",
    sku: "BIEN-STRAP-1-8M",
    category: "Yoga & Movimiento",
    description: "Strap de 1.8 metros para yoga, estiramiento y movilidad suave.",
    price: 9,
    originalPrice: 9,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-straps.jpg",
    metadata: {
        "brand": "Eter Niu Bienestar",
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
        "promoLabel": "Yoga",
        "deliveryBadge": "Envio gratis Ecuador",
        "stockSignal": "Stock por confirmar por WhatsApp",
        "bundleEligible": true,
        "price": 9,
        "originalPrice": 9,
        "stock": 1
    },
  },
  {
    title: "Straps 3 metros",
    handle: "straps-3-metros",
    sku: "BIEN-STRAP-3M",
    category: "Yoga & Movimiento",
    description: "Strap de 3 metros para yoga, estiramiento y movilidad suave.",
    price: 11,
    originalPrice: 11,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-straps.jpg",
    metadata: {
        "brand": "Eter Niu Bienestar",
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
        "promoLabel": "Yoga",
        "deliveryBadge": "Envio gratis Ecuador",
        "stockSignal": "Stock por confirmar por WhatsApp",
        "bundleEligible": true,
        "price": 11,
        "originalPrice": 11,
        "stock": 1
    },
  },
  {
    title: "Limpiador de Lengua Cobre 100% Virgen hecho a mano",
    handle: "limpiador-lengua-cobre-100-virgen",
    sku: "BIEN-LIMPIADOR-LENGUA-COBRE",
    category: "Cuidado Personal",
    description: "Limpiador de lengua de cobre hecho a mano para rutina diaria de cuidado personal.",
    price: 15,
    originalPrice: 15,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-limpiador-lengua-cobre.jpg",
    metadata: {
        "brand": "Eter Niu Bienestar",
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
        "reorderAfterDays": 60,
        "promoLabel": "Cobre",
        "deliveryBadge": "Envio gratis Ecuador",
        "stockSignal": "Stock por confirmar por WhatsApp",
        "bundleEligible": true,
        "price": 15,
        "originalPrice": 15,
        "stock": 1
    },
  },
  {
    title: "Tetera vidrio 450 ml",
    handle: "tetera-vidrio-450ml",
    sku: "BIEN-TETERA-VIDRIO-450",
    category: "Hogar Zen",
    description: "Tetera de vidrio de 450 ml para infusiones y rituales de mesa.",
    price: 15,
    originalPrice: 15,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-tetera-vidrio-450.jpg",
    metadata: {
        "brand": "Eter Niu Bienestar",
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
        "promoLabel": "Te",
        "deliveryBadge": "Envio gratis Ecuador",
        "stockSignal": "Stock por confirmar por WhatsApp",
        "bundleEligible": true,
        "price": 15,
        "originalPrice": 15,
        "stock": 1
    },
  },
  {
    title: "Incienso Organicos Ullas hechos a mano",
    handle: "incienso-organicos-ullas-hechos-a-mano",
    sku: "BIEN-INCIENSO-ORGANICOS-ULLAS",
    category: "Energia & Bienestar",
    description: "Inciensos organicos Ullas hechos a mano para aroma y ambiente.",
    price: 4.99,
    originalPrice: 4.99,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-incienso-ullas.jpg",
    metadata: {
        "brand": "Eter Niu Bienestar",
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
        "reorderAfterDays": 30,
        "promoLabel": "Aroma",
        "deliveryBadge": "Envio gratis Ecuador",
        "stockSignal": "Stock por confirmar por WhatsApp",
        "bundleEligible": true,
        "price": 4.99,
        "originalPrice": 4.99,
        "stock": 1
    },
  },
  {
    title: "Tetera vidrio 1600 ml con infusor",
    handle: "tetera-vidrio-1600ml-infusor",
    sku: "BIEN-TETERA-VIDRIO-1600-INFUSOR",
    category: "Hogar Zen",
    description: "Tetera de vidrio de 1600 ml con infusor para compartir infusiones.",
    price: 15,
    originalPrice: 15,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-tetera-vidrio-1600.jpg",
    metadata: {
        "brand": "Eter Niu Bienestar",
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
        "promoLabel": "Te",
        "deliveryBadge": "Envio gratis Ecuador",
        "stockSignal": "Stock por confirmar por WhatsApp",
        "bundleEligible": true,
        "price": 15,
        "originalPrice": 15,
        "stock": 1
    },
  },
  {
    title: "Bolsters cuadrados",
    handle: "bolsters-cuadrados",
    sku: "BIEN-BOLSTERS-CUADRADOS",
    category: "Yoga & Movimiento",
    description: "Bolster cuadrado para apoyo en yoga, descanso y estiramiento suave.",
    price: 35,
    originalPrice: 35,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-mat.svg",
    metadata: {
        "brand": "Eter Niu Bienestar",
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
        "promoLabel": "Soporte yoga",
        "deliveryBadge": "Envio gratis Ecuador",
        "stockSignal": "Stock por confirmar por WhatsApp",
        "bundleEligible": true,
        "price": 35,
        "originalPrice": 35,
        "stock": 1
    },
  },
  {
    title: "Juegos de te Japoneses",
    handle: "juegos-de-te-japoneses",
    sku: "BIEN-JUEGOS-TE-JAPONESES",
    category: "Hogar Zen",
    description: "Juego de te japones para mesa, regalos y pausas en casa.",
    price: 39.99,
    originalPrice: 39.99,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-juego-te-japones.jpg",
    metadata: {
        "brand": "Eter Niu Bienestar",
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
        "promoLabel": "Te",
        "deliveryBadge": "Envio gratis Ecuador",
        "stockSignal": "Stock por confirmar por WhatsApp",
        "bundleEligible": true,
        "price": 39.99,
        "originalPrice": 39.99,
        "stock": 1
    },
  },
  {
    title: "Billete 1 Millon",
    handle: "billete-1-millon",
    sku: "BIEN-BILLETE-1-MILLON",
    category: "Energia & Bienestar",
    description: "Billete decorativo de 1 millon para regalo simbolico o detalle.",
    price: 3.5,
    originalPrice: 3.5,
    stock: 1,
    image: "https://bienestar.b2b.com.ec/media/wellness-billete-1-millon.jpg",
    metadata: {
        "brand": "Eter Niu Bienestar",
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
        "promoLabel": "Detalle",
        "deliveryBadge": "Envio gratis Ecuador",
        "stockSignal": "Stock por confirmar por WhatsApp",
        "bundleEligible": true,
        "price": 3.5,
        "originalPrice": 3.5,
        "stock": 1
    },
  },
]

const legacyWellnessHandles = [
  "botella-termica",
  "mat-movimiento",
  "bowl-ceramico",
  "kit-aroma",
];

async function ensureCategories(container: MedusaContainer) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const categoryNames = [
    ...new Set(products.map((product) => product.category)),
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
  seed: WellnessProduct,
  existing: Record<string, any>,
) {
  const variant = existing.variants?.[0];
  if (!variant?.id) return undefined;

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
  ];
}

export default async function wellnessCatalogSeed({
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
  const existingWellnessProducts = products.flatMap((product) => {
    const existing = existingByHandle.get(product.handle);
    return existing ? [{ seed: product, existing }] : [];
  });
  const missingProducts = products.filter(
    (product) => !existingByHandle.has(product.handle),
  );
  const legacyProducts = legacyWellnessHandles.flatMap((handle) => {
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
      `Wellness catalog seed archived ${legacyProducts.length} legacy products.`,
    );
  }

  if (existingWellnessProducts.length) {
    await updateProductsWorkflow(container).run({
      input: {
        products: existingWellnessProducts.map(({ seed, existing }) => ({
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
      `Wellness catalog seed synced ${existingWellnessProducts.length} existing products.`,
    );
  }

  if (!missingProducts.length) {
    logger.info(
      "Wellness catalog seed skipped creation: products already exist.",
    );
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
    `Wellness catalog seed created ${missingProducts.length} products.`,
  );
}
