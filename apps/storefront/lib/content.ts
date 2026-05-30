export type MediaSlot = {
  id: string
  title: string
  label: string
  poster: string
  video: string
  metric: string
  cta: string
  productSkus: string[]
  proofPoints: string[]
  eventType: "video_interest"
}

export type EditorialTile = {
  id: string
  eyebrow: string
  title: string
  text: string
  poster: string
  cta: string
  productSkus: string[]
}

export type ContentMatrixItem = {
  asset: string
  fallbackPoster: string
  section: string
  productSkus: string[]
  cta: string
  crmEventType:
    | "video_interest"
    | "product_interest"
    | "whatsapp_opened"
    | "lead_created"
    | "quiz_completed"
    | "guide_downloaded"
}

export const starProductSkus = [
  "MGC-WOK-GRANITO-32",
  "MGC-OLLA-GRANITO-20",
  "MGC-OLLA-GRANITO-24",
  "MGC-SET-GRANITO-FAMILIAR",
]

export const mediaSlots: MediaSlot[] = [
  {
    id: "hero-cocina",
    title: "Prueba la olla antes de preguntar el precio",
    label: "Video principal",
    poster: "/media/photo-hero-cocina.jpg",
    video: "hero-cocina.mp4",
    metric: "Granito para cocinar rico y lavar facil",
    cta: "Quiero esta recomendacion",
    productSkus: ["MGC-WOK-GRANITO-32", "MGC-SET-GRANITO-FAMILIAR"],
    proofPoints: ["menos aceite", "no se pega", "limpieza facil"],
    eventType: "video_interest",
  },
  {
    id: "prueba-huevo",
    title: "Huevo, queso y nada pegado",
    label: "Prueba real",
    poster: "/media/photo-prueba-huevo.jpg",
    video: "prueba-huevo.mp4",
    metric: "Ideal para ver el antiadherente en accion",
    cta: "Cotizar la prueba",
    productSkus: ["MGC-OLLA-GRANITO-20", "MGC-SARTEN-WOK-GRANITO-28"],
    proofPoints: ["queso", "huevo", "poco aceite"],
    eventType: "video_interest",
  },
  {
    id: "limpieza-rapida",
    title: "Se limpia en minutos",
    label: "Despues de cocinar",
    poster: "/media/photo-limpieza-rapida.jpg",
    video: "limpieza-rapida.mp4",
    metric: "Menos friccion despues de cocinar todos los dias",
    cta: "Preguntar por cuidado",
    productSkus: ["MGC-OLLA-GRANITO-24", "MGC-UTENSILIOS-CUIDADO"],
    proofPoints: ["esponja suave", "fuego medio", "sin raspar"],
    eventType: "video_interest",
  },
  {
    id: "receta-wok",
    title: "Cena completa en wok 32 cm",
    label: "Receta",
    poster: "/media/photo-receta-wok.jpg",
    video: "receta-wok.mp4",
    metric: "Para salteados, shakshuka y porciones familiares",
    cta: "Quiero el wok",
    productSkus: ["MGC-WOK-GRANITO-32"],
    proofPoints: ["32 cm", "familia", "receta completa"],
    eventType: "video_interest",
  },
]

export const editorialTiles: EditorialTile[] = [
  {
    id: "mesa-diaria",
    eyebrow: "Para todos los dias",
    title: "Una olla que se queda en la cocina, no guardada.",
    text: "Bonita para dejarla afuera, practica para huevos, arroz, guisos y salteados.",
    poster: "/media/photo-editorial-mesa.jpg",
    cta: "Ver recomendacion",
    productSkus: ["MGC-OLLA-GRANITO-24", "MGC-WOK-GRANITO-32"],
  },
  {
    id: "combo-familiar",
    eyebrow: "Bundle inteligente",
    title: "Cambia tu cocina por piezas, no por impulso.",
    text: "Te guiamos entre wok, olla o set segun cuantas personas comen en casa.",
    poster: "/media/photo-product-set-granito.jpg",
    cta: "Armar combo",
    productSkus: ["MGC-SET-GRANITO-FAMILIAR"],
  },
  {
    id: "cuidado",
    eyebrow: "Postventa",
    title: "Cuidado simple para que el granito dure mas.",
    text: "Utensilios suaves, fuego medio, limpieza correcta y recordatorio por WhatsApp.",
    poster: "/media/photo-product-utensilios.jpg",
    cta: "Recibir guia",
    productSkus: ["MGC-UTENSILIOS-CUIDADO"],
  },
]

export const approvedTestimonials: Array<{
  name: string
  city: string
  quote: string
  approved: boolean
}> = []

export const contentMatrix: ContentMatrixItem[] = [
  ...mediaSlots.map((slot) => ({
    asset: slot.video,
    fallbackPoster: slot.poster,
    section: `video_${slot.id}`,
    productSkus: slot.productSkus,
    cta: slot.cta,
    crmEventType: slot.eventType,
  })),
  ...editorialTiles.map((tile) => ({
    asset: tile.poster,
    fallbackPoster: tile.poster,
    section: `editorial_${tile.id}`,
    productSkus: tile.productSkus,
    cta: tile.cta,
    crmEventType: "product_interest" as const,
  })),
  {
    asset: "olla-ideal-quiz",
    fallbackPoster: "/media/photo-product-olla-24.jpg",
    section: "olla_ideal_quiz",
    productSkus: starProductSkus,
    cta: "Ver recomendacion",
    crmEventType: "quiz_completed",
  },
  {
    asset: "club-cocina-saludable",
    fallbackPoster: "/media/photo-product-utensilios.jpg",
    section: "club_cocina_saludable",
    productSkus: starProductSkus,
    cta: "Guia + cupon + recordatorios",
    crmEventType: "guide_downloaded",
  },
]

export function mediaSlotForSku(sku?: string) {
  return mediaSlots.find((slot) => sku && slot.productSkus.includes(sku))
}
