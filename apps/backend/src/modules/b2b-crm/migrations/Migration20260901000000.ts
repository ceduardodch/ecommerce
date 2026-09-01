import { Migration } from "@mikro-orm/migrations"

export class Migration20260901000000 extends Migration {
  async up(): Promise<void> {
    this.addSql('create table if not exists "crm_conversation" ("id" text not null, "phone" text not null, "channel" text not null default \'whatsapp\', "status" text not null default \'new\', "mode" text not null default \'ai\', "assigned_user_id" text null, "assigned_user_name" text null, "unread_count" integer not null default 0, "last_message_at" timestamptz null, "last_inbound_at" timestamptz null, "closed_at" timestamptz null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "crm_conversation_pkey" primary key ("id"));')
    this.addSql('create unique index if not exists "IDX_crm_conversation_phone_channel_unique" on "crm_conversation" ("phone", "channel") where deleted_at is null;')
    this.addSql('create index if not exists "IDX_crm_conversation_queue" on "crm_conversation" ("status", "last_message_at") where deleted_at is null;')
    this.addSql('create table if not exists "crm_conversation_message" ("id" text not null, "conversation_id" text not null, "meta_message_id" text null, "direction" text not null, "sender_type" text not null default \'customer\', "sender_user_id" text null, "text" text null, "media_type" text null, "media_path" text null, "media_name" text null, "media_mime_type" text null, "media_size" integer null, "status" text not null default \'received\', "failed_reason" text null, "meta_timestamp" timestamptz null, "payload" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "crm_conversation_message_pkey" primary key ("id"));')
    this.addSql('create unique index if not exists "IDX_crm_conversation_message_meta_unique" on "crm_conversation_message" ("meta_message_id") where meta_message_id is not null and deleted_at is null;')
    this.addSql('create index if not exists "IDX_crm_conversation_message_timeline" on "crm_conversation_message" ("conversation_id", "meta_timestamp") where deleted_at is null;')
    this.addSql('create table if not exists "crm_conversation_assignment" ("id" text not null, "conversation_id" text not null, "assigned_user_id" text null, "assigned_user_name" text null, "action" text not null, "actor_user_id" text null, "actor_user_name" text null, "at" timestamptz not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "crm_conversation_assignment_pkey" primary key ("id"));')
    this.addSql('create index if not exists "IDX_crm_conversation_assignment_timeline" on "crm_conversation_assignment" ("conversation_id", "at") where deleted_at is null;')
    this.addSql('create table if not exists "crm_internal_note" ("id" text not null, "conversation_id" text not null, "body" text not null, "author_user_id" text null, "author_user_name" text null, "at" timestamptz not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "crm_internal_note_pkey" primary key ("id"));')
    this.addSql('create index if not exists "IDX_crm_internal_note_timeline" on "crm_internal_note" ("conversation_id", "at") where deleted_at is null;')
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "crm_internal_note" cascade;')
    this.addSql('drop table if exists "crm_conversation_assignment" cascade;')
    this.addSql('drop table if exists "crm_conversation_message" cascade;')
    this.addSql('drop table if exists "crm_conversation" cascade;')
  }
}
