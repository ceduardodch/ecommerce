import { readFile, writeFile } from "node:fs/promises"
import { resolve } from "node:path"

const marker = "eterNiuAdminChunkReloadInstalled"
const adminIndexPath = resolve(
  process.cwd(),
  ".medusa/server/public/admin/index.html"
)

const reloadScript = `<script>
(() => {
  if (window.__${marker}) {
    return;
  }

  window.__${marker} = true;

  const storageKey = "eter_niu_admin_chunk_reload_at";
  const staleChunkPatterns = [
    "Failed to fetch dynamically imported module",
    "Importing a module script failed",
    "error loading dynamically imported module",
    "dynamically imported module",
  ];

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

  const reloadOnce = (event) => {
    const message = getMessage(event);

    if (!staleChunkPatterns.some((pattern) => message.includes(pattern))) {
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

  window.addEventListener("unhandledrejection", reloadOnce);
  window.addEventListener("error", reloadOnce, true);
})();
</script>`

const html = await readFile(adminIndexPath, "utf8")

if (html.includes(marker)) {
  console.log("Medusa Admin stale chunk reload patch already present.")
  process.exit(0)
}

if (!html.includes("</head>")) {
  throw new Error(`Cannot patch Medusa Admin index: missing </head> in ${adminIndexPath}`)
}

await writeFile(adminIndexPath, html.replace("</head>", `${reloadScript}\n    </head>`))
console.log("Patched Medusa Admin with stale chunk reload recovery.")
