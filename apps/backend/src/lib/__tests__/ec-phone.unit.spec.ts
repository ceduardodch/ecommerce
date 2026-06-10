import { isNormalizedEcPhone, normalizeEcPhone } from "../ec-phone"

describe("normalizeEcPhone", () => {
  it("convierte celular local 09XXXXXXXX a +593", () => {
    expect(normalizeEcPhone("0979854915").phone).toBe("+593979854915")
  })

  it("convierte celular sin cero 9XXXXXXXX a +593", () => {
    expect(normalizeEcPhone("979854915").phone).toBe("+593979854915")
  })

  it("acepta formato 593 sin signo", () => {
    expect(normalizeEcPhone("593979854915").phone).toBe("+593979854915")
  })

  it("conserva +593 ya normalizado", () => {
    expect(normalizeEcPhone("+593979854915").phone).toBe("+593979854915")
  })

  it("limpia espacios, guiones y paréntesis", () => {
    expect(normalizeEcPhone(" (09) 7985-4915 ").phone).toBe("+593979854915")
  })

  it("acepta internacionales con +", () => {
    expect(normalizeEcPhone("+5215512345678").phone).toBe("+5215512345678")
  })

  it("rechaza vacío", () => {
    expect(normalizeEcPhone("").error).toBe("telefono_vacio")
    expect(normalizeEcPhone(undefined).error).toBe("telefono_vacio")
  })

  it("rechaza basura y números imposibles", () => {
    expect(normalizeEcPhone("hola").error).toBe("telefono_invalido")
    expect(normalizeEcPhone("123").error).toBe("telefono_invalido")
    expect(normalizeEcPhone("59312").error).toBe("telefono_ec_invalido")
  })

  it("isNormalizedEcPhone valida el formato final", () => {
    expect(isNormalizedEcPhone("+593979854915")).toBe(true)
    expect(isNormalizedEcPhone("0979854915")).toBe(false)
  })
})
