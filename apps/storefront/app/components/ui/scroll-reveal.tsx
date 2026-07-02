"use client"

import { motion, useInView, UseInViewOptions } from "framer-motion"
import { useRef } from "react"

type ScrollRevealProps = {
  children: React.ReactNode
  delay?: number
  direction?: "up" | "down" | "left" | "right"
  distance?: number
  className?: string
  inViewOptions?: UseInViewOptions
}

export function ScrollReveal({
  children,
  delay = 0,
  direction = "up",
  distance = 50,
  className = "",
  inViewOptions = { once: true, amount: 0.3 }
}: ScrollRevealProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, inViewOptions)

  const directionOffset = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance }
  }

  return (
    <motion.div
      ref={ref}
      initial={{
        opacity: 0,
        ...directionOffset[direction]
      }}
      animate={isInView ? {
        opacity: 1,
        x: 0,
        y: 0
      } : {}}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.25, 0.4, 0.25, 1] // Custom cubic-bezier
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
