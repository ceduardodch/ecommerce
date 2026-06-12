/**
 * Lógica pura de segmentación RFM (Recencia, Frecuencia, Monto).
 * Sin I/O: testeable de forma unitaria.
 *
 * Segmentos (en español):
 *   vip        — alto en Recencia + Frecuencia + Monto
 *   leal       — frecuencia media-alta con recencia aceptable
 *   prometedor — compró recientemente pero pocas veces
 *   nuevo      — 1 sola compra en los últimos 60 días
 *   dormido    — no compra hace más de 120 días
 *   en_riesgo  — compró antes con frecuencia pero lleva tiempo sin comprar
 */

export type RfmSegment =
  | "vip"
  | "leal"
  | "prometedor"
  | "nuevo"
  | "dormido"
  | "en_riesgo"

export type RfmInput = {
  /** Eventos de tipo "paid" del cliente */
  paidEvents: Array<{ at: string | Date }>
  /** Suma total de amount de compras (ConversationalOrder.total_amount) */
  totalAmount: number
  /** Fecha de referencia (normalmente "ahora") */
  asOf?: Date
}

export type RfmScore = {
  recenciaDias: number      // días desde la última compra (Infinity si nunca)
  frecuencia: number        // número de eventos paid
  monto: number             // suma total compras
  segment: RfmSegment
}

/** Umbrales configurables — no son magic numbers dispersos */
export const RFM_THRESHOLDS = {
  recencia: {
    reciente: 60,    // <= 60 días → recencia alta
    media: 120,      // <= 120 días → recencia media; > 120 → baja
  },
  frecuencia: {
    alta: 3,         // >= 3 compras → frecuencia alta
    media: 2,        // >= 2 compras → frecuencia media
  },
  monto: {
    alto: 100,       // >= 100 USD → monto alto
    medio: 40,       // >= 40 USD → monto medio
  },
}

/**
 * Calcula el segmento RFM a partir del perfil del cliente (sin eventos).
 * Usa last_purchase_at (recencia) y purchased_products.length (frecuencia proxy).
 * Para cálculo preciso usa calculateRfm con eventos reales.
 */
export function calculateRfmFromProfile(customer: {
  last_purchase_at?: Date | string | null
  purchased_products?: Array<{ purchasedAt?: string }> | null
  metadata?: Record<string, unknown>
}, asOf: Date = new Date()): RfmSegment {
  const products = customer.purchased_products || []

  // Recencia: días desde última compra
  let recenciaDias = Infinity
  if (customer.last_purchase_at) {
    const lastAt = new Date(customer.last_purchase_at).getTime()
    recenciaDias = Math.floor((asOf.getTime() - lastAt) / (1000 * 60 * 60 * 24))
  }

  // Frecuencia: número de productos comprados (proxy)
  const frecuencia = products.length

  // Monto: no disponible en perfil sin órdenes → se usa frecuencia como proxy
  // Para segmentación visual en la lista esto es suficiente
  const montoProxy = frecuencia * 40 // proxy: cada compra ~$40

  const result = calculateRfm({
    paidEvents: products.map((p) => ({ at: p.purchasedAt || asOf.toISOString() })),
    totalAmount: montoProxy,
    asOf,
  })

  // Override recencia si tenemos last_purchase_at más precisa
  if (customer.last_purchase_at && products.length > 0) {
    return calculateRfm({
      paidEvents: [{ at: customer.last_purchase_at }],
      totalAmount: montoProxy,
      asOf,
    }).segment
  }

  return result.segment
}

/**
 * Calcula el score RFM y devuelve el segmento del cliente.
 */
export function calculateRfm(input: RfmInput): RfmScore {
  const asOf = input.asOf ?? new Date()
  const { paidEvents, totalAmount } = input

  const frecuencia = paidEvents.length

  // Recencia: días desde la última compra
  let recenciaDias = Infinity
  if (frecuencia > 0) {
    const timestamps = paidEvents.map((event) =>
      new Date(event.at).getTime(),
    )
    const lastAt = Math.max(...timestamps)
    recenciaDias = Math.floor(
      (asOf.getTime() - lastAt) / (1000 * 60 * 60 * 24),
    )
  }

  const monto = totalAmount ?? 0

  const { recencia, frecuencia: freqT, monto: montoT } = RFM_THRESHOLDS

  const recenciaAlta = recenciaDias <= recencia.reciente
  const recenciaMedia = recenciaDias <= recencia.media
  const freqAlta = frecuencia >= freqT.alta
  const freqMedia = frecuencia >= freqT.media
  const montoAlto = monto >= montoT.alto

  let segment: RfmSegment

  if (frecuencia === 0 || recenciaDias === Infinity) {
    // Sin compras registradas → no tiene segmento de valor; usamos "nuevo" genérico
    // pero en la práctica no debería aparecer en filtros de valor
    segment = "dormido"
  } else if (recenciaAlta && freqAlta && montoAlto) {
    segment = "vip"
  } else if (recenciaMedia && freqAlta) {
    segment = "leal"
  } else if (recenciaAlta && frecuencia === 1) {
    segment = "nuevo"
  } else if (recenciaAlta && freqMedia) {
    segment = "prometedor"
  } else if (!recenciaMedia) {
    // No compra hace más de 120 días
    if (freqAlta) {
      // Era frecuente, ahora duerme → en riesgo
      segment = "en_riesgo"
    } else {
      segment = "dormido"
    }
  } else {
    // Recencia media, frecuencia baja, monto bajo → prometedor si compró relativamente reciente
    segment = "prometedor"
  }

  return { recenciaDias, frecuencia, monto, segment }
}
