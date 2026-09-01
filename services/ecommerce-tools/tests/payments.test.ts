import { describe, expect, it } from "vitest"
import { loadConfig } from "../src/config.js"
import { paymentMethodsInfo } from "../src/payments.js"

const bankEnv = {
  BANK_NAME: "Banco Pichincha",
  BANK_ACCOUNT_HOLDER: "Nombre Apellido",
  BANK_ACCOUNT_TAX_ID: "1700000000001",
  BANK_ACCOUNT_TYPE: "Ahorros",
  BANK_ACCOUNT_NUMBER: "1234567890",
  COCINA_PUBLIC_URL: "https://cocina.example.com",
  BIENESTAR_PUBLIC_URL: "https://bienestar.example.com",
}

describe("payment-methods — formas de pago vigentes", () => {
  it("expone exactamente dos formas de pago: transferencia y tarjeta Datafast", () => {
    const info = paymentMethodsInfo(loadConfig(bankEnv))
    expect(info.methods.map((method) => method.id)).toEqual([
      "transferencia",
      "tarjeta",
    ])
    expect(info.policy.mode).toBe("prepago")
  })

  it("dicta la cuenta bancaria solo cuando viene por env", () => {
    const info = paymentMethodsInfo(loadConfig(bankEnv))
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

  it("sin datos de cuenta no inventa nada y manda a escalar a humano", () => {
    const info = paymentMethodsInfo(loadConfig({}))
    const transferencia = info.methods.find((m) => m.id === "transferencia")
    expect(transferencia?.configured).toBe(false)
    expect(transferencia?.bankAccount).toBeUndefined()
    expect(transferencia?.script.join(" ")).toContain("escala a un humano")
  })

  it("no ofrece contra entrega, deuna! ni PayPhone en ningún texto", () => {
    const info = paymentMethodsInfo(loadConfig(bankEnv))
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
    const info = paymentMethodsInfo(loadConfig(bankEnv))
    expect(info.links.paymentsPageCocina).toBe("https://cocina.example.com/pagos")
    expect(info.links.paymentsPageBienestar).toBe(
      "https://bienestar.example.com/pagos",
    )
    expect(info.links.cardCheckout).toBe("https://cocina.example.com/checkout/pago")
  })

  it("incluye el guion de confianza con redes y guía de seguimiento", () => {
    const info = paymentMethodsInfo(loadConfig(bankEnv))
    const guion = info.trust.script.join(" ").toLowerCase()
    expect(guion).toContain("instagram.com/eter.niu")
    expect(guion).toContain("guía de servientrega")
    expect(guion).toContain("reseñas")
  })
})
