import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import brandLogo from '../../assets/logo.svg'

const LANGUAGE_OPTIONS = [
  {
    value: 'ru',
    code: 'RU',
    label: {
      ru: 'Русский',
      en: 'Russian',
    },
  },
  {
    value: 'en',
    code: 'EN',
    label: {
      ru: 'Английский',
      en: 'English',
    },
  },
]

const UI_COPY = {
  ru: {
    market: 'Маркет',
    dashboard: 'Кабинет',
    availableCurrencies: 'Доступные валюты',
    profile: 'Профиль',
    wallet: 'Кошелёк',
    logout: 'Выйти',
    notifications: 'Уведомления',
    language: 'Язык',
    theme: 'Тема',
  },
  en: {
    market: 'Market',
    dashboard: 'Dashboard',
    availableCurrencies: 'Available currencies',
    profile: 'Profile',
    wallet: 'Wallet',
    logout: 'Log out',
    notifications: 'Notifications',
    language: 'Language',
    theme: 'Theme',
  },
}

function formatAmount(value, language = 'en') {
  const numberValue = Number(value)
  if (!Number.isFinite(numberValue)) return '0.00'

  try {
    return new Intl.NumberFormat(language === 'ru' ? 'ru-RU' : 'en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numberValue)
  } catch {
    return numberValue.toFixed(2)
  }
}

function getUsernameInitial(username) {
  return username.toString().trim().slice(0, 1).toUpperCase() || 'U'
}

function getCopy(language) {
  return UI_COPY[language] || UI_COPY.en
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="m4 6 4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.7"
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

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8 18h8m-6 0a2 2 0 0 0 4 0m4-1.2H6.1l1.3-1.5c.35-.4.55-.92.55-1.45V11a5.95 5.95 0 0 1 11.9 0v2.85c0 .53.2 1.05.55 1.45l1.35 1.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
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
      <path
        d="M12.8 10h2.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M5.1 7.2h11.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
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

function Logo() {
  return (
    <Link to="/" className="header-lab-logo" aria-label="Prime Market home">
      <img src={brandLogo} alt="Prime Market" />
    </Link>
  )
}

function NavItems({ copy }) {
  return (
    <nav className="header-lab-nav" aria-label="Primary navigation">
      <Link to="/market" className="header-lab-nav__item is-active">
        {copy.market}
      </Link>
      <Link to="/dashboard" className="header-lab-nav__item">
        {copy.dashboard}
      </Link>
    </nav>
  )
}

function HeaderShell({ variant, children }) {
  return (
    <div className={`header-lab-shell header-lab-shell--${variant}`}>
      <div className="header-lab-shell__inner">{children}</div>
    </div>
  )
}

function IconButton({ title, open = false, onClick, children, className = '' }) {
  return (
    <button
      type="button"
      className={`header-lab-icon-button${open ? ' is-open' : ''}${
        className ? ` ${className}` : ''
      }`}
      onClick={onClick}
      aria-label={title}
      title={title}
    >
      {children}
    </button>
  )
}

function BalanceSelector({
  copy,
  wallets,
  activeCurrencyCode,
  onCurrencyChange,
  open,
  onToggle,
  language,
}) {
  const activeWallet =
    wallets.find((wallet) => wallet.code === activeCurrencyCode) || wallets[0] || { code: 'RUB' }

  return (
    <div className={`header-lab-balance${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className="header-lab-balance__button"
        onClick={onToggle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={copy.availableCurrencies}
      >
        <span className="header-lab-balance__amount">
          {formatAmount(activeWallet.balance, language)}
        </span>
        <span className="header-lab-balance__meta">
          <span className="header-lab-balance__currency">{activeWallet.code}</span>
          <span className="header-lab-balance__chevron">
            <ChevronIcon />
          </span>
        </span>
      </button>

      <div className="header-lab-dropdown header-lab-dropdown--balance" role="menu" aria-hidden={!open}>
        <div className="header-lab-dropdown__title">{copy.availableCurrencies}</div>
        <div className="header-lab-dropdown__list">
          {wallets.map((wallet) => (
            <button
              key={wallet.code}
              type="button"
              className={`header-lab-balance__row${
                wallet.code === activeCurrencyCode ? ' is-active' : ''
              }`}
              role="menuitemradio"
              aria-checked={wallet.code === activeCurrencyCode}
              tabIndex={open ? 0 : -1}
              onClick={() => onCurrencyChange(wallet.code)}
            >
              <span className="header-lab-balance__row-code">{wallet.code}</span>
              <span className="header-lab-balance__row-amount">
                {formatAmount(wallet.balance, language)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function LanguageSelector({ copy, value, onChange, open, onToggle, language }) {
  return (
    <div className={`header-lab-language${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className="header-lab-language__button"
        onClick={onToggle}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={copy.language}
      >
        <span className="header-lab-language__value">{value.toUpperCase()}</span>
        <span className="header-lab-language__chevron">
          <ChevronIcon />
        </span>
      </button>

      <div
        className="header-lab-dropdown header-lab-dropdown--language"
        role="listbox"
        aria-hidden={!open}
      >
        {LANGUAGE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`header-lab-language__option${
              option.value === value ? ' is-active' : ''
            }`}
            role="option"
            aria-selected={option.value === value}
            tabIndex={open ? 0 : -1}
            onClick={() => onChange(option.value)}
          >
            <span className="header-lab-language__option-code">{option.code}</span>
            <span className="header-lab-language__option-name">
              {option.label[language] || option.label.en}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

function NotificationButton({ title, count }) {
  return (
    <button type="button" className="header-lab-icon-button header-lab-notification" title={title} aria-label={title}>
      <BellIcon />
      {count > 0 ? <span className="header-lab-notification__badge">{count}</span> : null}
    </button>
  )
}

function ProfileMenu({
  copy,
  username,
  open,
  onToggle,
  onClose,
  onLogout,
  isAuthed,
  isLoggingOut,
}) {
  const initial = getUsernameInitial(username)

  return (
    <div className={`header-lab-profile${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className="header-lab-profile__button"
        onClick={onToggle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={copy.profile}
      >
        <span className="header-lab-profile__avatar" aria-hidden="true">
          {initial}
        </span>
        <span className="header-lab-profile__name">{username}</span>
        <span className="header-lab-profile__chevron">
          <ChevronIcon />
        </span>
      </button>

      <div className="header-lab-dropdown header-lab-dropdown--profile" role="menu" aria-hidden={!open}>
        <Link
          to="/account/profile"
          className="header-lab-profile__menu-item"
          role="menuitem"
          tabIndex={open ? 0 : -1}
          onClick={onClose}
        >
          <span className="header-lab-profile__menu-icon">
            <ProfileIcon />
          </span>
          <span className="header-lab-profile__menu-label">{copy.profile}</span>
          <span className="header-lab-profile__menu-arrow">
            <ArrowRightIcon />
          </span>
        </Link>

        <Link
          to="/money/wallet"
          className="header-lab-profile__menu-item"
          role="menuitem"
          tabIndex={open ? 0 : -1}
          onClick={onClose}
        >
          <span className="header-lab-profile__menu-icon">
            <WalletIcon />
          </span>
          <span className="header-lab-profile__menu-label">{copy.wallet}</span>
          <span className="header-lab-profile__menu-arrow">
            <ArrowRightIcon />
          </span>
        </Link>

        <div className="header-lab-profile__menu-divider" />

        <button
          type="button"
          className="header-lab-profile__menu-item header-lab-profile__menu-item--logout"
          onClick={async () => {
            await onLogout()
            onClose()
          }}
          disabled={!isAuthed || isLoggingOut}
          role="menuitem"
          tabIndex={open ? 0 : -1}
        >
          <span className="header-lab-profile__menu-icon">
            <LogoutIcon />
          </span>
          <span className="header-lab-profile__menu-label">{copy.logout}</span>
        </button>
      </div>
    </div>
  )
}

export default function HeaderLabShowcase({
  variant,
  label,
  description,
  wallets,
  activeCurrencyCode,
  onCurrencyChange,
  language,
  onLanguageChange,
  theme,
  onThemeToggle,
  notificationCount,
  username,
  isAuthed,
  onLogout,
  isLoggingOut,
}) {
  const copy = useMemo(() => getCopy(language), [language])
  const [openMenu, setOpenMenu] = useState(null)
  const wrapRef = useRef(null)

  useEffect(() => {
    if (!openMenu) return undefined

    function handlePointerDown(event) {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) {
        setOpenMenu(null)
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setOpenMenu(null)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [openMenu])

  function handleCurrencyPick(currencyCode) {
    onCurrencyChange(currencyCode)
    setOpenMenu(null)
  }

  function handleLanguagePick(nextLanguage) {
    onLanguageChange(nextLanguage)
    setOpenMenu(null)
  }

  return (
    <section className="header-lab-section">
      <div className="header-lab-section__meta">
        <h2 className="header-lab-section__label">{label}</h2>
      </div>

      <div ref={wrapRef}>
        <HeaderShell variant={variant}>
          <div className="header-lab-shell__left">
            <Logo />
            <NavItems copy={copy} />
          </div>

          <div className="header-lab-shell__right">
            <BalanceSelector
              copy={copy}
              wallets={wallets}
              activeCurrencyCode={activeCurrencyCode}
              onCurrencyChange={handleCurrencyPick}
              open={openMenu === 'balance'}
              onToggle={() => setOpenMenu((current) => (current === 'balance' ? null : 'balance'))}
              language={language}
            />

            <span className="header-lab-shell__divider" aria-hidden="true" />

            <IconButton title={copy.theme} onClick={onThemeToggle}>
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </IconButton>

            <LanguageSelector
              copy={copy}
              value={language}
              onChange={handleLanguagePick}
              open={openMenu === 'language'}
              onToggle={() =>
                setOpenMenu((current) => (current === 'language' ? null : 'language'))
              }
              language={language}
            />

            <NotificationButton title={copy.notifications} count={notificationCount} />

            <ProfileMenu
              copy={copy}
              username={username}
              open={openMenu === 'profile'}
              onToggle={() => setOpenMenu((current) => (current === 'profile' ? null : 'profile'))}
              onClose={() => setOpenMenu(null)}
              onLogout={onLogout}
              isAuthed={isAuthed}
              isLoggingOut={isLoggingOut}
            />
          </div>
        </HeaderShell>
      </div>

      <p className="header-lab-section__description">{description}</p>
    </section>
  )
}
