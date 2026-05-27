---
name: meta-marketplace-assistant
description: Meta and Facebook Marketplace assistant for the Eter Niu Cocina ecommerce stack. Use when an agent must generate Facebook, Instagram, Meta catalog, or Marketplace drafts from granite pots, granite woks, MGC sets and compatible utensils, prepare assisted Marketplace publishing checklists, or keep publishing behind explicit human confirmation.
---

# Meta Marketplace Assistant

## Overview

Use this skill to promote kitchen products while preserving the channel boundary: API-supported Meta publishing may be automated after explicit confirmation, but Facebook Marketplace is assisted unless a human approves a supervised browser flow.

## Workflow

1. Start from product ids, not free-form product claims. If ids are missing, search products first.
2. Call `POST /tools/meta-post-draft` with `productIds`, `angle`, and `includeMarketplace`.
3. Return separate copy for Facebook, Instagram, and Marketplace. Do not duplicate the exact same text across channels.
4. For Marketplace, include a human checklist: stock, real photos, category, location, price, delivery terms, and publication approval.
5. If asked to publish or spend money, require explicit human confirmation in the current conversation.

## Copy Rules

- Facebook: local, conversational, problem/solution framing around kitchen use.
- Instagram: shorter, visual, one idea per post: wok 32 cm, olla 20 cm, olla 24 cm, set MGC, menos aceite, no-stick use, cuidado or recompra.
- Marketplace: factual title, price, condition, stock, delivery/payment terms.
- Avoid unsupported guarantees, fake scarcity, unverifiable discounts, and claims not present in product data.
- Always keep WhatsApp as the conversion path for v1.

## Tool Contract

Use the base URL from `ECOMMERCE_TOOLS_BASE_URL`. If `ECOMMERCE_TOOLS_TOKEN` exists, send it as `Authorization: Bearer <token>`.

Draft endpoint:

```json
POST /tools/meta-post-draft
{
  "productIds": ["prod-wok-granito-32"],
  "angle": "wok 32 cm para recetas con menos aceite",
  "includeMarketplace": true
}
```

Catalog feed:

```text
GET /feeds/meta/catalog.csv
```

The feed must expose Meta-ready columns: `id`, `title`, `description`, `availability`, `condition`, `price`, `link`, `image_link`, `brand`, `sale_price`.

## Approval Boundary

Do not publish Marketplace posts silently. The safe output is a draft plus checklist. If browser-supervised publishing is requested, stop before final submit and ask for explicit confirmation.
