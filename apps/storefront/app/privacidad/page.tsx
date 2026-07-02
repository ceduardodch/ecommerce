import type { Metadata } from "next"
import { brandBaseUrl } from "../../lib/domains"

export const metadata: Metadata = {
  title: "Política de Privacidad y Protección de Datos | Eter Niu",
  description:
    "Cómo Eter Niu (INFINITY IMPORTS) trata y protege tus datos personales, conforme a la Ley Orgánica de Protección de Datos Personales del Ecuador (LOPDP).",
  alternates: { canonical: `${brandBaseUrl}/privacidad` },
  robots: { index: true, follow: true },
}

// ─── Datos del responsable (editar/confirmar antes de publicar) ───
const RESPONSABLE = {
  comercial: "Eter Niu",
  razonSocial: "Viky Johanna Saavedra Puebla — INFINITY IMPORTS",
  ruc: "1715523021001",
  direccion: "Quito, Ecuador",
  email:
    process.env.NEXT_PUBLIC_PRIVACY_CONTACT_EMAIL || "carlos.diaz@b2b.com.ec",
  whatsapp: "0979854905",
  actualizacion: "30 de junio de 2026",
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-10 text-[20px] font-semibold text-white [font-family:var(--font-display)]">
      {children}
    </h2>
  )
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 text-[15px] leading-relaxed text-[#b8c2ae]">{children}</p>
}

function LI({ children }: { children: React.ReactNode }) {
  return <li className="text-[15px] leading-relaxed text-[#b8c2ae]">{children}</li>
}

export default function PrivacidadPage() {
  return (
    <main className="min-h-screen bg-[#10160e]">
      <div className="mx-auto max-w-3xl px-5 py-12">
        <a href="/" className="text-[13px] text-[#b8c2ae] underline">
          ← Volver al inicio
        </a>

        <h1 className="mt-4 text-[32px] font-medium leading-tight text-white [font-family:var(--font-display)]">
          Política de Privacidad y Protección de Datos
        </h1>
        <p className="mt-2 text-[13px] text-[#b8c2ae]">
          Última actualización: {RESPONSABLE.actualizacion}
        </p>

        <P>
          En <strong>{RESPONSABLE.comercial}</strong> respetamos y protegemos tus
          datos personales. Esta política explica qué datos recolectamos, para
          qué los usamos y qué derechos tienes, conforme a la{" "}
          <strong>
            Ley Orgánica de Protección de Datos Personales (LOPDP)
          </strong>{" "}
          del Ecuador y su Reglamento.
        </P>

        <H2>1. Responsable del tratamiento</H2>
        <ul className="mt-3 space-y-1.5">
          <LI>Nombre comercial: {RESPONSABLE.comercial}</LI>
          <LI>Razón social: {RESPONSABLE.razonSocial}</LI>
          <LI>RUC: {RESPONSABLE.ruc}</LI>
          <LI>Dirección: {RESPONSABLE.direccion}</LI>
          <LI>
            Contacto de protección de datos:{" "}
            <a className="text-[#d3fa99] underline" href={`mailto:${RESPONSABLE.email}`}>
              {RESPONSABLE.email}
            </a>{" "}
            · WhatsApp {RESPONSABLE.whatsapp}
          </LI>
        </ul>

        <H2>2. Qué datos recolectamos</H2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5">
          <LI>
            <strong>Identificación:</strong> nombres, apellidos y número de
            cédula (este último solo cuando es necesario para facturar o procesar
            un pago con tarjeta).
          </LI>
          <LI>
            <strong>Contacto:</strong> teléfono, correo electrónico y dirección
            de entrega.
          </LI>
          <LI>
            <strong>Transaccionales:</strong> productos consultados o comprados,
            historial de pedidos y referencias de pago.
          </LI>
          <LI>
            <strong>Navegación:</strong> datos técnicos y de uso del sitio
            mediante cookies y píxeles de medición (ver sección 8).
          </LI>
        </ul>
        <P>
          <strong>Importante sobre pagos con tarjeta:</strong> el cobro se procesa
          a través de la pasarela autorizada <strong>Datafast</strong>. Los datos
          de tu tarjeta (número, fecha, código) se ingresan directamente en el
          entorno seguro de Datafast y <strong>nunca</strong> se almacenan ni
          pasan por nuestros servidores.
        </P>

        <H2>3. Para qué usamos tus datos (finalidades)</H2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5">
          <LI>Procesar y entregar tus pedidos, y brindarte soporte.</LI>
          <LI>Gestionar pagos y emitir comprobantes (obligación tributaria).</LI>
          <LI>Atenderte y darte seguimiento por WhatsApp.</LI>
          <LI>
            Enviarte recordatorios de recompra, novedades u ofertas{" "}
            <strong>solo si nos diste tu consentimiento</strong> (puedes retirarlo
            cuando quieras escribiendo «BAJA»).
          </LI>
          <LI>Medir y mejorar la experiencia del sitio.</LI>
        </ul>

        <H2>4. Base legal del tratamiento</H2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5">
          <LI>
            <strong>Ejecución de un contrato:</strong> para procesar tu compra y
            entrega.
          </LI>
          <LI>
            <strong>Obligación legal:</strong> facturación y obligaciones ante el
            SRI.
          </LI>
          <LI>
            <strong>Consentimiento:</strong> para comunicaciones de marketing y
            recompra, y para cookies no esenciales.
          </LI>
          <LI>
            <strong>Interés legítimo:</strong> seguridad del sitio y prevención de
            fraude.
          </LI>
        </ul>

        <H2>5. Con quién compartimos tus datos</H2>
        <P>
          No vendemos tus datos. Los compartimos únicamente con proveedores que
          nos ayudan a operar, bajo acuerdos de confidencialidad:
        </P>
        <ul className="mt-3 list-disc space-y-1.5 pl-5">
          <LI>
            <strong>Datafast</strong> — procesamiento de pagos con tarjeta.
          </LI>
          <LI>
            <strong>Servientrega</strong> — envío y entrega de los productos.
          </LI>
          <LI>
            <strong>Meta (WhatsApp / Instagram)</strong> — comunicación contigo y
            métricas de campañas.
          </LI>
          <LI>
            Proveedores de infraestructura tecnológica que alojan el sitio.
          </LI>
        </ul>

        <H2>6. Por cuánto tiempo conservamos tus datos</H2>
        <P>
          Conservamos tus datos mientras mantengas una relación con nosotros y,
          luego, durante los plazos que exige la ley (por ejemplo, los plazos
          tributarios para comprobantes). Cuando ya no son necesarios, los
          eliminamos o anonimizamos de forma segura.
        </P>

        <H2>7. Tus derechos</H2>
        <P>
          Como titular de los datos, la LOPDP te garantiza los derechos de:
        </P>
        <ul className="mt-3 list-disc space-y-1.5 pl-5">
          <LI><strong>Acceso</strong> — saber qué datos tuyos tratamos.</LI>
          <LI><strong>Rectificación</strong> — corregir datos inexactos.</LI>
          <LI><strong>Eliminación</strong> — pedir que borremos tus datos.</LI>
          <LI><strong>Oposición</strong> — oponerte a ciertos tratamientos.</LI>
          <LI><strong>Portabilidad</strong> — recibir tus datos en formato estructurado.</LI>
          <LI><strong>Limitación</strong> del tratamiento.</LI>
          <LI>
            No ser objeto de <strong>decisiones automatizadas</strong> con efectos
            significativos.
          </LI>
        </ul>
        <P>
          Para ejercerlos, escríbenos a{" "}
          <a className="text-[#d3fa99] underline" href={`mailto:${RESPONSABLE.email}`}>
            {RESPONSABLE.email}
          </a>{" "}
          o por WhatsApp al {RESPONSABLE.whatsapp}. Responderemos en el plazo que
          establece la LOPDP (hasta 15 días, prorrogables por la complejidad de la
          solicitud).
        </P>

        <H2>8. Cookies y tecnologías de medición</H2>
        <P>
          Usamos cookies y píxeles (incluido el píxel de Meta) para que el sitio
          funcione, recordar tu carrito y medir el rendimiento de nuestras
          campañas. Puedes administrar o bloquear las cookies desde la
          configuración de tu navegador. Si bloqueas las esenciales, algunas
          funciones (como el carrito) podrían no operar correctamente.
        </P>

        <H2>9. Seguridad</H2>
        <P>
          Aplicamos medidas técnicas y organizativas razonables para proteger tus
          datos. El sitio opera bajo conexión cifrada (HTTPS) y los pagos se
          procesan en el entorno seguro y certificado de la pasarela.
        </P>

        <H2>10. Autoridad de control</H2>
        <P>
          Si consideras que no hemos atendido bien tu solicitud, puedes presentar
          un reclamo ante la{" "}
          <strong>
            Superintendencia de Protección de Datos Personales del Ecuador
          </strong>
          .
        </P>

        <H2>11. Cambios a esta política</H2>
        <P>
          Podemos actualizar esta política. Publicaremos cualquier cambio en esta
          misma página con su nueva fecha de actualización.
        </P>

        <p className="mt-10 border-t border-white/15 pt-6 text-[13px] text-[#b8c2ae]">
          Al usar este sitio y proporcionarnos tus datos, confirmas que has leído
          y comprendido esta Política de Privacidad y Protección de Datos.
        </p>
      </div>
    </main>
  )
}
