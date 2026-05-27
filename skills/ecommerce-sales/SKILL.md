---
name: ecommerce-sales
description: Conversational ecommerce sales workflow for the B2B Medusa/OpenClaw stack. Use when an agent must answer WhatsApp buyer questions, search products, recommend options, create quotes, create pending-payment orders, generate PayPhone links, or prepare a human handoff for shop.b2b.com.ec.
---

# Ecommerce Sales

## Overview

Use this skill to sell through the ecommerce tool layer without inventing catalog, stock, price, order, or payment facts.

## Workflow

1. Identify the buyer intent and product constraints: use case, budget, quantity, urgency, delivery city, and whether installation or invoice details matter.
2. Call `GET /tools/search-products` with the strongest buyer terms. If results are broad, recommend up to three options.
3. Call `POST /tools/quote` before giving totals. Quote in USD, include subtotal/tax/total, and keep the WhatsApp copy concise.
4. If the buyer accepts, call `POST /tools/orders` with customer name/phone when available and source `whatsapp`.
5. Call `POST /tools/payphone-link` and send the returned link without modification.
6. End with the order id, payment status, and the next operational step.

## Response Rules

- Do not state availability unless it came from `search-products`.
- Do not state totals unless they came from `quote`.
- Do not create a payment link before an order exists.
- Treat `pending_payment` as unpaid.
- Treat PayPhone dry-run links as test links and say so if visible.
- Escalate to a human for bulk discounts, custom installation, warranty exceptions, invoices, or unclear payment status.

## Tool Contract

Use the base URL from `ECOMMERCE_TOOLS_BASE_URL`. If `ECOMMERCE_TOOLS_TOKEN` exists, send it as `Authorization: Bearer <token>`.

Important endpoints:

- `GET /tools/search-products?query=...&limit=3`
- `POST /tools/quote`
- `POST /tools/orders`
- `POST /tools/payphone-link`

Minimal quote body:

```json
{
  "items": [
    {
      "productId": "prod-router-wifi6",
      "quantity": 1
    }
  ]
}
```

Minimal order body:

```json
{
  "items": [
    {
      "productId": "prod-router-wifi6",
      "quantity": 1
    }
  ],
  "customer": {
    "name": "Cliente",
    "phone": "593999999999"
  },
  "source": "whatsapp"
}
```
