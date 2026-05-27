import {
  BadgeDollarSign,
  Bot,
  MessageCircle,
  PackageSearch,
  ShieldCheck,
} from "lucide-react"
import { getProducts, whatsappLink } from "../lib/catalog"

function money(amount: number) {
  return `$${amount.toFixed(2)}`
}

export default async function Home() {
  const products = await getProducts()
  const categories = [...new Set(products.map((product) => product.category))]

  return (
    <main className="page-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">shop.b2b.com.ec</p>
          <h1>Catalogo para vender por WhatsApp</h1>
        </div>
        <a className="ghost-button" href="/feeds/meta/catalog.csv">
          <PackageSearch size={18} />
          Feed Meta
        </a>
      </header>

      <section className="commerce-grid" aria-label="Catalogo principal">
        <aside className="control-panel">
          <div className="seller-status">
            <Bot size={22} />
            <div>
              <strong>Vendedor IA activo</strong>
              <span>OpenClaw cotiza, recomienda y genera link de pago.</span>
            </div>
          </div>

          <div className="filter-block">
            <span>Categorias</span>
            <div className="chip-row">
              {categories.map((category) => (
                <a href={`#${category}`} key={category}>
                  {category}
                </a>
              ))}
            </div>
          </div>

          <div className="metric-list">
            <div>
              <BadgeDollarSign size={18} />
              <span>Pago por PayPhone link</span>
            </div>
            <div>
              <ShieldCheck size={18} />
              <span>Marketplace asistido con revision humana</span>
            </div>
            <div>
              <MessageCircle size={18} />
              <span>Venta principal por WhatsApp Ecuador</span>
            </div>
          </div>
        </aside>

        <section className="product-list">
          {products.map((product) => (
            <article className="product-card" id={product.category} key={product.id}>
              <div className="product-image">
                <img alt={product.title} src={product.imageUrl} />
                <span>{product.stock > 0 ? "Disponible" : "Agotado"}</span>
              </div>
              <div className="product-body">
                <div>
                  <p>{product.category}</p>
                  <h2>{product.title}</h2>
                  <span className="sku">{product.sku}</span>
                </div>
                <p className="description">{product.description}</p>
                <div className="product-footer">
                  <strong>{money(product.price.amount)}</strong>
                  <a className="primary-button" href={whatsappLink(product)}>
                    <MessageCircle size={18} />
                    Cotizar
                  </a>
                </div>
              </div>
            </article>
          ))}
        </section>
      </section>
    </main>
  )
}
