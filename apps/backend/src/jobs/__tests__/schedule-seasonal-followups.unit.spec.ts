import {
  getNextSeasonalCampaign,
  getCampaignDate,
  shouldScheduleSeasonalFollowups,
  shouldScheduleCustomerForSeasonal,
  daysUntilNextCampaign,
} from "../schedule-seasonal-followups"

describe("schedule-seasonal-followups - lógica pura", () => {
  describe("getNextSeasonalCampaign", () => {
    it("debe retornar campaña de navidad si estamos antes del 15 de noviembre", () => {
      const date = new Date("2026-11-01T00:00:00Z")
      const campaign = getNextSeasonalCampaign(date)
      expect(campaign?.name).toBe("navidad")
      expect(campaign?.month).toBe(11)
      expect(campaign?.day).toBe(15)
    })

    it("debe retornar la primera campaña del siguiente año si estamos en diciembre", () => {
      // 1 de diciembre, todas las campañas de este año ya pasaron
      const date = new Date("2026-12-01T00:00:00Z")
      const campaign = getNextSeasonalCampaign(date)
      // La implementación retorna la primera del array (navidad) pero del siguiente año
      expect(campaign).toBeTruthy()
      expect(campaign?.name).toBe("navidad")
    })

    it("debe retornar la primera campaña del siguiente año si pasaron todas", () => {
      // Simulamos una fecha después de todas las campañas del año
      const date = new Date("2026-11-20T00:00:00Z")
      const campaign = getNextSeasonalCampaign(date)
      // La implementación retorna la primera del array (navidad) pero del siguiente año
      expect(campaign).toBeTruthy()
      expect(campaign?.name).toBe("navidad")
    })
  })

  describe("getCampaignDate", () => {
    it("debe calcular la fecha de navidad correctamente", () => {
      const campaign = {
        name: "navidad",
        month: 11,
        day: 15,
        followupReason: "estacional_navidad",
        templateKey: "estacional",
        description: "Campaña de Navidad/Black Friday",
      }
      const date = getCampaignDate(campaign, 2026)
      expect(date.getUTCFullYear()).toBe(2026)
      expect(date.getUTCMonth()).toBe(10) // Noviembre (0-indexed)
      expect(date.getUTCDate()).toBe(15)
      expect(date.getUTCHours()).toBe(14) // 9:00 AM Ecuador = 14:00 UTC
    })

    it("debe calcular la fecha del día de la madre correctamente", () => {
      const campaign = {
        name: "dia_madre",
        month: 4,
        day: 24,
        followupReason: "estacional_dia_madre",
        templateKey: "estacional",
        description: "Campaña Día de la Madre",
      }
      const date = getCampaignDate(campaign, 2026)
      expect(date.getUTCFullYear()).toBe(2026)
      expect(date.getUTCMonth()).toBe(3) // Abril (0-indexed)
      expect(date.getUTCDate()).toBe(24)
    })
  })

  describe("shouldScheduleSeasonalFollowups", () => {
    it("debe retornar true si estamos dentro de la ventana de 7 días", () => {
      const campaign = {
        name: "navidad",
        month: 11,
        day: 15,
        followupReason: "estacional_navidad",
        templateKey: "estacional",
        description: "Campaña de Navidad/Black Friday",
      }
      // 8 de noviembre (7 días antes)
      const date = new Date("2026-11-08T15:00:00Z")
      const should = shouldScheduleSeasonalFollowups(date, campaign, 7)
      expect(should).toBe(true)
    })

    it("debe retornar false si estamos antes de la ventana", () => {
      const campaign = {
        name: "navidad",
        month: 11,
        day: 15,
        followupReason: "estacional_navidad",
        templateKey: "estacional",
        description: "Campaña de Navidad/Black Friday",
      }
      // 1 de noviembre (más de 7 días antes)
      const date = new Date("2026-11-01T15:00:00Z")
      const should = shouldScheduleSeasonalFollowups(date, campaign, 7)
      expect(should).toBe(false)
    })

    it("debe retornar false si estamos después de la fecha de campaña", () => {
      const campaign = {
        name: "navidad",
        month: 11,
        day: 15,
        followupReason: "estacional_navidad",
        templateKey: "estacional",
        description: "Campaña de Navidad/Black Friday",
      }
      // 20 de noviembre (después del 15)
      const date = new Date("2026-11-20T15:00:00Z")
      const should = shouldScheduleSeasonalFollowups(date, campaign, 7)
      expect(should).toBe(false)
    })

    it("debe retornar false si no hay campaña", () => {
      const date = new Date("2026-11-01T15:00:00Z")
      const should = shouldScheduleSeasonalFollowups(date, null, 7)
      expect(should).toBe(false)
    })
  })

  describe("shouldScheduleCustomerForSeasonal", () => {
    const campaignDate = new Date("2026-11-15T14:00:00Z")

    it("debe programar si cliente no tiene followup programado", () => {
      const customer = {
        next_followup_at: null,
        followup_reason: null,
      }
      const should = shouldScheduleCustomerForSeasonal(customer, campaignDate)
      expect(should).toBe(true)
    })

    it("debe programar si followup estacional es anterior al próximo followup", () => {
      const customer = {
        next_followup_at: "2026-12-01T00:00:00Z", // Después de navidad
        followup_reason: "recompra",
      }
      const should = shouldScheduleCustomerForSeasonal(customer, campaignDate)
      expect(should).toBe(true)
    })

    it("debe omitir si followup existente es más próximo", () => {
      const customer = {
        next_followup_at: "2026-11-10T00:00:00Z", // Antes de navidad
        followup_reason: "recompra",
      }
      const should = shouldScheduleCustomerForSeasonal(customer, campaignDate)
      expect(should).toBe(false)
    })

    it("debe programar si las fechas son iguales", () => {
      const customer = {
        next_followup_at: "2026-11-15T14:00:00Z", // Igual a navidad
        followup_reason: "recompra",
      }
      const should = shouldScheduleCustomerForSeasonal(customer, campaignDate)
      expect(should).toBe(true)
    })

    it("debe funcionar con Date对象", () => {
      const customer = {
        next_followup_at: new Date("2026-11-10T00:00:00Z"), // Antes de navidad
        followup_reason: "recompra",
      }
      const should = shouldScheduleCustomerForSeasonal(customer, campaignDate)
      expect(should).toBe(false)
    })
  })

  describe("daysUntilNextCampaign", () => {
    it("debe calcular días restantes correctamente", () => {
      // 1 de noviembre, faltan 14 días para el 15
      const date = new Date("2026-11-01T00:00:00Z")
      const days = daysUntilNextCampaign(date)
      expect(days).toBe(14)
    })

    it("debe calcular días positivos después de pasar la campaña", () => {
      // 20 de noviembre, 5 días después del 15
      const date = new Date("2026-11-20T00:00:00Z")
      const days = daysUntilNextCampaign(date)
      // getNextSeasonalCampaign retornará navidad, pero como ya pasó el 15,
      // se calcula para el siguiente año (2027)
      // Del 20/11/2026 al 15/11/2027 hay aprox 360 días
      expect(days).toBeGreaterThan(300) // Al menos 10 meses
      expect(days).toBeLessThan(400) // Menos de 14 meses
    })
  })
})
