export function SpecTable({
  rows,
}: {
  rows: { label: string; value: string }[]
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#16200f] overflow-hidden">
      {rows.map(({ label, value }, index) => (
        <div
          key={label}
          className={`flex items-center justify-between px-4 py-3 text-[12px] ${
            index < rows.length - 1 ? "border-b border-white/10" : ""
          }`}
        >
          <span className="text-[#b8c2ae]">{label}</span>
          <span className="font-medium text-white">{value}</span>
        </div>
      ))}
    </div>
  )
}
