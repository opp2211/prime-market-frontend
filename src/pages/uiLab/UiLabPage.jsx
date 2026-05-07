import { Link } from 'react-router-dom'

const LABS = [
  {
    path: '/wallet-lab',
    title: 'Wallet lab',
    description: 'Wallet and balances screen experiment.',
  },
  {
    path: '/transactions-lab',
    title: 'Transactions lab',
    description: 'Transaction history screen experiment.',
  },
  {
    path: '/header-lab',
    title: 'Header lab',
    description: 'Header visual state sandbox.',
  },
]

export default function UiLabPage() {
  return (
    <section className="section">
      <div className="section__head">
        <h1 className="h1">UI lab</h1>
        <p className="muted">Temporary entry point for available lab pages.</p>
      </div>

      <div className="grid grid--3">
        {LABS.map((lab) => (
          <article className="card feature-card" key={lab.path}>
            <div className="feature-card__title">{lab.title}</div>
            <p className="muted">{lab.description}</p>
            <Link className="btn btn--ghost" to={lab.path}>
              {lab.path}
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}
