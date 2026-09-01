import { headers } from "next/headers"
import type { Metadata } from "next"
import { brandBaseUrl, kitchenBaseUrl, wellnessBaseUrl } from "./domains"

/**
 * Metadata para páginas que nunca deben aparecer en un buscador: carrito,
 * checkout, sandbox de pagos y el catálogo interno de UI. Indexarlas gasta
 * presupuesto de rastreo y mete rutas sin valor en los resultados.
 */
export const noIndexMetadata: Metadata = {
  robots: { index: false, follow: false },
}

function hostnameOf(url: string) {
  try {
    return new URL(url).hostname.toLowerCase()
  } catch {
    return ""
  }
}

export type SiteVertical = "cocina" | "bienestar" | "marca"

/**
 * Una sola app Next sirve tres hosts (marca, cocina, bienestar) y el
 * `middleware` decide qué se renderiza en cada uno. `sitemap.xml` y
 * `robots.txt` tienen que responder lo del host que los pide: si el sitemap de
 * bienestar listara URLs de cocina, Google vería dominios cruzados sin
 * verificar y descartaría la mitad.
 *
 * Los hosts se derivan de las mismas variables de entorno que usa el resto del
 * sitio, para no mantener una segunda lista que se desincronice del middleware.
 */
export async function siteContextFromRequest(): Promise<{
  baseUrl: string
  vertical: SiteVertical
}> {
  const host = (await headers()).get("host")?.split(":")[0]?.toLowerCase() || ""

  if (host === hostnameOf(wellnessBaseUrl) || host.startsWith("bienestar.")) {
    return { baseUrl: wellnessBaseUrl, vertical: "bienestar" }
  }
  if (host === hostnameOf(brandBaseUrl)) {
    return { baseUrl: brandBaseUrl, vertical: "marca" }
  }
  return { baseUrl: kitchenBaseUrl, vertical: "cocina" }
}

/** URL absoluta de una ruta dentro de la vertical indicada. */
export function absoluteUrl(path: string, baseUrl = kitchenBaseUrl) {
  return new URL(path, baseUrl).toString()
}

/**
 * Canónica propia de una página.
 *
 * El layout raíz NO declara `alternates.canonical`: si lo hiciera, toda página
 * que no lo sobrescriba heredaría la canónica de la portada y le diría a Google
 * que es un duplicado de la home. Cada página declara la suya con este helper.
 */
export function canonical(path: string, baseUrl = kitchenBaseUrl): Metadata {
  return { alternates: { canonical: absoluteUrl(path, baseUrl) } }
}

const instagramProfile = "https://instagram.com/eter.niu"

/**
 * Datos estructurados schema.org de `Organization` + `WebSite` para la
 * portada de cada host.
 *
 * Sin `potentialAction` (`SearchAction`, lo que activa el sitelinks
 * searchbox): el `?q=` de la portada de cocina existe en el tipo de
 * `searchParams` pero hoy no filtra nada (solo llega a `PageAnalytics`), así
 * que declarar una búsqueda que no busca de verdad sería un dato
 * estructurado engañoso. Sumar `potentialAction` cuando ese `q` filtre el
 * grid de verdad.
 */
export function buildOrganizationJsonLd(name: string, baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url: baseUrl,
    logo: absoluteUrl("/icon.svg", baseUrl),
    sameAs: [instagramProfile],
  }
}

export function buildWebSiteJsonLd(name: string, baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url: baseUrl,
  }
}
