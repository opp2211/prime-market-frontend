import { Link, useLocation } from 'react-router-dom'
import { useEffect, useId, useState } from 'react'
import NotificationBell from './NotificationBell'
import styles from './HeaderMobile.module.css'
import {
  ArrowRightIcon,
  ChevronIcon,
  CloseIcon,
  DashboardIcon,
  GlobeIcon,
  HeaderBalanceMenuContent,
  HeaderLogoLink,
  LANG_OPTIONS,
  LogoutIcon,
  MarketIcon,
  MenuIcon,
  MoonIcon,
  ProfileIcon,
  SunIcon,
  WalletIcon,
  cx,
  useHeaderBalance,
} from './headerShared'

function useModalPresentation(open, onClose) {
  useEffect(() => {
    if (!open) return undefined

    const previousOverflow = document.body.style.overflow

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose, open])
}

function ModalSurface({
  open,
  onClose,
  panelId,
  ariaLabel,
  backdropClassName,
  panelClassName,
  children,
}) {
  useModalPresentation(open, onClose)

  if (!open) return null

  return (
    <div className={backdropClassName} onMouseDown={onClose}>
      <div
        id={panelId}
        className={panelClassName}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

function PanelHeader({ copy, title, subtitle, onBack, onClose }) {
  return (
    <div className={styles.panelHeader}>
      <div className={styles.panelHeaderStart}>
        {onBack ? (
          <button
            type="button"
            className={styles.panelBack}
            onClick={onBack}
            aria-label={copy.back}
          >
            <span className={styles.panelButtonIcon} aria-hidden="true">
              <ArrowRightIcon />
            </span>
          </button>
        ) : null}
        <div className={styles.panelHeaderText}>
          <div className={styles.panelTitle}>{title}</div>
          {subtitle ? <div className={styles.panelSubtitle}>{subtitle}</div> : null}
        </div>
      </div>
      <button
        type="button"
        className={styles.panelClose}
        onClick={onClose}
        aria-label={copy.closePanel}
      >
        <span className={styles.panelButtonIcon} aria-hidden="true">
          <CloseIcon />
        </span>
      </button>
    </div>
  )
}

function MobileIconButton({
  label,
  expanded = false,
  controlsId,
  onClick,
}) {
  return (
    <button
      type="button"
      className={styles.iconButton}
      onClick={onClick}
      aria-label={label}
      aria-expanded={expanded}
      aria-controls={controlsId}
      aria-haspopup="dialog"
    >
      <span className={styles.iconGlyph} aria-hidden="true">
        <MenuIcon />
      </span>
    </button>
  )
}

function MobileBalanceButton({
  copy,
  balance,
  expanded,
  controlsId,
  onClick,
}) {
  return (
    <button
      type="button"
      className={styles.balanceButton}
      onClick={onClick}
      aria-label={copy.balance}
      aria-expanded={expanded}
      aria-controls={controlsId}
      aria-haspopup="dialog"
    >
      <span className={styles.balanceMeta}>
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
  )
}

function ProfileCard({ accountLabel, accountInitial }) {
  return (
    <div className={styles.profileCard}>
      <span className={styles.profileAvatar} aria-hidden="true">
        {accountInitial}
      </span>
      <span className={styles.profileText}>
        <span className={styles.profileName}>{accountLabel}</span>
      </span>
    </div>
  )
}

function NavigationCard({ to, label, icon, active, onSelect }) {
  return (
    <Link
      to={to}
      className={cx(styles.navigationCard, active && styles.navigationCardActive)}
      aria-current={active ? 'page' : undefined}
      onClick={onSelect}
    >
      <span className={styles.navigationCardIcon} aria-hidden="true">
        {icon}
      </span>
      <span className={styles.navigationCardLabel}>{label}</span>
    </Link>
  )
}

function SettingsButton({
  label,
  icon,
  value,
  onClick,
  accent = false,
  disabled = false,
  busy = false,
  hasArrow = false,
  pressed,
}) {
  return (
    <button
      type="button"
      className={cx(styles.settingsButton, accent && styles.settingsButtonAccent)}
      onClick={onClick}
      disabled={disabled}
      aria-busy={busy || undefined}
      aria-pressed={typeof pressed === 'boolean' ? pressed : undefined}
    >
      <span className={styles.settingsButtonIcon} aria-hidden="true">
        {icon}
      </span>
      <span className={styles.settingsButtonLabel}>{label}</span>
      {value ? <span className={styles.settingsButtonValue}>{value}</span> : null}
      {hasArrow ? (
        <span className={styles.settingsButtonArrow} aria-hidden="true">
          <ArrowRightIcon />
        </span>
      ) : null}
    </button>
  )
}

function LanguageOption({ option, selectedLanguage, onSelect }) {
  const isActive = option.value === selectedLanguage

  return (
    <button
      type="button"
      className={cx(styles.languageOption, isActive && styles.languageOptionActive)}
      role="option"
      aria-selected={isActive}
      onClick={() => onSelect(option.value)}
    >
      <span className={styles.languageOptionMain}>
        <span className={styles.languageOptionName}>{option.label}</span>
        <span className={styles.languageOptionCode}>{option.shortLabel}</span>
      </span>
      {isActive ? <span className={styles.languageOptionMarker} aria-hidden="true" /> : null}
    </button>
  )
}

function BalanceSheet({ copy, balance, language, open, panelId, onClose }) {
  return (
    <ModalSurface
      open={open}
      onClose={onClose}
      panelId={panelId}
      ariaLabel={copy.balance}
      backdropClassName={styles.sheetBackdrop}
      panelClassName={styles.sheetPanel}
    >
      <PanelHeader copy={copy} title={copy.balance} subtitle={copy.availableCurrencies} onClose={onClose} />
      <div className={styles.sharedPanelContent}>
        <HeaderBalanceMenuContent
          copy={copy}
          language={language}
          balance={balance}
          isVisible={open}
          onClose={onClose}
        />
      </div>
    </ModalSurface>
  )
}

function GuestHeader({ copy }) {
  return (
    <div className={styles.root}>
      <div className={styles.topBar}>
        <HeaderLogoLink copy={copy} compact />
        <div className={styles.guestActions}>
          <Link className={styles.guestAction} to="/login">
            {copy.login}
          </Link>
          <Link className={styles.guestActionAccent} to="/register">
            {copy.register}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function HeaderMobile({
  copy,
  language,
  selectedLanguage,
  onLanguageChange,
  theme,
  onThemeChange,
  isAuthed,
  accountLabel,
  accountInitial,
  onLogout,
  isLoggingOut,
}) {
  const location = useLocation()
  const balance = useHeaderBalance({ isAuthed, copy, language })
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerView, setDrawerView] = useState('menu')
  const [balanceOpen, setBalanceOpen] = useState(false)
  const drawerId = useId()
  const balanceId = useId()
  const currentLanguage =
    LANG_OPTIONS.find((option) => option.value === selectedLanguage) || LANG_OPTIONS[0]

  if (!isAuthed) {
    return <GuestHeader copy={copy} />
  }

  function closeDrawer() {
    setDrawerOpen(false)
    setDrawerView('menu')
  }

  function isActive(pathnamePrefix) {
    return location.pathname.startsWith(pathnamePrefix)
  }

  return (
    <div className={styles.root}>
      <div className={styles.topBar}>
        <HeaderLogoLink copy={copy} compact />
        <div className={styles.actionCluster}>
          <MobileBalanceButton
            copy={copy}
            balance={balance}
            expanded={balanceOpen}
            controlsId={balanceId}
            onClick={() => setBalanceOpen((current) => !current)}
          />
          <NotificationBell mobileDropdownAlign="right" />
          <MobileIconButton
            label={drawerOpen ? copy.closeMenu : copy.openMenu}
            expanded={drawerOpen}
            controlsId={drawerId}
            onClick={() => setDrawerOpen((current) => !current)}
          />
        </div>
      </div>

      <BalanceSheet
        copy={copy}
        balance={balance}
        language={language}
        open={balanceOpen}
        panelId={balanceId}
        onClose={() => setBalanceOpen(false)}
      />

      <ModalSurface
        open={drawerOpen}
        onClose={closeDrawer}
        panelId={drawerId}
        ariaLabel={drawerView === 'language' ? copy.language : copy.menu}
        backdropClassName={styles.drawerBackdrop}
        panelClassName={styles.drawerPanel}
      >
        {drawerView === 'language' ? (
          <>
            <PanelHeader
              copy={copy}
              title={copy.language}
              onBack={() => setDrawerView('menu')}
              onClose={closeDrawer}
            />
            <div className={styles.menuContent}>
              <div className={styles.menuSectionLabel}>{copy.language}</div>
              <div className={styles.languageList} role="listbox" aria-label={copy.language}>
                {LANG_OPTIONS.map((option) => (
                  <LanguageOption
                    key={option.value}
                    option={option}
                    selectedLanguage={selectedLanguage}
                    onSelect={(value) => {
                      onLanguageChange(value)
                      setDrawerView('menu')
                    }}
                  />
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <PanelHeader copy={copy} title={copy.menu} onClose={closeDrawer} />
            <div className={styles.menuContent}>
              <ProfileCard accountLabel={accountLabel} accountInitial={accountInitial} />

              <div className={styles.menuSectionLabel}>{copy.navigation}</div>
              <div className={styles.navigationGrid}>
                <NavigationCard
                  to="/market"
                  label={copy.market}
                  icon={<MarketIcon />}
                  active={isActive('/market')}
                  onSelect={closeDrawer}
                />
                <NavigationCard
                  to="/dashboard"
                  label={copy.dashboard}
                  icon={<DashboardIcon />}
                  active={isActive('/dashboard')}
                  onSelect={closeDrawer}
                />
                <NavigationCard
                  to="/account/profile"
                  label={copy.profile}
                  icon={<ProfileIcon />}
                  active={isActive('/account')}
                  onSelect={closeDrawer}
                />
                <NavigationCard
                  to="/money/wallet"
                  label={copy.wallet}
                  icon={<WalletIcon />}
                  active={isActive('/money')}
                  onSelect={closeDrawer}
                />
              </div>

              <div className={styles.menuSectionLabel}>{copy.appearance}</div>
              <div className={styles.settingsList}>
                <SettingsButton
                  label={copy.theme}
                  icon={theme === 'dark' ? <MoonIcon /> : <SunIcon />}
                  value={theme === 'dark' ? copy.themeDark : copy.themeLight}
                  onClick={() => onThemeChange(theme === 'dark' ? 'light' : 'dark')}
                  pressed={theme === 'dark'}
                />
                <SettingsButton
                  label={copy.language}
                  icon={<GlobeIcon />}
                  value={currentLanguage.shortLabel}
                  onClick={() => setDrawerView('language')}
                  hasArrow
                />
              </div>

              <SettingsButton
                label={copy.logout}
                icon={<LogoutIcon />}
                onClick={async () => {
                  await onLogout()
                  closeDrawer()
                }}
                accent
                disabled={isLoggingOut}
                busy={isLoggingOut}
              />
            </div>
          </>
        )}
      </ModalSurface>
    </div>
  )
}
