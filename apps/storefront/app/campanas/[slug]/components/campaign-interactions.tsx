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
    <section
      className="grid gap-4 rounded-xl bg-[#FAF7F2] p-5 md:grid-cols-[0.9fr_1.1fr] md:items-center"
      id="personas"
    >
      <div className="flex flex-col gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--accent)]">
          Antes de ir a WhatsApp
        </p>
        <h2
          className="text-[20px] font-medium leading-tight text-[#1A1A18]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {complement
            ? "Cuentale a Vicky como lo vas a usar."
            : "Cuentale a Vicky para cuantas personas cocinas."}
        </h2>
        <p className="text-[14px] text-[#6B6B66] leading-relaxed">
          El mensaje se arma con tu producto, cupon, ciudad de campana y esta
          respuesta para que no pases por un menu generico.
        </p>
      </div>
      <div className="flex flex-col gap-3 rounded-xl border border-[#E8E2D8] bg-white/90 p-4">
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(${peopleOptions.length}, minmax(0,1fr))` }}
          aria-label="Personas en casa"
        >
          {peopleOptions.map((option) => (
            <button
              className={`min-h-[42px] rounded-lg border text-[13px] font-semibold cursor-pointer transition-colors ${
                people === option
                  ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                  : "border-[#E8E2D8] bg-white text-[#1A1A18] hover:border-[var(--accent)]"
              }`}
              key={option}
              onClick={() => setPeople(option)}
              type="button"
            >
              {option}
            </button>
          ))}
        </div>
        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] font-semibold text-[var(--accent)] uppercase tracking-wide">
            Uso principal
          </span>
          <select
            value={useCase}
            onChange={(event) => setUseCase(event.target.value)}
            className="h-11 w-full rounded-lg border border-[#E8E2D8] bg-white px-3 text-[14px] text-[#1A1A18] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
          >
            {useCaseOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <TrackedWhatsAppLink
          className="flex w-full items-center justify-center gap-2 h-11 rounded-full bg-[#25D366] px-5 text-[14px] font-semibold text-white"
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
              ? "Me confirmas stock, envio gratis por Servientrega y formas de pago?"
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
        <small className="text-[12px] text-[#6B6B66] leading-snug">
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
    <div
      aria-hidden={!visible}
      className={`fixed bottom-0 left-0 right-0 z-50 grid grid-cols-[1fr_auto] items-center gap-3 border-t border-white/20 bg-[rgba(17,24,19,0.94)] px-4 py-2.5 text-[#FAF7F2] shadow-[0_-4px_24px_rgba(23,32,27,0.28)] transition-all duration-200 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-[11px] text-[#E8E2D8] leading-tight font-medium">
          {offerText} · {shippingText}
        </span>
        <strong className="truncate text-[14px] font-medium leading-tight">
          {product.title}
        </strong>
      </div>
      <TrackedWhatsAppLink
        className="flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-[13px] font-semibold text-white"
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
