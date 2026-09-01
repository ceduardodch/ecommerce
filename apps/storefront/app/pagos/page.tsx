import { PageAmbient } from "../components/ui/page-ambient"
import type { Metadata } from "next"
import { brandBaseUrl } from "../../lib/domains"
import { SELLER_WHATSAPP_LOCAL, SELLER_WHATSAPP_NUMBER } from "../../lib/whatsapp"

export const metadata: Metadata = {
  title: "Formas de pago | Eter Niu",
  description:
    "Dos formas de pago en Eter Niu: transferencia o depósito bancario y tarjeta de crédito/débito con Datafast. Confirmamos tu pago, despachamos por Servientrega y te enviamos la guía de seguimiento.",
  alternates: { canonical: `${brandBaseUrl}/pagos` },
}

const INFO = {
  razonSocial: "Viky Johanna Saavedra Puebla — INFINITY IMPORTS",
  ruc: "1715523021001",
  banco: "Banco Pichincha",
  whatsapp: SELLER_WHATSAPP_LOCAL,
  instagram: "https://instagram.com/eter.niu",
  actualizacion: "1 de septiembre de 2026",
}

const PASOS = [
  "Confirmamos contigo el producto, el precio final y tu dirección.",
  "Pagas por transferencia/depósito o con tarjeta en línea.",
  "Verificamos el pago: si fue transferencia, con tu comprobante; si fue tarjeta, la confirmación llega automática.",
  "Despachamos por Servientrega, con envío gratis a todo el Ecuador (~48 h hábiles).",
  "Te enviamos la guía de seguimiento por WhatsApp para que rastrees tu paquete.",
]

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

function MethodCard({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#16200f] p-5">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-[#d3fa99]">
        {eyebrow}
      </p>
      <p className="mt-1 text-[17px] font-medium text-white [font-family:var(--font-display)]">
        {title}
      </p>
      {children}
    </div>
  )
}

export default function PagosPage() {
  return (
    <main className="relative isolate min-h-screen bg-[#10160e]">
      <PageAmbient />
      <div className="mx-auto max-w-3xl px-5 py-12">
        <a href="/" className="text-[13px] text-[#b8c2ae] underline">
          ← Volver al inicio
        </a>
        <h1 className="mt-4 text-[32px] font-medium leading-tight text-white [font-family:var(--font-display)]">
          Formas de pago
        </h1>
        {/* pr-20 en móvil: el botón flotante del carrito es `fixed right-2 top-20`. */}
        <p className="mt-2 pr-20 text-[15px] leading-relaxed text-[#b8c2ae] sm:pr-0">
          Tenemos <strong className="text-white">dos formas de pago</strong>:
          transferencia o depósito bancario, y tarjeta de crédito o débito con
          Datafast. Confirmamos tu pago y despachamos.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <MethodCard eyebrow="Opción 1" title="Transferencia o depósito">
            <p className="mt-3 text-[14px] leading-relaxed text-[#b8c2ae]">
              Cuenta de <strong>{INFO.banco}</strong> a nombre de{" "}
              <strong>{INFO.razonSocial}</strong> (RUC {INFO.ruc}), la misma
              razón social de esta tienda.
            </p>
            <p className="mt-2 text-[14px] leading-relaxed text-[#b8c2ae]">
              Te enviamos el número de cuenta por WhatsApp al confirmar tu
              pedido. Nos mandas la captura del comprobante, verificamos y
              despachamos.
            </p>
            <a
              href={`https://wa.me/${SELLER_WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center justify-center rounded-full bg-[#25D366] px-4 py-2 text-[13px] font-semibold text-white"
            >
              Pedir datos por WhatsApp
            </a>
          </MethodCard>

          <MethodCard eyebrow="Opción 2" title="Tarjeta de crédito o débito">
            <p className="mt-3 text-[14px] leading-relaxed text-[#b8c2ae]">
              Pagas en línea desde el carrito. El cobro lo procesa{" "}
              <strong>Datafast</strong>, la pasarela autorizada en Ecuador.
            </p>
            <p className="mt-2 text-[14px] leading-relaxed text-[#b8c2ae]">
              Los datos de tu tarjeta se ingresan directamente en el entorno
              seguro de Datafast: <strong>nunca</strong> pasan por nuestros
              servidores ni los guardamos.
            </p>
            <a
              href="/cart"
              className="mt-4 inline-flex items-center justify-center rounded-full border border-[#d3fa99] px-4 py-2 text-[13px] font-semibold text-[#d3fa99]"
            >
              Ir al carrito
            </a>
          </MethodCard>
        </div>

        <H2>Cómo funciona tu compra</H2>
        <P>
          Trabajamos con <strong>previo pago</strong>: primero confirmamos el
          pago y luego despachamos. Así protegemos el stock reservado y podemos
          mantener el envío gratis a todo el país.
        </P>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5">
          {PASOS.map((paso) => (
            <LI key={paso}>{paso}</LI>
          ))}
        </ol>

        <H2>Por qué puedes comprar con confianza</H2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5">
          <LI>
            <strong>Ves los despachos:</strong> grabamos los envíos del día y los
            publicamos en nuestras redes,{" "}
            <a
              href={INFO.instagram}
              target="_blank"
              rel="noreferrer"
              className="text-[#d3fa99] underline"
            >
              @eter.niu
            </a>
            .
          </LI>
          <LI>
            <strong>Rastreas tu pedido:</strong> te enviamos la guía de
            Servientrega por WhatsApp apenas sale de bodega.
          </LI>
          <LI>
            <strong>Somos una empresa registrada:</strong> {INFO.razonSocial},
            RUC {INFO.ruc}, Quito, Ecuador.
          </LI>
          <LI>
            <strong>Tienes garantía:</strong> si el producto llega defectuoso,
            dañado o equivocado, lo cambiamos o te devolvemos tu dinero. Revisa{" "}
            <a href="/envios-devoluciones" className="text-[#d3fa99] underline">
              envíos y devoluciones
            </a>
            .
          </LI>
          <LI>
            <strong>Hay clientes reales:</strong> puedes leer las reseñas y ver
            las fotos de quienes ya compraron en cada ficha de producto.
          </LI>
        </ul>

        <H2>Seguridad: lo que nunca te vamos a pedir</H2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5">
          <LI>
            Nunca te pedimos el <strong>número de tu tarjeta</strong>, el código
            de seguridad ni tus claves por WhatsApp, llamada o correo.
          </LI>
          <LI>
            Los únicos pagos válidos son a la cuenta de {INFO.banco} a nombre de{" "}
            {INFO.razonSocial}, o por el enlace de Datafast en este sitio.
          </LI>
          <LI>
            Ante cualquier duda, escríbenos al <strong>{INFO.whatsapp}</strong> y
            confirmamos si el mensaje es nuestro.
          </LI>
        </ul>

        <p className="mt-10 text-[13px] text-[#b8c2ae]">
          Última actualización: {INFO.actualizacion}
        </p>
      </div>
    </main>
  )
}
