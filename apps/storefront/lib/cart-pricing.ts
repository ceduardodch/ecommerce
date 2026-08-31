export type ComboPricingItem = {
  price: number
  comboPrice?: number
  comboMinimumItems?: number
  quantity: number
}

export function calculateCartPricing<T extends ComboPricingItem>(items: T[]) {
  const comboEligibleItems = items.reduce(
    (sum, item) => sum + (item.comboPrice ? item.quantity : 0),
    0,
  )
  const comboMinimumItems = items.reduce(
    (minimum, item) =>
      item.comboPrice
        ? Math.min(minimum, item.comboMinimumItems || 3)
        : minimum,
    Number.POSITIVE_INFINITY,
  )
  const comboApplied =
    Number.isFinite(comboMinimumItems) &&
    comboEligibleItems >= comboMinimumItems
  const unitPriceForItem = (item: T) =>
    comboApplied && item.comboPrice ? item.comboPrice : item.price
  const subtotalAmount = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  )
  const totalAmount = items.reduce(
    (sum, item) => sum + unitPriceForItem(item) * item.quantity,
    0,
  )

  return {
    comboEligibleItems,
    comboMinimumItems: Number.isFinite(comboMinimumItems)
      ? comboMinimumItems
      : 3,
    comboApplied,
    subtotalAmount,
    totalAmount,
    comboDiscount: subtotalAmount - totalAmount,
    unitPriceForItem,
  }
}
