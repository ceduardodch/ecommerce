import type { AppConfig } from "./config.js"
import type { Product } from "./types.js"

type OpenAiResponse = { output?: Array<{ content?: Array<{ type?: string; text?: string }> }> }

function catalogContext(products: Product[]) {
  if (!products.length) return "No hay coincidencias confirmadas en el catálogo."
  return products.map((product) => [
    product.title,
    `precio USD ${product.price.amount.toFixed(2)}`,
    product.stock > 0 ? "disponible" : "sin stock confirmado",
    product.productUrl ? `link ${product.productUrl}` : "",
  ].filter(Boolean).join("; ")).join("\n")
}

function outputText(response: OpenAiResponse) {
  return response.output?.flatMap((item) => item.content || [])
    .filter((item) => item.type === "output_text")
    .map((item) => item.text || "").join("\n").trim() || null
}

/** Respuesta directa de Vicky; el webhook no depende de ningún gateway externo. */
export async function createWhatsAppAgentReply(
  config: AppConfig,
  input: { text: string; products: Product[] },
  fetchImpl: typeof fetch = fetch,
): Promise<string | null> {
  if (config.whatsappAgentMode !== "openai" || !config.openaiApiKey) return null
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 12_000)
  try {
    const response = await fetchImpl("https://api.openai.com/v1/responses", {
      method: "POST", signal: controller.signal,
      headers: { Authorization: `Bearer ${config.openaiApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: config.openaiModel, store: false, reasoning: { effort: "low" }, max_output_tokens: 400,
        instructions: "Eres Vicky, asistente virtual de ventas de Eter Niu. Responde en español de Ecuador, breve y clara. No digas ser humana. Usa solo el catálogo dado: no inventes precio, stock, descuentos, entrega, factura ni garantía. Resuelve primero objeciones y preguntas. Si falta un dato confirmado o el caso es sensible, ofrece pasar a una persona. Recomienda máximo dos productos. Nunca pidas datos de tarjeta; el pago se hace de forma segura en el checkout DataFast.",
        input: `Mensaje del cliente: ${input.text}\n\nCatálogo relevante:\n${catalogContext(input.products)}`,
      }),
    })
    if (!response.ok) return null
    return outputText(await response.json() as OpenAiResponse)
  } catch {
    return null
  } finally { clearTimeout(timeout) }
}
