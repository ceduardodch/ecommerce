import { describe, expect, it } from "vitest"
import { loadConfig } from "../src/config.js"
import {
  buildCheckoutForm,
  computeIva,
  createDatafastCheckout,
  datafastHost,
  getDatafastResult,
  isDatafastSuccess,
} from "../src/datafast.js"

const items = [
  { title: "Olla de granito 24cm", sku: "MGC-OLLA-24", quantity: 1, unitPrice: 95 },
  { title: "Mat de yoga", sku: "BIE-MAT", quantity: 2, unitPrice: 30 },
]

describe("datafast — IVA / desglose SRI", () => {
  it("recalcula total y desglosa IVA 15% sacándolo del total (precio incl. IVA)", () => {
    const iva = computeIva(items, 0.15)
    expect(iva.total).toBe(155) // 95 + 2*30
    // base = 155 / 1.15 = 134.78 ; iva = 20.22
    expect(iva.baseTaxed).toBe(134.78)
    expect(iva.tax).toBe(20.22)
    expect(iva.baseZero).toBe(0)
    // la base + iva debe reconstruir el total
    expect(Math.round((iva.baseTaxed + iva.tax) * 100) / 100).toBe(155)
  })

  it("BASE0 + BASEIMP + IVA reconstruyen exactamente el amount (regla 800.100.199)", () => {
    // montos con decimales que fuerzan redondeo
    const tricky = [{ title: "X", quantity: 3, unitPrice: 33.33 }]
    const iva = computeIva(tricky, 0.15)
    const sum = Math.round((iva.baseZero + iva.baseTaxed + iva.tax) * 100) / 100
    expect(sum).toBe(iva.total)
  })
})

describe("datafast — endpoints guía v3.2.2", () => {
  it("usa eu-test / eu-prod (los hosts sin 'eu-' fueron desactivados)", () => {
    expect(datafastHost(loadConfig({ DATAFAST_ENV: "test" }))).toBe(
      "https://eu-test.oppwa.com",
    )
    expect(datafastHost(loadConfig({ DATAFAST_ENV: "live" }))).toBe(
      "https://eu-prod.oppwa.com",
    )
  })
})

describe("datafast — códigos de resultado", () => {
  it("éxito en producción solo con 000.000.000", () => {
    expect(isDatafastSuccess("000.000.000", "live")).toBe(true)
    expect(isDatafastSuccess("000.100.112", "live")).toBe(false)
  })
  it("éxito en pruebas con 000.100.112 / 000.100.110", () => {
    expect(isDatafastSuccess("000.100.112", "test")).toBe(true)
    expect(isDatafastSuccess("000.100.110", "test")).toBe(true)
    expect(isDatafastSuccess("800.400.500", "test")).toBe(false)
    expect(isDatafastSuccess(undefined, "test")).toBe(false)
  })
})

describe("datafast — payload del checkout", () => {
  it("arma el form con entityId, amount, paymentType DB y testMode en test", () => {
    const config = loadConfig({
      ECOMMERCE_TAX_RATE: "0.15",
      DATAFAST_ENV: "test",
      DATAFAST_ENTITY_ID: "ent_123",
      DATAFAST_MID: "MID1",
      DATAFAST_TID: "TID1",
    })
    const form = buildCheckoutForm(config, {
      reference: "etn_1",
      items,
      customer: { givenName: "Maria", surname: "Prueba", idNumber: "1712345678901" },
    })
    expect(form.get("entityId")).toBe("ent_123")
    expect(form.get("amount")).toBe("155.00")
    expect(form.get("paymentType")).toBe("DB")
    expect(form.get("currency")).toBe("USD")
    expect(form.get("testMode")).toBe("EXTERNAL")
    // RUC recortado a 10 dígitos
    expect(form.get("customer.identificationDocId")).toBe("1712345678")
    expect(form.get("customer.identificationDocType")).toBe("IDCARD")
    // id del cliente en el comercio (máx. 16)
    expect(form.get("customer.merchantCustomerId")).toBe("1712345678901")
    // items: precio UNITARIO y sin "&" en el nombre
    expect(form.get("cart.items[0].name")).toBe("Olla de granito 24cm")
    expect(form.get("cart.items[1].price")).toBe("30.00")
    expect(form.get("cart.items[1].quantity")).toBe("2")
    // desglose de impuestos SHOPPER_* (guía 3.2.1.17.1)
    expect(form.get("customParameters[SHOPPER_VAL_BASE0]")).toBe("0.00")
    expect(form.get("customParameters[SHOPPER_VAL_BASEIMP]")).toBe("134.78")
    expect(form.get("customParameters[SHOPPER_VAL_IVA]")).toBe("20.22")
    // MID/TID + identificadores fijos + versión
    expect(form.get("customParameters[SHOPPER_MID]")).toBe("MID1")
    expect(form.get("customParameters[SHOPPER_TID]")).toBe("TID1")
    expect(form.get("customParameters[SHOPPER_ECI]")).toBe("0103910")
    expect(form.get("customParameters[SHOPPER_PSERV]")).toBe("17913101")
    expect(form.get("customParameters[SHOPPER_VERSIONDF]")).toBe("2")
    // comercio para antifraude
    expect(form.get("risk.parameters[USER_DATA2]")).toBeTruthy()
    // el customParameters TLV viejo (clave MID_TID) ya no debe existir
    expect(form.get("customParameters[MID1_TID1]")).toBeNull()
  })

  it("rellena la cédula corta con ceros a la izquierda (guía 3.2.1.9)", () => {
    const config = loadConfig({ DATAFAST_ENV: "test", DATAFAST_ENTITY_ID: "e" })
    const form = buildCheckoutForm(config, {
      reference: "etn_2",
      items,
      customer: { idNumber: "917345678" },
    })
    expect(form.get("customer.identificationDocId")).toBe("0917345678")
  })

  it("en live NO envía testMode (Anexo I)", () => {
    const config = loadConfig({ DATAFAST_ENV: "live", DATAFAST_ENTITY_ID: "e" })
    const form = buildCheckoutForm(config, { reference: "etn_3", items })
    expect(form.get("testMode")).toBeNull()
  })
})

describe("datafast — dry-run (sin credenciales)", () => {
  const config = loadConfig({ DATAFAST_DRY_RUN: "true", ECOMMERCE_TAX_RATE: "0.15" })

  it("createCheckout devuelve checkoutId simulado y monto correcto", async () => {
    const out = await createDatafastCheckout(config, { reference: "etn_X", items })
    expect(out.provider).toBe("datafast-dry-run")
    expect(out.checkoutId).toBe("dryrun.etn_X")
    expect(out.amount).toBe(155)
    expect(out.widgetUrl).toContain("paymentWidgets.js?checkoutId=dryrun.etn_X")
  })

  it("getResult marca pagado un checkout dry-run", async () => {
    const res = await getDatafastResult(config, "dryrun.etn_X")
    expect(res.status).toBe("paid")
    expect(res.reference).toBe("etn_X")
  })

  it("getResult marca fallido un checkout desconocido en dry-run", async () => {
    const res = await getDatafastResult(config, "algo.raro")
    expect(res.status).toBe("failed")
  })
})
