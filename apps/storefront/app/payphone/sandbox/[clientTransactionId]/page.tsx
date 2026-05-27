import Link from "next/link"

export default async function SandboxPaymentPage({
  params,
}: {
  params: Promise<{ clientTransactionId: string }>
}) {
  const { clientTransactionId } = await params

  return (
    <main className="page-shell">
      <section className="control-panel">
        <p className="eyebrow">PayPhone sandbox</p>
        <h1>Link de pago generado</h1>
        <p className="description">
          Esta pantalla confirma que la integracion genera un identificador de
          pago local antes de conectar credenciales reales de PayPhone.
        </p>
        <p>
          <strong>Transaccion:</strong> {clientTransactionId}
        </p>
        <Link className="primary-button" href="/">
          Volver al catalogo
        </Link>
      </section>
    </main>
  )
}
