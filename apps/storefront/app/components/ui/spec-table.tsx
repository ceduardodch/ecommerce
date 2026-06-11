export function SpecTable({
  rows,
}: {
  rows: { label: string; value: string }[]
}) {
  return (
    <div className="rounded-2xl border border-[#E8E2D8] bg-white overflow-hidden">
      {rows.map(({ label, value }, index) => (
        <div
          key={label}
          className={`flex items-center justify-between px-4 py-3 text-[12px] ${
            index < rows.length - 1 ? "border-b border-[#E8E2D8]" : ""
          }`}
        >
          <span className="text-[#6B6B66]">{label}</span>
          <span className="font-medium text-[#1A1A18]">{value}</span>
        </div>
      ))}
    </div>
  )
}
