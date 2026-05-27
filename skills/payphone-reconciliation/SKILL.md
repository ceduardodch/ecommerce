---
name: payphone-reconciliation
description: PayPhone payment-link reconciliation workflow for the B2B ecommerce stack. Use when an agent must verify a PayPhone payment notification, match a clientTransactionId to an ecommerce order, update payment status, explain pending-payment states, or prepare a human-review reconciliation summary.
---

# Payphone Reconciliation

## Overview

Use this skill to keep payment status conservative and auditable. A buyer saying "ya pague" is not enough; reconcile against PayPhone notification data or a human-reviewed PayPhone Business record.

## Workflow

1. Identify the order id, payment link, or `clientTransactionId`.
2. If handling a PayPhone notification, call `POST /webhooks/payphone` with the raw payload.
3. If there is no matching order, return `unmatched` and escalate to human review.
4. If the order status becomes `paid`, tell the seller the order is ready for dispatch review.
5. If status is `payment_review` or `pending_payment`, do not promise delivery. Ask for human confirmation or wait for PayPhone evidence.

## Status Rules

- `pending_payment`: link was generated but no payment confirmation is matched.
- `paid`: payment notification matched and status is accepted by the tools service.
- `payment_review`: notification was received but status is unclear or not approved.
- `unmatched`: notification cannot be linked to a known order.

## Tool Contract

Use the base URL from `ECOMMERCE_TOOLS_BASE_URL`. If `ECOMMERCE_TOOLS_TOKEN` exists, send it as `Authorization: Bearer <token>`.

Webhook endpoint:

```json
POST /webhooks/payphone
{
  "clientTransactionId": "B2BMPNGTZ08",
  "statusCode": "3",
  "transactionId": "123456",
  "amount": 13685
}
```

The tools service currently treats common approved/success statuses as paid and all other matched statuses as review.

## Human Handoff

When escalating, include:

- Order id
- Client transaction id
- Expected total
- Reported PayPhone transaction id
- Current system status
- Missing evidence or mismatch reason
