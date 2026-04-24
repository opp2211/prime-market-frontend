import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { logout, useAuth } from '../../app/auth'
import { setDisplayCurrency, useDisplayCurrency } from '../../app/displayCurrency'
import { useI18n } from '../../app/i18n'
import { applyTheme, getInitialTheme } from '../../app/theme'
import { useUser } from '../../app/user'
import productionLogo from '../../assets/trimmed.png'
import alternateWordmarkLogo from '../../assets/logo.svg'
import markLogo from '../../assets/pm.png'
import Header from '../../widgets/Header'
import HeaderLabShowcase from './HeaderLabShowcase'
import './headerLab.css'

const BASELINE_VARIANT = {
  id: 'iter5-a',
  label: 'Iteration 5 baseline — Utility row with labels',
  description:
    'Текущая baseline-версия показывает правильную иерархию dropdown, но именно в ней utility row с текстом выглядит слишком шумно и менее аккуратно, чем хотелось бы.',
}

const REFINEMENT_VARIANTS = [
  {
    id: 'iter5-d',
    label: 'Variant 5D — Utility mini-controls',
    description:
      'Основной refinement-кандидат: theme остаётся icon-only, а language превращается в компактный picker с globe, кодом языка и полноценным nested dropdown.',
  },
  {
    id: 'iter5-e',
    label: 'Variant 5E — Ultra compact utility row',
    description:
      'Ещё более плотная версия: theme остаётся icon-only, а language control становится спокойнее и компактнее по плотности utility row.',
  },
]

const LOGO_STUDY_CASES = [
  {
    id: 'prod-124',
    assetLabel: 'trimmed.png (production)',
    src: productionLogo,
    width: 124,
  },
  {
    id: 'prod-136',
    assetLabel: 'trimmed.png (production)',
    src: productionLogo,
    width: 136,
  },
  {
    id: 'prod-148',
    assetLabel: 'trimmed.png (production)',
    src: productionLogo,
    width: 148,
  },
  {
    id: 'alt-136',
    assetLabel: 'logo.svg',
    src: alternateWordmarkLogo,
    width: 136,
  },
  {
    id: 'alt-148',
    assetLabel: 'logo.svg',
    src: alternateWordmarkLogo,
    width: 148,
  },
  {
    id: 'mark-124',
    assetLabel: 'pm.png',
    src: markLogo,
    width: 124,
  },
]

const LAB_WALLETS = [
  { code: 'RUB', balance: 10000 },
  { code: 'BYN', balance: 0 },
  { code: 'GEL', balance: 0 },
  { code: 'KZT', balance: 0 },
  { code: 'UAH', balance: 0 },
  { code: 'USD', balance: 0 },
]

function getUsername(user) {
  const source = user?.user && typeof user.user === 'object' ? user.user : user
  const username = source?.username || source?.login || ''
  return username.toString().trim() || 'user2'
}

function resolveSupportedCurrency(currencyCode) {
  const normalizedCode = (currencyCode || '').toString().trim().toUpperCase()
  return LAB_WALLETS.some((wallet) => wallet.code === normalizedCode) ? normalizedCode : 'RUB'
}

function LogoStudyStrip({ assetLabel, src, width }) {
  return (
    <div className="header-lab-logo-study__item">
      <div className="header-lab-logo-study__strip">
        <div className="header-lab-logo-study__inner">
          <Link
            to="/"
            className="header-lab-logo-study__logo"
            aria-label={`Logo study ${assetLabel}`}
            style={{ '--hl-study-logo-width': `${width}px` }}
          >
            <img src={src} alt={`Prime Market ${assetLabel}`} />
          </Link>

          <nav className="header-lab-logo-study__nav" aria-label="Logo study navigation">
            <span className="header-lab-logo-study__nav-item is-active">Market</span>
            <span className="header-lab-logo-study__nav-item">Dashboard</span>
          </nav>
        </div>
      </div>

      <p className="header-lab-logo-study__caption">
        Asset: {assetLabel} · width: {width}px
      </p>
    </div>
  )
}

export default function HeaderLabPage() {
  const { isAuthed } = useAuth()
  const { user } = useUser()
  const { language, setLanguage } = useI18n()
  const { currencyCode } = useDisplayCurrency()
  const [theme, setTheme] = useState(getInitialTheme)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    const root = document.documentElement

    const observer = new MutationObserver(() => {
      const nextTheme = getInitialTheme()
      setTheme((currentTheme) => (currentTheme === nextTheme ? currentTheme : nextTheme))
    })

    observer.observe(root, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })

    return () => {
      observer.disconnect()
    }
  }, [])

  const activeLanguage = language === 'ru' || language === 'en' ? language : 'en'
  const activeCurrencyCode = useMemo(
    () => resolveSupportedCurrency(currencyCode),
    [currencyCode]
  )
  const username = useMemo(() => getUsername(user), [user])

  async function handleLogout() {
    if (!isAuthed || isLoggingOut) return

    setIsLoggingOut(true)

    try {
      await logout()
    } finally {
      setIsLoggingOut(false)
    }
  }

  function handleThemeToggle() {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))
  }

  return (
    <div className="header-lab-page">
      <div className="header-lab-page__intro">
        <p className="header-lab-page__eyebrow">Desktop Header Lab</p>
        <h1 className="header-lab-page__title">Header lab — iteration 5 refinement</h1>
        <p className="header-lab-page__text">
          Этот pass не меняет общий hidden-utilities header. Правится только profile dropdown:
          идея utility row остаётся, но text-heavy подача заменяется на более чистые mini-controls,
          а language превращается в полноценный nested picker на будущее расширение списка языков.
        </p>
      </div>

      <section className="header-lab-page__section">
        <div className="header-lab-page__section-head">
          <p className="header-lab-page__eyebrow">Section 1</p>
          <h2 className="header-lab-page__section-title">Original production header</h2>
        </div>

        <div className="header-lab-production">
          <Header />
        </div>

        <p className="header-lab-page__section-caption">
          Текущий header сайта для прямого сравнения.
        </p>
      </section>

      <section className="header-lab-page__section">
        <div className="header-lab-page__section-head">
          <p className="header-lab-page__eyebrow">Section 2</p>
          <h2 className="header-lab-page__section-title">Iteration 5 baseline</h2>
          <p className="header-lab-page__section-text">
            Базовый вариант ниже оставлен как reference: сама иерархия dropdown правильная, но
            utility row с текстовыми подписями выглядит тяжелее и менее clean, чем хотелось бы.
          </p>
        </div>

        <div className="header-lab-page__stack">
          <HeaderLabShowcase
            variant={BASELINE_VARIANT.id}
            label={BASELINE_VARIANT.label}
            description={BASELINE_VARIANT.description}
            wallets={LAB_WALLETS}
            activeCurrencyCode={activeCurrencyCode}
            onCurrencyChange={setDisplayCurrency}
            language={activeLanguage}
            onLanguageChange={setLanguage}
            theme={theme}
            onThemeToggle={handleThemeToggle}
            notificationCount={4}
            username={username}
            isAuthed={isAuthed}
            onLogout={handleLogout}
            isLoggingOut={isLoggingOut}
          />
        </div>
      </section>

      <section className="header-lab-page__section">
        <div className="header-lab-page__section-head">
          <p className="header-lab-page__eyebrow">Section 3</p>
          <h2 className="header-lab-page__section-title">Iteration 5 refinements</h2>
          <p className="header-lab-page__section-text">
            Оба варианта ниже используют один и тот же header layout. Меняется только visual density
            utility row и подача compact language control внутри profile dropdown.
          </p>
        </div>

        <div className="header-lab-page__stack">
          {REFINEMENT_VARIANTS.map((variant) => (
            <HeaderLabShowcase
              key={variant.id}
              variant={variant.id}
              label={variant.label}
              description={variant.description}
              wallets={LAB_WALLETS}
              activeCurrencyCode={activeCurrencyCode}
              onCurrencyChange={setDisplayCurrency}
              language={activeLanguage}
              onLanguageChange={setLanguage}
              theme={theme}
              onThemeToggle={handleThemeToggle}
              notificationCount={4}
              username={username}
              isAuthed={isAuthed}
              onLogout={handleLogout}
              isLoggingOut={isLoggingOut}
            />
          ))}
        </div>
      </section>

      <section className="header-lab-page__archive">
        <div className="header-lab-page__section-head">
          <p className="header-lab-page__eyebrow">Archive</p>
          <h2 className="header-lab-page__section-title">Logo study reference</h2>
          <p className="header-lab-page__section-text">
            Логотипы в этом pass не перерабатывались, поэтому logo study из прошлой итерации
            оставлен ниже только как reference.
          </p>
        </div>

        <div className="header-lab-logo-study">
          {LOGO_STUDY_CASES.map((testCase) => (
            <LogoStudyStrip
              key={testCase.id}
              assetLabel={testCase.assetLabel}
              src={testCase.src}
              width={testCase.width}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
