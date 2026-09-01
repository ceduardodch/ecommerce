import { describe, expect, it } from "vitest"
import { calculateCartPricing, type ComboPricingItem } from "../lib/cart-pricing"

function item(overrides: Partial<ComboPricingItem> = {}): ComboPricingItem {
  return {
    price: 10,
    quantity: 1,
    ...overrides,
  }
}

describe("calculateCartPricing", () => {
  it("no aplica combo cuando ningún item tiene comboPrice", () => {
    const result = calculateCartPricing([
      item({ price: 10, quantity: 2 }),
      item({ price: 5, quantity: 1 }),
    ])

    expect(result.comboApplied).toBe(false)
    expect(result.subtotalAmount).toBe(25)
    expect(result.totalAmount).toBe(25)
    expect(result.comboDiscount).toBe(0)
  })

  it("no aplica combo si la cantidad elegible no llega al mínimo", () => {
    const result = calculateCartPricing([
      item({ price: 10, comboPrice: 8, comboMinimumItems: 3, quantity: 2 }),
    ])

    expect(result.comboApplied).toBe(false)
    expect(result.totalAmount).toBe(20)
  })

  it("aplica el precio combo cuando la cantidad elegible llega al mínimo", () => {
    const items = [
      item({ price: 10, comboPrice: 8, comboMinimumItems: 3, quantity: 2 }),
      item({ price: 12, comboPrice: 9, comboMinimumItems: 3, quantity: 1 }),
    ]
    const result = calculateCartPricing(items)

    expect(result.comboApplied).toBe(true)
    expect(result.comboEligibleItems).toBe(3)
    expect(result.subtotalAmount).toBe(32)
    expect(result.totalAmount).toBe(8 * 2 + 9 * 1)
    expect(result.comboDiscount).toBe(32 - (16 + 9))
  })

  it("agrupa por comboGroup y solo activa el grupo que llega al mínimo", () => {
    const items = [
      item({ price: 10, comboPrice: 8, comboGroup: "cocina", comboMinimumItems: 3, quantity: 3 }),
      item({ price: 20, comboPrice: 15, comboGroup: "bienestar", comboMinimumItems: 3, quantity: 1 }),
    ]
    const result = calculateCartPricing(items)

    expect(result.comboApplied).toBe(true)
    expect(result.unitPriceForItem(items[0])).toBe(8)
    expect(result.unitPriceForItem(items[1])).toBe(20)
  })

  it("items sin comboGroup caen todos en el grupo 'general' y se suman entre sí", () => {
    const items = [
      item({ price: 10, comboPrice: 8, comboMinimumItems: 3, quantity: 2 }),
      item({ price: 12, comboPrice: 9, comboGroup: "general", comboMinimumItems: 3, quantity: 1 }),
    ]
    const result = calculateCartPricing(items)

    expect(result.comboApplied).toBe(true)
  })

  it("usa el mínimo más bajo declarado en el grupo cuando difieren entre items", () => {
    const items = [
      item({ price: 10, comboPrice: 8, comboMinimumItems: 5, quantity: 1 }),
      item({ price: 12, comboPrice: 9, comboMinimumItems: 2, quantity: 1 }),
    ]
    const result = calculateCartPricing(items)

    // 2 items elegibles, mínimo del grupo = min(5, 2) = 2 → combo activo.
    expect(result.comboApplied).toBe(true)
    expect(result.comboMinimumItems).toBe(2)
  })

  it("usa comboMinimumItems por defecto (3) cuando no se especifica", () => {
    const items = [
      item({ price: 10, comboPrice: 8, quantity: 2 }),
    ]
    const result = calculateCartPricing(items)

    expect(result.comboMinimumItems).toBe(3)
    expect(result.comboApplied).toBe(false)
  })

  it("devuelve comboMinimumItems 3 cuando el carrito está vacío", () => {
    const result = calculateCartPricing([])

    expect(result.comboMinimumItems).toBe(3)
    expect(result.comboApplied).toBe(false)
    expect(result.subtotalAmount).toBe(0)
    expect(result.totalAmount).toBe(0)
  })

  it("unitPriceForItem devuelve el precio normal para items sin comboPrice aunque el combo esté activo", () => {
    const items = [
      item({ price: 10, comboPrice: 8, comboMinimumItems: 3, quantity: 3 }),
      item({ price: 25, quantity: 1 }),
    ]
    const result = calculateCartPricing(items)

    expect(result.comboApplied).toBe(true)
    expect(result.unitPriceForItem(items[1])).toBe(25)
  })
})
