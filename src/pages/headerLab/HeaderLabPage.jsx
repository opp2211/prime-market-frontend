import { useEffect, useState } from 'react'
import { logout, useAuth } from '../../app/auth'
import { setDisplayCurrency, useDisplayCurrency } from '../../app/displayCurrency'
import { useI18n } from '../../app/i18n'
import { applyTheme, getInitialTheme } from '../../app/theme'
import { useUser } from '../../app/user'
import Header from '../../widgets/Header'
import HeaderLabShowcase from './HeaderLabShowcase'
import './headerLab.css'

const REFERENCE_VARIANT = {
  id: 'iter5-d',
  label: 'Variant 5D — Utility mini-controls',
  description:
    'Текущий reference-вариант: чистый мини-формат уже найден, но language control всё ещё не выглядит достаточно собранным и центрированным.',
}

const NEW_VARIANTS = [
  {
    id: 'iter6-a',
    label: 'Variant 6A — Centered split controls',
    description:
      'Два равных контрола с плотной центрированной группой в language button - самый прямой и чистый refinement.',
  },
  {
    id: 'iter6-b',
    label: 'Variant 6B — Toolbar strip',
    description:
      'Общая toolbar-плашка с двумя сегментами и тонким divider - utility row ощущается более интегрированной частью account menu.',
  },
  {
    id: 'iter6-c',
    label: 'Variant 6C — Weighted language control',
    description:
      'Language selector получает больше визуального веса, а theme остаётся тихим быстрым toggler-контролом.',
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

  const activeLanguage = language === 'ru' ? 'ru' : 'en'
  const activeCurrencyCode = resolveSupportedCurrency(currencyCode)
  const username = getUsername(user)

  return (
    <div className="header-lab-page">
      <div className="header-lab-page__intro">
        <p className="header-lab-page__eyebrow">Desktop Header Lab</p>
        <h1 className="header-lab-page__title">Header lab - utility row refinement</h1>
        <p className="header-lab-page__text">
          Эта итерация сфокусирована только на utility row внутри profile dropdown. Общий header
          layout, balance button, profile button и обычные dropdown rows ниже остаются без
          изменений.
        </p>
      </div>

      <section className="header-lab-page__section">
        <div className="header-lab-page__section-head">
          <p className="header-lab-page__eyebrow">Section 1</p>
          <h2 className="header-lab-page__section-title">Current production header</h2>
        </div>

        <div className="header-lab-production">
          <Header />
        </div>

        <p className="header-lab-page__section-caption">
          Текущий production header оставлен как контекст без каких-либо изменений.
        </p>
      </section>

      <section className="header-lab-page__section">
        <div className="header-lab-page__section-head">
          <p className="header-lab-page__eyebrow">Section 2</p>
          <h2 className="header-lab-page__section-title">Reference: current Variant 5D</h2>
        </div>

        <div className="header-lab-page__stack">
          <HeaderLabShowcase
            variant={REFERENCE_VARIANT.id}
            label={REFERENCE_VARIANT.label}
            description={REFERENCE_VARIANT.description}
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
          <h2 className="header-lab-page__section-title">New utility-row variants</h2>
          <p className="header-lab-page__section-text">
            Во всех вариантах ниже используется один и тот же header layout. Меняется только
            utility row внутри profile dropdown.
          </p>
        </div>

        <div className="header-lab-page__stack">
          {NEW_VARIANTS.map((variant) => (
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
