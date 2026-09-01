import type { Metadata } from "next"
import { noIndexMetadata } from "../../lib/seo"

// Sandbox de pagos: útil en pruebas, nunca en resultados de búsqueda.
export const metadata: Metadata = noIndexMetadata

export default function PayphoneLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children
}
