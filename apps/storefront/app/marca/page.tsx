import type { Metadata } from "next"
import { TrackedEventLink } from "../components/analytics"
import { brandBaseUrl, kitchenBaseUrl, wellnessBaseUrl } from "../../lib/domains"

export const metadata: Metadata = {
  title: "Eter Niu — Bienestar & Cocina Consciente",
  description:
    "Elevan tu alma y tu hogar. Cocina saludable de granito y bienestar consciente, con asesoría real por WhatsApp desde Quito, Ecuador.",
  alternates: { canonical: brandBaseUrl },
  openGraph: {
    title: "Eter Niu — Bienestar & Cocina Consciente",
    description: "Elevan tu alma y tu hogar. Quito, Ecuador.",
    url: brandBaseUrl,
  },
}

const ink = "#1A1A18"
const ivory = "#FAF7F2"
const stone = "#6B6B66"
const sand = "#E8E2D8"
const clay = "#C4502A"
const moss = "#2F5D43"

function sellerNumber() {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_SELLER_NUMBER || "0979854915"
  const digits = raw.replace(/\D/g, "")
  if (digits.startsWith("0") && digits.length === 10) {
    return `593${digits.slice(1)}`
  }
  return digits
}

// Isotipo interino vectorizado a mano desde la foto de perfil de Instagram;
// reemplazar cuando el dueño entregue el archivo original (WEB_REDESIGN_PLAN 2.4.1).
function Isotipo({ size = 72, color = ink }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M50 8 L88 35 L74 80 L26 80 L12 35 Z"
        stroke={color}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path
        d="M50 8 Q60 38 88 35 M88 35 Q58 48 74 80 M74 80 Q48 62 26 80 M26 80 Q42 50 12 35 M12 35 Q40 36 50 8"
        stroke={color}
        strokeWidth="4.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

const doorStyle = {
  display: "block",
  border: `1px solid ${sand}`,
  borderRadius: 18,
  padding: "26px 24px",
  background: "#FFFFFF",
  color: ink,
  textDecoration: "none",
}

export default function BrandPortalPage() {
  const wa = `https://wa.me/${sellerNumber()}?text=${encodeURIComponent(
    "Hola Eter Niu, quiero conocer sus productos.",
  )}`

  return (
    <main
      className="brand-portal"
      style={{
        minHeight: "100vh",
        background: ivory,
        color: ink,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 20px",
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
        textAlign: "center",
      }}
    >
      <style>{`.brand-portal a { text-decoration: none; color: inherit; }`}</style>
      <Isotipo />
      <h1
        style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontSize: "clamp(2.4rem, 8vw, 3.6rem)",
          fontWeight: 500,
          margin: "18px 0 6px",
          letterSpacing: "0.01em",
        }}
      >
        Eter Niu
      </h1>
      <p style={{ margin: 0, fontSize: 15, color: stone }}>
        Bienestar &amp; Cocina Consciente
      </p>
      <p style={{ margin: "4px 0 0", fontSize: 13, color: stone }}>
        Elevan tu alma y tu hogar · Quito, Ecuador
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 14,
          width: "min(620px, 100%)",
          margin: "36px 0 28px",
          textAlign: "left",
        }}
      >
        <TrackedEventLink
          href={kitchenBaseUrl}
          cta="portal_cocina"
          placement="brand_portal"
          metadata={{ vertical: "cocina" }}
        >
          <span style={{ ...doorStyle, borderTop: `4px solid ${clay}`, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
            <span style={{ display: "block", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: clay, marginBottom: 8 }}>
              Línea cocina
            </span>
            <span style={{ display: "block", fontFamily: 'Georgia, serif', fontSize: 24, marginBottom: 6 }}>
              Cocina saludable
            </span>
            <span style={{ display: "block", fontSize: 13, color: stone, lineHeight: 1.5 }}>
              Ollas, woks y sartenes de granito para cocinar con menos aceite.
            </span>
            <span style={{ display: "inline-block", marginTop: 14, fontSize: 13, fontWeight: 600, color: clay }}>
              Entrar →
            </span>
          </span>
        </TrackedEventLink>

        <TrackedEventLink
          href={wellnessBaseUrl}
          cta="portal_bienestar"
          placement="brand_portal"
          metadata={{ vertical: "bienestar" }}
        >
          <span style={{ ...doorStyle, borderTop: `4px solid ${moss}`, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
            <span style={{ display: "block", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: moss, marginBottom: 8 }}>
              Línea bienestar
            </span>
            <span style={{ display: "block", fontFamily: 'Georgia, serif', fontSize: 24, marginBottom: 6 }}>
              Bienestar consciente
            </span>
            <span style={{ display: "block", fontSize: 13, color: stone, lineHeight: 1.5 }}>
              Yoga, energía y estilo de vida para tu rutina diaria.
            </span>
            <span style={{ display: "inline-block", marginTop: 14, fontSize: 13, fontWeight: 600, color: moss }}>
              Entrar →
            </span>
          </span>
        </TrackedEventLink>
      </div>

      <TrackedEventLink
        href={wa}
        cta="portal_whatsapp"
        placement="brand_portal"
        type="whatsapp_opened"
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "#25D366",
            color: "#FFFFFF",
            borderRadius: 999,
            padding: "12px 22px",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          Escríbenos por WhatsApp
        </span>
      </TrackedEventLink>

      <p style={{ marginTop: 28, fontSize: 12, color: stone }}>
        @eter.niu · Envío gratis a todo Ecuador por Servientrega
      </p>
    </main>
  )
}
