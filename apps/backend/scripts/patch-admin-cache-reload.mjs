import { readFile, writeFile } from "node:fs/promises"
import { resolve } from "node:path"

const marker = "eterNiuAdminChunkReloadInstalled"
const patchStart = "<!-- eter-niu-admin-chunk-reload:start -->"
const patchEnd = "<!-- eter-niu-admin-chunk-reload:end -->"
const adminIndexPath = resolve(
  process.cwd(),
  ".medusa/server/public/admin/index.html"
)

const existingPatchPattern = new RegExp(
  `${patchStart.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*` +
    `<script>\\s*\\(\\(\\) => \\{\\s*if \\(window\\.__${marker}\\)[\\s\\S]*?\\}\\)\\(\\);\\s*</script>` +
    `\\s*${patchEnd.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}` +
    `|<script>\\s*\\(\\(\\) => \\{\\s*if \\(window\\.__${marker}\\)[\\s\\S]*?\\}\\)\\(\\);\\s*</script>`
)

const reloadScript = `${patchStart}
<script>
(() => {
  if (window.__${marker}) {
    return;
  }

  window.__${marker} = true;

  const storageKey = "eter_niu_admin_chunk_reload_at";
  const staleChunkPatterns = [
    "failed to fetch dynamically imported module",
    "importing a module script failed",
    "error loading dynamically imported module",
    "dynamically imported module",
  ];

  const isStaleChunkError = (message) => {
    const normalized = String(message || "").toLowerCase();
    return staleChunkPatterns.some((pattern) => normalized.includes(pattern));
  };

  const getMessage = (event) => {
    const reason = event?.reason;
    const error = event?.error;

    return [
      event?.message,
      reason?.message,
      reason,
      error?.message,
      error,
    ]
      .filter(Boolean)
      .map((value) => String(value))
      .join(" ");
  };

  const reloadOnce = (message) => {
    if (!isStaleChunkError(message)) {
      return;
    }

    const lastReloadAt = Number(sessionStorage.getItem(storageKey) || 0);
    const now = Date.now();

    if (now - lastReloadAt < 30000) {
      return;
    }

    sessionStorage.setItem(storageKey, String(now));
    window.location.replace("/app/?reload=" + now);
  };

  const reloadFromEvent = (event) => reloadOnce(getMessage(event));

  window.addEventListener("unhandledrejection", reloadFromEvent);
  window.addEventListener("error", reloadFromEvent, true);

  // Medusa Admin can catch lazy import failures inside React and render the
  // error instead of letting it bubble to window. Watch the page briefly so a
  // stale chunk screen still self-recovers after deploys.
  const watchRenderedErrors = () => {
    const scan = () => reloadOnce(document.body?.innerText || "");

    scan();

    if (!window.MutationObserver || !document.body) {
      const interval = window.setInterval(scan, 1000);
      window.setTimeout(() => window.clearInterval(interval), 15000);
      return;
    }

    const observer = new MutationObserver(scan);
    observer.observe(document.body, { childList: true, subtree: true });
    window.setTimeout(() => observer.disconnect(), 15000);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", watchRenderedErrors, { once: true });
  } else {
    watchRenderedErrors();
  }
})();
</script>
${patchEnd}`

const html = await readFile(adminIndexPath, "utf8")

if (html.includes(marker)) {
  if (!existingPatchPattern.test(html)) {
    throw new Error(`Cannot update Medusa Admin stale chunk patch in ${adminIndexPath}`)
  }

  await writeFile(adminIndexPath, html.replace(existingPatchPattern, reloadScript))
  console.log("Updated Medusa Admin stale chunk reload recovery.")
  process.exit(0)
}

if (!html.includes("</head>")) {
  throw new Error(`Cannot patch Medusa Admin index: missing </head> in ${adminIndexPath}`)
}

await writeFile(adminIndexPath, html.replace("</head>", `${reloadScript}\n    </head>`))
console.log("Patched Medusa Admin with stale chunk reload recovery.")
