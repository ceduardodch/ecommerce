import type { Metadata } from "next"
import { kitchenBaseUrl } from "../lib/domains"
import { MetaPixel } from "./components/analytics"
import "./globals.css"
import "./theme.css"

export const metadata: Metadata = {
  title: "Eter Niu Cocina | Ollas de granito y guias por WhatsApp",
  description:
    "Ollas, woks y sets de granito para cocinar con menos aceite, videos de uso, guias de cuidado y cotizacion por WhatsApp.",
  metadataBase: new URL(kitchenBaseUrl),
  alternates: {
    canonical: kitchenBaseUrl,
  },
  openGraph: {
    title: "Eter Niu Cocina",
    description:
      "Ollas y woks de granito con videos, guias y asesor por WhatsApp para elegir segun tu familia y uso diario.",
    url: kitchenBaseUrl,
    siteName: "Eter Niu Cocina",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        {children}
        <MetaPixel />
      </body>
    </html>
  )
}
