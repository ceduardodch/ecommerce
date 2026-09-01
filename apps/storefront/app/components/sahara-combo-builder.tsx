"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  august2026FallbackProducts,
  mgcSaharaPanProducts,
  type Product,
} from "../../lib/catalog";
import { useCart } from "../../contexts/CartContext";

type ComboOption = {
  id: "onyx" | "ebano" | "azul" | "sahara-negro" | "sahara-gris";
  title: string;
  subtitle: string;
  image: string;
  video?: string;
  skus: string[];
};

const onyxSkus = august2026FallbackProducts
  .filter(
    (product) =>
      product.sku.startsWith("MGC-FR-") && !product.sku.endsWith("-RO"),
  )
  .map((product) => product.sku);

const azulSkus = august2026FallbackProducts
  .filter((product) => product.sku.startsWith("MGC-EU-"))
  .map((product) => product.sku);

const comboOptions: ComboOption[] = [
  {
    id: "onyx",
    title: "Onyx Imperial",
    subtitle: "Set sugerido de 7 piezas, incluido el wok de 32 cm.",
    image: "/media/mgc-imperial/onyx-imperial-conjunto-actual-real.jpeg",
    video: "/media/mgc-imperial/onyx-imperial-conjunto-actual-real.mp4",
    skus: onyxSkus,
  },
  {
    id: "ebano",
    title: "Ébano & Plata",
    subtitle: "Set sugerido de 6 piezas para cocina diaria.",
    image: "/media/mgc-ebano-plata/ebano-plata-conjunto-frontal.jpg",
    skus: onyxSkus.filter((sku) => sku !== "MGC-FR-WOK-32-GN"),
  },
  {
    id: "azul",
    title: "Azul Oceánico",
    subtitle: "Set sugerido de 6 piezas en azul granito.",
    image: "/media/mgc-azul-oceanico/azul-oceanico-conjunto-real.jpeg",
    skus: azulSkus,
  },
  {
    id: "sahara-negro",
    title: "Sahara negro",
    subtitle: "Set sugerido de 3 sartenes con tapa.",
    image: "/media/mgc-sahara/sahara-negro-set-real.jpeg",
    skus: mgcSaharaPanProducts
      .filter((product) => product.color === "Negro")
      .map((product) => product.sku),
  },
  {
    id: "sahara-gris",
    title: "Sahara gris",
    subtitle: "Set sugerido de 3 sartenes con tapa.",
    image: "/media/mgc-sahara/sahara-gris-set-real.jpeg",
    skus: mgcSaharaPanProducts
      .filter((product) => product.color === "Gris")
      .map((product) => product.sku),
  },
];

const allProducts = [...august2026FallbackProducts, ...mgcSaharaPanProducts];

function pieceName(product: Product) {
  if (product.sku === "MGC-FR-WOK-32-GN") return "Wok 32 cm";
  if (product.title.toLowerCase().includes("lechera"))
    return "Olla lechera 18 cm";
  if (product.category.includes("Ollas"))
    return `Olla ${product.diameterCm} cm`;
  return `Sartén ${product.diameterCm} cm`;
}

function money(value: number) {
  return `$${value.toFixed(2)}`;
}

export function ComboBuilder() {
  const { addItem, openCart } = useCart();
  const [activeId, setActiveId] = useState<ComboOption["id"]>("onyx");
  const activeOption =
    comboOptions.find((option) => option.id === activeId) ?? comboOptions[0];
  const [selectedSkus, setSelectedSkus] = useState<string[]>(activeOption.skus);

  const pieces = useMemo(
    () =>
      activeOption.skus
        .map((sku) => allProducts.find((product) => product.sku === sku))
        .filter((product): product is Product => Boolean(product)),
    [activeOption],
  );

  const selectedPieces = pieces.filter((product) =>
    selectedSkus.includes(product.sku),
  );
  const qualifiesForCombo = selectedPieces.length >= 3;
  const regularTotal = selectedPieces.reduce(
    (sum, product) => sum + product.price.amount,
    0,
  );
  const total = selectedPieces.reduce(
    (sum, product) =>
      sum +
      (qualifiesForCombo
        ? (product.comboPrice?.amount ?? product.price.amount)
        : product.price.amount),
    0,
  );
  const savings = regularTotal - total;

  function selectOption(option: ComboOption) {
    setActiveId(option.id);
    setSelectedSkus(option.skus);
  }

  function togglePiece(sku: string) {
    setSelectedSkus((current) =>
      current.includes(sku)
        ? current.filter((item) => item !== sku)
        : [...current, sku],
    );
  }

  function addSelection() {
    selectedPieces.forEach((product) => {
      addItem({
        id: product.id,
        sku: product.sku,
        title: product.title,
        price: product.price.amount,
        comboPrice: product.comboPrice?.amount,
        comboMinimumItems: 3,
        comboGroup: activeId,
        image: product.imageUrl,
        category: product.category,
      });
    });
    openCart();
  }

  return (
    <section
      id="arma-tu-combo"
      className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"
      aria-labelledby="combo-builder-title"
    >
      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#182116] shadow-2xl shadow-black/20">
        <div className="grid lg:grid-cols-[0.86fr_1.14fr]">
          <div className="relative min-h-[340px] overflow-hidden bg-[#0b1009] p-6 sm:p-8">
            {activeOption.video ? (
              <video
                className="absolute inset-0 h-full w-full object-cover opacity-80"
                src={activeOption.video}
                poster={activeOption.image}
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <Image
                src={activeOption.image}
                alt={`Combo ${activeOption.title} MGC`}
                fill
                className="object-cover opacity-80"
                sizes="(min-width: 1024px) 45vw, 100vw"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b1009] via-[#0b1009]/25 to-transparent" />
            <div className="relative flex h-full flex-col justify-end gap-3">
              <span className="w-fit rounded-full border border-lime-300/30 bg-lime-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-lime-200">
                Precio verde desde 3 piezas
              </span>
              <div>
                <h2
                  id="combo-builder-title"
                  className="text-3xl font-black tracking-tight text-white sm:text-4xl"
                >
                  Arma tu combo
                </h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-white/75">
                  Elige una propuesta, cambia las piezas que quieras y mira el
                  precio real antes de agregarlo.
                </p>
              </div>
              {activeOption.video ? <p className="text-xs font-semibold text-white/60">Video real del set.</p> : null}
            </div>
          </div>

          <div className="p-5 sm:p-8">
            <div
              className="flex flex-wrap gap-2"
              aria-label="Colecciones para armar tu combo"
            >
              {comboOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => selectOption(option)}
                  className={`rounded-full border px-3 py-2 text-sm font-bold transition ${activeId === option.id ? "border-lime-300 bg-lime-300 text-[#172012]" : "border-white/15 bg-white/[0.03] text-white hover:border-white/35"}`}
                >
                  {option.title}
                </button>
              ))}
            </div>

            <div className="mt-6 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-extrabold text-white">
                  {activeOption.title}
                </h3>
                <p className="mt-1 text-sm leading-6 text-white/65">
                  {activeOption.subtitle}
                </p>
              </div>
              <span className="shrink-0 rounded-lg bg-white/8 px-3 py-2 text-sm font-bold text-white">
                {selectedPieces.length} piezas
              </span>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {pieces.map((product) => {
                const selected = selectedSkus.includes(product.sku);
                return (
                  <label
                    key={product.sku}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${selected ? "border-lime-300/70 bg-lime-300/10" : "border-white/10 bg-black/10 hover:border-white/25"}`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => togglePiece(product.sku)}
                      className="h-4 w-4 accent-lime-300"
                    />
                    <span className="min-w-0 flex-1 text-sm font-bold text-white">
                      {pieceName(product)}
                    </span>
                    <span className="text-right text-xs text-white/60">
                      {money(product.price.amount)}
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-white/55">
                    Tu selección
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {qualifiesForCombo
                      ? "Precio verde aplicado"
                      : `Faltan ${3 - selectedPieces.length} pieza${3 - selectedPieces.length === 1 ? "" : "s"} para mejorar el precio`}
                  </p>
                </div>
                <div className="text-right">
                  {savings > 0 ? (
                    <p className="text-xs font-bold text-lime-200">
                      Ahorras {money(savings)}
                    </p>
                  ) : null}
                  <p className="text-3xl font-black text-white">
                    {money(total)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={addSelection}
                disabled={selectedPieces.length === 0}
                className="mt-4 w-full rounded-xl bg-lime-300 px-4 py-3 text-sm font-black text-[#172012] transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Agregar {selectedPieces.length === 1 ? "pieza" : "selección"} al
                carrito
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
