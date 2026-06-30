import { describe, expect, it } from "vitest"
import { loadConfig } from "../src/config.js"
import {
  buildCheckoutForm,
  buildIvaCustomParameter,
  computeIva,
  createDatafastCheckout,
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

  it("construye el TLV de customParameters con prefijo de longitud correcto", () => {
    const iva = computeIva(items, 0.15)
    const tlv = buildIvaCustomParameter(iva, "EC123", "SP456")
    // prefijo = 4 dígitos con la longitud del resto
    const declaredLen = Number(tlv.slice(0, 4))
    expect(tlv.length - 4).toBe(declaredLen)
    // contiene los códigos TLV esperados (004 IVA, 052 base0, 003 eComm, 051 SP, 053 base)
    expect(tlv).toContain("003005EC123") // code 003, len 005, value EC123
    expect(tlv).toContain("051005SP456")
    // los montos van como 12 dígitos sin punto
    const taxDigits = iva.tax.toFixed(2).replace(".", "").padStart(12, "0")
    expect(tlv).toContain(taxDigits)
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
    // cédula recortada a 10 dígitos
    expect(form.get("customer.identificationDocId")).toBe("1712345678")
    // el customParameters va con la clave MID_TID
    expect(form.get("customParameters[MID1_TID1]")).toBeTruthy()
    // items
    expect(form.get("cart.items[0].name")).toBe("Olla de granito 24cm")
    expect(form.get("cart.items[1].quantity")).toBe("2")
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
