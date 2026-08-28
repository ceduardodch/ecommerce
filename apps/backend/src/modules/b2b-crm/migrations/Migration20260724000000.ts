import { Migration } from "@mikro-orm/migrations"

export class Migration20260724000000 extends Migration {

  async up(): Promise<void> {
    this.addSql('ALTER TABLE IF EXISTS "crm_message_template" ADD COLUMN IF NOT EXISTS "label" TEXT NULL;')
    this.addSql('ALTER TABLE IF EXISTS "crm_message_template" ADD COLUMN IF NOT EXISTS "media_url" TEXT NULL;')
    this.addSql('ALTER TABLE IF EXISTS "crm_message_template" ADD COLUMN IF NOT EXISTS "media_type" TEXT NULL;')
  }

  async down(): Promise<void> {
    this.addSql('ALTER TABLE IF EXISTS "crm_message_template" DROP COLUMN IF EXISTS "label";')
    this.addSql('ALTER TABLE IF EXISTS "crm_message_template" DROP COLUMN IF EXISTS "media_url";')
    this.addSql('ALTER TABLE IF EXISTS "crm_message_template" DROP COLUMN IF EXISTS "media_type";')
  }
}
