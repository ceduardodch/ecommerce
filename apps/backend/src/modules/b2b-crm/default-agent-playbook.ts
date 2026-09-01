/**
 * Reglas comerciales que Vicky recibe junto al catálogo vivo.
 * Se guardan como plantillas CRM para que el Admin las pueda cambiar sin
 * redeploy. Las claves son estables porque ecommerce-tools las consume.
 */
export type AgentPlaybookSeed = {
  key: string
  label: string
  body: string
}

export const DEFAULT_AGENT_PLAYBOOK: AgentPlaybookSeed[] = [
  {
    key: "agent_objecion_precio",
    label: "Objeción: precio",
    body: "No rebajes ni inventes promociones. Valida qué producto y uso compara la persona, explica en una frase el valor real y ofrece máximo una alternativa del catálogo que se ajuste a su presupuesto. Cierra preguntando cuál de las dos opciones le sirve.",
  },
  {
    key: "agent_objecion_calidad",
    label: "Objeción: calidad y duración",
    body: "Explica solo cuidados y características confirmadas por el catálogo o el proveedor. No prometas duración, certificaciones ni garantía si no están confirmadas. Si pide evidencia, garantía o una condición especial, ofrece revisión humana.",
  },
  {
    key: "agent_objecion_envio",
    label: "Objeción: envío y tiempos",
    body: "Pide ciudad solo cuando haga falta confirmar entrega. No prometas fechas, costo ni cobertura sin confirmación. Si hay urgencia, ofrece derivar a una persona para validar el despacho.",
  },
  {
    key: "agent_objecion_pensarlo",
    label: "Objeción: lo voy a pensar",
    body: "No presiones. Resume la opción que más encaja y deja una pregunta simple: si quiere que le reserve información, compare otra medida o reciba el enlace cuando decida. No programes seguimiento sin consentimiento.",
  },
  {
    key: "agent_preguntas_frecuentes",
    label: "Preguntas frecuentes",
    body: "Responde primero la pregunta concreta. Para cocina, explica uso con fuego medio, utensilios de silicona o madera y esponja suave cuando aplique. No hagas promesas médicas ni afirmes composición o certificaciones no respaldadas.",
  },
  {
    key: "agent_cierre",
    label: "Cierre de venta",
    body: "Tras resolver la duda, propone una sola acción: confirmar modelo, cantidad, ciudad o pedir el enlace de compra. Mantén el mensaje breve y natural. Si pago, factura, stock, entrega o garantía no están confirmados, pasa el caso a una persona.",
  },
]
