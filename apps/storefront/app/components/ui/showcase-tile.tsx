"use client"

import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import type { Product } from "../../../lib/catalog"
import { productPath } from "../../../lib/catalog"
import { productMedia } from "../../../lib/product-media"
import { ScrollReveal } from "./scroll-reveal"
import { ImageReveal } from "./image-reveal"
import { AddToCartButton } from "./add-to-cart-button"

export function ShowcaseTile({
  product,
  delay = 0,
}: {
  product: Product
  delay?: number
}) {
  const images = useMemo(
    () => productMedia(product).filter((item) => item.type === "image"),
    [product],
  )
  const initialIndex = useMemo(
    () =>
      product.sku.split("").reduce((total, character) => total + character.charCodeAt(0), 0) %
      Math.max(images.length, 1),
    [images.length, product.sku],
  )
  const [activeIndex, setActiveIndex] = useState(initialIndex)
  const [paused, setPaused] = useState(false)
  const activeImage = images[activeIndex % Math.max(images.length, 1)]

  useEffect(() => setActiveIndex(initialIndex), [initialIndex])

  useEffect(() => {
    if (paused || images.length < 2) return
    const rotation = window.setInterval(
      () => setActiveIndex((current) => (current + 1) % images.length),
      4200,
    )
    return () => window.clearInterval(rotation)
  }, [images.length, paused])

  const hasPromo =
    product.originalPrice && product.originalPrice.amount > product.price.amount

  return (
    <ScrollReveal delay={delay} distance={60}>
      <article>
        <a
          href={productPath(product)}
          className="block no-underline"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <ImageReveal className="relative aspect-square w-full rounded-[2px] bg-white">
            <Image
              src={activeImage?.src || product.imageUrl}
              alt={activeImage?.alt || product.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain transition-opacity duration-500"
            />
            {images.length > 1 && (
              <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur">
                {activeIndex % images.length + 1}/{images.length} · fotos
              </span>
            )}
            {hasPromo && (
              <span className="absolute left-4 top-4 rounded-full bg-[#1c3a13] px-3 py-1 text-[11px] font-semibold text-[#d3fa99]">
                -
                {Math.round(
                  ((product.originalPrice!.amount - product.price.amount) /
                    product.originalPrice!.amount) *
                    100,
                )}
                % hoy
              </span>
            )}
          </ImageReveal>
        </a>

        {/* Caption sobre el canvas oscuro */}
        <div className="mt-5 flex flex-col gap-1.5 px-1">
          <a href={productPath(product)} className="no-underline">
            <h3
              className="text-[22px] font-semibold leading-snug tracking-wide text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {product.title}
            </h3>
          </a>
          {(product.collection || product.color) && (
            <p className="text-[12px] font-medium text-[#b8c2ae]">
              {[product.collection, product.color].filter(Boolean).join(" · ")}
            </p>
          )}
          <div className="flex items-baseline gap-2">
            {hasPromo && (
              <s className="text-[13px] text-[#b8c2ae]">
                ${product.originalPrice!.amount.toFixed(2)}
              </s>
            )}
            <span className="text-[18px] font-semibold text-[#d3fa99]">
              PVP ${product.price.amount.toFixed(2)}
            </span>
          </div>
          {product.comboPrice && (
            <p className="text-[13px] font-semibold text-emerald-300">
              Precio verde desde {product.comboMinimumItems || 3}: $
              {product.comboPrice.amount.toFixed(2)}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2.5">
            <AddToCartButton
              product={product}
              label="Agregar al carrito"
              className="inline-flex items-center gap-2 rounded-full bg-[#d3fa99] px-5 py-2.5 text-[13px] font-semibold text-[#10160e] hover:opacity-90 transition-opacity cursor-pointer"
            />
            <a
              href={productPath(product)}
              className="inline-flex items-center gap-2 rounded-full border border-white/35 px-5 py-2.5 text-[13px] font-semibold text-white hover:border-white"
            >
              Ver ficha
            </a>
          </div>
        </div>
      </article>
    </ScrollReveal>
  )
}
