import type { Metadata } from "next"
import { noIndexMetadata } from "../../lib/seo"

// Cubre /checkout/pago y /checkout/resultado, ambos client components.
export const metadata: Metadata = noIndexMetadata

export default function CheckoutLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children
}
