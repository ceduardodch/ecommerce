import { describe, expect, it } from "vitest"
import { loadConfig } from "../src/config.js"
import {
  canonicalizeEterNiuPublicUrls,
  ETER_NIU_PUBLIC_URLS,
} from "../src/public-domains.js"

describe("dominios públicos de Eter Niu", () => {
  it("define la marca, tiendas y administración bajo eter-niu.com", () => {
    expect(ETER_NIU_PUBLIC_URLS).toEqual({
      brand: "https://eter-niu.com",
      kitchen: "https://cocina.eter-niu.com",
      wellness: "https://bienestar.eter-niu.com",
      admin: "https://admin.eter-niu.com",
    })
  })

  it("corrige todos los hosts públicos heredados", () => {
    expect(
      canonicalizeEterNiuPublicUrls(
        "https://shop.b2b.com.ec https://cocina.b2b.com.ec " +
          "https://bienestar.b2b.com.ec https://adminshop.b2b.com.ec",
      ),
    ).toBe(
      "https://eter-niu.com https://cocina.eter-niu.com " +
        "https://bienestar.eter-niu.com https://admin.eter-niu.com",
    )
  })

  it("normaliza variables antiguas al cargar la configuración", () => {
    const config = loadConfig({
      NODE_ENV: "test",
      STORE_PUBLIC_URL: "https://shop.b2b.com.ec",
      COCINA_PUBLIC_URL: "https://cocina.b2b.com.ec",
      BIENESTAR_PUBLIC_URL: "https://bienestar.b2b.com.ec",
    } as NodeJS.ProcessEnv)

    expect(config.storePublicUrl).toBe("https://eter-niu.com")
    expect(config.kitchenPublicUrl).toBe("https://cocina.eter-niu.com")
    expect(config.wellnessPublicUrl).toBe("https://bienestar.eter-niu.com")
  })
})
