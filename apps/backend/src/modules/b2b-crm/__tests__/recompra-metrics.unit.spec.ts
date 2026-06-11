/**
 * Tests unitarios de lógica pura de métricas de recompra.
 * Patrones de followup-dispatch.unit.spec.ts.
 */

import { describe, expect, it } from "@jest/globals"
import {
  calculateRepurchaseRates,
  calculateAverageLTV,
  calculateAttributedSales,
  generateCohortsByFirstPurchase,
  recompraMetrics,
} from "../recompra-metrics"

describe("recompra-metrics - lógica pura", () => {
  describe("calculateRepurchaseRates", () => {
    it("debería calcular tasa de recompra a 30 días", () => {
      const paidEvents = [
        { phone: "593990000001", at: "2026-05-01T10:00:00Z" },
        { phone: "593990000001", at: "2026-05-15T10:00:00Z" }, // recompra 30d
        { phone: "593990000002", at: "2026-05-01T10:00:00Z" }, // sola compra
      ]

      const rates = calculateRepurchaseRates(paidEvents, "2026-05-31T23:59:59Z")

      expect(rates[30]).toBeCloseTo(0.5) // 1 de 2 recompró
    })

    it("debería ser 0 si no hay compras", () => {
      const rates = calculateRepurchaseRates([], "2026-05-31T23:59:59Z")
      expect(rates[30]).toBe(0)
    })

    it("debería ignorar compras fuera de ventana", () => {
      const paidEvents = [
        { phone: "593990000001", at: "2026-01-01T10:00:00Z" },
        { phone: "593990000001", at: "2026-04-01T10:00:00Z" }, // fuera de 30d
      ]

      const rates = calculateRepurchaseRates(paidEvents, "2026-05-01T10:00:00Z")

      // Solo 1 compra en ventana de 30d (la del abril)
      expect(rates[30]).toBe(0)
    })
  })

  describe("calculateAverageLTV", () => {
    it("debería calcular LTV promedio", () => {
      const paidEvents = [
        { phone: "593990000001", at: "2026-05-01T10:00:00Z", payload: { total_amount: 100 } },
        { phone: "593990000001", at: "2026-05-15T10:00:00Z", payload: { total_amount: 50 } },
        { phone: "593990000002", at: "2026-05-01T10:00:00Z", payload: { total_amount: 200 } },
      ]

      const customers = [
        { phone: "593990000001" },
        { phone: "593990000002" },
      ]

      const ltv = calculateAverageLTV(paidEvents, customers)

      // (100 + 50 + 200) / 2 = 175
      expect(ltv).toBeCloseTo(175)
    })

    it("debería ser 0 si no hay clientes", () => {
      const ltv = calculateAverageLTV([], [])
      expect(ltv).toBe(0)
    })
  })

  describe("calculateAttributedSales", () => {
    it("debería atribuir ventas dentro de 7 días de followup", () => {
      const events = [
        { type: "followup_sent", phone: "593990000001", at: "2026-05-01T10:00:00Z" },
        { type: "paid", phone: "593990000001", at: "2026-05-05T10:00:00Z", payload: { total_amount: 100 } },
      ]

      const attributed = calculateAttributedSales(events, "2026-05-31T23:59:59Z")

      expect(attributed).toHaveLength(1)
      expect(attributed[0].amount).toBe(100)
      expect(attributed[0].daysSinceFollowup).toBe(4)
    })

    it("NO debería atribuir ventas fuera de ventana de 7 días", () => {
      const events = [
        { type: "followup_sent", phone: "593990000001", at: "2026-05-01T10:00:00Z" },
        { type: "paid", phone: "593990000001", at: "2026-05-15T10:00:00Z", payload: { total_amount: 100 } },
      ]

      const attributed = calculateAttributedSales(events, "2026-05-31T23:59:59Z")

      expect(attributed).toHaveLength(0)
    })

    it("NO debería atribuir ventas sin followup previo", () => {
      const events = [
        { type: "paid", phone: "593990000001", at: "2026-05-05T10:00:00Z", payload: { total_amount: 100 } },
      ]

      const attributed = calculateAttributedSales(events, "2026-05-31T23:59:59Z")

      expect(attributed).toHaveLength(0)
    })
  })

  describe("generateCohortsByFirstPurchase", () => {
    it("debería agrupar por mes de primera compra", () => {
      const paidEvents = [
        { phone: "593990000001", at: "2026-01-15T10:00:00Z" },
        { phone: "593990000001", at: "2026-02-15T10:00:00Z" }, // recompra, mismo cohorte
        { phone: "593990000002", at: "2026-01-20T10:00:00Z" }, // mismo cohorte
        { phone: "593990000003", at: "2026-02-10T10:00:00Z" }, // cohorte feb
      ]

      const cohorts = generateCohortsByFirstPurchase(paidEvents)

      expect(cohorts).toHaveLength(2)
      expect(cohorts[0].month).toBe("2026-01")
      expect(cohorts[0].size).toBe(2)
      expect(cohorts[1].month).toBe("2026-02")
      expect(cohorts[1].size).toBe(1)
    })

    it("debería estar ordenado cronológicamente", () => {
      const paidEvents = [
        { phone: "593990000003", at: "2026-03-10T10:00:00Z" },
        { phone: "593990000001", at: "2026-01-15T10:00:00Z" },
        { phone: "593990000002", at: "2026-02-10T10:00:00Z" },
      ]

      const cohorts = generateCohortsByFirstPurchase(paidEvents)

      expect(cohorts[0].month).toBe("2026-01")
      expect(cohorts[1].month).toBe("2026-02")
      expect(cohorts[2].month).toBe("2026-03")
    })
  })

  describe("recompraMetrics (integración)", () => {
    it("debería calcular todas las métricas juntas", () => {
      const events = [
        { type: "followup_sent", phone: "593990000001", at: "2026-04-01T10:00:00Z" },
        { type: "paid", phone: "593990000001", at: "2026-04-05T10:00:00Z", payload: { total_amount: 100 } },
        { type: "paid", phone: "593990000001", at: "2026-04-25T10:00:00Z", payload: { total_amount: 50 } },
        { type: "paid", phone: "593990000002", at: "2026-04-10T10:00:00Z", payload: { total_amount: 200 } },
      ]

      const customers = [
        { phone: "593990000001" },
        { phone: "593990000002" },
      ]

      const metrics = recompraMetrics(events, customers, "2026-04-30T23:59:59Z")

      expect(metrics.repurchaseRates["30d"]).toBeCloseTo(0.5) // solo 593990000001 recompró en 30d
      expect(metrics.averageLTV).toBeCloseTo(175) // (100+50+200)/2
      expect(metrics.attributedSales.count).toBe(1) // solo la primera venta atribuida
      expect(metrics.attributedSales.totalRevenue).toBe(100)
      expect(metrics.cohorts).toHaveLength(1) // solo cohorte abril-2026
      expect(metrics.cohorts[0].size).toBe(2)
    })
  })
})
