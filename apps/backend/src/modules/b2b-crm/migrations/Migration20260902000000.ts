import { Migration } from "@mikro-orm/migrations"

export class Migration20260902000000 extends Migration {
  async up(): Promise<void> {
    this.addSql('create table if not exists "crm_setting" ("id" text not null, "key" text not null, "value" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "crm_setting_pkey" primary key ("id"));')
    this.addSql('create unique index if not exists "IDX_crm_setting_key_unique" on "crm_setting" ("key") where deleted_at is null;')
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "crm_setting" cascade;')
  }
}
