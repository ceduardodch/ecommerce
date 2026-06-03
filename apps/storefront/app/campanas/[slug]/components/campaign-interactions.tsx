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

function isKitchenComplement(product: Product) {
  return (
    [product.category, product.title, product.sku, product.stoveCompatibility]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes("cuchillo") ||
    product.stoveCompatibility?.toLowerCase().includes("no aplica")
  )
}

function money(amount: number) {
  return Number.isInteger(amount) ? `$${amount}` : `$${amount.toFixed(2)}`
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
  const complement = isKitchenComplement(product)
  const peopleOptions = complement
    ? ["cocina diaria", "carnes y vegetales", "regalo"]
    : ["1 a 2 personas", "3 a 4 personas", "5 o mas personas"]
  const useCaseOptions = complement
    ? [
        ["preparar ingredientes", "Preparar ingredientes"],
        ["cortes de cocina diaria", "Cortes de cocina diaria"],
        ["complemento para ollas", "Complemento para ollas"],
        ["regalo practico", "Regalo practico"],
      ]
    : [
        ["almuerzo familiar", "Almuerzo familiar"],
        ["recetas rapidas", "Recetas rapidas"],
        ["cocinar con menos aceite", "Cocinar con menos aceite"],
        ["renovar ollas viejas", "Renovar ollas viejas"],
      ]
  const [people, setPeople] = useState(peopleOptions[1] || peopleOptions[0])
  const [useCase, setUseCase] = useState(useCaseOptions[0][0])
  const commerce = commercialInfo(product)
  const metadata = compactContext(context)

  return (
    <section className="campaign-selector" id="personas">
      <div>
        <p className="eyebrow">Antes de ir a WhatsApp</p>
        <h2>
          {complement
            ? "Cuentale a Vicky como lo vas a usar."
            : "Cuentale a Vicky para cuantas personas cocinas."}
        </h2>
        <p>
          El mensaje se arma con tu producto, cupon, ciudad de campana y esta
          respuesta para que no pases por un menu generico.
        </p>
      </div>
      <div className="campaign-selector-panel">
        <div className="campaign-choice-group" aria-label="Personas en casa">
          {peopleOptions.map((option) => (
            <button
              className={people === option ? "is-active" : ""}
              key={option}
              onClick={() => setPeople(option)}
              type="button"
            >
              {option}
            </button>
          ))}
        </div>
        <label className="campaign-select-label">
          <span>Uso principal</span>
          <select
            value={useCase}
            onChange={(event) => setUseCase(event.target.value)}
          >
            {useCaseOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
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
            householdPeople: complement ? undefined : people,
            kitchenUse: complement ? people : undefined,
            useCase,
          }}
          placement="campaign_selector"
          product={product}
          source="meta_ads"
          whatsappContext={{
            ...context,
            source: "meta_ads",
            fitQuestion: complement
              ? "Lo quiero para __. Me confirmas stock y entrega?"
              : undefined,
            householdPeople: complement ? undefined : people,
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
          Incluye {commerce.freeShippingLabel.toLowerCase()},{" "}
          {commerce.paymentMethodsLabel} y{" "}
          {complement
            ? product.deliveryBadge || product.category
            : commerce.stoveCompatibility}
          .
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
  const [visible, setVisible] = useState(false)
  const metadata = compactContext(context)
  const commerce = commercialInfo(product)
  const hasOffer =
    product.originalPrice && product.originalPrice.amount > product.price.amount
  const offerText = hasOffer
    ? `Antes ${money(product.originalPrice!.amount)} · Hoy ${money(product.price.amount)}`
    : money(product.price.amount)
  const shippingText = commerce.freeShipping
    ? "Servientrega gratis"
    : "Entrega coordinada"

  useEffect(() => {
    const updateVisibility = () => {
      const threshold = Math.min(420, window.innerHeight * 0.45)
      setVisible(window.scrollY > threshold)
    }

    updateVisibility()
    window.addEventListener("scroll", updateVisibility, { passive: true })
    window.addEventListener("resize", updateVisibility)

    return () => {
      window.removeEventListener("scroll", updateVisibility)
      window.removeEventListener("resize", updateVisibility)
    }
  }, [])

  return (
    <div className={`campaign-sticky-cta${visible ? " is-visible" : ""}`}>
      <div>
        <span>
          {offerText} · {shippingText}
        </span>
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
