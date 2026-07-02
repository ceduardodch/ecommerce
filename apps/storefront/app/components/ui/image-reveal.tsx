"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"

// Revelado editorial de imagen al entrar en viewport: la foto llega con un
// zoom-out lento (1.14 → 1) mientras aparece — el efecto "se siente" al
// scrollear (referencia refero/Limón). Hover: acercamiento sutil.
export function ImageReveal({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.25 })

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div
        initial={{ scale: 1.14, opacity: 0.35 }}
        animate={isInView ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 1.1, ease: [0.22, 0.61, 0.21, 1] }}
        whileHover={{ scale: 1.04 }}
        className="relative h-full w-full"
      >
        {children}
      </motion.div>
    </div>
  )
}
