"use client"

import { useMemo, useState } from "react"
import { CheckCircle2, Mail, MessageCircle } from "lucide-react"
import { trackStorefrontEvent } from "./analytics"

type ProductOption = {
  id: string
  title: string
  sku: string
}

type FormState = "idle" | "submitting" | "success" | "error"

function randomLeadId() {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
  return `lead_${id}`
}

function skuFromInterest(value: string) {
  return value.split(":")[0] || undefined
}

export function LeadCaptureForm({
  products,
}: {
  products: ProductOption[]
}) {
  const [state, setState] = useState<FormState>("idle")
  const [message, setMessage] = useState("")
  const productOptions = useMemo(
    () =>
      products.length
        ? products
        : [{ id: "granito", title: "Ollas de granito", sku: "GRANITO" }],
    [products],
  )

  return (
    <form
      className="flex flex-col gap-3.5 rounded-xl border border-[#E8E2D8] bg-[#FAF7F2]/95 p-4"
      onSubmit={(event) => {
        event.preventDefault()
        setState("submitting")

        const form = new FormData(event.currentTarget)
        const email = String(form.get("email") || "").trim()
        const phone = String(form.get("phone") || "").trim()
        const name = String(form.get("name") || "").trim()
        const city = String(form.get("city") || "").trim()
        const people = String(form.get("people") || "").trim()
        const productInterest = String(form.get("productInterest") || "").trim()
        const productInterestSku = skuFromInterest(productInterest)
        const whatsappConsent = form.get("whatsappConsent") === "on"

        if (!email && !phone) {
          setState("error")
          setMessage("Deja un email o WhatsApp para enviarte la guia.")
          return
        }

        try {
          trackStorefrontEvent({
            eventName: "Lead",
            type: "guide_downloaded",
            leadId: randomLeadId(),
            cta: "guia_cupon",
            placement: "club_cocina_saludable",
            customer: {
              name: name || undefined,
              email: email || undefined,
              phone: phone || undefined,
              whatsappConsent,
              tags: ["lead-magnet", "guia-cupon", "recompra"],
            },
            metadata: {
              source: "club_cocina_saludable",
              leadMagnet: "guia_cocina_saludable",
              coupon: "GRANITOHOY",
              journeyStage: "lead_nuevo",
              city: city || undefined,
              householdPeople: people || undefined,
              productInterest: productInterest || undefined,
              productInterestSku,
              recommendedSku: productInterestSku,
              followupSequence: [
                "dia_0_guia",
                "dia_2_tamano",
                "dia_7_cuidado",
                "dia_30_complemento",
                "dia_90_recompra",
              ],
            },
          })
          setState("success")
          setMessage(
            "Listo. Te enviaremos la guia, el cupon y recordatorios utiles.",
          )
          event.currentTarget.reset()
        } catch (error) {
          setState("error")
          setMessage(
            error instanceof Error
              ? error.message
              : "No se pudo registrar el lead.",
          )
        }
      }}
    >
      <div className="grid grid-cols-2 gap-2.5">
        {[
          { label: "Nombre", name: "name", placeholder: "Tu nombre", autoComplete: "name" },
          { label: "Email", name: "email", placeholder: "correo@ejemplo.com", type: "email", inputMode: "email" as const, autoComplete: "email" },
          { label: "WhatsApp", name: "phone", placeholder: "09...", type: "tel", inputMode: "tel" as const, autoComplete: "tel" },
          { label: "Ciudad", name: "city", placeholder: "Quito, Guayaquil...", autoComplete: "address-level2" },
        ].map(({ label, ...inputProps }) => (
          <label key={inputProps.name} className="flex flex-col gap-1.5 min-w-0">
            <span className="text-[12px] font-semibold text-[var(--accent)] uppercase tracking-wide">
              {label}
            </span>
            <input
              {...inputProps}
              className="h-11 w-full rounded-lg border border-[#E8E2D8] bg-white px-3 text-[14px] text-[#1A1A18] placeholder:text-[#6B6B66] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
            />
          </label>
        ))}
        <label className="flex flex-col gap-1.5 min-w-0">
          <span className="text-[12px] font-semibold text-[var(--accent)] uppercase tracking-wide">
            Personas en casa
          </span>
          <select
            name="people"
            defaultValue=""
            className="h-11 w-full rounded-lg border border-[#E8E2D8] bg-white px-3 text-[14px] text-[#1A1A18] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
          >
            <option value="" disabled>
              Elige una opcion
            </option>
            <option value="1-2">1 a 2</option>
            <option value="3-4">3 a 4</option>
            <option value="5+">5 o mas</option>
          </select>
        </label>
        <label className="flex flex-col gap-1.5 min-w-0">
          <span className="text-[12px] font-semibold text-[var(--accent)] uppercase tracking-wide">
            Producto de interes
          </span>
          <select
            name="productInterest"
            defaultValue=""
            className="h-11 w-full rounded-lg border border-[#E8E2D8] bg-white px-3 text-[14px] text-[#1A1A18] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
          >
            <option value="" disabled>
              Que quieres mejorar
            </option>
            {productOptions.map((product) => (
              <option key={product.id} value={`${product.sku}:${product.title}`}>
                {product.title}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="grid grid-cols-[18px_1fr] items-start gap-2">
        <input
          name="whatsappConsent"
          type="checkbox"
          className="mt-0.5 h-[18px] w-[18px] accent-[var(--accent)]"
        />
        <span className="text-[13px] text-[#6B6B66] leading-relaxed">
          Acepto que Eter Niu Cocina me escriba por WhatsApp con la guia,
          cupon, recordatorios de cuidado y recomendaciones. Puedo pedir que no
          me contacten.
        </span>
      </label>
      <button
        disabled={state === "submitting"}
        type="submit"
        className="flex items-center justify-center gap-2 h-11 rounded-full bg-[var(--accent)] text-white text-[14px] font-semibold cursor-pointer border-0 disabled:cursor-wait disabled:opacity-70"
      >
        {state === "submitting" ? (
          "Registrando..."
        ) : (
          <>
            <Mail size={18} />
            Activar guia + cupon + recordatorios
          </>
        )}
      </button>
      {message ? (
        <p
          className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-[13px] font-medium ${
            state === "success"
              ? "bg-[#E8F5EC] text-[#2F5D43]"
              : "bg-[#FFF0EC] text-[#C4502A]"
          }`}
        >
          {state === "success" ? <CheckCircle2 size={18} /> : <MessageCircle size={18} />}
          {message}
        </p>
      ) : null}
    </form>
  )
}
