import {
  buildFollowupMessage,
  buildMetaMediaPayload,
  isWithinSendWindow,
  loadDispatchConfig,
  renderTemplate,
  selectDispatchTargets,
} from "../followup-dispatch"
import { DEFAULT_CRM_TEMPLATES } from "../default-templates"

const NOW = new Date("2026-06-10T15:00:00Z")

function customer(phone: string) {
  return { phone }
}

describe("selectDispatchTargets", () => {
  it("excluye clientes con opt_out", () => {
    const events = new Map([
      ["+5931", [{ type: "opt_out", at: "2026-01-01T00:00:00Z" }]],
    ])
    const { targets, skipped } = selectDispatchTargets(
      [customer("+5931"), customer("+5932")],
      events,
      { cooldownDays: 7, maxPerRun: 10, now: NOW },
    )
    expect(targets.map((entry) => entry.phone)).toEqual(["+5932"])
    expect(skipped).toEqual([{ phone: "+5931", reason: "opt_out" }])
  })

  it("excluye followups enviados o encolados dentro del cooldown", () => {
    const events = new Map([
      ["+5931", [{ type: "followup_sent", at: "2026-06-08T00:00:00Z" }]],
      ["+5932", [{ type: "followup_queued", at: "2026-06-09T00:00:00Z" }]],
      ["+5933", [{ type: "followup_sent", at: "2026-05-01T00:00:00Z" }]],
    ])
    const { targets, skipped } = selectDispatchTargets(
      [customer("+5931"), customer("+5932"), customer("+5933")],
      events,
      { cooldownDays: 7, maxPerRun: 10, now: NOW },
    )
    expect(targets.map((entry) => entry.phone)).toEqual(["+5933"])
    expect(skipped.map((entry) => entry.reason)).toEqual([
      "cooldown",
      "cooldown",
    ])
  })

  it("evita repetir una campaña dentro del cooldown", () => {
    const events = new Map([
      ["+5931", [{ type: "broadcast_sent", at: "2026-06-09T00:00:00Z" }]],
      ["+5932", [{ type: "broadcast_queued", at: "2026-06-09T00:00:00Z" }]],
    ])
    const { targets, skipped } = selectDispatchTargets(
      [customer("+5931"), customer("+5932")],
      events,
      { cooldownDays: 7, maxPerRun: 10, now: NOW },
    )
    expect(targets).toHaveLength(0)
    expect(skipped.map((entry) => entry.reason)).toEqual(["cooldown", "cooldown"])
  })

  it("corta en maxPerRun", () => {
    const { targets, skipped } = selectDispatchTargets(
      [customer("+5931"), customer("+5932"), customer("+5933")],
      new Map(),
      { cooldownDays: 7, maxPerRun: 2, now: NOW },
    )
    expect(targets).toHaveLength(2)
    expect(skipped).toEqual([{ phone: "+5933", reason: "max_per_run" }])
  })
})

describe("isWithinSendWindow", () => {
  const window = {
    windowStartHour: 9,
    windowEndHour: 19,
    timezoneOffsetHours: -5,
  }

  it("permite dentro de la ventana en hora Guayaquil", () => {
    // 15:00 UTC = 10:00 Guayaquil
    expect(isWithinSendWindow(window, new Date("2026-06-10T15:00:00Z"))).toBe(
      true,
    )
  })

  it("bloquea fuera de la ventana", () => {
    // 02:00 UTC = 21:00 Guayaquil del día anterior
    expect(isWithinSendWindow(window, new Date("2026-06-10T02:00:00Z"))).toBe(
      false,
    )
    // 13:00 UTC = 08:00 Guayaquil
    expect(isWithinSendWindow(window, new Date("2026-06-10T13:00:00Z"))).toBe(
      false,
    )
  })
})

describe("loadDispatchConfig", () => {
  it("usa modo draft por defecto", () => {
    const config = loadDispatchConfig({} as NodeJS.ProcessEnv)
    expect(config.mode).toBe("draft")
    expect(config.enabled).toBe(true)
    expect(config.maxPerRun).toBe(20)
    expect(config.cooldownDays).toBe(7)
    expect(config.retryDays).toBe(7)
    expect(config.windowStartHour).toBe(9)
    expect(config.windowEndHour).toBe(19)
  })

  it("activa openclaw solo cuando se pide explícitamente", () => {
    const config = loadDispatchConfig({
      CRM_FOLLOWUP_DISPATCH_MODE: "openclaw",
      OPENCLAW_GATEWAY_URL: "https://vicky.b2b.com.ec",
      CRM_FOLLOWUP_ENABLED: "false",
      CRM_FOLLOWUP_WINDOW: "8-20",
    } as unknown as NodeJS.ProcessEnv)
    expect(config.mode).toBe("openclaw")
    expect(config.enabled).toBe(false)
    expect(config.windowStartHour).toBe(8)
    expect(config.windowEndHour).toBe(20)
  })
})

describe("buildFollowupMessage", () => {
  it("usa el último producto comprado", () => {
    const message = buildFollowupMessage({
      name: "Maria Cliente",
      purchased_products: [{ title: "Olla 20 cm granito" }],
    })
    expect(message).toContain("Hola Maria")
    expect(message).toContain("Olla 20 cm granito")
  })

  it("tiene mensaje genérico sin compras", () => {
    const message = buildFollowupMessage({ name: null, purchased_products: [] })
    expect(message).toContain("Hola,")
  })
})

describe("buildMetaMediaPayload (adjunto de plantilla)", () => {
  it("arma un mensaje de video con caption", () => {
    const payload = buildMetaMediaPayload(
      "+593979854905",
      { url: "https://cdn.eter-niu.com/demo.mp4", kind: "video" },
      "Hola Carlos 👋",
    )
    expect(payload.type).toBe("video")
    expect(payload.video).toEqual({
      link: "https://cdn.eter-niu.com/demo.mp4",
      caption: "Hola Carlos 👋",
    })
    expect(payload.image).toBeUndefined()
  })

  it("soporta imagen y documento", () => {
    expect(
      buildMetaMediaPayload("+593999", { url: "https://x/y.jpg", kind: "image" }).image,
    ).toEqual({ link: "https://x/y.jpg" })
    expect(
      buildMetaMediaPayload("+593999", { url: "https://x/y.pdf", kind: "document" })
        .document,
    ).toEqual({ link: "https://x/y.pdf" })
  })
})

describe("plantillas base en español", () => {
  it("cubre todas las keys que produce templateKeyFromReason", () => {
    const keys = DEFAULT_CRM_TEMPLATES.map((t) => t.key)
    for (const expected of [
      "recompra",
      "complemento",
      "cuidado",
      "estacional",
      "promo_coleccion_exotica",
      "cross_sell_cocina",
      "cross_sell_bienestar",
      "nps",
      "referido",
      "generico",
    ]) {
      expect(keys).toContain(expected)
    }
  })

  it("la promo Onyx conserva precio, enlace, opt-out y video", () => {
    const promo = DEFAULT_CRM_TEMPLATES.find((t) => t.key === "promo_coleccion_exotica")!
    expect(promo.body).toContain("$426.96")
    expect(promo.body).toContain("#arma-tu-combo")
    expect(promo.body).toContain("SALIR")
    expect(promo.mediaType).toBe("video")
  })

  it("la plantilla de recompra renderiza las 3 variables", () => {
    const recompra = DEFAULT_CRM_TEMPLATES.find((t) => t.key === "recompra")!
    const message = renderTemplate(recompra, {
      name: "Carlos Díaz",
      purchased_products: [{ title: "Wok de granito 32 cm" }],
      daysSincePurchase: 92,
    })
    expect(message).toContain("Carlos")
    expect(message).toContain("Wok de granito 32 cm")
    expect(message).toContain("92")
    expect(message).not.toContain("{")
  })
})
