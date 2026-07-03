"use client"

import { useState, useEffect } from "react"
import { Star } from "lucide-react"
import { ReviewCard } from "./review-card"
import { ReviewForm } from "./review-form"
import { trackStorefrontEvent } from "../analytics"

type CustomerReviewsProps = {
  productId: string
  productSku: string
  productName: string
}

export function CustomerReviews({ productId, productSku, productName }: CustomerReviewsProps) {
  const [reviews, setReviews] = useState<any[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formSubmitted, setFormSubmitted] = useState(false)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`/api/reviews?product_id=${productId}`)
        if (!response.ok) throw new Error(`reviews HTTP ${response.status}`)
        const data = await response.json()
        setReviews(data.reviews || [])
        setAverageRating(data.average_rating || 0)
        setTotalCount(data.total_count || 0)

        // Track view event
        trackStorefrontEvent({
          eventName: "ViewContent",
          type: "reviews_viewed",
          source: "storefront",
          cta: "product_reviews",
          placement: "product_page",
          metadata: {
            product_id: productId,
            product_sku: productSku,
            review_count: data.total_count,
            average_rating: data.average_rating
          },
        })
      } catch (error) {
        console.error('Error al cargar reseñas:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [productId, productSku])

  const handleWriteReview = () => {
    setShowForm(true)
  }

  const handleFormSuccess = () => {
    setFormSubmitted(true)
    setShowForm(false)

    // Recargar reviews
    const fetchReviews = async () => {
      const response = await fetch(`/api/reviews?product_id=${productId}`)
      const data = await response.json()
      setReviews(data.reviews || [])
      setAverageRating(data.average_rating || 0)
      setTotalCount(data.total_count || 0)
    }

    fetchReviews()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-[#b8c2ae]">Cargando reseñas...</div>
      </div>
    )
  }

  if (formSubmitted) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#d3fa99] mb-4">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-8 h-8 text-white">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-[#b8c2ae] mb-2">
          ¡Gracias por tu reseña!
        </h3>
        <p className="text-[13px] text-[#b8c2ae]">
          Tu opinión ayuda a otros clientes a decidir.
        </p>
      </div>
    )
  }

  if (showForm) {
    return (
      <div>
        <button
          onClick={() => setShowForm(false)}
          className="mb-4 text-[13px] text-[#b8c2ae] hover:text-[#d3fa99] transition-colors"
        >
          ← Volver a reseñas
        </button>
        <ReviewForm
          productId={productId}
          productSku={productSku}
          productName={productName}
          onSuccess={handleFormSuccess}
        />
      </div>
    )
  }

  return (
    <div>
      {/* Rating Summary */}
      {totalCount > 0 ? (
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
          <div className="text-[48px] font-bold text-[#d3fa99]">
            {averageRating}
          </div>
          <div>
            <div className="flex items-center gap-1 mb-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  className={i < Math.round(averageRating) ? "fill-[#d3fa99] text-[#d3fa99]" : "text-[#5a5a52]"}
                />
              ))}
            </div>
            <p className="text-[13px] text-[#b8c2ae]">
              Basado en {totalCount} {totalCount === 1 ? "reseña" : "reseñas"}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-center text-[#b8c2ae] py-8">
          Aún no hay reseñas para este producto. ¡Sé el primero!
        </p>
      )}

      {/* Reviews List */}
      <div className="space-y-4 mb-8">
        {reviews.length === 0 ? (
          <p className="text-center text-[#b8c2ae] py-8">
            Sé el primero en dejar tu opinión
          </p>
        ) : (
          reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))
        )}
      </div>

      {/* Write Review Button */}
      <button
        onClick={handleWriteReview}
        className="w-full rounded-full border-2 border-[#d3fa99] px-5 py-3 text-[14px] font-semibold text-[#d3fa99] hover:bg-[#d3fa99] hover:text-[#10160e] transition-colors"
      >
        Escribir una reseña
      </button>
    </div>
  )
}
