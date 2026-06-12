import Link from "next/link"

export default async function SandboxPaymentPage({
  params,
}: {
  params: Promise<{ clientTransactionId: string }>
}) {
  const { clientTransactionId } = await params

  return (
    <main className="mx-auto w-full max-w-[1240px] px-4 py-6 pb-12">
      <section className="flex flex-col gap-4 rounded-xl border border-[#E8E2D8] bg-white p-6 max-w-lg">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--accent)]">
          PayPhone sandbox
        </p>
        <h1
          className="text-[28px] font-medium leading-tight text-[#1A1A18]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Link de pago generado
        </h1>
        <p className="text-[14px] text-[#6B6B66] leading-relaxed">
          Esta pantalla confirma que la integracion genera un identificador de
          pago local antes de conectar credenciales reales de PayPhone.
        </p>
        <p className="text-[14px] text-[#1A1A18]">
          <strong>Transaccion:</strong> {clientTransactionId}
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center h-11 rounded-full bg-[var(--accent)] px-5 text-[14px] font-semibold text-white"
        >
          Volver al catalogo
        </Link>
      </section>
    </main>
  )
}
