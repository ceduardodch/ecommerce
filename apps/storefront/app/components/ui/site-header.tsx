import { Isotipo } from "./isotipo"
import { CartBagButton } from "./cart-bag-button"

type SiteHeaderProps = {
  vertical?: "cocina" | "bienestar"
  /** Show back arrow instead of logo (used in product/campaign mini-header) */
  compact?: boolean
  /** Short name shown centered in compact mode */
  compactTitle?: string
  backHref?: string
  /** "dark" = header sobre canvas night (landing cocina). Default light. */
  surface?: "light" | "dark"
}

function ShareIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  )
}

export function SiteHeader({
  vertical,
  compact = false,
  compactTitle,
  backHref = "/",
  surface = "light",
}: SiteHeaderProps) {
  const dark = surface === "dark"
  if (compact) {
    return (
      <header
        className={`sticky top-0 z-40 flex items-center justify-between px-4 py-3 ${
          dark
            ? "border-b border-white/10 bg-[#10160e]/90 backdrop-blur"
            : "border-b border-[#E8E2D8] bg-white"
        }`}
      >
        <a
          href={backHref}
          className={`flex h-9 w-9 items-center justify-center rounded-full ${
            dark ? "text-[#fcfcf7]" : "text-[#1A1A18]"
          }`}
          aria-label="Volver"
        >
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
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </a>
        {compactTitle && (
          <span
            className={`text-[11px] font-semibold uppercase tracking-widest ${
              dark ? "text-[#fcfcf7]" : "text-[#1A1A18]"
            }`}
          >
            {compactTitle}
          </span>
        )}
        <div className="flex items-center gap-1">
          <button
            type="button"
            className={`flex h-9 w-9 items-center justify-center rounded-full ${
              dark ? "text-[#fcfcf7]" : "text-[#1A1A18]"
            }`}
            aria-label="Compartir"
          >
            <ShareIcon />
          </button>
          <CartBagButton surface={surface} />
        </div>
      </header>
    )
  }

  const navLinkClass = dark
    ? "text-[13px] font-medium text-[#fcfcf7] no-underline hover:text-[#d3fa99] transition-colors"
    : "text-[13px] font-medium text-[#1A1A18] no-underline hover:text-[var(--accent)] transition-colors"

  return (
    <header
      className={`sticky top-0 z-40 flex items-center justify-between px-4 py-3 ${
        dark
          ? "border-b border-white/10 bg-[#10160e]/90 backdrop-blur"
          : "border-b border-[#E8E2D8] bg-white"
      }`}
    >
      {/* Logo: isotipo + wordmark */}
      <a href="/" className="flex items-center gap-2 no-underline" aria-label="Eter Niu inicio">
        <Isotipo size={28} color={dark ? "#fcfcf7" : "#1A1A18"} />
        <span className="leading-none" style={{ fontFamily: "var(--font-display)" }}>
          <span className={`text-[18px] font-medium ${dark ? "text-[#fcfcf7]" : "text-[#1A1A18]"}`}>
            Eter Niu
          </span>
          {vertical && (
            <span
              className={`ml-1.5 text-[13px] font-medium ${
                dark ? "text-[#d3fa99]" : "text-[var(--accent)]"
              }`}
            >
              {vertical === "cocina" ? "Cocina" : "Bienestar"}
            </span>
          )}
        </span>
      </a>

      {/* Desktop nav links (RSP-4) */}
      <nav className="hidden lg:flex items-center gap-6">
        <a href="#productos" className={navLinkClass}>
          Productos
        </a>
        <a href="/guias" className={navLinkClass}>
          Guías
        </a>
        <a href="/marca" className={navLinkClass}>
          Marca
        </a>
      </nav>

      {/* Right actions */}
      <div className="flex items-center gap-1">
        <CartBagButton surface={surface} />
      </div>
    </header>
  )
}
