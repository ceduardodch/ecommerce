"use client"

import { useEffect, useRef, useState } from "react"

// Visor 360° por secuencia de fotos (turntable): arrastra para girar, auto-gira
// hasta que el usuario interactúa, soporta touch (móvil) y teclado.
// Las `frames` deben ser el producto fotografiado cada ~10-15° con el MISMO
// encuadre y fondo quitado, en orden alrededor del eje.
export function Product360Viewer({
  frames,
  alt,
  className = "",
  autoSpin = true,
  sensitivity = 7,
}: {
  frames: string[]
  alt: string
  className?: string
  autoSpin?: boolean
  /** píxeles de arrastre por cada cambio de frame */
  sensitivity?: number
}) {
  const total = frames.length
  const [index, setIndex] = useState(0)
  const [loaded, setLoaded] = useState(0)
  const [ready, setReady] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [hintOn, setHintOn] = useState(true)

  const drag = useRef({ startX: 0, startIndex: 0, active: false })
  const interacted = useRef(false)

  // Precarga de todos los frames antes de habilitar el giro.
  useEffect(() => {
    let done = 0
    let cancelled = false
    const imgs = frames.map((src) => {
      const im = new Image()
      const mark = () => {
        if (cancelled) return
        done += 1
        setLoaded(done)
        if (done === total) setReady(true)
      }
      im.onload = mark
      im.onerror = mark
      im.src = src
      return im
    })
    return () => {
      cancelled = true
      imgs.forEach((im) => {
        im.onload = null
        im.onerror = null
      })
    }
  }, [frames, total])

  // Auto-giro hasta la primera interacción.
  useEffect(() => {
    if (!ready || !autoSpin || interacted.current) return
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % total)
    }, 95)
    return () => window.clearInterval(id)
  }, [ready, autoSpin, total])

  const stopAuto = () => {
    interacted.current = true
    setHintOn(false)
  }

  const onPointerDown = (e: React.PointerEvent) => {
    if (!ready) return
    stopAuto()
    setDragging(true)
    drag.current = { startX: e.clientX, startIndex: index, active: true }
    ;(e.currentTarget as Element).setPointerCapture?.(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.active) return
    const dx = e.clientX - drag.current.startX
    const step = Math.round(dx / sensitivity)
    let ni = (drag.current.startIndex - step) % total
    if (ni < 0) ni += total
    setIndex(ni)
  }

  const onPointerUp = () => {
    drag.current.active = false
    setDragging(false)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      stopAuto()
      setIndex((i) => (i - 1 + total) % total)
    } else if (e.key === "ArrowRight") {
      stopAuto()
      setIndex((i) => (i + 1) % total)
    }
  }

  const pct = total ? Math.round((loaded / total) * 100) : 0

  return (
    <div
      role="slider"
      aria-label={`Vista 360° de ${alt}`}
      aria-valuemin={0}
      aria-valuemax={total - 1}
      aria-valuenow={index}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onKeyDown={onKeyDown}
      className={`relative w-full select-none overflow-hidden rounded-[14px] bg-[#f7f7ed] outline-none ${
        dragging ? "cursor-grabbing" : "cursor-grab"
      } ${className}`}
      style={{ touchAction: "pan-y" }}
    >
      <div className="relative aspect-[4/5] w-full">
        {frames.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src}
            src={src}
            alt={i === index ? alt : ""}
            aria-hidden={i === index ? undefined : true}
            draggable={false}
            className="pointer-events-none absolute inset-0 h-full w-full object-contain"
            style={{
              opacity: i === index ? 1 : 0,
              filter: "drop-shadow(0 22px 40px rgba(28, 58, 19, 0.28))",
            }}
          />
        ))}

        {/* Cargando */}
        {!ready && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[13px] text-[#6B6B66]">
            <div className="h-1 w-32 overflow-hidden rounded-full bg-[#E8E2D8]">
              <div
                className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-200"
                style={{ width: `${pct}%` }}
              />
            </div>
            Cargando vista 360°… {pct}%
          </div>
        )}

        {/* Pista de interacción */}
        {ready && hintOn && (
          <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-[#1A1A18]/70 px-3 py-1 text-[12px] font-medium text-white backdrop-blur-sm">
            ↔ Arrastra para girar 360°
          </div>
        )}
      </div>
    </div>
  )
}
