import type { FastifyReply, FastifyRequest } from "fastify"
import type { AppConfig } from "./config.js"

const publicPaths = new Set([
  "/healthz",
  "/feeds/meta/catalog.csv",
  "/webhooks/whatsapp",
])

export function authHook(config: AppConfig) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (publicPaths.has(request.url.split("?")[0])) {
      return
    }
    if (!config.toolsApiToken) {
      // Fail-closed en producción: sin token configurado, nada queda público
      // (p. ej. /tools/datafast/void). En dev local sigue abierto.
      if (process.env.NODE_ENV === "production") {
        return reply.code(503).send({ error: "tools_token_not_configured" })
      }
      return
    }

    const authorization = request.headers.authorization || ""
    const token = authorization.replace(/^Bearer\s+/i, "")
    if (token !== config.toolsApiToken) {
      return reply.code(401).send({ error: "unauthorized" })
    }
  }
}
