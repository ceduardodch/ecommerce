import type { ReactNode } from "react"

export function Badge({
  tone = "accent",
  children,
}: {
  tone?: "accent" | "neutral"
  children: ReactNode
}) {
  const base =
    "inline-block rounded-full px-2 py-0.5 text-[11px] font-medium leading-none"
  const styles =
    tone === "accent"
      ? `${base} bg-[var(--accent)] text-[#FAF7F2]`
      : `${base} bg-[#EFE9DD] text-[#6B6B66]`
  return <span className={styles}>{children}</span>
}
