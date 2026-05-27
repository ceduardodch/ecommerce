import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "B2B Shop | Ecommerce conversacional",
  description:
    "Catalogo B2B con atencion por WhatsApp, cotizacion asistida por IA y pago por link.",
  metadataBase: new URL("https://shop.b2b.com.ec"),
  openGraph: {
    title: "B2B Shop",
    description: "Catalogo conversacional con vendedor IA por WhatsApp.",
    url: "https://shop.b2b.com.ec",
    siteName: "B2B Shop",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
