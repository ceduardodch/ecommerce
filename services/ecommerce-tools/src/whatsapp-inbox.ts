import { mkdir, readFile, rename, writeFile } from "node:fs/promises"
import path from "node:path"
import type { WhatsappMediaReference } from "./whatsapp-media.js"

export type InboxMessage = {
  messageId: string
  waId: string
  timestamp: number
  text: string
  mediaType?: string
  media?: WhatsappMediaReference
}

type InboxRecord = {
  message: InboxMessage
  state: "queued" | "processing" | "completed" | "review"
  updatedAt: number
  reason?: string
  reviewNotified?: boolean
  retryAt?: number
}

const RETENTION_MS = 7 * 24 * 60 * 60 * 1000
const REVIEW_RETRY_MS = 5_000

export class InboxProcessingError extends Error {
  constructor(readonly reason: "reply_failed" | "context_unavailable" | "inbound_not_recorded") {
    super(reason)
  }
}

/**
 * Inbox persistente para la única instancia de ecommerce-tools que usa el volumen.
 * Confirma recepción después de guardar; procesa en orden por conversación.
 * Un trabajo interrumpido puede haber creado un carrito o enviado a Meta: se
 * deriva a una persona, nunca se repite a ciegas. No es una cola distribuida.
 */
export class WhatsappInbox {
  private readonly filePath: string
  private records: InboxRecord[] = []
  private legacyIds = new Set<string>()
  private writes: Promise<unknown> = Promise.resolve()
  private readonly ready: Promise<void>
  private readonly active = new Map<string, Promise<void>>()
  private stopped = true
  private timer?: ReturnType<typeof setInterval>

  constructor(
    private readonly dataDir: string,
    private readonly processMessage: (message: InboxMessage) => Promise<void>,
    private readonly notifyReview: (message: InboxMessage, reason: string) => Promise<void>,
    private readonly onError: (code: string) => void,
  ) {
    this.filePath = path.join(dataDir, "whatsapp-inbox.json")
    this.ready = this.load()
    // Evitar rechazos sin observador antes de que Fastify ejecute onReady.
    void this.ready.catch(() => undefined)
  }

  private async load() {
    try {
      const stored = JSON.parse(await readFile(this.filePath, "utf8"))
      if (stored.version !== 1 || !Array.isArray(stored.records) || stored.records.some(
        (record: InboxRecord) => !record.message?.messageId || !record.message.waId ||
          !["queued", "processing", "completed", "review"].includes(record.state),
      )) throw new Error("invalid_whatsapp_inbox")
      this.records = stored.records
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw new Error("unreadable_whatsapp_inbox")
    }
    try {
      const legacy = JSON.parse(await readFile(path.join(this.dataDir, "whatsapp-webhook-dedupe.json"), "utf8"))
      this.legacyIds = new Set(Object.entries(legacy).filter(
        ([, at]) => typeof at === "number" && at > Date.now() - RETENTION_MS,
      ).map(([id]) => id))
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw new Error("unreadable_whatsapp_dedupe")
    }
  }

  private change(update: (records: InboxRecord[]) => void): Promise<void> {
    const write = this.writes.then(async () => {
      const next = structuredClone(this.records)
      update(next)
      await mkdir(this.dataDir, { recursive: true })
      const temporary = `${this.filePath}.tmp`
      await writeFile(temporary, JSON.stringify({ version: 1, records: next }), { mode: 0o600 })
      await rename(temporary, this.filePath)
      this.records = next
    })
    this.writes = write.catch(() => undefined)
    return write
  }

  async start() {
    await this.ready
    await this.change((records) => {
      for (const record of records) {
        if (record.state === "processing") {
          record.state = "review"
          record.reason = "processing_interrupted"
          record.updatedAt = Date.now()
        }
      }
    })
    this.stopped = false
    this.timer = setInterval(() => this.pump(), REVIEW_RETRY_MS)
    this.timer.unref()
    this.pump()
  }

  async enqueue(messages: InboxMessage[]) {
    await this.ready
    if (!messages.length) return
    if (messages.some((message) => !message.messageId || !message.waId)) {
      throw new Error("invalid_whatsapp_message")
    }
    await this.change((records) => {
      const cutoff = Date.now() - RETENTION_MS
      for (let index = records.length - 1; index >= 0; index--) {
        const record = records[index]
        if (record.updatedAt < cutoff && (record.state === "completed" || record.reviewNotified)) records.splice(index, 1)
      }
      const known = new Set(records.map((record) => record.message.messageId))
      for (const message of [...messages].sort((a, b) => a.timestamp - b.timestamp)) {
        if (known.has(message.messageId) || this.legacyIds.has(message.messageId)) continue
        known.add(message.messageId)
        records.push({ message, state: "queued", updatedAt: Date.now() })
      }
    })
    this.pump()
  }

  private pump() {
    if (this.stopped) return
    for (const record of this.records) {
      if (this.active.size >= 4) break
      const phone = record.message.waId
      if (this.active.has(phone)) continue
      if (record.state !== "queued" && !(record.state === "review" && !record.reviewNotified && (record.retryAt || 0) <= Date.now())) continue
      const task = this.run(record).catch(() => {
        // Un error de persistencia impide saber el estado: detener el consumo.
        this.onError("whatsapp_inbox_storage_failed")
        this.stopped = true
      }).finally(() => {
        this.active.delete(phone)
        this.pump()
      })
      this.active.set(phone, task)
    }
  }

  private async update(id: string, patch: Partial<InboxRecord>) {
    await this.change((records) => {
      const record = records.find((entry) => entry.message.messageId === id)
      if (record) Object.assign(record, patch, { updatedAt: Date.now() })
    })
  }

  private async run(record: InboxRecord) {
    const message = record.message
    const id = message.messageId
    let reason = record.reason || "processing_failed"
    if (record.state === "queued") {
      await this.update(id, { state: "processing" })
      try {
        await this.processMessage(message)
      } catch (error) {
        reason = error instanceof InboxProcessingError ? error.reason : "processing_failed"
        await this.update(id, { state: "review", reason })
      }
      if (this.records.find((entry) => entry.message.messageId === id)?.state === "processing") {
        await this.update(id, { state: "completed", message: { ...message, text: "", media: undefined } })
        return
      }
    }
    try {
      await this.notifyReview(message, reason)
    } catch {
      this.onError("whatsapp_inbox_review_pending")
      await this.update(id, { retryAt: Date.now() + REVIEW_RETRY_MS })
      return
    }
    await this.update(id, { reviewNotified: true, message: { ...message, text: "", media: undefined } })
  }

  async idle() {
    while (this.active.size) await Promise.all(this.active.values())
    await this.writes
  }

  async close() {
    this.stopped = true
    clearInterval(this.timer)
    await this.idle()
  }
}
