import { describe, expect, it } from "vitest"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { loadConfig } from "../src/config.js"
import { demoCatalog } from "../src/demo-catalog.js"
import { buildClientTransactionId } from "../src/payphone.js"
import { buildQuote } from "../src/quote.js"
import { buildMetaCatalogCsv } from "../src/meta.js"
import { createCommerceService } from "../src/service.js"

describe("commerce tools", () => {
  it("builds a quote with tax and WhatsApp copy", () => {
    const config = loadConfig({ ECOMMERCE_TAX_RATE: "0.15" })
    const quote = buildQuote(config, demoCatalog, [
      { productId: "prod-wok-granito-32", quantity: 2 },
    ])

    expect(quote.subtotal.amount).toBe(300)
    expect(quote.tax.amount).toBe(45)
    expect(quote.total.amount).toBe(345)
    expect(quote.whatsappMessage).toContain("PayPhone")
  })

  it("keeps PayPhone client transaction ids within the API Link limit", () => {
    const id = buildClientTransactionId("ETN-THIS-ORDER-ID-IS-LONG")
    expect(id.length).toBeLessThanOrEqual(15)
  })

  it("exports required Meta catalog columns", () => {
    const csv = buildMetaCatalogCsv(demoCatalog)
    expect(csv.split("\n")[0]).toBe(
      "id,title,description,availability,condition,price,link,image_link,brand,sale_price",
    )
    expect(csv).toContain("in stock")
    expect(csv).toContain("MGC-WOK-GRANITO-32,Wok de granito 32 cm con tapa")
    expect(csv).toContain("179.00 USD")
    expect(csv).toContain("150.00 USD")
  })

  it("imports CRM customers and returns due WhatsApp followups", async () => {
    const dataDir = await mkdtemp(join(tmpdir(), "ecommerce-tools-"))
    try {
      const config = loadConfig({
        TOOLS_DATA_DIR: dataDir,
        ECOMMERCE_TAX_RATE: "0.15",
      })
      const service = createCommerceService(config)

      const result = await service.importCustomers({
        customers: [
          {
            phone: "+593 99 111 2222",
            name: "Ana",
            whatsappConsent: true,
            lastPurchaseAt: "2026-05-01T00:00:00.000Z",
            purchasedProducts: [
              {
                productId: "prod-olla-granito-24",
                sku: "MGC-OLLA-GRANITO-24",
                title: "Olla de granito 24 cm familiar",
                quantity: 1,
                purchasedAt: "2026-05-01T00:00:00.000Z",
                reorderAfterDays: 90,
              },
            ],
            suggestedFrequencyDays: 90,
          },
        ],
      })

      expect(result.imported).toBe(1)
      const customer = await service.getCustomer("+593 99 111 2222")
      expect(customer?.phone).toBe("+593991112222")
      expect(customer?.purchasedProducts[0]?.sku).toBe("MGC-OLLA-GRANITO-24")

      const due = await service.dueFollowups({
        asOf: "2026-08-01T00:00:00.000Z",
      })
      expect(due[0]?.suggestedMessage).toContain("compraste")
      expect(due[0]?.reason).toBe("recompra_90d")
      expect(due[0]?.priority).toBe("high")
      expect(due[0]?.recommendedProductSku).toBe("MGC-OLLA-GRANITO-24")
      expect(due[0]?.requiresHumanApproval).toBe(true)

      const dashboard = await service.dashboard({
        asOf: "2026-08-01T00:00:00.000Z",
      })
      expect(dashboard.counts.dueFollowups).toBe(1)
      expect(dashboard.campaignDraftQueue[0]?.phone).toBe("+593991112222")
      expect(dashboard.reorderFollowups[0]?.recommendedProductSku).toBe(
        "MGC-OLLA-GRANITO-24",
      )
    } finally {
      await rm(dataDir, { recursive: true, force: true })
    }
  })

  it("records web events by lead id and exposes them to AI context", async () => {
    const dataDir = await mkdtemp(join(tmpdir(), "ecommerce-events-"))
    try {
      const config = loadConfig({
        TOOLS_DATA_DIR: dataDir,
        PIXEL_ENABLED: "false",
      })
      const service = createCommerceService(config)

      const result = await service.recordEvent({
        eventName: "Lead",
        type: "quiz_completed",
        leadId: "Lead Cocina 123",
        source: "storefront",
        consent: false,
        product: {
          productId: "prod-olla-granito",
          variantId: "variant-olla-granito",
          sku: "COC-OLLA-GRANITO",
          title: "Olla de granito",
          category: "Ollas",
          brand: "Eter Niu Cocina",
          price: 150,
          currency: "USD",
          material: "Granito antiadherente",
          diameterCm: 24,
        },
        value: 150,
        currency: "USD",
        metadata: {
          journeyStage: "lead_nuevo",
          householdPeople: "3-4",
          city: "Quito",
          videoSlot: "detalle-wok",
          productInterestSku: "COC-OLLA-GRANITO",
          recommendedSku: "COC-OLLA-GRANITO",
          followupSequence: ["dia_0_guia", "dia_30_complemento"],
        },
      })

      expect(result.crmStored).toBe(true)
      expect(result.identity).toBe("lead:leadcocina123")
      expect(result.meta.sent).toBe(false)

      const context = await service.aiContext("+593999111222", {
        leadId: "Lead Cocina 123",
      })

      expect(context.webSignals).toHaveLength(1)
      expect(context.webSignals[0]).toMatchObject({
        type: "quiz_completed",
        source: "storefront",
      })
      expect(context.lifecycle).toMatchObject({
        journeyStage: "lead_nuevo",
        productInterestSku: "COC-OLLA-GRANITO",
        city: "Quito",
      })
      expect(context.recommendedNextAction).toContain("producto visto")
    } finally {
      await rm(dataDir, { recursive: true, force: true })
    }
  })

  it("keeps transfer payment proof in CRM review instead of sending Purchase CAPI", async () => {
    const dataDir = await mkdtemp(join(tmpdir(), "ecommerce-proof-"))
    try {
      const config = loadConfig({
        TOOLS_DATA_DIR: dataDir,
        PIXEL_ENABLED: "true",
        META_ACCESS_TOKEN: "test-token",
        META_DATASET_ID: "test-dataset",
      })
      const service = createCommerceService(config)

      const result = await service.recordEvent({
        eventName: "Purchase",
        type: "payment_proof_received",
        leadId: "Lead Pago 456",
        source: "whatsapp",
        consent: true,
        product: {
          productId: "prod-wok-granito-32",
          variantId: "var-wok-granito-32",
          sku: "MGC-WOK-GRANITO-32",
          title: "Wok de granito 32 cm con tapa",
          category: "Woks granito",
          brand: "Eter Niu Cocina",
          price: 150,
          currency: "USD",
          freeShipping: true,
          paymentMethods: ["transferencia", "deuna", "payphone"],
          couponCode: "GRANITOHOY",
          stoveCompatibility: "Gas, induccion y vitroceramica",
        },
        value: 150,
        currency: "USD",
        metadata: {
          paymentMethod: "transferencia",
          requiresHumanApproval: true,
        },
      })

      expect(result.crmStored).toBe(true)
      expect(result.crmEventType).toBe("payment_proof_received")
      expect(result.meta).toEqual({
        sent: false,
        reason: "payment_proof_requires_human_confirmation",
      })

      const context = await service.aiContext("+593999111222", {
        leadId: "Lead Pago 456",
      })
      expect(context.lifecycle.journeyStage).toBe("pago_en_revision")
      expect(context.recommendedNextAction).toContain("Revisar comprobante")
    } finally {
      await rm(dataDir, { recursive: true, force: true })
    }
  })
})
