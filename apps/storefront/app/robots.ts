import type { MetadataRoute } from "next"
import { absoluteUrl, siteContextFromRequest } from "../lib/seo"

// Depende del host de la petición, así que no puede prerenderizarse.
export const dynamic = "force-dynamic"

/**
 * `Sitemap:` apunta al host que pregunta — cada dominio publica el suyo.
 *
 * Las rutas bloqueadas no aportan nada en búsqueda y sí gastan presupuesto de
 * rastreo: el carrito y el checkout son estado del usuario, `/api` no es
 * contenido, y `/dev/ui` es el catálogo interno de componentes.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const { baseUrl } = await siteContextFromRequest()

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/cart", "/checkout/", "/payphone/", "/dev/"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml", baseUrl),
  }
}
