import { useEffect, useState } from 'react'
import { logout, useAuth } from '../../app/auth'
import { setDisplayCurrency, useDisplayCurrency } from '../../app/displayCurrency'
import { useI18n } from '../../app/i18n'
import { applyTheme, getInitialTheme } from '../../app/theme'
import { useUser } from '../../app/user'
import HeaderLabShowcase from './HeaderLabShowcase'
import './headerLab.css'

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
        <h1 className="header-lab-page__title">Header final candidate</h1>
        <p className="header-lab-page__text">Isolated production candidate for final polishing.</p>
      </div>

      <div className="header-lab-page__candidate">
        <HeaderLabShowcase
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
    </div>
  )
}
