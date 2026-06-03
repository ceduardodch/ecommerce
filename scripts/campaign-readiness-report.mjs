#!/usr/bin/env node

import { execFileSync } from "node:child_process"

const config = {
  storeUrl: process.env.STORE_URL || "https://cocina.b2b.com.ec",
  toolsUrl: process.env.TOOLS_URL,
  toolsToken: process.env.TOOLS_API_TOKEN,
  requireTools: ["1", "true", "yes"].includes(
    String(process.env.REQUIRE_TOOLS || "").toLowerCase(),
  ),
  requireMetaCapi: ["1", "true", "yes"].includes(
    String(process.env.REQUIRE_META_CAPI || "").toLowerCase(),
  ),
  strictReleaseScope: ["1", "true", "yes"].includes(
    String(process.env.STRICT_RELEASE_SCOPE || "").toLowerCase(),
  ),
}

function run(command, args, env = {}) {
  try {
    const stdout = execFileSync(command, args, {
      encoding: "utf8",
      env: { ...process.env, ...env },
      stdio: ["ignore", "pipe", "pipe"],
    })
    return { ok: true, stdout, json: parseJson(stdout) }
  } catch (error) {
    const stdout = String(error.stdout || "")
    const stderr = String(error.stderr || "")
    return {
      ok: false,
      exitCode: error.status,
      stdout,
      stderr,
      json: parseJson(stdout),
    }
  }
}

function parseJson(stdout) {
  const text = stdout.trim()
  if (!text) return undefined
  try {
    return JSON.parse(text)
  } catch {
    return undefined
  }
}

function gitValue(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim()
}

function gitState() {
  const status = gitValue(["status", "--porcelain=v1"])
  return {
    branch: gitValue(["branch", "--show-current"]),
    head: gitValue(["rev-parse", "HEAD"]),
    originRelease: gitValue(["rev-parse", "origin/release"]),
    originMain: gitValue(["rev-parse", "origin/main"]),
    dirtyFileCount: status ? status.split("\n").length : 0,
  }
}

const releasePackage = run(
  process.execPath,
  ["scripts/validate-cuchillo-release-package.mjs"],
  {
    STRICT_RELEASE_SCOPE: config.strictReleaseScope ? "true" : "false",
  },
)

const publicFlow = run(
  process.execPath,
  ["scripts/validate-meta-whatsapp-flow.mjs"],
  {
    STORE_URL: config.storeUrl,
    TOOLS_URL: config.toolsUrl || "",
    TOOLS_API_TOKEN: config.toolsToken || "",
    REQUIRE_EVENTS: "true",
    REQUIRE_TOOLS: config.requireTools ? "true" : "false",
    REQUIRE_META_CAPI: config.requireMetaCapi ? "true" : "false",
  },
)

const releaseFailures = releasePackage.json?.failures || []
const releaseWarnings = releasePackage.json?.warnings || []
const publicFailures = publicFlow.json?.hardFailures || []
const publicWarnings = publicFlow.json?.warnings || []

const blockingReasons = [
  ...(!releasePackage.ok && releaseFailures.length === 0
    ? [
        `release_package: validator exited ${
          releasePackage.exitCode ?? "non-zero"
        } without structured failures`,
      ]
    : []),
  ...(!publicFlow.ok && publicFailures.length === 0
    ? [
        `public_flow: validator exited ${
          publicFlow.exitCode ?? "non-zero"
        } without structured hardFailures`,
      ]
    : []),
  ...releaseFailures.map((item) => `release_package: ${item}`),
  ...publicFailures.map((item) => `public_flow: ${item}`),
]

const report = {
  readyForAdSpend: blockingReasons.length === 0,
  storeUrl: config.storeUrl,
  toolsUrl: config.toolsUrl,
  toolsTokenConfigured: Boolean(config.toolsToken),
  requireTools: config.requireTools,
  requireMetaCapi: config.requireMetaCapi,
  strictReleaseScope: config.strictReleaseScope,
  git: gitState(),
  releasePackage: {
    ok: releasePackage.ok,
    warnings: releaseWarnings,
    failures: releaseFailures,
  },
  publicFlow: {
    ok: publicFlow.ok,
    warnings: publicWarnings,
    hardFailures: publicFailures,
  },
  blockingReasons,
  nextAction:
    blockingReasons.length === 0
      ? "Launch can proceed after a final human mobile/WhatsApp check."
      : "Do not launch ads yet. Fix blockingReasons, deploy, then rerun this report.",
}

console.log(JSON.stringify(report, null, 2))

if (!report.readyForAdSpend) {
  process.exitCode = 1
}
