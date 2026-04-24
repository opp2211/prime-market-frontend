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

const WINNER_VARIANT = {
  id: 'iter4-hidden-utilities',
  label: 'Variant 2 — Prime Exchange Hidden Utilities',
  description:
    'Текущий лучший кандидат из iteration 4: в toolbar остаются только Balance, Notifications и Profile, а theme и language прячутся внутрь account dropdown.',
}

const ITERATION_FIVE_VARIANTS = [
  {
    id: 'iter5-a',
    label: 'Variant 5A — Utility row in middle',
    description:
      'Основной refinement-кандидат: utility row стоит между основными action rows и logout, поэтому иерархия читается чище всего.',
  },
  {
    id: 'iter5-b',
    label: 'Variant 5B — Utility row on top',
    description:
      'Быстрые настройки перенесены наверх dropdown, чтобы проверить, не перетягивают ли theme и language внимание с основных action rows.',
  },
  {
    id: 'iter5-c',
    label: 'Variant 5C — Utility row before logout',
    description:
      'Та же логика, что у 5A, но utility row тише и компактнее: нужно проверить, не становится ли secondary-settings зона слишком незаметной.',
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
        <h1 className="header-lab-page__title">Header lab — iteration 5</h1>
        <p className="header-lab-page__text">
          Эта итерация больше не ищет новый стиль шапки. Фокус только на полировке лучшего
          направления из iteration 4: hidden utilities в account dropdown и более зрелая,
          аккуратная secondary-settings зона внутри profile menu.
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
          <h2 className="header-lab-page__section-title">Iteration 4 winner</h2>
          <p className="header-lab-page__section-text">
            Здесь показан текущий winner без изменений: это baseline, от которого сравниваются
            три refinement-варианта account dropdown.
          </p>
        </div>

        <div className="header-lab-page__stack">
          <HeaderLabShowcase
            variant={WINNER_VARIANT.id}
            label={WINNER_VARIANT.label}
            description={WINNER_VARIANT.description}
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
          <h2 className="header-lab-page__section-title">
            Iteration 5 — account dropdown refinements
          </h2>
          <p className="header-lab-page__section-text">
            Все три варианта ниже построены на winner-версии. Меняется почти только структура
            profile dropdown: обычные rows остаются для Profile и Wallet, а Theme и Language
            объединяются в отдельный utility-row.
          </p>
        </div>

        <div className="header-lab-page__stack">
          {ITERATION_FIVE_VARIANTS.map((variant) => (
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
            Логотипы в этой итерации не перерабатывались, поэтому logo study из iteration 4
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
