type CartBadgeProps = {
  count: number
}

export function CartBadge({ count }: CartBadgeProps) {
  if (count === 0) return null

  return (
    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent)] text-[10px] font-semibold text-white">
      {count > 9 ? "9+" : count}
    </span>
  )
}
