import type { InputHTMLAttributes } from "react"

export function FormField({
  label,
  ...inputProps
}: {
  label: string
} & InputHTMLAttributes<HTMLInputElement>) {
  const id = inputProps.id ?? `field-${label.toLowerCase().replace(/\s+/g, "-")}`
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-[13px] font-medium text-[#1A1A18]"
      >
        {label}
      </label>
      <input
        id={id}
        {...inputProps}
        className={`h-11 w-full rounded-xl border border-[#E8E2D8] bg-white px-3 text-[14px] text-[#1A1A18] placeholder:text-[#6B6B66] outline-none transition-all focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 ${inputProps.className ?? ""}`}
      />
    </div>
  )
}
