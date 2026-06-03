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
  "MGC-OLLA-GRANITO-18",
  "COC-CUCHILLO-SAMURAI-TODO-USO",
]

export const mediaSlots: MediaSlot[] = [
  {
    id: "cuchillo-samurai-hero",
    title: "Cuchillo samurai en preparacion real",
    label: "Video real",
    poster: "/media/photo-cuchillo-samurai-hero.jpg",
    video: "video-cuchillo-samurai-hero.mp4",
    metric: "Producto real cortando ingredientes en cocina diaria",
    cta: "Consultar stock con cupon",
    productSkus: ["COC-CUCHILLO-SAMURAI-TODO-USO"],
    proofPoints: ["$30 oferta", "corte diario", "envio gratis"],
    eventType: "video_interest",
  },
  {
    id: "cuchillo-samurai-corte",
    title: "Prueba de corte en tabla",
    label: "Uso real",
    poster: "/media/photo-cuchillo-samurai-full.jpg",
    video: "video-cuchillo-samurai-corte.mp4",
    metric: "Mira el corte antes de pedirlo por WhatsApp",
    cta: "Reclamar oferta de $30",
    productSkus: ["COC-CUCHILLO-SAMURAI-TODO-USO"],
    proofPoints: ["tomate y ajo", "uso diario", "Servientrega"],
    eventType: "video_interest",
  },
  {
    id: "hero-cocina",
    title: "Mira el wok en una cocina real",
    label: "Video real",
    poster: "/media/photo-hero-cocina.jpg",
    video: "hero-cocina.mp4",
    metric: "Producto real, cocina real y asesoria por WhatsApp",
    cta: "Reclamar cupon del wok",
    productSkus: ["MGC-WOK-GRANITO-32"],
    proofPoints: ["wok MGC", "tapa visible", "cocina real"],
    eventType: "video_interest",
  },
  {
    id: "detalle-wok",
    title: "Mira el granito de cerca",
    label: "Detalle del material",
    poster: "/media/photo-detalle-wok.jpg",
    video: "detalle-wok.mp4",
    metric: "Interior, tapa, base y marca MGC sin filtros",
    cta: "Ver promo del wok",
    productSkus: ["MGC-WOK-GRANITO-32"],
    proofPoints: ["granito", "tapa", "base MGC"],
    eventType: "video_interest",
  },
  {
    id: "uso-diario-gas",
    title: "Uso diario en cocina real",
    label: "En hornilla",
    poster: "/media/photo-uso-diario-gas.jpg",
    video: "uso-diario-gas.mp4",
    metric: "Una olla trabajando en gas, sin escena montada",
    cta: "Preguntar por olla familiar",
    productSkus: ["MGC-OLLA-GRANITO-20", "MGC-OLLA-GRANITO-18"],
    proofPoints: ["gas", "olla en uso", "cocina diaria"],
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
  {
    id: "set-mgc",
    title: "Set MGC completo sobre mesa",
    label: "Combo familiar",
    poster: "/media/photo-product-set-granito.jpg",
    video: "set-mgc.mp4",
    metric: "Mira el set antes de armar combo por WhatsApp",
    cta: "Armar combo con cupon",
    productSkus: ["MGC-WOK-GRANITO-32", "MGC-OLLA-GRANITO-20"],
    proofPoints: ["set", "tapas", "mangos"],
    eventType: "video_interest",
  },
]

export const editorialTiles: EditorialTile[] = [
  {
    id: "mesa-diaria",
    eyebrow: "Para todos los dias",
    title: "Una olla que se queda en la cocina, no guardada.",
    text: "Bonita para dejarla afuera, practica para arroz, guisos y salteados.",
    poster: "/media/photo-editorial-mesa.jpg",
    cta: "Ver recomendacion",
    productSkus: ["MGC-OLLA-GRANITO-20", "MGC-WOK-GRANITO-32"],
  },
  {
    id: "combo-familiar",
    eyebrow: "Bundle inteligente",
    title: "Cambia tu cocina por piezas, no por impulso.",
    text: "Te guiamos entre wok, olla o set segun cuantas personas comen en casa.",
    poster: "/media/photo-product-set-granito.jpg",
    cta: "Armar combo",
    productSkus: ["MGC-WOK-GRANITO-32", "MGC-OLLA-GRANITO-18"],
  },
  {
    id: "cuidado",
    eyebrow: "Postventa",
    title: "Cuidado simple para que el granito dure mas.",
    text: "Utensilios suaves, fuego medio, limpieza correcta y recordatorio por WhatsApp.",
    poster: "/media/photo-product-utensilios.jpg",
    cta: "Recibir guia",
    productSkus: ["COC-CUCHILLO-SAMURAI-TODO-USO"],
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
    fallbackPoster: "/media/photo-product-olla-20.jpg",
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
