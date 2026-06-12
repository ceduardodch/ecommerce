import type { FastifyReply, FastifyRequest } from "fastify"
import type { AppConfig } from "./config.js"

const publicPaths = new Set([
  "/healthz",
  "/feeds/meta/catalog.csv",
  "/webhooks/whatsapp",
])

export function authHook(config: AppConfig) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!config.toolsApiToken || publicPaths.has(request.url.split("?")[0])) {
      return
    }

    const authorization = request.headers.authorization || ""
    const token = authorization.replace(/^Bearer\s+/i, "")
    if (token !== config.toolsApiToken) {
      return reply.code(401).send({ error: "unauthorized" })
    }
  }
}
