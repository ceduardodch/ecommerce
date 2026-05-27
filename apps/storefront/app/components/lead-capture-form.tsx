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
      className="club-form"
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
        const whatsappConsent = form.get("whatsappConsent") === "on"

        if (!email && !phone) {
          setState("error")
          setMessage("Deja un email o WhatsApp para enviarte la guia.")
          return
        }

        try {
          trackStorefrontEvent({
            eventName: "Lead",
            type: "lead_created",
            leadId: randomLeadId(),
            cta: "guia_cupon",
            placement: "club_cocina_saludable",
            customer: {
              name: name || undefined,
              email: email || undefined,
              phone: phone || undefined,
              whatsappConsent,
              tags: ["newsletter", "guia-cupon"],
            },
            metadata: {
              source: "club_cocina_saludable",
              leadMagnet: "guia_cocina_saludable",
              coupon: "GRANITOHOY",
              city: city || undefined,
              householdPeople: people || undefined,
              productInterest: productInterest || undefined,
              followupPlan: ["dia_0_guia", "dia_2_tamano", "dia_7_cuidado", "dia_30_complemento", "dia_90_recompra"],
            },
          })
          setState("success")
          setMessage("Listo. Tu guia queda asociada al CRM y el cupon es GRANITOHOY.")
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
      <div className="form-grid">
        <label>
          <span>Nombre</span>
          <input autoComplete="name" name="name" placeholder="Tu nombre" />
        </label>
        <label>
          <span>Email</span>
          <input
            autoComplete="email"
            inputMode="email"
            name="email"
            placeholder="correo@ejemplo.com"
            type="email"
          />
        </label>
        <label>
          <span>WhatsApp</span>
          <input
            autoComplete="tel"
            inputMode="tel"
            name="phone"
            placeholder="09..."
            type="tel"
          />
        </label>
        <label>
          <span>Ciudad</span>
          <input autoComplete="address-level2" name="city" placeholder="Quito, Guayaquil..." />
        </label>
        <label>
          <span>Personas en casa</span>
          <select name="people" defaultValue="">
            <option value="" disabled>
              Elige una opcion
            </option>
            <option value="1-2">1 a 2</option>
            <option value="3-4">3 a 4</option>
            <option value="5+">5 o mas</option>
          </select>
        </label>
        <label>
          <span>Producto de interes</span>
          <select name="productInterest" defaultValue="">
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
      <label className="consent-row">
        <input name="whatsappConsent" type="checkbox" />
        <span>
          Acepto que Eter Niu Cocina me escriba por WhatsApp con la guia,
          cupon y recomendaciones de cocina. Puedo pedir que no me contacten.
        </span>
      </label>
      <button disabled={state === "submitting"} type="submit">
        {state === "submitting" ? (
          "Registrando..."
        ) : (
          <>
            <Mail size={18} />
            Descargar guia + cupon
          </>
        )}
      </button>
      {message ? (
        <p className={`form-message ${state}`}>
          {state === "success" ? <CheckCircle2 size={18} /> : <MessageCircle size={18} />}
          {message}
        </p>
      ) : null}
    </form>
  )
}
