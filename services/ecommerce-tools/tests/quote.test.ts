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

    expect(quote.subtotal.amount).toBe(302.4)
    expect(quote.tax.amount).toBe(45.36)
    expect(quote.total.amount).toBe(347.76)
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
    expect(csv).toContain(
      "MGC-WOK-GRANITO-32,Wok 32 cm granito premium antiadherente",
    )
    expect(csv).toContain("151.20 USD")
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
                productId: "prod-olla-granito-20",
                sku: "MGC-OLLA-GRANITO-20",
                title: "Olla de granito 20 cm",
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
      expect(customer?.purchasedProducts[0]?.sku).toBe("MGC-OLLA-GRANITO-20")

      const due = await service.dueFollowups({
        asOf: "2026-08-01T00:00:00.000Z",
      })
      expect(due[0]?.suggestedMessage).toContain("compraste")
      expect(due[0]?.reason).toBe("recompra_90d")
      expect(due[0]?.priority).toBe("high")
      expect(due[0]?.recommendedProductSku).toBe("MGC-OLLA-GRANITO-20")
      expect(due[0]?.requiresHumanApproval).toBe(true)

      const dashboard = await service.dashboard({
        asOf: "2026-08-01T00:00:00.000Z",
      })
      expect(dashboard.counts.dueFollowups).toBe(1)
      expect(dashboard.campaignDraftQueue[0]?.phone).toBe("+593991112222")
      expect(dashboard.reorderFollowups[0]?.recommendedProductSku).toBe(
        "MGC-OLLA-GRANITO-20",
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

  it("accepts campaign CTA clicks and exposes campaign context to AI", async () => {
    const dataDir = await mkdtemp(join(tmpdir(), "ecommerce-campaign-"))
    try {
      const config = loadConfig({
        TOOLS_DATA_DIR: dataDir,
        PIXEL_ENABLED: "false",
      })
      const service = createCommerceService(config)

      const result = await service.recordEvent({
        eventName: "Lead",
        type: "campaign_cta_click",
        leadId: "lead cuchillo samurai 001",
        source: "meta_ads",
        consent: true,
        product: {
          productId: "prod-cuchillo-samurai",
          variantId: "var-cuchillo-samurai",
          sku: "COC-CUCHILLO-SAMURAI-TODO-USO",
          title: "Cuchillo samurai Japones todo uso",
          category: "Cuchillos",
          brand: "MGC",
          price: 34.99,
          currency: "USD",
        },
        value: 34.99,
        currency: "USD",
        metadata: {
          campaignSlug: "cuchillo-samurai-japones-todo-uso",
          productInterestSku: "COC-CUCHILLO-SAMURAI-TODO-USO",
          couponClaimed: true,
          utmSource: "meta",
        },
      })

      expect(result.crmStored).toBe(true)
      expect(result.crmEventType).toBe("campaign_cta_click")

      const context = await service.aiContext("+593999111222", {
        leadId: "lead cuchillo samurai 001",
      })

      expect(context.webSignals[0]).toMatchObject({
        type: "campaign_cta_click",
        source: "meta_ads",
      })
      expect(context.lifecycle).toMatchObject({
        journeyStage: "cotizacion_pendiente",
        productInterestSku: "COC-CUCHILLO-SAMURAI-TODO-USO",
        campaignSlug: "cuchillo-samurai-japones-todo-uso",
        couponClaimed: true,
      })
    } finally {
      await rm(dataDir, { recursive: true, force: true })
    }
  })

  it("records Vicky customer name and city in CRM context", async () => {
    const dataDir = await mkdtemp(join(tmpdir(), "ecommerce-vicky-profile-"))
    try {
      const config = loadConfig({
        TOOLS_DATA_DIR: dataDir,
        PIXEL_ENABLED: "false",
      })
      const service = createCommerceService(config)

      const customer = await service.addCustomerEvent({
        phone: "+593 97 985 4915",
        type: "lead_created",
        source: "vicky_whatsapp",
        customer: {
          name: "Maria Cliente",
          whatsappConsent: true,
        },
        metadata: {
          city: "Cuenca",
          campaignSlug: "cuchillo-samurai-japones-todo-uso",
          leadId: "Lead Cuchillo 777",
          productInterestSku: "COC-CUCHILLO-SAMURAI-TODO-USO",
          journeyStage: "cotizacion_pendiente",
        },
      })

      expect(customer).toMatchObject({
        phone: "+593979854915",
        name: "Maria Cliente",
        whatsappConsent: true,
        metadata: {
          city: "Cuenca",
          productInterestSku: "COC-CUCHILLO-SAMURAI-TODO-USO",
        },
      })

      const context = await service.aiContext("+593 97 985 4915", {
        leadId: "Lead Cuchillo 777",
      })

      expect(context.customer).toMatchObject({
        name: "Maria Cliente",
        metadata: {
          city: "Cuenca",
          journeyStage: "cotizacion_pendiente",
        },
      })
      expect(context.lifecycle).toMatchObject({
        journeyStage: "cotizacion_pendiente",
        productInterestSku: "COC-CUCHILLO-SAMURAI-TODO-USO",
        city: "Cuenca",
        campaignSlug: "cuchillo-samurai-japones-todo-uso",
      })
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

  it("records simple sale feedback by SKU for buyer followup", async () => {
    const dataDir = await mkdtemp(join(tmpdir(), "ecommerce-sale-feedback-"))
    try {
      const config = loadConfig({
        TOOLS_DATA_DIR: dataDir,
        PIXEL_ENABLED: "false",
      })
      const service = createCommerceService(config)

      const proof = await service.recordSaleFeedback({
        status: "payment_proof_received",
        phone: "+593 99 111 2222",
        sku: "MGC-WOK-GRANITO-32",
        amount: 150,
        paymentMethod: "transferencia",
        leadId: "Lead Venta 001",
        customerName: "Ana Compradora",
        campaignSlug: "wok-32-granito",
      })

      expect(proof.crmStored).toBe(true)
      expect(proof.crmEventType).toBe("payment_proof_received")
      expect(proof.meta).toEqual({
        sent: false,
        reason: "payment_proof_requires_human_confirmation",
      })

      const paid = await service.recordSaleFeedback({
        status: "paid",
        phone: "+593 99 111 2222",
        sku: "MGC-WOK-GRANITO-32",
        amount: 150,
        paymentMethod: "transferencia",
        leadId: "Lead Venta 001",
        customerName: "Ana Compradora",
        campaignSlug: "wok-32-granito",
        confirmedBy: "Carlos",
      })

      expect(paid.crmStored).toBe(true)
      expect(paid.crmEventType).toBe("paid")

      const context = await service.aiContext("+593 99 111 2222", {
        leadId: "Lead Venta 001",
      })
      expect(context.customer).toMatchObject({
        name: "Ana Compradora",
      })
      expect(context.lifecycle).toMatchObject({
        journeyStage: "cliente_pagado",
        productInterestSku: "MGC-WOK-GRANITO-32",
        campaignSlug: "wok-32-granito",
      })
    } finally {
      await rm(dataDir, { recursive: true, force: true })
    }
  })
})
