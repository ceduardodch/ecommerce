"use client"

import { useEffect, useRef, useState } from "react"
import { MessageCircle, Sparkles } from "lucide-react"
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

// ---------------------------------------------------------------------------
// WellnessAnalytics — logic + tracking preserved; no CSS classes emitted
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// WellnessRoutinePanel — migrated to Tailwind; logic + tracking intact
// ---------------------------------------------------------------------------
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

  const routineOptions = [
    "hidratacion y oficina",
    "movimiento suave",
    "pausa en casa",
  ]

  const momentOptions = [
    { value: "manana", label: "Manana" },
    { value: "trabajo", label: "Trabajo / oficina" },
    { value: "entrenamiento", label: "Entrenamiento" },
    { value: "noche", label: "Noche / pausa en casa" },
  ]

  return (
    <section
      className="px-4 py-10 md:py-16"
      id="rutina"
      aria-label="Rutina de bienestar"
    >
      <div className="max-w-lg mx-auto">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-[var(--accent)]">
          Antes de escribir
        </p>
        <h2
          className="mb-2 text-[28px] font-medium leading-snug text-[#1A1A18]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Arma la recomendación según tu rutina.
        </h2>
        <p className="mb-6 text-[14px] text-[#6B6B66]">
          Vicky recibe esta información junto con el SKU para responder directo
          con el producto, precio, envío y formas de pago.
        </p>

        <div className="rounded-2xl border border-[#E8E2D8] bg-white p-4 space-y-4">
          {/* Routine choice group */}
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Tipo de rutina"
          >
            {routineOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setRoutine(option)}
                className={`rounded-full border px-3 py-1.5 text-[13px] transition-colors focus:outline-none ${
                  routine === option
                    ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                    : "border-[#E8E2D8] text-[#1A1A18] hover:border-[var(--accent)]"
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          {/* Moment select */}
          <label className="flex flex-col gap-1">
            <span className="text-[12px] font-medium text-[#6B6B66]">
              Momento de uso
            </span>
            <select
              value={moment}
              onChange={(e) => setMoment(e.target.value)}
              className="h-11 w-full rounded-xl border border-[#E8E2D8] bg-white px-3 text-[14px] text-[#1A1A18] focus:border-[var(--accent)] focus:outline-none"
            >
              {momentOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          {/* CTA */}
          <TrackedWhatsAppLink
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-[14px] font-semibold text-white"
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
            Reclamar cupón bienestar por WhatsApp
          </TrackedWhatsAppLink>

          <p className="text-center text-[12px] text-[#6B6B66]">
            Incluye {commerce.freeShippingLabel.toLowerCase()},{" "}
            {commerce.paymentMethodsLabel} y asesoría por WhatsApp.
          </p>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// WellnessStickyCta — migrated to Tailwind; logic + tracking intact
// ---------------------------------------------------------------------------
export function WellnessStickyCta({
  product,
  context,
}: {
  product: Product
  context: WellnessContext
}) {
  const metadata = compactContext(context)

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#E8E2D8] bg-white px-4 py-3 shadow-[0_-2px_12px_rgba(26,26,24,0.08)]">
      <div className="mx-auto flex max-w-lg items-center gap-3">
        <div className="flex flex-col leading-none min-w-0">
          <span className="text-[11px] text-[#6B6B66]">Bienestar</span>
          <span className="text-[13px] font-medium text-[#1A1A18] truncate">
            {product.title}
          </span>
        </div>
        <TrackedWhatsAppLink
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-[13px] font-semibold text-white"
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
          Reclamar cupón
        </TrackedWhatsAppLink>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// WellnessEmptyCta — no wellness-* classes
// ---------------------------------------------------------------------------
export function WellnessEmptyCta() {
  return (
    <a
      className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-3 text-[14px] font-semibold text-white"
      href="/"
    >
      Volver a cocina
    </a>
  )
}
