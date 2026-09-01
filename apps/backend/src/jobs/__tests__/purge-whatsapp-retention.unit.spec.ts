import { retentionCutoff } from "../purge-whatsapp-retention"

describe("purge-whatsapp-retention", () => {
  it("calcula el límite de 24 meses sin aproximarlo por días", () => {
    expect(retentionCutoff(new Date("2026-09-01T12:00:00.000Z")).toISOString())
      .toBe("2024-09-01T12:00:00.000Z")
  })
})
