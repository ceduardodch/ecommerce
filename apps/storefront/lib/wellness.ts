import type { Product } from "./catalog"

export function wellnessOpeningLine(product: Product) {
  return `Hola, quiero el producto de bienestar ${product.title}.`
}
