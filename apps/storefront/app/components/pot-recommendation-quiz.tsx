"use client"

import { useMemo, useState } from "react"
import { CheckCircle2, MessageCircle, Sparkles } from "lucide-react"
import type { Product } from "../../lib/catalog"
import { commercialInfo } from "../../lib/commercial"
import { trackStorefrontEvent, TrackedWhatsAppLink } from "./analytics"

type Recommendation = {
  leadId: string
  product: Product
  reason: string
  people: string
  city: string
  useCase: string
  budget: string
  interestSku?: string
}

const followupSequence = [
  "dia_0_recomendacion",
  "dia_2_tamano",
  "dia_7_cuidado",
  "dia_30_complemento",
  "dia_90_recompra",
]

function randomLeadId() {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
  return `lead_${id}`
}

function money(amount: number) {
  return `$${amount.toFixed(2)}`
}

function optionValue(product: Product) {
  return `${product.sku}:${product.title}`
}

function skuFromOption(value: string) {
  return value.split(":")[0] || undefined
}

function productBySku(products: Product[], sku?: string) {
  return sku ? products.find((product) => product.sku === sku) : undefined
}

function firstAvailable(products: Product[], skus: string[]) {
  return skus
    .map((sku) => productBySku(products, sku))
    .find((product): product is Product => Boolean(product))
}

function recommendationFor(
  products: Product[],
  input: {
    people: string
    useCase: string
    budget: string
    interestSku?: string
  },
) {
  const interested = productBySku(products, input.interestSku)
  const wok = firstAvailable(products, ["MGC-WOK-GRANITO-32"])
  const olla20 = firstAvailable(products, ["MGC-OLLA-GRANITO-20"])
  const olla18 = firstAvailable(products, ["MGC-OLLA-GRANITO-18"])

  if (input.budget === "set" || input.useCase === "renovar") {
    return wok || olla20 || interested || products[0]
  }
  if (input.useCase === "rapidas" || input.interestSku?.includes("WOK")) {
    return wok || interested || olla20 || products[0]
  }
  if (input.people === "1-2" || input.budget === "hasta100") {
    return olla18 || olla20 || interested || products[0]
  }
  if (input.people === "5+") {
    return wok || olla20 || interested || products[0]
  }

  return interested || wok || olla20 || olla18 || products[0]
}

function reasonFor(recommendation: Product, people: string, useCase: string) {
  if (recommendation.sku.includes("SET")) {
    return "set familiar para cambiar varias piezas sin comprar a ciegas"
  }
  if (recommendation.sku.includes("WOK")) {
    return "wok amplio para salteados, recetas rapidas y porciones generosas"
  }
  if (recommendation.sku.includes("18")) {
    return "olla 18 cm para 1 a 2 personas y cocina diaria ligera"
  }
  if (recommendation.sku.includes("20")) {
    return "olla compacta para 1 a 2 personas y cocina diaria ligera"
  }
  if (people === "5+" || useCase === "familia") {
    return "wok 32 cm para cocinar porciones familiares con mejor control"
  }
  return "pieza equilibrada para empezar con granito y pedir asesoria por uso"
}

export function PotRecommendationQuiz({ products }: { products: Product[] }) {
  const [recommendation, setRecommendation] = useState<Recommendation>()
  const productOptions = useMemo(
    () =>
      products.filter((product) => product.sku.startsWith("MGC-")).slice(0, 8),
    [products],
  )

  if (!products.length) return null

  return (
    <section
      className="grid gap-4 rounded-xl border border-[#E8E2D8] bg-[#FAF7F2] p-5 md:grid-cols-[0.85fr_1.15fr]"
      id="olla-ideal"
    >
      <div className="flex flex-col gap-2.5 justify-center">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--accent)]">
          Elige tu olla ideal
        </p>
        <h2
          className="text-[28px] font-medium leading-tight text-[#1A1A18]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Vicky recomienda segun tu cocina, no por impulso.
        </h2>
        <p className="text-[14px] text-[#6B6B66] leading-relaxed">
          En menos de un minuto te orientamos por ciudad, personas, presupuesto
          y producto de interes para responder mejor por WhatsApp.
        </p>
      </div>
      <form
        className="flex flex-col gap-3.5 rounded-xl border border-[#E8E2D8] bg-white/90 p-4"
        onSubmit={(event) => {
          event.preventDefault()
          const form = new FormData(event.currentTarget)
          const people = String(form.get("people") || "3-4")
          const city = String(form.get("city") || "").trim()
          const useCase = String(form.get("useCase") || "familia")
          const budget = String(form.get("budget") || "100-150")
          const interest = String(form.get("interest") || "")
          const interestSku = skuFromOption(interest)
          const product = recommendationFor(products, {
            people,
            useCase,
            budget,
            interestSku,
          })
          const commerce = commercialInfo(product)
          const leadId = randomLeadId()
          const reason = reasonFor(product, people, useCase)

          trackStorefrontEvent({
            eventName: "Lead",
            type: "quiz_completed",
            leadId,
            product,
            value: product.price.amount,
            cta: "olla_ideal_quiz",
            placement: "olla_ideal_quiz",
            metadata: {
              journeyStage: "lead_nuevo",
              householdPeople: people,
              city: city || undefined,
              useCase,
              budget,
              productInterestSku: interestSku,
              recommendedSku: product.sku,
              recommendationReason: reason,
              couponClaimed: true,
              couponCode: commerce.couponCode,
              paymentMethodsShown: true,
              paymentMethods: commerce.paymentMethods,
              paymentMethodsLabel: commerce.paymentMethodsLabel,
              freeShippingShown: commerce.freeShipping,
              freeShipping: commerce.freeShipping,
              stoveCompatibilityShown: true,
              stoveCompatibility: commerce.stoveCompatibility,
              followupSequence,
            },
          })

          setRecommendation({
            leadId,
            product,
            reason,
            people,
            city,
            useCase,
            budget,
            interestSku,
          })
        }}
      >
        <div className="grid grid-cols-2 gap-2.5">
          <label className="flex flex-col gap-1.5 min-w-0">
            <span className="text-[12px] font-semibold text-[var(--accent)] uppercase tracking-wide">
              Personas en casa
            </span>
            <select
              name="people"
              defaultValue="3-4"
              className="h-11 w-full rounded-lg border border-[#E8E2D8] bg-white px-3 text-[14px] text-[#1A1A18] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
            >
              <option value="1-2">1 a 2</option>
              <option value="3-4">3 a 4</option>
              <option value="5+">5 o mas</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5 min-w-0">
            <span className="text-[12px] font-semibold text-[var(--accent)] uppercase tracking-wide">
              Ciudad
            </span>
            <input
              name="city"
              placeholder="Quito, Guayaquil..."
              className="h-11 w-full rounded-lg border border-[#E8E2D8] bg-white px-3 text-[14px] text-[#1A1A18] placeholder:text-[#6B6B66] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
            />
          </label>
          <label className="flex flex-col gap-1.5 min-w-0">
            <span className="text-[12px] font-semibold text-[var(--accent)] uppercase tracking-wide">
              Uso principal
            </span>
            <select
              name="useCase"
              defaultValue="familia"
              className="h-11 w-full rounded-lg border border-[#E8E2D8] bg-white px-3 text-[14px] text-[#1A1A18] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
            >
              <option value="familia">Almuerzo familiar</option>
              <option value="rapidas">Recetas rapidas</option>
              <option value="menos-aceite">Cocinar con menos aceite</option>
              <option value="renovar">Renovar varias piezas</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5 min-w-0">
            <span className="text-[12px] font-semibold text-[var(--accent)] uppercase tracking-wide">
              Presupuesto
            </span>
            <select
              name="budget"
              defaultValue="100-150"
              className="h-11 w-full rounded-lg border border-[#E8E2D8] bg-white px-3 text-[14px] text-[#1A1A18] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
            >
              <option value="hasta100">Hasta $100</option>
              <option value="100-150">$100 a $150</option>
              <option value="set">Quiero set o combo</option>
            </select>
          </label>
          <label className="col-span-2 flex flex-col gap-1.5 min-w-0">
            <span className="text-[12px] font-semibold text-[var(--accent)] uppercase tracking-wide">
              Producto que te llamo la atencion
            </span>
            <select
              name="interest"
              defaultValue=""
              className="h-11 w-full rounded-lg border border-[#E8E2D8] bg-white px-3 text-[14px] text-[#1A1A18] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
            >
              <option value="">Aun no se</option>
              {productOptions.map((product) => (
                <option key={product.id} value={optionValue(product)}>
                  {product.title}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button
          type="submit"
          className="flex items-center justify-center gap-2 h-11 rounded-full bg-[var(--accent)] text-white text-[14px] font-semibold cursor-pointer border-0"
        >
          <Sparkles size={18} />
          Ver recomendacion
        </button>
      </form>

      {recommendation ? (
        <article
          className="col-span-full flex flex-col gap-3 rounded-xl border border-[#E8E2D8] bg-white/90 p-4 md:flex-row md:items-center md:justify-between"
          aria-live="polite"
        >
          <div className="flex flex-col gap-2">
            <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[var(--accent)]">
              <CheckCircle2 size={17} />
              Recomendacion generada
            </span>
            <h3
              className="text-[20px] font-medium leading-tight text-[#1A1A18]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {recommendation.product.title}
            </h3>
            <p className="text-[14px] text-[#6B6B66] leading-snug max-w-[680px]">
              {recommendation.reason}.
            </p>
            <div className="flex flex-wrap gap-1.5 my-2">
              {[
                `Cupon ${commercialInfo(recommendation.product).couponCode}`,
                commercialInfo(recommendation.product).freeShippingLabel,
                commercialInfo(recommendation.product).paymentMethodsLabel,
                commercialInfo(recommendation.product).stoveCompatibility,
              ].map((text) => (
                <span
                  key={text}
                  className="rounded-full border border-[#E8E2D8] px-2 py-1.5 text-[11px] font-semibold text-[var(--accent)]"
                >
                  {text}
                </span>
              ))}
            </div>
            <strong className="text-[20px] font-semibold text-[var(--accent)]">
              {money(recommendation.product.price.amount)}
            </strong>
          </div>
          <TrackedWhatsAppLink
            className="flex items-center justify-center gap-2 h-11 rounded-full bg-[#25D366] px-5 text-[14px] font-semibold text-white shrink-0"
            cta="olla_ideal_whatsapp"
            eventType="product_interest"
            leadId={recommendation.leadId}
            metadata={{
              journeyStage: "lead_nuevo",
              householdPeople: recommendation.people,
              city: recommendation.city || undefined,
              useCase: recommendation.useCase,
              budget: recommendation.budget,
              productInterestSku: recommendation.interestSku,
              recommendedSku: recommendation.product.sku,
              recommendationReason: recommendation.reason,
              followupSequence,
            }}
            placement="olla_ideal_result"
            product={recommendation.product}
            whatsappContext={{
              recommendation: recommendation.reason,
              city: recommendation.city || undefined,
              householdPeople: recommendation.people,
              useCase: recommendation.useCase,
              budget: recommendation.budget,
              recommendedSku: recommendation.product.sku,
              journeyStage: "lead_nuevo",
            }}
          >
            <MessageCircle size={18} />
            Reclamar cupon por WhatsApp
          </TrackedWhatsAppLink>
        </article>
      ) : null}
    </section>
  )
}
