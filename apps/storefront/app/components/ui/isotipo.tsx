/**
 * Isotipo Eter Niu — nudo pentagonal tejido (5 segmentos entrelazados).
 * Vectorizado (interino) desde el sistema de logo del dueño (jun 2026):
 * símbolo en línea menta sobre grafito. Reemplazar por el SVG original cuando
 * el dueño lo entregue (ref: WEB_REDESIGN_PLAN BRAND-1).
 *
 * Monocromo: hereda el color del contexto vía `color` prop o `currentColor`.
 * Sobre grafito se pasa color menta; sobre marfil, tinta o esmeralda.
 */
export function Isotipo({
  size = 32,
  color = "currentColor",
  strokeWidth = 6,
}: {
  size?: number
  color?: string
  strokeWidth?: number
}) {
  // Cinco segmentos redondeados rotados 72° forman el nudo de 5 lados.
  // Cada banda es un cuadrilátero con esquinas redondeadas; el solape crea
  // la ilusión de tejido (over/under) del logo.
  const strands = [0, 72, 144, 216, 288]
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
    >
      <g
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        {strands.map((angle) => (
          <path
            key={angle}
            d="M50 16 C70 16 80 30 80 48 C80 62 70 72 50 72 C30 72 20 62 20 48 C20 30 30 16 50 16 Z"
            transform={`rotate(${angle} 50 50)`}
            opacity="0.92"
          />
        ))}
      </g>
    </svg>
  )
}
