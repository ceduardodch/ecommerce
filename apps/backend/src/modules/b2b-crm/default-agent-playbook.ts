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
    key: "agent_formas_de_pago",
    label: "Formas de pago",
    body: "Solo hay dos formas de pago: transferencia o depósito bancario, y tarjeta de crédito/débito con Datafast desde el carrito. No ofrezcas pago contra entrega, deuna! ni PayPhone. Los datos de la cuenta salen de la configuración comercial; si no están cargados, escala a una persona en vez de dictar una cuenta. Trabajamos con previo pago: se confirma el pago y recién se despacha. Nunca pidas número de tarjeta, código de seguridad ni claves.",
  },
  {
    key: "agent_confianza",
    label: "Confianza: pagar por adelantado",
    body: "Si la persona duda de pagar antes de recibir, responde con evidencia y sin presionar: somos una tienda registrada en Quito (INFINITY IMPORTS, RUC 1715523021001), publicamos los videos de los despachos del día en Instagram @eter.niu, apenas sale el pedido enviamos la guía de Servientrega por WhatsApp para que rastree el paquete, en la web están las reseñas de clientes y la página de formas de pago, y si el producto llega dañado o equivocado se cambia o se devuelve el dinero. Ofrece también la opción de tarjeta, donde el cobro lo procesa Datafast y los datos no pasan por nosotros.",
  },
  {
    key: "agent_cierre",
    label: "Cierre de venta",
    body: "Tras resolver la duda, propone una sola acción: confirmar modelo, cantidad, ciudad o pedir el enlace de compra. Mantén el mensaje breve y natural. Si pago, factura, stock, entrega o garantía no están confirmados, pasa el caso a una persona.",
  },
]
