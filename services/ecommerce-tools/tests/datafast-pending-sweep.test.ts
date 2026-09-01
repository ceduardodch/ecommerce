import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { loadConfig } from "../src/config.js"
import { createCommerceService } from "../src/service.js"
import { readDatafastCheckouts, upsertDatafastCheckout } from "../src/storage.js"

/**
 * Un cobro aprobado no puede depender de que el navegador del cliente vuelva a
 * /checkout/resultado. El barrido pregunta a Datafast por los pendientes.
 */
describe("datafast → barrido de checkouts pendientes", () => {
  let dir: string

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "etn-sweep-"))
  })
  afterEach(async () => {
    await rm(dir, { recursive: true, force: true })
  })

  function svc() {
    return createCommerceService(
      loadConfig({
        CRM_BACKEND: "json",
        DATAFAST_DRY_RUN: "true",
        ECOMMERCE_TAX_RATE: "0.15",
        TOOLS_DATA_DIR: dir,
      }),
    )
  }

  /** Un checkout que quedó en `pending` hace `minutesAgo` minutos. */
  async function pendingCheckout(reference: string, minutesAgo: number) {
    const at = new Date(Date.now() - minutesAgo * 60 * 1000).toISOString()
    await upsertDatafastCheckout(dir, {
      reference,
      checkoutId: `dryrun.${reference}`,
      amount: 73,
      status: "pending",
      registered: false,
      customer: { phone: "+593991234567", name: "Maria Prueba" },
      items: [
        {
          title: "Olla de granito 24cm",
          sku: "MGC-FR-OLLA-24-GN",
          quantity: 1,
          unitPrice: 73,
        },
      ],
      createdAt: at,
      updatedAt: at,
    })
  }

  it("recupera el pago cuyo callback nunca llegó", async () => {
    await pendingCheckout("etn_abandonado", 30)

    const sweep = await svc().reconcilePendingDatafastCheckouts()

    expect(sweep.scanned).toBe(1)
    expect(sweep.recovered).toBe(1)

    const [record] = await readDatafastCheckouts(dir)
    expect(record.status).toBe("paid")
    expect(record.registered).toBe(true)
    // El pedido existe: es lo que faltaba para poder despacharlo.
    expect(record.orderId).toBeTruthy()
  })

  it("no toca al cliente que todavía puede estar pagando", async () => {
    await pendingCheckout("etn_en_curso", 2)

    const sweep = await svc().reconcilePendingDatafastCheckouts()

    expect(sweep.scanned).toBe(0)
    expect((await readDatafastCheckouts(dir))[0].status).toBe("pending")
  })

  it("deja de consultar los checkouts que Datafast ya no expone", async () => {
    await pendingCheckout("etn_fosil", 60 * 24 * 8) // 8 días

    const sweep = await svc().reconcilePendingDatafastCheckouts()

    expect(sweep.scanned).toBe(0)
  })

  it("no registra dos veces el mismo cobro si el barrido se repite", async () => {
    await pendingCheckout("etn_repetido", 30)
    const service = svc()

    const first = await service.reconcilePendingDatafastCheckouts()
    const second = await service.reconcilePendingDatafastCheckouts()

    expect(first.recovered).toBe(1)
    // Tras el primer barrido ya está en `paid`, así que deja de ser candidato.
    expect(second.scanned).toBe(0)

    const records = await readDatafastCheckouts(dir)
    expect(records).toHaveLength(1)
  })

  it("respeta el tope por pasada para no martillar la API", async () => {
    for (let i = 0; i < 5; i += 1) {
      await pendingCheckout(`etn_lote_${i}`, 30 + i)
    }

    const sweep = await svc().reconcilePendingDatafastCheckouts({ maxPerRun: 2 })

    expect(sweep.scanned).toBe(2)
    const pendientes = (await readDatafastCheckouts(dir)).filter(
      (r) => r.status === "pending",
    )
    expect(pendientes).toHaveLength(3)
  })
})
