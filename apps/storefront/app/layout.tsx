import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "B2B Cocina | Ollas, cuchillos y combos por WhatsApp",
  description:
    "Catalogo de cocina con ollas, cuchillos, utensilios, combos, cotizacion por WhatsApp y pago por link.",
  metadataBase: new URL("https://shop.b2b.com.ec"),
  openGraph: {
    title: "B2B Cocina",
    description:
      "Ollas, cuchillos y combos de cocina con vendedor IA por WhatsApp.",
    url: "https://shop.b2b.com.ec",
    siteName: "B2B Cocina",
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
