# Eter Niu Cocina AI Native Ecommerce Architecture

This project is a conversational kitchen-commerce stack for `shop.b2b.com.ec`.

## Runtime shape

- `apps/backend`: Medusa v2 commerce core for catalog, admin, inventory, orders, customers, and future commerce workflows.
- `apps/storefront`: Next.js public catalog optimized for WhatsApp-first kitchen purchase intent.
- `services/ecommerce-tools`: HTTP and MCP tool layer consumed by OpenClaw. It searches Medusa products, quotes, creates Medusa-backed conversational orders, creates PayPhone links, receives payment notifications, emits Meta catalog CSV, and drafts Meta/Marketplace copy.
- `apps/backend/src/modules/b2b-crm`: Medusa CRM module for WhatsApp customer profiles, events, due followups, and conversational order traceability.
- `docker-compose.yml`: Coolify-ready stack with PostgreSQL, Redis, Medusa, storefront, and tools service.

## Request flow

1. A buyer asks about a product in WhatsApp.
2. OpenClaw looks up the customer by phone and searches kitchen products before recommending.
3. OpenClaw creates a quote; the quote event is recorded in Medusa CRM when a phone exists.
4. If the buyer agrees, `ecommerce-tools` asks Medusa to create a draft order plus a linked conversational order record.
5. PayPhone link generation stores transaction data on the Medusa CRM order record.
6. Payment confirmation updates the conversational order, records a paid CRM event, and schedules consent-based recompra/followup.
7. Medusa Admin exposes `/app/crm-whatsapp` for leads, pending orders and due followups.

## Channel boundaries

- WhatsApp is handled by OpenClaw, not by WhatsApp Cloud API in v1.
- Facebook/Instagram organic publishing should reuse the existing B2B social scripts, with explicit confirmation before publishing or spending.
- Facebook Marketplace remains assisted: the system drafts copy and assets, then a human or supervised browser flow publishes.
- CRM followups are consent-aware. Without consent or an active conversation window, the safe lane is human-approved/manual outreach until the WhatsApp Cloud API template flow exists.
