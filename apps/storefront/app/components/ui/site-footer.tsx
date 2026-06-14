import { NewsletterSignup } from "./newsletter-signup"
import { Isotipo } from "./isotipo"
import { kitchenBaseUrl, wellnessBaseUrl } from "../../../lib/domains"

function InstagramIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

function BrandLockup() {
  return (
    <div>
      <div className="flex items-center gap-2">
        <Isotipo size={28} color="#93E29A" />
        <span
          className="text-[20px] font-medium text-[#FAF7F2]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Eter Niu
        </span>
      </div>
      <p className="mt-2 text-[13px] text-[#A9ADA6]">
        Bienestar &amp; Cocina Consciente
      </p>
      <p className="mt-1 text-[12px] text-[#A9ADA6]">
        Elevan tu alma y tu hogar · Quito, Ecuador
      </p>
    </div>
  )
}

export function SiteFooter() {
  return (
    <footer className="border-t border-[#3A3E3A] bg-[#2B2E2B] px-4 py-12">
      <div className="mx-auto max-w-5xl">
        {/* Mobile layout (single column) */}
        <div className="lg:hidden">
          <div className="mb-6">
            <BrandLockup />
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-[#A9ADA6]">
            <a href="/guias" className="hover:text-[#FAF7F2] transition-colors">
              Guías
            </a>
            <a
              href="https://instagram.com/eter.niu"
              target="_blank"
              rel="noreferrer"
              className="text-[#93E29A] hover:text-[#FAF7F2] transition-colors"
            >
              @eter.niu
            </a>
          </div>

          <p className="mt-8 text-[11px] text-[#A9ADA6]">
            Envío gratis a todo Ecuador por Servientrega · Pagas al recibir
          </p>
        </div>

        {/* Desktop layout (4 columns + newsletter) */}
        <div className="hidden lg:grid lg:grid-cols-5 lg:gap-8">
          {/* Column 1: Brand */}
          <div className="mb-6">
            <BrandLockup />
          </div>

          {/* Column 2: Productos */}
          <div>
            <p className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-[#FAF7F2]">
              Productos
            </p>
            <ul className="space-y-2">
              <li>
                <a
                  href={kitchenBaseUrl}
                  className="text-[13px] text-[#A9ADA6] hover:text-[#FAF7F2] transition-colors"
                >
                  Cocina
                </a>
              </li>
              <li>
                <a
                  href={wellnessBaseUrl}
                  className="text-[13px] text-[#A9ADA6] hover:text-[#FAF7F2] transition-colors"
                >
                  Bienestar
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Recursos */}
          <div>
            <p className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-[#FAF7F2]">
              Recursos
            </p>
            <ul className="space-y-2">
              <li>
                <a
                  href="/guias"
                  className="text-[13px] text-[#A9ADA6] hover:text-[#FAF7F2] transition-colors"
                >
                  Guías
                </a>
              </li>
              <li>
                <a
                  href="/guias/teflon-pfas"
                  className="text-[13px] text-[#A9ADA6] hover:text-[#FAF7F2] transition-colors"
                >
                  Guía PFAS
                </a>
              </li>
              <li>
                <a
                  href="/marca"
                  className="text-[13px] text-[#A9ADA6] hover:text-[#FAF7F2] transition-colors"
                >
                  Marca
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Contacto & Social */}
          <div>
            <p className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-[#FAF7F2]">
              Contacto
            </p>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://instagram.com/eter.niu"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[13px] text-[#93E29A] hover:text-[#FAF7F2] transition-colors"
                >
                  <InstagramIcon />
                  @eter.niu
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/593979854905"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[13px] text-[#A9ADA6] hover:text-[#FAF7F2] transition-colors"
                >
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>

          {/* Column 5: Newsletter Signup */}
          <NewsletterSignup />
        </div>

        {/* Bottom notice (both mobile & desktop) */}
        <p className="mt-8 text-[11px] text-[#A9ADA6]">
          Envío gratis a todo Ecuador por Servientrega · Pagas al recibir
        </p>
      </div>
    </footer>
  )
}
