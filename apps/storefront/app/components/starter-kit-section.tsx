import { MessageCircle } from "lucide-react";
import { mgcCollectionComboDeals } from "../../lib/catalog";
import { AddToCartButton } from "./ui/add-to-cart-button";

const sellerNumber =
  process.env.NEXT_PUBLIC_WHATSAPP_SELLER_NUMBER || "593979854905";

const otherCombos = [
  {
    name: "Ébano & Plata",
    pieces: 12,
    originalPrice: 369,
    price: 296.97,
    savings: 72.03,
    detail: "Sartenes 20, 24 y 28 cm; ollas 18, 20 y 24 cm.",
  },
  {
    name: "Sahara",
    pieces: 6,
    originalPrice: 180,
    price: 149.97,
    savings: 30.03,
    detail: "Sartenes 20, 24 y 28 cm.",
  },
  {
    name: "Azul Oceánico",
    pieces: 12,
    originalPrice: 369,
    price: 325,
    savings: 44,
    detail: "Sartenes 20, 24 y 28 cm; ollas 16, 20 y 24 cm.",
  },
];

function comboLink(name: string) {
  const text = `Hola, quiero reservar el combo ${name}. ¿Me confirmas disponibilidad y entrega?`;
  return `https://wa.me/${sellerNumber.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}

export function StarterKitSection() {
  const onyx = mgcCollectionComboDeals[0];

  return (
    <section
      id="combos"
      className="border-y border-white/10 bg-[#162014] px-4 py-16"
    >
      <div className="mx-auto max-w-6xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#d3fa99]">
          Colección exótica MGC
        </p>
        <h2
          className="mt-2 max-w-2xl text-[clamp(28px,5vw,42px)] font-medium leading-tight text-white"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Combos listos para cocinar.
        </h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[#b8c2ae]">
          Precios especiales por tiempo limitado. El Combo Onyx Imperial usa las
          fotos y el video reales recibidos.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <article className="rounded-2xl border border-emerald-300/35 bg-[#10160e] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-200">
                  {onyx.pieces} piezas · evidencia real
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-white">
                  Onyx Imperial
                </h3>
              </div>
              <span className="rounded-full bg-emerald-300/15 px-3 py-1 text-xs font-semibold text-emerald-200">
                Ahorra $82.03
              </span>
            </div>
            <p className="mt-3 min-h-14 text-sm leading-relaxed text-[#b8c2ae]">
              Sartenes 20, 24 y 28 cm; ollas 18, 20 y 24 cm; wok 32 cm.
            </p>
            <div className="mt-6 flex items-baseline gap-3">
              <s className="text-sm text-[#b8c2ae]">$508.99</s>
              <p className="text-3xl font-semibold text-emerald-200">$426.96</p>
            </div>
            <AddToCartButton
              product={onyx}
              label="Agregar combo al carrito"
              className="mt-5 inline-flex items-center rounded-full bg-[#d3fa99] px-5 py-3 text-sm font-semibold text-[#10160e] hover:opacity-90"
            />
          </article>
          {otherCombos.map((combo) => (
            <article
              key={combo.name}
              className="rounded-2xl border border-white/12 bg-[#10160e] p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-200">
                    {combo.pieces} piezas
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">
                    {combo.name}
                  </h3>
                </div>
                <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-semibold text-emerald-200">
                  Ahorra ${combo.savings.toFixed(2)}
                </span>
              </div>
              <p className="mt-3 min-h-14 text-sm leading-relaxed text-[#b8c2ae]">
                {combo.detail}
              </p>
              <div className="mt-6 flex items-baseline gap-3">
                <s className="text-sm text-[#b8c2ae]">
                  ${combo.originalPrice.toFixed(2)}
                </s>
                <p className="text-3xl font-semibold text-emerald-200">
                  ${combo.price.toFixed(2)}
                </p>
              </div>
              <a
                href={comboLink(combo.name)}
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/35 px-5 py-3 text-sm font-semibold text-white hover:border-white"
              >
                <MessageCircle size={17} />
                Reservar este combo
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
