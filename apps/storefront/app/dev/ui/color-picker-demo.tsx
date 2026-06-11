"use client"

import { useState } from "react"
import { ColorPicker } from "../../components/ui/color-picker"

const COLORS = [
  { name: "Negro", hex: "#2B2B28" },
  { name: "Sage", hex: "#B7C4B1" },
  { name: "Crema", hex: "#E8DFCE" },
  { name: "Terracota", hex: "#C97B5A" },
]

export function ColorPickerDemo() {
  const [selected, setSelected] = useState("Negro")
  return (
    <div className="space-y-2">
      <ColorPicker colors={COLORS} value={selected} onChange={setSelected} />
      <p className="text-[12px] text-[#6B6B66]">Seleccionado: {selected}</p>
    </div>
  )
}
