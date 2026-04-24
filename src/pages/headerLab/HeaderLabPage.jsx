import { useEffect, useMemo, useState } from 'react'
import { logout, useAuth } from '../../app/auth'
import { setDisplayCurrency, useDisplayCurrency } from '../../app/displayCurrency'
import { useI18n } from '../../app/i18n'
import { applyTheme, getInitialTheme } from '../../app/theme'
import { useUser } from '../../app/user'
import HeaderLabShowcase from './HeaderLabShowcase'
import './headerLab.css'

const VARIANTS = [
  {
    id: 'prime-compact',
    label: 'Variant 1 — Prime Compact',
    description:
      'Самый сбалансированный вариант: компактный, спокойный и уже близок к production.',
  },
  {
    id: 'bybit-inspired',
    label: 'Variant 2 — Bybit Inspired',
    description:
      'Более плотная exchange-подача с toolbar-ритмом и акцентом на торговый контекст.',
  },
  {
    id: 'premium-panels',
    label: 'Variant 3 — Premium Panels',
    description:
      'Премиальный сценарий с отдельными dark-panels для ключевых пользовательских контролов.',
  },
  {
    id: 'minimal-pro',
    label: 'Variant 4 — Minimal Pro',
    description:
      'Самый чистый SaaS-подход: меньше рамок, больше воздуха и аккуратные hover/open states.',
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

  return (
    <div className="header-lab-page">
      <div className="header-lab-page__intro">
        <p className="header-lab-page__eyebrow">Desktop Header Lab</p>
        <h1 className="header-lab-page__title">Сравнение 4 вариантов нового desktop-хедера</h1>
        <p className="header-lab-page__text">
          Текущий production header не заменён: на этой странице собраны отдельные варианты с
          общей логикой темы, языка и выбора display currency.
        </p>
      </div>

      <div className="header-lab-page__stack">
        {VARIANTS.map((variant) => (
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
            onThemeToggle={() =>
              setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))
            }
            notificationCount={4}
            username={username}
            isAuthed={isAuthed}
            onLogout={handleLogout}
            isLoggingOut={isLoggingOut}
          />
        ))}
      </div>
    </div>
  )
}
