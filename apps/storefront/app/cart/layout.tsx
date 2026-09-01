import type { Metadata } from "next"
import { noIndexMetadata } from "../../lib/seo"

// El carrito es un client component y no puede exportar `metadata`; el layout
// del segmento sí. Ver `noIndexMetadata` para el porqué del noindex.
export const metadata: Metadata = noIndexMetadata

export default function CartLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children
}
