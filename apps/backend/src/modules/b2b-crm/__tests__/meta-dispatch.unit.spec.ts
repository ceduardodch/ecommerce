/**
 * Tests unitarios del builder de payload Meta Cloud API (W1).
 * Lógica pura: sin red ni I/O.
 */

import {
  buildMetaTemplatePayload,
  buildMetaFreeformPayload,
  loadDispatchConfig,
} from "../followup-dispatch"

describe("buildMetaTemplatePayload", () => {
  it("mapea recompra → eterniu_recompra con variables en orden", () => {
    const payload = buildMetaTemplatePayload("+593979854915", "recompra", {
      nombre: "Maria",
      producto: "Olla 20 cm",
      dias: "45",
    })

    expect(payload.messaging_product).toBe("whatsapp")
    expect(payload.to).toBe("+593979854915")
    expect(payload.type).toBe("template")
    expect(payload.template.name).toBe("eterniu_recompra")
    expect(payload.template.language.code).toBe("es")
    expect(payload.template.components).toHaveLength(1)
    const params = payload.template.components[0].parameters
    expect(params[0].text).toBe("Maria")
    expect(params[1].text).toBe("Olla 20 cm")
    expect(params[2].text).toBe("45")
  })

  it("mapea complemento → eterniu_complemento", () => {
    const payload = buildMetaTemplatePayload("+593979854915", "complemento", {
      nombre: "Carlos",
      producto: "Cuchillo Samurai",
      dias: "30",
    })
    expect(payload.template.name).toBe("eterniu_complemento")
  })

  it("mapea cuidado → eterniu_cuidado", () => {
    const payload = buildMetaTemplatePayload("+593979854915", "cuidado", {
      nombre: "Ana",
      producto: "Sarten",
      dias: "7",
    })
    expect(payload.template.name).toBe("eterniu_cuidado")
  })

  it("mapea cross_sell_cocina → eterniu_xsell_cocina", () => {
    const payload = buildMetaTemplatePayload("+593979854915", "cross_sell_cocina", {
      nombre: "Pedro",
      producto: "Combo",
      dias: "15",
    })
    expect(payload.template.name).toBe("eterniu_xsell_cocina")
  })

  it("mapea cross_sell_bienestar → eterniu_xsell_bienestar", () => {
    const payload = buildMetaTemplatePayload("+593979854915", "cross_sell_bienestar", {
      nombre: "Luisa",
      producto: "Suplemento",
      dias: "60",
    })
    expect(payload.template.name).toBe("eterniu_xsell_bienestar")
  })

  it("clave desconocida cae a eterniu_recompra", () => {
    const payload = buildMetaTemplatePayload("+593979854915", "inexistente", {
      nombre: "Test",
      producto: "Test",
      dias: "1",
    })
    expect(payload.template.name).toBe("eterniu_recompra")
  })

  it("template tiene exactamente 3 parámetros body", () => {
    const payload = buildMetaTemplatePayload("+593979854915", "estacional", {
      nombre: "X",
      producto: "Y",
      dias: "Z",
    })
    expect(payload.template.components[0].parameters).toHaveLength(3)
    expect(
      payload.template.components[0].parameters.every((p) => p.type === "text"),
    ).toBe(true)
  })
})

describe("buildMetaFreeformPayload", () => {
  it("construye payload de texto libre", () => {
    const payload = buildMetaFreeformPayload(
      "+593979854915",
      "Hola Maria, ¿te ayudo con algo más?",
    )
    expect(payload.messaging_product).toBe("whatsapp")
    expect(payload.to).toBe("+593979854915")
    expect(payload.type).toBe("text")
    expect(payload.text.body).toBe("Hola Maria, ¿te ayudo con algo más?")
  })
})

describe("loadDispatchConfig con modo meta", () => {
  it("activa meta solo cuando se pide explícitamente", () => {
    const config = loadDispatchConfig({
      CRM_FOLLOWUP_DISPATCH_MODE: "meta",
      WHATSAPP_PHONE_NUMBER_ID: "123456789",
      WHATSAPP_ACCESS_TOKEN: "EAAtest",
      META_API_VERSION: "v23.0",
    } as unknown as NodeJS.ProcessEnv)
    expect(config.mode).toBe("meta")
    expect(config.whatsappPhoneNumberId).toBe("123456789")
    expect(config.whatsappAccessToken).toBe("EAAtest")
    expect(config.metaApiVersion).toBe("v23.0")
  })

  it("draft y openclaw siguen funcionando igual", () => {
    expect(
      loadDispatchConfig({} as NodeJS.ProcessEnv).mode,
    ).toBe("draft")
    expect(
      loadDispatchConfig({
        CRM_FOLLOWUP_DISPATCH_MODE: "openclaw",
      } as unknown as NodeJS.ProcessEnv).mode,
    ).toBe("openclaw")
  })

  it("metaApiVersion tiene fallback v23.0", () => {
    const config = loadDispatchConfig({} as NodeJS.ProcessEnv)
    expect(config.metaApiVersion).toBe("v23.0")
  })
})
