import { PageAmbient } from "../components/ui/page-ambient"
import type { Metadata } from "next"
import { brandBaseUrl } from "../../lib/domains"

export const metadata: Metadata = {
  title: "Términos y Condiciones | Eter Niu",
  description:
    "Términos y condiciones de compra en Eter Niu (INFINITY IMPORTS): proceso de compra por WhatsApp o pago con tarjeta, precios, pagos, envíos y ley aplicable.",
  alternates: { canonical: `${brandBaseUrl}/terminos` },
}

const INFO = {
  comercial: "Eter Niu",
  razonSocial: "Viky Johanna Saavedra Puebla — INFINITY IMPORTS",
  ruc: "1715523021001",
  email: process.env.NEXT_PUBLIC_PRIVACY_CONTACT_EMAIL || "carlos.diaz@b2b.com.ec",
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

export default function TerminosPage() {
  return (
    <main className="relative isolate min-h-screen bg-[#10160e]">
      <PageAmbient />
      <div className="mx-auto max-w-3xl px-5 py-12">
        <a href="/" className="text-[13px] text-[#b8c2ae] underline">
          ← Volver al inicio
        </a>
        <h1 className="mt-4 text-[32px] font-medium leading-tight text-white [font-family:var(--font-display)]">
          Términos y Condiciones
        </h1>
        <p className="mt-2 text-[13px] text-[#b8c2ae]">
          Última actualización: {INFO.actualizacion}
        </p>

        <H2>1. Quiénes somos</H2>
        <P>
          Este sitio es operado por <strong>{INFO.comercial}</strong> (
          {INFO.razonSocial}, RUC {INFO.ruc}), en Quito, Ecuador. Al comprar o usar
          el sitio aceptas estos Términos y Condiciones.
        </P>

        <H2>2. Productos</H2>
        <P>
          Vendemos productos de cocina (línea de granito) y de bienestar (yoga y
          rituales). Las imágenes son referenciales; describimos cada producto lo
          más fielmente posible. La disponibilidad puede variar y se confirma al
          momento de la compra.
        </P>

        <H2>3. Cómo comprar</H2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5">
          <LI>
            <strong>Por WhatsApp:</strong> agregas productos y cierras tu pedido
            con nuestra asesora, quien confirma stock, envío y forma de pago.
          </LI>
          <LI>
            <strong>Pago con tarjeta en línea:</strong> a través de la pasarela
            autorizada <strong>Datafast</strong>, de forma segura.
          </LI>
        </ul>

        <H2>4. Precios y pagos</H2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5">
          <LI>Los precios están en dólares de los Estados Unidos (USD) e incluyen IVA.</LI>
          <LI>Podemos actualizar precios y promociones sin previo aviso; se respeta el precio vigente al confirmar el pedido.</LI>
          <LI>Aceptamos pago con tarjeta (Datafast) y otras formas acordadas por WhatsApp (por ejemplo, pago contra entrega).</LI>
          <LI>Los datos de tu tarjeta se procesan en el entorno seguro de Datafast y no se almacenan en nuestros servidores.</LI>
        </ul>

        <H2>5. Envíos y devoluciones</H2>
        <P>
          Los envíos y las devoluciones se rigen por nuestra{" "}
          <a href="/envios-devoluciones" className="text-[#d3fa99] underline">
            Política de Envíos y Devoluciones
          </a>
          .
        </P>

        <H2>6. Propiedad intelectual</H2>
        <P>
          Las marcas, textos, imágenes y contenidos del sitio pertenecen a{" "}
          {INFO.comercial} o a sus titulares y no pueden usarse sin autorización.
        </P>

        <H2>7. Responsabilidad</H2>
        <P>
          Hacemos nuestro mejor esfuerzo para que la información sea correcta y el
          servicio funcione bien. No respondemos por interrupciones ajenas a
          nuestro control (fallos de terceros, fuerza mayor).
        </P>

        <H2>8. Protección de datos</H2>
        <P>
          El tratamiento de tus datos se rige por nuestra{" "}
          <a href="/privacidad" className="text-[#d3fa99] underline">
            Política de Privacidad y Protección de Datos
          </a>
          , conforme a la LOPDP del Ecuador.
        </P>

        <H2>9. Ley aplicable</H2>
        <P>
          Estos términos se rigen por las leyes de la República del Ecuador,
          incluida la Ley Orgánica de Defensa del Consumidor. Cualquier
          controversia se resolverá ante los jueces competentes del Ecuador.
        </P>

        <H2>10. Contacto</H2>
        <P>
          Escríbenos a{" "}
          <a className="text-[#d3fa99] underline" href={`mailto:${INFO.email}`}>
            {INFO.email}
          </a>{" "}
          o por WhatsApp al {INFO.whatsapp}.
        </P>
      </div>
    </main>
  )
}
