import { calculateRfm, RFM_THRESHOLDS } from "../rfm"

const ASOF = new Date("2026-06-12T12:00:00Z")

function daysAgo(days: number, from = ASOF): Date {
  const date = new Date(from)
  date.setDate(date.getDate() - days)
  return date
}

function paidEvents(dates: Date[]) {
  return dates.map((date) => ({ at: date.toISOString() }))
}

describe("calculateRfm — segmentos", () => {
  it("vip: recencia alta + frecuencia alta + monto alto", () => {
    const result = calculateRfm({
      paidEvents: paidEvents([daysAgo(10), daysAgo(40), daysAgo(70)]),
      totalAmount: 200,
      asOf: ASOF,
    })
    expect(result.segment).toBe("vip")
    expect(result.frecuencia).toBe(3)
    expect(result.recenciaDias).toBeLessThanOrEqual(RFM_THRESHOLDS.recencia.reciente)
    expect(result.monto).toBe(200)
  })

  it("leal: recencia media + frecuencia alta", () => {
    const result = calculateRfm({
      paidEvents: paidEvents([daysAgo(80), daysAgo(100), daysAgo(150)]),
      totalAmount: 50,
      asOf: ASOF,
    })
    expect(result.segment).toBe("leal")
    expect(result.frecuencia).toBe(3)
  })

  it("nuevo: 1 sola compra reciente", () => {
    const result = calculateRfm({
      paidEvents: paidEvents([daysAgo(15)]),
      totalAmount: 30,
      asOf: ASOF,
    })
    expect(result.segment).toBe("nuevo")
    expect(result.frecuencia).toBe(1)
    expect(result.recenciaDias).toBeLessThanOrEqual(RFM_THRESHOLDS.recencia.reciente)
  })

  it("prometedor: recencia alta + 2 compras", () => {
    const result = calculateRfm({
      paidEvents: paidEvents([daysAgo(20), daysAgo(50)]),
      totalAmount: 60,
      asOf: ASOF,
    })
    expect(result.segment).toBe("prometedor")
    expect(result.frecuencia).toBe(2)
  })

  it("dormido: sin compras en más de 120 días con baja frecuencia", () => {
    const result = calculateRfm({
      paidEvents: paidEvents([daysAgo(200)]),
      totalAmount: 35,
      asOf: ASOF,
    })
    expect(result.segment).toBe("dormido")
    expect(result.recenciaDias).toBeGreaterThan(RFM_THRESHOLDS.recencia.media)
  })

  it("en_riesgo: era frecuente pero no compra hace más de 120 días", () => {
    const result = calculateRfm({
      paidEvents: paidEvents([daysAgo(130), daysAgo(200), daysAgo(250)]),
      totalAmount: 180,
      asOf: ASOF,
    })
    expect(result.segment).toBe("en_riesgo")
    expect(result.frecuencia).toBe(3)
    expect(result.recenciaDias).toBeGreaterThan(RFM_THRESHOLDS.recencia.media)
  })

  it("dormido: sin ningún evento paid", () => {
    const result = calculateRfm({
      paidEvents: [],
      totalAmount: 0,
      asOf: ASOF,
    })
    expect(result.segment).toBe("dormido")
    expect(result.recenciaDias).toBe(Infinity)
    expect(result.frecuencia).toBe(0)
  })

  it("cálculo correcto de recenciaDias", () => {
    const result = calculateRfm({
      paidEvents: paidEvents([daysAgo(45)]),
      totalAmount: 30,
      asOf: ASOF,
    })
    expect(result.recenciaDias).toBe(45)
  })

  it("cálculo correcto de frecuencia", () => {
    const result = calculateRfm({
      paidEvents: paidEvents([daysAgo(10), daysAgo(20), daysAgo(30), daysAgo(40)]),
      totalAmount: 200,
      asOf: ASOF,
    })
    expect(result.frecuencia).toBe(4)
  })

  it("usa el asOf por defecto si no se proporciona", () => {
    const result = calculateRfm({
      paidEvents: paidEvents([new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)]),
      totalAmount: 30,
    })
    expect(result.recenciaDias).toBeGreaterThanOrEqual(9)
    expect(result.recenciaDias).toBeLessThanOrEqual(11)
  })
})
