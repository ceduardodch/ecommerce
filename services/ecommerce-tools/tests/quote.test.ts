import { describe, expect, it } from "vitest"
import { loadConfig } from "../src/config.js"
import { demoCatalog } from "../src/demo-catalog.js"
import { buildClientTransactionId } from "../src/payphone.js"
import { buildQuote } from "../src/quote.js"
import { buildMetaCatalogCsv } from "../src/meta.js"

describe("commerce tools", () => {
  it("builds a quote with tax and WhatsApp copy", () => {
    const config = loadConfig({ ECOMMERCE_TAX_RATE: "0.15" })
    const quote = buildQuote(config, demoCatalog, [
      { productId: "prod-cctv-kit-4", quantity: 2 },
    ])

    expect(quote.subtotal.amount).toBe(778)
    expect(quote.tax.amount).toBe(116.7)
    expect(quote.total.amount).toBe(894.7)
    expect(quote.whatsappMessage).toContain("PayPhone")
  })

  it("keeps PayPhone client transaction ids within the API Link limit", () => {
    const id = buildClientTransactionId("B2B-THIS-ORDER-ID-IS-LONG")
    expect(id.length).toBeLessThanOrEqual(15)
  })

  it("exports required Meta catalog columns", () => {
    const csv = buildMetaCatalogCsv(demoCatalog)
    expect(csv.split("\n")[0]).toBe(
      "id,title,description,availability,condition,price,link,image_link,brand"
    )
    expect(csv).toContain("in stock")
  })
})
