import { describe, expect, it, vi } from "vitest"
import { loadConfig } from "../src/config.js"
import { createWhatsAppAgentReply } from "../src/whatsapp-agent.js"

function config(overrides: Record<string, string> = {}) {
  return loadConfig({
    NODE_ENV: "test",
    WHATSAPP_AGENT_MODE: "openai",
    OPENAI_API_KEY: "test-key",
    ...overrides,
  })
}

const products = [{
  id: "p1",
  variantId: "v1",
  sku: "OLLA-01",
  title: "Olla de granito",
  description: "Olla antiadherente",
  category: "ollas",
  brand: "Eter Niu",
  price: { amount: 29.9, currency: "USD" as const },
  stock: 4,
  imageUrl: "",
  productUrl: "https://eter-niu.com/olla",
  tags: [],
}]

describe("createWhatsAppAgentReply", () => {
  it("no llama a OpenAI cuando el agente está apagado", async () => {
    const fetchMock = vi.fn()
    const result = await createWhatsAppAgentReply(
      config({ WHATSAPP_AGENT_MODE: "off" }),
      { text: "hola", products },
      fetchMock as unknown as typeof fetch,
    )
    expect(result).toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("envía catálogo relevante y devuelve texto del agente", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      output: [{ type: "message", content: [{ type: "output_text", text: "Hola, sí tenemos la olla." }] }],
    }), { status: 200 }))

    const result = await createWhatsAppAgentReply(
      config(),
      { text: "Quiero una olla", products },
      fetchMock as unknown as typeof fetch,
    )

    expect(result).toBe("Hola, sí tenemos la olla.")
    expect(fetchMock).toHaveBeenCalledOnce()
    const [url, request] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe("https://api.openai.com/v1/responses")
    expect(request.headers).toMatchObject({ Authorization: "Bearer test-key" })
    expect(JSON.parse(String(request.body))).toMatchObject({
      model: "gpt-5-mini",
      store: false,
      reasoning: { effort: "low" },
      max_output_tokens: 500,
      input: expect.stringContaining("Olla de granito"),
    })
    const payload = JSON.parse(String(request.body)) as { instructions: string }
    expect(payload.instructions).toContain("asistente virtual")
    expect(payload.instructions).toContain("recomienda máximo dos opciones")
    expect(payload.instructions).toContain("Guía el cierre sin presionar")
    expect(payload.instructions).toContain("Ante una objeción")
    expect(payload.instructions).toContain("sin volver a presentarte")
  })

  it("agrega las reglas activas del backoffice al prompt", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      output: [{ type: "message", content: [{ type: "output_text", text: "Te ayudo." }] }],
    }), { status: 200 }))
    const playbookLoader = vi.fn().mockResolvedValue([{
      key: "agent_objecion_precio",
      label: "Objeción: precio",
      body: "Compara solo alternativas del catálogo y no inventes descuentos.",
      active: true,
    }, {
      key: "agent_cierre",
      label: "Cierre",
      body: "No debe aparecer porque está desactivada.",
      active: false,
    }])

    await createWhatsAppAgentReply(config({ CRM_BACKEND: "medusa" }), { text: "Está caro", products }, fetchMock as unknown as typeof fetch, undefined, playbookLoader)

    const payload = JSON.parse(String(fetchMock.mock.calls[0][1].body)) as { instructions: string }
    expect(playbookLoader).toHaveBeenCalledOnce()
    expect(payload.instructions).toContain("Compara solo alternativas")
    expect(payload.instructions).not.toContain("No debe aparecer")
  })

  it("incluye el historial reciente en el prompt y lo usa para interpretar una respuesta corta", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      output: [{ type: "message", content: [{ type: "output_text", text: "Perfecto, para 4 personas te recomiendo la olla 24cm." }] }],
    }), { status: 200 }))

    const result = await createWhatsAppAgentReply(
      config(),
      {
        text: "4",
        products,
        history: [
          { type: "message_in", at: "2026-09-01T10:00:00.000Z", payload: { text: "Hola, quiero una olla" } },
          { type: "message_out", at: "2026-09-01T10:00:05.000Z", payload: { text: "¿Para cuántas personas cocinas?" } },
        ],
      },
      fetchMock as unknown as typeof fetch,
    )

    expect(result).toBe("Perfecto, para 4 personas te recomiendo la olla 24cm.")
    const payload = JSON.parse(String(fetchMock.mock.calls[0][1].body)) as { input: string }
    expect(payload.input).toContain("Historial reciente")
    expect(payload.input).toContain("Vicky: ¿Para cuántas personas cocinas?")
    expect(payload.input).toContain("Cliente: Hola, quiero una olla")
    expect(payload.input).toContain("Mensaje del cliente: 4")
    // El historial va antes del mensaje actual, no después.
    expect(payload.input.indexOf("¿Para cuántas personas cocinas?"))
      .toBeLessThan(payload.input.indexOf("Mensaje del cliente: 4"))
  })

  it("ordena el historial por fecha aunque llegue desordenado (Medusa lo devuelve DESC) y recorta al límite", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      output: [{ type: "message", content: [{ type: "output_text", text: "Ok" }] }],
    }), { status: 200 }))

    // Desordenado a propósito y con más de HISTORY_TURN_LIMIT (10) turnos.
    const history = Array.from({ length: 13 }, (_, i) => ({
      type: (i % 2 === 0 ? "message_in" : "message_out") as const,
      at: new Date(2026, 8, 1, 10, 12 - i).toISOString(),
      payload: { text: `turno-${i}` },
    }))

    await createWhatsAppAgentReply(
      config(),
      { text: "hola", products, history },
      fetchMock as unknown as typeof fetch,
    )

    const payload = JSON.parse(String(fetchMock.mock.calls[0][1].body)) as { input: string }
    // Los 3 turnos más viejos (los últimos del array desordenado, índices 12/11/10)
    // quedan fuera del límite de 10.
    expect(payload.input).not.toContain("turno-12")
    expect(payload.input).not.toContain("turno-11")
    expect(payload.input).not.toContain("turno-10")
    // El más reciente sí entra, y aparece después del más viejo que sí entra.
    expect(payload.input).toContain("turno-0")
    expect(payload.input).toContain("turno-9")
    expect(payload.input.indexOf("turno-9")).toBeLessThan(payload.input.indexOf("turno-0"))
  })

  it("ignora eventos que no son mensajes o que no traen texto", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      output: [{ type: "message", content: [{ type: "output_text", text: "Ok" }] }],
    }), { status: 200 }))

    await createWhatsAppAgentReply(
      config(),
      {
        text: "hola",
        products,
        history: [
          { type: "quote_created", at: "2026-09-01T09:00:00.000Z", payload: { quoteId: "q1" } },
          { type: "message_in", at: "2026-09-01T09:05:00.000Z", payload: {} },
        ],
      },
      fetchMock as unknown as typeof fetch,
    )

    const payload = JSON.parse(String(fetchMock.mock.calls[0][1].body)) as { input: string }
    expect(payload.input).not.toContain("Historial reciente")
  })

  it("consulta el catálogo vivo si una consulta general no tuvo coincidencias", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      output: [{ type: "message", content: [{ type: "output_text", text: "Te muestro opciones." }] }],
    }), { status: 200 }))
    const catalogLoader = vi.fn().mockResolvedValue(products)

    await createWhatsAppAgentReply(
      config(),
      { text: "Quiero ver productos", products: [] },
      fetchMock as unknown as typeof fetch,
      catalogLoader,
    )

    expect(catalogLoader).toHaveBeenCalledWith(expect.objectContaining({
      medusaStoreApiUrl: expect.any(String),
    }))
    expect(JSON.parse(String(fetchMock.mock.calls[0][1].body)).input)
      .toContain("Olla de granito")
  })

  it("limita el catálogo de respaldo a cocina cuando el mensaje pide ollas", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      output: [{ type: "message", content: [{ type: "output_text", text: "Sí tenemos ollas." }] }],
    }), { status: 200 }))
    const wellnessProduct = {
      ...products[0],
      id: "p2",
      variantId: "v2",
      sku: "BIEN-01",
      title: "Pistola de percusión",
      description: "Producto de bienestar",
      category: "bienestar",
      vertical: "bienestar" as const,
    }
    const kitchenProduct = { ...products[0], vertical: "cocina" as const }
    const catalogLoader = vi.fn().mockResolvedValue([wellnessProduct, kitchenProduct])

    await createWhatsAppAgentReply(
      config(),
      { text: "Como si tienes ollas", products: [] },
      fetchMock as unknown as typeof fetch,
      catalogLoader,
    )

    const payload = JSON.parse(String(fetchMock.mock.calls[0][1].body)) as { input: string }
    expect(payload.input).toContain("Olla de granito")
    expect(payload.input).not.toContain("Pistola de percusión")
  })

  it("un cliente que ya compró una olla no recibe la oferta de esa misma olla", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      output: [{ type: "message", content: [{ type: "output_text", text: "Te muestro otras opciones." }] }],
    }), { status: 200 }))
    const otherProduct = { ...products[0], sku: "SARTEN-01", title: "Sartén de granito" }
    const catalogLoader = vi.fn().mockResolvedValue([products[0], otherProduct])

    await createWhatsAppAgentReply(
      config(),
      {
        text: "quiero una olla",
        products, // el único resultado de la búsqueda es justo la olla ya comprada
        customerContext: {
          purchasedProducts: [{
            productId: "p1",
            sku: "OLLA-01",
            title: "Olla de granito",
            quantity: 1,
            purchasedAt: "2026-08-01T00:00:00.000Z",
          }],
        },
      },
      fetchMock as unknown as typeof fetch,
      catalogLoader,
    )

    const payload = JSON.parse(String(fetchMock.mock.calls[0][1].body)) as { input: string }
    // No aparece listada en "Catálogo relevante" (el guion es el formato de
    // cada línea del catálogo); sí se menciona en el bloque de contexto.
    expect(payload.input).not.toContain("- Olla de granito")
    expect(payload.input).toContain("Sartén de granito")
    expect(payload.input).toContain("Ya compró: Olla de granito")
    expect(payload.input).toContain("No le ofrezcas estos mismos productos de nuevo")
  })

  it("cuando el catálogo vivo también trae el producto ya comprado, lo filtra igual", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      output: [{ type: "message", content: [{ type: "output_text", text: "Ok" }] }],
    }), { status: 200 }))
    const otherProduct = { ...products[0], sku: "SARTEN-01", title: "Sartén de granito" }
    const catalogLoader = vi.fn().mockResolvedValue([products[0], otherProduct])

    await createWhatsAppAgentReply(
      config(),
      {
        text: "quiero ver productos",
        products: [], // fuerza el fallback al catálogo vivo
        customerContext: {
          purchasedProducts: [{
            productId: "p1",
            sku: "OLLA-01",
            title: "Olla de granito",
            quantity: 1,
            purchasedAt: "2026-08-01T00:00:00.000Z",
          }],
        },
      },
      fetchMock as unknown as typeof fetch,
      catalogLoader,
    )

    const payload = JSON.parse(String(fetchMock.mock.calls[0][1].body)) as { input: string }
    expect(payload.input).not.toContain("- Olla de granito")
    expect(payload.input).toContain("Sartén de granito")
  })

  it("incluye la etapa y el próximo seguimiento en el contexto, sin romper si faltan compras previas", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      output: [{ type: "message", content: [{ type: "output_text", text: "Ok" }] }],
    }), { status: 200 }))

    await createWhatsAppAgentReply(
      config(),
      {
        text: "hola",
        products,
        customerContext: {
          journeyStage: "cotizacion_pendiente",
          nextFollowupAt: "2026-09-10T15:00:00.000Z",
          followupReason: "recompra_90d",
        },
      },
      fetchMock as unknown as typeof fetch,
    )

    const payload = JSON.parse(String(fetchMock.mock.calls[0][1].body)) as { input: string }
    expect(payload.input).toContain("Contexto del cliente")
    expect(payload.input).toContain("Etapa actual de la conversación: cotizacion_pendiente")
    expect(payload.input).toContain("Tiene un seguimiento programado para 2026-09-10T15:00:00.000Z (motivo: recompra_90d)")
    expect(payload.input).not.toContain("Ya compró")
  })

  it("no agrega bloque de contexto cuando no hay customerContext", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      output: [{ type: "message", content: [{ type: "output_text", text: "Ok" }] }],
    }), { status: 200 }))

    await createWhatsAppAgentReply(
      config(),
      { text: "hola", products },
      fetchMock as unknown as typeof fetch,
    )

    const payload = JSON.parse(String(fetchMock.mock.calls[0][1].body)) as { input: string }
    expect(payload.input).not.toContain("Contexto del cliente")
  })
})
