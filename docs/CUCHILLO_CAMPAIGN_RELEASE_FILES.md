# Cuchillo Campaign Release Files

## Scope

Release goal: make the validated Meta Ads -> campaign landing -> WhatsApp -> CRM/Vicky flow available in production for `COC-CUCHILLO-SAMURAI-TODO-USO`.

## Required For Launch

Storefront campaign flow:

- `apps/storefront/app/campanas/[slug]/page.tsx`
- `apps/storefront/app/campanas/[slug]/components/campaign-interactions.tsx`
- `apps/storefront/app/components/analytics.tsx`
- `apps/storefront/app/globals.css`
- `apps/storefront/lib/catalog.ts`
- `apps/storefront/lib/commercial.ts`
- `apps/storefront/lib/content.ts`
- `apps/storefront/lib/whatsapp.ts`

Campaign assets:

- `apps/storefront/public/media/video-cuchillo-samurai-hero.mp4`
- `apps/storefront/public/media/video-cuchillo-samurai-corte.mp4`
- `apps/storefront/public/media/photo-cuchillo-samurai-hero.jpg`
- `apps/storefront/public/media/photo-cuchillo-samurai-full.jpg`
- `apps/storefront/public/media/photo-cuchillo-samurai-vertical.jpg`
- `apps/storefront/public/media/photo-cuchillo-samurai-textura.jpg`
- `apps/storefront/public/media/photo-cuchillo-samurai-mango.jpg`
- `apps/storefront/public/media/photo-product-cuchillo-samurai.jpg`

Catalog and seed sync:

- `data/catalog/eter-niu-products.csv`
- `apps/backend/src/migration-scripts/kitchen-catalog-seed.ts`
- `services/ecommerce-tools/src/demo-catalog.ts`
- `scripts/sync-whatsapp-catalog.mjs`

Events/CRM/Vicky context:

- `services/ecommerce-tools/src/contracts.ts`
- `services/ecommerce-tools/src/service.ts`
- `services/ecommerce-tools/src/types.ts`
- `services/ecommerce-tools/tests/quote.test.ts`

Validation and handoff:

- `package.json`
- `scripts/validate-meta-whatsapp-flow.mjs`
- `docs/META_WHATSAPP_LAUNCH_CHECKLIST.md`
- `docs/CUCHILLO_CAMPAIGN_RELEASE_FILES.md`
- `docs/CUCHILLO_CAMPAIGN_RELEASE_PATHSPEC.txt`

## Needs Owner Decision Before Including

These changes are present in the working tree but are not required for the cuchillo campaign launch:

- `apps/backend/src/migration-scripts/wellness-catalog-seed.ts`
- `data/catalog/eter-niu-wellness-products.csv`
- `apps/storefront/public/media/wellness-*.jpg`

If the production push is only for tomorrow's cuchillo ad, keep wellness changes out of the release commit unless the user explicitly wants to ship `bienestar` updates at the same time.

## Safe Staging

Preview the exact cuchillo release package without staging:

```bash
git add -f --dry-run --pathspec-from-file=docs/CUCHILLO_CAMPAIGN_RELEASE_PATHSPEC.txt
```

After explicit user authorization, stage only that package:

```bash
git add -f --pathspec-from-file=docs/CUCHILLO_CAMPAIGN_RELEASE_PATHSPEC.txt
```

This pathspec intentionally excludes:

- `apps/backend/src/migration-scripts/wellness-catalog-seed.ts`
- `data/catalog/eter-niu-wellness-products.csv`
- `apps/storefront/public/media/wellness-*.jpg`

## Production Gates

Run before pushing:

```bash
npm run typecheck
npm run tools:test
npm run validate:cuchillo-release
npm run build
git diff --check
POSTGRES_PASSWORD=dummy JWT_SECRET=dummy COOKIE_SECRET=dummy TOOLS_API_TOKEN=dummy docker compose config --quiet
```

Use strict mode when preparing the final commit if the launch should exclude wellness changes:

```bash
STRICT_RELEASE_SCOPE=true npm run validate:cuchillo-release
```

After Coolify deploy:

```bash
STORE_URL=https://cocina.b2b.com.ec npm run campaign:readiness
```

If direct `ecommerce-tools` access is available:

```bash
STORE_URL=https://cocina.b2b.com.ec \
TOOLS_URL=<tools-url-reachable-from-validator> \
TOOLS_API_TOKEN=<same token configured in production> \
REQUIRE_TOOLS=true \
npm run campaign:readiness
```

Lower-level landing/event check:

```bash
STORE_URL=https://cocina.b2b.com.ec npm run validate:meta-whatsapp
```

The ad should not launch until the production validator has no `hardFailures`.

For paid optimization, also run this after configuring Meta Pixel/CAPI credentials in Coolify:

```bash
STORE_URL=https://cocina.b2b.com.ec \
REQUIRE_EVENTS=true \
REQUIRE_META_CAPI=true \
npm run validate:meta-whatsapp
```
