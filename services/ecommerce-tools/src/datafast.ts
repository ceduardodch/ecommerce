import type { AppConfig } from "./config.js"

// ---------------------------------------------------------------------------
// Datafast (DataFast Ecuador / ACI oppwa Copy&Pay)
// Alineado a la "Guía de implementación Dataweb v3.2.2" (certificación):
//  - Endpoints eu-test / eu-prod (los hosts sin "eu-" fueron desactivados, v3.2)
//  - Campos obligatorios fase 2 (customer.*, cart.items[n].*, shipping/billing)
//  - customParameters SHOPPER_VAL_BASE0/BASEIMP/IVA + SHOPPER_MID/TID +
//    SHOPPER_ECI/PSERV/VERSIONDF + risk.parameters[USER_DATA2]
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

const HOST_LIVE = "https://eu-prod.oppwa.com"
const HOST_TEST = "https://eu-test.oppwa.com"

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
    // Guía 3.2.1.9: siempre 10 caracteres; RUC se corta, cortos se rellenan
    // con ceros a la izquierda. Debe coexistir con identificationDocType.
    const doc = c.idNumber.replace(/\D/g, "").slice(0, 10).padStart(10, "0")
    params.set("customer.identificationDocType", "IDCARD")
    params.set("customer.identificationDocId", doc)
  }
  // Guía 3.2.1.5: id único del cliente en el comercio (máx. 16).
  const merchantCustomerId = (
    c.idNumber?.replace(/\D/g, "") ||
    c.phone?.replace(/\D/g, "") ||
    input.reference
  ).slice(0, 16)
  params.set("customer.merchantCustomerId", merchantCustomerId)
  if (c.street) {
    params.set("shipping.street1", c.street)
    params.set("billing.street1", c.street)
  }
  const country = c.countryCode || "EC"
  params.set("shipping.country", country)
  params.set("billing.country", country)

  input.items.forEach((it, idx) => {
    // Guía 3.2.1.10.1: el nombre no acepta "&".
    params.set(`cart.items[${idx}].name`, it.title.replace(/&/g, "y").slice(0, 250))
    params.set(
      `cart.items[${idx}].description`,
      (it.description || it.title).replace(/&/g, "y").slice(0, 250),
    )
    // Guía 3.2.1.10.3: precio UNITARIO del producto (la cantidad va aparte).
    params.set(`cart.items[${idx}].price`, round2(it.unitPrice).toFixed(2))
    params.set(`cart.items[${idx}].quantity`, String(it.quantity))
  })

  // Guía 3.2.1.18: nombre del comercio, obligatorio para antifraude.
  params.set(
    "risk.parameters[USER_DATA2]",
    (config.datafastCustomerName || "ETERNIU").slice(0, 30),
  )

  // Guía 3.2.1.17.1: desglose de impuestos (formato #.##, 2 decimales).
  // Regla: BASE0 + BASEIMP + IVA debe ser exactamente igual a amount
  // (código 800.100.199 si no cuadra).
  params.set("customParameters[SHOPPER_VAL_BASE0]", iva.baseZero.toFixed(2))
  params.set("customParameters[SHOPPER_VAL_BASEIMP]", iva.baseTaxed.toFixed(2))
  params.set("customParameters[SHOPPER_VAL_IVA]", iva.tax.toFixed(2))

  // Guía 3.2.1.17.2: MID/TID (en fase 2 son 1000000406 / PD100406; en
  // producción los entrega Datafast).
  if (config.datafastMid) params.set("customParameters[SHOPPER_MID]", config.datafastMid)
  if (config.datafastTid) params.set("customParameters[SHOPPER_TID]", config.datafastTid)

  // Guía 3.2.1.17.3: identificadores fijos de seguridad y proveedor.
  params.set(
    "customParameters[SHOPPER_ECI]",
    config.datafastEcommerceId || "0103910",
  )
  params.set(
    "customParameters[SHOPPER_PSERV]",
    config.datafastServiceProviderId || "17913101",
  )
  // Guía 3.2.1.17.4: versión del esquema de campos.
  params.set("customParameters[SHOPPER_VERSIONDF]", "2")

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
  paymentBrand?: string
  paymentId?: string
  ndc?: string
  authorizationCode?: string
  raw?: unknown
}

export function normalizeDatafastResourcePath(resourcePath: string | undefined) {
  if (!resourcePath) return undefined
  let pathname = resourcePath
  try {
    const parsed = new URL(resourcePath)
    pathname = parsed.pathname
  } catch {
    // Datafast normally returns a path, not an absolute URL.
  }
  if (!/^\/v1\/checkouts\/[^/]+\/payment$/.test(pathname)) return undefined
  return pathname
}

/**
 * Consulta el estado de un checkout: GET /v1/checkouts/{id}/payment?entityId=...
 * Si Datafast devuelve resourcePath en el retorno, se prefiere esa ruta validada.
 * En dry-run, un checkoutId que empieza con "dryrun." se considera pagado
 * (para validar el carril de éxito del front sin cobrar de verdad).
 */
export async function getDatafastResult(
  config: AppConfig,
  checkoutId: string,
  resourcePath?: string,
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
  const normalizedResourcePath = normalizeDatafastResourcePath(resourcePath)
  const path =
    normalizedResourcePath ||
    `/v1/checkouts/${encodeURIComponent(checkoutId)}/payment`
  const url = `${host}${path}?entityId=${encodeURIComponent(config.datafastEntityId)}`
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${config.datafastAccessToken}` },
  })
  const text = await response.text()
  const json = JSON.parse(text) as {
    id?: string
    result?: { code?: string; description?: string }
    merchantTransactionId?: string
    amount?: string
    paymentBrand?: string
    ndc?: string
    resultDetails?: Record<string, string | undefined>
  }
  const code = json.result?.code
  const authorizationCode =
    json.resultDetails?.AuthorizationCode ||
    json.resultDetails?.authorizationCode ||
    json.resultDetails?.AuthCode
  return {
    status: isDatafastSuccess(code, env) ? "paid" : "failed",
    code,
    description: json.result?.description,
    reference: json.merchantTransactionId,
    amount: json.amount ? Number(json.amount) : undefined,
    paymentBrand: json.paymentBrand,
    paymentId: json.id,
    ndc: json.ndc,
    authorizationCode,
    raw: json,
  }
}
