import type { ReactNode } from "react"

export function SectionHead({
  eyebrow,
  title,
}: {
  eyebrow?: string
  title?: string
}) {
  return (
    <div className="mb-6">
      {eyebrow && (
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-[var(--accent)]">
          {eyebrow}
        </p>
      )}
      {title && (
        <h2
          className="text-[28px] font-medium leading-snug text-[#1A1A18]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </h2>
      )}
    </div>
  )
}

export function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string
  title?: string
  children: ReactNode
}) {
  return (
    <section className="px-4 py-16 md:py-24 max-w-5xl mx-auto">
      {(eyebrow || title) && <SectionHead eyebrow={eyebrow} title={title} />}
      {children}
    </section>
  )
}
