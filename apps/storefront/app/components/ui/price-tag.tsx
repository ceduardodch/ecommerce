export function PriceTag({
  price,
  originalPrice,
  note,
}: {
  price: string
  originalPrice?: string
  note?: string
}) {
  return (
    <div className="flex flex-wrap items-baseline gap-2">
      {originalPrice && (
        <span className="text-[15px] text-[#6B6B66] line-through">
          {originalPrice}
        </span>
      )}
      <span
        className="text-[20px] font-medium leading-none"
        style={{ color: "var(--accent)" }}
      >
        {price}
      </span>
      {note && (
        <span className="text-[12px] text-[#6B6B66]">{note}</span>
      )}
    </div>
  )
}
