import { useEffect, useMemo, useState } from 'react'
import { logout, useAuth } from '../../app/auth'
import { setDisplayCurrency, useDisplayCurrency } from '../../app/displayCurrency'
import { useI18n } from '../../app/i18n'
import { applyTheme, getInitialTheme } from '../../app/theme'
import { useUser } from '../../app/user'
import HeaderLabShowcase from './HeaderLabShowcase'
import './headerLab.css'

const ITERATION_TWO_VARIANTS = [
  {
    id: 'bybit-clean',
    label: 'Variant A - Bybit Clean',
    description:
      'Рекомендуемый вариант: компактная левая группа, чистый exchange-toolbar справа и минимум визуального шума.',
  },
  {
    id: 'prime-wide',
    label: 'Variant B - Prime Wide',
    description:
      'Более широкий и брендовый сценарий, ближе к текущему production header, но аккуратнее по ритму и отступам.',
  },
  {
    id: 'ultra-minimal',
    label: 'Variant C - Ultra Minimal',
    description:
      'Самый спокойный вариант с мягким balance и почти полностью прозрачными utility-кнопками.',
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
        <h1 className="header-lab-page__title">Header lab — iteration 2</h1>
        <p className="header-lab-page__text">
          Вторая итерация сфокусирована на правильном production-логотипе, более широкой шапке и
          clean toolbar-ритме без рамочного шума.
        </p>
      </div>

      <div className="header-lab-page__stack">
        {ITERATION_TWO_VARIANTS.map((variant) => (
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
