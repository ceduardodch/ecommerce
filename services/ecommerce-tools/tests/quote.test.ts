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
      { productId: "prod-bateria-ollas-7", quantity: 2 },
    ])

    expect(quote.subtotal.amount).toBe(238)
    expect(quote.tax.amount).toBe(35.7)
    expect(quote.total.amount).toBe(273.7)
    expect(quote.whatsappMessage).toContain("PayPhone")
  })

  it("keeps PayPhone client transaction ids within the API Link limit", () => {
    const id = buildClientTransactionId("B2B-THIS-ORDER-ID-IS-LONG")
    expect(id.length).toBeLessThanOrEqual(15)
  })

  it("exports required Meta catalog columns", () => {
    const csv = buildMetaCatalogCsv(demoCatalog)
    expect(csv.split("\n")[0]).toBe(
      "id,title,description,availability,condition,price,link,image_link,brand,sale_price",
    )
    expect(csv).toContain("in stock")
    expect(csv).toContain("COC-OLLAS-7PZ,Bateria de ollas acero 7 piezas")
    expect(csv).toContain("149.00 USD")
    expect(csv).toContain("119.00 USD")
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
                productId: "prod-cuchillos-chef-6",
                sku: "COC-CUCH-6PZ",
                title: "Juego de cuchillos chef 6 piezas",
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
      expect(customer?.purchasedProducts[0]?.sku).toBe("COC-CUCH-6PZ")

      const due = await service.dueFollowups({
        asOf: "2026-08-01T00:00:00.000Z",
      })
      expect(due[0]?.suggestedMessage).toContain("compraste")

      const dashboard = await service.dashboard({
        asOf: "2026-08-01T00:00:00.000Z",
      })
      expect(dashboard.counts.dueFollowups).toBe(1)
      expect(dashboard.campaignDraftQueue[0]?.phone).toBe("+593991112222")
    } finally {
      await rm(dataDir, { recursive: true, force: true })
    }
  })
})
