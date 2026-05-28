"use client"

import Script from "next/script"
import { useEffect, useMemo, useRef, useState } from "react"
import type { ReactNode } from "react"
import { whatsappLink } from "../../lib/whatsapp"
import type { Product } from "../../lib/catalog"

type MetaEventName =
  | "PageView"
  | "ViewContent"
  | "Search"
  | "Lead"
  | "Contact"
  | "InitiateCheckout"
  | "Purchase"

type TrackingProduct = Pick<
  Product,
  | "id"
  | "variantId"
  | "sku"
  | "title"
  | "category"
  | "brand"
  | "price"
  | "promoLabel"
  | "material"
  | "diameterCm"
  | "stockSignal"
  | "deliveryBadge"
>

type TrackingPayload = {
  eventName: MetaEventName
  type?: string
  eventId?: string
  product?: TrackingProduct
  products?: TrackingProduct[]
  customer?: {
    name?: string
    phone?: string
    email?: string
    whatsappConsent?: boolean
    tags?: string[]
  }
  searchString?: string
  cta?: string
  placement?: string
  value?: number
  currency?: string
  leadId?: string
  metadata?: Record<string, unknown>
}

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
    _fbq?: unknown
    b2bPendingMetaEvents?: Array<{
      name: MetaEventName
      data: Record<string, unknown>
      id: string
    }>
  }
}

const consentKey = "b2b_pixel_consent"
const sessionKey = "b2b_session_id"
const attributionKey = "b2b_attribution"

function pixelConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_META_PIXEL_ID)
}

function pixelEnabled() {
  return process.env.NEXT_PUBLIC_PIXEL_ENABLED !== "false" && pixelConfigured()
}

function consentModeDisabled() {
  return process.env.NEXT_PUBLIC_PIXEL_CONSENT_MODE === "disabled"
}

function readConsent() {
  if (typeof window === "undefined") return false
  if (!pixelEnabled()) return false
  if (consentModeDisabled()) return true
  return window.localStorage.getItem(consentKey) === "accepted"
}

function readDecision() {
  if (typeof window === "undefined") return undefined
  return window.localStorage.getItem(consentKey) || undefined
}

function readCookie(name: string) {
  if (typeof document === "undefined") return undefined
  return document.cookie
    .split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith(`${name}=`))
    ?.split("=")
    .slice(1)
    .join("=")
}

function randomId(prefix: string) {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
  return `${prefix}_${id}`
}

function sessionId(consent: boolean) {
  if (!consent || typeof window === "undefined") return undefined
  const existing = window.localStorage.getItem(sessionKey)
  if (existing) return existing
  const next = randomId("session")
  window.localStorage.setItem(sessionKey, next)
  return next
}

function currentAttribution(consent: boolean) {
  if (!consent || typeof window === "undefined") return undefined

  const params = new URLSearchParams(window.location.search)
  const fromUrl = {
    utmSource: params.get("utm_source") || undefined,
    utmMedium: params.get("utm_medium") || undefined,
    utmCampaign: params.get("utm_campaign") || undefined,
    utmContent: params.get("utm_content") || undefined,
    utmTerm: params.get("utm_term") || undefined,
    fbclid: params.get("fbclid") || undefined,
  }
  const hasFreshAttribution = Object.values(fromUrl).some(Boolean)
  if (hasFreshAttribution) {
    window.localStorage.setItem(attributionKey, JSON.stringify(fromUrl))
    return fromUrl
  }

  try {
    const stored = window.localStorage.getItem(attributionKey)
    return stored ? (JSON.parse(stored) as typeof fromUrl) : undefined
  } catch {
    return undefined
  }
}

function fbcFromAttribution(attribution?: { fbclid?: string }) {
  if (!attribution?.fbclid) return readCookie("_fbc")
  return `fb.1.${Math.floor(Date.now() / 1000)}.${attribution.fbclid}`
}

function metaCustomData(payload: TrackingPayload) {
  const products = payload.products?.length
    ? payload.products
    : payload.product
      ? [payload.product]
      : []

  return {
    currency: payload.currency || payload.product?.price.currency || "USD",
    value:
      payload.value ||
      products.reduce((sum, product) => sum + product.price.amount, 0),
    search_string: payload.searchString,
    content_ids: products.map((product) => product.sku || product.id),
    content_type: products.length ? "product" : undefined,
    content_name: payload.product?.title,
    content_category: payload.product?.category,
  }
}

function sendToTools(body: Record<string, unknown>) {
  const json = JSON.stringify(body)
  if (navigator.sendBeacon) {
    navigator.sendBeacon(
      "/api/events",
      new Blob([json], { type: "application/json" }),
    )
    return
  }

  void fetch("/api/events", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: json,
    keepalive: true,
  })
}

export function trackStorefrontEvent(payload: TrackingPayload) {
  if (typeof window === "undefined") return undefined

  const consent = readConsent()
  const attribution = currentAttribution(consent)
  const eventId = payload.eventId || randomId(payload.eventName.toLowerCase())
  const leadId = payload.leadId
  const session = sessionId(consent)
  const product = payload.product
  const products = payload.products

  const body = {
    ...payload,
    eventId,
    at: new Date().toISOString(),
    sessionId: session,
    leadId,
    source: "storefront",
    pageUrl: window.location.href,
    referrer: document.referrer || undefined,
    fbp: consent ? readCookie("_fbp") : undefined,
    fbc: consent ? fbcFromAttribution(attribution) : undefined,
    consent,
    attribution,
    product: product
      ? {
          productId: product.id,
          variantId: product.variantId,
          sku: product.sku,
          title: product.title,
          category: product.category,
          brand: product.brand,
          price: product.price.amount,
          currency: product.price.currency,
          material: product.material,
          diameterCm: product.diameterCm,
          promoLabel: product.promoLabel,
          stockSignal: product.stockSignal,
          deliveryBadge: product.deliveryBadge,
        }
      : undefined,
    products: products?.map((item) => ({
      productId: item.id,
      variantId: item.variantId,
      sku: item.sku,
      title: item.title,
      category: item.category,
      brand: item.brand,
      price: item.price.amount,
      currency: item.price.currency,
      material: item.material,
      diameterCm: item.diameterCm,
      promoLabel: item.promoLabel,
      stockSignal: item.stockSignal,
      deliveryBadge: item.deliveryBadge,
    })),
  }

  if (consent) {
    const customData = metaCustomData(payload)
    if (window.fbq) {
      window.fbq("track", payload.eventName, customData, {
        eventID: eventId,
      })
    } else {
      window.b2bPendingMetaEvents = window.b2bPendingMetaEvents || []
      window.b2bPendingMetaEvents.push({
        name: payload.eventName,
        data: customData,
        id: eventId,
      })
    }
  }

  sendToTools(body)
  return { eventId, leadId, sessionId: session }
}

export function MetaPixel() {
  const [consent, setConsent] = useState(false)
  const [decision, setDecision] = useState<string | undefined>()
  const [ready, setReady] = useState(false)
  const id = process.env.NEXT_PUBLIC_META_PIXEL_ID

  useEffect(() => {
    setConsent(readConsent())
    setDecision(readDecision())
    setReady(true)
  }, [])

  if (!pixelEnabled() || !id || !ready) return null

  return (
    <>
      {consent ? (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${id}');
            if (window.b2bPendingMetaEvents) {
              window.b2bPendingMetaEvents.forEach(function(event) {
                fbq('track', event.name, event.data, { eventID: event.id });
              });
              window.b2bPendingMetaEvents = [];
            }
          `}
        </Script>
      ) : null}
      {!consent && !decision && !consentModeDisabled() ? (
        <div className="cookie-banner" role="dialog" aria-live="polite">
          <div>
            <strong>Medicion para mejorar recomendaciones</strong>
            <p>
              Usamos Pixel y eventos propios para entender que productos de
              cocina interesan y ayudar mejor por WhatsApp.
            </p>
          </div>
          <div className="cookie-actions">
            <button
              type="button"
              onClick={() => {
                window.localStorage.setItem(consentKey, "declined")
                setDecision("declined")
              }}
            >
              Rechazar
            </button>
            <button
              type="button"
              onClick={() => {
                window.localStorage.setItem(consentKey, "accepted")
                window.dispatchEvent(new Event("b2b:analytics-consent"))
                setDecision("accepted")
                setConsent(true)
              }}
            >
              Aceptar
            </button>
          </div>
        </div>
      ) : null}
    </>
  )
}

export function PageAnalytics({
  query,
  category,
  featured,
}: {
  query?: string
  category?: string
  featured?: TrackingProduct
}) {
  const fired = useRef(new Set<string>())
  const [consentVersion, setConsentVersion] = useState(0)

  useEffect(() => {
    const listener = () => setConsentVersion((value) => value + 1)
    window.addEventListener("b2b:analytics-consent", listener)
    return () => window.removeEventListener("b2b:analytics-consent", listener)
  }, [])

  useEffect(() => {
    const pageKey = `page:${window.location.pathname}:${window.location.search}`
    if (!fired.current.has(pageKey) && readConsent()) {
      fired.current.add(pageKey)
      trackStorefrontEvent({
        eventName: "PageView",
        type: "page_view",
        metadata: { category },
      })
    }

    if (featured && !fired.current.has(`view:${featured.id}`) && readConsent()) {
      fired.current.add(`view:${featured.id}`)
      trackStorefrontEvent({
        eventName: "ViewContent",
        type: "view_content",
        product: featured,
        value: featured.price.amount,
      })
    }

    if (query && !fired.current.has(`search:${query}`) && readConsent()) {
      fired.current.add(`search:${query}`)
      trackStorefrontEvent({
        eventName: "Search",
        type: "search",
        searchString: query,
        metadata: { category },
      })
    }
  }, [category, consentVersion, featured, query])

  return null
}

export function TrackedWhatsAppLink({
  product,
  placement,
  className,
  children,
  cta = "cotizar_whatsapp",
  eventType = "whatsapp_opened",
}: {
  product: TrackingProduct
  placement: string
  className?: string
  children: ReactNode
  cta?: string
  eventType?: "whatsapp_opened" | "video_interest" | "product_interest"
}) {
  const fallbackHref = useMemo(
    () =>
      whatsappLink(product, {
        leadId: `lead_${product.id}_${placement}`,
        source: "storefront",
        placement,
      }),
    [placement, product],
  )

  return (
    <a
      className={className}
      href={fallbackHref}
      rel="noreferrer"
      target="_blank"
      onClick={(event) => {
        const leadId = randomId("lead")
        const result = trackStorefrontEvent({
          eventName: "Lead",
          type: eventType,
          product,
          value: product.price.amount,
          cta,
          placement,
          leadId,
        })
        const href = whatsappLink(product, {
          leadId,
          sessionId: result?.sessionId,
          source: "storefront",
          placement,
        })

        event.preventDefault()
        window.open(href, "_blank", "noopener,noreferrer")
      }}
    >
      {children}
    </a>
  )
}

export function TrackedEventLink({
  href,
  eventName = "Lead",
  type = "campaign_click",
  cta,
  placement,
  className,
  children,
  metadata,
}: {
  href: string
  eventName?: MetaEventName
  type?: string
  cta: string
  placement: string
  className?: string
  children: ReactNode
  metadata?: Record<string, unknown>
}) {
  return (
    <a
      className={className}
      href={href}
      onClick={(event) => {
        trackStorefrontEvent({
          eventName,
          type,
          cta,
          placement,
          leadId: randomId("lead"),
          metadata,
        })

        if (href.startsWith("#")) return
        event.preventDefault()
        window.location.assign(href)
      }}
    >
      {children}
    </a>
  )
}
