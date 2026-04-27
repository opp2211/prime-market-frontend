import { Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { applyTheme, getInitialTheme } from '../app/theme'
import { logout, useAuth } from '../app/auth'
import { useI18n } from '../app/i18n'
import { useUser } from '../app/user'
import { getHeaderLabVariantId } from '../pages/headerLab/headerLabConfig'
import NotificationBell from './NotificationBell'
import HeaderLabMobileVariants from './HeaderLabMobileVariants'
import {
  HeaderBalanceControl,
  HeaderLogoLink,
  HeaderNavLink,
  HeaderProfileMenu,
  cx,
  getHeaderCopy,
  getHeaderUserInitial,
  getHeaderUsername,
} from './headerShared'
import styles from './Header.module.css'

function useDesktopBreakpoint() {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === 'undefined') return true
    return window.matchMedia('(min-width: 1024px)').matches
  })

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const mediaQuery = window.matchMedia('(min-width: 1024px)')
    const handleChange = (event) => setIsDesktop(event.matches)

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }

    mediaQuery.addListener(handleChange)
    return () => mediaQuery.removeListener(handleChange)
  }, [])

  return isDesktop
}

function StandardHeader({
  routeKey,
  copy,
  language,
  isAuthed,
  theme,
  setTheme,
  setLanguage,
  accountLabel,
  accountInitial,
  accountActive,
  moneyActive,
  onLogout,
  isLoggingOut,
}) {
  return (
    <div className={styles.inner}>
      <div className={styles.left}>
        <HeaderLogoLink copy={copy} />

        <nav className={styles.nav} aria-label={copy.navAria}>
          <HeaderNavLink to="/market">{copy.market}</HeaderNavLink>
          <HeaderNavLink to="/dashboard">{copy.dashboard}</HeaderNavLink>
        </nav>
      </div>

      <div className={styles.right}>
        {isAuthed ? (
          <>
            <HeaderBalanceControl
              key={`balance-${routeKey}`}
              isAuthed={isAuthed}
              copy={copy}
              language={language}
              isActive={moneyActive}
            />
            <NotificationBell />
            <HeaderProfileMenu
              key={`profile-${routeKey}`}
              isAuthed={isAuthed}
              copy={copy}
              theme={theme}
              onThemeChange={setTheme}
              language={language}
              onLanguageChange={setLanguage}
              accountLabel={accountLabel}
              accountInitial={accountInitial}
              isActive={accountActive}
              onLogout={onLogout}
              isLoggingOut={isLoggingOut}
            />
          </>
        ) : (
          <div className={styles.guestActions}>
            <Link to="/login" className={cx('btn', styles.guestAction, styles.guestActionPrimary)}>
              {copy.login}
            </Link>
            <Link
              to="/register"
              className={cx('btn', styles.guestAction, styles.guestActionSecondary)}
            >
              {copy.register}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Header() {
  const location = useLocation()
  const isDesktop = useDesktopBreakpoint()
  const [theme, setTheme] = useState(getInitialTheme)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { isAuthed } = useAuth()
  const { user } = useUser()
  const { language, setLanguage } = useI18n()
  const copy = getHeaderCopy(language)
  const accountLabel = getHeaderUsername(user, copy.account)
  const accountInitial = getHeaderUserInitial(accountLabel)
  const accountActive = location.pathname.startsWith('/account')
  const moneyActive = location.pathname.startsWith('/money')
  const routeKey = `${location.pathname}${location.search}`
  const labVariantId = getHeaderLabVariantId(location.pathname)
  const shouldRenderMobileLab = labVariantId != null && !isDesktop

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  async function handleLogout() {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    try {
      await logout()
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <header className={styles.header}>
      {shouldRenderMobileLab ? (
        <HeaderLabMobileVariants
          variantId={labVariantId}
          copy={copy}
          language={language}
          onLanguageChange={setLanguage}
          theme={theme}
          onThemeChange={setTheme}
          isAuthed={isAuthed}
          accountLabel={accountLabel}
          accountInitial={accountInitial}
        />
      ) : (
        <StandardHeader
          routeKey={routeKey}
          copy={copy}
          language={language}
          isAuthed={isAuthed}
          theme={theme}
          setTheme={setTheme}
          setLanguage={setLanguage}
          accountLabel={accountLabel}
          accountInitial={accountInitial}
          accountActive={accountActive}
          moneyActive={moneyActive}
          onLogout={handleLogout}
          isLoggingOut={isLoggingOut}
        />
      )}
    </header>
  )
}
