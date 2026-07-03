"use client"

import { useState } from "react"
import { Star, Loader2 } from "lucide-react"
import { trackStorefrontEvent } from "../analytics"

type ReviewFormProps = {
  productId: string
  productSku: string
  productName: string
  onSuccess: () => void
}

export function ReviewForm({ productId, productSku, productName, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  // Honeypot anti-bots: campo oculto que un humano nunca llena.
  const [website, setWebsite] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const phoneOk = /^(\+?593|0)?9\d{8}$/.test(phone.replace(/[\s-]/g, ""))

  const handleSubmit = async () => {
    if (!rating || !title.trim() || !content.trim() || !name.trim() || !phone.trim()) {
      setError("Completa calificación, nombre, teléfono, título y reseña.")
      return
    }
    if (name.trim().length < 2) {
      setError("Escribe tu nombre.")
      return
    }
    if (!phoneOk) {
      setError("Teléfono inválido: usa el celular con el que compraste (09XXXXXXXX).")
      return
    }
    if (content.trim().length < 10) {
      setError("Cuéntanos un poco más (mínimo 10 caracteres).")
      return
    }

    setSubmitting(true)
    setError("")

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          product_sku: productSku,
          customer_phone: phone.replace(/[\s-]/g, ""),
          customer_name: name.trim(),
          rating,
          title: title.trim(),
          content: content.trim(),
          website, // honeypot
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || "Error al publicar reseña")
      }

      trackStorefrontEvent({
        eventName: "Contact",
        type: "review_submitted",
        source: "storefront",
        cta: "submit_review",
        placement: "review_form",
        metadata: {
          product_id: productId,
          product_sku: productSku,
          rating,
        },
      })

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar reseña")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-2xl border border-[#e8e5d8] bg-white p-6">
      <h3 className="text-[18px] font-semibold text-[#1c1c18] mb-1">
        Escribe tu reseña de {productName}
      </h3>
      <p className="text-[13px] text-[#5a5a52] mb-6">
        Tu opinión ayuda a otros clientes a decidir. Si compraste con tu
        WhatsApp, tu reseña saldrá con el sello de compra verificada.
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[13px]">
          {error}
        </div>
      )}

      {/* Rating selector */}
      <div className="mb-5">
        <label className="block text-[12px] font-semibold text-[#1c3a13] mb-2">
          Calificación *
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className="p-1.5 hover:scale-110 transition-transform"
              type="button"
              aria-label={`${star} estrellas`}
            >
              <Star
                size={32}
                className={star <= rating ? "fill-[#1c3a13] text-[#1c3a13]" : "text-[#e8e5d8]"}
              />
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="text-[11px] text-[#5a5a52] mt-1">
            {rating === 1 && "Malo"}
            {rating === 2 && "Regular"}
            {rating === 3 && "Bueno"}
            {rating === 4 && "Muy bueno"}
            {rating === 5 && "Excelente"}
          </p>
        )}
      </div>

      {/* Nombre y teléfono */}
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-[12px] font-semibold text-[#1c3a13] mb-2">
            Tu nombre *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-11 rounded-xl border border-[#e8e5d8] bg-white px-3 text-[14px] text-[#1c1c18] focus:border-[#1c3a13] focus:ring-2 focus:ring-[#1c3a13]/20 outline-none"
            placeholder="Ej: María García"
            maxLength={80}
          />
        </div>
        <div>
          <label className="block text-[12px] font-semibold text-[#1c3a13] mb-2">
            Celular de tu compra *
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full h-11 rounded-xl border border-[#e8e5d8] bg-white px-3 text-[14px] text-[#1c1c18] focus:border-[#1c3a13] focus:ring-2 focus:ring-[#1c3a13]/20 outline-none"
            placeholder="09XXXXXXXX"
            maxLength={15}
          />
          <p className="text-[11px] text-[#5a5a52] mt-1">
            Solo para verificar tu compra; no se publica.
          </p>
        </div>
      </div>

      {/* Honeypot (oculto para humanos) */}
      <input
        type="text"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        name="website"
      />

      {/* Título */}
      <div className="mb-4">
        <label className="block text-[12px] font-semibold text-[#1c3a13] mb-2">
          Título *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full h-11 rounded-xl border border-[#e8e5d8] bg-white px-3 text-[14px] text-[#1c1c18] focus:border-[#1c3a13] focus:ring-2 focus:ring-[#1c3a13]/20 outline-none"
          placeholder="Resumen de tu opinión"
          maxLength={100}
        />
        <p className="text-[11px] text-[#5a5a52] mt-1">
          {title.length}/100 caracteres
        </p>
      </div>

      {/* Contenido */}
      <div className="mb-6">
        <label className="block text-[12px] font-semibold text-[#1c3a13] mb-2">
          Reseña *
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-32 rounded-xl border border-[#e8e5d8] bg-white p-3 text-[14px] text-[#1c1c18] resize-none focus:border-[#1c3a13] focus:ring-2 focus:ring-[#1c3a13]/20 outline-none"
          placeholder="Comparte tu experiencia con el producto... ¿Qué te gustó? ¿Cómo mejoró tu cocina?"
          minLength={10}
          maxLength={1000}
        />
        <p className="text-[11px] text-[#5a5a52] mt-1">
          {content.length}/1000 caracteres (mínimo 10)
        </p>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!rating || !title.trim() || !content.trim() || !name.trim() || !phone.trim() || submitting}
        className="w-full rounded-full bg-[#1c3a13] px-5 py-3 text-[14px] font-semibold text-[#fcfcf7] disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-85 transition-opacity flex items-center justify-center gap-2"
        type="button"
      >
        {submitting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Publicando...
          </>
        ) : (
          "Publicar reseña"
        )}
      </button>
    </div>
  )
}
