import Fastify from "fastify"
import cors from "@fastify/cors"
import { loadConfig } from "./config.js"
import { createCommerceService } from "./service.js"
import { authHook } from "./auth.js"
import {
  customerEventInputSchema,
  customerImportSchema,
  metaDraftInputSchema,
  orderInputSchema,
  payphoneInputSchema,
  payphoneWebhookSchema,
  quoteInputSchema,
} from "./contracts.js"

const config = loadConfig()
const service = createCommerceService(config)
const app = Fastify({ logger: true })

await app.register(cors, {
  origin: true,
})

app.addHook("preHandler", authHook(config))

app.get("/healthz", async () => ({
  ok: true,
  service: "b2b-ecommerce-tools",
  medusaStoreApiUrl: config.medusaStoreApiUrl,
  crmBackend: config.crmBackend,
  allowDemoCatalog: config.allowDemoCatalog,
  medusaAdminApiKeyConfigured: Boolean(config.medusaAdminApiKey),
  payphoneMode: config.payphoneDryRun ? "dry-run" : "live",
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

app.get("/feeds/meta/catalog.csv", async (_request, reply) => {
  const csv = await service.metaCatalogCsv()
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

try {
  await app.listen({ port: config.port, host: "0.0.0.0" })
} catch (error) {
  app.log.error(error)
  process.exit(1)
}
