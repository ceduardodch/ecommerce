import { describe, expect, it, vi } from "vitest"
import { loadConfig } from "../src/config.js"
import { applyCommerceSettings } from "../src/settings.js"
import { cityFromConversation, commerceHistoryAfterReset, createWhatsAppAgentReply, lockedProductFromHistory, mentionedProducts } from "../src/whatsapp-agent.js"

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
  it("conserva el SKU de la última cotización ante una respuesta corta", () => {
    const other = { ...products[0], id: "p2", variantId: "v2", sku: "PISTOLA-01", title: "Pistola de percusión profesional" }
    const locked = lockedProductFromHistory([products[0], other], [{
      type: "quote_created",
      at: "2026-09-01T20:00:00.000Z",
      payload: { items: [{ sku: "OLLA-01", quantity: 1 }] },
    }])

    expect(locked?.sku).toBe("OLLA-01")
    expect(mentionedProducts("1 x Pistola de percusión profesional", [products[0], other]).map((product) => product.sku))
      .toEqual(["PISTOLA-01"])
  })

  it("encuentra en el catálogo completo el producto mostrado antes de una respuesta corta", async () => {
    const other = { ...products[0], id: "p2", variantId: "v2", sku: "PISTOLA-01", title: "Pistola de percusión profesional" }
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      output: [{ type: "message", content: [{ type: "output_text", text: "¿Confirmas una unidad de la olla?" }] }],
    }), { status: 200 }))
    const catalogLoader = vi.fn().mockResolvedValue([products[0], other])

    await createWhatsAppAgentReply(
      config(),
      {
        text: "1",
        // Simula una búsqueda pobre para el texto corto: devolvió bienestar,
        // aunque el turno anterior había fijado una olla.
        products: [other],
        history: [{
          type: "message_out",
          at: "2026-09-01T20:00:00.000Z",
          payload: { text: "Te recomiendo la Olla de granito. ¿Cuántas unidades quieres?" },
        }],
      },
      fetchMock as unknown as typeof fetch,
      catalogLoader,
    )

    const payload = JSON.parse(String(fetchMock.mock.calls[0][1].body)) as { input: string }
    expect(catalogLoader).toHaveBeenCalledOnce()
    expect(payload.input).toContain("Catálogo relevante:\n- Olla de granito")
    expect(payload.input).not.toContain("Catálogo relevante:\n- Pistola de percusión profesional")
  })

  it("descarta una cotización cuando el cliente dice que no pidió ese producto", () => {
    const history = [
      { type: "quote_created", at: "2026-09-01T20:00:00.000Z", payload: { items: [{ sku: "PISTOLA-01" }] } },
      { type: "message_in", at: "2026-09-01T20:01:00.000Z", payload: { text: "Eso no pedí" } },
      { type: "message_in", at: "2026-09-01T20:02:00.000Z", payload: { text: "Quito" } },
    ]

    expect(commerceHistoryAfterReset(history)).toEqual([history[2]])
    expect(commerceHistoryAfterReset(history, "Eso no pedí")).toEqual([])
  })

  it("reconoce una ciudad enviada sola y la deja disponible para el siguiente paso", () => {
    expect(cityFromConversation("Quito")).toBe("Quito")
    expect(cityFromConversation("sí", [{
      type: "message_in",
      at: "2026-09-01T20:00:00.000Z",
      payload: { text: "Quito" },
    }])).toBe("Quito")
  })

  it("bloquea una respuesta que cambia el producto cotizado", async () => {
    const other = { ...products[0], id: "p2", variantId: "v2", sku: "PISTOLA-01", title: "Pistola de percusión profesional" }
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      output: [{ type: "message", content: [{ type: "output_text", text: "1 x Pistola de percusión profesional: $199.00" }] }],
    }), { status: 200 }))
    const diagnostics: unknown[] = []

    const result = await createWhatsAppAgentReply(
      config(),
      {
        text: "1",
        products: [products[0], other],
        history: [{
          type: "quote_created",
          at: "2026-09-01T20:00:00.000Z",
          payload: { items: [{ sku: "OLLA-01", quantity: 1 }] },
        }],
        onDiagnostic: (diagnostic) => { diagnostics.push(diagnostic) },
      },
      fetchMock as unknown as typeof fetch,
    )

    expect(result).toContain("Olla de granito")
    expect(diagnostics).toContainEqual(expect.objectContaining({ event: "product_mismatch_blocked", sku: "PISTOLA-01" }))
  })

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

  it("le dice las DOS formas de pago y dicta la cuenta que cargó el Admin", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      output: [{ type: "message", content: [{ type: "output_text", text: "Te ayudo." }] }],
    }), { status: 200 }))
    const configured = applyCommerceSettings(config(), [
      { key: "pago_banco_nombre", value: "Banco Pichincha", publico: true },
      { key: "pago_banco_titular", value: "Nombre Apellido", publico: true },
      { key: "pago_banco_ruc", value: "1700000000001", publico: true },
      { key: "pago_banco_tipo_cuenta", value: "Ahorros", publico: true },
      { key: "pago_banco_numero", value: "1234567890", publico: false },
    ])

    await createWhatsAppAgentReply(configured, { text: "¿Cómo pago?", products }, fetchMock as unknown as typeof fetch)

    const payload = JSON.parse(String(fetchMock.mock.calls[0][1].body)) as { instructions: string }
    expect(payload.instructions).toContain("transferencia")
    expect(payload.instructions).toContain("Datafast")
    expect(payload.instructions).toContain("1234567890")
    expect(payload.instructions).toContain("Nunca prometas pago contra entrega")
  })

  it("sin cuenta cargada, manda a derivar en vez de inventar una", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      output: [{ type: "message", content: [{ type: "output_text", text: "Te ayudo." }] }],
    }), { status: 200 }))

    await createWhatsAppAgentReply(config(), { text: "¿Cómo pago?", products }, fetchMock as unknown as typeof fetch)

    const payload = JSON.parse(String(fetchMock.mock.calls[0][1].body)) as { instructions: string }
    expect(payload.instructions).toContain("Nunca inventes un número de cuenta")
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

describe("createWhatsAppAgentReply — herramientas reales (V-3)", () => {
  const quoteResult = {
    id: "q1",
    lines: [],
    subtotal: { amount: 29.9, currency: "USD" as const },
    tax: { amount: 3.59, currency: "USD" as const },
    total: { amount: 33.49, currency: "USD" as const },
    currency: "USD" as const,
    whatsappMessage: "Olla de granito: $33.49 con impuestos.",
  }

  function functionCallResponse(id: string, callId: string, name: string, args: Record<string, unknown>) {
    return new Response(JSON.stringify({
      id,
      output: [{ type: "function_call", call_id: callId, name, arguments: JSON.stringify(args) }],
    }), { status: 200 })
  }

  function textResponse(id: string, text: string) {
    return new Response(JSON.stringify({
      id,
      output: [{ type: "message", content: [{ type: "output_text", text }] }],
    }), { status: 200 })
  }

  it("no ofrece herramientas si falta phone o commerce", async () => {
    const fetchMock = vi.fn().mockResolvedValue(textResponse("r1", "Hola"))

    await createWhatsAppAgentReply(
      config(),
      { text: "hola", products, phone: "+593987654321" }, // sin commerce
      fetchMock as unknown as typeof fetch,
    )

    const payload = JSON.parse(String(fetchMock.mock.calls[0][1].body)) as { tools?: unknown }
    expect(payload.tools).toBeUndefined()
  })

  it("llama create_cart cuando el cliente confirma, con nombre y ciudad, y devuelve el link", async () => {
    const createCart = vi.fn().mockResolvedValue({ cartUrl: "https://cocina.eter-niu.com/cart?session=abc", expiresAt: "2026-09-02T00:00:00.000Z" })
    const quote = vi.fn()
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(functionCallResponse("r1", "call_1", "create_cart", {
        sku: "OLLA-01",
        quantity: 1,
        customerName: "María",
        city: "Quito",
      }))
      .mockResolvedValueOnce(textResponse("r2", "Listo María, tu carrito: https://cocina.eter-niu.com/cart?session=abc"))

    const result = await createWhatsAppAgentReply(
      config(),
      {
        text: "sí, lo quiero, soy María de Quito",
        products,
        phone: "+593987654321",
        commerce: { quote, createCart },
        history: [{
          type: "quote_created",
          at: "2026-09-01T20:00:00.000Z",
          payload: { items: [{ sku: "OLLA-01", quantity: 1 }] },
        }],
      },
      fetchMock as unknown as typeof fetch,
    )

    expect(result).toContain("carrito")
    expect(createCart).toHaveBeenCalledWith({
      phone: "+593987654321",
      customer: { name: "María", city: "Quito" },
      items: [{ productId: "p1", variantId: "v1", quantity: 1 }],
    })
    expect(quote).not.toHaveBeenCalled()
    expect(fetchMock).toHaveBeenCalledTimes(2)

    // La primera llamada declara las tools; la segunda continúa con
    // previous_response_id y manda el resultado de la tool ejecutada.
    const firstBody = JSON.parse(String(fetchMock.mock.calls[0][1].body)) as { tools?: Array<{ name: string }> }
    expect(firstBody.tools?.map((tool) => tool.name)).toEqual(["quote", "create_cart"])

    const secondBody = JSON.parse(String(fetchMock.mock.calls[1][1].body)) as {
      previous_response_id?: string
      input: Array<{ type: string; call_id: string; output: string }>
    }
    expect(secondBody.previous_response_id).toBe("r1")
    expect(secondBody.input).toEqual([{
      type: "function_call_output",
      call_id: "call_1",
      output: JSON.stringify({ cartUrl: "https://cocina.eter-niu.com/cart?session=abc", expiresAt: "2026-09-02T00:00:00.000Z" }),
    }])
  })

  it("cotiza con quote antes de responder cuando el modelo lo pide", async () => {
    const quote = vi.fn().mockResolvedValue(quoteResult)
    const createCart = vi.fn()
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(functionCallResponse("r1", "call_1", "quote", { sku: "OLLA-01", quantity: 1 }))
      .mockResolvedValueOnce(textResponse("r2", "Con impuestos son $33.49."))

    const result = await createWhatsAppAgentReply(
      config(),
      { text: "cuánto sale con impuestos", products, phone: "+593987654321", commerce: { quote, createCart } },
      fetchMock as unknown as typeof fetch,
    )

    expect(result).toBe("Con impuestos son $33.49.")
    expect(quote).toHaveBeenCalledWith({
      items: [{ productId: "p1", variantId: "v1", quantity: 1 }],
      customer: { phone: "+593987654321" },
      selectionSku: "OLLA-01",
    })
    expect(createCart).not.toHaveBeenCalled()
  })

  it("no ejecuta create_cart si el SKU no existe en el catálogo mostrado", async () => {
    const createCart = vi.fn()
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(functionCallResponse("r1", "call_1", "create_cart", {
        sku: "SKU-INVENTADO",
        quantity: 1,
        customerName: "María",
        city: "Quito",
      }))
      .mockResolvedValueOnce(textResponse("r2", "No encontré ese producto, ¿me confirmas cuál te interesa?"))

    await createWhatsAppAgentReply(
      config(),
      { text: "sí, lo quiero", products, phone: "+593987654321", commerce: { quote: vi.fn(), createCart } },
      fetchMock as unknown as typeof fetch,
    )

    expect(createCart).not.toHaveBeenCalled()
    const secondBody = JSON.parse(String(fetchMock.mock.calls[1][1].body)) as { input: Array<{ output: string }> }
    expect(JSON.parse(secondBody.input[0].output)).toMatchObject({ error: "sku_not_found" })
  })

  it("no crea el carrito si faltan nombre o ciudad, aunque el modelo llame la herramienta", async () => {
    const createCart = vi.fn()
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(functionCallResponse("r1", "call_1", "create_cart", {
        sku: "OLLA-01",
        quantity: 1,
        customerName: "",
        city: "",
      }))
      .mockResolvedValueOnce(textResponse("r2", "¿Me confirmas tu nombre y ciudad para preparar el carrito?"))

    await createWhatsAppAgentReply(
      config(),
      { text: "sí, dale", products, phone: "+593987654321", commerce: { quote: vi.fn(), createCart } },
      fetchMock as unknown as typeof fetch,
    )

    expect(createCart).not.toHaveBeenCalled()
  })

  it("corta al llegar al techo de rondas si el modelo insiste en llamar herramientas", async () => {
    const quote = vi.fn().mockResolvedValue(quoteResult)
    const fetchMock = vi.fn().mockImplementation(() =>
      Promise.resolve(functionCallResponse("r-loop", "call_x", "quote", { sku: "OLLA-01", quantity: 1 })),
    )

    const result = await createWhatsAppAgentReply(
      config(),
      { text: "hola", products, phone: "+593987654321", commerce: { quote, createCart: vi.fn() } },
      fetchMock as unknown as typeof fetch,
    )

    expect(result).toBeNull()
    // 1 llamada inicial + MAX_TOOL_ROUNDS(3) reintentos = 4 llamadas a fetch.
    expect(fetchMock).toHaveBeenCalledTimes(4)
  })
})
