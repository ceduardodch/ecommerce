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
      input: expect.stringContaining("Olla de granito"),
    })
  })
})
