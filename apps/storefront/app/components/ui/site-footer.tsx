export function SiteFooter() {
  return (
    <footer className="border-t border-[#E8E2D8] bg-[#FAF7F2] px-4 py-12">
      <div className="mx-auto max-w-5xl">
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
    </footer>
  )
}
