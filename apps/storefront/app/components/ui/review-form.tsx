"use client"

import { useState } from "react"
import { Star, Camera, X, Loader2 } from "lucide-react"
import { trackStorefrontEvent } from "../analytics"

type ReviewFormProps = {
  productId: string
  productSku: string
  productName: string
  onSuccess: () => void
}

export function ReviewForm({ productId, productSku, productName, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [photos, setPhotos] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    if (!rating || !title || !content) {
      setError("Por favor completa todos los campos obligatorios")
      return
    }

    setSubmitting(true)
    setError("")

    try {
      // Track event
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
          has_photos: photos.length > 0,
        },
      })

      // Submit to API
      const response = await fetch('/admin/b2b/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          product_sku: productSku,
          customer_phone: "USER_PHONE", // TODO: Get from session/auth
          customer_name: "Usuario", // TODO: Get from session/auth
          rating,
          title,
          content,
          photos
        })
      })

      if (!response.ok) {
        throw new Error('Error al publicar reseña')
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar reseña")
    } finally {
      setSubmitting(false)
    }
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // TODO: Upload to storage and get URLs
    // For now: use placeholder
    const newPhotos = files.map(() => "/placeholder.jpg")
    setPhotos([...photos, ...newPhotos].slice(0, 5)) // Max 5 photos
  }

  const removePhoto = (idx: number) => {
    setPhotos(photos.filter((_, i) => i !== idx))
  }

  return (
    <div className="rounded-2xl border border-[#e8e5d8] bg-white p-6">
      <h3 className="text-[18px] font-semibold text-[#1c1c18] mb-1">
        Escribe tu reseña de {productName}
      </h3>
      <p className="text-[13px] text-[#5a5a52] mb-6">
        Tu opinión ayuda a otros clientes a decidir
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

      {/* Título */}
      <div className="mb-4">
        <label className="block text-[12px] font-semibold text-[#1c3a13] mb-2">
          Título *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full h-11 rounded-xl border border-[#e8e5d8] bg-white px-3 text-[14px] focus:border-[#1c3a13] focus:ring-2 focus:ring-[#1c3a13]/20 outline-none"
          placeholder="Resumen de tu opinión"
          maxLength={100}
        />
        <p className="text-[11px] text-[#5a5a52] mt-1">
          {title.length}/100 caracteres
        </p>
      </div>

      {/* Contenido */}
      <div className="mb-5">
        <label className="block text-[12px] font-semibold text-[#1c3a13] mb-2">
          Reseña *
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-32 rounded-xl border border-[#e8e5d8] bg-white p-3 text-[14px] resize-none focus:border-[#1c3a13] focus:ring-2 focus:ring-[#1c3a13]/20 outline-none"
          placeholder="Comparte tu experiencia con el producto... ¿Qué te gustó? ¿Cómo mejoró tu cocina?"
          minLength={20}
          maxLength={1000}
        />
        <p className="text-[11px] text-[#5a5a52] mt-1">
          {content.length}/1000 caracteres (mínimo 20)
        </p>
      </div>

      {/* Fotos */}
      <div className="mb-6">
        <label className="block text-[12px] font-semibold text-[#1c3a13] mb-2">
          Fotos (opcional)
        </label>
        <div className="flex gap-2 mb-3">
          {photos.map((photo, idx) => (
            <div key={idx} className="relative w-16 h-16 rounded-lg bg-[#f7f7ed]">
              <button
                onClick={() => removePhoto(idx)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                type="button"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
        <label className="flex items-center gap-2 text-[13px] text-[#5a5a52] cursor-pointer hover:text-[#1c3a13] transition-colors">
          <Camera size={16} />
          Subir hasta 5 fotos del producto
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotoUpload}
          className="hidden"
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!rating || !title.trim() || !content.trim() || submitting}
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
