import Image from "next/image"

// Hero "producto flotante" — solo CSS, sin WebGL/Three.js.
// variant="default": foto del producto flotando sobre tarjeta clara (campañas).
// variant="hero-dark": landing oscuro — plato blanco gigante flotando sobre
// canvas night, con halo lime, barrido de brillo y destellos (sparkles).
// Ligero para móvil (~80% del tráfico) y respeta prefers-reduced-motion.

type FloatingProductProps = {
  imageUrl: string
  alt: string
  className?: string
  variant?: "default" | "hero-dark"
  /** Marca la imagen como LCP (next/image priority). Solo variant hero-dark. */
  priority?: boolean
}

// Destellos: posición, tamaño, color y timing escalonado (solo opacity+transform).
const SPARKLES: Array<{
  style: React.CSSProperties
  shape: "dot" | "star"
}> = [
  { shape: "dot", style: { top: "6%", left: "12%", width: 4, height: 4, background: "#d3fa99", boxShadow: "0 0 8px #d3fa99", animationDuration: "2.6s", animationDelay: "0s" } },
  { shape: "star", style: { top: "14%", right: "6%", width: 14, height: 14, background: "#fcfcf7", animationDuration: "3.4s", animationDelay: "0.7s" } },
  { shape: "dot", style: { top: "38%", left: "-2%", width: 3, height: 3, background: "#ffffff", boxShadow: "0 0 8px #ffffff", animationDuration: "3.8s", animationDelay: "1.4s" } },
  { shape: "star", style: { bottom: "20%", left: "5%", width: 10, height: 10, background: "#d3fa99", animationDuration: "4.4s", animationDelay: "2.1s" } },
  { shape: "dot", style: { bottom: "10%", right: "10%", width: 4, height: 4, background: "#d3fa99", boxShadow: "0 0 10px #d3fa99", animationDuration: "3.1s", animationDelay: "0.4s" } },
  { shape: "star", style: { top: "48%", right: "-2%", width: 12, height: 12, background: "#fcfcf7", animationDuration: "3.9s", animationDelay: "2.8s" } },
  { shape: "dot", style: { top: "2%", right: "30%", width: 3, height: 3, background: "#ffffff", boxShadow: "0 0 6px #ffffff", animationDuration: "2.9s", animationDelay: "1.9s" } },
]

const STAR_CLIP =
  "polygon(50% 0, 61% 39%, 100% 50%, 61% 61%, 50% 100%, 39% 61%, 0 50%, 39% 39%)"

export function FloatingProduct({
  imageUrl,
  alt,
  className = "",
  variant = "default",
  priority = false,
}: FloatingProductProps) {
  if (variant === "hero-dark") {
    return (
      <div className={`relative w-full ${className}`} style={{ perspective: "1200px" }}>
        <div className="relative aspect-square w-full">
          {/* Halo lime difuso detrás del plato (estático, barato) */}
          <div
            aria-hidden
            className="absolute inset-0 scale-[1.35] blur-3xl"
            style={{
              background:
                "radial-gradient(closest-side, rgba(211,250,153,0.14), transparent 70%)",
            }}
          />

          {/* Plato blanco + producto: flota y gira suave como una sola pieza */}
          <div className="fp-stage-dark absolute inset-[7%]">
            <div className="relative h-full w-full overflow-hidden rounded-[32px] bg-white">
              <Image
                src={imageUrl}
                alt={alt}
                fill
                priority={priority}
                sizes="(max-width: 768px) 92vw, 620px"
                className="object-cover"
              />
              {/* Barrido de brillo periódico (solo transform) */}
              <span
                aria-hidden
                className="fp-shine pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(105deg, transparent 42%, rgba(255,255,255,0.4) 50%, transparent 58%)",
                }}
              />
            </div>
          </div>

          {/* Destellos alrededor del plato */}
          {SPARKLES.map((s, i) => (
            <span
              key={i}
              aria-hidden
              className={`fp-twinkle pointer-events-none absolute ${
                s.shape === "dot" ? "rounded-full" : ""
              }`}
              style={{
                ...s.style,
                ...(s.shape === "star" ? { clipPath: STAR_CLIP } : {}),
              }}
            />
          ))}

          {/* Sombra de piso sobre canvas oscuro */}
          <div className="fp-shadow absolute bottom-[2%] left-1/2 h-6 w-52 -translate-x-1/2 rounded-[100%] bg-black/50 blur-2xl" />
        </div>

        <style>{`
          @keyframes fp-float {
            0%, 100% { transform: translateY(14px); }
            50%      { transform: translateY(-28px); }
          }
          @keyframes fp-sway-soft {
            0%, 100% { transform: rotateY(-10deg); }
            50%      { transform: rotateY(10deg); }
          }
          @keyframes fp-shadow {
            0%, 100% { transform: translateX(-50%) scale(1); opacity: .5; }
            50%      { transform: translateX(-50%) scale(.62); opacity: .22; }
          }
          @keyframes fp-shine {
            0%   { transform: translateX(-150%); }
            18%  { transform: translateX(150%); }
            100% { transform: translateX(150%); }
          }
          @keyframes fp-twinkle {
            0%, 100%  { opacity: 0; transform: scale(.3); }
            45%, 55%  { opacity: 1; transform: scale(1); }
          }
          .fp-stage-dark {
            transform-style: preserve-3d;
            animation: fp-float 4s ease-in-out infinite,
                       fp-sway-soft 6s ease-in-out infinite;
            will-change: transform;
          }
          .fp-shine {
            transform: translateX(-150%);
            animation: fp-shine 7s ease-in-out infinite;
            will-change: transform;
          }
          .fp-twinkle {
            opacity: 0;
            animation-name: fp-twinkle;
            animation-timing-function: ease-in-out;
            animation-iteration-count: infinite;
          }
          .fp-shadow {
            animation: fp-shadow 4s ease-in-out infinite;
            will-change: transform, opacity;
          }
          @media (prefers-reduced-motion: reduce) {
            .fp-stage-dark, .fp-shadow, .fp-shine { animation: none; }
            .fp-twinkle { animation: none; opacity: .5; }
            .fp-shine { display: none; }
          }
        `}</style>
      </div>
    )
  }

  // variant="default" — comportamiento original exacto (campañas)
  return (
    <div
      className={`relative w-full overflow-hidden rounded-[14px] bg-[#f7f7ed] ${className}`}
      style={{ perspective: "1200px" }}
    >
      <div className="relative aspect-[4/5] w-full">
        {/* Producto: flota (translateY) + gira sutilmente en Y */}
        <div className="fp-stage absolute inset-0 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={alt}
            className="fp-img h-[74%] w-auto object-contain"
          />
        </div>

        {/* Sombra en el piso: se encoge cuando el producto sube */}
        <div className="fp-shadow absolute bottom-[10%] left-1/2 h-6 w-44 -translate-x-1/2 rounded-[100%] bg-[#1c3a13]/25 blur-2xl" />
      </div>

      <style>{`
        @keyframes fp-float {
          0%, 100% { transform: translateY(14px); }
          50%      { transform: translateY(-28px); }
        }
        @keyframes fp-sway {
          0%, 100% { transform: rotateY(-24deg); }
          50%      { transform: rotateY(24deg); }
        }
        @keyframes fp-shadow {
          0%, 100% { transform: translateX(-50%) scale(1); opacity: .32; }
          50%      { transform: translateX(-50%) scale(.62); opacity: .14; }
        }
        .fp-stage {
          transform-style: preserve-3d;
          animation: fp-float 4s ease-in-out infinite,
                     fp-sway 6s ease-in-out infinite;
          will-change: transform;
        }
        .fp-img {
          filter: drop-shadow(0 24px 44px rgba(28, 58, 19, 0.32));
          backface-visibility: hidden;
        }
        .fp-shadow {
          animation: fp-shadow 4s ease-in-out infinite;
          will-change: transform, opacity;
        }
        @media (prefers-reduced-motion: reduce) {
          .fp-stage, .fp-shadow { animation: none; }
        }
      `}</style>
    </div>
  )
}
