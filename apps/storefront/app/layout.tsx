import type { Metadata } from "next"
import { Fraunces, Inter } from "next/font/google"
import { kitchenBaseUrl } from "../lib/domains"
import { MetaPixel } from "./components/analytics"
import { CartProvider } from "../contexts/CartContext"
import { CartController } from "./components/cart/cart-controller"
import "./globals.css"
import "./theme.css"

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-fraunces",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

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
    <html lang="es" className={`${fraunces.variable} ${inter.variable}`}>
      <body>
        <CartProvider>
          {children}
          <CartController />
          <MetaPixel />
        </CartProvider>
      </body>
    </html>
  )
}
