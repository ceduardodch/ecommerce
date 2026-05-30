"use client"

import { useEffect, useState } from "react"
import { MessageCircle } from "lucide-react"
import type { Product } from "../../lib/catalog"
import { commercialInfo } from "../../lib/commercial"
import { TrackedWhatsAppLink } from "./analytics"

export function FloatingWhatsAppCta({ product }: { product: Product }) {
  const [visible, setVisible] = useState(false)
  const commerce = commercialInfo(product)

  useEffect(() => {
    const update = () => setVisible(window.scrollY > 420)
    update()
    window.addEventListener("scroll", update, { passive: true })
    return () => window.removeEventListener("scroll", update)
  }, [])

  return (
    <div
      aria-label="WhatsApp flotante"
      className={
        visible ? "floating-whatsapp-cta is-visible" : "floating-whatsapp-cta"
      }
    >
      <TrackedWhatsAppLink
        className="floating-whatsapp-button"
        cta="floating_coupon_whatsapp"
        eventType="whatsapp_opened"
        metadata={{
          journeyStage: "lead_nuevo",
          productInterestSku: product.sku,
          recommendedSku: product.sku,
        }}
        placement="floating_desktop"
        product={product}
        whatsappContext={{
          recommendation: "cupon activo con envio gratis",
          recommendedSku: product.sku,
          journeyStage: "lead_nuevo",
        }}
      >
        <MessageCircle size={22} />
        <span>
          Cupon {commerce.couponCode}
          <small>Stock por WhatsApp</small>
        </span>
      </TrackedWhatsAppLink>
    </div>
  )
}
