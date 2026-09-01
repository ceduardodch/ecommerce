import { EventEmitter } from "node:events"

export type InboxEventName =
  | "conversation.updated"
  | "message.created"
  | "message.status"
  | "assignment.changed"

export type InboxEvent = {
  type: InboxEventName
  conversationId: string
  at: string
}

const emitter = new EventEmitter()
emitter.setMaxListeners(100)

export function publishInboxEvent(event: InboxEvent) {
  emitter.emit("inbox", event)
}

export function subscribeInboxEvent(listener: (event: InboxEvent) => void) {
  emitter.on("inbox", listener)
  return () => emitter.off("inbox", listener)
}
