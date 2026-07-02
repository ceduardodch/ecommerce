import { Migration } from "@mikro-orm/migrations"

export class Migration20260702000000 extends Migration {

  async up(): Promise<void> {
    this.addSql('CREATE INDEX IF NOT EXISTS "IDX_product_review_product_id" ON "product_review" (product_id) WHERE deleted_at IS NULL;')
    this.addSql('CREATE INDEX IF NOT EXISTS "IDX_product_review_customer_phone" ON "product_review" (customer_phone) WHERE deleted_at IS NULL;')
    this.addSql('CREATE INDEX IF NOT EXISTS "IDX_product_review_rating" ON "product_review" (rating) WHERE deleted_at IS NULL;')
    this.addSql('CREATE INDEX IF NOT EXISTS "IDX_product_review_created_at" ON "product_review" (created_at) WHERE deleted_at IS NULL;')
  }

  async down(): Promise<void> {
    this.addSql('DROP INDEX IF EXISTS "IDX_product_review_product_id";')
    this.addSql('DROP INDEX IF EXISTS "IDX_product_review_customer_phone";')
    this.addSql('DROP INDEX IF EXISTS "IDX_product_review_rating";')
    this.addSql('DROP INDEX IF EXISTS "IDX_product_review_created_at";')
  }
}
