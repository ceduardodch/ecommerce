/**
 * Lógica pura de métricas de recompra y LTV.
 * Testable independiente del service de Medusa.
 *
 * Patrones de followup-dispatch.ts:
 * - Funciones puras que reciben datos crudos
 * - Sin dependencias de BD ni framework
 * - Fácil de testear unitariamente
 */

type PaidEvent = {
  phone: string
  at: string | Date
  payload?: { total_amount?: number } | null
}

type CustomerLike = {
  phone: string
  last_purchase_at?: string | Date | null
  purchased_products?: Array<{ title?: string }> | null
}

type EventLike = {
  type: string
  phone?: string | null
  at?: string | Date | null
  payload?: { total_amount?: number } | null
}

type FollowupEvent = {
  type: string
  at?: string | Date | null
}

/**
 * Calcula la tasa de recompra en diferentes ventanas de tiempo.
 *
 * @param paidEvents - Todos los eventos `paid` ordenados por fecha ascendente
 * @param asOf - Fecha de corte (ISO string o Date)
 * @returns Objeto con tasas de recompra (proporción de clientes con ≥2 compras)
 */
export function calculateRepurchaseRates(
  paidEvents: PaidEvent[],
  asOf: string | Date = new Date()
) {
  const cutoff = new Date(asOf)
  const windows = [30, 60, 90] // días

  // Agrupar eventos por phone
  const purchasesByPhone = new Map<string, Date[]>()
  for (const event of paidEvents) {
    if (!event.phone) continue
    const eventDate = new Date(event.at)
    if (isNaN(eventDate.getTime())) continue

    const existing = purchasesByPhone.get(event.phone) || []
    existing.push(eventDate)
    purchasesByPhone.set(event.phone, existing)
  }

  // Calcular tasa para cada ventana
  const rates: Record<number, number> = {}
  for (const days of windows) {
    // Ventana: desde hace N días hasta el cutoff (inclusive)
    const windowStart = new Date(cutoff)
    windowStart.setDate(windowStart.getDate() - days)
    // Ajustar al inicio del día para incluir el día completo
    windowStart.setHours(0, 0, 0, 0)

    let repeatBuyers = 0
    let totalBuyers = 0

    for (const [phone, purchaseDates] of purchasesByPhone) {
      // Filtrar compras dentro de la ventana
      const purchasesInWindow = purchaseDates.filter(
        (d) => d >= windowStart && d <= cutoff
      )

      if (purchasesInWindow.length > 0) {
        totalBuyers += 1
        if (purchasesInWindow.length >= 2) {
          repeatBuyers += 1
        }
      }
    }

    rates[days] = totalBuyers > 0 ? repeatBuyers / totalBuyers : 0
  }

  return rates
}

/**
 * Calcula el LTV promedio por cliente.
 *
 * @param paidEvents - Todos los eventos `paid` con payload.total_amount
 * @param customers - Todos los clientes (para contar únicos)
 * @returns LTV promedio (suma de totales / clientes únicos)
 */
export function calculateAverageLTV(
  paidEvents: PaidEvent[],
  customers: CustomerLike[]
) {
  const totalByPhone = new Map<string, number>()

  for (const event of paidEvents) {
    if (!event.phone) continue
    const amount =
      event.payload && typeof event.payload === "object"
        ? Number((event.payload as { total_amount?: number }).total_amount || 0)
        : 0

    const existing = totalByPhone.get(event.phone) || 0
    totalByPhone.set(event.phone, existing + amount)
  }

  const uniqueCustomers = customers.length
  const totalRevenue = Array.from(totalByPhone.values()).reduce(
    (sum, amount) => sum + amount,
    0
  )

  return uniqueCustomers > 0 ? totalRevenue / uniqueCustomers : 0
}

/**
 * Calcula ventas atribuidas a followups.
 *
 * Un evento `paid` se atribuye si ocurre ≤ 7 días después de un
 * `followup_sent` del mismo phone.
 *
 * @param events - Todos los eventos (paid, followup_sent, followup_queued)
 * @param asOf - Fecha de corte
 * @returns Array de ventas atribuidas con metadata
 */
export function calculateAttributedSales(
  events: EventLike[],
  asOf: string | Date = new Date()
) {
  const cutoff = new Date(asOf)
  const attributionWindowDays = 7
  const attributionWindowMs = attributionWindowDays * 24 * 60 * 60 * 1000

  // Separar eventos por tipo
  const paidEvents: Array<{ phone: string; at: Date; payload?: any }> = []
  const followupEventsByPhone = new Map<string, Date[]>()

  for (const event of events) {
    if (!event.phone) continue
    const eventDate = event.at ? new Date(event.at) : null
    if (!eventDate || isNaN(eventDate.getTime())) continue

    if (event.type === "paid") {
      paidEvents.push({ phone: event.phone, at: eventDate, payload: event.payload })
    } else if (event.type === "followup_sent") {
      const existing = followupEventsByPhone.get(event.phone) || []
      existing.push(eventDate)
      followupEventsByPhone.set(event.phone, existing)
    }
  }

  // Atribuir ventas
  const attributedSales: Array<{
    phone: string
    paidAt: Date
    amount: number
    followupAt?: Date
    daysSinceFollowup?: number
  }> = []

  for (const paid of paidEvents) {
    const followups = followupEventsByPhone.get(paid.phone) || []

    // Encontrar el followup más reciente dentro de la ventana
    let closestFollowup: Date | undefined
    let minDiff = Infinity

    for (const followupAt of followups) {
      const diff = paid.at.getTime() - followupAt.getTime()
      if (diff >= 0 && diff <= attributionWindowMs && diff < minDiff) {
        minDiff = diff
        closestFollowup = followupAt
      }
    }

    if (closestFollowup) {
      const amount =
        paid.payload && typeof paid.payload === "object"
          ? Number((paid.payload as { total_amount?: number }).total_amount || 0)
          : 0

      attributedSales.push({
        phone: paid.phone,
        paidAt: paid.at,
        amount,
        followupAt: closestFollowup,
        daysSinceFollowup: Math.round(minDiff / (24 * 60 * 60 * 1000)),
      })
    }
  }

  return attributedSales
}

/**
 * Genera cohortes por mes de primera compra.
 *
 * @param paidEvents - Todos los eventos `paid`
 * @returns Array de cohortes con mes, tamaño y métricas
 */
export function generateCohortsByFirstPurchase(paidEvents: PaidEvent[]) {
  // Encontrar primera compra por phone
  const firstPurchaseByPhone = new Map<string, Date>()

  for (const event of paidEvents) {
    if (!event.phone) continue
    const eventDate = new Date(event.at)
    if (isNaN(eventDate.getTime())) continue

    const existing = firstPurchaseByPhone.get(event.phone)
    if (!existing || eventDate < existing) {
      firstPurchaseByPhone.set(event.phone, eventDate)
    }
  }

  // Agrupar por mes de primera compra
  const cohortsByMonth = new Map<string, Set<string>>()

  for (const [phone, firstDate] of firstPurchaseByPhone) {
    // Formato: YYYY-MM (primer día del mes)
    const monthKey = `${firstDate.getFullYear()}-${String(firstDate.getMonth() + 1).padStart(2, "0")}`
    const existing = cohortsByMonth.get(monthKey) || new Set()
    existing.add(phone)
    cohortsByMonth.set(monthKey, existing)
  }

  // Convertir a array ordenado
  const cohorts = Array.from(cohortsByMonth.entries())
    .map(([month, phones]) => ({
      month,
      size: phones.size,
      phones: Array.from(phones),
    }))
    .sort((a, b) => a.month.localeCompare(b.month))

  return cohorts
}

/**
 * Métricas completas de recompra/LTV.
 *
 * @param events - Todos los eventos del CRM
 * @param customers - Todos los clientes
 * @param asOf - Fecha de corte
 * @returns Objeto con todas las métricas
 */
export function recompraMetrics(
  events: EventLike[],
  customers: CustomerLike[],
  asOf: string | Date = new Date()
) {
  const paidEvents = events
    .filter((e) => e.type === "paid" && e.phone && e.at)
    .map((e) => ({
      phone: e.phone!,
      at: e.at!,
      payload: e.payload,
    }))

  const repurchaseRates = calculateRepurchaseRates(paidEvents, asOf)
  const averageLTV = calculateAverageLTV(paidEvents, customers)
  const attributedSales = calculateAttributedSales(events, asOf)
  const cohorts = generateCohortsByFirstPurchase(paidEvents)

  const totalAttributedRevenue = attributedSales.reduce(
    (sum, sale) => sum + sale.amount,
    0
  )

  return {
    asOf: new Date(asOf).toISOString(),
    repurchaseRates: {
      "30d": repurchaseRates[30] || 0,
      "60d": repurchaseRates[60] || 0,
      "90d": repurchaseRates[90] || 0,
    },
    averageLTV,
    attributedSales: {
      count: attributedSales.length,
      totalRevenue: totalAttributedRevenue,
      sales: attributedSales.slice(-100), // últimas 100 ventas atribuidas
    },
    cohorts: cohorts.slice(-12), // últimos 12 meses
  }
}
