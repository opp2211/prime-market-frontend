/* eslint-disable react-refresh/only-export-components */
import { Link, NavLink } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import brandLogo from '../assets/trimmed.png'
import { getMyWallets } from '../api/wallets'
import { setDisplayCurrency, useDisplayCurrency } from '../app/displayCurrency'
import { getDisplayWallet, normalizeWalletEntries } from '../shared/lib/money'
import styles from './Header.module.css'

export const LANG_OPTIONS = [
  {
    value: 'ru',
    label: '\u0420\u0443\u0441\u0441\u043a\u0438\u0439',
    shortLabel: 'RU',
  },
  {
    value: 'en',
    label: 'English',
    shortLabel: 'EN',
  },
]

const HEADER_MESSAGES = {
  ru: {
    homeLabel: 'Prime Market \u2014 \u043d\u0430 \u0433\u043b\u0430\u0432\u043d\u0443\u044e',
    navAria: '\u0413\u043b\u0430\u0432\u043d\u0430\u044f \u043d\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u044f',
    market: '\u041c\u0430\u0440\u043a\u0435\u0442',
    dashboard: '\u041a\u0430\u0431\u0438\u043d\u0435\u0442',
    account: '\u0410\u043a\u043a\u0430\u0443\u043d\u0442',
    profileMenu: '\u041c\u0435\u043d\u044e \u043f\u0440\u043e\u0444\u0438\u043b\u044f',
    wallet: '\u041a\u043e\u0448\u0435\u043b\u0435\u043a',
    balance: '\u0411\u0430\u043b\u0430\u043d\u0441',
    balanceLoading: '\u0417\u0430\u0433\u0440\u0443\u0437\u043a\u0430',
    balanceUnavailable: '\u041d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u0435\u043d',
    availableCurrencies: '\u0414\u043e\u0441\u0442\u0443\u043f\u043d\u044b\u0435 \u0432\u0430\u043b\u044e\u0442\u044b',
    noBalances: '\u0412\u0430\u043b\u044e\u0442\u044b \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u043d\u044b',
    notifications: '\u0423\u0432\u0435\u0434\u043e\u043c\u043b\u0435\u043d\u0438\u044f',
    profile: '\u041f\u0440\u043e\u0444\u0438\u043b\u044c',
    logout: '\u0412\u044b\u0439\u0442\u0438',
    themeToggle: '\u041f\u0435\u0440\u0435\u043a\u043b\u044e\u0447\u0438\u0442\u044c \u0442\u0435\u043c\u0443',
    themeDark: '\u0422\u0435\u043c\u043d\u0430\u044f',
    themeLight: '\u0421\u0432\u0435\u0442\u043b\u0430\u044f',
    language: '\u042f\u0437\u044b\u043a',
    login: '\u0412\u043e\u0439\u0442\u0438',
    register: '\u0420\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044f',
    menu: '\u041c\u0435\u043d\u044e',
    openMenu: '\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u043c\u0435\u043d\u044e',
    closeMenu: '\u0417\u0430\u043a\u0440\u044b\u0442\u044c \u043c\u0435\u043d\u044e',
    closePanel: '\u0417\u0430\u043a\u0440\u044b\u0442\u044c',
    navigation: '\u041d\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u044f',
    appearance: '\u0412\u043d\u0435\u0448\u043d\u0438\u0439 \u0432\u0438\u0434',
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
    themeDark: 'Dark',
    themeLight: 'Light',
    language: 'Language',
    login: 'Log in',
    register: 'Sign up',
    menu: 'Menu',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    closePanel: 'Close',
    navigation: 'Navigation',
    appearance: 'Appearance',
  },
}

export function cx(...values) {
  return values.filter(Boolean).join(' ')
}

export function getHeaderCopy(language = 'ru') {
  return HEADER_MESSAGES[language] || HEADER_MESSAGES.ru
}

export function formatHeaderAmount(value, language = 'ru') {
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

export function getHeaderUsername(user, fallback) {
  const source = user?.user && typeof user.user === 'object' ? user.user : user
  const username = source?.username || source?.login || ''
  return username.toString().trim() || fallback
}

export function getHeaderUserInitial(label) {
  return (label || 'A').toString().trim().slice(0, 1).toUpperCase() || 'A'
}

export function useDismissibleLayer({ open, ref, onClose, pointerEvent = 'mousedown' }) {
  useEffect(() => {
    if (!open) return undefined

    function handlePointer(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        onClose()
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener(pointerEvent, handlePointer)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener(pointerEvent, handlePointer)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose, open, pointerEvent, ref])
}

export function ChevronIcon() {
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

export function MoonIcon() {
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

export function SunIcon() {
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

export function GlobeIcon() {
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

export function ProfileIcon() {
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

export function WalletIcon() {
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

export function LogoutIcon() {
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

export function ArrowRightIcon() {
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

export function MarketIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M4.6 5.4h10.8a1.6 1.6 0 0 1 1.57 1.9l-1.02 6a1.6 1.6 0 0 1-1.58 1.3H5.56a1.6 1.6 0 0 1-1.58-1.3l-1.02-6a1.6 1.6 0 0 1 1.64-1.9Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M7.2 8.2h5.6M8.4 11h3.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M7.2 5.4V4.6A1.6 1.6 0 0 1 8.8 3h2.4a1.6 1.6 0 0 1 1.6 1.6v.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function DashboardIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M4.5 4.5h4.7v4.7H4.5V4.5ZM10.8 4.5h4.7v7.1h-4.7V4.5ZM4.5 10.8h4.7v4.7H4.5v-4.7ZM10.8 13.2h4.7v2.3h-4.7v-2.3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="m6 6 12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function ThemeUtilityButton({ copy, theme, onToggle }) {
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

export function LanguageUtilityControl({ copy, value, onChange }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)
  const current = LANG_OPTIONS.find((option) => option.value === value) || LANG_OPTIONS[0]

  useDismissibleLayer({
    open,
    ref: wrapRef,
    onClose: () => setOpen(false),
  })

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

export function useHeaderBalance({ isAuthed, copy, language }) {
  const { currencyCode } = useDisplayCurrency()
  const [wallets, setWallets] = useState({})
  const [status, setStatus] = useState(isAuthed ? 'loading' : 'idle')
  const [error, setError] = useState('')

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

  let amountLabel = formatHeaderAmount(activeWallet?.balance ?? 0, language)
  if (status === 'loading') amountLabel = copy.balanceLoading
  if (status === 'error') amountLabel = copy.balanceUnavailable

  let menuEmptyLabel = copy.noBalances
  if (status === 'loading') menuEmptyLabel = copy.balanceLoading
  if (status === 'error') menuEmptyLabel = error || copy.balanceUnavailable

  return {
    items,
    status,
    error,
    amountLabel,
    menuEmptyLabel,
    activeCurrencyCode,
    selectCurrency: setDisplayCurrency,
  }
}

function WalletAction({
  copy,
  tabIndex,
  walletHref = '/money/wallet',
  onWalletSelect,
}) {
  if (walletHref) {
    return (
      <Link
        to={walletHref}
        className={styles.walletLink}
        role="menuitem"
        tabIndex={tabIndex}
        onClick={onWalletSelect}
      >
        <span className={styles.walletIcon} aria-hidden="true">
          <WalletIcon />
        </span>
        <span className={styles.walletLabel}>{copy.wallet}</span>
        <span className={styles.walletArrow} aria-hidden="true">
          <ArrowRightIcon />
        </span>
      </Link>
    )
  }

  return (
    <button
      type="button"
      className={styles.walletLink}
      role="menuitem"
      tabIndex={tabIndex}
      onClick={onWalletSelect}
    >
      <span className={styles.walletIcon} aria-hidden="true">
        <WalletIcon />
      </span>
      <span className={styles.walletLabel}>{copy.wallet}</span>
      <span className={styles.walletArrow} aria-hidden="true">
        <ArrowRightIcon />
      </span>
    </button>
  )
}

export function HeaderBalanceMenuContent({
  copy,
  language,
  balance,
  isVisible = false,
  onClose,
  walletHref = '/money/wallet',
  onWalletSelect,
}) {
  const tabIndex = isVisible ? 0 : -1

  return (
    <>
      {balance.status === 'ready' && balance.items.length > 0 ? (
        <div className={styles.balanceList}>
          {balance.items.map((item) => {
            const isCurrent = item.code === balance.activeCurrencyCode

            return (
              <button
                key={item.code}
                type="button"
                className={cx(styles.balanceRow, isCurrent && styles.balanceRowActive)}
                onClick={() => {
                  balance.selectCurrency(item.code)
                  onClose?.()
                }}
                role="menuitemradio"
                aria-checked={isCurrent}
                tabIndex={tabIndex}
              >
                <span className={styles.balanceRowMain}>
                  <span className={styles.balanceRowCode}>{item.code}</span>
                </span>
                <span className={styles.balanceRowMeta}>
                  <span className={styles.balanceRowAmount}>
                    {formatHeaderAmount(item.balance, language)}
                  </span>
                  {isCurrent ? (
                    <span className={styles.balanceRowMarker} aria-hidden="true" />
                  ) : null}
                </span>
              </button>
            )
          })}
        </div>
      ) : (
        <div className={styles.balanceEmpty}>{balance.menuEmptyLabel}</div>
      )}

      <div className={styles.dropdownDivider} />

      <WalletAction
        copy={copy}
        tabIndex={tabIndex}
        walletHref={walletHref}
        onWalletSelect={() => {
          onWalletSelect?.()
          onClose?.()
        }}
      />
    </>
  )
}

export function HeaderBalanceControl({
  isAuthed,
  copy,
  language,
  isActive = false,
  walletHref = '/money/wallet',
  onWalletSelect,
}) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)
  const balance = useHeaderBalance({ isAuthed, copy, language })

  useDismissibleLayer({
    open,
    ref: wrapRef,
    onClose: () => setOpen(false),
  })

  if (!isAuthed) return null

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
              balance.status !== 'ready' && styles.balanceAmountState
            )}
          >
            {balance.amountLabel}
          </span>
          <span className={styles.balanceCode}>{balance.activeCurrencyCode}</span>
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
        <HeaderBalanceMenuContent
          copy={copy}
          language={language}
          balance={balance}
          isVisible={open}
          onClose={() => setOpen(false)}
          walletHref={walletHref}
          onWalletSelect={onWalletSelect}
        />
      </div>
    </div>
  )
}

export function HeaderNavLink({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => cx(styles.navLink, isActive && styles.navLinkActive)}
    >
      {children}
    </NavLink>
  )
}

function MenuAction({
  href,
  label,
  icon,
  tabIndex,
  onSelect,
}) {
  if (href) {
    return (
      <Link
        to={href}
        className={styles.menuItem}
        role="menuitem"
        tabIndex={tabIndex}
        onClick={onSelect}
      >
        <span className={styles.menuIcon} aria-hidden="true">
          {icon}
        </span>
        <span className={styles.menuLabel}>{label}</span>
        <span className={styles.menuArrow} aria-hidden="true">
          <ArrowRightIcon />
        </span>
      </Link>
    )
  }

  return (
    <button
      type="button"
      className={styles.menuItem}
      role="menuitem"
      tabIndex={tabIndex}
      onClick={onSelect}
    >
      <span className={styles.menuIcon} aria-hidden="true">
        {icon}
      </span>
      <span className={styles.menuLabel}>{label}</span>
      <span className={styles.menuArrow} aria-hidden="true">
        <ArrowRightIcon />
      </span>
    </button>
  )
}

export function HeaderProfileMenuContent({
  copy,
  theme,
  onThemeChange,
  language,
  onLanguageChange,
  onLogout,
  isLoggingOut,
  isVisible = false,
  onClose,
  profileHref = '/account/profile',
  walletHref = '/money/wallet',
  onProfileSelect,
  onWalletSelect,
}) {
  const tabIndex = isVisible ? 0 : -1

  return (
    <>
      <MenuAction
        href={profileHref}
        label={copy.profile}
        icon={<ProfileIcon />}
        tabIndex={tabIndex}
        onSelect={() => {
          onProfileSelect?.()
          onClose?.()
        }}
      />

      <MenuAction
        href={walletHref}
        label={copy.wallet}
        icon={<WalletIcon />}
        tabIndex={tabIndex}
        onSelect={() => {
          onWalletSelect?.()
          onClose?.()
        }}
      />

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
          onClose?.()
        }}
        disabled={isLoggingOut}
        aria-busy={isLoggingOut}
        role="menuitem"
        tabIndex={tabIndex}
      >
        <span className={styles.menuIcon} aria-hidden="true">
          <LogoutIcon />
        </span>
        <span className={styles.menuLabel}>{copy.logout}</span>
      </button>
    </>
  )
}

export function HeaderProfileMenu({
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
  profileHref = '/account/profile',
  walletHref = '/money/wallet',
  onProfileSelect,
  onWalletSelect,
}) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)

  useDismissibleLayer({
    open,
    ref: wrapRef,
    onClose: () => setOpen(false),
  })

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
        <HeaderProfileMenuContent
          copy={copy}
          theme={theme}
          onThemeChange={onThemeChange}
          language={language}
          onLanguageChange={onLanguageChange}
          onLogout={onLogout}
          isLoggingOut={isLoggingOut}
          isVisible={open}
          onClose={() => setOpen(false)}
          profileHref={profileHref}
          walletHref={walletHref}
          onProfileSelect={onProfileSelect}
          onWalletSelect={onWalletSelect}
        />
      </div>
    </div>
  )
}

export function HeaderLogoLink({
  copy,
  compact = false,
  className,
}) {
  if (compact) {
    return (
      <Link to="/" className={cx(styles.logoCompact, className)} aria-label={copy.homeLabel}>
        <span className={styles.logoCompactMark} aria-hidden="true">
          PM
        </span>
        <span className={styles.logoCompactText}>Prime Market</span>
      </Link>
    )
  }

  return (
    <Link to="/" className={cx(styles.logoLink, className)} aria-label={copy.homeLabel}>
      <img className={styles.logoImage} src={brandLogo} alt="Prime Market" />
    </Link>
  )
}
