import { useEffect, useMemo, useState } from 'react'
import { logout, useAuth } from '../../app/auth'
import { setDisplayCurrency, useDisplayCurrency } from '../../app/displayCurrency'
import { useI18n } from '../../app/i18n'
import { applyTheme, getInitialTheme } from '../../app/theme'
import { useUser } from '../../app/user'
import HeaderLabShowcase from './HeaderLabShowcase'
import './headerLab.css'

const FINAL_VARIANTS = [
  {
    id: 'final-a',
    label: 'Variant Final A — Prime Exchange',
    description:
      'Основной финальный вариант: более плотный exchange-ритм, заметный balance и уверенная правая toolbar-группа без рамочного шума.',
  },
  {
    id: 'final-b',
    label: 'Variant Final B — Prime Compact',
    description:
      'Более компактный fallback-вариант: чуть спокойнее по размерам, но всё ещё достаточно плотный и production-ready.',
  },
]

const ARCHIVE_VARIANTS = [
  {
    id: 'bybit-clean',
    label: 'Variant A — Bybit Clean',
    description:
      'Итерация 2: первая clean-exchange версия с меньшей плотностью и более лёгким toolbar.',
  },
  {
    id: 'prime-wide',
    label: 'Variant B — Prime Wide',
    description:
      'Итерация 2: более брендированный вариант с широким контейнером и мягкими акцентами.',
  },
  {
    id: 'ultra-minimal',
    label: 'Variant C — Ultra Minimal',
    description:
      'Итерация 2: минимальная версия с максимально прозрачными utility-контролами.',
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
        <h1 className="header-lab-page__title">Header lab — iteration 3</h1>
        <p className="header-lab-page__text">
          Третья итерация усиливает масштаб: логотип крупнее, nav плотнее, правая часть заметнее,
          а общий ритм ближе к реальному exchange header без лишних рамок и карточного шума.
        </p>
      </div>

      <section className="header-lab-page__group">
        <div className="header-lab-page__stack">
          {FINAL_VARIANTS.map((variant) => (
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
      </section>

      <section className="header-lab-page__archive">
        <div className="header-lab-page__archive-intro">
          <p className="header-lab-page__eyebrow">Archive</p>
          <h2 className="header-lab-page__archive-title">Iteration 2 reference</h2>
          <p className="header-lab-page__archive-text">
            Предыдущая итерация оставлена ниже для сравнения плотности, ритма и визуального веса.
          </p>
        </div>

        <div className="header-lab-page__stack">
          {ARCHIVE_VARIANTS.map((variant) => (
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
      </section>
    </div>
  )
}
