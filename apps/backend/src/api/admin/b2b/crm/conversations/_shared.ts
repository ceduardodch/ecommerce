import type { MedusaRequest } from "@medusajs/framework/http"

export function conversationActor(req: MedusaRequest) {
  const auth = req as unknown as { auth_context?: { actor_id?: string } }
  return {
    userId: auth.auth_context?.actor_id || "admin",
    userName: "Usuario admin",
  }
}

export function serializeConversation(value: any) {
  return {
    id: value.id,
    phone: value.phone,
    channel: value.channel,
    status: value.status,
    mode: value.mode,
    assignedUserId: value.assigned_user_id,
    assignedUserName: value.assigned_user_name,
    unreadCount: Number(value.unread_count || 0),
    lastMessageAt: value.last_message_at ? new Date(value.last_message_at).toISOString() : undefined,
    lastInboundAt: value.last_inbound_at ? new Date(value.last_inbound_at).toISOString() : undefined,
    closedAt: value.closed_at ? new Date(value.closed_at).toISOString() : undefined,
    metadata: value.metadata || {},
  }
}

export function serializeMessage(value: any) {
  return {
    id: value.id,
    metaMessageId: value.meta_message_id,
    direction: value.direction,
    senderType: value.sender_type,
    senderUserId: value.sender_user_id,
    text: value.text,
    media: value.media_type
      ? {
          type: value.media_type,
          path: value.media_path,
          name: value.media_name,
          mimeType: value.media_mime_type,
          size: value.media_size,
        }
      : undefined,
    status: value.status,
    failedReason: value.failed_reason,
    at: value.meta_timestamp ? new Date(value.meta_timestamp).toISOString() : undefined,
  }
}
