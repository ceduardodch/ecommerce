"use client"

import { useEffect, useRef } from "react"

/**
 * PageAmbient — capa decorativa de ambiente para el canvas night:
 *  - Fondo parallax: halos difusos + aros + destellos que scrollean más lento
 *    que el contenido (profundidad "marcada").
 *  - "Brasa", la llamita mascota: flota, parpadea como fuego y desciende
 *    acompañando el scroll (progreso de página → posición vertical).
 *
 * Reglas: solo transform (compositor), pointer-events none, aria-hidden,
 * apagado con prefers-reduced-motion. El padre necesita `relative isolate`.
 */

type HaloSpec = {
  top: string
  left?: number
  right?: number
  size: number
  color: "lime" | "ember"
  alpha: number
}

const HALOS: HaloSpec[] = [
  { top: "1%", left: -80, size: 340, color: "lime", alpha: 0.13 },
  { top: "12%", right: -100, size: 420, color: "ember", alpha: 0.1 },
  { top: "26%", left: -60, size: 380, color: "lime", alpha: 0.1 },
  { top: "40%", right: -90, size: 400, color: "lime", alpha: 0.12 },
  { top: "55%", left: -70, size: 360, color: "ember", alpha: 0.09 },
  { top: "70%", right: -110, size: 440, color: "lime", alpha: 0.11 },
  { top: "85%", left: -80, size: 380, color: "lime", alpha: 0.1 },
  { top: "100%", right: -60, size: 360, color: "ember", alpha: 0.09 },
]

const HALO_RGB: Record<HaloSpec["color"], string> = {
  lime: "211,250,153",
  ember: "216,90,48",
}

type ShapeSpec = {
  top: string
  left?: number | string
  right?: number | string
  kind: "ring" | "dot-lime" | "dot-amber" | "dot-white"
  size: number
}

const SHAPES: ShapeSpec[] = [
  { top: "6%", right: 48, kind: "ring", size: 110 },
  { top: "10%", left: 64, kind: "dot-lime", size: 5 },
  { top: "22%", left: 36, kind: "ring", size: 70 },
  { top: "30%", right: 88, kind: "dot-white", size: 4 },
  { top: "38%", right: 120, kind: "ring", size: 95 },
  { top: "46%", left: 90, kind: "dot-amber", size: 5 },
  { top: "58%", left: 44, kind: "ring", size: 80 },
  { top: "64%", right: 70, kind: "dot-lime", size: 5 },
  { top: "76%", right: 40, kind: "ring", size: 100 },
  { top: "82%", left: 120, kind: "dot-white", size: 4 },
  { top: "92%", left: 56, kind: "ring", size: 75 },
  { top: "97%", right: 130, kind: "dot-amber", size: 5 },
]

function Halo({ spec }: { spec: HaloSpec }) {
  return (
    <div
      className="absolute rounded-full"
      style={{
        top: spec.top,
        left: spec.left,
        right: spec.right,
        width: spec.size,
        height: spec.size,
        background: `radial-gradient(circle, rgba(${HALO_RGB[spec.color]},${spec.alpha}), transparent 70%)`,
      }}
    />
  )
}

function Shape({ spec }: { spec: ShapeSpec }) {
  const base: React.CSSProperties = {
    top: spec.top,
    left: spec.left,
    right: spec.right,
    width: spec.size,
    height: spec.size,
  }
  if (spec.kind === "ring") {
    return (
      <div
        className="absolute rounded-full border border-white/0"
        style={{ ...base, borderColor: "rgba(211,250,153,0.16)" }}
      />
    )
  }
  const glow =
    spec.kind === "dot-lime"
      ? "211,250,153"
      : spec.kind === "dot-amber"
        ? "250,199,117"
        : "255,255,255"
  return (
    <div
      className="absolute rounded-full"
      style={{
        ...base,
        background: `rgb(${glow})`,
        boxShadow: `0 0 10px 2px rgba(${glow},0.6)`,
      }}
    />
  )
}

function FlameSvg() {
  return (
    <svg viewBox="0 0 200 220" className="h-auto w-full" role="presentation">
      <defs>
        <radialGradient id="pa-glow" cx="50%" cy="58%" r="50%">
          <stop offset="0%" stopColor="rgba(239,140,50,0.38)" />
          <stop offset="100%" stopColor="rgba(239,140,50,0)" />
        </radialGradient>
        <linearGradient id="pa-out" x1="0" y1="10" x2="0" y2="212" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F09A3E" />
          <stop offset="55%" stopColor="#E07428" />
          <stop offset="100%" stopColor="#C7541C" />
        </linearGradient>
        <linearGradient id="pa-mid" x1="0" y1="56" x2="0" y2="192" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F8C061" />
          <stop offset="100%" stopColor="#EF9430" />
        </linearGradient>
        <radialGradient id="pa-core" cx="50%" cy="42%" r="65%">
          <stop offset="0%" stopColor="#FDEDB4" />
          <stop offset="60%" stopColor="#FAD37C" />
          <stop offset="100%" stopColor="#F5B255" />
        </radialGradient>
        <linearGradient id="pa-drop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F5A93F" />
          <stop offset="100%" stopColor="#E07428" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="130" rx="96" ry="86" fill="url(#pa-glow)" />
      <path
        fill="url(#pa-out)"
        d="M102 12 C 116 42, 142 62, 152 94 C 160 120, 158 150, 146 172 C 158 167, 166 157, 170 144 C 174 168, 162 190, 140 201 C 126 208, 112 211, 100 211 C 88 211, 74 208, 60 201 C 38 190, 26 168, 30 144 C 34 157, 42 167, 54 172 C 42 150, 40 120, 48 94 C 58 62, 88 42, 102 12 Z"
      />
      <path
        fill="url(#pa-mid)"
        d="M100 58 C 118 84, 138 98, 142 130 C 146 160, 130 186, 100 191 C 70 186, 54 160, 58 130 C 62 98, 82 84, 100 58 Z"
      />
      <path
        fill="url(#pa-core)"
        d="M100 98 C 112 114, 128 124, 130 149 C 132 174, 118 190, 100 190 C 82 190, 68 174, 70 149 C 72 124, 88 114, 100 98 Z"
      />
      <ellipse cx="76" cy="160" rx="10.5" ry="6" fill="#F0997B" opacity="0.5" />
      <ellipse cx="124" cy="160" rx="10.5" ry="6" fill="#F0997B" opacity="0.5" />
      <path d="M72 150 q 9 -11 18 0" stroke="#6E3A12" strokeWidth="5.5" fill="none" strokeLinecap="round" />
      <path d="M110 150 q 9 -11 18 0" stroke="#6E3A12" strokeWidth="5.5" fill="none" strokeLinecap="round" />
      <path d="M87 167 q 13 12 26 0" stroke="#6E3A12" strokeWidth="5.5" fill="none" strokeLinecap="round" />
      <g style={{ animation: "pa-emb 2.6s ease-in-out infinite" }}>
        <path
          d="M34 30 C37 36 40 38 40 43 C40 48 37 51 34 51 C31 51 28 48 28 43 C28 38 31 36 34 30 Z"
          fill="url(#pa-drop)"
        />
        <circle cx="20" cy="74" r="3" fill="#F5A93F" opacity="0.8" />
      </g>
      <g style={{ animation: "pa-emb 3.1s ease-in-out infinite 0.6s" }}>
        <path
          d="M168 24 C171 30 174 32 174 37 C174 42 171 45 168 45 C165 45 162 42 162 37 C162 32 165 30 168 24 Z"
          fill="url(#pa-drop)"
        />
        <circle cx="184" cy="64" r="3.5" fill="#EF9F27" opacity="0.8" />
      </g>
      <g style={{ animation: "pa-emb 2.9s ease-in-out infinite 1.2s" }}>
        <path
          d="M188 100 C190 104 192 106 192 110 C192 114 190 116 188 116 C186 116 184 114 184 110 C184 106 186 104 188 100 Z"
          fill="url(#pa-drop)"
        />
        <circle cx="12" cy="114" r="2.5" fill="#FAC775" opacity="0.7" />
      </g>
    </svg>
  )
}

export function PageAmbient({ flame = true }: { flame?: boolean }) {
  const flameRef = useRef<HTMLDivElement>(null)
  const halosRef = useRef<HTMLDivElement>(null)
  const shapesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    let raf = 0
    const update = () => {
      raf = 0
      const y = window.scrollY
      const vh = window.innerHeight
      const max = document.documentElement.scrollHeight - vh
      if (halosRef.current) {
        halosRef.current.style.transform = `translate3d(0, ${y * 0.55}px, 0)`
      }
      if (shapesRef.current) {
        shapesRef.current.style.transform = `translate3d(0, ${y * 0.35}px, 0)`
      }
      if (flameRef.current) {
        const p = max > 0 ? Math.min(y / max, 1) : 0
        const travel = Math.max(vh - 280, 0)
        const sway = Math.sin(y / 170) * 26
        flameRef.current.style.transform = `translate3d(${-sway}px, ${p * travel}px, 0)`
      }
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div ref={halosRef} className="absolute inset-0" style={{ willChange: "transform" }}>
          {HALOS.map((h, i) => (
            <Halo key={i} spec={h} />
          ))}
        </div>
        <div ref={shapesRef} className="absolute inset-0" style={{ willChange: "transform" }}>
          {SHAPES.map((s, i) => (
            <Shape key={i} spec={s} />
          ))}
        </div>
      </div>

      {flame && (
        <div
          ref={flameRef}
          aria-hidden="true"
          className="pointer-events-none fixed right-2 top-20 z-30 w-[68px] motion-reduce:hidden md:right-8 md:w-[104px]"
          style={{ willChange: "transform" }}
        >
          <div style={{ animation: "pa-bob 3.4s ease-in-out infinite" }}>
            <div style={{ animation: "pa-flick 1.7s ease-in-out infinite", transformOrigin: "50% 88%" }}>
              <FlameSvg />
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pa-bob {
          0%, 100% { transform: translateY(0) rotate(-2.5deg); }
          50% { transform: translateY(-9px) rotate(2.5deg); }
        }
        @keyframes pa-flick {
          0%, 100% { transform: scale(1, 1); }
          30% { transform: scale(1.04, 0.965); }
          60% { transform: scale(0.97, 1.045); }
        }
        @keyframes pa-emb {
          0%, 100% { transform: translateY(0); opacity: 0.9; }
          50% { transform: translateY(-7px); opacity: 0.5; }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="pa-bob"], [style*="pa-flick"], [style*="pa-emb"] { animation: none !important; }
        }
      `}</style>
    </>
  )
}
