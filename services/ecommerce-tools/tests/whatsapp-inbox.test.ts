import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { InboxProcessingError, WhatsappInbox, type InboxMessage } from "../src/whatsapp-inbox.js"

describe("WhatsApp inbox", () => {
  let dir: string
  const inboxes: WhatsappInbox[] = []
  const message = (id: string, waId = "593991234567"): InboxMessage => ({ messageId: id, waId, text: "Consulta de prueba", timestamp: 100 })
  const make = (process = vi.fn().mockResolvedValue(undefined), review = vi.fn().mockResolvedValue(undefined)) => {
    const inbox = new WhatsappInbox(dir, process, review, vi.fn())
    inboxes.push(inbox)
    return inbox
  }
  const stored = async () => JSON.parse(await readFile(path.join(dir, "whatsapp-inbox.json"), "utf8"))
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), "etn-inbox-")) })
  afterEach(async () => {
    await Promise.all(inboxes.splice(0).map((inbox) => inbox.close()))
    await rm(dir, { recursive: true, force: true })
  })

  it("persiste antes de procesar y recupera mensajes pendientes tras reiniciar", async () => {
    const first = make()
    await first.enqueue([message("m1")])
    expect((await stored()).records[0].state).toBe("queued")
    await first.close()
    const process = vi.fn().mockResolvedValue(undefined)
    const second = make(process)
    await second.start()
    await second.idle()
    expect(process).toHaveBeenCalledWith(message("m1"))
    expect((await stored()).records[0]).toMatchObject({ state: "completed", message: { text: "" } })
  })

  it("dos solicitudes simultáneas del mismo ID se procesan una vez", async () => {
    const process = vi.fn().mockResolvedValue(undefined)
    const inbox = make(process)
    await inbox.start()
    await Promise.all([inbox.enqueue([message("same")]), inbox.enqueue([message("same")])])
    await inbox.idle()
    expect(process).toHaveBeenCalledOnce()
    await inbox.close()
    const restarted = make(process)
    await restarted.start()
    await restarted.enqueue([message("same")])
    await restarted.idle()
    expect(process).toHaveBeenCalledOnce()
  })

  it("mantiene orden por cliente y permite atender a otro mientras espera", async () => {
    let release!: () => void
    const gate = new Promise<void>((resolve) => { release = resolve })
    const seen: string[] = []
    const process = vi.fn(async (input: InboxMessage) => {
      seen.push(input.messageId)
      if (input.messageId === "first") await gate
    })
    const inbox = make(process)
    await inbox.start()
    await inbox.enqueue([message("first"), message("second"), message("other", "593998765432")])
    await vi.waitFor(() => expect(seen).toContain("other"))
    expect(seen).not.toContain("second")
    release()
    await inbox.idle()
    expect(seen).toEqual(["first", "other", "second"])
  })

  it("un envío fallido queda visible sin repetir acciones de venta", async () => {
    const process = vi.fn().mockRejectedValue(new InboxProcessingError("reply_failed"))
    const review = vi.fn().mockResolvedValue(undefined)
    const inbox = make(process, review)
    await inbox.start()
    await inbox.enqueue([message("failed")])
    await inbox.idle()
    expect(review).toHaveBeenCalledWith(message("failed"), "reply_failed")
    expect((await stored()).records[0]).toMatchObject({ state: "review", reviewNotified: true })
    await inbox.enqueue([message("failed")])
    await inbox.idle()
    expect(process).toHaveBeenCalledOnce()
  })

  it("un proceso interrumpido deriva a humano sin repetir una posible venta", async () => {
    await writeFile(path.join(dir, "whatsapp-inbox.json"), JSON.stringify({ version: 1, records: [
      { message: message("interrupted"), state: "processing", updatedAt: Date.now() },
    ] }))
    const process = vi.fn()
    const review = vi.fn().mockResolvedValue(undefined)
    const inbox = make(process, review)
    await inbox.start()
    await inbox.idle()
    expect(process).not.toHaveBeenCalled()
    expect(review).toHaveBeenCalledWith(message("interrupted"), "processing_interrupted")
  })

  it("recupera la notificación al CRM si el proceso anterior no pudo registrarla", async () => {
    await writeFile(path.join(dir, "whatsapp-inbox.json"), JSON.stringify({ version: 1, records: [
      { message: message("review"), state: "review", reason: "reply_failed", updatedAt: Date.now() },
    ] }))
    const review = vi.fn().mockRejectedValue(new Error("CRM unavailable"))
    const inbox = make(vi.fn(), review)
    await inbox.start()
    await inbox.idle()
    expect((await stored()).records[0].reviewNotified).not.toBe(true)
    await inbox.close()
    const success = vi.fn().mockResolvedValue(undefined)
    const restarted = make(vi.fn(), success)
    await restarted.start()
    // La espera se conserva para no hacer un bucle de reintentos contra el CRM.
    await vi.waitFor(() => expect(success).toHaveBeenCalledOnce(), { timeout: 6500, interval: 100 })
    await restarted.idle()
    expect((await stored()).records[0].reviewNotified).toBe(true)
  }, 8000)

  it("respeta los IDs que ya registró la versión anterior", async () => {
    await writeFile(path.join(dir, "whatsapp-webhook-dedupe.json"), JSON.stringify({ old: Date.now() }))
    const process = vi.fn()
    const inbox = make(process)
    await inbox.start()
    await inbox.enqueue([message("old")])
    await inbox.idle()
    expect(process).not.toHaveBeenCalled()
  })

  it("no descarta silenciosamente una cola dañada", async () => {
    await writeFile(path.join(dir, "whatsapp-inbox.json"), "invalid JSON")
    await expect(make().start()).rejects.toThrow("unreadable_whatsapp_inbox")
  })
})
