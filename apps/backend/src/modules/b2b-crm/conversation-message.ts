/**
 * Decide si un evento del CRM debe además quedar como mensaje en el hilo de la
 * conversación, y con qué forma.
 *
 * Vive aparte del servicio porque el servicio depende del runtime de Medusa y
 * no se puede instanciar en un test unitario. Aquí la decisión es lógica pura
 * y sí se puede cubrir.
 *
 * Por qué importa: el acuse de entrega que manda Meta se casa por `wamid`
 * contra la fila del mensaje. Si un envío no deja fila, el acuse no encuentra
 * a qué pegarse y se descarta en silencio. Eso dejaba a las campañas y a los
 * followups como los únicos canales sin telemetría de entrega.
 */

export type ConversationMessageDraft = {
  direction: "in" | "out"
  senderType: "customer" | "ai" | "human" | "system"
  text?: string
  metaMessageId?: string
  status?: string
}

/** Envíos automáticos: campaña masiva y followup del job. */
const OUTBOUND_DISPATCH_TYPES = ["broadcast_sent", "followup_sent"]

/**
 * Devuelve el borrador del mensaje a registrar, o `undefined` si ese tipo de
 * evento no corresponde a un mensaje de WhatsApp.
 *
 * Los eventos encolados (`*_queued`) quedan fuera a propósito: no se envió
 * nada, así que no hay wamid ni mensaje que mostrar en el hilo.
 */
export function conversationMessageFromEvent(
  type: string,
  payload: Record<string, unknown> = {},
): ConversationMessageDraft | undefined {
  const isInbound = type === "message_in"
  const isOutbound = type === "message_out"
  const isDispatch = OUTBOUND_DISPATCH_TYPES.includes(type)

  if (!isInbound && !isOutbound && !isDispatch) return undefined

  return {
    direction: isInbound ? "in" : "out",
    senderType: isInbound
      ? "customer"
      // Una campaña no la escribe Vicky conversando: es un envío automático.
      : isDispatch
        ? "system"
        : (String(payload.senderType || "ai") as "ai" | "human" | "system"),
    // Los despachos guardan el cuerpo en `suggestedMessage`, no en `text`.
    text:
      typeof payload.text === "string"
        ? payload.text
        : typeof payload.suggestedMessage === "string"
          ? payload.suggestedMessage
          : undefined,
    metaMessageId:
      typeof payload.messageId === "string" ? payload.messageId : undefined,
    status: typeof payload.status === "string" ? payload.status : undefined,
  }
}
