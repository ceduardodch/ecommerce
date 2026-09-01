import { vi } from "vitest"

// `react`@18.3.1 (el paquete real de npm) no exporta `cache`: eso solo existe
// en el build de React que Next.js vendoriza para el App Router. `lib/catalog`
// lo usa a nivel de módulo, así que sin este mock ningún test que importe ese
// archivo puede cargar fuera de Next.
vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>()
  return {
    ...actual,
    cache: <T>(fn: T) => fn,
  }
})
