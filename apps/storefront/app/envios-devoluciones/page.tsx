import { PageAmbient } from "../components/ui/page-ambient"
import type { Metadata } from "next"
import { brandBaseUrl } from "../../lib/domains"

export const metadata: Metadata = {
  title: "Envíos y Devoluciones | Eter Niu",
  description:
    "Cómo enviamos tus pedidos (Servientrega, envío gratis a todo Ecuador, ~48h) y cómo funcionan los cambios y devoluciones en Eter Niu.",
  alternates: { canonical: `${brandBaseUrl}/envios-devoluciones` },
}

const INFO = {
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

export default function EnviosDevolucionesPage() {
  return (
    <main className="relative isolate min-h-screen bg-[#10160e]">
      <PageAmbient />
      <div className="mx-auto max-w-3xl px-5 py-12">
        <a href="/" className="text-[13px] text-[#b8c2ae] underline">
          ← Volver al inicio
        </a>
        <h1 className="mt-4 text-[32px] font-medium leading-tight text-white [font-family:var(--font-display)]">
          Envíos y Devoluciones
        </h1>
        <p className="mt-2 text-[13px] text-[#b8c2ae]">
          Última actualización: {INFO.actualizacion}
        </p>

        <H2>Envíos</H2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5">
          <LI>
            <strong>Cobertura:</strong> todo el Ecuador, a través de{" "}
            <strong>Servientrega</strong>.
          </LI>
          <LI>
            <strong>Costo:</strong> envío <strong>gratis</strong>.
          </LI>
          <LI>
            <strong>Tiempo de entrega:</strong> aproximadamente <strong>48 horas
            hábiles</strong> luego de confirmar tu pedido y el pago.
          </LI>
          <LI>
            <strong>Para recibir</strong> se solicita la <strong>cédula</strong> de
            la persona destinataria.
          </LI>
          <LI>
            Te compartimos la guía de seguimiento por WhatsApp cuando tu pedido sale
            a despacho.
          </LI>
        </ul>

        <H2>Cambios y devoluciones</H2>
        <P>
          Queremos que quedes feliz con tu compra. Si tu producto llega{" "}
          <strong>defectuoso, dañado o equivocado</strong>, te lo cambiamos o
          reembolsamos.
        </P>
        <ul className="mt-3 list-disc space-y-1.5 pl-5">
          <LI>
            Escríbenos por WhatsApp dentro de los <strong>7 días</strong> de
            recibido el producto, con fotos y tu número de pedido.
          </LI>
          <LI>
            Para cambios por preferencia, el producto debe estar{" "}
            <strong>sin uso y en su empaque original</strong>.
          </LI>
          <LI>
            Coordinamos la logística de la devolución contigo; en casos de defecto
            o error nuestro, el costo corre por nuestra cuenta.
          </LI>
          <LI>
            Los <strong>reembolsos</strong> se realizan por el mismo medio de pago
            utilizado, una vez recibido y revisado el producto.
          </LI>
        </ul>
        <P>
          Tienes además el derecho de desistimiento y las garantías que reconoce la{" "}
          <strong>Ley Orgánica de Defensa del Consumidor</strong> del Ecuador.
        </P>

        <H2>¿Cómo solicito un cambio o devolución?</H2>
        <P>
          Escríbenos por WhatsApp al <strong>{INFO.whatsapp}</strong> o al correo{" "}
          <a className="text-[#d3fa99] underline" href={`mailto:${INFO.email}`}>
            {INFO.email}
          </a>{" "}
          y te guiamos paso a paso.
        </P>
      </div>
    </main>
  )
}
