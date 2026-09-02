import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  august2026FallbackProducts,
  mgcCollectionComboDeals,
  mgcSaharaPanProducts,
} from "../lib/catalog";
import { productMedia } from "../lib/product-media";

function publicAssetExists(src: string) {
  if (!src.startsWith("/media/")) return true;
  return existsSync(join(process.cwd(), "public", src.slice(1)));
}

const catalogProducts = [
  ...august2026FallbackProducts,
  ...mgcCollectionComboDeals,
  ...mgcSaharaPanProducts,
];

describe("medios del catálogo MGC", () => {
  it("mantiene disponibles todas las portadas del catálogo", () => {
    for (const product of catalogProducts) {
      expect(
        publicAssetExists(product.imageUrl),
        `${product.sku}: ${product.imageUrl}`,
      ).toBe(true);
    }
  });

  it("mantiene disponibles las galerías, videos y posters", () => {
    for (const product of catalogProducts) {
      for (const media of productMedia(product)) {
        expect(
          publicAssetExists(media.src),
          `${product.sku}: ${media.src}`,
        ).toBe(true);
        if (media.poster) {
          expect(
            publicAssetExists(media.poster),
            `${product.sku}: ${media.poster}`,
          ).toBe(true);
        }
      }
    }
  });

  it("conserva el video real con audio como prueba del Juego Negro", () => {
    const product = august2026FallbackProducts.find(
      (candidate) => candidate.sku === "MGC-FR-SARTEN-24-GN",
    );

    expect(product).toBeDefined();
    expect(
      productMedia(product!).some((media) =>
        media.src.endsWith("onyx-imperial-conjunto-actual-real.mp4"),
      ),
    ).toBe(true);
  });
});
