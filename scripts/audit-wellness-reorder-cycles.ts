/**
 * XS-4: Auditoría de ciclos de recompra de bienestar
 *
 * Este script analiza los productos de bienestar y ajusta sus ciclos de recompra
 * según el tipo de producto:
 * - Consumibles: 30-60 días (velas, inciensos, moxas, cuidado personal)
 * - Duraderos/equipamiento: 180 días (ollas, yoga, decoración, joyería)
 */

// Mapeo de SKU -> nuevo ciclo de recompra (en días)
const WELLNESS_REORDER_ADJUSTMENTS: Record<string, number> = {
  // Velas - consumible rápido (30-45 días)
  "BIEN-VELAS-GRANDES-CAJA-MANDALA": 45, // Velas grandes - duran más
  "BIEN-VELAS-PEQUENAS-CAJA-MANDALA": 30, // Velas pequeñas - consumo más rápido

  // Inciensos - consumible rápido (30 días)
  "BIEN-INCIENSOS-STICK-JUMBO": 30,
  "BIEN-INCIENSO-ORGANICOS-ULLAS": 30,

  // Moxas - consumible tradicional (60 días)
  "BIEN-MOXAS-CHINAS": 60,

  // Cuidado personal - consumo regular (60 días)
  "BIEN-PIEDRA-ALUMBRE": 60,
  "BIEN-LIMPIADOR-LENGUA-COBRE": 60,

  // Cascadas de humo - consumible decorativo (45 días)
  "BIEN-CASCADA-HUMO-OM-GANESHA-TORRE": 45,
}

/**
 * Genera un reporte de auditoría con los ajustes recomendados
 */
function generateAuditReport() {
  const products = Object.keys(WELLNESS_REORDER_ADJUSTMENTS).map((sku) => ({
    sku,
    oldDays: 180,
    newDays: WELLNESS_REORDER_ADJUSTMENTS[sku],
    category: getProductCategory(sku),
  }))

  const byCategory: Record<string, typeof products> = {}
  for (const product of products) {
    if (!byCategory[product.category]) {
      byCategory[product.category] = []
    }
    byCategory[product.category].push(product)
  }

  return {
    total: products.length,
    byCategory,
    summary: {
      consumibles_30días: products.filter((p) => p.newDays === 30).length,
      consumibles_45días: products.filter((p) => p.newDays === 45).length,
      consumibles_60días: products.filter((p) => p.newDays === 60).length,
    },
  }
}

/**
 * Determina la categoría de producto basado en el SKU
 */
function getProductCategory(sku: string): string {
  if (sku.includes("VELAS")) return "Velas"
  if (sku.includes("INCIEN")) return "Inciensos"
  if (sku.includes("MOXAS")) return "Moxas"
  if (sku.includes("ALUMBRE") || sku.includes("LENGUA")) return "Cuidado Personal"
  if (sku.includes("CASCADA")) return "Decoración consumible"
  return "Otros"
}

/**
 * Imprime el reporte de auditoría en consola
 */
function printAuditReport() {
  const report = generateAuditReport()

  console.log("\n=== Auditoría de Ciclos de Recompra - Bienestar ===\n")
  console.log(`Total de productos a ajustar: ${report.total}\n`)

  console.log("Por categoría:")
  for (const [category, products] of Object.entries(report.byCategory)) {
    console.log(`\n${category}:`)
    for (const product of products) {
      console.log(
        `  - ${product.sku}: ${product.oldDays} → ${product.newDays} días`
      )
    }
  }

  console.log("\nResumen:")
  console.log(`  - Consumibles 30 días: ${report.summary.consumibles_30días}`)
  console.log(`  - Consumibles 45 días: ${report.summary.consumibles_45días}`)
  console.log(`  - Consumibles 60 días: ${report.summary.consumibles_60días}`)
  console.log(`  - Total: ${report.total}\n`)

  console.log("Productos que mantienen 180 días (duraderos):")
  console.log("  - Termos, teteras, jarras de vidrio/cerámica")
  console.log("  - Yoga mats, meditadores, bolsters, bloques, straps")
  console.log("  - Cuencos, tambores, saumadores, portainciensos de bronce/metal")
  console.log("  - Joyería (plata 925, acero inoxidable)")
  console.log("  - Lámparas, figuras decorativas, equipos de masaje")
  console.log("  - Juegos de té, accesorios de yoga\n")
}

// Ejecutar auditoría si se ejecuta directamente
if (require.main === module) {
  printAuditReport()
}

export { WELLNESS_REORDER_ADJUSTMENTS, generateAuditReport }
