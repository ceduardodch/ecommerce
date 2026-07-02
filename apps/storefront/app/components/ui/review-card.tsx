"use client"

import Image from "next/image"
import { useState } from "react"
import { motion } from "framer-motion"
import { Star, ThumbsUp } from "lucide-react"

type Review = {
  id: string
  customer_name: string
  rating: number
  title: string
  content: string
  photos: string[]
  verified_purchase: boolean
  created_at: string
  helpful_count: number
}

export function ReviewCard({ review }: { review: Review }) {
  const [helpful, setHelpful] = useState(false)

  const handleHelpful = async () => {
    if (helpful) return // Prevent double clicks

    try {
      await fetch(`/admin/b2b/reviews/${review.id}/helpful`, {
        method: 'POST',
      })
      setHelpful(true)
    } catch (error) {
      console.error('Error al marcar útil:', error)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-[#e8e5d8] bg-white p-5"
    >
      {/* Header: nombre + fecha + verificado */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-[#1c1c18]">
              {review.customer_name}
            </span>
            {review.verified_purchase && (
              <span className="text-[10px] font-semibold text-[#1c3a13] bg-[#d3fa99] px-2 py-0.5 rounded-full">
                ✓ Compra verificada
              </span>
            )}
          </div>
          <span className="text-[11px] text-[#5a5a52]">
            {new Date(review.created_at).toLocaleDateString('es-EC')}
          </span>
        </div>
      </div>

      {/* Rating + Título */}
      <div className="mb-3">
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={16}
              className={i < review.rating ? "fill-[#1c3a13] text-[#1c3a13]" : "text-[#e8e5d8]"}
            />
          ))}
        </div>
        <h4 className="font-semibold text-[#1c1c18]">{review.title}</h4>
      </div>

      {/* Contenido */}
      <p className="text-[14px] text-[#5a5a52] leading-relaxed mb-4">
        {review.content}
      </p>

      {/* Fotos */}
      {review.photos && review.photos.length > 0 && (
        <div className="flex gap-2 mb-4">
          {review.photos.map((photo, idx) => (
            <div
              key={idx}
              className="relative w-20 h-20 rounded-lg overflow-hidden bg-[#f7f7ed]"
            >
              <Image
                src={photo}
                alt={`Foto ${idx + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* Helpful button */}
      <button
        onClick={handleHelpful}
        disabled={helpful}
        className={`flex items-center gap-1.5 text-[12px] ${
          helpful ? "text-[#1c3a13]" : "text-[#5a5a52]"
        } ${helpful ? "cursor-default" : "hover:text-[#1c3a13]"} transition-colors`}
      >
        <ThumbsUp size={14} />
        Útil ({review.helpful_count + (helpful ? 1 : 0)})
      </button>
    </motion.div>
  )
}
