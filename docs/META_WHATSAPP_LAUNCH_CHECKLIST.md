# Meta Ads -> Web -> WhatsApp Launch Checklist

## Campaign URL

Use this URL as the first cuchillo campaign destination:

```text
https://cocina.b2b.com.ec/campanas/cuchillo-samurai-japones-todo-uso?sku=COC-CUCHILLO-SAMURAI-TODO-USO&utm_source=meta&utm_medium=paid_social&utm_campaign={{campaign.name}}&utm_content={{ad.name}}
```

## Required Flow

1. Meta ad opens the one-product campaign landing.
2. Landing shows real cuchillo video, offer `$50 -> $30`, and `Envio gratis por Servientrega`.
3. Landing shows real photo proof: full product, hoja/textura, mango, and main product photo.
4. WhatsApp sticky CTA stays visible while scrolling.
5. WhatsApp message includes product, SKU, price, coupon, campaign, UTM, Lead, and Servientrega shipping.
6. Storefront sends `campaign_cta_click` through `/api/events`.
7. `ecommerce-tools` stores the event in CRM.
8. Vicky/OpenClaw can query `/tools/ai-context/customer/:phone?leadId=...` and see:
   - `journeyStage: cotizacion_pendiente`
   - `productInterestSku: COC-CUCHILLO-SAMURAI-TODO-USO`
   - `campaignSlug: cuchillo-samurai-japones-todo-uso`
   - `couponClaimed: true`

## Local Validation

Run storefront and tools with a shared token:

```bash
TOOLS_API_TOKEN=dev-token TOOLS_API_INTERNAL_URL=http://localhost:8787 npm run storefront:dev
CRM_BACKEND=json TOOLS_API_TOKEN=dev-token PIXEL_ENABLED=false npm run tools:dev
```

Then run:

```bash
TOOLS_API_TOKEN=dev-token REQUIRE_EVENTS=true REQUIRE_TOOLS=true npm run validate:meta-whatsapp
```

Local readiness gate:

```bash
STORE_URL=http://localhost:3000 \
TOOLS_URL=http://localhost:8787 \
TOOLS_API_TOKEN=dev-token \
REQUIRE_TOOLS=true \
npm run campaign:readiness
```

## Production Validation

After deployment, run:

```bash
STORE_URL=https://cocina.b2b.com.ec npm run campaign:readiness
```

If `ecommerce-tools` is reachable from the validator, include direct CRM/Vicky checks:

```bash
STORE_URL=https://cocina.b2b.com.ec \
TOOLS_URL=<tools-url-reachable-from-validator> \
TOOLS_API_TOKEN=<same token configured in production> \
REQUIRE_TOOLS=true \
npm run campaign:readiness
```

For a cuchillo-only release, block accidental wellness changes before commit with:

```bash
STRICT_RELEASE_SCOPE=true npm run campaign:readiness
```

The lower-level public flow validator is:

```bash
STORE_URL=https://cocina.b2b.com.ec \
TOOLS_URL=https://<tools-public-or-tunnel-url> \
TOOLS_API_TOKEN=<token> \
REQUIRE_EVENTS=true \
REQUIRE_TOOLS=true \
npm run validate:meta-whatsapp
```

If tools is private-only, validate the landing publicly and run the tools checks from inside the Docker network or server.

## Current Status - 2026-06-03

Local validation passed with:

```bash
TOOLS_API_TOKEN=dev-token REQUIRE_EVENTS=true REQUIRE_TOOLS=true npm run validate:meta-whatsapp
```

Local readiness also passed with:

```bash
STORE_URL=http://localhost:3000 \
TOOLS_URL=http://localhost:8787 \
TOOLS_API_TOKEN=dev-token \
REQUIRE_TOOLS=true \
npm run campaign:readiness
```

Local readiness evidence:

- Landing `200`.
- Cuchillo SKU present.
- `$50 -> $30` offer present.
- `Envio gratis por Servientrega` present.
- `video-cuchillo-samurai-hero.mp4` and `video-cuchillo-samurai-corte.mp4` serve `200`.
- `photo-product-cuchillo-samurai.jpg`, `photo-cuchillo-samurai-vertical.jpg`, `photo-cuchillo-samurai-textura.jpg`, and `photo-cuchillo-samurai-mango.jpg` serve `200`.
- Six WhatsApp CTAs use `593979854915`.
- Six WhatsApp CTAs use first line `Hola, quiero el cuchillo samurai Japones todo uso.`
- Six WhatsApp CTAs include SKU, price `$30.00`, coupon `GRANITOHOY`, campaign, UTM, Lead, and Servientrega shipping.
- `/api/events` accepts `campaign_cta_click`.
- Direct `/tools/events` stores CRM.
- `/tools/ai-context/customer/:phone?leadId=...` returns `journeyStage: cotizacion_pendiente`, `productInterestSku: COC-CUCHILLO-SAMURAI-TODO-USO`, `campaignSlug`, and `couponClaimed: true`.
- Meta CAPI is still a warning locally until `META_ACCESS_TOKEN` and dataset/pixel config are present.

Public production is not ready for ad spend yet. This command currently fails:

```bash
STORE_URL=https://cocina.b2b.com.ec npm run validate:meta-whatsapp
```

Known public-production failures before launch:

- Server containers are healthy, but still run image tag `aeb3536a6deb7aa67e57250d803fa53866cfed8a` for `storefront`, `ecommerce-tools`, and `medusa-api`.
- Local `release`, `origin/release`, and `origin/main` also point to `aeb3536a6deb7aa67e57250d803fa53866cfed8a`; the validated campaign work is still uncommitted local working-tree state.
- Runtime config has the internal tools token and Medusa Admin API key present, and `/healthz` reports `crmBackend: medusa`, `allowDemoCatalog: false`, `medusaAdminApiKeyConfigured: true`, `payphoneMode: dry-run`.
- Runtime storefront config still exposes `NEXT_PUBLIC_PIXEL_ENABLED=false` and no `NEXT_PUBLIC_META_PIXEL_ID`; runtime tools config has no `META_ACCESS_TOKEN`/`META_DATASET_ID`. This means Meta Pixel/CAPI optimization is not ready yet, even though the WhatsApp flow can be validated separately.
- The campaign URL responds `200`, but still renders older Wok/cocina media instead of the cuchillo video flow.
- `/media/video-cuchillo-samurai-hero.mp4` returns `404`.
- `/media/video-cuchillo-samurai-corte.mp4` returns `404`.
- `/media/photo-product-cuchillo-samurai.jpg` returns `404`.
- `/media/photo-cuchillo-samurai-vertical.jpg` returns `404`.
- `/media/photo-cuchillo-samurai-textura.jpg` returns `404`.
- `/media/photo-cuchillo-samurai-mango.jpg` returns `404`.
- The public page does not show the `$50 -> $30` offer.
- The public page does not show `Envio gratis por Servientrega`.
- The public WhatsApp first line is still not the product-specific cuchillo trigger; current public first line is `Hola, quiero la olla de granito Cuchillo samurai Japones todo uso.`
- Public `/api/events` returns `500` for `campaign_cta_click`, which means the deployed `ecommerce-tools` schema has not received the local fix yet.
- Direct in-container `ecommerce-tools` probe also returns `500` for `campaign_cta_click`, proving the blocker is the deployed tools schema, not only the storefront proxy.
- Direct in-container `ecommerce-tools` accepts the older `campaign_click` event and stores CRM with `crmStored: true`; current Meta result is `sent: false`, `reason: pixel_disabled`.
- `campaign:readiness` now treats non-zero validator exits without structured `hardFailures` as blockers, preventing false `readyForAdSpend: true` reports.

Next required production step: commit the validated `release` work, promote/deploy through `main`/Coolify, then rerun the production validation until it has no hard failures.

Promotion commands require explicit user authorization because `main` is tied to Coolify production:

```bash
git add <validated files>
git commit -m "feat: prepare cuchillo campaign whatsapp flow"
git push origin release
git push origin release:main
```

Post-deploy public gate:

```bash
STORE_URL=https://cocina.b2b.com.ec npm run validate:meta-whatsapp
```

Paid-campaign measurement gate when Pixel/CAPI credentials are configured:

```bash
STORE_URL=https://cocina.b2b.com.ec \
REQUIRE_EVENTS=true \
REQUIRE_META_CAPI=true \
npm run validate:meta-whatsapp
```

If direct tools validation is available from the server/network:

```bash
STORE_URL=https://cocina.b2b.com.ec \
TOOLS_URL=<tools-url-reachable-from-validator> \
TOOLS_API_TOKEN=<same token configured in production> \
REQUIRE_EVENTS=true \
REQUIRE_TOOLS=true \
npm run validate:meta-whatsapp
```

## Human Checks Before Spending

- Open the campaign URL on a real phone.
- Confirm the first viewport shows video, `$30 oferta`, and WhatsApp sticky CTA.
- Click WhatsApp and confirm the first line is product-specific, not a generic menu.
- Confirm Vicky responds with cuchillo context, price `$30`, Servientrega shipping, and payment options.
- Keep the ad muted-friendly; the landing must convert without audio.
