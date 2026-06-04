import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js"
import { loadConfig } from "./config.js"
import { createCommerceService } from "./service.js"
import {
  customerEventInputSchema,
  customerImportSchema,
  metaDraftInputSchema,
  orderInputSchema,
  payphoneInputSchema,
  quoteInputSchema,
  toolsEventInputSchema,
} from "./contracts.js"

const config = loadConfig()
const service = createCommerceService(config)

const server = new Server(
  { name: "b2b-ecommerce-tools", version: "0.1.0" },
  { capabilities: { tools: {} } },
)

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "search_products",
      description:
        "Busca productos por intencion, categoria y rango de precio.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string" },
          category: { type: "string" },
          minPrice: { type: "number" },
          maxPrice: { type: "number" },
          limit: { type: "number" },
          vertical: { type: "string", enum: ["cocina", "bienestar"] },
        },
      },
    },
    {
      name: "quote",
      description:
        "Crea una cotizacion para WhatsApp y registra evento CRM si hay telefono.",
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
      description:
        "Crea una orden conversacional pendiente de pago y registra evento CRM.",
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
    {
      name: "import_customers",
      description: "Importa clientes/compras historicas desde CSV o JSON.",
      inputSchema: {
        type: "object",
        properties: {
          csv: { type: "string" },
          customers: { type: "array" },
        },
      },
    },
    {
      name: "get_customer",
      description: "Busca cliente por telefono para contexto de recompra.",
      inputSchema: {
        type: "object",
        properties: {
          phone: { type: "string" },
        },
        required: ["phone"],
      },
    },
    {
      name: "add_customer_event",
      description:
        "Registra evento CRM: interes producto, WhatsApp abierto, recompra, cuidado, no respuesta, escalamiento u opt-out.",
      inputSchema: {
        type: "object",
        properties: {
          phone: { type: "string" },
          type: { type: "string" },
          at: { type: "string" },
          customer: { type: "object" },
          payload: { type: "object" },
          metadata: { type: "object" },
          nextFollowupAt: { type: "string" },
          followupReason: { type: "string" },
          whatsappConsent: { type: "boolean" },
          tags: { type: "array" },
        },
        required: ["phone", "type"],
      },
    },
    {
      name: "record_event",
      description:
        "Registra un evento web/social/WhatsApp en CRM y, si aplica, lo envia a Meta CAPI.",
      inputSchema: {
        type: "object",
        properties: {
          eventName: { type: "string" },
          eventId: { type: "string" },
          at: { type: "string" },
          sessionId: { type: "string" },
          leadId: { type: "string" },
          source: { type: "string" },
          pageUrl: { type: "string" },
          searchString: { type: "string" },
          cta: { type: "string" },
          placement: { type: "string" },
          customer: { type: "object" },
          product: { type: "object" },
          products: { type: "array" },
          value: { type: "number" },
          currency: { type: "string" },
          attribution: { type: "object" },
          metadata: { type: "object" },
        },
        required: ["eventName"],
      },
    },
    {
      name: "ai_context",
      description:
        "Devuelve contexto comercial del cliente para OpenClaw, incluyendo eventos web y recomendacion de siguiente accion.",
      inputSchema: {
        type: "object",
        properties: {
          phone: { type: "string" },
          leadId: { type: "string" },
          sessionId: { type: "string" },
        },
        required: ["phone"],
      },
    },
    {
      name: "due_followups",
      description:
        "Lista clientes con recompra/seguimiento vencido y mensaje sugerido.",
      inputSchema: {
        type: "object",
        properties: {
          asOf: { type: "string" },
          limit: { type: "number" },
        },
      },
    },
    {
      name: "dashboard",
      description:
        "Resume leads, ordenes pendientes, pagos y followups vencidos.",
      inputSchema: {
        type: "object",
        properties: {
          asOf: { type: "string" },
        },
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
      vertical?: "cocina" | "bienestar"
    }
    const products = await service.products(input)
    return {
      content: [{ type: "text", text: JSON.stringify({ products }, null, 2) }],
    }
  }

  if (request.params.name === "quote") {
    const quote = await service.quote(quoteInputSchema.parse(args))
    return {
      content: [{ type: "text", text: JSON.stringify(quote, null, 2) }],
    }
  }

  if (request.params.name === "create_order") {
    const order = await service.createOrder(orderInputSchema.parse(args))
    return {
      content: [{ type: "text", text: JSON.stringify(order, null, 2) }],
    }
  }

  if (request.params.name === "create_payphone_link") {
    const input = payphoneInputSchema.parse(args)
    const order = await service.createPaymentLink(input.orderId)
    return {
      content: [{ type: "text", text: JSON.stringify(order, null, 2) }],
    }
  }

  if (request.params.name === "meta_post_draft") {
    const draft = await service.metaDraft(metaDraftInputSchema.parse(args))
    return {
      content: [{ type: "text", text: JSON.stringify(draft, null, 2) }],
    }
  }

  if (request.params.name === "import_customers") {
    const result = await service.importCustomers(
      customerImportSchema.parse(args),
    )
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    }
  }

  if (request.params.name === "get_customer") {
    const input = args as { phone?: string }
    if (!input.phone) throw new Error("phone requerido")
    const customer = await service.getCustomer(input.phone)
    return {
      content: [{ type: "text", text: JSON.stringify({ customer }, null, 2) }],
    }
  }

  if (request.params.name === "add_customer_event") {
    const customer = await service.addCustomerEvent(
      customerEventInputSchema.parse(args),
    )
    return {
      content: [{ type: "text", text: JSON.stringify(customer, null, 2) }],
    }
  }

  if (request.params.name === "record_event") {
    const event = await service.recordEvent(toolsEventInputSchema.parse(args))
    return {
      content: [{ type: "text", text: JSON.stringify(event, null, 2) }],
    }
  }

  if (request.params.name === "ai_context") {
    const input = args as { phone?: string; leadId?: string; sessionId?: string }
    if (!input.phone) throw new Error("phone requerido")
    const context = await service.aiContext(input.phone, {
      leadId: input.leadId,
      sessionId: input.sessionId,
    })
    return {
      content: [{ type: "text", text: JSON.stringify(context, null, 2) }],
    }
  }

  if (request.params.name === "due_followups") {
    const input = args as { asOf?: string; limit?: number }
    const customers = await service.dueFollowups(input)
    return {
      content: [{ type: "text", text: JSON.stringify({ customers }, null, 2) }],
    }
  }

  if (request.params.name === "dashboard") {
    const input = args as { asOf?: string }
    const dashboard = await service.dashboard(input)
    return {
      content: [{ type: "text", text: JSON.stringify(dashboard, null, 2) }],
    }
  }

  throw new Error(`Tool not found: ${request.params.name}`)
})

const transport = new StdioServerTransport()
await server.connect(transport)
