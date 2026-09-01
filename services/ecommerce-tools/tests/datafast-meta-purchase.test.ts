import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { loadConfig } from "../src/config.js"
import { createCommerceService } from "../src/service.js"

/**
 * El `Purchase` de Meta se emite en el servidor, al confirmar el cobro.
 *
 * Antes lo disparaba el navegador en /checkout/resultado: se perdía si el
 * cliente cerraba la pestaña y era falsificable, porque /api/events es público.
 */
describe("datafast → Purchase a Meta desde el servidor", () => {
  let dir: string
  let metaCalls: Array<Record<string, unknown>>

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "etn-meta-"))
    metaCalls = []
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL, init?: RequestInit) => {
        const url = String(input)
        if (url.includes("graph.facebook.com")) {
          metaCalls.push(JSON.parse(String(init?.body)))
          return new Response(JSON.stringify({ events_received: 1 }), {
            status: 200,
          })
        }
        throw new Error(`fetch inesperado en el test: ${url}`)
      }),
    )
  })

  afterEach(async () => {
    vi.unstubAllGlobals()
    await rm(dir, { recursive: true, force: true })
  })

  function svc(datafastEnv: "test" | "live") {
    return createCommerceService(
      loadConfig({
        CRM_BACKEND: "json",
        DATAFAST_DRY_RUN: "true",
        DATAFAST_ENV: datafastEnv,
        ECOMMERCE_TAX_RATE: "0.15",
        TOOLS_DATA_DIR: dir,
        PIXEL_ENABLED: "true",
        META_ACCESS_TOKEN: "test-token",
        META_DATASET_ID: "test-dataset",
      }),
    )
  }

  async function payOnce(service: ReturnType<typeof svc>) {
    const checkout = await service.datafastCheckout({
      items: [
        {
          title: "Olla de granito 24cm",
          sku: "MGC-FR-OLLA-24-GN",
          quantity: 1,
          unitPrice: 95,
        },
      ],
      customer: { givenName: "Maria", surname: "Prueba", phone: "0991234567" },
    })
    return { checkout, result: await service.datafastResult(checkout.checkoutId) }
  }

  it("no reporta Purchase con los códigos del script de certificación", async () => {
    const { result } = await payOnce(svc("test"))

    expect(result.status).toBe("paid")
    expect(result.code).toBe("000.100.112")
    expect(metaCalls).toHaveLength(0)
  })

  it("reporta Purchase con la aprobación de producción, con el monto cobrado", async () => {
    const service = svc("live")
    const { checkout, result } = await payOnce(service)

    expect(result.code).toBe("000.000.000")
    expect(metaCalls).toHaveLength(1)

    const event = (metaCalls[0].data as Array<Record<string, unknown>>)[0]
    expect(event.event_name).toBe("Purchase")
    // Identificador estable por referencia: si Meta recibe el evento dos veces
    // (reintento, reconsulta del resultado) lo deduplica en vez de contarlo dos.
    expect(event.event_id).toBe(`datafast_purchase_${checkout.reference}`)

    const custom = event.custom_data as { value?: number; currency?: string }
    // El valor reportado es el COBRADO (precio de catálogo, $73), no el que
    // mandó el cliente ($95): en live `datafastCheckout` ignora el unitPrice
    // entrante. La conversión que ve Meta y el cargo a la tarjeta coinciden.
    expect(custom.value).toBe(checkout.amount)
    expect(custom.value).toBe(73)
    expect(custom.currency).toBe("USD")
  })

  it("no duplica el Purchase si el cliente recarga la página de resultado", async () => {
    const service = svc("live")
    const { checkout } = await payOnce(service)

    await service.datafastResult(checkout.checkoutId)
    await service.datafastResult(checkout.checkoutId)

    expect(metaCalls).toHaveLength(1)
  })
})
