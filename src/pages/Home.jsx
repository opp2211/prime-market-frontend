import { Link } from 'react-router-dom'
import { useI18n } from '../app/i18n'
import logo from '../assets/logo.svg'

export default function Home() {
  const { t } = useI18n()

  return (
    <div className="home">
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__content">
            <span className="eyebrow">{t('home.eyebrow')}</span>
            <h1 className="hero__title">{t('home.title')}</h1>
            <p className="hero__subtitle">{t('home.description')}</p>

            <div className="hero__actions">
              <Link className="btn btn--primary" to="/register">
                {t('home.ctaPrimary')}
              </Link>
              <Link className="btn btn--ghost" to="/login">
                {t('home.ctaSecondary')}
              </Link>
            </div>

            <div className="hero__pills">
              <span className="pill">{t('home.pillOne')}</span>
              <span className="pill">{t('home.pillTwo')}</span>
              <span className="pill">{t('home.pillThree')}</span>
            </div>
          </div>

          <div className="hero__logo-wrap">
            <div className="hero__logo-glow" aria-hidden="true" />
            <img className="hero__logo" src={logo} alt="Prime Market" />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section__head">
          <h2 className="h2">{t('home.sectionTitle')}</h2>
          <p className="muted">{t('home.sectionSubtitle')}</p>
        </div>

        <div className="grid grid--3">
          <article className="card feature-card">
            <div className="feature-card__title">{t('home.stepOneTitle')}</div>
            <p className="muted">{t('home.stepOneText')}</p>
          </article>
          <article className="card feature-card">
            <div className="feature-card__title">{t('home.stepTwoTitle')}</div>
            <p className="muted">{t('home.stepTwoText')}</p>
          </article>
          <article className="card feature-card">
            <div className="feature-card__title">{t('home.stepThreeTitle')}</div>
            <p className="muted">{t('home.stepThreeText')}</p>
          </article>
        </div>
      </section>
    </div>
  )
}
