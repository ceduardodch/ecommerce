"use client"

import { useEffect, useRef, useState } from "react"
import { HeartHandshake, MessageCircle, Sparkles } from "lucide-react"
import type { Product } from "../../../lib/catalog"
import { commercialInfo } from "../../../lib/commercial"
import { wellnessOpeningLine } from "../../../lib/wellness"
import {
  trackStorefrontEvent,
  TrackedWhatsAppLink,
} from "../../components/analytics"

export type WellnessAttribution = {
  vertical: "bienestar"
  campaignSlug?: string
  requestedSku?: string
  fallbackUsed?: boolean
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmContent?: string
  utmTerm?: string
  fbclid?: string
}

type WellnessContext = WellnessAttribution & {
  productInterestSku?: string
  recommendedSku?: string
  journeyStage: string
}

function compactContext(context: WellnessContext) {
  return {
    vertical: "bienestar",
    campaignSlug: context.campaignSlug,
    requestedSku: context.requestedSku,
    fallbackUsed: context.fallbackUsed,
    utmSource: context.utmSource,
    utmMedium: context.utmMedium,
    utmCampaign: context.utmCampaign,
    utmContent: context.utmContent,
    utmTerm: context.utmTerm,
    fbclid: context.fbclid,
    productInterestSku: context.productInterestSku,
    recommendedSku: context.recommendedSku,
    journeyStage: context.journeyStage,
    source: "meta_ads",
  }
}

export function WellnessAnalytics({
  product,
  context,
  placement,
}: {
  product?: Product
  context: WellnessContext
  placement: string
}) {
  const fired = useRef(false)

  useEffect(() => {
    if (fired.current) return
    fired.current = true
    const metadata = compactContext(context)

    trackStorefrontEvent({
      eventName: "PageView",
      type: "page_view",
      source: context.campaignSlug ? "meta_ads" : "storefront",
      product,
      placement,
      leadId: product
        ? `lead_bienestar_${context.campaignSlug || "home"}_${product.sku}_view`
        : `lead_bienestar_${context.campaignSlug || "home"}_view`,
      metadata,
    })

    if (product) {
      trackStorefrontEvent({
        eventName: "ViewContent",
        type: "view_content",
        source: context.campaignSlug ? "meta_ads" : "storefront",
        product,
        value: product.price.amount,
        placement,
        leadId: `lead_bienestar_${context.campaignSlug || "home"}_${product.sku}_content`,
        metadata,
      })
    }
  }, [context, placement, product])

  return null
}

export function WellnessRoutinePanel({
  product,
  context,
}: {
  product: Product
  context: WellnessContext
}) {
  const [routine, setRoutine] = useState("hidratacion y oficina")
  const [moment, setMoment] = useState("manana")
  const commerce = commercialInfo(product)
  const metadata = compactContext(context)

  return (
    <section className="wellness-routine" id="rutina">
      <div>
        <p className="eyebrow">Antes de escribir</p>
        <h2>Arma la recomendacion segun tu rutina.</h2>
        <p>
          Vicky recibe esta informacion junto con el SKU para responder directo
          con el producto, precio, envio y formas de pago.
        </p>
      </div>
      <div className="wellness-routine-panel">
        <div className="wellness-choice-group" aria-label="Tipo de rutina">
          {[
            "hidratacion y oficina",
            "movimiento suave",
            "pausa en casa",
          ].map((option) => (
            <button
              className={routine === option ? "is-active" : ""}
              key={option}
              onClick={() => setRoutine(option)}
              type="button"
            >
              {option}
            </button>
          ))}
        </div>
        <label className="campaign-select-label">
          <span>Momento de uso</span>
          <select
            value={moment}
            onChange={(event) => setMoment(event.target.value)}
          >
            <option value="manana">Manana</option>
            <option value="trabajo">Trabajo / oficina</option>
            <option value="entrenamiento">Entrenamiento</option>
            <option value="noche">Noche / pausa en casa</option>
          </select>
        </label>
        <TrackedWhatsAppLink
          className="primary-button wellness-wide-cta"
          cta="wellness_routine_whatsapp"
          eventType="campaign_cta_click"
          extraEventTypes={["whatsapp_opened"]}
          leadId={`lead_bienestar_${context.campaignSlug || "home"}_${product.sku}_routine`}
          metadata={{
            ...metadata,
            routine,
            moment,
          }}
          placement="wellness_routine"
          product={product}
          source={context.campaignSlug ? "meta_ads" : "storefront"}
          whatsappContext={{
            ...context,
            openingLine: wellnessOpeningLine(product),
            source: context.campaignSlug ? "meta_ads" : "storefront",
            recommendation: product.bundleUseCase || product.title,
            recommendedSku: product.sku,
            journeyStage: "cotizacion_pendiente",
            vertical: "bienestar",
            useCase: `${routine} / ${moment}`,
          }}
        >
          <MessageCircle size={19} />
          Reclamar cupon bienestar por WhatsApp
        </TrackedWhatsAppLink>
        <small>
          Incluye {commerce.freeShippingLabel.toLowerCase()},{" "}
          {commerce.paymentMethodsLabel} y asesoria por WhatsApp.
        </small>
      </div>
    </section>
  )
}

export function WellnessStickyCta({
  product,
  context,
}: {
  product: Product
  context: WellnessContext
}) {
  const metadata = compactContext(context)

  return (
    <div className="wellness-sticky-cta">
      <div>
        <span>Bienestar</span>
        <strong>{product.title}</strong>
      </div>
      <TrackedWhatsAppLink
        className="primary-button"
        cta="wellness_sticky_whatsapp"
        eventType="campaign_cta_click"
        extraEventTypes={["whatsapp_opened"]}
        leadId={`lead_bienestar_${context.campaignSlug || "home"}_${product.sku}_sticky`}
        metadata={metadata}
        placement="wellness_sticky"
        product={product}
        source={context.campaignSlug ? "meta_ads" : "storefront"}
        whatsappContext={{
          ...context,
          openingLine: wellnessOpeningLine(product),
          source: context.campaignSlug ? "meta_ads" : "storefront",
          recommendation: "cupon bienestar y stock actualizado",
          recommendedSku: product.sku,
          journeyStage: "cotizacion_pendiente",
          vertical: "bienestar",
        }}
      >
        <Sparkles size={18} />
        Reclamar cupon
      </TrackedWhatsAppLink>
    </div>
  )
}

export function WellnessEmptyCta() {
  return (
    <a className="primary-button" href="/">
      <HeartHandshake size={18} />
      Volver a cocina
    </a>
  )
}
