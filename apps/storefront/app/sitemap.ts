import type { MetadataRoute } from "next"
import { getProductsForVertical, productSlug } from "../lib/catalog"
import { absoluteUrl, siteContextFromRequest } from "../lib/seo"

// Depende del host de la petición, así que no puede prerenderizarse.
export const dynamic = "force-dynamic"

/**
 * Un sitemap por host.
 *
 * Los tres dominios (marca, cocina, bienestar) los sirve la misma app Next, así
 * que este archivo tiene que responder solo las URLs del host que pregunta:
 * un sitemap que mezclara dominios haría que Google descartara las entradas del
 * dominio que no está pidiendo.
 *
 * Solo se listan URLs con canónica propia. El carrito, el checkout y el sandbox
 * de pagos van con `noindex` y quedan fuera a propósito.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { baseUrl, vertical } = await siteContextFromRequest()
  const url = (path: string) => absoluteUrl(path, baseUrl)

  if (vertical === "marca") {
    return [
      { url: url("/"), changeFrequency: "monthly", priority: 1 },
      { url: url("/terminos"), changeFrequency: "yearly", priority: 0.3 },
      { url: url("/privacidad"), changeFrequency: "yearly", priority: 0.3 },
      {
        url: url("/envios-devoluciones"),
        changeFrequency: "yearly",
        priority: 0.3,
      },
    ]
  }

  // Si el catálogo no responde, el sitemap sale igual con las páginas fijas en
  // vez de devolver un 500 al rastreador.
  const products = await getProductsForVertical(vertical).catch(() => [])

  if (vertical === "bienestar") {
    return [
      { url: url("/"), changeFrequency: "weekly", priority: 1 },
      ...products.map((product) => ({
        // En bienestar la ficha pública es la campaña (es lo que enlaza el home).
        url: url(`/campanas/${productSlug(product)}`),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    ]
  }

  return [
    { url: url("/"), changeFrequency: "weekly", priority: 1 },
    { url: url("/guias"), changeFrequency: "monthly", priority: 0.6 },
    {
      url: url("/guias/teflon-pfas"),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...products.map((product) => ({
      url: url(`/products/${productSlug(product)}`),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ]
}
