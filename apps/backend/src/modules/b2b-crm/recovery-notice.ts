type RecoveryConversation = { id: string; unread_count?: number; assigned_user_id?: string | null }
type RecoveryStore = {
  listCrmInternalNotes: (filters: unknown, config: unknown) => Promise<Array<{ body?: string }>>
  updateCrmConversations: (input: unknown) => Promise<unknown>
  createCrmInternalNotes: (input: unknown) => Promise<unknown>
}

const reasons: Record<string, string> = {
  agent_unavailable: "Vicky no pudo completar la consulta.",
  reply_failed: "No se pudo confirmar el envío de la respuesta. Revisa la conversación antes de reenviar.",
  processing_interrupted: "El servicio se reinició durante la atención. Revisa mensajes, cotizaciones y carritos antes de repetir una acción.",
  context_unavailable: "No se pudo leer el historial del cliente.",
  inbound_not_recorded: "No se pudo completar el registro del mensaje entrante.",
}

/** Nota interna: nunca pasa al envío de WhatsApp ni al historial de la IA. */
export async function recordRecoveryNotice(
  store: RecoveryStore,
  conversation: RecoveryConversation,
  payload: Record<string, unknown>,
) {
  if (typeof payload.messageId !== "string" || !payload.messageId) return
  const reference = `[whatsapp-recovery:${payload.messageId}]`
  const notes = await store.listCrmInternalNotes({ conversation_id: conversation.id }, { take: 100, order: { at: "DESC" } })
  if (notes.some((note) => note.body?.startsWith(reference))) return
  await store.updateCrmConversations({
    id: conversation.id,
    status: conversation.assigned_user_id ? "assigned" : "unassigned",
    unread_count: Math.max(1, Number(conversation.unread_count || 0)),
  })
  const reason = typeof payload.reason === "string" ? reasons[payload.reason] : undefined
  await store.createCrmInternalNotes({
    conversation_id: conversation.id,
    body: [reference, reason || "La atención automática necesita revisión.",
      typeof payload.text === "string" && payload.text ? `Consulta recibida: ${payload.text}` : "",
    ].filter(Boolean).join("\n"),
    author_user_name: "Recuperación de Vicky",
    at: new Date(),
  })
}
