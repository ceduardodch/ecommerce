export type ComboPricingItem = {
  price: number
  comboPrice?: number
  comboMinimumItems?: number
  comboGroup?: string
  quantity: number
}

export function calculateCartPricing<T extends ComboPricingItem>(items: T[]) {
  const eligibleByGroup = new Map<string, number>()
  const minimumByGroup = new Map<string, number>()
  for (const item of items) {
    if (!item.comboPrice) continue
    const group = item.comboGroup || "general"
    eligibleByGroup.set(group, (eligibleByGroup.get(group) || 0) + item.quantity)
    minimumByGroup.set(
      group,
      Math.min(minimumByGroup.get(group) || Number.POSITIVE_INFINITY, item.comboMinimumItems || 3),
    )
  }
  const activeGroups = new Set(
    [...eligibleByGroup.keys()].filter(
      (group) => (eligibleByGroup.get(group) || 0) >= (minimumByGroup.get(group) || 3),
    ),
  )
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
  const comboApplied = activeGroups.size > 0
  const unitPriceForItem = (item: T) =>
    item.comboPrice && activeGroups.has(item.comboGroup || "general")
      ? item.comboPrice
      : item.price
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
