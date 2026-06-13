import { NewsletterSignup } from "./newsletter-signup"

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

export function SiteFooter() {
  return (
    <footer className="border-t border-[#E8E2D8] bg-[#FAF7F2] px-4 py-12">
      <div className="mx-auto max-w-5xl">
        {/* Mobile layout (single column) */}
        <div className="lg:hidden">
          <div className="mb-6">
            <p
              className="text-[20px] font-medium text-[#1A1A18]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Eter Niu
            </p>
            <p className="mt-1 text-[13px] text-[#6B6B66]">
              Bienestar &amp; Cocina Consciente
            </p>
            <p className="text-[12px] text-[#6B6B66]">
              Elevan tu alma y tu hogar · Quito, Ecuador
            </p>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-[#6B6B66]">
            <a href="/guias" className="hover:text-[#1A1A18] transition-colors">
              Guías
            </a>
            <a
              href="https://instagram.com/eter.niu"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#1A1A18] transition-colors"
            >
              @eter.niu
            </a>
          </div>

          <p className="mt-8 text-[11px] text-[#6B6B66]">
            Envío gratis a todo Ecuador por Servientrega · Pagas al recibir
          </p>
        </div>

        {/* Desktop layout (4 columns + newsletter) */}
        <div className="hidden lg:grid lg:grid-cols-5 lg:gap-8">
          {/* Column 1: Brand */}
          <div className="mb-6">
            <p
              className="text-[20px] font-medium text-[#1A1A18]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Eter Niu
            </p>
            <p className="mt-2 text-[13px] text-[#6B6B66]">
              Bienestar &amp; Cocina Consciente
            </p>
            <p className="mt-1 text-[12px] text-[#6B6B66]">
              Elevan tu alma y tu hogar
            </p>
            <p className="text-[12px] text-[#6B6B66]">Quito, Ecuador</p>
          </div>

          {/* Column 2: Productos */}
          <div>
            <p className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-[#1A1A18]">
              Productos
            </p>
            <ul className="space-y-2">
              <li>
                <a
                  href="/"
                  className="text-[13px] text-[#6B6B66] hover:text-[#1A1A18] transition-colors"
                >
                  Cocina
                </a>
              </li>
              <li>
                <a
                  href="/bienestar"
                  className="text-[13px] text-[#6B6B66] hover:text-[#1A1A18] transition-colors"
                >
                  Bienestar
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Recursos */}
          <div>
            <p className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-[#1A1A18]">
              Recursos
            </p>
            <ul className="space-y-2">
              <li>
                <a
                  href="/guias"
                  className="text-[13px] text-[#6B6B66] hover:text-[#1A1A18] transition-colors"
                >
                  Guías
                </a>
              </li>
              <li>
                <a
                  href="/guias/teflon-pfas"
                  className="text-[13px] text-[#6B6B66] hover:text-[#1A1A18] transition-colors"
                >
                  Guía PFAS
                </a>
              </li>
              <li>
                <a
                  href="/marca"
                  className="text-[13px] text-[#6B6B66] hover:text-[#1A1A18] transition-colors"
                >
                  Marca
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Contacto & Social */}
          <div>
            <p className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-[#1A1A18]">
              Contacto
            </p>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://instagram.com/eter.niu"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[13px] text-[#6B6B66] hover:text-[#1A1A18] transition-colors"
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
                  className="text-[13px] text-[#6B6B66] hover:text-[#1A1A18] transition-colors"
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
        <p className="mt-8 text-[11px] text-[#6B6B66]">
          Envío gratis a todo Ecuador por Servientrega · Pagas al recibir
        </p>
      </div>
    </footer>
  )
}
