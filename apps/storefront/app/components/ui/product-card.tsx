"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Badge } from "./badge"
import { AddToCartButton } from "./add-to-cart-button"
import { WhatsAppButton } from "./button"
import { ScrollReveal } from "./scroll-reveal"

export type ProductCardData = {
  id: string
  sku: string
  title: string
  subtitle?: string
  price: string
  originalPrice?: string
  image: string
  href: string
  badge?: string
  category?: string
  vertical?: "cocina" | "bienestar"
  stockSignal?: string
  paymentMethods?: string[]
  couponCode?: string
  freeShipping?: boolean
  stoveCompatibility?: string
}

export function ProductCard({ product, index }: { product: ProductCardData; index?: number }) {
  const staggerDelay = (index || 0) * 0.1

  return (
    <ScrollReveal delay={staggerDelay}>
      <motion.div
        whileHover={{
          y: -8, // Lift 8px
          boxShadow: "0 20px 40px -10px rgba(28, 58, 19, 0.15)" // Forest shadow
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20
        }}
        className="rounded-2xl border border-[#e8e5d8] bg-white overflow-hidden text-[#1c1c18] flex flex-col h-full"
      >
        {/* Image 4:5 - Clickable */}
        <motion.a
          href={product.href}
          className="relative w-full aspect-[4/5] bg-[#f2f2e5] block"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <Image
            src={product.image}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
            className="object-cover"
          />
          {product.badge && (
            <div className="absolute top-2 left-2">
              <Badge tone="accent">{product.badge}</Badge>
            </div>
          )}
        </motion.a>

        {/* Info */}
        <div className="p-3 flex flex-col flex-grow">
          <a href={product.href} className="block no-underline">
            <p className="text-[14px] font-medium leading-snug text-[#1c1c18] line-clamp-2">
              {product.title}
            </p>
            {product.subtitle && (
              <p className="mt-0.5 text-[11px] text-[#5a5a52]">
                {product.subtitle}
              </p>
            )}
            <div className="mt-2 flex items-baseline gap-2">
              {product.originalPrice && (
                <span className="text-[13px] text-[#5a5a52] line-through">
                  {product.originalPrice}
                </span>
              )}
              <span className="text-[16px] font-medium text-[#1c3a13]">
                {product.price}
              </span>
            </div>
          </a>

          {/* Action Buttons */}
          <div className="mt-3 flex flex-col gap-2">
            {/* Mobile: WhatsApp button (flujo actual) */}
            <div className="md:hidden">
              <WhatsAppButton
                product={{
                  id: product.id,
                  variantId: product.id,
                  sku: product.sku,
                  title: product.title,
                  category: product.category || "",
                  brand: "Eter Niu",
                  price: {
                    amount: parseFloat(product.price.replace("$", "")),
                    currency: "USD",
                  },
                  description: "",
                  stock: 0,
                  imageUrl: product.image,
                  productUrl: product.href,
                  tags: [],
                  stockSignal: product.stockSignal,
                  paymentMethods: product.paymentMethods,
                  couponCode: product.couponCode,
                  freeShipping: product.freeShipping,
                  stoveCompatibility: product.stoveCompatibility,
                }}
                placement="product_card"
                label="Pedir por WhatsApp"
                className="w-full"
              />
            </div>

            {/* Desktop: Add to cart button (nuevo flujo) */}
            <div className="hidden md:block">
              <AddToCartButton
                product={{
                  id: product.id,
                  variantId: product.id,
                  sku: product.sku,
                  title: product.title,
                  description: "",
                  category: product.category || "",
                  brand: "Eter Niu",
                  price: {
                    amount: parseFloat(product.price.replace("$", "")),
                    currency: "USD",
                  },
                  imageUrl: product.image,
                  productUrl: product.href,
                  tags: [],
                  stock: 0,
                  stockSignal: product.stockSignal,
                  paymentMethods: product.paymentMethods,
                  couponCode: product.couponCode,
                  freeShipping: product.freeShipping,
                  stoveCompatibility: product.stoveCompatibility,
                  vertical: product.vertical,
                }}
                label="Agregar al carrito"
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#1c3a13] px-5 py-3 text-[14px] font-semibold text-[#fcfcf7] hover:opacity-85 transition-opacity cursor-pointer"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </ScrollReveal>
  )
}
