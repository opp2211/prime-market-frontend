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

const ITERATION_FOUR_VARIANTS = [
  {
    id: 'iter4-soft',
    label: 'Variant 1 — Prime Exchange Soft',
    description:
      'Мягкая полировка текущего Final A: более спокойный balance, полный utility-toolbar справа и плотная exchange-подача без рамочного шума.',
  },
  {
    id: 'iter4-hidden-utilities',
    label: 'Variant 2 — Prime Exchange Hidden Utilities',
    description:
      'Чистый рабочий вариант с фокусом на balance, notifications и profile, а language и theme спрятаны внутрь profile dropdown.',
  },
  {
    id: 'iter4-wide-branded',
    label: 'Variant 3 — Prime Wide Branded',
    description:
      'Более брендированный тест с альтернативным пользовательским wordmark-asset, крупнее логотипом и темой внутри profile dropdown.',
  },
  {
    id: 'iter4-account-first',
    label: 'Variant 4 — Prime Compact Account-First',
    description:
      'Самый чистый правый край: на виду только balance, notifications и profile, а theme и language уходят в account menu.',
  },
]

const REFERENCE_VARIANTS = [
  {
    id: 'final-a',
    label: 'Iteration 3 reference — Final A',
    description:
      'Предыдущий лучший вариант для сравнения плотности, размеров логотипа и визуального веса правой toolbar-группы.',
  },
  {
    id: 'final-b',
    label: 'Iteration 3 reference — Final B',
    description:
      'Более компактный fallback из прошлой итерации, оставлен ниже как reference по clean/preserved density.',
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
        <h1 className="header-lab-page__title">Header lab — iteration 4</h1>
        <p className="header-lab-page__text">
          На странице добавлены прямое сравнение с текущим production header, четыре новых
          candidate-варианта и отдельный logo study, чтобы выбрать финальную desktop-шапку без
          замены production версии.
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
          <h2 className="header-lab-page__section-title">Iteration 4 candidates</h2>
          <p className="header-lab-page__section-text">
            Четыре новых теста развивают Final A: мягче balance, чище toolbar, больше вариантов
            с theme/language внутри profile dropdown и прямое сравнение правой части по разным
            layout-логикам.
          </p>
        </div>

        <div className="header-lab-page__stack">
          {ITERATION_FOUR_VARIANTS.map((variant) => (
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

      <section className="header-lab-page__section">
        <div className="header-lab-page__section-head">
          <p className="header-lab-page__eyebrow">Section 3</p>
          <h2 className="header-lab-page__section-title">Logo study</h2>
          <p className="header-lab-page__section-text">
            Компактные black-strip тесты production wordmark и загруженных пользователем
            альтернатив, чтобы сравнить читаемость и баланс рядом с nav в условиях реального
            header-фона.
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

      <section className="header-lab-page__archive">
        <div className="header-lab-page__section-head">
          <p className="header-lab-page__eyebrow">Archive</p>
          <h2 className="header-lab-page__section-title">Iteration 3 reference</h2>
          <p className="header-lab-page__section-text">
            Предыдущая итерация оставлена ниже как reference по визуальному весу, плотности и
            расположению логотипа относительно nav.
          </p>
        </div>

        <div className="header-lab-page__stack">
          {REFERENCE_VARIANTS.map((variant) => (
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
    </div>
  )
}
