import {
  buildFollowupMessage,
  isWithinSendWindow,
  loadDispatchConfig,
  selectDispatchTargets,
} from "../followup-dispatch"

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
