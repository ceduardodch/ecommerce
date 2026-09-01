---
name: ecommerce-sales
description: Conversational healthy kitchen ecommerce sales workflow for the Medusa/OpenClaw stack. Use when an agent must answer WhatsApp buyer questions, search products, use CRM context, recommend granite pots/woks/sets, create quotes, create pending-payment orders, close payments by bank transfer or Datafast card, schedule followups, or prepare a human handoff for shop.b2b.com.ec.
---

# Ecommerce Sales

## Overview

Use this skill to sell kitchen products through the ecommerce tool layer without inventing catalog, stock, price, customer history, order, consent, or payment facts.

## Workflow

1. Identify the buyer intent and product constraints: family size, 20 cm vs 24 cm vs wok 32 cm, less oil, no-stick use, replacement, material, budget, quantity, urgency, delivery city, and invoice needs.
2. If the phone is known, call `GET /tools/ai-context/customer/:phone` before recommending. If the inbound WhatsApp text starts with `Hola, quiero la olla de granito ...` or includes `Lead`, `ProductoID`, `Variante`, `SKU`, `cupon`, `envio gratis`, payment or compatibility data, pass it as `?leadId=<Lead>` to recover quiz, video, guide and product intent.
3. Call `GET /tools/search-products` with the strongest kitchen terms. If results are broad, recommend up to three options.
4. Call `POST /tools/quote` before giving totals. Include customer phone when available so CRM records `quote_created`.
5. If the buyer accepts, call `POST /tools/orders` with customer name/phone and source `whatsapp`.
6. Call `GET /tools/payment-methods` and close the payment: dictate the transfer account from that response, or build the card cart with `POST /tools/whatsapp-cart-sessions` and send that link. Never dictate a bank account from memory.
7. Register manual events with `POST /tools/customer-events` for no-response, escalation, opt-out, `payment_proof_received` or explicit recompra interest. Web/social events use `POST /tools/events` with `journeyStage`, `householdPeople`, `city`, `videoSlot`, `productInterestSku`, `recommendedSku`, `couponClaimed`, `freeShippingShown`, `paymentMethodsShown`, `stoveCompatibilityShown` and `followupSequence` when available.
8. End with order id, payment status, CRM event/followup date, and next operational step.

## Response Rules

- Do not state availability unless it came from `search-products`.
- Do not state totals unless they came from `quote`.
- Do not refer to prior purchases unless they came from `get_customer`.
- Do not create a payment link before an order exists.
- Offer exactly two payment methods: bank transfer (Banco Pichincha) and card through Datafast. Never offer cash on delivery, deuna! or PayPhone.
- Prepay always: the order ships after the payment is confirmed. Never promise "pagas al recibir".
- Treat `pending_payment` as unpaid.
- Treat transfer screenshots as `payment_proof_received` and human review, not as paid.
- Treat Datafast dry-run checkouts as test links and say so if visible.
- Escalate to a human for bulk discounts, custom installation, warranty exceptions, invoices, or unclear payment status.
- For outbound followup, send only with consent or active conversation; otherwise prepare a human-approved message.

## Tool Contract

Use the base URL from `ECOMMERCE_TOOLS_BASE_URL`. If `ECOMMERCE_TOOLS_TOKEN` exists, send it as `Authorization: Bearer <token>`.

Important endpoints:

- `GET /tools/search-products?query=...&limit=3`
- `GET /tools/ai-context/customer/:phone?leadId=...`
- `GET /tools/customers/:phone`
- `POST /tools/quote`
- `POST /tools/orders`
- `GET /tools/payment-methods`
- `POST /tools/whatsapp-cart-sessions`
- `POST /tools/customer-events`
- `GET /tools/followups/due`
- `GET /tools/dashboard`

Minimal quote body:

```json
{
  "items": [
    {
      "productId": "prod-wok-granito-32",
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
      "productId": "prod-wok-granito-32",
      "quantity": 1
    }
  ],
  "customer": {
    "name": "Cliente",
    "phone": "0979854915",
    "whatsappConsent": true
  },
  "source": "whatsapp"
}
```
