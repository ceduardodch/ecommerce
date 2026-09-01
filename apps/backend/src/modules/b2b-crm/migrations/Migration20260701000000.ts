import { Migration } from "@medusajs/framework/mikro-orm/migrations"

/**
 * Crea `product_review`, la tabla que le faltaba a la cadena de migraciones.
 *
 * `Migration20260702000000` crea índices sobre `product_review`, pero ninguna
 * migración creaba la tabla: en producción existe (se materializó por otra vía),
 * así que el fallo estaba latente. Sobre una base nueva la cadena se rompía en
 * seco con `relation "product_review" does not exist`, y con ella TODAS las
 * migraciones del módulo — MikroORM las aplica en una transacción.
 *
 * Va fechada antes de la 20260702 para que en una base nueva corra primero.
 * En producción entra como pendiente y no hace nada, porque todo es
 * `IF NOT EXISTS` y la tabla ya está.
 */
export class Migration20260701000000 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table if not exists "product_review" (' +
        '"id" text not null, ' +
        '"product_id" text not null, ' +
        '"product_sku" text not null, ' +
        '"customer_phone" text not null, ' +
        '"customer_name" text not null, ' +
        '"rating" integer not null, ' +
        '"title" text not null, ' +
        '"content" text not null, ' +
        '"photos" jsonb null, ' +
        '"verified_purchase" boolean not null default true, ' +
        '"helpful_count" integer not null default 0, ' +
        '"created_at" timestamptz not null default now(), ' +
        '"updated_at" timestamptz not null default now(), ' +
        '"deleted_at" timestamptz null, ' +
        'constraint "product_review_pkey" primary key ("id"));',
    )
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "product_review" cascade;')
  }
}
