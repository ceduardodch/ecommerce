import Image from "next/image"

export function Photo({
  src,
  alt,
  width,
  height,
  sizes,
  priority,
  className,
}: {
  src: string
  alt: string
  width?: number
  height?: number
  sizes?: string
  priority?: boolean
  className?: string
}) {
  const isRelative = !src.startsWith("http") && !src.startsWith("//")

  if (isRelative) {
    // next/image with fill for flexible aspect-ratio containers
    return (
      <div
        className={`relative overflow-hidden rounded-2xl bg-[#E8E2D8] ${className ?? ""}`}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes ?? "(max-width: 768px) 100vw, 50vw"}
          className="object-cover"
          priority={priority}
        />
      </div>
    )
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-[#E8E2D8] ${className ?? ""}`}
    >
      <Image
        src={src}
        alt={alt}
        width={width ?? 800}
        height={height ?? 600}
        sizes={sizes ?? "(max-width: 768px) 100vw, 50vw"}
        className="w-full h-auto object-cover"
        priority={priority}
      />
    </div>
  )
}
