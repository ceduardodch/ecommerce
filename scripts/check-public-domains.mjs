#!/usr/bin/env node

import { readdirSync, readFileSync, statSync } from "node:fs"
import { extname, relative, resolve } from "node:path"

const root = resolve(import.meta.dirname, "..")
const scanRoots = ["apps", "services", "scripts"]
const extraFiles = [".env.example", "apps/backend/.env.template", "docker-compose.yml"]
const ignoredDirectories = new Set([
  ".git",
  ".medusa",
  ".next",
  "coverage",
  "dist",
  "node_modules",
])
const ignoredFiles = new Set([
  "apps/backend/src/modules/b2b-crm/followup-dispatch.ts",
  "apps/storefront/lib/catalog.ts",
  "apps/storefront/middleware.ts",
  "services/ecommerce-tools/src/public-domains.ts",
])
const sourceExtensions = new Set([
  ".cjs",
  ".js",
  ".json",
  ".mjs",
  ".ts",
  ".tsx",
  ".yml",
  ".yaml",
])
const forbiddenPublicUrl =
  /https?:\/\/(?:www\.)?(?:shop|cocina|bienestar|adminshop|vicky)\.b2b\.com\.ec/gi

function filesUnder(path) {
  if (statSync(path).isFile()) return [path]

  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    if (ignoredDirectories.has(entry.name)) return []
    return filesUnder(resolve(path, entry.name))
  })
}

const candidates = [
  ...scanRoots.flatMap((path) => filesUnder(resolve(root, path))),
  ...extraFiles.map((path) => resolve(root, path)),
]

const failures = []
for (const file of candidates) {
  const repoPath = relative(root, file)
  if (ignoredFiles.has(repoPath)) continue
  if (repoPath.includes("/__tests__/") || repoPath.includes("/tests/")) continue
  if (!extraFiles.includes(repoPath) && !sourceExtensions.has(extname(file))) continue

  const lines = readFileSync(file, "utf8").split("\n")
  lines.forEach((line, index) => {
    const matches = [...line.matchAll(forbiddenPublicUrl)]
    for (const match of matches) {
      failures.push(`${repoPath}:${index + 1}: ${match[0]}`)
    }
  })
}

if (failures.length) {
  console.error("Se encontraron dominios públicos fuera de eter-niu.com:")
  failures.forEach((failure) => console.error(`- ${failure}`))
  process.exit(1)
}

console.log("Dominios públicos: OK (eter-niu.com)")
