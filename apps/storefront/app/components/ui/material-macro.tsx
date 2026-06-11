import Image from "next/image"

export function MaterialMacro({
  items,
}: {
  items: { image: string; caption: string }[]
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map(({ image, caption }) => (
        <div key={caption} className="flex flex-col gap-1.5">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#E8E2D8]">
            <Image
              src={image}
              alt={caption}
              fill
              sizes="(max-width: 768px) 33vw, 200px"
              className="object-cover"
            />
          </div>
          <p className="text-[10px] leading-snug text-[#6B6B66] text-center">
            {caption}
          </p>
        </div>
      ))}
    </div>
  )
}
