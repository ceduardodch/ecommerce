import { execFileSync } from "node:child_process"
import { createHash } from "node:crypto"
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs"
import path from "node:path"

const repoRoot = path.resolve(import.meta.dirname, "..")
const libraryRoot = path.join(repoRoot, "data", "biblioteca")
const outputDir = path.join(libraryRoot, "_metadata")

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"])
const VIDEO_EXTENSIONS = new Set([".mp4", ".mov", ".m4v"])
const RAW_EXTENSIONS = new Set([".dng", ".raw", ".cr2", ".nef"])

function walk(dir) {
  const entries = readdirSync(dir, { withFileTypes: true })
  return entries.flatMap((entry) => {
    if (entry.name.startsWith("._") || entry.name === ".DS_Store") return []
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) return walk(fullPath)
    return entry.isFile() ? [fullPath] : []
  })
}

function safeExec(command, args) {
  try {
    return execFileSync(command, args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim()
  } catch {
    return ""
  }
}

function imageMetadata(filePath) {
  const output = safeExec("sips", ["-g", "pixelWidth", "-g", "pixelHeight", filePath])
  const width = Number(output.match(/pixelWidth:\s*(\d+)/)?.[1])
  const height = Number(output.match(/pixelHeight:\s*(\d+)/)?.[1])
  return {
    width: Number.isFinite(width) ? width : null,
    height: Number.isFinite(height) ? height : null,
    durationSeconds: null,
  }
}

function videoMetadata(filePath) {
  const output = safeExec("ffprobe", [
    "-v",
    "error",
    "-select_streams",
    "v:0",
    "-show_entries",
    "stream=width,height,duration",
    "-of",
    "csv=p=0",
    filePath,
  ])
  const [width, height, duration] = output.split(",").map(Number)
  return {
    width: Number.isFinite(width) ? width : null,
    height: Number.isFinite(height) ? height : null,
    durationSeconds: Number.isFinite(duration) ? Number(duration.toFixed(2)) : null,
  }
}

function mediaType(extension) {
  if (IMAGE_EXTENSIONS.has(extension)) return "image"
  if (VIDEO_EXTENSIONS.has(extension)) return "video"
  if (RAW_EXTENSIONS.has(extension)) return "raw"
  return "other"
}

function orientation(width, height) {
  if (!width || !height) return "unknown"
  if (height > width) return "vertical"
  if (width > height) return "horizontal"
  return "square"
}

function aspectRatio(width, height) {
  if (!width || !height) return null
  return Number((width / height).toFixed(4))
}

function canonicalRatio(width, height) {
  if (!width || !height) return "unknown"
  const ratio = width / height
  if (Math.abs(ratio - 9 / 16) < 0.04) return "9:16"
  if (Math.abs(ratio - 4 / 5) < 0.04) return "4:5"
  if (Math.abs(ratio - 1) < 0.04) return "1:1"
  if (Math.abs(ratio - 16 / 9) < 0.06) return "16:9"
  return `${width}:${height}`
}

function inferProductHints(text) {
  const normalized = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
  const hints = []
  for (const [needle, tag] of [
    ["wok", "wok"],
    ["sarten", "sarten"],
    ["olla", "olla"],
    ["granito", "granito"],
    ["utensilio", "utensilios"],
    ["cuchillo", "cuchillos"],
    ["set", "set"],
    ["tapa", "tapa"],
    ["huevo", "prueba_huevo"],
  ]) {
    if (normalized.includes(needle)) hints.push(tag)
  }
  return hints
}

function recommendedUses(asset) {
  const uses = []
  if (asset.type === "video") {
    if (asset.orientation === "vertical") {
      uses.push("meta_reels", "instagram_stories", "whatsapp_status")
      if (asset.durationSeconds && asset.durationSeconds <= 30) uses.push("meta_ads_short")
    }
    if (asset.durationSeconds && asset.durationSeconds > 45) uses.push("long_form_cutdowns")
  }
  if (asset.type === "image") {
    if (asset.orientation === "vertical") uses.push("instagram_stories", "meta_ads_static")
    if (asset.orientation === "horizontal") uses.push("web_hero", "landing_section")
    uses.push("product_gallery", "catalog_creative")
  }
  if (asset.type === "raw") uses.push("source_archive", "edit_before_web")
  return [...new Set(uses)]
}

function processingNeeds(asset) {
  const needs = []
  if (asset.type === "video") {
    if (asset.sizeMb > 30) needs.push("compress_for_meta")
    if (asset.sizeMb > 15) needs.push("create_web_optimized_mp4")
    needs.push("extract_thumbnail")
  }
  if (asset.type === "image") {
    if (asset.sizeMb > 2) needs.push("create_webp")
    if (!asset.productHints.length) needs.push("visual_product_tagging")
  }
  if (asset.type === "raw") needs.push("develop_raw_to_jpg_webp")
  if (!asset.width || !asset.height) needs.push("inspect_manually")
  return [...new Set(needs)]
}

function priority(asset) {
  if (asset.type === "raw") return "archive"
  if (asset.type === "video" && asset.orientation === "vertical" && asset.durationSeconds && asset.durationSeconds <= 35) {
    return "high"
  }
  if (asset.type === "image" && asset.width >= 900 && asset.height >= 900) return "high"
  if (asset.type === "video" || asset.type === "image") return "medium"
  return "low"
}

function csvEscape(value) {
  const text = Array.isArray(value) ? value.join("|") : String(value ?? "")
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

function writeCsv(filePath, rows, columns) {
  const lines = [
    columns.join(","),
    ...rows.map((row) => columns.map((column) => csvEscape(row[column])).join(",")),
  ]
  writeFileSync(filePath, `${lines.join("\n")}\n`)
}

if (!existsSync(libraryRoot)) {
  throw new Error(`No existe la biblioteca: ${libraryRoot}`)
}

mkdirSync(outputDir, { recursive: true })

const assets = walk(libraryRoot)
  .filter((filePath) => !filePath.includes(`${path.sep}_metadata${path.sep}`))
  .map((filePath) => {
    const extension = path.extname(filePath).toLowerCase()
    const type = mediaType(extension)
    const stats = statSync(filePath)
    const relativePath = path.relative(repoRoot, filePath)
    const folder = path.basename(path.dirname(filePath))
    const technical =
      type === "image" ? imageMetadata(filePath) : type === "video" ? videoMetadata(filePath) : {}
    const width = technical.width ?? null
    const height = technical.height ?? null
    const productHints = inferProductHints(`${folder} ${path.basename(filePath)}`)
    const asset = {
      id: createHash("sha1").update(relativePath).digest("hex").slice(0, 12),
      relativePath,
      folder,
      filename: path.basename(filePath),
      extension: extension.replace(".", ""),
      type,
      sizeBytes: stats.size,
      sizeMb: Number((stats.size / 1024 / 1024).toFixed(2)),
      width,
      height,
      durationSeconds: technical.durationSeconds ?? null,
      orientation: orientation(width, height),
      aspectRatio: aspectRatio(width, height),
      canonicalRatio: canonicalRatio(width, height),
      productHints,
      contentPillars: ["cocina", "eter_niu"],
      recommendedUses: [],
      processingNeeds: [],
      priority: "low",
      metaReady: false,
      webReady: false,
      notes: "",
    }
    asset.recommendedUses = recommendedUses(asset)
    asset.processingNeeds = processingNeeds(asset)
    asset.priority = priority(asset)
    asset.metaReady =
      ["image", "video"].includes(asset.type) &&
      asset.orientation === "vertical" &&
      !asset.processingNeeds.includes("inspect_manually")
    asset.webReady =
      asset.type === "image" &&
      Boolean(asset.width && asset.height) &&
      asset.sizeMb <= 2
    return asset
  })
  .sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2, archive: 3 }
    return order[a.priority] - order[b.priority] || a.folder.localeCompare(b.folder) || a.filename.localeCompare(b.filename)
  })

const summary = {
  generatedAt: new Date().toISOString(),
  libraryRoot: path.relative(repoRoot, libraryRoot),
  totalAssets: assets.length,
  totalSizeMb: Number(assets.reduce((sum, asset) => sum + asset.sizeMb, 0).toFixed(2)),
  byType: Object.fromEntries(
    [...new Set(assets.map((asset) => asset.type))].sort().map((type) => [
      type,
      assets.filter((asset) => asset.type === type).length,
    ]),
  ),
  byFolder: Object.fromEntries(
    [...new Set(assets.map((asset) => asset.folder))].sort().map((folder) => [
      folder,
      assets.filter((asset) => asset.folder === folder).length,
    ]),
  ),
  highPriorityAssets: assets.filter((asset) => asset.priority === "high").length,
  metaReadyCandidates: assets.filter((asset) => asset.metaReady).length,
  webReadyCandidates: assets.filter((asset) => asset.webReady).length,
}

const columns = [
  "id",
  "relativePath",
  "folder",
  "filename",
  "type",
  "extension",
  "sizeMb",
  "width",
  "height",
  "durationSeconds",
  "orientation",
  "canonicalRatio",
  "priority",
  "metaReady",
  "webReady",
  "productHints",
  "contentPillars",
  "recommendedUses",
  "processingNeeds",
  "notes",
]

writeFileSync(path.join(outputDir, "assets.json"), JSON.stringify(assets, null, 2))
writeFileSync(path.join(outputDir, "summary.json"), JSON.stringify(summary, null, 2))
writeCsv(path.join(outputDir, "assets.csv"), assets, columns)
writeCsv(
  path.join(outputDir, "review_queue.csv"),
  assets.filter((asset) => asset.priority === "high" || asset.processingNeeds.includes("visual_product_tagging")),
  columns,
)

console.log(JSON.stringify(summary, null, 2))
