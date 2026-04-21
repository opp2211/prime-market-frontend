import { Link } from 'react-router-dom'
import { useI18n } from '../../app/i18n'
import { getUserAreaCopy } from '../account/userAreaCopy'

export default function DashboardHome() {
  const { language } = useI18n()
  const copy = getUserAreaCopy(language)
  const dashboard = copy.dashboard

  const cards = [
    {
      title: dashboard.offersTitle,
      text: dashboard.offersText,
      to: '/dashboard/offers',
    },
    {
      title: dashboard.ordersTitle,
      text: dashboard.ordersText,
      to: '/dashboard/orders',
    },
    {
      title: dashboard.analyticsTitle,
      text: dashboard.analyticsText,
      soon: true,
    },
  ]

  return (
    <div className="account-page dashboard-home">
      <section className="card dashboard-hero">
        <div className="dashboard-hero__eyebrow">{dashboard.eyebrow}</div>
        <h1 className="h1 dashboard-hero__title">{dashboard.title}</h1>
        <p className="dashboard-hero__subtitle">{dashboard.subtitle}</p>
      </section>

      <div className="dashboard-grid">
        {cards.map((card) => (
          <article
            key={card.title}
            className={`card dashboard-card${card.soon ? ' dashboard-card--soon' : ''}`}
          >
            <div>
              <h2 className="dashboard-card__title">{card.title}</h2>
              <p className="dashboard-card__text">{card.text}</p>
            </div>

            {card.to ? (
              <Link to={card.to} className="btn btn--secondary dashboard-card__action">
                {dashboard.open}
              </Link>
            ) : (
              <span className="dashboard-card__soon">{copy.nav.comingSoon}</span>
            )}
          </article>
        ))}
      </div>
    </div>
  )
}
