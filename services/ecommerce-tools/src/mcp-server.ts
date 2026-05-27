import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js"
import { loadConfig } from "./config.js"
import { createCommerceService } from "./service.js"
import {
  metaDraftInputSchema,
  orderInputSchema,
  payphoneInputSchema,
  quoteInputSchema,
} from "./contracts.js"

const config = loadConfig()
const service = createCommerceService(config)

const server = new Server(
  { name: "b2b-ecommerce-tools", version: "0.1.0" },
  { capabilities: { tools: {} } }
)

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "search_products",
      description: "Busca productos por intencion, categoria y rango de precio.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string" },
          category: { type: "string" },
          minPrice: { type: "number" },
          maxPrice: { type: "number" },
          limit: { type: "number" },
        },
      },
    },
    {
      name: "quote",
      description: "Crea una cotizacion para WhatsApp.",
      inputSchema: {
        type: "object",
        properties: {
          items: { type: "array" },
          customer: { type: "object" },
        },
        required: ["items"],
      },
    },
    {
      name: "create_order",
      description: "Crea una orden conversacional pendiente de pago.",
      inputSchema: {
        type: "object",
        properties: {
          items: { type: "array" },
          customer: { type: "object" },
          source: { type: "string" },
          notes: { type: "string" },
        },
        required: ["items"],
      },
    },
    {
      name: "create_payphone_link",
      description: "Genera un link de pago PayPhone para una orden.",
      inputSchema: {
        type: "object",
        properties: {
          orderId: { type: "string" },
          description: { type: "string" },
        },
        required: ["orderId"],
      },
    },
    {
      name: "meta_post_draft",
      description: "Genera copy para Facebook, Instagram y Marketplace.",
      inputSchema: {
        type: "object",
        properties: {
          productIds: { type: "array" },
          angle: { type: "string" },
          includeMarketplace: { type: "boolean" },
        },
        required: ["productIds"],
      },
    },
  ],
}))

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const args = request.params.arguments || {}

  if (request.params.name === "search_products") {
    const input = args as {
      query?: string
      category?: string
      minPrice?: number
      maxPrice?: number
      limit?: number
    }
    const products = await service.products(input)
    return { content: [{ type: "text", text: JSON.stringify({ products }, null, 2) }] }
  }

  if (request.params.name === "quote") {
    const quote = await service.quote(quoteInputSchema.parse(args))
    return { content: [{ type: "text", text: JSON.stringify(quote, null, 2) }] }
  }

  if (request.params.name === "create_order") {
    const order = await service.createOrder(orderInputSchema.parse(args))
    return { content: [{ type: "text", text: JSON.stringify(order, null, 2) }] }
  }

  if (request.params.name === "create_payphone_link") {
    const input = payphoneInputSchema.parse(args)
    const order = await service.createPaymentLink(input.orderId)
    return { content: [{ type: "text", text: JSON.stringify(order, null, 2) }] }
  }

  if (request.params.name === "meta_post_draft") {
    const draft = await service.metaDraft(metaDraftInputSchema.parse(args))
    return { content: [{ type: "text", text: JSON.stringify(draft, null, 2) }] }
  }

  throw new Error(`Tool not found: ${request.params.name}`)
})

const transport = new StdioServerTransport()
await server.connect(transport)
