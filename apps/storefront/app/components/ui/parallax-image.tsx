"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"

type ParallaxImageProps = {
  src: string
  alt: string
  speed?: number // 0.1 = sutil, 0.5 = moderado
  className?: string
}

export function ParallaxImage({
  src,
  alt,
  speed = 0.2,
  className = ""
}: ParallaxImageProps) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], [0, speed * 100])

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.img
        src={src}
        alt={alt}
        style={{ y }}
        className="w-full h-full object-cover"
      />
    </div>
  )
}
