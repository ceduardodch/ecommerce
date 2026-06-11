export function PromoBar({
  message = "Envío gratis a todo Ecuador",
}: {
  message?: string
}) {
  return (
    <div className="w-full bg-[#1A1A18] px-4 py-2 text-center">
      <p className="text-[11px] text-[#FAF7F2] leading-none">{message}</p>
    </div>
  )
}
