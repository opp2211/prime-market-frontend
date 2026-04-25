import { Link, NavLink, useLocation } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import brandLogo from '../assets/trimmed.png'
import { applyTheme, getInitialTheme } from '../app/theme'
import { logout, useAuth } from '../app/auth'
import { useI18n } from '../app/i18n'
import { useUser } from '../app/user'
import { getMyWallets } from '../api/wallets'
import { setDisplayCurrency, useDisplayCurrency } from '../app/displayCurrency'
import { getDisplayWallet, normalizeWalletEntries } from '../shared/lib/money'
import NotificationBell from './NotificationBell'
import styles from './Header.module.css'

const LANG_OPTIONS = [
  { value: 'ru', label: 'Русский', shortLabel: 'RU' },
  { value: 'en', label: 'English', shortLabel: 'EN' },
]

const HEADER_MESSAGES = {
  ru: {
    homeLabel: 'Prime Market — на главную',
    navAria: 'Главная навигация',
    market: 'Маркет',
    dashboard: 'Кабинет',
    account: 'Аккаунт',
    profileMenu: 'Меню профиля',
    wallet: 'Кошелек',
    balance: 'Баланс',
    balanceLoading: 'Загрузка',
    balanceUnavailable: 'Недоступен',
    availableCurrencies: 'Доступные валюты',
    noBalances: 'Валюты недоступны',
    notifications: 'Уведомления',
    profile: 'Профиль',
    logout: 'Выйти',
    themeToggle: 'Переключить тему',
    language: 'Язык',
    login: 'Войти',
    register: 'Регистрация',
  },
  en: {
    homeLabel: 'Prime Market - home',
    navAria: 'Primary navigation',
    market: 'Market',
    dashboard: 'Dashboard',
    account: 'Account',
    profileMenu: 'Profile menu',
    wallet: 'Wallet',
    balance: 'Balance',
    balanceLoading: 'Loading',
    balanceUnavailable: 'Unavailable',
    availableCurrencies: 'Available currencies',
    noBalances: 'Currencies unavailable',
    notifications: 'Notifications',
    profile: 'Profile',
    logout: 'Log out',
    themeToggle: 'Toggle theme',
    language: 'Language',
    login: 'Log in',
    register: 'Sign up',
  },
}

function cx(...values) {
  return values.filter(Boolean).join(' ')
}

function getHeaderCopy(language = 'ru') {
  return HEADER_MESSAGES[language] || HEADER_MESSAGES.ru
}

function formatHeaderAmount(value, language = 'ru') {
  const numberValue = Number(value)
  if (!Number.isFinite(numberValue)) return '0.00'

  try {
    return new Intl.NumberFormat(language === 'en' ? 'en-US' : 'ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numberValue)
  } catch {
    return numberValue.toFixed(2)
  }
}

function getHeaderUsername(user, fallback) {
  const source = user?.user && typeof user.user === 'object' ? user.user : user
  const username = source?.username || source?.login || ''
  return username.toString().trim() || fallback
}

function getHeaderUserInitial(label) {
  return (label || 'A').toString().trim().slice(0, 1).toUpperCase() || 'A'
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="m4.5 6 3.5 3.8L11.5 6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20.4 14.2A8.6 8.6 0 1 1 9.8 3.6a7.2 7.2 0 0 0 10.6 10.6Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M12 2.8v2.4M12 18.8v2.4M5.2 5.2l1.7 1.7M17.1 17.1l1.7 1.7M2.8 12h2.4M18.8 12h2.4M5.2 18.8l1.7-1.7M17.1 6.9l1.7-1.7"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  )
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M3.8 10h12.4M10 3.1c1.8 2 2.8 4.33 2.8 6.9s-1 4.9-2.8 6.9M10 3.1C8.2 5.1 7.2 7.43 7.2 10s1 4.9 2.8 6.9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function ProfileIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 10.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4ZM4.2 16.2c1.2-2.2 3.1-3.3 5.8-3.3s4.6 1.1 5.8 3.3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function WalletIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M3.6 6.2A1.6 1.6 0 0 1 5.2 4.6h9.6a1.6 1.6 0 0 1 1.6 1.6v7.6a1.6 1.6 0 0 1-1.6 1.6H5.2a1.6 1.6 0 0 1-1.6-1.6V6.2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M12.8 10h2.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M5.1 7.2h11.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M12.6 5.3V4.8a1.6 1.6 0 0 0-1.6-1.6H4.8a1.6 1.6 0 0 0-1.6 1.6v10.4a1.6 1.6 0 0 0 1.6 1.6H11a1.6 1.6 0 0 0 1.6-1.6v-.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M8.4 10h8.4m0 0-2.7-2.7M16.8 10l-2.7 2.7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M6 3.5 10.5 8 6 12.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ThemeUtilityButton({ copy, theme, onToggle }) {
  return (
    <button
      type="button"
      className={styles.utilityButton}
      onClick={onToggle}
      aria-label={copy.themeToggle}
      title={copy.themeToggle}
    >
      <span className={styles.utilityIcon} aria-hidden="true">
        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
      </span>
    </button>
  )
}

function LanguageUtilityControl({ copy, value, onChange }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)
  const current = LANG_OPTIONS.find((option) => option.value === value) || LANG_OPTIONS[0]

  useEffect(() => {
    if (!open) return undefined

    function handlePointerDown(event) {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
    }
  }, [open])

  return (
    <div
      className={cx(styles.utilityLanguage, open && styles.utilityLanguageOpen)}
      ref={wrapRef}
    >
      <button
        type="button"
        className={cx(styles.utilityButton, open && styles.utilityButtonOpen)}
        onClick={() => setOpen((currentOpen) => !currentOpen)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={copy.language}
        title={copy.language}
      >
        <span className={styles.utilityGroup}>
          <span className={styles.utilityIcon} aria-hidden="true">
            <GlobeIcon />
          </span>
          <span className={styles.utilityCode}>{current.shortLabel}</span>
          <span className={styles.utilityChevron} aria-hidden="true">
            <ChevronIcon />
          </span>
        </span>
      </button>

      <div
        className={styles.utilityLanguageDropdown}
        role="listbox"
        aria-hidden={!open}
        aria-label={copy.language}
      >
        {LANG_OPTIONS.map((option) => {
          const isActive = option.value === value

          return (
            <button
              key={option.value}
              type="button"
              className={cx(styles.utilityOption, isActive && styles.utilityOptionActive)}
              role="option"
              aria-selected={isActive}
              tabIndex={open ? 0 : -1}
              onClick={() => {
                onChange(option.value)
                setOpen(false)
              }}
            >
              <span className={styles.utilityOptionMain}>
                <span className={styles.utilityOptionCode}>{option.shortLabel}</span>
                <span className={styles.utilityOptionName}>{option.label}</span>
              </span>
              {isActive ? <span className={styles.utilityOptionDot} aria-hidden="true" /> : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function HeaderBalanceControl({ isAuthed, copy, language, isActive = false }) {
  const { currencyCode } = useDisplayCurrency()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)
  const [wallets, setWallets] = useState({})
  const [status, setStatus] = useState(isAuthed ? 'loading' : 'idle')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return undefined

    function onDocClick(event) {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) setOpen(false)
    }

    function onKeyDown(event) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  useEffect(() => {
    let active = true

    if (!isAuthed) return undefined

    const loadWallets = async () => {
      setStatus('loading')
      setError('')

      try {
        const walletsRes = await getMyWallets()
        if (!active) return
        setWallets(walletsRes?.data || {})
        setStatus('ready')
      } catch (loadError) {
        if (!active) return
        setError(loadError?.message || copy.balanceUnavailable)
        setStatus('error')
      }
    }

    loadWallets()

    return () => {
      active = false
    }
  }, [copy.balanceUnavailable, isAuthed])

  const items = normalizeWalletEntries(wallets)
  const current = getDisplayWallet(items, currencyCode)
  const fallbackCurrencyCode = items[0]?.code || ''
  const activeCurrencyCode = current?.code || fallbackCurrencyCode || currencyCode
  const activeWallet = current || getDisplayWallet(items, fallbackCurrencyCode)

  useEffect(() => {
    if (!isAuthed || status !== 'ready') return
    if (current?.code || !fallbackCurrencyCode) return
    setDisplayCurrency(fallbackCurrencyCode)
  }, [current?.code, fallbackCurrencyCode, isAuthed, status])

  if (!isAuthed) return null

  let amountLabel = formatHeaderAmount(activeWallet?.balance ?? 0, language)
  if (status === 'loading') amountLabel = copy.balanceLoading
  if (status === 'error') amountLabel = copy.balanceUnavailable

  let menuEmptyLabel = copy.noBalances
  if (status === 'loading') menuEmptyLabel = copy.balanceLoading
  if (status === 'error') menuEmptyLabel = error || copy.balanceUnavailable

  return (
    <div
      className={cx(
        styles.balanceControl,
        open && styles.balanceControlOpen,
        isActive && styles.balanceControlActive
      )}
      ref={wrapRef}
    >
      <button
        type="button"
        className={styles.balanceTrigger}
        onClick={() => setOpen((currentOpen) => !currentOpen)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={copy.balance}
      >
        <span className={styles.balanceValueGroup}>
          <span
            className={cx(
              styles.balanceAmount,
              status !== 'ready' && styles.balanceAmountState
            )}
          >
            {amountLabel}
          </span>
          <span className={styles.balanceCode}>{activeCurrencyCode}</span>
        </span>
        <span className={styles.balanceChevron} aria-hidden="true">
          <ChevronIcon />
        </span>
      </button>

      <div
        className={cx(styles.dropdownPanel, styles.balanceDropdown, open && styles.dropdownOpen)}
        role="menu"
        aria-hidden={!open}
        aria-label={copy.availableCurrencies}
      >
        {status === 'ready' && items.length > 0 ? (
          <div className={styles.balanceList}>
            {items.map((item) => {
              const isCurrent = item.code === activeCurrencyCode

              return (
                <button
                  key={item.code}
                  type="button"
                  className={cx(styles.balanceRow, isCurrent && styles.balanceRowActive)}
                  onClick={() => {
                    setDisplayCurrency(item.code)
                    setOpen(false)
                  }}
                  role="menuitemradio"
                  aria-checked={isCurrent}
                  tabIndex={open ? 0 : -1}
                >
                  <span className={styles.balanceRowMain}>
                    <span className={styles.balanceRowCode}>{item.code}</span>
                  </span>
                  <span className={styles.balanceRowMeta}>
                    <span className={styles.balanceRowAmount}>
                      {formatHeaderAmount(item.balance, language)}
                    </span>
                    {isCurrent ? <span className={styles.balanceRowMarker} aria-hidden="true" /> : null}
                  </span>
                </button>
              )
            })}
          </div>
        ) : (
          <div className={styles.balanceEmpty}>{menuEmptyLabel}</div>
        )}

        <div className={styles.dropdownDivider} />

        <Link
          to="/money/wallet"
          className={styles.walletLink}
          role="menuitem"
          tabIndex={open ? 0 : -1}
          onClick={() => setOpen(false)}
        >
          <span className={styles.walletIcon} aria-hidden="true">
            <WalletIcon />
          </span>
          <span className={styles.walletLabel}>{copy.wallet}</span>
          <span className={styles.walletArrow} aria-hidden="true">
            <ArrowRightIcon />
          </span>
        </Link>
      </div>
    </div>
  )
}

function HeaderNavLink({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => cx(styles.navLink, isActive && styles.navLinkActive)}
    >
      {children}
    </NavLink>
  )
}

function HeaderProfileMenu({
  isAuthed,
  copy,
  theme,
  onThemeChange,
  language,
  onLanguageChange,
  accountLabel,
  accountInitial,
  isActive,
  onLogout,
  isLoggingOut,
}) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    function onDocClick(event) {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    function onKeyDown(event) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  if (!isAuthed) return null

  return (
    <div
      className={cx(
        styles.profileControl,
        open && styles.profileControlOpen,
        isActive && styles.profileControlActive
      )}
      ref={wrapRef}
    >
      <button
        type="button"
        className={styles.profileTrigger}
        onClick={() => setOpen((currentOpen) => !currentOpen)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={copy.profileMenu}
      >
        <span className={styles.avatar} aria-hidden="true">
          {accountInitial}
        </span>
        <span className={styles.profileName}>{accountLabel}</span>
        <span className={styles.profileChevron} aria-hidden="true">
          <ChevronIcon />
        </span>
      </button>

      <div
        className={cx(styles.dropdownPanel, styles.profileDropdown, open && styles.dropdownOpen)}
        role="menu"
        aria-hidden={!open}
        aria-label={copy.profileMenu}
      >
        <Link
          to="/account/profile"
          className={styles.menuItem}
          role="menuitem"
          tabIndex={open ? 0 : -1}
          onClick={() => setOpen(false)}
        >
          <span className={styles.menuIcon} aria-hidden="true">
            <ProfileIcon />
          </span>
          <span className={styles.menuLabel}>{copy.profile}</span>
          <span className={styles.menuArrow} aria-hidden="true">
            <ArrowRightIcon />
          </span>
        </Link>

        <Link
          to="/money/wallet"
          className={styles.menuItem}
          role="menuitem"
          tabIndex={open ? 0 : -1}
          onClick={() => setOpen(false)}
        >
          <span className={styles.menuIcon} aria-hidden="true">
            <WalletIcon />
          </span>
          <span className={styles.menuLabel}>{copy.wallet}</span>
          <span className={styles.menuArrow} aria-hidden="true">
            <ArrowRightIcon />
          </span>
        </Link>

        <div className={styles.dropdownDivider} />

        <div className={styles.utilityRow}>
          <ThemeUtilityButton
            copy={copy}
            theme={theme}
            onToggle={() => onThemeChange(theme === 'light' ? 'dark' : 'light')}
          />
          <LanguageUtilityControl
            copy={copy}
            value={language}
            onChange={onLanguageChange}
          />
        </div>

        <div className={styles.dropdownDivider} />

        <button
          type="button"
          className={cx(styles.menuItem, styles.menuItemLogout)}
          onClick={async () => {
            await onLogout()
            setOpen(false)
          }}
          disabled={isLoggingOut}
          aria-busy={isLoggingOut}
          role="menuitem"
          tabIndex={open ? 0 : -1}
        >
          <span className={styles.menuIcon} aria-hidden="true">
            <LogoutIcon />
          </span>
          <span className={styles.menuLabel}>{copy.logout}</span>
        </button>
      </div>
    </div>
  )
}

export default function Header() {
  const location = useLocation()
  const routeKey = `${location.pathname}${location.search}`
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
      <div className={styles.inner}>
        <div className={styles.left}>
          <Link to="/" className={styles.logoLink} aria-label={copy.homeLabel}>
            <img className={styles.logoImage} src={brandLogo} alt="Prime Market" />
          </Link>

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
                onLogout={handleLogout}
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
    </header>
  )
}
