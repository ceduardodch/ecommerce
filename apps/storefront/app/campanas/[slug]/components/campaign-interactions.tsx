"use client"

import { useEffect, useRef, useState } from "react"
import { MessageCircle, Sparkles } from "lucide-react"
import type { Product } from "../../../../lib/catalog"
import { commercialInfo } from "../../../../lib/commercial"
import {
  trackStorefrontEvent,
  TrackedWhatsAppLink,
} from "../../../components/analytics"

export type CampaignAttribution = {
  campaignSlug: string
  requestedSku?: string
  fallbackUsed?: boolean
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmContent?: string
  utmTerm?: string
  fbclid?: string
}

type CampaignContext = CampaignAttribution & {
  productInterestSku: string
  recommendedSku: string
  journeyStage: string
}

function compactContext(context: CampaignContext) {
  return {
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

export function CampaignAnalytics({
  product,
  context,
}: {
  product: Product
  context: CampaignContext
}) {
  const fired = useRef(false)

  useEffect(() => {
    if (fired.current) return
    fired.current = true
    const metadata = compactContext(context)

    trackStorefrontEvent({
      eventName: "PageView",
      type: "page_view",
      source: "meta_ads",
      product,
      placement: "campaign_landing",
      leadId: `lead_${context.campaignSlug}_${product.sku}_view`,
      metadata,
    })
    trackStorefrontEvent({
      eventName: "ViewContent",
      type: "view_content",
      source: "meta_ads",
      product,
      value: product.price.amount,
      placement: "campaign_landing",
      leadId: `lead_${context.campaignSlug}_${product.sku}_content`,
      metadata,
    })
  }, [context, product])

  return null
}

export function CampaignWhatsAppPanel({
  product,
  context,
}: {
  product: Product
  context: CampaignContext
}) {
  const [people, setPeople] = useState("3 a 4 personas")
  const [useCase, setUseCase] = useState("almuerzo familiar")
  const commerce = commercialInfo(product)
  const metadata = compactContext(context)

  return (
    <section className="campaign-selector" id="personas">
      <div>
        <p className="eyebrow">Antes de ir a WhatsApp</p>
        <h2>Cuentale a Vicky para cuantas personas cocinas.</h2>
        <p>
          El mensaje se arma con tu producto, cupon, ciudad de campana y esta
          respuesta para que no pases por un menu generico.
        </p>
      </div>
      <div className="campaign-selector-panel">
        <div className="campaign-choice-group" aria-label="Personas en casa">
          {["1 a 2 personas", "3 a 4 personas", "5 o mas personas"].map(
            (option) => (
              <button
                className={people === option ? "is-active" : ""}
                key={option}
                onClick={() => setPeople(option)}
                type="button"
              >
                {option}
              </button>
            ),
          )}
        </div>
        <label className="campaign-select-label">
          <span>Uso principal</span>
          <select
            value={useCase}
            onChange={(event) => setUseCase(event.target.value)}
          >
            <option value="almuerzo familiar">Almuerzo familiar</option>
            <option value="recetas rapidas">Recetas rapidas</option>
            <option value="cocinar con menos aceite">Cocinar con menos aceite</option>
            <option value="renovar ollas viejas">Renovar ollas viejas</option>
          </select>
        </label>
        <TrackedWhatsAppLink
          className="primary-button campaign-wide-cta"
          cta="campaign_selector_whatsapp"
          eventType="campaign_cta_click"
          extraEventTypes={["whatsapp_opened"]}
          leadId={`lead_${context.campaignSlug}_${product.sku}_selector`}
          metadata={{
            ...metadata,
            householdPeople: people,
            useCase,
          }}
          placement="campaign_selector"
          product={product}
          source="meta_ads"
          whatsappContext={{
            ...context,
            source: "meta_ads",
            householdPeople: people,
            useCase,
            recommendation:
              product.bundleUseCase || product.healthAngle || product.title,
            recommendedSku: product.sku,
            journeyStage: "cotizacion_pendiente",
          }}
        >
          <MessageCircle size={19} />
          Reclamar cupon y confirmar stock por WhatsApp
        </TrackedWhatsAppLink>
        <small>
          Incluye {commerce.freeShippingLabel.toLowerCase()}, {commerce.paymentMethodsLabel} y{" "}
          {commerce.stoveCompatibility}.
        </small>
      </div>
    </section>
  )
}

export function CampaignStickyCta({
  product,
  context,
}: {
  product: Product
  context: CampaignContext
}) {
  const metadata = compactContext(context)

  return (
    <div className="campaign-sticky-cta">
      <div>
        <span>Campana</span>
        <strong>{product.title}</strong>
      </div>
      <TrackedWhatsAppLink
        className="primary-button"
        cta="campaign_sticky_whatsapp"
        eventType="campaign_cta_click"
        extraEventTypes={["whatsapp_opened"]}
        leadId={`lead_${context.campaignSlug}_${product.sku}_sticky`}
        metadata={metadata}
        placement="campaign_sticky"
        product={product}
        source="meta_ads"
        whatsappContext={{
          ...context,
          source: "meta_ads",
          recommendation: "cupon de campana y stock actualizado",
          recommendedSku: product.sku,
          journeyStage: "cotizacion_pendiente",
        }}
      >
        <Sparkles size={18} />
        Reclamar cupon
      </TrackedWhatsAppLink>
    </div>
  )
}
