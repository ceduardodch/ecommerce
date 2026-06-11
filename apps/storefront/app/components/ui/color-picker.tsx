"use client"

export type ColorOption = {
  name: string
  hex: string
}

export function ColorPicker({
  colors,
  value,
  onChange,
}: {
  colors: ColorOption[]
  value: string
  onChange: (name: string) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {colors.map((color) => {
        const isActive = color.name === value
        return (
          <button
            key={color.name}
            type="button"
            onClick={() => onChange(color.name)}
            className="flex items-center gap-2 focus:outline-none"
            aria-label={color.name}
            aria-pressed={isActive}
          >
            {/* 28px chip circle */}
            <span
              className={`block h-7 w-7 rounded-full border-2 transition-all ${
                isActive
                  ? "border-[var(--accent)] ring-2 ring-[var(--accent)] ring-offset-1"
                  : "border-white ring-1 ring-[#E8E2D8]"
              }`}
              style={{ background: color.hex }}
            />
            {isActive && (
              <span className="text-[12px] text-[#1A1A18]">{color.name}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
