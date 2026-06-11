/**
 * Isotipo interino de Eter Niu — vectorizado a mano desde la foto de perfil
 * de Instagram @eter.niu (jun 2026). Reemplazar cuando el dueño entregue el
 * archivo original SVG/PNG alta (ref: WEB_REDESIGN_PLAN §2.4.1).
 *
 * Hereda el color del contexto (monocromo): usa `color` prop o `currentColor`.
 */
export function Isotipo({
  size = 32,
  color = "currentColor",
}: {
  size?: number
  color?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M50 8 L88 35 L74 80 L26 80 L12 35 Z"
        stroke={color}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path
        d="M50 8 Q60 38 88 35 M88 35 Q58 48 74 80 M74 80 Q48 62 26 80 M26 80 Q42 50 12 35 M12 35 Q40 36 50 8"
        stroke={color}
        strokeWidth="4.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
