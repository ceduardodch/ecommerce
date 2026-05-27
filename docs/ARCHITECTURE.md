# B2B AI Native Ecommerce Architecture

This project is a conversational ecommerce stack for `shop.b2b.com.ec`.

## Runtime shape

- `apps/backend`: Medusa v2 commerce core for catalog, admin, inventory, orders, customers, and future commerce workflows.
- `apps/storefront`: Next.js public catalog optimized for WhatsApp-first purchase intent.
- `services/ecommerce-tools`: HTTP and MCP tool layer consumed by OpenClaw. It searches products, quotes, creates conversational orders, creates PayPhone links, receives payment notifications, emits Meta catalog CSV, and drafts Meta/Marketplace copy.
- `docker-compose.yml`: Coolify-ready stack with PostgreSQL, Redis, Medusa, storefront, and tools service.

## Request flow

1. A buyer asks about a product in WhatsApp.
2. OpenClaw calls `ecommerce-tools` to search products and create a quote.
3. If the buyer agrees, OpenClaw creates a conversational order and asks `ecommerce-tools` for a PayPhone link.
4. Payment confirmation is recorded through `/webhooks/payphone` if external notification is enabled, or by manual reconciliation from PayPhone Business.
5. The order stays traceable through the tools event log and is ready to be mirrored into Medusa workflows as the integration matures.

## Channel boundaries

- WhatsApp is handled by OpenClaw, not by WhatsApp Cloud API in v1.
- Facebook/Instagram organic publishing should reuse the existing B2B social scripts, with explicit confirmation before publishing or spending.
- Facebook Marketplace remains assisted: the system drafts copy and assets, then a human or supervised browser flow publishes.
