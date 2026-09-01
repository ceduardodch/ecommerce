import { PageAmbient } from "../components/ui/page-ambient"
import type { Metadata } from "next"
import { TrackedEventLink } from "../components/analytics"
import { Isotipo } from "../components/ui/isotipo"
import { Photo } from "../components/ui/photo"
import { paymentBadgeLabel } from "../../lib/commercial"
import { brandBaseUrl, kitchenBaseUrl, wellnessBaseUrl } from "../../lib/domains"
import { buildOrganizationJsonLd, buildWebSiteJsonLd } from "../../lib/seo"
import { sellerWhatsappNumber } from "../../lib/whatsapp"

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

// Normalización compartida con el resto del sitio (lib/whatsapp).
const sellerNumber = sellerWhatsappNumber

type Door = {
  vertical: "cocina" | "bienestar"
  href: string
  image: string
  alt: string
  eyebrow: string
  title: string
  promise: string
  chips: string[]
  anchor: string
  cta: string
}

const doors: Door[] = [
  {
    vertical: "cocina",
    href: "",
    image: "/media/photo-hero-cocina.jpg",
    alt: "Ollas y sartenes de granito Eter Niu sobre cocina encendida",
    eyebrow: "Línea cocina",
    title: "Cocina sano, sin esfuerzo",
    promise: "Granito antiadherente para cocinar con menos aceite, todos los días.",
    chips: ["Ollas", "Woks", "Sartenes", "Cuchillos"],
    anchor: "Desde $95 · Envío gratis",
    cta: "Explorar cocina",
  },
  {
    vertical: "bienestar",
    href: "",
    image: "/media/wellness-yoga-mat-suede.jpg",
    alt: "Mat de yoga y rituales de bienestar Eter Niu",
    eyebrow: "Línea bienestar",
    title: "Rituales que te devuelven la calma",
    promise: "Yoga, energía y pausas conscientes para tu rutina diaria.",
    chips: ["Yoga", "Cuencos", "Aromaterapia", "Energía"],
    anchor: "Curado desde Quito · Envío gratis",
    cta: "Explorar bienestar",
  },
]

export default function BrandPortalPage() {
  const wa = `https://wa.me/${sellerNumber()}?text=${encodeURIComponent(
    "Hola Eter Niu, quiero conocer sus productos.",
  )}`
  const doorHrefs: Record<Door["vertical"], string> = {
    cocina: kitchenBaseUrl,
    bienestar: wellnessBaseUrl,
  }

  const organizationJsonLd = buildOrganizationJsonLd("Eter Niu", brandBaseUrl)
  const websiteJsonLd = buildWebSiteJsonLd("Eter Niu", brandBaseUrl)

  return (
    <main className="brand-portal relative isolate min-h-screen bg-[#10160e] px-5 py-10 text-[#FAF7F2] sm:py-14">
      <script
        type="application/ld+json"
        // El contenido lo construimos nosotros desde constantes del sitio, no
        // viene del usuario; JSON.stringify ya escapa las comillas del texto.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <PageAmbient />
      <style>{`.brand-portal a { text-decoration: none; color: inherit; }`}</style>

      <header className="mx-auto flex max-w-4xl flex-col items-center text-center">
        <Isotipo size={56} color="#93E29A" />
        <h1 className="mt-4 text-[40px] font-medium leading-none [font-family:var(--font-display)]">
          Eter Niu
        </h1>
        <p className="mt-2 text-[14px] text-[#A9ADA6]">
          Bienestar &amp; Cocina Consciente · Quito, Ecuador
        </p>
        <p className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[12px] text-[#A9ADA6]">
          <span>+7.000 nos siguen en @eter.niu</span>
          <span aria-hidden="true">·</span>
          <span>Envío gratis por Servientrega</span>
          <span aria-hidden="true">·</span>
          <span>{paymentBadgeLabel}</span>
        </p>
      </header>

      <section className="mx-auto mt-8 grid max-w-4xl gap-4 sm:grid-cols-2">
        {doors.map((door) => (
          <TrackedEventLink
            key={door.vertical}
            href={doorHrefs[door.vertical]}
            cta={`portal_${door.vertical}`}
            placement="brand_portal"
            metadata={{ vertical: door.vertical }}
            className="group block"
          >
            <span
              className="relative block overflow-hidden rounded-2xl"
              data-theme={door.vertical}
            >
              <Photo
                src={door.image}
                alt={door.alt}
                priority
                sizes="(max-width: 640px) 100vw, 50vw"
                className="aspect-[4/5] sm:aspect-[3/4]"
              />
              <span
                className="absolute inset-0 rounded-2xl bg-gradient-to-t from-[#1A1A18]/80 via-[#1A1A18]/25 to-transparent"
                aria-hidden="true"
              />
              <span className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-5 text-left text-[#FAF7F2]">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-[#FAF7F2]">
                  {door.eyebrow}
                </span>
                <span className="text-[28px] font-medium leading-[1.1] [font-family:var(--font-display)]">
                  {door.title}
                </span>
                <span className="text-[13px] leading-snug text-[#FAF7F2]/85">
                  {door.promise}
                </span>
                <span className="flex flex-wrap gap-1.5 pt-1">
                  {door.chips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-[#FAF7F2]/40 px-2.5 py-1 text-[11px]"
                    >
                      {chip}
                    </span>
                  ))}
                </span>
                <span className="mt-2 flex items-center justify-between">
                  <span className="text-[12px] text-[#FAF7F2]/80">
                    {door.anchor}
                  </span>
                  <span className="rounded-full bg-[#d3fa99] px-4 py-2 text-[13px] font-semibold text-[#10160e] transition-transform group-hover:scale-[1.03]">
                    {door.cta} →
                  </span>
                </span>
              </span>
            </span>
          </TrackedEventLink>
        ))}
      </section>

      <section className="mx-auto mt-8 flex max-w-4xl flex-col items-center gap-4 text-center">
        <TrackedEventLink
          href={wa}
          cta="portal_whatsapp"
          placement="brand_portal"
          type="whatsapp_opened"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-[14px] font-semibold text-white">
            ¿No sabes por dónde empezar? Escríbenos
          </span>
        </TrackedEventLink>
        <p className="text-[12px] text-[#A9ADA6]">
          Te asesoramos por WhatsApp, sin compromiso · Elevan tu alma y tu hogar
        </p>
      </section>
    </main>
  )
}
