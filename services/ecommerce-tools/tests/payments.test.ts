import { describe, expect, it } from "vitest"
import { loadConfig } from "../src/config.js"
import { paymentMethodsInfo } from "../src/payments.js"
import { applyCommerceSettings, publicCommerceSettings } from "../src/settings.js"

const urls = {
  COCINA_PUBLIC_URL: "https://cocina.example.com",
  BIENESTAR_PUBLIC_URL: "https://bienestar.example.com",
}

/** Lo que devuelve el Admin cuando el dueño ya cargó la cuenta. */
const savedSettings = [
  { key: "pago_transferencia_activa", value: "true", publico: true },
  { key: "pago_banco_nombre", value: "Banco Pichincha", publico: true },
  { key: "pago_banco_titular", value: "Nombre Apellido", publico: true },
  { key: "pago_banco_ruc", value: "1700000000001", publico: true },
  { key: "pago_banco_tipo_cuenta", value: "Ahorros", publico: true },
  { key: "pago_banco_numero", value: "1234567890", publico: false },
]

function configuredConfig() {
  return applyCommerceSettings(loadConfig(urls), savedSettings)
}

describe("payment-methods — formas de pago vigentes", () => {
  it("expone exactamente dos formas de pago: transferencia y tarjeta Datafast", () => {
    const info = paymentMethodsInfo(configuredConfig())
    expect(info.methods.map((method) => method.id)).toEqual([
      "transferencia",
      "tarjeta",
    ])
    expect(info.policy.mode).toBe("prepago")
  })

  it("dicta la cuenta bancaria solo cuando el Admin ya la cargó", () => {
    const info = paymentMethodsInfo(configuredConfig())
    const transferencia = info.methods.find((m) => m.id === "transferencia")
    expect(transferencia?.configured).toBe(true)
    expect(transferencia?.bankAccount).toEqual({
      bank: "Banco Pichincha",
      accountHolder: "Nombre Apellido",
      taxId: "1700000000001",
      accountType: "Ahorros",
      accountNumber: "1234567890",
    })
    expect(transferencia?.script.join(" ")).toContain("1234567890")
  })

  it("sin cuenta configurada no inventa nada y manda a escalar a humano", () => {
    const info = paymentMethodsInfo(loadConfig(urls))
    const transferencia = info.methods.find((m) => m.id === "transferencia")
    expect(transferencia?.configured).toBe(false)
    expect(transferencia?.bankAccount).toBeUndefined()
    expect(transferencia?.script.join(" ")).toContain("escala a un humano")
  })

  it("no ofrece contra entrega, deuna! ni PayPhone en ningún texto", () => {
    const info = paymentMethodsInfo(configuredConfig())
    // Los términos solo pueden vivir en `guardrails`, que es donde se prohíben.
    const sinGuardrails = JSON.stringify({
      ...info,
      guardrails: [],
    }).toLowerCase()
    for (const termino of ["pagas al recibir", "contra entrega", "deuna", "payphone"]) {
      expect(sinGuardrails).not.toContain(termino)
    }
  })

  it("da el enlace de la página de pagos de cada vertical y del checkout de tarjeta", () => {
    const info = paymentMethodsInfo(configuredConfig())
    expect(info.links.paymentsPageCocina).toBe("https://cocina.example.com/pagos")
    expect(info.links.paymentsPageBienestar).toBe(
      "https://bienestar.example.com/pagos",
    )
    expect(info.links.cardCheckout).toBe("https://cocina.example.com/checkout/pago")
  })

  it("incluye el guion de confianza con redes y guía de seguimiento", () => {
    const info = paymentMethodsInfo(configuredConfig())
    const guion = info.trust.script.join(" ").toLowerCase()
    expect(guion).toContain("instagram.com/eter.niu")
    expect(guion).toContain("guía de servientrega")
    expect(guion).toContain("reseñas")
  })
})

describe("commerce-settings — configuración del Admin sobre la de arranque", () => {
  it("aplica cupón, IVA, número de venta y redes sin tocar variables de entorno", () => {
    const config = applyCommerceSettings(loadConfig(urls), [
      { key: "comercial_cupon_cocina", value: "BIENESTARHOY", publico: true },
      { key: "comercial_iva", value: "0.12", publico: true },
      { key: "marca_whatsapp_venta", value: "593999888777", publico: true },
      { key: "marca_instagram_url", value: "https://instagram.com/otra", publico: true },
      { key: "comercial_meta_marca", value: "Eter Niu Bienestar", publico: true },
    ])

    expect(config.couponCodeCocina).toBe("BIENESTARHOY")
    expect(config.taxRate).toBe(0.12)
    expect(config.whatsappSellerNumber).toBe("593999888777")
    expect(config.brandInstagramUrl).toBe("https://instagram.com/otra")
    expect(config.metaCatalogBrand).toBe("Eter Niu Bienestar")
  })

  it("un ajuste vacío no borra el valor de arranque", () => {
    const config = applyCommerceSettings(loadConfig(urls), [
      { key: "comercial_cupon_cocina", value: "   ", publico: true },
    ])
    expect(config.couponCodeCocina).toBe("GRANITOHOY")
  })

  it("ignora un IVA fuera de rango en vez de romper la cotización", () => {
    const config = applyCommerceSettings(loadConfig(urls), [
      { key: "comercial_iva", value: "15", publico: true },
    ])
    expect(config.taxRate).toBe(0.15)
  })

  it("apaga la transferencia cuando el dueño la desactiva", () => {
    const config = applyCommerceSettings(loadConfig(urls), [
      ...savedSettings,
      { key: "pago_transferencia_activa", value: "false", publico: true },
    ])
    const transferencia = paymentMethodsInfo(config).methods.find(
      (method) => method.id === "transferencia",
    )
    expect(transferencia?.available).toBe(false)
  })

  it("el subconjunto público nunca incluye el número de cuenta", () => {
    const publico = publicCommerceSettings(configuredConfig())
    expect(JSON.stringify(publico)).not.toContain("1234567890")
    expect(publico.payment.bankName).toBe("Banco Pichincha")
    expect(publico.coupons.cocina).toBe("GRANITOHOY")
  })
})
