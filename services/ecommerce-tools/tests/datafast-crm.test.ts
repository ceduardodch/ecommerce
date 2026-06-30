import { describe, expect, it, beforeEach, afterEach } from "vitest"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { loadConfig } from "../src/config.js"
import { createCommerceService } from "../src/service.js"
import { readCustomers } from "../src/storage.js"

describe("datafast → registro de venta en CRM (recompra)", () => {
  let dir: string

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "etn-df-"))
  })
  afterEach(async () => {
    await rm(dir, { recursive: true, force: true })
  })

  function svc() {
    const config = loadConfig({
      CRM_BACKEND: "json",
      DATAFAST_DRY_RUN: "true",
      ECOMMERCE_TAX_RATE: "0.15",
      TOOLS_DATA_DIR: dir,
    })
    return createCommerceService(config)
  }

  it("al confirmarse el pago, crea/actualiza el cliente con próximo seguimiento", async () => {
    const service = svc()
    const checkout = await service.datafastCheckout({
      items: [
        { title: "Olla de granito 24cm", sku: "MGC-OLLA-24", quantity: 1, unitPrice: 95 },
      ],
      customer: { givenName: "Maria", surname: "Prueba", phone: "0991234567" },
    })
    expect(checkout.provider).toBe("datafast-dry-run")

    const result = await service.datafastResult(checkout.checkoutId)
    expect(result.status).toBe("paid")

    const customers = await readCustomers(dir)
    const maria = customers.find((c) => c.phone === "+593991234567")
    expect(maria).toBeTruthy()
    expect(maria?.lastPurchaseAt).toBeTruthy()
    expect(maria?.nextFollowupAt).toBeTruthy()
    expect(maria?.followupReason).toBe("recompra_datafast")
    // 90 días por defecto (sin reorderAfterDays)
    expect(maria?.suggestedFrequencyDays).toBe(90)
    const paidEvents = (maria?.events || []).filter((e) => e.type === "paid")
    expect(paidEvents.length).toBe(1)
  })

  it("es idempotente: consultar el resultado dos veces NO duplica la venta", async () => {
    const service = svc()
    const checkout = await service.datafastCheckout({
      items: [{ title: "Mat de yoga", sku: "BIE-MAT", quantity: 1, unitPrice: 30 }],
      customer: { givenName: "Ana", surname: "Test", phone: "0987654321" },
    })
    await service.datafastResult(checkout.checkoutId)
    await service.datafastResult(checkout.checkoutId) // segunda vez

    const customers = await readCustomers(dir)
    const ana = customers.find((c) => c.phone === "+593987654321")
    const paidEvents = (ana?.events || []).filter((e) => e.type === "paid")
    expect(paidEvents.length).toBe(1)
  })

  it("un checkout rechazado NO registra venta", async () => {
    const service = svc()
    await service.datafastCheckout({
      reference: "rej1",
      items: [{ title: "X", quantity: 1, unitPrice: 10 }],
      customer: { givenName: "Z", phone: "0991112222" },
    })
    // un id desconocido en dry-run → failed
    const result = await service.datafastResult("fallo.rej1")
    expect(result.status).toBe("failed")
    const customers = await readCustomers(dir)
    expect(customers.find((c) => c.phone === "+593991112222")).toBeFalsy()
  })
})
