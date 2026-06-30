import type { AppConfig } from "./config.js"

// ---------------------------------------------------------------------------
// Datafast (DataFast Ecuador / ACI oppwa Copy&Pay)
// Lógica portada del módulo Odoo `payment_payon` del dueño (producción).
// Hosts, endpoints, códigos de éxito y el TLV de IVA del SRI están verificados
// contra ese módulo. Ver docs/PAGOS_DATAFAST_PLAN.md.
// ---------------------------------------------------------------------------

export type DatafastCartItem = {
  title: string
  sku?: string
  quantity: number
  /** Precio UNITARIO final que paga el cliente (IVA incluido). */
  unitPrice: number
  description?: string
}

export type DatafastCustomer = {
  givenName?: string
  middleName?: string
  surname?: string
  email?: string
  phone?: string
  /** Cédula / RUC (se usan los primeros 10 dígitos como pide Datafast). */
  idNumber?: string
  ip?: string
  street?: string
  city?: string
  countryCode?: string
}

export type DatafastCheckoutInput = {
  reference: string
  items: DatafastCartItem[]
  customer?: DatafastCustomer
}

export type IvaBreakdown = {
  /** Total cobrado (IVA incluido). */
  total: number
  /** Base gravada (sin IVA). */
  baseTaxed: number
  /** IVA. */
  tax: number
  /** Base con tarifa 0%. */
  baseZero: number
}

const HOST_LIVE = "https://oppwa.com"
const HOST_TEST = "https://test.oppwa.com"

export function datafastHost(config: AppConfig) {
  return config.datafastEnv === "live" ? HOST_LIVE : HOST_TEST
}

function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100
}

/**
 * Suma server-side del carrito y desglose de IVA.
 * Asunción (configurable por catálogo): los precios mostrados INCLUYEN IVA y
 * todos los ítems están gravados → se "saca" el IVA del total. Si más adelante
 * hay productos con tarifa 0%, se extiende con un flag por ítem.
 * NO se confía en ningún total enviado por el cliente: se recalcula aquí.
 */
export function computeIva(items: DatafastCartItem[], taxRate: number): IvaBreakdown {
  const total = round2(
    items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0),
  )
  const baseTaxed = round2(total / (1 + taxRate))
  const tax = round2(total - baseTaxed)
  return { total, baseTaxed, tax, baseZero: 0 }
}

/** Codifica un número a 13 chars "013.2f" y le quita el punto (formato Datafast). */
function money13(n: number): string {
  // p.ej. 100 → "0000000100.00" (13 chars) → "000000010000" (12 dígitos)
  const s = n.toFixed(2).padStart(13, "0")
  return s.replace(".", "")
}

function tlvField(code: string, value: string): string {
  // code(3) + length(3) + value
  return code + String(value.length).padStart(3, "0") + value
}

/**
 * Construye el `customParameters[{MID}_{TID}]` con el desglose de IVA que exige
 * el SRI (Ecuador). Portado 1:1 del módulo Odoo `payon_payment_acquirer.py`:
 * TLV 004=IVA, 052=base 0%, 003=eCommerceId, 051=serviceProviderId, 053=base gravada.
 */
export function buildIvaCustomParameter(
  iva: IvaBreakdown,
  ecommerceId: string,
  serviceProviderId: string,
): string {
  const tax = money13(iva.tax)
  const baseZero = money13(iva.baseZero)
  const baseTaxed = money13(iva.baseTaxed)

  let inner = ""
  inner += tlvField("004", tax)
  inner += tlvField("052", baseZero)
  inner += tlvField("003", ecommerceId)
  inner += tlvField("051", serviceProviderId)
  inner += tlvField("053", baseTaxed)
  // prefijo de longitud total (4 dígitos)
  return String(inner.length).padStart(4, "0") + inner
}

/**
 * Construye el cuerpo x-www-form-urlencoded para POST /v1/checkouts.
 * `paymentType: DB` (débito/captura inmediata), `currency: USD`.
 */
export function buildCheckoutForm(
  config: AppConfig,
  input: DatafastCheckoutInput,
): URLSearchParams {
  const iva = computeIva(input.items, config.taxRate)
  const c = input.customer || {}
  const params = new URLSearchParams()

  params.set("entityId", config.datafastEntityId || "")
  params.set("amount", iva.total.toFixed(2))
  params.set("currency", "USD")
  params.set("paymentType", "DB")
  params.set("merchantTransactionId", input.reference)

  if (c.givenName) params.set("customer.givenName", c.givenName)
  if (c.middleName) params.set("customer.middleName", c.middleName)
  if (c.surname) params.set("customer.surname", c.surname)
  if (c.email) params.set("customer.email", c.email)
  if (c.phone) params.set("customer.phone", c.phone)
  if (c.ip) params.set("customer.ip", c.ip)
  if (c.idNumber) {
    params.set("customer.identificationDocType", "IDCARD")
    params.set("customer.identificationDocId", c.idNumber.slice(0, 10))
  }
  if (c.street) {
    params.set("shipping.street1", c.street)
    params.set("billing.street1", c.street)
  }
  const country = c.countryCode || "EC"
  params.set("shipping.country", country)
  params.set("billing.country", country)

  input.items.forEach((it, idx) => {
    params.set(`cart.items[${idx}].name`, it.title.slice(0, 250))
    params.set(
      `cart.items[${idx}].description`,
      (it.description || it.title).slice(0, 250),
    )
    params.set(
      `cart.items[${idx}].price`,
      round2(it.unitPrice * it.quantity).toFixed(2),
    )
    params.set(`cart.items[${idx}].quantity`, String(it.quantity))
  })

  if (config.datafastCustomerName) {
    params.set("risk.parameters[USER_DATA2]", config.datafastCustomerName)
  }

  const customParam = buildIvaCustomParameter(
    iva,
    config.datafastEcommerceId || "",
    config.datafastServiceProviderId || "",
  )
  params.set(
    `customParameters[${config.datafastMid || ""}_${config.datafastTid || ""}]`,
    customParam,
  )

  if (config.datafastEnv !== "live") {
    params.set("testMode", "EXTERNAL")
  }

  return params
}

/**
 * Códigos de resultado de éxito (verificados en el módulo Odoo):
 *  - producción: 000.000.000
 *  - pruebas:    000.100.112 / 000.100.110
 */
export function isDatafastSuccess(code: string | undefined, env: "test" | "live"): boolean {
  if (!code) return false
  if (env === "live") return code === "000.000.000"
  return ["000.000.000", "000.100.112", "000.100.110"].includes(code)
}

export type DatafastCheckout = {
  checkoutId: string
  widgetUrl: string
  amount: number
  env: "test" | "live"
  provider: "datafast" | "datafast-dry-run"
}

/**
 * Crea un checkout en Datafast. En dry-run (sin credenciales) devuelve un
 * checkoutId simulado para poder cablear y probar el flujo del front sin cobrar.
 */
export async function createDatafastCheckout(
  config: AppConfig,
  input: DatafastCheckoutInput,
): Promise<DatafastCheckout> {
  const iva = computeIva(input.items, config.taxRate)
  const host = datafastHost(config)
  const env = config.datafastEnv === "live" ? "live" : "test"

  if (config.datafastDryRun || !config.datafastAccessToken || !config.datafastEntityId) {
    const fakeId = `dryrun.${input.reference}`
    return {
      checkoutId: fakeId,
      widgetUrl: `${host}/v1/paymentWidgets.js?checkoutId=${fakeId}`,
      amount: iva.total,
      env,
      provider: "datafast-dry-run",
    }
  }

  const body = buildCheckoutForm(config, input)
  const response = await fetch(`${host}/v1/checkouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.datafastAccessToken}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  })
  const text = await response.text()
  if (!response.ok) {
    throw new Error(`Datafast checkout failed: ${response.status} ${text}`)
  }
  const json = JSON.parse(text) as { id?: string; result?: { code?: string } }
  if (!json.id) {
    throw new Error(`Datafast checkout sin id: ${text}`)
  }
  return {
    checkoutId: json.id,
    widgetUrl: `${host}/v1/paymentWidgets.js?checkoutId=${json.id}`,
    amount: iva.total,
    env,
    provider: "datafast",
  }
}

export type DatafastResult = {
  status: "paid" | "failed"
  code?: string
  description?: string
  reference?: string
  amount?: number
  raw?: unknown
}

/**
 * Consulta el estado de un checkout: GET /v1/checkouts/{id}/payment?entityId=...
 * En dry-run, un checkoutId que empieza con "dryrun." se considera pagado
 * (para validar el carril de éxito del front sin cobrar de verdad).
 */
export async function getDatafastResult(
  config: AppConfig,
  checkoutId: string,
): Promise<DatafastResult> {
  const env = config.datafastEnv === "live" ? "live" : "test"

  if (config.datafastDryRun || !config.datafastAccessToken || !config.datafastEntityId) {
    if (checkoutId.startsWith("dryrun.")) {
      return {
        status: "paid",
        code: env === "live" ? "000.000.000" : "000.100.112",
        description: "DRY-RUN approved",
        reference: checkoutId.replace(/^dryrun\./, ""),
      }
    }
    return { status: "failed", code: "dryrun.unknown", description: "DRY-RUN unknown checkout" }
  }

  const host = datafastHost(config)
  const url = `${host}/v1/checkouts/${encodeURIComponent(checkoutId)}/payment?entityId=${encodeURIComponent(config.datafastEntityId)}`
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${config.datafastAccessToken}` },
  })
  const text = await response.text()
  const json = JSON.parse(text) as {
    result?: { code?: string; description?: string }
    merchantTransactionId?: string
    amount?: string
  }
  const code = json.result?.code
  return {
    status: isDatafastSuccess(code, env) ? "paid" : "failed",
    code,
    description: json.result?.description,
    reference: json.merchantTransactionId,
    amount: json.amount ? Number(json.amount) : undefined,
    raw: json,
  }
}
