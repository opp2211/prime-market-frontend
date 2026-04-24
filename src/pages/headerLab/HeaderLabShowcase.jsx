import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import productionLogo from '../../assets/trimmed.png'

const PROFILE_ROUTE = '/account/profile'
const WALLET_ROUTE = '/money/wallet'
const NOTIFICATIONS_ROUTE = '/notifications'

const UI_COPY = {
  ru: {
    market: 'Маркет',
    dashboard: 'Кабинет',
    availableCurrencies: 'AVAILABLE CURRENCIES',
    profile: 'Профиль',
    wallet: 'Кошелек',
    logout: 'Выйти',
    notifications: 'Уведомления',
    language: 'Язык',
    theme: 'Тема',
    light: 'Light',
    dark: 'Dark',
  },
  en: {
    market: 'Market',
    dashboard: 'Dashboard',
    availableCurrencies: 'AVAILABLE CURRENCIES',
    profile: 'Profile',
    wallet: 'Wallet',
    logout: 'Log out',
    notifications: 'Notifications',
    language: 'Language',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
  },
}

function createVariant(overrides = {}) {
  return {
    height: 68,
    maxWidth: 1480,
    innerPadding: 32,
    innerPaddingCompact: 24,
    logo: {
      src: productionLogo,
      alt: 'Prime Market',
      width: 138,
      maxHeight: 42,
      gap: 20,
      ...overrides.logo,
    },
    nav: {
      height: 42,
      paddingX: 12,
      fontSize: 14,
      fontWeight: 600,
      radius: 10,
      gap: 4,
      ...overrides.nav,
    },
    rightGap: 8,
    balance: {
      height: 44,
      minWidth: 176,
      paddingX: 14,
      bg: 'rgba(255,255,255,.055)',
      hoverBg: 'rgba(255,255,255,.085)',
      openBg: 'rgba(255,255,255,.095)',
      openBorder: 'rgba(247,147,26,.22)',
      fontSize: 15,
      dropdownWidth: 310,
      radius: 12,
      ...overrides.balance,
    },
    tool: {
      size: 40,
      radius: 10,
      iconSize: 19,
      ...overrides.tool,
    },
    profile: {
      height: 44,
      padding: '0 10px 0 7px',
      radius: 12,
      avatarSize: 30,
      avatarFontSize: 12,
      nameFontSize: 14,
      nameWeight: 700,
      nameMaxWidth: 112,
      showName: true,
      ...overrides.profile,
    },
    layoutOrder: ['balance', 'notifications', 'profile'],
    profileMenu: {
      mode: 'rows',
      dropdownWidth: 224,
      showLanguageRow: true,
      showThemeRow: true,
      utilityPlacement: 'middle',
      utilityHeight: 44,
      utilityBg: 'rgba(255,255,255,.03)',
      utilityValueFontSize: 12,
      utilityValueColor: '#A1A1AA',
      ...overrides.profileMenu,
    },
  }
}

const VARIANT_CONFIGS = {
  'iter4-hidden-utilities': createVariant({}),
  'iter5-a': createVariant({
    profileMenu: {
      mode: 'utility',
      dropdownWidth: 248,
      utilityPlacement: 'middle',
    },
  }),
  'iter5-b': createVariant({
    profileMenu: {
      mode: 'utility',
      dropdownWidth: 248,
      utilityPlacement: 'top',
    },
  }),
  'iter5-c': createVariant({
    profileMenu: {
      mode: 'utility',
      dropdownWidth: 248,
      utilityPlacement: 'middle',
      utilityHeight: 40,
      utilityBg: 'rgba(255,255,255,.02)',
      utilityValueFontSize: 11,
    },
  }),
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

function getThemeValueLabel(theme, copy) {
  return theme === 'dark' ? copy.dark : copy.light
}

function buildShellStyle(config) {
  return {
    '--hl-height': `${config.height}px`,
    '--hl-max-width': `${config.maxWidth}px`,
    '--hl-inner-padding-x': `${config.innerPadding}px`,
    '--hl-inner-padding-x-compact': `${config.innerPaddingCompact}px`,
    '--hl-logo-width': `${config.logo.width}px`,
    '--hl-logo-max-height': `${config.logo.maxHeight}px`,
    '--hl-logo-gap': `${config.logo.gap}px`,
    '--hl-nav-gap': `${config.nav.gap}px`,
    '--hl-nav-height': `${config.nav.height}px`,
    '--hl-nav-padding-x': `${config.nav.paddingX}px`,
    '--hl-nav-font-size': `${config.nav.fontSize}px`,
    '--hl-nav-font-weight': `${config.nav.fontWeight}`,
    '--hl-nav-radius': `${config.nav.radius}px`,
    '--hl-right-gap': `${config.rightGap}px`,
    '--hl-balance-height': `${config.balance.height}px`,
    '--hl-balance-min-width': `${config.balance.minWidth}px`,
    '--hl-balance-padding-x': `${config.balance.paddingX}px`,
    '--hl-balance-radius': `${config.balance.radius}px`,
    '--hl-balance-bg': config.balance.bg,
    '--hl-balance-hover-bg': config.balance.hoverBg,
    '--hl-balance-open-bg': config.balance.openBg,
    '--hl-balance-open-border': config.balance.openBorder,
    '--hl-balance-font-size': `${config.balance.fontSize}px`,
    '--hl-balance-dropdown-width': `${config.balance.dropdownWidth}px`,
    '--hl-tool-size': `${config.tool.size}px`,
    '--hl-tool-radius': `${config.tool.radius}px`,
    '--hl-icon-size': `${config.tool.iconSize}px`,
    '--hl-profile-height': `${config.profile.height}px`,
    '--hl-profile-padding': config.profile.padding,
    '--hl-profile-radius': `${config.profile.radius}px`,
    '--hl-avatar-size': `${config.profile.avatarSize}px`,
    '--hl-avatar-font-size': `${config.profile.avatarFontSize}px`,
    '--hl-profile-font-size': `${config.profile.nameFontSize}px`,
    '--hl-profile-font-weight': `${config.profile.nameWeight}`,
    '--hl-profile-name-display': config.profile.showName ? 'inline-flex' : 'none',
    '--hl-profile-name-max-width': `${config.profile.nameMaxWidth}px`,
    '--hl-profile-dropdown-width': `${config.profileMenu.dropdownWidth}px`,
    '--hl-account-utility-height': `${config.profileMenu.utilityHeight}px`,
    '--hl-account-utility-bg': config.profileMenu.utilityBg,
    '--hl-account-utility-value-size': `${config.profileMenu.utilityValueFontSize}px`,
    '--hl-account-utility-value-color': config.profileMenu.utilityValueColor,
  }
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

function HeaderShell({ variant, style, children }) {
  return (
    <div className={`header-lab-shell header-lab-shell--${variant}`} style={style}>
      <div className="header-lab-shell__inner">{children}</div>
    </div>
  )
}

function Logo({ src, alt }) {
  return (
    <Link to="/" className="header-lab-logo" aria-label="Prime Market home">
      <img src={src} alt={alt} />
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

function BalanceSelector({
  copy,
  wallets,
  activeCurrencyCode,
  onCurrencyChange,
  open,
  onToggle,
  onClose,
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

      <div
        className="header-lab-dropdown header-lab-dropdown--balance"
        role="menu"
        aria-hidden={!open}
      >
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
              onClick={() => {
                onCurrencyChange(wallet.code)
                onClose()
              }}
            >
              <span className="header-lab-balance__row-code">{wallet.code}</span>
              <span className="header-lab-balance__row-amount">
                {formatAmount(wallet.balance, language)}
              </span>
            </button>
          ))}
        </div>

        <div className="header-lab-dropdown__divider" />

        <Link
          to={WALLET_ROUTE}
          className="header-lab-balance__wallet-row"
          role="menuitem"
          tabIndex={open ? 0 : -1}
          onClick={onClose}
        >
          <span className="header-lab-balance__wallet-icon">
            <WalletIcon />
          </span>
          <span className="header-lab-balance__wallet-label">{copy.wallet}</span>
          <span className="header-lab-balance__wallet-arrow">
            <ArrowRightIcon />
          </span>
        </Link>
      </div>
    </div>
  )
}

function NotificationButton({ title, count, onClick }) {
  return (
    <Link
      to={NOTIFICATIONS_ROUTE}
      className="header-lab-icon-button header-lab-notification"
      title={title}
      aria-label={title}
      onClick={onClick}
    >
      <BellIcon />
      {count > 0 ? <span className="header-lab-notification__badge">{count}</span> : null}
    </Link>
  )
}

function ThemeQuickControl({ copy, theme, onClick }) {
  return (
    <button
      type="button"
      className="header-lab-account-utility__control"
      onClick={onClick}
      aria-label={copy.theme}
      title={copy.theme}
    >
      <span className="header-lab-account-utility__meta">
        <span className="header-lab-account-utility__icon" aria-hidden="true">
          {theme === 'dark' ? <MoonIcon /> : <SunIcon />}
        </span>
        <span className="header-lab-account-utility__label">{copy.theme}</span>
      </span>
      <span className="header-lab-account-utility__value">{getThemeValueLabel(theme, copy)}</span>
    </button>
  )
}

function LanguageQuickControl({ copy, language, onClick }) {
  return (
    <button
      type="button"
      className="header-lab-account-utility__control"
      onClick={onClick}
      aria-label={copy.language}
      title={copy.language}
    >
      <span className="header-lab-account-utility__meta">
        <span className="header-lab-account-utility__icon" aria-hidden="true">
          <GlobeIcon />
        </span>
        <span className="header-lab-account-utility__label">{copy.language}</span>
      </span>
      <span className="header-lab-account-utility__value">{language.toUpperCase()}</span>
    </button>
  )
}

function AccountUtilityRow({ copy, theme, onThemeToggle, language, onLanguageToggle }) {
  return (
    <div className="header-lab-account-utility" role="group" aria-label="Quick settings">
      <ThemeQuickControl copy={copy} theme={theme} onClick={onThemeToggle} />
      <LanguageQuickControl copy={copy} language={language} onClick={onLanguageToggle} />
    </div>
  )
}

function AccountMenuRow({ icon, label, to, onClick, open }) {
  return (
    <Link
      to={to}
      className="header-lab-profile__menu-item"
      role="menuitem"
      tabIndex={open ? 0 : -1}
      onClick={onClick}
    >
      <span className="header-lab-profile__menu-icon">{icon}</span>
      <span className="header-lab-profile__menu-label">{label}</span>
      <span className="header-lab-profile__menu-arrow">
        <ArrowRightIcon />
      </span>
    </Link>
  )
}

function AccountMenu({
  copy,
  username,
  open,
  onToggle,
  onClose,
  onLogout,
  isAuthed,
  isLoggingOut,
  language,
  onLanguageChange,
  theme,
  onThemeToggle,
  profileMenu,
}) {
  const initial = getUsernameInitial(username)

  const utilityRow = (
    <AccountUtilityRow
      copy={copy}
      theme={theme}
      onThemeToggle={onThemeToggle}
      language={language}
      onLanguageToggle={() => onLanguageChange(language === 'ru' ? 'en' : 'ru')}
    />
  )

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

      <div
        className="header-lab-dropdown header-lab-dropdown--profile"
        role="menu"
        aria-hidden={!open}
      >
        {profileMenu.mode === 'utility' && profileMenu.utilityPlacement === 'top' ? (
          <>
            {utilityRow}
            <div className="header-lab-dropdown__divider" />
          </>
        ) : null}

        <AccountMenuRow
          icon={<ProfileIcon />}
          label={copy.profile}
          to={PROFILE_ROUTE}
          onClick={onClose}
          open={open}
        />

        <AccountMenuRow
          icon={<WalletIcon />}
          label={copy.wallet}
          to={WALLET_ROUTE}
          onClick={onClose}
          open={open}
        />

        {profileMenu.mode === 'rows' && profileMenu.showThemeRow ? (
          <button
            type="button"
            className="header-lab-profile__menu-item"
            onClick={() => {
              onThemeToggle()
              onClose()
            }}
            role="menuitem"
            tabIndex={open ? 0 : -1}
          >
            <span className="header-lab-profile__menu-icon">
              {theme === 'dark' ? <MoonIcon /> : <SunIcon />}
            </span>
            <span className="header-lab-profile__menu-label">{copy.theme}</span>
            <span className="header-lab-profile__menu-value">{getThemeValueLabel(theme, copy)}</span>
          </button>
        ) : null}

        {profileMenu.mode === 'rows' && profileMenu.showLanguageRow ? (
          <button
            type="button"
            className="header-lab-profile__menu-item"
            onClick={() => {
              onLanguageChange(language === 'ru' ? 'en' : 'ru')
              onClose()
            }}
            role="menuitem"
            tabIndex={open ? 0 : -1}
          >
            <span className="header-lab-profile__menu-icon">
              <GlobeIcon />
            </span>
            <span className="header-lab-profile__menu-label">{copy.language}</span>
            <span className="header-lab-profile__menu-value">{language.toUpperCase()}</span>
          </button>
        ) : null}

        {profileMenu.mode === 'utility' && profileMenu.utilityPlacement !== 'top' ? (
          <>
            <div className="header-lab-dropdown__divider" />
            {utilityRow}
          </>
        ) : null}

        <div className="header-lab-dropdown__divider" />

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
  const config = useMemo(
    () => VARIANT_CONFIGS[variant] || VARIANT_CONFIGS['iter4-hidden-utilities'],
    [variant]
  )
  const shellStyle = useMemo(() => buildShellStyle(config), [config])
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

  const controls = {
    balance: (
      <BalanceSelector
        key="balance"
        copy={copy}
        wallets={wallets}
        activeCurrencyCode={activeCurrencyCode}
        onCurrencyChange={onCurrencyChange}
        open={openMenu === 'balance'}
        onToggle={() => setOpenMenu((current) => (current === 'balance' ? null : 'balance'))}
        onClose={() => setOpenMenu(null)}
        language={language}
      />
    ),
    notifications: (
      <NotificationButton
        key="notifications"
        title={copy.notifications}
        count={notificationCount}
        onClick={() => setOpenMenu(null)}
      />
    ),
    profile: (
      <AccountMenu
        key="profile"
        copy={copy}
        username={username}
        open={openMenu === 'profile'}
        onToggle={() => setOpenMenu((current) => (current === 'profile' ? null : 'profile'))}
        onClose={() => setOpenMenu(null)}
        onLogout={onLogout}
        isAuthed={isAuthed}
        isLoggingOut={isLoggingOut}
        language={language}
        onLanguageChange={onLanguageChange}
        theme={theme}
        onThemeToggle={onThemeToggle}
        profileMenu={config.profileMenu}
      />
    ),
  }

  return (
    <section className="header-lab-section">
      <div className="header-lab-section__meta">
        <h3 className="header-lab-section__label">{label}</h3>
      </div>

      <div ref={wrapRef}>
        <HeaderShell variant={variant} style={shellStyle}>
          <div className="header-lab-shell__left">
            <Logo src={config.logo.src} alt={config.logo.alt} />
            <NavItems copy={copy} />
          </div>

          <div className="header-lab-shell__right">
            {config.layoutOrder.map((item) => controls[item])}
          </div>
        </HeaderShell>
      </div>

      <p className="header-lab-section__description">{description}</p>
    </section>
  )
}
