import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260527000000 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table if not exists "crm_customer_profile" ("id" text not null, "phone" text not null, "name" text null, "email" text null, "medusa_customer_id" text null, "whatsapp_consent" boolean not null default false, "tags" text[] not null default \'{}\', "last_purchase_at" timestamptz null, "purchased_products" jsonb null, "suggested_frequency_days" numeric null, "next_followup_at" timestamptz null, "followup_reason" text null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "crm_customer_profile_pkey" primary key ("id"));',
    )
    this.addSql(
      'create unique index if not exists "IDX_crm_customer_profile_phone_unique" on "crm_customer_profile" ("phone") where deleted_at IS NULL;',
    )
    this.addSql(
      'create index if not exists "IDX_crm_customer_profile_next_followup" on "crm_customer_profile" ("next_followup_at") where deleted_at IS NULL;',
    )

    this.addSql(
      'create table if not exists "crm_customer_event" ("id" text not null, "phone" text not null, "type" text not null, "at" timestamptz not null, "quote_id" text null, "order_id" text null, "medusa_order_id" text null, "source" text null, "payload" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "crm_customer_event_pkey" primary key ("id"));',
    )
    this.addSql(
      'create index if not exists "IDX_crm_customer_event_phone_at" on "crm_customer_event" ("phone", "at") where deleted_at IS NULL;',
    )
    this.addSql(
      'create index if not exists "IDX_crm_customer_event_type" on "crm_customer_event" ("type") where deleted_at IS NULL;',
    )

    this.addSql(
      'create table if not exists "conversational_order" ("id" text not null, "external_id" text not null, "quote_id" text null, "phone" text null, "status" text not null, "medusa_order_id" text null, "medusa_draft_order_id" text null, "payment_link" text null, "client_transaction_id" text null, "total_amount" numeric null, "currency_code" text not null default \'usd\', "quote" jsonb null, "customer" jsonb null, "events" jsonb null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "conversational_order_pkey" primary key ("id"));',
    )
    this.addSql(
      'create unique index if not exists "IDX_conversational_order_external_unique" on "conversational_order" ("external_id") where deleted_at IS NULL;',
    )
    this.addSql(
      'create index if not exists "IDX_conversational_order_client_tx" on "conversational_order" ("client_transaction_id") where deleted_at IS NULL;',
    )
    this.addSql(
      'create index if not exists "IDX_conversational_order_status" on "conversational_order" ("status") where deleted_at IS NULL;',
    )
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "conversational_order" cascade;')
    this.addSql('drop table if exists "crm_customer_event" cascade;')
    this.addSql('drop table if exists "crm_customer_profile" cascade;')
  }
}
