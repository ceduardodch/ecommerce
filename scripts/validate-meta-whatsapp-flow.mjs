#!/usr/bin/env node

const defaults = {
  storeUrl: "http://localhost:3000",
  toolsUrl: "http://localhost:8787",
  campaignSlug: "cuchillo-samurai-japones-todo-uso",
  sku: "COC-CUCHILLO-SAMURAI-TODO-USO",
  utmSource: "meta",
  utmMedium: "paid_social",
  utmCampaign: "cuchillo_samurai_ec",
  utmContent: "video_01",
  expectedPhone: "593979854915",
}

const config = {
  storeUrl: cleanBase(process.env.STORE_URL || defaults.storeUrl),
  toolsUrl: cleanBase(process.env.TOOLS_URL || defaults.toolsUrl),
  toolsToken: process.env.TOOLS_API_TOKEN,
  requireEvents: ["1", "true", "yes"].includes(
    String(process.env.REQUIRE_EVENTS || "").toLowerCase(),
  ),
  requireTools: ["1", "true", "yes"].includes(
    String(process.env.REQUIRE_TOOLS || "").toLowerCase(),
  ),
  requireMetaCapi: ["1", "true", "yes"].includes(
    String(process.env.REQUIRE_META_CAPI || "").toLowerCase(),
  ),
  campaignSlug: process.env.CAMPAIGN_SLUG || defaults.campaignSlug,
  sku: process.env.CAMPAIGN_SKU || process.env.SKU || defaults.sku,
  utmSource: process.env.UTM_SOURCE || defaults.utmSource,
  utmMedium: process.env.UTM_MEDIUM || defaults.utmMedium,
  utmCampaign: process.env.UTM_CAMPAIGN || defaults.utmCampaign,
  utmContent: process.env.UTM_CONTENT || defaults.utmContent,
  expectedPhone: process.env.WHATSAPP_PHONE || defaults.expectedPhone,
}

const hardFailures = []
const warnings = []
const checks = []

function cleanBase(value) {
  return value.replace(/\/+$/, "")
}

function campaignUrl() {
  const url = new URL(`/campanas/${config.campaignSlug}`, config.storeUrl)
  url.searchParams.set("sku", config.sku)
  url.searchParams.set("utm_source", config.utmSource)
  url.searchParams.set("utm_medium", config.utmMedium)
  url.searchParams.set("utm_campaign", config.utmCampaign)
  url.searchParams.set("utm_content", config.utmContent)
  return url
}

function record(name, passed, detail, hard = true) {
  checks.push({ name, passed, detail })
  if (!passed) {
    if (hard) hardFailures.push(`${name}: ${detail}`)
    else warnings.push(`${name}: ${detail}`)
  }
}

async function fetchText(url, options = {}) {
  const response = await fetch(url, options)
  const text = await response.text()
  return { response, text }
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options)
  const text = await response.text()
  let json
  try {
    json = JSON.parse(text)
  } catch {
    json = { raw: text }
  }
  return { response, json }
}

function htmlDecode(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
}

function extractWhatsappLinks(html) {
  const links = []
  const regex = /href="([^"]*wa\.me[^"]*)"/g
  let match
  while ((match = regex.exec(html))) {
    links.push(htmlDecode(match[1]))
  }
  return links
}

function whatsappMessage(link) {
  const url = new URL(link)
  return url.searchParams.get("text") || ""
}

async function assertAsset(path) {
  const url = new URL(path, config.storeUrl)
  const response = await fetch(url, { method: "HEAD" })
  record(
    `asset ${path}`,
    response.ok,
    response.ok
      ? `${response.status}`
      : `${response.status} ${response.statusText}`,
  )
}

function eventPayload(leadId) {
  return {
    eventName: "Lead",
    type: "campaign_cta_click",
    source: "meta_ads",
    eventId: `validate_${Date.now()}`,
    leadId,
    pageUrl: String(campaignUrl()),
    consent: true,
    product: {
      productId: "prod-cuchillo-samurai",
      variantId: "var-cuchillo-samurai",
      sku: config.sku,
      title: "Cuchillo samurai Japones todo uso",
      category: "Cuchillos",
      brand: "MGC",
      price: 34.99,
      currency: "USD",
    },
    value: 34.99,
    currency: "USD",
    metadata: {
      campaignSlug: config.campaignSlug,
      productInterestSku: config.sku,
      couponClaimed: true,
      utmSource: config.utmSource,
      utmMedium: config.utmMedium,
      utmCampaign: config.utmCampaign,
      utmContent: config.utmContent,
    },
  }
}

async function validateStorefrontEvents(leadId) {
  const url = new URL("/api/events", config.storeUrl)
  const { response, json } = await fetchJson(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(eventPayload(leadId)),
  })
  const accepted =
    response.ok && json.accepted === true && json.crmStored === true
  record(
    "storefront /api/events proxy",
    accepted,
    accepted
      ? `accepted ${json.crmEventType}`
      : `${response.status} ${JSON.stringify(json).slice(0, 220)}`,
    config.requireEvents,
  )
  record(
    "storefront /api/events Meta CAPI",
    accepted && json.meta?.sent === true,
    accepted
      ? json.meta?.sent === true
        ? "meta.sent=true"
        : JSON.stringify(json.meta || { reason: "missing_meta_result" })
      : "event was not accepted",
    config.requireMetaCapi,
  )
}

async function validateToolsDirect(leadId) {
  if (!config.toolsToken) {
    record(
      "direct ecommerce-tools validation",
      false,
      "TOOLS_API_TOKEN not set; skipped direct tools/CRM validation",
      config.requireTools,
    )
    return
  }

  const eventUrl = new URL("/tools/events", config.toolsUrl)
  const { response, json } = await fetchJson(eventUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${config.toolsToken}`,
    },
    body: JSON.stringify(eventPayload(leadId)),
  })
  const stored =
    response.ok && json.accepted === true && json.crmStored === true
  record(
    "direct /tools/events CRM write",
    stored,
    stored
      ? `identity ${json.identity}`
      : `${response.status} ${JSON.stringify(json).slice(0, 220)}`,
    config.requireTools,
  )
  if (!stored) return

  const contextUrl = new URL(
    `/tools/ai-context/customer/${config.expectedPhone}`,
    config.toolsUrl,
  )
  contextUrl.searchParams.set("leadId", leadId)
  const context = await fetchJson(contextUrl, {
    headers: { authorization: `Bearer ${config.toolsToken}` },
  })
  const lifecycle = context.json.lifecycle || {}
  const ready =
    context.response.ok &&
    lifecycle.journeyStage === "cotizacion_pendiente" &&
    lifecycle.productInterestSku === config.sku &&
    lifecycle.campaignSlug === config.campaignSlug &&
    lifecycle.couponClaimed === true
  record(
    "Vicky AI context by leadId",
    ready,
    ready
      ? JSON.stringify(lifecycle)
      : JSON.stringify(context.json).slice(0, 260),
    config.requireTools,
  )
}

async function main() {
  const url = campaignUrl()
  const { response, text } = await fetchText(url)
  record("campaign landing 200", response.ok, `${response.status} ${url}`)

  record("campaign contains SKU", text.includes(config.sku), config.sku)
  record("campaign contains knife copy", /Cuchillo samurai/i.test(text), "")
  record("campaign avoids wrong olla copy", !/olla de granito/i.test(text), "")
  record(
    "campaign shows offer",
    /Antes \$50|Hoy \$34\.99|\$34\.99 oferta|Ahorra \$15\.01/i.test(text),
    "expected $50 -> $34.99 copy",
  )
  record(
    "campaign shows Servientrega",
    /Servientrega/i.test(text),
    "expected free Servientrega shipping copy",
  )
  record(
    "campaign includes hero video",
    text.includes("video-cuchillo-samurai-hero.mp4"),
    "expected hero MP4 in HTML",
  )

  await assertAsset("/media/video-cuchillo-samurai-hero.mp4")
  await assertAsset("/media/video-cuchillo-samurai-corte.mp4")
  await assertAsset("/media/photo-product-cuchillo-samurai.jpg")
  await assertAsset("/media/photo-cuchillo-samurai-vertical.jpg")
  await assertAsset("/media/photo-cuchillo-samurai-textura.jpg")
  await assertAsset("/media/photo-cuchillo-samurai-mango.jpg")

  const whatsappLinks = extractWhatsappLinks(text)
  record(
    "WhatsApp links present",
    whatsappLinks.length > 0,
    `${whatsappLinks.length} links`,
  )
  const link = whatsappLinks.find((item) => item.includes(config.expectedPhone))
  const sellerLinks = whatsappLinks.filter((item) =>
    item.includes(config.expectedPhone),
  )
  record(
    "WhatsApp seller number",
    Boolean(link),
    `expected ${config.expectedPhone}`,
  )
  record(
    "all WhatsApp links use seller number",
    whatsappLinks.length > 0 && sellerLinks.length === whatsappLinks.length,
    `${sellerLinks.length}/${whatsappLinks.length} links use ${config.expectedPhone}`,
  )
  if (link) {
    const message = whatsappMessage(link)
    const firstLine = message.split(/\r?\n/)[0] || ""
    record(
      "WhatsApp first line avoids olla trigger",
      !/^Hola, quiero la olla de granito/i.test(firstLine),
      firstLine || "missing first line",
    )
    const requiredFragments = [
      "Hola, quiero reclamar la promo del cuchillo samurai Japones todo uso.",
      "Vi la promo de $34.99 con cupon GRANITOHOY.",
      "Me confirmas stock, envio gratis por Servientrega y formas de pago?",
      "Ref: lead_",
    ]
    for (const fragment of requiredFragments) {
      record(
        `WhatsApp message includes ${fragment.slice(0, 28)}`,
        message.includes(fragment),
        fragment,
      )
    }
    const forbiddenFragments = [
      `SKU: ${config.sku}`,
      `Campana: ${config.campaignSlug}`,
      `utm_source: ${config.utmSource}`,
      "ProductoID:",
      "Variante:",
      "Sesion:",
    ]
    for (const fragment of forbiddenFragments) {
      record(
        `WhatsApp message hides ${fragment.slice(0, 30)}`,
        !message.includes(fragment),
        fragment,
      )
    }

    const messages = sellerLinks.map((sellerLink) =>
      whatsappMessage(sellerLink),
    )
    const wrongFirstLines = messages
      .map((item) => item.split(/\r?\n/)[0] || "")
      .filter((item) => /^Hola, quiero la olla de granito/i.test(item))
    record(
      "all WhatsApp CTAs avoid olla trigger",
      wrongFirstLines.length === 0,
      wrongFirstLines.length
        ? wrongFirstLines.slice(0, 3).join(" | ")
        : `${messages.length} messages checked`,
    )
    for (const fragment of requiredFragments) {
      const missingCount = messages.filter(
        (item) => !item.includes(fragment),
      ).length
      record(
        `all WhatsApp CTAs include ${fragment.slice(0, 24)}`,
        missingCount === 0,
        missingCount
          ? `${missingCount}/${messages.length} messages missing ${fragment}`
          : `${messages.length} messages checked`,
      )
    }
    for (const fragment of forbiddenFragments) {
      const visibleCount = messages.filter((item) =>
        item.includes(fragment),
      ).length
      record(
        `all WhatsApp CTAs hide ${fragment.slice(0, 24)}`,
        visibleCount === 0,
        visibleCount
          ? `${visibleCount}/${messages.length} messages still show ${fragment}`
          : `${messages.length} messages checked`,
      )
    }
  }

  const leadId = `lead_validate_${config.campaignSlug}_${Date.now()}`
  await validateStorefrontEvents(leadId)
  await validateToolsDirect(`${leadId}_direct`)

  const summary = {
    campaignUrl: String(url),
    requireMetaCapi: config.requireMetaCapi,
    checks,
    warnings,
    hardFailures,
  }
  console.log(JSON.stringify(summary, null, 2))

  if (hardFailures.length) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
