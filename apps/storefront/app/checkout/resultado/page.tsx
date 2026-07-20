"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useCart } from "../../../contexts/CartContext"
import { trackStorefrontEvent } from "../../components/analytics"

type Result = {
  status: "paid" | "failed"
  code?: string
  description?: string
  reference?: string
  amount?: number
}

function Resultado() {
  const params = useSearchParams()
  const { items, totalAmount, clearCart } = useCart()
  const [state, setState] = useState<"loading" | "paid" | "failed">("loading")
  const [result, setResult] = useState<Result | null>(null)
  const settled = useRef(false)

  const id = params.get("id")
  const resourcePath = params.get("resourcePath")

  useEffect(() => {
    if (settled.current) return
    if (!id) {
      setState("failed")
      return
    }
    settled.current = true
    ;(async () => {
      try {
        const resultParams = new URLSearchParams({ id })
        if (resourcePath) resultParams.set("resourcePath", resourcePath)
        const res = await fetch(
          `/api/checkout/datafast/result?${resultParams.toString()}`,
          { cache: "no-store" },
        )
        const data = (await res.json()) as Result
        setResult(data)
        if (data.status === "paid") {
          // El Purchase a Meta solo se dispara con la aprobación de PRODUCCIÓN
          // (000.000.000). Los códigos de prueba (000.100.11x, certificación
          // Datafast) muestran éxito al usuario pero no contaminan campañas.
          if (data.code === "000.000.000") {
          trackStorefrontEvent({
            eventName: "Purchase",
            type: "purchase_confirmed",
            source: "storefront",
            value: data.amount || totalAmount,
            cta: "datafast_paid",
            placement: "checkout_result",
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
            metadata: { reference: data.reference, provider: "datafast" },
          })
          }
          clearCart()
          setState("paid")
        } else {
          setState("failed")
        }
      } catch {
        setState("failed")
      }
    })()
  }, [id, resourcePath, items, totalAmount, clearCart])

  return (
    <div className="min-h-screen bg-[#10160e]">
      <div className="mx-auto max-w-md px-4 py-12">
        <div className="rounded-2xl border border-white/10 bg-white p-8 text-center">
          {state === "loading" && (
            <p className="text-[15px] text-[#6B6B66]">Confirmando tu pago…</p>
          )}

          {state === "paid" && (
            <>
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#236B4A] text-white text-[24px]">
                ✓
              </div>
              <h1 className="text-[22px] font-semibold text-[#1A1A18]">
                ¡Pago confirmado!
              </h1>
              <p className="mt-2 text-[14px] text-[#6B6B66]">
                Gracias por tu compra. Te contactamos por WhatsApp para coordinar
                el envío (48h por Servientrega).
              </p>
              {result?.reference && (
                <p className="mt-3 text-[12px] text-[#6B6B66]">
                  Referencia: {result.reference}
                </p>
              )}
              <a
                href="/"
                className="mt-6 inline-block rounded-full bg-[var(--accent)] px-5 py-3 text-[14px] font-semibold text-[#FAF7F2]"
              >
                Seguir explorando
              </a>
            </>
          )}

          {state === "failed" && (
            <>
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#C4502A] text-white text-[24px]">
                ✕
              </div>
              <h1 className="text-[22px] font-semibold text-[#1A1A18]">
                El pago no se completó
              </h1>
              <p className="mt-2 text-[14px] text-[#6B6B66]">
                {result?.description ||
                  "No pudimos confirmar tu pago. Tu carrito sigue intacto."}
              </p>
              <div className="mt-6 flex flex-col gap-2">
                <a
                  href="/checkout/pago"
                  className="rounded-full bg-[var(--accent)] px-5 py-3 text-[14px] font-semibold text-[#FAF7F2]"
                >
                  Reintentar pago
                </a>
                <a href="/cart" className="text-[13px] text-[#6B6B66] underline">
                  Volver al carrito
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ResultadoPage() {
  return (
    <Suspense fallback={null}>
      <Resultado />
    </Suspense>
  )
}
