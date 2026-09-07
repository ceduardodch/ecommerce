import Fastify from "fastify"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { mkdtemp, readFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { loadConfig } from "../src/config.js"
import { mountWhatsappWebhookRoutes, OPT_OUT_CONFIRMATION } from "../src/whatsapp-webhook.js"
import { createWhatsAppAgentReply } from "../src/whatsapp-agent.js"

vi.mock("../src/whatsapp-agent.js", () => ({ createWhatsAppAgentReply: vi.fn() }))

describe("recuperación del webhook", () => {
  let dir: string
  const apps: ReturnType<typeof Fastify>[] = []
  beforeEach(async () => {
    dir = await mkdtemp(path.join(tmpdir(), "etn-recovery-"))
    vi.mocked(createWhatsAppAgentReply).mockReset().mockResolvedValue(null)
  })
  afterEach(async () => {
    await Promise.all(apps.splice(0).map((app) => app.close()))
    await rm(dir, { recursive: true, force: true })
  })
  const payload = { entry: [{ id: "test", changes: [{ field: "messages", value: { messages: [
    { id: "wamid.test", from: "593991234567", timestamp: "1788800400", type: "text", text: { body: "Quiero una olla" } },
  ] } }] }] }
  function setup() {
    const app = Fastify()
    apps.push(app)
    const event = vi.fn().mockResolvedValue({})
    const send = vi.fn().mockResolvedValue({ ok: true })
    const customer = vi.fn().mockResolvedValue({ events: [], metadata: {} })
    const paused = vi.fn().mockResolvedValue(false)
    mountWhatsappWebhookRoutes(app, loadConfig({ TOOLS_DATA_DIR: dir, WHATSAPP_AGENT_MODE: "openai" }), event, customer, vi.fn().mockResolvedValue([]), send, {
      quote: vi.fn(), createCart: vi.fn(),
    }, paused)
    return { app, event, send, customer, paused }
  }

  it("una respuesta vacía registra revisión y responde una vez aunque Meta repita el ID", async () => {
    const { app, event, send } = setup()
    expect((await app.inject({ method: "POST", url: "/webhooks/whatsapp", payload })).statusCode).toBe(200)
    await app.inject({ method: "POST", url: "/webhooks/whatsapp", payload })
    await app.close()
    expect(send).toHaveBeenCalledOnce()
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ text: expect.stringContaining("dejé registrada") }))
    expect(event).toHaveBeenCalledWith(expect.objectContaining({ type: "human_handoff", payload: expect.objectContaining({ reason: "agent_unavailable" }) }))
  })

  it("un rechazo de envío devuelto como ok:false no se registra como completado", async () => {
    const { app, event, send } = setup()
    vi.mocked(createWhatsAppAgentReply).mockResolvedValue("Tenemos una olla para ti.")
    send.mockResolvedValue({ ok: false, status: 502, error: "send_failed" })
    await app.inject({ method: "POST", url: "/webhooks/whatsapp", payload })
    await app.close()
    expect(event).toHaveBeenCalledWith(expect.objectContaining({ type: "human_handoff", payload: expect.objectContaining({ reason: "reply_failed" }) }))
    const stored = JSON.parse(await readFile(path.join(dir, "whatsapp-inbox.json"), "utf8"))
    expect(stored.records[0]).toMatchObject({ state: "review", reviewNotified: true })
    expect(send).toHaveBeenCalledOnce()
  })

  it("si falla el contexto del CRM, evita vender sin historial y registra el caso", async () => {
    const { app, event, send, customer } = setup()
    customer.mockRejectedValue(new Error("unavailable"))
    await app.inject({ method: "POST", url: "/webhooks/whatsapp", payload })
    await app.close()
    expect(send).not.toHaveBeenCalled()
    expect(createWhatsAppAgentReply).not.toHaveBeenCalled()
    expect(event).toHaveBeenCalledWith(expect.objectContaining({ payload: expect.objectContaining({ reason: "context_unavailable" }) }))
  })

  it("si un vendedor toma el caso durante la generación, no envía la respuesta automática", async () => {
    const { app, paused, send } = setup()
    paused.mockResolvedValueOnce(false).mockResolvedValue(true)
    vi.mocked(createWhatsAppAgentReply).mockResolvedValue("Respuesta de prueba")
    await app.inject({ method: "POST", url: "/webhooks/whatsapp", payload })
    await app.close()
    expect(createWhatsAppAgentReply).toHaveBeenCalledOnce()
    expect(send).not.toHaveBeenCalled()
  })

  // La cola reconectó el procesamiento de mensajes entrantes: el handler quedó
  // en otro archivo que el que edita quien arregla la detección de bajas. Si
  // volviera a llamar a `isOptOutText` (sólo palabra clave) en lugar de
  // `isOptOutRequest`, el caso real de la clienta que pidió "Eliminar mi
  // contacto de sus listas" se perdería otra vez y ningún test de función pura
  // lo notaría, porque `isOptOutRequest` seguiría estando bien.
  it("una baja en lenguaje natural se registra y se confirma aunque pase por la cola", async () => {
    const { app, event, send } = setup()
    await app.inject({ method: "POST", url: "/webhooks/whatsapp", payload: { entry: [{ id: "test", changes: [{ field: "messages", value: { messages: [
      { id: "wamid.baja", from: "593991234567", timestamp: "1788800400", type: "text", text: { body: "Eliminar mi contacto de sus listas" } },
    ] } }] }] } })
    await app.close()
    expect(event).toHaveBeenCalledWith(expect.objectContaining({ type: "opt_out" }))
    // Se confirma una vez, con el texto fijo, y no se intenta vender nada más.
    expect(send).toHaveBeenCalledOnce()
    expect(send).toHaveBeenCalledWith({ phone: "+593991234567", text: OPT_OUT_CONFIRMATION })
    expect(createWhatsAppAgentReply).not.toHaveBeenCalled()
  })
})
