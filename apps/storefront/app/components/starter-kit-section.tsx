import { MessageCircle } from "lucide-react"

const sellerNumber =
  process.env.NEXT_PUBLIC_WHATSAPP_SELLER_NUMBER || "593979854905"

const starterKits = [
  {
    name: "Kit Inicio Vendedor",
    price: 270.24,
    pieces: 7,
    detail:
      "Sartenes francesas 20, 24 y 28 cm; lechera 18 cm; olla francesa 20 cm; sartenes europeas 20 y 24 cm.",
  },
  {
    name: "Kit Familia Vendedor",
    price: 307.16,
    pieces: 6,
    detail:
      "Sartenes francesas 20, 24 y 28 cm; ollas francesas 20 y 24 cm; wok francés 32 cm.",
  },
]

function kitLink(name: string) {
  const text = `Hola, quiero el ${name}. ¿Me confirmas disponibilidad, precio de vendedor y condiciones de entrega?`
  return `https://wa.me/${sellerNumber.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`
}

export function StarterKitSection() {
  return (
    <section className="border-y border-white/10 bg-[#162014] px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#d3fa99]">
          Para vendedores
        </p>
        <h2
          className="mt-2 max-w-2xl text-[clamp(28px,5vw,42px)] font-medium leading-tight text-white"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Empieza con un set listo para vender.
        </h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[#b8c2ae]">
          Dos selecciones armadas con precio de vendedor. Confirma stock y
          condiciones antes de cerrar el pedido.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {starterKits.map((kit) => (
            <article
              key={kit.name}
              className="rounded-2xl border border-emerald-300/25 bg-[#10160e] p-6"
            >
              <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-200">
                {kit.pieces} piezas
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-white">
                {kit.name}
              </h3>
              <p className="mt-3 min-h-20 text-sm leading-relaxed text-[#b8c2ae]">
                {kit.detail}
              </p>
              <p className="mt-6 text-3xl font-semibold text-emerald-200">
                ${kit.price.toFixed(2)}
              </p>
              <p className="mt-1 text-xs text-[#b8c2ae]">
                Precio de inicio para vendedor
              </p>
              <a
                href={kitLink(kit.name)}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white"
              >
                <MessageCircle size={17} />
                Pedir este kit
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
