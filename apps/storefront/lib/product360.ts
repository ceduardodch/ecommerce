// Secuencias 360° por producto (turntable). Cada entrada es la lista ordenada
// de frames alrededor del eje. Mientras no haya fotos reales, el wok apunta a
// un set de PRUEBA generado (public/media/360/demo). Para producción:
//   1. Fotografía el producto girando ~24-36 tomas, mismo encuadre, fondo quitado.
//   2. Colócalas en public/media/360/<carpeta>/frame-01.jpg … frame-NN.jpg
//   3. Reemplaza la lista de abajo por esas rutas (usa buildFrames()).

/** Construye rutas frame-01..frame-NN con extensión dada. */
export function buildFrames(
  dir: string,
  count: number,
  ext = "jpg",
): string[] {
  return Array.from(
    { length: count },
    (_, i) => `/media/360/${dir}/frame-${String(i + 1).padStart(2, "0")}.${ext}`,
  )
}

// SKU (mayúsculas) → frames. Añade productos aquí a medida que tengas sus tomas.
const SEQUENCES: Record<string, string[]> = {
  // DEMO temporal: reemplazar por fotos reales del wok.
  "MGC-WOK-GRANITO-32": buildFrames("demo", 24, "svg"),
}

export function get360Frames(sku?: string | null): string[] | null {
  if (!sku) return null
  return SEQUENCES[sku.toUpperCase()] ?? null
}
