"use client"

import { useEffect, useRef, useState } from "react"
import { useCart } from "../../../contexts/CartContext"
import { trackStorefrontEvent } from "../../components/analytics"

type CheckoutResponse = {
  reference: string
  checkoutId: string
  widgetUrl: string
  amount: number
  env: "test" | "live"
  provider: "datafast" | "datafast-dry-run"
  error?: string
  message?: string
}

type Form = {
  givenName: string
  middleName: string
  surname: string
  idNumber: string
  email: string
  phone: string
  street: string
  city: string
}

const EMPTY: Form = {
  givenName: "",
  middleName: "",
  surname: "",
  idNumber: "",
  email: "",
  phone: "",
  street: "",
  city: "",
}

export default function PagoTarjetaPage() {
  const { items, totalAmount, loaded } = useCart()
  const [form, setForm] = useState<Form>(EMPTY)
  const [checkout, setCheckout] = useState<CheckoutResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const widgetRef = useRef<HTMLDivElement | null>(null)

  // Inyecta el widget Copy&Pay de Datafast cuando hay checkout real.
  useEffect(() => {
    if (!checkout || checkout.provider === "datafast-dry-run") return
    const resultUrl = `${window.location.origin}/checkout/resultado?ref=${encodeURIComponent(
      checkout.reference,
    )}`
    // wpwlOptions debe existir antes de cargar el script (guía v3.2.2:
    // validación de cardholder §5.3 y sello Datafast en producción, Anexo I).
    ;(window as unknown as { wpwlOptions?: unknown }).wpwlOptions = {
      style: "card",
      locale: "es",
      labels: { cvv: "CVV", cardHolder: "Nombre (igual que en la tarjeta)" },
      onReady: function () {
        const button = document.querySelector("form.wpwl-form-card .wpwl-button")
        if (!button) return
        const holder = document.querySelector<HTMLInputElement>(".wpwl-control-cardHolder")
        if (holder) {
          const holderError = document.createElement("div")
          holderError.dataset.cardholderError = "true"
          holderError.setAttribute("role", "alert")
          holderError.textContent = "Nombre del titular de la tarjeta no válido"
          holderError.style.cssText = "display:none;margin-top:4px;color:#c4502a;font-size:13px;line-height:18px"
          holder.insertAdjacentElement("afterend", holderError)
          holder.addEventListener("input", () => {
            if (holder.value.trim().length >= 2) {
              holder.classList.remove("wpwl-has-error")
              holder.removeAttribute("aria-invalid")
              holderError.style.display = "none"
            }
          })
        }
        // Diferidos y tipo de crédito (guía §5.1–5.2). El widget envía estos
        // campos automáticamente por su atributo name; 0/00 = corriente.
        button.insertAdjacentHTML(
          "beforebegin",
          '<div class="wpwl-label" style="margin-top:12px">Meses diferido</div>' +
            '<div class="wpwl-wrapper"><select name="recurring.numberOfInstallments" style="width:100%;height:40px;border:1px solid #d0d0c8;border-radius:8px;padding:0 8px">' +
            '<option value="0">Sin diferido (corriente)</option>' +
            '<option value="3">3 meses</option>' +
            '<option value="6">6 meses</option>' +
            '<option value="9">9 meses</option>' +
            "</select></div>" +
            '<div class="wpwl-label" style="margin-top:8px">Tipo de crédito</div>' +
            '<div class="wpwl-wrapper"><select name="customParameters[SHOPPER_TIPOCREDITO]" style="width:100%;height:40px;border:1px solid #d0d0c8;border-radius:8px;padding:0 8px">' +
            '<option value="00">Corriente</option>' +
            '<option value="01">Diferido corriente</option>' +
            '<option value="02">Diferido con intereses</option>' +
            '<option value="03">Diferido sin intereses</option>' +
            "</select></div>",
        )
        if (checkout.env === "live") {
          button.insertAdjacentHTML(
            "beforebegin",
            '<br/><br/><img src="https://www.datafast.com.ec/images/verified.png" style="display:block;margin:0 auto;width:100%;" alt="Powered by Datafast"/>',
          )
        }
      },
      onBeforeSubmitCard: function () {
        const holder = document.querySelector<HTMLInputElement>(
          ".wpwl-control-cardHolder",
        )
        if (!holder || holder.value.trim().length < 2) {
          holder?.classList.add("wpwl-has-error")
          holder?.setAttribute("aria-invalid", "true")
          const holderError = document.querySelector<HTMLElement>("[data-cardholder-error]")
          if (holderError) holderError.style.display = "block"
          holder?.focus()
          return false
        }
        return true
      },
    }
    const script = document.createElement("script")
    script.src = checkout.widgetUrl
    script.async = true
    document.body.appendChild(script)
    // Validaciones adicionales exigidas por Datafast (guía §3, ambas fases).
    const dfValidations = document.createElement("script")
    dfValidations.src = "https://www.datafast.com.ec/js/dfAdditionalValidations1.js"
    dfValidations.async = true
    document.body.appendChild(dfValidations)
    if (widgetRef.current) {
      widgetRef.current.innerHTML = `<form action="${resultUrl}" class="paymentWidgets" data-brands="VISA MASTER AMEX DINERS DISCOVER"></form>`
    }
    return () => {
      script.remove()
      dfValidations.remove()
    }
  }, [checkout])

  if (loaded && items.length === 0 && !checkout) {
    return (
      <Shell>
        <p className="text-[16px] text-[#1A1A18]">Tu carrito está vacío.</p>
        <a href="/cart" className="mt-4 inline-block text-[var(--accent)] underline">
          Volver al carrito
        </a>
      </Shell>
    )
  }

  // Datafast exige todos estos campos reales en la fase 2 (guía §3.2.1:
  // "obligatorios y no se puede poner valores por defecto").
  const required: (keyof Form)[] = [
    "givenName",
    "surname",
    "idNumber",
    "phone",
    "email",
    "street",
  ]
  const missing = required.filter((k) => !form[k].trim())
  // Ecuador: celular de 10 dígitos (09XXXXXXXX) — también acepta +593.
  const phoneDigits = form.phone.replace(/[\s\-+]/g, "").replace(/^593/, "0")
  const phoneOk = /^09\d{8}$/.test(phoneDigits)
  // Cédula: exactamente 10 dígitos (Datafast rechaza otros formatos).
  const cedulaDigits = form.idNumber.replace(/\D/g, "")
  const cedulaOk = /^\d{10}$/.test(cedulaDigits)

  const startCheckout = async () => {
    setError(null)
    if (missing.length) {
      setError("Completa nombre, apellido, cédula, teléfono, email y dirección.")
      return
    }
    if (!cedulaOk) {
      setError("Cédula inválida: deben ser 10 dígitos.")
      return
    }
    if (!phoneOk) {
      setError("Celular inválido: usa 10 dígitos, ej. 0979854905.")
      return
    }
    setLoading(true)
    try {
      trackStorefrontEvent({
        eventName: "InitiateCheckout",
        type: "checkout_started",
        source: "storefront",
        value: totalAmount,
        cta: "checkout_card",
        placement: "card_payment_page",
        products: items.map((i) => ({
          id: i.id,
          variantId: i.id,
          sku: i.sku,
          title: i.title,
          category: i.category || "",
          brand: "Eter Niu",
          price: { amount: i.price, currency: "USD" },
          imageUrl: i.image || "",
          productUrl: "",
          tags: [],
          stock: 0,
        })),
      })

      const res = await fetch("/api/checkout/datafast", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            title: i.title,
            sku: i.sku,
            quantity: i.quantity,
            unitPrice: i.price,
            // Atajo para el caso "base 0" del script de certificación de
            // Datafast: /checkout/pago?base0=1 marca los ítems tarifa 0%.
            ...(new URLSearchParams(window.location.search).get("base0") === "1"
              ? { zeroRated: true }
              : {}),
          })),
          customer: {
            givenName: form.givenName,
            middleName: form.middleName || undefined,
            surname: form.surname,
            idNumber: cedulaDigits,
            email: form.email,
            phone: phoneDigits,
            street: form.street,
            city: form.city || undefined,
            countryCode: "EC",
          },
        }),
      })
      const data = (await res.json()) as CheckoutResponse
      if (!res.ok || data.error) {
        throw new Error(data.message || data.error || "No se pudo iniciar el pago.")
      }
      setCheckout(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error iniciando el pago.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Shell>
      <h1 className="text-[26px] font-semibold text-[#1A1A18]">Pagar con tarjeta</h1>
      <p className="mt-1 text-[14px] text-[#6B6B66]">
        Total a pagar: <strong className="text-[#1A1A18]">${totalAmount.toFixed(2)}</strong>{" "}
        (IVA incluido)
      </p>

      {!checkout && (
        <div className="mt-6 space-y-3">
          <Row>
            <Field label="Primer nombre" value={form.givenName} onChange={(v) => setForm({ ...form, givenName: v })} />
            <Field label="Segundo nombre" value={form.middleName} onChange={(v) => setForm({ ...form, middleName: v })} />
          </Row>
          <Row>
            <Field label="Apellidos" value={form.surname} onChange={(v) => setForm({ ...form, surname: v })} />
            <Field label="Cédula" value={form.idNumber} onChange={(v) => setForm({ ...form, idNumber: v })} />
          </Row>
          <Row>
            <Field label="Teléfono" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
            <Field label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          </Row>
          <Field label="Dirección" value={form.street} onChange={(v) => setForm({ ...form, street: v })} />
          <Field label="Ciudad (opcional)" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />

          {error && <p className="text-[13px] text-[#C4502A]">{error}</p>}

          <button
            type="button"
            onClick={startCheckout}
            disabled={loading}
            className="w-full rounded-full bg-[var(--accent)] px-5 py-3 text-[14px] font-semibold text-[#FAF7F2] hover:opacity-85 disabled:opacity-50 transition-opacity"
          >
            {loading ? "Iniciando pago seguro…" : "Continuar al pago seguro"}
          </button>
          <p className="text-[12px] text-[#6B6B66] text-center">
            Pago procesado por Datafast. Tus datos de tarjeta nunca pasan por
            nuestros servidores. Al continuar aceptas nuestra{" "}
            <a href="/privacidad" className="text-[var(--accent)] underline">
              Política de Privacidad
            </a>{" "}
            y los{" "}
            <a href="/terminos" className="text-[var(--accent)] underline">
              Términos
            </a>
            .
          </p>
          <a href="/cart" className="block text-center text-[13px] text-[#6B6B66] underline">
            Volver al carrito
          </a>
        </div>
      )}

      {checkout && checkout.provider === "datafast-dry-run" && (
        <div className="mt-6 rounded-xl border border-dashed border-[#236B4A] bg-[#F1F7F3] p-5">
          <p className="text-[13px] font-semibold text-[#236B4A]">
            MODO PRUEBA (sin credenciales Datafast)
          </p>
          <p className="mt-1 text-[13px] text-[#1A1A18]">
            El widget real de tarjeta aparecerá aquí cuando se configuren las
            credenciales. Por ahora puedes simular el resultado:
          </p>
          <div className="mt-4 flex gap-2">
            <a
              href={`/checkout/resultado?id=${encodeURIComponent(checkout.checkoutId)}`}
              className="flex-1 rounded-full bg-[#236B4A] px-4 py-2.5 text-center text-[13px] font-semibold text-white"
            >
              Simular pago aprobado
            </a>
            <a
              href={`/checkout/resultado?id=fallo.${encodeURIComponent(checkout.reference)}`}
              className="flex-1 rounded-full border border-[#E8E2D8] px-4 py-2.5 text-center text-[13px] text-[#6B6B66]"
            >
              Simular rechazo
            </a>
          </div>
        </div>
      )}

      {checkout && checkout.provider === "datafast" && (
        <div className="mt-6">
          <div ref={widgetRef} />
        </div>
      )}
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#10160e]">
      <div className="mx-auto max-w-md px-4 py-10">
        <div className="rounded-2xl border border-white/10 bg-white p-6">{children}</div>
      </div>
    </div>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-[#1A1A18] mb-1">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-[#E8E2D8] px-3 py-2 text-[14px] text-[#1A1A18] focus:border-[var(--accent)] focus:outline-none"
      />
    </div>
  )
}
