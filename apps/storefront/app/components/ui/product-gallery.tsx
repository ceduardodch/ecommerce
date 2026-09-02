"use client"

import Image from "next/image"
import { type TouchEvent, useEffect, useRef, useState } from "react"
import type { ProductMediaItem } from "../../../lib/product-media"

type ProductGalleryProps = {
  media: ProductMediaItem[]
  productName: string
}
export function ProductGallery({ media, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const touchStart = useRef<number | null>(null)
  const active = media[activeIndex] ?? media[0]

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setExpanded(false)
    }

    window.addEventListener("keydown", closeOnEscape)
    return () => window.removeEventListener("keydown", closeOnEscape)
  }, [])

  if (!active) return null

  function select(index: number) {
    setActiveIndex((index + media.length) % media.length)
  }

  function onTouchEnd(event: TouchEvent<HTMLDivElement>) {
    if (touchStart.current === null) return
    const movement = event.changedTouches[0].clientX - touchStart.current
    touchStart.current = null
    if (Math.abs(movement) < 48 || media.length < 2) return
    select(activeIndex + (movement < 0 ? 1 : -1))
  }

  return (
    <section aria-label={`Galería de ${productName}`}>
      <div
        className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-white shadow-[0_12px_32px_rgba(0,0,0,0.22)]"
        onTouchStart={(event) => {
          touchStart.current = event.touches[0].clientX
        }}
        onTouchEnd={onTouchEnd}
      >
        {active.type === "image" ? (
          <>
            <Image
              src={active.src}
              alt={active.alt}
              fill
              priority={activeIndex === 0}
              sizes="(max-width: 640px) 100vw, 440px"
              className="object-contain"
            />
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="absolute right-3 top-3 rounded-full bg-black/55 px-3 py-2 text-xs font-medium text-white backdrop-blur hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-[#d3fa99]"
              aria-label={`Ampliar ${active.label}`}
            >
              Ampliar
            </button>
          </>
        ) : (
          <video
            key={active.src}
            controls
            playsInline
            preload="none"
            poster={active.poster}
            className="h-full w-full object-contain bg-black"
            aria-label={active.alt}
          >
            <source src={active.src} type="video/mp4" />
            Tu navegador no puede reproducir este video.
          </video>
        )}

        <p className="absolute bottom-3 left-3 rounded-full bg-black/55 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
          {active.label}
        </p>
      </div>

      {media.length > 1 && (
        <div
          className="mt-3 flex gap-2 overflow-x-auto pb-1"
          role="tablist"
          aria-label="Vistas del producto"
        >
          {media.map((item, index) => {
            const selected = index === activeIndex
            const thumbnail = item.type === "video" ? item.poster : item.src
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-label={item.label}
                onClick={() => select(index)}
                onKeyDown={(event) => {
                  if (event.key === "ArrowRight") select(index + 1)
                  if (event.key === "ArrowLeft") select(index - 1)
                }}
                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#d3fa99] ${
                  selected ? "ring-2 ring-[#d3fa99]" : "opacity-75 hover:opacity-100"
                }`}
              >
                {thumbnail && (
                  <Image
                    src={thumbnail}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-contain p-1"
                  />
                )}
                {item.type === "video" && (
                  <span className="absolute inset-0 grid place-items-center bg-black/25 text-lg text-white">
                    ▶
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {expanded && active.type === "image" && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Imagen ampliada: ${active.label}`}
          onClick={() => setExpanded(false)}
        >
          <div
            className="relative h-full w-full max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={active.src}
              alt={active.alt}
              fill
              sizes="100vw"
              className="object-contain"
            />
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="absolute right-2 top-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#10160e] focus:outline-none focus:ring-2 focus:ring-[#d3fa99]"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
