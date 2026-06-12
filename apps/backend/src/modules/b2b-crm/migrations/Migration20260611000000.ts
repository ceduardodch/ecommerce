import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260611000000 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table if not exists "crm_message_template" ("id" text not null, "key" text not null, "body" text not null, "active" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "crm_message_template_pkey" primary key ("id"));',
    )
    this.addSql(
      'create unique index if not exists "IDX_crm_message_template_key_unique" on "crm_message_template" ("key") where deleted_at IS NULL;',
    )

    // Seeds por defecto con los textos actuales
    this.addSql(
      `insert into "crm_message_template" (id, key, body, active) values
      ('crmtpl_01', 'recompra', 'Hola {nombre}, vi que compraste {producto}. Te puedo ayudar con mantenimiento, complemento o reposicion para que sigas equipando tu cocina?', true),
      ('crmtpl_02', 'complemento', 'Hola {nombre}, ya pasaron {dias} días desde que compraste tu olla. ¿Quieres ver complementos para sacarle más provecho?', true),
      ('crmtpl_03', 'cuidado', 'Hola {nombre}, te recuerdo los consejos de cuidado para tu olla de granito: sin jabón abrasivo, con aceite en la primera cocción. ¿Necesitas ayuda?', true),
      ('crmtpl_04', 'estacional', 'Hola {nombre}, tenemos ofertas especiales por temporada. ¿Te preparo una cotización corta por WhatsApp?', true),
      ('crmtpl_05', 'cross_sell_cocina', 'Hola {nombre}, vi que te interesa el bienestar. ¿Quieres ver opciones de ollas saludables para tu cocina?', true),
      ('crmtpl_06', 'cross_sell_bienestar', 'Hola {nombre}, vi que cocinas saludable. ¿Te interesa ver nuestros productos de bienestar?', true),
      ('crmtpl_07', 'generico', 'Hola {nombre}, tenemos nuevas opciones de ollas, cuchillos y combos de cocina. Te preparo una cotizacion corta por WhatsApp?', true),
      ('crmtpl_08', 'nps', 'Hola {nombre}, ¿llegó bien tu {producto}? Del 1 al 10, ¿qué tan probable es que nos recomiendes?', true),
      ('crmtpl_09', 'referido', '¡Gracias! ¿A quién le regalamos un cupón de bienvenida? Compárteme su contacto o reenvíale nuestro número.', true)
      on conflict (key) do nothing;`,
    )
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "crm_message_template" cascade;')
  }
}
