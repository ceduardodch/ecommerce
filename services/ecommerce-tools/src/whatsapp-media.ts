import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import type { AppConfig } from "./config.js"

export type WhatsappMediaReference = {
  id?: string
  mime_type?: string
  filename?: string
  caption?: string
}

export type StoredWhatsappMedia = {
  type: string
  path: string
  name: string
  mimeType: string
  size: number
}

function safeFilename(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-180)
}

function extension(mimeType: string) {
  const [, subtype = "bin"] = mimeType.split("/")
  return subtype.replace(/[^a-zA-Z0-9]/g, "") || "bin"
}

export async function downloadWhatsappMedia(
  config: AppConfig,
  kind: string,
  messageId: string,
  media: WhatsappMediaReference,
): Promise<StoredWhatsappMedia | undefined> {
  if (!media.id || !config.whatsappCloudAccessToken) return undefined
  const api = `https://graph.facebook.com/${config.metaApiVersion}/${media.id}`
  const metadataResponse = await fetch(api, {
    headers: { authorization: `Bearer ${config.whatsappCloudAccessToken}` },
  })
  if (!metadataResponse.ok) throw new Error(`meta_media_metadata_${metadataResponse.status}`)
  const metadata = await metadataResponse.json() as { url?: string; mime_type?: string; file_size?: number }
  if (!metadata.url) throw new Error("meta_media_url_missing")
  if (metadata.file_size && metadata.file_size > config.whatsappMediaMaxBytes) {
    throw new Error("meta_media_too_large")
  }
  const contentResponse = await fetch(metadata.url, {
    headers: { authorization: `Bearer ${config.whatsappCloudAccessToken}` },
  })
  if (!contentResponse.ok) throw new Error(`meta_media_download_${contentResponse.status}`)
  const body = Buffer.from(await contentResponse.arrayBuffer())
  if (body.length > config.whatsappMediaMaxBytes) throw new Error("meta_media_too_large")
  const mimeType = metadata.mime_type || media.mime_type || "application/octet-stream"
  const name = safeFilename(media.filename || `${kind}-${messageId}.${extension(mimeType)}`)
  const filename = safeFilename(`${messageId}-${name}`)
  await mkdir(config.whatsappMediaDir, { recursive: true })
  await writeFile(path.join(config.whatsappMediaDir, filename), body, { flag: "wx" }).catch(async (error: NodeJS.ErrnoException) => {
    if (error.code !== "EEXIST") throw error
  })
  return { type: kind, path: filename, name, mimeType, size: body.length }
}
