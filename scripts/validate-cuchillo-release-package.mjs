#!/usr/bin/env node

import { execFileSync } from "node:child_process"
import { existsSync, readFileSync, statSync } from "node:fs"

const maxVideoBytes = 5 * 1024 * 1024
const pathspecFile = "docs/CUCHILLO_CAMPAIGN_RELEASE_PATHSPEC.txt"
const strictScope = ["1", "true", "yes"].includes(
  String(process.env.STRICT_RELEASE_SCOPE || "").toLowerCase(),
)

const requiredFiles = [
  "apps/storefront/app/campanas/[slug]/page.tsx",
  "apps/storefront/app/campanas/[slug]/components/campaign-interactions.tsx",
  "apps/storefront/app/components/analytics.tsx",
  "apps/storefront/app/globals.css",
  "apps/storefront/lib/catalog.ts",
  "apps/storefront/lib/commercial.ts",
  "apps/storefront/lib/content.ts",
  "apps/storefront/lib/whatsapp.ts",
  "data/catalog/eter-niu-products.csv",
  "apps/backend/src/migration-scripts/kitchen-catalog-seed.ts",
  "services/ecommerce-tools/src/demo-catalog.ts",
  "scripts/sync-whatsapp-catalog.mjs",
  "services/ecommerce-tools/src/contracts.ts",
  "services/ecommerce-tools/src/service.ts",
  "services/ecommerce-tools/src/types.ts",
  "services/ecommerce-tools/tests/quote.test.ts",
  "package.json",
  "scripts/validate-meta-whatsapp-flow.mjs",
  "scripts/validate-cuchillo-release-package.mjs",
  "scripts/campaign-readiness-report.mjs",
  "docs/META_WHATSAPP_LAUNCH_CHECKLIST.md",
  "docs/CUCHILLO_CAMPAIGN_RELEASE_FILES.md",
  pathspecFile,
]

const requiredAssets = [
  "apps/storefront/public/media/video-cuchillo-samurai-hero.mp4",
  "apps/storefront/public/media/video-cuchillo-samurai-corte.mp4",
  "apps/storefront/public/media/photo-cuchillo-samurai-hero.jpg",
  "apps/storefront/public/media/photo-cuchillo-samurai-full.jpg",
  "apps/storefront/public/media/photo-cuchillo-samurai-vertical.jpg",
  "apps/storefront/public/media/photo-cuchillo-samurai-textura.jpg",
  "apps/storefront/public/media/photo-cuchillo-samurai-mango.jpg",
  "apps/storefront/public/media/photo-product-cuchillo-samurai.jpg",
]

const ownerDecisionPaths = [
  "apps/backend/src/migration-scripts/wellness-catalog-seed.ts",
  "data/catalog/eter-niu-wellness-products.csv",
]

const failures = []
const warnings = []
const checks = []

function record(name, passed, detail, hard = true) {
  checks.push({ name, passed, detail })
  if (!passed) {
    if (hard) failures.push(`${name}: ${detail}`)
    else warnings.push(`${name}: ${detail}`)
  }
}

function gitStatusPaths() {
  const output = execFileSync("git", ["status", "--porcelain=v1"], {
    encoding: "utf8",
  })
  return output
    .split("\n")
    .filter(Boolean)
    .map((line) => line.slice(3))
}

function pathspecPaths() {
  return readFileSync(pathspecFile, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => line.replace(/^:\(literal\)/, ""))
}

function humanSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

for (const file of [...requiredFiles, ...requiredAssets]) {
  record(`exists ${file}`, existsSync(file), "missing required release file")
}

for (const asset of requiredAssets.filter((file) => file.endsWith(".mp4"))) {
  if (!existsSync(asset)) continue
  const size = statSync(asset).size
  record(
    `video size ${asset}`,
    size <= maxVideoBytes,
    `${humanSize(size)} <= ${humanSize(maxVideoBytes)}`,
  )
}

const dirtyPaths = gitStatusPaths()
const dirtyRequired = [...requiredFiles, ...requiredAssets].filter((file) =>
  dirtyPaths.includes(file),
)
record(
  "required files present in working-tree release set",
  dirtyRequired.length > 0,
  `${dirtyRequired.length} required files changed or untracked`,
)

const dirtyOwnerDecision = dirtyPaths.filter(
  (file) =>
    ownerDecisionPaths.includes(file) ||
    file.startsWith("apps/storefront/public/media/wellness-"),
)

record(
  "owner-decision wellness changes separated",
  dirtyOwnerDecision.length === 0,
  dirtyOwnerDecision.length
    ? dirtyOwnerDecision.join(", ")
    : "no wellness-only changes detected",
  strictScope,
)

if (existsSync(pathspecFile)) {
  const stagedByPathspec = pathspecPaths()
  const missingFromPathspec = [...requiredFiles, ...requiredAssets].filter(
    (file) => !stagedByPathspec.includes(file) && dirtyPaths.includes(file),
  )
  const wellnessInPathspec = stagedByPathspec.filter((file) =>
    file.startsWith("apps/storefront/public/media/wellness-"),
  )

  record(
    "pathspec covers dirty required files",
    missingFromPathspec.length === 0,
    missingFromPathspec.length
      ? missingFromPathspec.join(", ")
      : `${stagedByPathspec.length} files listed`,
  )
  record(
    "pathspec excludes wellness assets",
    wellnessInPathspec.length === 0,
    wellnessInPathspec.length
      ? wellnessInPathspec.join(", ")
      : "no wellness assets in pathspec dry-run",
  )
}

const summary = {
  strictScope,
  checks,
  warnings,
  failures,
}

console.log(JSON.stringify(summary, null, 2))

if (failures.length) {
  process.exitCode = 1
}
