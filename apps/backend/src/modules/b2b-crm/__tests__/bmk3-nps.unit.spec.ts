/**
 * Tests unitarios para BMK-3: NPS + referidos.
 * Cubre el mapeo de templateKeyFromReason para nps_* y referido.
 */

import { templateKeyFromReason } from "../followup-dispatch"

describe("templateKeyFromReason — NPS y referido (BMK-3)", () => {
  it("mapea 'nps_postentrega' → 'nps'", () => {
    expect(templateKeyFromReason("nps_postentrega")).toBe("nps")
  })

  it("mapea 'nps' → 'nps'", () => {
    expect(templateKeyFromReason("nps")).toBe("nps")
  })

  it("mapea 'nps_otro' → 'nps'", () => {
    expect(templateKeyFromReason("nps_otro")).toBe("nps")
  })

  it("mapea 'NPS_postentrega' (mayúsculas) → 'nps'", () => {
    expect(templateKeyFromReason("NPS_postentrega")).toBe("nps")
  })

  it("mapea 'referido' → 'referido'", () => {
    expect(templateKeyFromReason("referido")).toBe("referido")
  })

  it("mapea 'referido_amigo' → 'referido'", () => {
    expect(templateKeyFromReason("referido_amigo")).toBe("referido")
  })

  it("NO confunde 'nps' con 'recompra'", () => {
    expect(templateKeyFromReason("recompra")).toBe("recompra")
    expect(templateKeyFromReason("recompra_o_complemento_cocina")).toBe("recompra")
  })

  it("sin reason → 'generico'", () => {
    expect(templateKeyFromReason(undefined)).toBe("generico")
    expect(templateKeyFromReason(null)).toBe("generico")
    expect(templateKeyFromReason("")).toBe("generico")
  })

  it("reason desconocido → 'generico'", () => {
    expect(templateKeyFromReason("seguimiento_comercial")).toBe("generico")
  })

  it("mapeos existentes no regresionan", () => {
    expect(templateKeyFromReason("complemento")).toBe("complemento")
    expect(templateKeyFromReason("cuidado")).toBe("cuidado")
    expect(templateKeyFromReason("estacional")).toBe("estacional")
    expect(templateKeyFromReason("cross_sell_cocina")).toBe("cross_sell_cocina")
    expect(templateKeyFromReason("cross_sell_bienestar")).toBe("cross_sell_bienestar")
  })
})
