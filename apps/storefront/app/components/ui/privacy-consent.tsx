"use client"

import { useEffect, useState } from "react"

const KEY = "eter_niu_privacy_ack"

export function PrivacyConsent() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true)
    } catch {
      /* localStorage no disponible */
    }
  }, [])

  if (!show) return null

  const accept = () => {
    try {
      localStorage.setItem(KEY, new Date().toISOString())
    } catch {
      /* noop */
    }
    setShow(false)
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[#3A3E3A] bg-[#2B2E2B] px-4 py-4 text-[#FAF7F2] shadow-[0_-4px_20px_rgba(0,0,0,0.15)]">
      <div className="mx-auto flex max-w-4xl flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] leading-snug text-[#A9ADA6]">
          Usamos cookies y datos para que el sitio funcione, recordar tu carrito y
          mejorar tu experiencia. Al continuar, aceptas nuestra{" "}
          <a href="/privacidad" className="text-[#93E29A] underline">
            Política de Privacidad y Protección de Datos
          </a>
          .
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <a
            href="/privacidad"
            className="rounded-full border border-[#3A3E3A] px-4 py-2 text-[13px] text-[#A9ADA6] hover:text-[#FAF7F2]"
          >
            Más información
          </a>
          <button
            type="button"
            onClick={accept}
            className="rounded-full bg-[#236B4A] px-5 py-2 text-[13px] font-semibold text-white hover:opacity-90"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  )
}
