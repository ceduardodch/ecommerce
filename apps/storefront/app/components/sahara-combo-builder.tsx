"use client"

import Image from "next/image"
import { useMemo, useState } from "react"
import { mgcSaharaPanProducts, type Product } from "../../lib/catalog"
import { useCart } from "../../contexts/CartContext"

type SaharaColor = "Negro" | "Gris"

function cartPayload(product: Product) {
  return {
    id: product.id,
    sku: product.sku,
    title: product.title,
    price: product.price.amount,
    comboPrice: product.comboPrice?.amount,
    comboMinimumItems: product.comboMinimumItems,
    comboGroup: product.comboGroup,
    image: product.imageUrl,
    category: product.category,
  }
}

export function SaharaComboBuilder() {
  const [color, setColor] = useState<SaharaColor>("Negro")
  const { addItem, removeItem, items, openCart } = useCart()
  const products = useMemo(
    () => mgcSaharaPanProducts.filter((product) => product.color === color),
    [color],
  )
  const selected = products.filter((product) =>
    items.some((item) => item.id === product.id),
  )
  const isComplete = selected.length === products.length
  const total = selected.reduce(
    (sum, product) => sum + (isComplete ? product.comboPrice?.amount || 0 : product.price.amount),
    0,
  )
  const image = `/media/mgc-sahara/sahara-${color.toLowerCase()}-set-real.jpeg`
  const video = `/media/mgc-sahara/sahara-${color.toLowerCase()}-set-real.mp4`

  const toggleProduct = (product: Product) => {
    const inCart = items.some((item) => item.id === product.id)
    if (inCart) removeItem(product.id)
    else addItem(cartPayload(product))
  }

  return (
    <section className="border-y border-white/10 bg-[#10160e] px-4 py-16">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-black/20">
          <Image src={image} alt={`Set Sahara ${color.toLowerCase()} real de tres sartenes`} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          <span className="absolute bottom-4 left-4 rounded-full bg-black/65 px-3 py-1 text-[11px] font-semibold text-white">Foto real · Sahara {color.toLowerCase()}</span>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#d3fa99]">Arma tu combo</p>
          <h2 className="mt-2 text-[clamp(28px,5vw,42px)] font-medium leading-tight text-white" style={{ fontFamily: "var(--font-display)" }}>Sahara · 3 sartenes</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-[#b8c2ae]">Elige una variante y agrega las medidas que quieres. El precio especial se activa al completar las tres.</p>
          <div className="mt-5 flex gap-2" role="group" aria-label="Color del set Sahara">
            {(["Negro", "Gris"] as const).map((option) => (
              <button key={option} type="button" onClick={() => setColor(option)} className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${color === option ? "border-[#d3fa99] bg-[#d3fa99] text-[#10160e]" : "border-white/30 text-white hover:border-white"}`}>{option}</button>
            ))}
          </div>
          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            {products.map((product) => {
              const active = selected.some((item) => item.id === product.id)
              return <button key={product.id} type="button" onClick={() => toggleProduct(product)} className={`rounded-xl border p-3 text-left transition-colors ${active ? "border-[#d3fa99] bg-[#d3fa99]/15 text-white" : "border-white/20 text-[#b8c2ae] hover:border-white/50"}`}><span className="block text-sm font-semibold">{product.diameterCm} cm</span><span className="mt-1 block text-xs">{active ? "Incluida" : "Agregar"}</span></button>
            })}
          </div>
          <div className="mt-5 rounded-xl border border-white/12 bg-white/5 p-4">
            <p className="text-sm text-[#b8c2ae]">{selected.length ? `Contiene: ${selected.map((product) => `${product.diameterCm} cm`).join(", ")}.` : "Selecciona las piezas del set."}</p>
            <div className="mt-2 flex items-baseline justify-between gap-4"><span className="text-sm font-semibold text-white">{isComplete ? "Precio Sahara activado" : `Faltan ${products.length - selected.length} piezas`}</span><span className="text-2xl font-semibold text-[#d3fa99]">${total.toFixed(2)}</span></div>
          </div>
          <details className="mt-3 rounded-xl border border-white/12 px-4 py-3 text-sm text-[#b8c2ae]">
            <summary className="cursor-pointer font-semibold text-white">Ver video real del set {color.toLowerCase()}</summary>
            <video className="mt-3 w-full rounded-lg" controls preload="metadata" poster={image} src={video} />
          </details>
          <button type="button" onClick={openCart} disabled={!selected.length} className="mt-5 rounded-full bg-[#d3fa99] px-5 py-3 text-sm font-semibold text-[#10160e] disabled:cursor-not-allowed disabled:opacity-45">Ver combo en el carrito</button>
        </div>
      </div>
    </section>
  )
}
