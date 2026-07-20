# Graph Report - ecommerce  (2026-07-20)

## Corpus Check
- 243 files · ~441,972 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1597 nodes · 2743 edges · 113 communities (97 shown, 16 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 70 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `12ad8766`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- B2B CRM Models
- Agent Governance
- Tools Contracts
- Architecture Docs
- Root Package Config
- Followup Dispatch API
- Wellness Campaign Pages
- Ambient UI Pages
- Kitchen Campaign Pages
- Lead Import Admin
- Storefront Dependencies
- Tools CRM Service
- Backend Dependencies
- Backend TypeScript Config
- Tools Dependencies
- Storefront TypeScript Config
- Cart Checkout UI
- Brand Navigation UI
- Tools Catalog Logic
- Meta Pixel Analytics
- Media Metadata Script
- Turbo Build Config
- Admin TypeScript Config
- Storefront Catalog Logic
- CRM Leads Admin
- Shared Product UI
- Product Detail Pages
- UI Component Library
- Tools Runtime Config
- Meta CAPI Events
- CRM Feature Slice
- Automation Scripts
- Backend Feature Slice
- Tools Feature Slice
- Backend Feature Slice
- CRM Feature Slice
- CRM Feature Slice
- Automation Scripts
- Tools Feature Slice
- Tools Feature Slice
- CRM Feature Slice
- Tools Feature Slice
- Storefront Feature Slice
- Automation Scripts
- CRM Feature Slice
- CRM Feature Slice
- CRM Feature Slice
- Tools Feature Slice
- CRM Feature Slice
- Storefront Feature Slice
- Storefront Feature Slice
- Backend Feature Slice
- CRM Feature Slice
- Backend Feature Slice
- Backend Feature Slice
- Automation Scripts
- Backend Feature Slice
- Storefront Feature Slice
- Storefront Feature Slice
- Storefront Feature Slice
- Storefront Feature Slice
- Cart Modal And
- GenerateCartMessage
- Backend Feature Slice
- Storefront Feature Slice
- Storefront Feature Slice
- Order Creation
- Backend Feature Slice
- Storefront Feature Slice
- Project Documentation
- Project Documentation
- Storefront Feature Slice
- Storefront Feature Slice
- Storefront Feature Slice
- Storefront Feature Slice
- Project Documentation
- Add To Cart
- Code Splitting
- Automation Scripts
- CRM Feature Slice
- CRM Feature Slice
- CRM Feature Slice
- Storefront Feature Slice
- Storefront Feature Slice
- Backend Feature Slice
- Backend Feature Slice
- Storefront Feature Slice
- Backend Feature Slice
- Backend Feature Slice
- Backend Feature Slice
- Backend Feature Slice
- Backend Feature Slice
- Backend Feature Slice
- Storefront Feature Slice
- Storefront Feature Slice
- Storefront Feature Slice
- Project Documentation
- meta.ts
- datafast-certification-probe.mjs
- @medusajs/admin-sdk
- cart-bag-button.tsx
- video-stories.tsx
- @medusajs/cli

## God Nodes (most connected - your core abstractions)
1. `crmService()` - 36 edges
2. `trackStorefrontEvent()` - 36 edges
3. `B2bCrmModuleService` - 34 edges
4. `scripts` - 29 edges
5. `commercialInfo()` - 24 edges
6. `useCart()` - 23 edges
7. `serializeCustomer()` - 22 edges
8. `compilerOptions` - 19 edges
9. `TrackedWhatsAppLink()` - 18 edges
10. `Product` - 17 edges

## Surprising Connections (you probably didn't know these)
- `WhatsApp Messaging Guardrails` --semantically_similar_to--> `Marketplace Human Approval Boundary`  [INFERRED] [semantically similar]
  docs/WHATSAPP_CLOUD_PLAN.md → skills/meta-marketplace-assistant/SKILL.md
- `mountWhatsappWebhookRoutes()` --indirect_call--> `timestamp()`  [INFERRED]
  services/ecommerce-tools/src/whatsapp-webhook.ts → scripts/reset-medusa-crm.mjs
- `Explicit verification rule` --rationale_for--> `verificador`  [INFERRED]
  CLAUDE.md → .claude/agents/verificador.md
- `AI Handoff` --conceptually_related_to--> `Eter Niu AI Native Social Commerce`  [INFERRED]
  AI_HANDOFF.md → README.md
- `Meta Post Draft Endpoint` --conceptually_related_to--> `Meta Pixel Events Validation`  [INFERRED]
  skills/meta-marketplace-assistant/SKILL.md → reports/PLN-2-meta-pixel-validation.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Production Compose Runtime Stack** — docker_compose_postgres, docker_compose_redis, docker_compose_medusa_api, docker_compose_ecommerce_tools, docker_compose_storefront [EXTRACTED 1.00]
- **Conversational Commerce Flow** — agents_openclaw_ecommerce_seller_openclaw_ecommerce_seller, agents_vicky_sales_bot_vicky_sales_bot, readme_openclaw_tools, readme_crm_whatsapp, readme_medusa_source_of_truth, docker_compose_ecommerce_tools [INFERRED 0.85]
- **Agent Delivery Governance Loop** — claude_agents_sprint_executor_sprint_executor, claude_agents_verificador_verificador, claude_explicit_verification_rule, docs_agent_workflow_verification_before_push, github_workflows_ci_ci_workflow, agents_agent_governance [INFERRED 0.85]
- **WhatsApp Commerce Runtime Components** — docs_architecture_nextjs_storefront, docs_architecture_ecommerce_tools_service, docs_architecture_b2b_crm_module, docs_openclaw_handoff_vicky_sales_flow, docs_current_state_payments_state [EXTRACTED 1.00]
- **Production Release Control System** — docs_branch_strategy_release_branch_workflow, docs_branch_strategy_main_production_boundary, docs_ci_branch_protection_ci_validation_only, docs_coolify_deployment_coolify_compose_app, docs_cuchillo_campaign_release_files_cuchillo_release_gates [INFERRED 0.85]
- **Eter Niu Go-Live Dependency Set** — docs_pendientes_go_live_go_live_pending_work, docs_pendientes_go_live_datafast_certification_blockers, docs_domain_plan_eter_niu_domain_migration, docs_crm_backlog_owner_operational_inputs, docs_openclaw_handoff_openclaw_separate_coolify_app [EXTRACTED 1.00]
- **WhatsApp Cloud Hybrid Flow** — docs_whatsapp_cloud_plan_dispatcher_meta_mode, docs_whatsapp_cloud_plan_meta_templates, docs_whatsapp_cloud_plan_whatsapp_webhook, docs_whatsapp_cloud_plan_vicky_openclaw_brain, docs_whatsapp_cloud_plan_cloud_api_freeform_reply, docs_whatsapp_cloud_plan_conv_timeline, docs_whatsapp_cloud_plan_channel_selector [EXTRACTED 1.00]
- **Sprint 4 Validation Suite** — reports_sprint_4_completion_report_sprint_4_completion, reports_pln_1_cross_browser_testing_cross_browser_testing_report, reports_pln_2_meta_pixel_validation_meta_pixel_events_validation, reports_pln_3_whatsapp_message_testing_whatsapp_multi_product_message_testing, reports_pln_4_performance_audit_performance_audit_report, reports_sprint_4_completion_report_manual_testing_pending [EXTRACTED 1.00]
- **Commerce Agent Operational Boundary** — skills_ecommerce_sales_skill_ecommerce_sales_skill, skills_meta_marketplace_assistant_skill_meta_marketplace_assistant_skill, skills_payphone_reconciliation_skill_payphone_reconciliation_skill, skills_meta_marketplace_assistant_skill_marketplace_human_approval_boundary, skills_payphone_reconciliation_skill_human_review_handoff, skills_ecommerce_sales_skill_payphone_link_generation [INFERRED 0.85]

## Communities (113 total, 16 thin omitted)

### Community 0 - "B2B CRM Models"
Cohesion: 0.06
Nodes (35): ConversationalOrder, CrmCustomerEvent, CrmCustomerProfile, CrmMessageTemplate, ProductReview, calculateAttributedSales(), calculateAverageLTV(), calculateRepurchaseRates() (+27 more)

### Community 1 - "Agent Governance"
Cohesion: 0.06
Nodes (55): Agent governance rules, CI/CD and Coolify deployment boundary, Forbidden repository operations, OpenClaw PayPhone Meta boundary separation, Customer data capture, Human escalation policy, OpenClaw Ecommerce Seller, Seller tool flow (+47 more)

### Community 2 - "Tools Contracts"
Cohesion: 0.07
Nodes (44): authHook(), publicPaths, attributionSchema, customerEventInputSchema, customerImportSchema, customerSchema, datafastCheckoutSchema, datafastVoidSchema (+36 more)

### Community 3 - "Architecture Docs"
Cohesion: 0.05
Nodes (50): B2B CRM Module, Channel Boundaries, ecommerce-tools Service, Eter Niu Social Commerce Stack, Medusa Commerce Core, Next.js Storefront, WhatsApp Sales Flow, Main Production Boundary (+42 more)

### Community 4 - "Root Package Config"
Cohesion: 0.07
Nodes (29): scripts, backend:build, backend:dev, backend:seed, backend:start, biblioteca:metadata, build, campaign:readiness (+21 more)

### Community 5 - "Followup Dispatch API"
Cohesion: 0.11
Nodes (21): DispatchBody, POST(), config, dispatchDueFollowupsJob(), buildMetaFreeformPayload(), buildMetaTemplatePayload(), CustomerLike, dispatchFollowup() (+13 more)

### Community 6 - "Wellness Campaign Pages"
Cohesion: 0.13
Nodes (26): campaignPath(), hasPromo(), money(), paramValue(), productBySku(), WellnessCampaignPage(), WellnessCampaignPageProps, compactContext() (+18 more)

### Community 7 - "Ambient UI Pages"
Cohesion: 0.06
Nodes (18): HALO_RGB, HALOS, HaloSpec, PageAmbient(), SHAPES, ShapeSpec, Photo(), INFO (+10 more)

### Community 8 - "Kitchen Campaign Pages"
Cohesion: 0.10
Nodes (28): CampaignPage(), CampaignPageProps, CampaignPhoto, CampaignPhotoGallery(), campaignPhotos(), campaignProduct(), campaignSlots(), generateMetadata() (+20 more)

### Community 9 - "Lead Import Admin"
Cohesion: 0.10
Nodes (27): addDays(), autoMapColumns(), boolFromText(), ColumnMapping, ImportCustomerPayload, isoFromText(), LEAD_FIELDS, LeadField (+19 more)

### Community 10 - "Storefront Dependencies"
Cohesion: 0.06
Nodes (34): dependencies, lucide-react, next, postcss, react, react-dom, tailwindcss, @tailwindcss/postcss (+26 more)

### Community 11 - "Tools CRM Service"
Cohesion: 0.23
Nodes (20): trackCustomerEvent(), addCustomerEvent(), customersPath(), datafastPath(), ensureDir(), findCustomer(), findDatafastCheckout(), findOrder() (+12 more)

### Community 12 - "Backend Dependencies"
Cohesion: 0.06
Nodes (31): devDependencies, jest, @medusajs/test-utils, prop-types, react, react-dom, @swc/core, @swc/jest (+23 more)

### Community 13 - "Backend TypeScript Config"
Cohesion: 0.07
Nodes (29): compilerOptions, checkJs, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames, inlineSourceMap (+21 more)

### Community 14 - "Tools Dependencies"
Cohesion: 0.07
Nodes (29): fastify, @fastify/cors, @modelcontextprotocol/sdk, dependencies, fastify, @fastify/cors, @modelcontextprotocol/sdk, zod (+21 more)

### Community 15 - "Storefront TypeScript Config"
Cohesion: 0.08
Nodes (25): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+17 more)

### Community 16 - "Cart Checkout UI"
Cohesion: 0.18
Nodes (16): CartPage(), FormData, Result, Resultado(), CartController(), CartDrawer(), CartDrawerProps, CartItemComponent() (+8 more)

### Community 17 - "Brand Navigation UI"
Cohesion: 0.15
Nodes (15): Isotipo(), PromoBar(), SiteFooter(), SiteHeader(), SiteHeaderProps, GuidesPage(), metadata, metadata (+7 more)

### Community 18 - "Tools Catalog Logic"
Cohesion: 0.16
Nodes (24): baseUrlForVertical(), booleanFromMetadata(), defaultPaymentMethods, generatedImageForProduct(), imageForProduct(), inferVertical(), isGeneratedPlaceholder(), isKitchenProduct() (+16 more)

### Community 19 - "Meta Pixel Analytics"
Cohesion: 0.17
Nodes (22): consentModeDisabled(), currentAttribution(), fbcFromAttribution(), metaCustomData(), MetaEventName, MetaPixel(), PageAnalytics(), pixelConfigured() (+14 more)

### Community 20 - "Media Metadata Script"
Cohesion: 0.11
Nodes (15): assets, columns, csvEscape(), IMAGE_EXTENSIONS, imageMetadata(), libraryRoot, mediaType(), outputDir (+7 more)

### Community 21 - "Turbo Build Config"
Cohesion: 0.09
Nodes (22): ^build, dist/**, .next/**, dependsOn, outputs, cache, persistent, .medusa/server/** (+14 more)

### Community 22 - "Admin TypeScript Config"
Cohesion: 0.09
Nodes (21): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+13 more)

### Community 23 - "Storefront Catalog Logic"
Cohesion: 0.18
Nodes (15): fetchProducts(), generatedImageForProduct(), getAllProducts(), getProductsForVertical(), IMAGE_OVERRIDES, isGeneratedPlaceholder(), isWellnessProduct(), kitchenTerms (+7 more)

### Community 24 - "CRM Leads Admin"
Cohesion: 0.12
Nodes (18): buttonStyle, CampaignFilter, cardStyle, cellStyle, config, CustomerRow, CustomersResponse, DryRunResult (+10 more)

### Community 25 - "Shared Product UI"
Cohesion: 0.15
Nodes (9): AddToCartButton(), AddToCartButtonProps, FloatingProduct(), FloatingProductProps, SPARKLES, HeroShowcase(), ImageReveal(), ProductShowcaseGrid() (+1 more)

### Community 26 - "Product Detail Pages"
Cohesion: 0.16
Nodes (19): BreadcrumbItem, Breadcrumbs(), BreadcrumbsProps, SpecTable(), VideoFrame(), generateMetadata(), hasPromo(), macroItems() (+11 more)

### Community 27 - "UI Component Library"
Cohesion: 0.08
Nodes (21): Badge(), Button(), variantClass, WhatsAppButton(), ColorOption, ColorPicker(), FormField(), MaterialMacro() (+13 more)

### Community 28 - "Tools Runtime Config"
Cohesion: 0.28
Nodes (8): AppConfig, loadConfig(), normalizeWhatsappSellerNumber(), buildClientTransactionId(), createPayPhoneLink(), createCommerceService(), OrderRecord, svc()

### Community 29 - "Meta CAPI Events"
Cohesion: 0.19
Nodes (18): buildCustomData(), crmPayloadForEvent(), eventIdFor(), eventProducts(), eventTypeFor(), eventValue(), identityForEvent(), leadIdentity() (+10 more)

### Community 30 - "CRM Feature Slice"
Cohesion: 0.15
Nodes (14): POST(), PurchaseBody, GET(), PATCH(), ProfilePatchBody, POST(), SnoozeBody, POST() (+6 more)

### Community 31 - "Automation Scripts"
Cohesion: 0.20
Nodes (17): assertAsset(), campaignUrl(), checks, config, defaults, eventPayload(), extractWhatsappLinks(), fetchJson() (+9 more)

### Community 32 - "Backend Feature Slice"
Cohesion: 0.23
Nodes (16): externalOrderId(), POST(), B2bOrderPayload, buildFollowupDraft(), buildFollowupDraftAsync(), createMedusaDraftOrder(), customerInputFromPayload(), customerNameParts() (+8 more)

### Community 33 - "Tools Feature Slice"
Cohesion: 0.21
Nodes (16): addDays(), boolFromText(), buildFollowupAction(), buildFollowupDraft(), CustomerEventPayload, followupPriority(), followupReason(), ImportCustomer (+8 more)

### Community 34 - "Backend Feature Slice"
Cohesion: 0.12
Nodes (17): dependencies, @medusajs/admin-shared, @medusajs/caching, @medusajs/draft-order, @medusajs/framework, @medusajs/ui, react-i18next, react-router-dom (+9 more)

### Community 35 - "CRM Feature Slice"
Cohesion: 0.14
Nodes (16): buttonStyle, cardStyle, Column, columnContainerStyle, columnHeaderStyle, COLUMNS, config, CustomerCard() (+8 more)

### Community 36 - "CRM Feature Slice"
Cohesion: 0.21
Nodes (11): ImportBody, POST(), GET(), GET(), PATCH(), POST(), GET(), isPaidStatus() (+3 more)

### Community 37 - "Automation Scripts"
Cohesion: 0.12
Nodes (11): checks, dirtyOwnerDecision, dirtyPaths, dirtyRequired, failures, ownerDecisionPaths, requiredAssets, requiredFiles (+3 more)

### Community 38 - "Tools Feature Slice"
Cohesion: 0.21
Nodes (18): buildCheckoutForm(), buildVoidForm(), computeIva(), createDatafastCheckout(), DatafastCartItem, DatafastCheckout, DatafastCheckoutInput, DatafastCustomer (+10 more)

### Community 39 - "Tools Feature Slice"
Cohesion: 0.12
Nodes (18): demoCatalog, kitchenCatalog, kitchenDefaults, wellnessCatalog, wellnessDefaults, wellnessProducts, buildQuote(), formatUsd() (+10 more)

### Community 40 - "CRM Feature Slice"
Cohesion: 0.19
Nodes (10): boolParam(), GET(), ImportBody, VALID_RFM_SEGMENTS, calculateRfmFromProfile(), RFM_THRESHOLDS, RfmInput, RfmScore (+2 more)

### Community 41 - "Tools Feature Slice"
Cohesion: 0.13
Nodes (14): node, src/**/*.ts, compilerOptions, esModuleInterop, module, moduleResolution, outDir, resolveJsonModule (+6 more)

### Community 42 - "Storefront Feature Slice"
Cohesion: 0.26
Nodes (12): CheckoutButton(), CheckoutButtonProps, CartItem, defaultOpeningLine(), generateCartMessage(), isKitchenComplement(), isKnifeProduct(), normalizeWhatsappSellerNumber() (+4 more)

### Community 43 - "Automation Scripts"
Cohesion: 0.21
Nodes (11): csvValue(), frontendKitchenArray(), frontendWellnessArray(), kitchenProducts, root, seedProductsArray(), toolsKitchenArray(), toolsWellnessArray() (+3 more)

### Community 44 - "CRM Feature Slice"
Cohesion: 0.18
Nodes (12): buttonStyle, cardStyle, cellStyle, config, CustomerDetail, CustomerEvent, formatDate(), inputStyle (+4 more)

### Community 45 - "CRM Feature Slice"
Cohesion: 0.17
Nodes (12): buttonStyle, cardStyle, cellStyle, config, formatDate(), inputStyle, tableStyle, TemplateRow (+4 more)

### Community 46 - "CRM Feature Slice"
Cohesion: 0.31
Nodes (12): argValue(), backupTable(), countRows(), CRM_TABLES, csvCell(), hasArg(), main(), quoteIdentifier() (+4 more)

### Community 47 - "Tools Feature Slice"
Cohesion: 0.13
Nodes (17): addMedusaCustomerEvent(), attachMedusaPaymentLink(), authHeader(), createMedusaOrder(), forwardPayphoneWebhook(), getMedusaCustomer(), getMedusaDashboard(), getMedusaOrder() (+9 more)

### Community 48 - "CRM Feature Slice"
Cohesion: 0.23
Nodes (11): cardStyle, cellStyle, Config, CrmRecompraPage(), formatDate(), formatMoney(), formatMonth(), formatPercent() (+3 more)

### Community 49 - "Storefront Feature Slice"
Cohesion: 0.42
Nodes (9): POST(), clientIp(), hits, medusaUrl(), rateLimited(), reviewsToken(), EMPTY, GET() (+1 more)

### Community 50 - "Storefront Feature Slice"
Cohesion: 0.30
Nodes (11): firstAvailable(), followupSequence, money(), optionValue(), PotRecommendationQuiz(), productBySku(), randomLeadId(), reasonFor() (+3 more)

### Community 51 - "Backend Feature Slice"
Cohesion: 0.18
Nodes (11): scripts, build, dev, seed, seed:kitchen, seed:wellness, start, test:integration:http (+3 more)

### Community 52 - "CRM Feature Slice"
Cohesion: 0.25
Nodes (10): cardStyle, cellStyle, config, CrmCustomerRow, CrmWhatsappPage(), Dashboard, formatDate(), money() (+2 more)

### Community 53 - "Backend Feature Slice"
Cohesion: 0.45
Nodes (9): config, daysUntilNextCampaign(), getCampaignDate(), getNextSeasonalCampaign(), scheduleSeasonalFollowupsJob(), SEASONAL_CAMPAIGNS, SeasonalCampaign, shouldScheduleCustomerForSeasonal() (+1 more)

### Community 54 - "Backend Feature Slice"
Cohesion: 0.24
Nodes (8): commercialMetadata, ensureCategories(), kitchenCatalogSeed(), KitchenProduct, kitchenPublicUrl, legacyKitchenHandles, products, updateVariantInput()

### Community 55 - "Automation Scripts"
Cohesion: 0.24
Nodes (9): blockingReasons, config, gitState(), gitValue(), parseJson(), publicFlow, releasePackage, report (+1 more)

### Community 56 - "Backend Feature Slice"
Cohesion: 0.22
Nodes (8): author, description, engines, node, license, name, packageManager, version

### Community 57 - "Storefront Feature Slice"
Cohesion: 0.15
Nodes (18): TrustGrid(), WellnessFaq(), TrustRow(), CampaignAnalytics(), CampaignAttribution, CampaignContext, CampaignStickyCta(), CampaignWhatsAppPanel() (+10 more)

### Community 58 - "Storefront Feature Slice"
Cohesion: 0.28
Nodes (6): CustomerReviews(), CustomerReviewsProps, Review, ReviewCard(), ReviewForm(), ReviewFormProps

### Community 59 - "Storefront Feature Slice"
Cohesion: 0.21
Nodes (12): broadcastSchema, GET(), POST(), POST(), GET(), predictedMode(), buildFollowupMessage(), isWithinSendWindow() (+4 more)

### Community 60 - "Storefront Feature Slice"
Cohesion: 0.28
Nodes (8): brandHosts, cleanHost(), config, kitchenHosts, legacyHostTargets, middleware(), wellnessHosts, withoutPrefix()

### Community 61 - "Cart Modal And"
Cohesion: 0.22
Nodes (9): Cart Modal And Drawer Browser Compatibility, Cross Browser Testing Report, Manual Safari And Chrome Device Testing, Test Data Calculation Error, WhatsApp Multi Product Message Testing, Storefront Build Verification, Manual Testing Pending, Release Branch (+1 more)

### Community 62 - "GenerateCartMessage"
Cohesion: 0.22
Nodes (9): generateCartMessage, Real WhatsApp Message Testing, Vicky Format Validation, whatsappCartLink, Ecommerce Sales OpenAI Agent, Buyer Context Lookup, Ecommerce Sales Skill, Product Search (+1 more)

### Community 63 - "Backend Feature Slice"
Cohesion: 0.32
Nodes (7): commercialMetadata, ensureCategories(), legacyWellnessHandles, products, updateVariantInput(), wellnessCatalogSeed(), WellnessProduct

### Community 64 - "Storefront Feature Slice"
Cohesion: 0.36
Nodes (8): absoluteImageLink(), baseUrlForVertical(), csv(), fallbackCsv(), GET(), verticalFromRequest(), fallbackProducts, wellnessFallbackProducts

### Community 65 - "Storefront Feature Slice"
Cohesion: 0.25
Nodes (4): CheckoutResponse, EMPTY, Form, PagoTarjetaPage()

### Community 66 - "Order Creation"
Cohesion: 0.25
Nodes (8): Order Creation, PayPhone Link Generation, PayPhone Reconciliation OpenAI Agent, Client Transaction Match, Payment Human Review Handoff, Payment Status Rules, PayPhone Reconciliation Skill, PayPhone Webhook

### Community 67 - "Backend Feature Slice"
Cohesion: 0.29
Nodes (7): keywords, ecommerce, headless, medusa, postgres, sqlite, typescript

### Community 68 - "Storefront Feature Slice"
Cohesion: 0.22
Nodes (8): engines, node, name, overrides, ajv, packageManager, private, version

### Community 69 - "Project Documentation"
Cohesion: 0.29
Nodes (7): Business Initiated Conversations, Meta Official WhatsApp Business Platform, WABA Credentials, Meta Marketplace OpenAI Agent, Meta Catalog Feed, Meta Marketplace Assistant Skill, WhatsApp Conversion Path

### Community 70 - "Project Documentation"
Cohesion: 0.29
Nodes (7): Smart WhatsApp Channel Selector, Cloud API Free Form Reply, Dispatcher Meta Mode, Meta Approved Templates, 24 Hour Service Window, WhatsApp Messaging Guardrails, Marketplace Human Approval Boundary

### Community 71 - "Storefront Feature Slice"
Cohesion: 0.29
Nodes (6): Checklist de código, Corte a tarjeta real, Go-Live Eter Niu, Objetivo, Validación pública, Variables Coolify mínimas

### Community 72 - "Storefront Feature Slice"
Cohesion: 0.29
Nodes (7): devDependencies, pg, prettier, turbo, turbo, pg, prettier

### Community 73 - "Storefront Feature Slice"
Cohesion: 0.29
Nodes (5): PrivacyConsent(), fraunces, inter, metadata, CartProvider()

### Community 74 - "Storefront Feature Slice"
Cohesion: 0.40
Nodes (4): Commands, Current Scope, Graphify, Outputs

### Community 75 - "Project Documentation"
Cohesion: 0.33
Nodes (6): CONV Timeline Events, Hybrid WhatsApp Architecture, Vicky OpenClaw Conversation Brain, WhatsApp Cloud API Plan, WhatsApp Webhook, Customer And Web Events

### Community 76 - "Add To Cart"
Cohesion: 0.40
Nodes (6): Add To Cart Lead Event, Event ID Deduplication, Initiate Checkout Event, Meta Pixel Events Validation, Meta Pixel Helper Manual Testing, Meta Post Draft Endpoint

### Community 77 - "Code Splitting"
Cohesion: 0.40
Nodes (5): Route Code Splitting, Layout Shift Prevention, Lighthouse Manual Audit, Next.js Image Optimization, Performance Audit Report

### Community 78 - "Automation Scripts"
Cohesion: 0.60
Nodes (4): generateAuditReport(), getProductCategory(), printAuditReport(), WELLNESS_REORDER_ADJUSTMENTS

### Community 82 - "Storefront Feature Slice"
Cohesion: 0.83
Nodes (3): clientIp(), POST(), toolsUrl()

### Community 83 - "Storefront Feature Slice"
Cohesion: 0.83
Nodes (3): clientIp(), POST(), toolsUrl()

### Community 84 - "Backend Feature Slice"
Cohesion: 0.67
Nodes (3): xlsx, readWorkbook(), xlsx

### Community 88 - "Backend Feature Slice"
Cohesion: 0.40
Nodes (5): workspaces, apps/**, !apps/backend/.medusa/**, !apps/storefront/.next/**, services/**

### Community 90 - "Backend Feature Slice"
Cohesion: 0.47
Nodes (5): FormState, LeadCaptureForm(), ProductOption, randomLeadId(), skuFromInterest()

### Community 107 - "meta.ts"
Cohesion: 0.70
Nodes (4): buildMetaCatalogCsv(), buildMetaDraft(), csv(), withUtm()

### Community 110 - "cart-bag-button.tsx"
Cohesion: 0.40
Nodes (3): CartBadge(), CartBadgeProps, CartBagButton()

### Community 111 - "video-stories.tsx"
Cohesion: 0.40
Nodes (4): StoryItem, VideoStories(), STORIES, VideoStoriesDemo()

## Knowledge Gaps
- **542 isolated node(s):** `{ loadEnv }`, `name`, `version`, `description`, `author` (+537 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `readWorkbook()` connect `Backend Feature Slice` to `Lead Import Admin`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Backend Feature Slice` to `@medusajs/admin-sdk`, `@medusajs/cli`, `Backend Feature Slice`, `Backend Feature Slice`, `Backend Feature Slice`, `Backend Feature Slice`, `Backend Feature Slice`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Why does `xlsx` connect `Backend Feature Slice` to `Backend Feature Slice`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **What connects `{ loadEnv }`, `name`, `version` to the rest of the system?**
  _542 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `B2B CRM Models` be split into smaller, more focused modules?**
  _Cohesion score 0.05775638652350981 - nodes in this community are weakly interconnected._
- **Should `Agent Governance` be split into smaller, more focused modules?**
  _Cohesion score 0.05656565656565657 - nodes in this community are weakly interconnected._
- **Should `Tools Contracts` be split into smaller, more focused modules?**
  _Cohesion score 0.06561085972850679 - nodes in this community are weakly interconnected._