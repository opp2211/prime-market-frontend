import { Link, NavLink, useLocation } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import brandLogo from '../assets/trimmed.png'
import { applyTheme, getInitialTheme } from '../app/theme'
import { logout, useAuth } from '../app/auth'
import { useI18n } from '../app/i18n'
import { useUser } from '../app/user'
import { getMyWallets } from '../api/wallets'
import { setDisplayCurrency, useDisplayCurrency } from '../app/displayCurrency'

const LANG_OPTIONS = [
  { value: 'ru', label: '\u0420\u0443\u0441\u0441\u043a\u0438\u0439', shortLabel: 'RU' },
  { value: 'en', label: 'English', shortLabel: 'EN' },
]

const HEADER_MESSAGES = {
  ru: {
    navAria: '\u0413\u043b\u0430\u0432\u043d\u0430\u044f \u043d\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u044f',
    market: '\u041c\u0430\u0440\u043a\u0435\u0442',
    dashboard: '\u041a\u0430\u0431\u0438\u043d\u0435\u0442',
    backoffice: 'Backoffice',
    account: 'Account',
    accountMenu: '\u041c\u0435\u043d\u044e \u0430\u043a\u043a\u0430\u0443\u043d\u0442\u0430',
    accountSettings:
      '\u041d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438 \u0430\u043a\u043a\u0430\u0443\u043d\u0442\u0430',
    wallet: '\u041a\u043e\u0448\u0435\u043b\u0435\u043a',
    balance: '\u0411\u0430\u043b\u0430\u043d\u0441',
    balanceLoading: '\u0417\u0430\u0433\u0440\u0443\u0437\u043a\u0430',
    balanceUnavailable: '\u041d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u0435\u043d',
    availableCurrencies:
      '\u0414\u043e\u0441\u0442\u0443\u043f\u043d\u044b\u0435 \u0432\u0430\u043b\u044e\u0442\u044b',
    noOtherBalances:
      '\u0412\u0430\u043b\u044e\u0442\u044b \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u043d\u044b',
    systemControls: '\u0422\u0435\u043c\u0430 \u0438 \u044f\u0437\u044b\u043a',
    settings: '\u041f\u0440\u043e\u0444\u0438\u043b\u044c',
    logout: '\u0412\u044b\u0439\u0442\u0438',
  },
  en: {
    navAria: 'Primary navigation',
    market: 'Market',
    dashboard: 'Dashboard',
    backoffice: 'Backoffice',
    account: 'Account',
    accountMenu: 'Account menu',
    accountSettings: 'Account settings',
    wallet: 'Wallet',
    balance: 'Balance',
    balanceLoading: 'Loading',
    balanceUnavailable: 'Unavailable',
    availableCurrencies: 'Available currencies',
    noOtherBalances: 'Currencies unavailable',
    systemControls: 'Theme and language',
    settings: 'Profile',
    logout: 'Log out',
  },
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

function ThemeSwitch({ value, onChange, label, ariaLabel, title }) {
  return (
    <button
      type="button"
      className={`theme-control ${value === 'dark' ? 'is-dark' : 'is-light'}`}
      onClick={() => onChange(value === 'light' ? 'dark' : 'light')}
      aria-label={ariaLabel}
      title={title}
    >
      <span className="theme-control__icon" aria-hidden="true" />
      <span className="theme-control__label">{label}</span>
    </button>
  )
}

function LanguageSwitch({ value, onChange, ariaLabel, title }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)
  const current = LANG_OPTIONS.find((option) => option.value === value) || LANG_OPTIONS[0]

  useEffect(() => {
    if (!open) return
    function onDocClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    function onKeyDown(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  function handlePick(next) {
    onChange(next)
    setOpen(false)
  }

  return (
    <div className={`lang ${open ? 'is-open' : ''}`} ref={wrapRef}>
      <button
        type="button"
        className="lang__button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        title={title}
      >
        <span className="lang__label">{current?.shortLabel || value}</span>
        <span className="lang__chevron" aria-hidden="true" />
      </button>
      <div
        className="lang__list"
        role="listbox"
        aria-label={ariaLabel}
        aria-hidden={!open}
      >
        {LANG_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`lang__option ${option.value === value ? 'is-active' : ''}`}
            role="option"
            aria-selected={option.value === value}
            tabIndex={open ? 0 : -1}
            onClick={() => handlePick(option.value)}
          >
            <span className="lang__option-code">{option.shortLabel}</span>
            <span className="lang__option-name">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function normalizeWalletItems(wallets) {
  if (!wallets || typeof wallets !== 'object' || Array.isArray(wallets)) return []

  return Object.entries(wallets)
    .map(([code, data]) => ({
      code: code.toString().trim().toUpperCase(),
      balance: data?.balance,
    }))
    .filter((item) => item.code)
}

function HeaderBalanceControl({ isAuthed, copy, language, isActive = false }) {
  const { currencyCode } = useDisplayCurrency()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)
  const [wallets, setWallets] = useState({})
  const [status, setStatus] = useState(isAuthed ? 'loading' : 'idle')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    function onDocClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    function onKeyDown(e) {
      if (e.key === 'Escape') setOpen(false)
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

    if (!isAuthed) {
      return () => {
        active = false
      }
    }

    const loadWallets = async () => {
      setStatus('loading')
      setError('')

      try {
        const res = await getMyWallets()
        if (!active) return
        setWallets(res?.data || {})
        setStatus('ready')
      } catch (err) {
        if (!active) return
        setError(err?.message || copy.balanceUnavailable)
        setStatus('error')
      }
    }

    loadWallets()

    return () => {
      active = false
    }
  }, [copy.balanceUnavailable, isAuthed])

  if (!isAuthed) return null

  const items = normalizeWalletItems(wallets)
  const current = items.find((item) => item.code === currencyCode)
  const currencyItems = current ? items : [{ code: currencyCode, balance: 0 }, ...items]
  const currentAmount = formatHeaderAmount(current?.balance ?? 0, language)
  let amountLabel = currentAmount
  if (status === 'loading') amountLabel = copy.balanceLoading
  if (status === 'error') amountLabel = copy.balanceUnavailable
  let menuEmptyLabel = copy.noOtherBalances
  if (status === 'loading') menuEmptyLabel = copy.balanceLoading
  if (status === 'error') menuEmptyLabel = copy.balanceUnavailable

  function handleCurrencyPick(code) {
    setDisplayCurrency(code)
    setOpen(false)
  }

  return (
    <div
      className={`balance-control balance-control--${status}${open ? ' is-open' : ''}${
        isActive ? ' is-active' : ''
      }`}
      ref={wrapRef}
    >
      <button
        type="button"
        className="balance-control__trigger"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={copy.availableCurrencies}
        title={error || copy.availableCurrencies}
      >
        <span className="balance-control__amount">{amountLabel}</span>
        <span className="balance-control__code">{currencyCode}</span>
        <span className="balance-control__chevron" aria-hidden="true" />
      </button>

      <div
        className="balance-control__popover"
        role="menu"
        aria-label={copy.availableCurrencies}
        aria-hidden={!open}
      >
        <div className="balance-control__popover-title">{copy.availableCurrencies}</div>
        {status === 'ready' && currencyItems.length > 0 ? (
          <div className="balance-control__list">
            {currencyItems.map((item) => (
              <button
                key={item.code}
                type="button"
                className={`balance-control__row${
                  item.code === currencyCode ? ' is-active' : ''
                }`}
                onClick={() => handleCurrencyPick(item.code)}
                role="menuitemradio"
                aria-checked={item.code === currencyCode}
                tabIndex={open ? 0 : -1}
              >
                <span className="balance-control__row-code">{item.code}</span>
                <strong>{formatHeaderAmount(item.balance, language)}</strong>
              </button>
            ))}
          </div>
        ) : (
          <div className="balance-control__empty">{menuEmptyLabel}</div>
        )}
        <div className="balance-control__divider" />
        <Link
          to="/money/wallet"
          className="balance-control__wallet-link"
          role="menuitem"
          tabIndex={open ? 0 : -1}
        >
          <span className="balance-control__wallet-icon" aria-hidden="true" />
          <span className="balance-control__wallet-label">{copy.wallet}</span>
          <span className="balance-control__wallet-arrow" aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}

function HeaderNavLink({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `product-nav__link${isActive ? ' is-active' : ''}`}
    >
      {children}
    </NavLink>
  )
}

export default function Header() {
  const [theme, setTheme] = useState(getInitialTheme)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const accountRef = useRef(null)
  const location = useLocation()
  const { isAuthed } = useAuth()
  const { user, permissions } = useUser()
  const { language, setLanguage, t } = useI18n()
  const copy = getHeaderCopy(language)
  const accountLabel = getHeaderUsername(user, copy.account)
  const accountInitial = getHeaderUserInitial(accountLabel)
  const accountActive = location.pathname.startsWith('/account')
  const moneyActive = location.pathname.startsWith('/money')
  const hasBackofficeAccess = permissions?.includes('BACKOFFICE_ACCESS')

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    setAccountOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!accountOpen) return undefined

    function onDocClick(e) {
      if (accountRef.current && !accountRef.current.contains(e.target)) setAccountOpen(false)
    }

    function onKeyDown(e) {
      if (e.key === 'Escape') setAccountOpen(false)
    }

    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [accountOpen])

  async function handleLogout() {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    try {
      await logout()
    } finally {
      setIsLoggingOut(false)
      setAccountOpen(false)
    }
  }

  return (
    <header className={`header header--black header--product${isAuthed ? '' : ' header--guest'}`}>
      <div className="container header__inner header__inner--tall header__inner--product">
        <div className="header__left">
          <Link to="/" className="brand brand--big brand--wordmark" aria-label={t('brand.aria')}>
            <img className="brand__wordmark" src={brandLogo} alt="Prime Market" />
          </Link>

          <nav className="product-nav" aria-label={copy.navAria}>
            <HeaderNavLink to="/market">{copy.market}</HeaderNavLink>
            <HeaderNavLink to="/dashboard">{copy.dashboard}</HeaderNavLink>
            {hasBackofficeAccess ? (
              <HeaderNavLink to="/backoffice">{copy.backoffice}</HeaderNavLink>
            ) : null}
          </nav>
        </div>

        <div className="header__right header__right--product">
          <HeaderBalanceControl
            isAuthed={isAuthed}
            copy={copy}
            language={language}
            isActive={moneyActive}
          />

          <div className="header-control-group" aria-label={copy.systemControls}>
            <ThemeSwitch
              value={theme}
              onChange={setTheme}
              label={theme === 'light' ? t('header.themeLight') : t('header.themeDark')}
              ariaLabel={t('header.themeToggle')}
              title={t('header.themeToggle')}
            />
            <LanguageSwitch
              value={language}
              onChange={setLanguage}
              ariaLabel={t('header.languageAria')}
              title={t('header.languageTitle')}
            />
          </div>

          {isAuthed ? (
            <div
              className={`account-entry${accountOpen ? ' is-open' : ''}${
                accountActive ? ' is-active' : ''
              }`}
              ref={accountRef}
            >
              <button
                type="button"
                className="account-entry__main"
                onClick={() => setAccountOpen((value) => !value)}
                aria-haspopup="menu"
                aria-expanded={accountOpen}
                aria-label={copy.accountMenu}
              >
                <span className="account-entry__avatar" aria-hidden="true">
                  {accountInitial}
                </span>
                <span className="account-entry__label">{accountLabel}</span>
                <span className="account-entry__chevron" aria-hidden="true" />
              </button>

              <div
                className="dropdown account-dropdown"
                role="menu"
                aria-label={copy.accountMenu}
                aria-hidden={!accountOpen}
              >
                <Link
                  to="/account/profile"
                  className="dropdown__item"
                  role="menuitem"
                  tabIndex={accountOpen ? 0 : -1}
                  onClick={() => setAccountOpen(false)}
                >
                  <span
                    className="account-dropdown__icon account-dropdown__icon--settings"
                    aria-hidden="true"
                  />
                  <span className="account-dropdown__label">{copy.settings}</span>
                  <span className="account-dropdown__arrow" aria-hidden="true" />
                </Link>
                <Link
                  to="/money/wallet"
                  className="dropdown__item"
                  role="menuitem"
                  tabIndex={accountOpen ? 0 : -1}
                  onClick={() => setAccountOpen(false)}
                >
                  <span
                    className="account-dropdown__icon account-dropdown__icon--wallet"
                    aria-hidden="true"
                  />
                  <span className="account-dropdown__label">{copy.wallet}</span>
                  <span className="account-dropdown__arrow" aria-hidden="true" />
                </Link>
                <div className="dropdown__divider" />
                <button
                  className="dropdown__item dropdown__item--action"
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  aria-busy={isLoggingOut}
                  role="menuitem"
                  tabIndex={accountOpen ? 0 : -1}
                >
                  {copy.logout}
                </button>
              </div>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn--primary header__login">
                {t('header.login')}
              </Link>
              <Link to="/register" className="btn btn--secondary header__login">
                {t('header.register')}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
