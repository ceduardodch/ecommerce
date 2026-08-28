/**
 * Plantillas base del CRM (español EC, voz de Vicky).
 *
 * Variables disponibles: {nombre}, {producto}, {dias}.
 * `mediaUrl` es opcional: si se llena desde el admin, el mensaje sale con
 * video/imagen adjunta (ver dispatchFollowup).
 *
 * Las keys deben coincidir con `templateKeyFromReason` de followup-dispatch.
 */
export type CrmTemplateSeed = {
  key: string
  label: string
  body: string
  mediaUrl?: string | null
  mediaType?: "video" | "image" | "document" | null
}

export const DEFAULT_CRM_TEMPLATES: CrmTemplateSeed[] = [
  {
    key: "recompra",
    label: "Recompra (reposición)",
    body:
      "Hola {nombre} 👋 Soy Vicky de Eter Niu. Han pasado {dias} días desde que llevaste tu {producto}. " +
      "¿Te ayudo con la reposición o quieres ver algo nuevo para tu cocina?",
  },
  {
    key: "complemento",
    label: "Complemento (venta cruzada corta)",
    body:
      "Hola {nombre} 👋 Vi que tienes tu {producto}. Tengo piezas que combinan perfecto con eso " +
      "y te rinden el doble en el día a día. ¿Te muestro dos opciones?",
  },
  {
    key: "cuidado",
    label: "Cuidado postventa",
    body:
      "Hola {nombre} 👋 Para que tu {producto} te dure años: fuego medio, utensilios suaves y " +
      "lavado con esponja no abrasiva. ¿Quieres que te pase la guía completa?",
  },
  {
    key: "estacional",
    label: "Campaña estacional",
    body:
      "Hola {nombre} 👋 Preparamos una selección especial de temporada en Eter Niu. " +
      "Te la comparto por aquí si te interesa. ¿Te la envío?",
  },
  {
    key: "cross_sell_cocina",
    label: "Cross-sell hacia cocina",
    body:
      "Hola {nombre} 👋 Además de bienestar, en Eter Niu tenemos línea de cocina en granito " +
      "libre de PFAS. ¿Te muestro lo más pedido?",
  },
  {
    key: "cross_sell_bienestar",
    label: "Cross-sell hacia bienestar",
    body:
      "Hola {nombre} 👋 Ya que cuidas lo que cocinas, tenemos una línea de bienestar que combina " +
      "muy bien con eso. ¿Te comparto lo que más nos piden?",
  },
  {
    key: "nps",
    label: "Encuesta de satisfacción (NPS)",
    body:
      "Hola {nombre} 👋 ¿Cómo te ha ido con tu {producto}? Del 1 al 10, ¿qué tanto nos recomendarías? " +
      "Tu respuesta nos ayuda muchísimo.",
  },
  {
    key: "referido",
    label: "Pedido de referido",
    body:
      "Hola {nombre} 👋 Gracias por confiar en Eter Niu. Si conoces a alguien que quiera cocinar " +
      "sin tóxicos, pásale mi contacto y lo atiendo con gusto.",
  },
  {
    key: "generico",
    label: "Genérico (fallback)",
    body:
      "Hola {nombre} 👋 Soy Vicky de Eter Niu. Tenemos novedades en ollas, sartenes y bienestar. " +
      "¿Te preparo una recomendación según lo que necesitas?",
  },
]
