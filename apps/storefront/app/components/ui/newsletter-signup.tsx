"use client"

import { useState, FormEvent } from "react"

export function NewsletterSignup() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setStatus("error")
      return
    }

    setIsLoading(true)

    // TODO: Integrate with actual newsletter service
    // For now, simulate success
    setTimeout(() => {
      setStatus("success")
      setEmail("")
      setIsLoading(false)

      // Reset success message after 5 seconds
      setTimeout(() => {
        setStatus("idle")
      }, 5000)
    }, 500)
  }

  return (
    <div className="hidden lg:block">
      <p className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-[#FAF7F2]">
        Newsletter
      </p>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          className="w-full rounded-full border border-[#E8E2D8] bg-white px-4 py-2 text-[13px] text-[#1A1A18] placeholder:text-[#6B6B66] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          disabled={isLoading || status === "success"}
          aria-label="Email para newsletter"
        />
        <button
          type="submit"
          disabled={isLoading || status === "success"}
          className="w-full rounded-full bg-[#236B4A] px-4 py-2 text-[13px] font-medium text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          {isLoading ? "Suscribiendo..." : "Suscribir"}
        </button>

        {/* Status messages */}
        {status === "success" && (
          <p className="text-[12px] text-[#93E29A]">
            ¡Gracias! Te has suscrito correctamente.
          </p>
        )}
        {status === "error" && (
          <p className="text-[12px] text-[#F0997B]">
            Por favor ingresa un email válido.
          </p>
        )}
      </form>
    </div>
  )
}
