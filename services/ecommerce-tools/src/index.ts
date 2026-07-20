import Fastify from "fastify"
import cors from "@fastify/cors"
import { loadConfig } from "./config.js"
import { createCommerceService } from "./service.js"
import { authHook } from "./auth.js"
import {
  customerEventInputSchema,
  customerImportSchema,
  datafastCheckoutSchema,
  datafastVoidSchema,
  metaDraftInputSchema,
  orderInputSchema,
  payphoneInputSchema,
  payphoneWebhookSchema,
  quoteInputSchema,
  saleFeedbackInputSchema,
  toolsEventInputSchema,
} from "./contracts.js"
import { mountWhatsappWebhookRoutes } from "./whatsapp-webhook.js"
import { mountWhatsappReplyRoute } from "./whatsapp-reply.js"

const config = loadConfig()
const service = createCommerceService(config)
const app = Fastify({ logger: true })

await app.register(cors, {
  origin: true,
})

// Preservar el buffer crudo para /webhooks/whatsapp (validación de firma Meta)
app.addContentTypeParser(
  "application/json",
  { parseAs: "buffer" },
  (request, body, done) => {
    const buf = Buffer.isBuffer(body) ? body : Buffer.from(body as string)
    ;(request as unknown as { rawBodyBuffer: Buffer }).rawBodyBuffer = buf
    try {
      done(null, JSON.parse(buf.toString("utf8")))
    } catch (err) {
      done(err as Error, undefined)
    }
  },
)

app.addHook("preHandler", authHook(config))

app.get("/healthz", async () => ({
  ok: true,
  service: "b2b-ecommerce-tools",
  medusaStoreApiUrl: config.medusaStoreApiUrl,
  crmBackend: config.crmBackend,
  allowDemoCatalog: config.allowDemoCatalog,
  medusaAdminApiKeyConfigured: Boolean(config.medusaAdminApiKey),
  payphoneMode: config.payphoneDryRun ? "dry-run" : "live",
  datafastMode: config.datafastDryRun ? "dry-run" : config.datafastEnv,
  datafastConfigured: Boolean(config.datafastEntityId && config.datafastAccessToken),
}))

app.get("/tools/search-products", async (request) => {
  const query = request.query as Record<string, string | undefined>
  return {
    products: await service.products({
      query: query.query,
      category: query.category,
      minPrice: query.minPrice ? Number(query.minPrice) : undefined,
      maxPrice: query.maxPrice ? Number(query.maxPrice) : undefined,
      limit: query.limit ? Number(query.limit) : undefined,
      vertical:
        query.vertical === "bienestar" || query.vertical === "cocina"
          ? query.vertical
          : undefined,
    }),
  }
})

app.post("/tools/quote", async (request) => {
  const input = quoteInputSchema.parse(request.body)
  return service.quote(input)
})

app.post("/tools/orders", async (request) => {
  const input = orderInputSchema.parse(request.body)
  return service.createOrder(input)
})

app.post("/tools/payphone-link", async (request) => {
  const input = payphoneInputSchema.parse(request.body)
  const order = await service.createPaymentLink(input.orderId)
  return {
    orderId: order.id,
    status: order.status,
    paymentLink: order.paymentLink,
    clientTransactionId: order.clientTransactionId,
  }
})

app.post("/webhooks/payphone", async (request) => {
  const payload = payphoneWebhookSchema.parse(request.body)
  return service.payphoneWebhook(payload)
})

// ─── Datafast (botón de pagos con tarjeta) ───
app.post("/tools/datafast/checkout", async (request) => {
  const input = datafastCheckoutSchema.parse(request.body)
  const ip =
    (request.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    request.ip
  return service.datafastCheckout({
    reference: input.reference,
    items: input.items,
    customer: { ...(input.customer || {}), ip: input.customer?.ip || ip },
  })
})

app.get("/tools/datafast/result", async (request, reply) => {
  const query = request.query as Record<string, string | undefined>
  const checkoutId = query.id || query.checkoutId
  if (!checkoutId) {
    return reply.code(400).send({ error: "missing_checkout_id" })
  }
  return service.datafastResult(checkoutId, query.resourcePath)
})

// Anulación de una transacción aprobada (script de certificación / operación).
app.post("/tools/datafast/void", async (request) => {
  const input = datafastVoidSchema.parse(request.body)
  return service.datafastVoid(input)
})

app.get("/feeds/meta/catalog.csv", async (request, reply) => {
  const query = request.query as Record<string, string | undefined>
  const csv = await service.metaCatalogCsv({
    vertical:
      query.vertical === "bienestar" || query.vertical === "cocina"
        ? query.vertical
        : undefined,
  })
  return reply.type("text/csv; charset=utf-8").send(csv)
})

app.post("/tools/meta-post-draft", async (request) => {
  const input = metaDraftInputSchema.parse(request.body)
  return service.metaDraft(input)
})

app.post("/tools/customers/import", async (request) => {
  const input = customerImportSchema.parse(request.body)
  return service.importCustomers(input)
})

app.get("/tools/customers/:phone", async (request, reply) => {
  const params = request.params as { phone: string }
  const customer = await service.getCustomer(params.phone)
  if (!customer) return reply.code(404).send({ error: "customer_not_found" })
  return { customer }
})

app.post("/tools/customer-events", async (request) => {
  const input = customerEventInputSchema.parse(request.body)
  return { customer: await service.addCustomerEvent(input) }
})

app.post("/tools/events", async (request) => {
  const input = toolsEventInputSchema.parse({
    ...(request.body as Record<string, unknown>),
    userAgent:
      (request.body as { userAgent?: string } | undefined)?.userAgent ||
      request.headers["user-agent"],
    clientIp:
      (request.body as { clientIp?: string } | undefined)?.clientIp ||
      request.ip,
  })
  return service.recordEvent(input)
})

app.post("/tools/sales/payment-proof", async (request) => {
  const input = saleFeedbackInputSchema.parse(request.body)
  return service.recordSaleFeedback({
    ...input,
    status: "payment_proof_received",
  })
})

app.post("/tools/sales/confirm", async (request) => {
  const input = saleFeedbackInputSchema.parse(request.body)
  return service.recordSaleFeedback({
    ...input,
    status: "paid",
  })
})

app.get("/tools/ai-context/customer/:phone", async (request) => {
  const params = request.params as { phone: string }
  const query = request.query as Record<string, string | undefined>
  return service.aiContext(params.phone, {
    leadId: query.leadId,
    sessionId: query.sessionId,
  })
})

app.get("/tools/followups/due", async (request) => {
  const query = request.query as Record<string, string | undefined>
  return {
    customers: await service.dueFollowups({
      asOf: query.asOf,
      limit: query.limit ? Number(query.limit) : undefined,
    }),
  }
})

app.get("/tools/dashboard", async (request) => {
  const query = request.query as Record<string, string | undefined>
  return service.dashboard({ asOf: query.asOf })
})

// WhatsApp Cloud API — webhook entrante (W2)
mountWhatsappWebhookRoutes(
  app,
  config,
  async (input) => {
    return service.addCustomerEvent(input as Parameters<typeof service.addCustomerEvent>[0])
  },
  async (phone) => service.getCustomer(phone) as Promise<{ followup_reason?: string | null } | undefined>,
)

// WhatsApp Cloud API — respuesta libre de Vicky (W3)
mountWhatsappReplyRoute(
  app,
  config,
  async (phone) => service.getCustomer(phone),
  async (input) => {
    return service.addCustomerEvent(input as Parameters<typeof service.addCustomerEvent>[0])
  },
)

try {
  await app.listen({ port: config.port, host: "0.0.0.0" })
} catch (error) {
  app.log.error(error)
  process.exit(1)
}
