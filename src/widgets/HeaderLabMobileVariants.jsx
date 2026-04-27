import { useEffect, useId, useMemo, useRef, useState } from 'react'
import NotificationBell from './NotificationBell'
import mobileStyles from './HeaderLabMobile.module.css'
import {
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
  ChevronIcon,
  cx,
  useDismissibleLayer,
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

function PanelHeader({ copy, title, subtitle, onClose }) {
  return (
    <div className={mobileStyles.panelHeader}>
      <div className={mobileStyles.panelHeaderText}>
        <div className={mobileStyles.panelTitle}>{title}</div>
        {subtitle ? <div className={mobileStyles.panelSubtitle}>{subtitle}</div> : null}
      </div>
      <button
        type="button"
        className={mobileStyles.panelClose}
        onClick={onClose}
        aria-label={copy.closePanel}
      >
        <span aria-hidden="true">
          <CloseIcon />
        </span>
      </button>
    </div>
  )
}

function MobileIconButton({
  label,
  active = false,
  expanded = false,
  controlsId,
  onClick,
  className,
  children,
}) {
  return (
    <button
      type="button"
      className={cx(
        mobileStyles.iconButton,
        active && mobileStyles.iconButtonActive,
        className
      )}
      onClick={onClick}
      aria-label={label}
      aria-expanded={controlsId ? expanded : undefined}
      aria-controls={controlsId}
      aria-haspopup={controlsId ? 'dialog' : undefined}
    >
      <span className={mobileStyles.iconButtonGlyph} aria-hidden="true">
        {children}
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
  className,
  compact = false,
}) {
  return (
    <button
      type="button"
      className={cx(
        mobileStyles.balanceButton,
        compact && mobileStyles.balanceButtonCompact,
        className
      )}
      onClick={onClick}
      aria-label={copy.balance}
      aria-expanded={expanded}
      aria-controls={controlsId}
      aria-haspopup="dialog"
    >
      <span className={mobileStyles.balanceButtonMeta}>
        <span
          className={cx(
            mobileStyles.balanceButtonAmount,
            balance.status !== 'ready' && mobileStyles.balanceButtonAmountState
          )}
        >
          {balance.amountLabel}
        </span>
        <span className={mobileStyles.balanceButtonCode}>{balance.activeCurrencyCode}</span>
      </span>
      <span className={mobileStyles.balanceButtonChevron} aria-hidden="true">
        <ChevronIcon />
      </span>
    </button>
  )
}

function MobileAvatarButton({
  copy,
  accountLabel,
  accountInitial,
  expanded,
  controlsId,
  onClick,
  className,
  showName = false,
}) {
  return (
    <button
      type="button"
      className={cx(
        mobileStyles.avatarButton,
        showName && mobileStyles.avatarButtonWide,
        className
      )}
      onClick={onClick}
      aria-label={copy.profileMenu}
      aria-expanded={expanded}
      aria-controls={controlsId}
      aria-haspopup="dialog"
    >
      <span className={mobileStyles.avatarBubble} aria-hidden="true">
        {accountInitial}
      </span>
      {showName ? (
        <span className={mobileStyles.avatarButtonText}>
          <span className={mobileStyles.avatarButtonName}>{accountLabel}</span>
          <span className={mobileStyles.avatarButtonHint}>{copy.profile}</span>
        </span>
      ) : null}
      <span className={mobileStyles.avatarButtonChevron} aria-hidden="true">
        <ChevronIcon />
      </span>
    </button>
  )
}

function ProfileCard({ accountLabel, accountInitial }) {
  return (
    <div className={mobileStyles.profileCard}>
      <span className={mobileStyles.profileCardAvatar} aria-hidden="true">
        {accountInitial}
      </span>
      <span className={mobileStyles.profileCardText}>
        <span className={mobileStyles.profileCardName}>{accountLabel}</span>
        <span className={mobileStyles.profileCardCaption}>Prime Market</span>
      </span>
    </div>
  )
}

function MenuAction({ label, icon, active = false, onClick, className, large = false }) {
  return (
    <button
      type="button"
      className={cx(
        mobileStyles.menuAction,
        large && mobileStyles.menuActionLarge,
        active && mobileStyles.menuActionActive,
        className
      )}
      onClick={onClick}
    >
      <span className={mobileStyles.menuActionIcon} aria-hidden="true">
        {icon}
      </span>
      <span className={mobileStyles.menuActionLabel}>{label}</span>
    </button>
  )
}

function UtilityCard({ copy, language, onLanguageChange, theme, onThemeChange }) {
  return (
    <div className={mobileStyles.utilityCard}>
      <div className={mobileStyles.utilityCardTitle}>{copy.appearance}</div>

      <button
        type="button"
        className={mobileStyles.utilityTheme}
        onClick={() => onThemeChange(theme === 'dark' ? 'light' : 'dark')}
      >
        <span className={mobileStyles.utilityThemeIcon} aria-hidden="true">
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </span>
        <span className={mobileStyles.utilityThemeText}>
          {theme === 'dark' ? copy.themeLight : copy.themeDark}
        </span>
      </button>

      <div className={mobileStyles.utilityLanguageWrap}>
        <span className={mobileStyles.utilityLanguageLabel}>
          <span className={mobileStyles.utilityThemeIcon} aria-hidden="true">
            <GlobeIcon />
          </span>
          <span>{copy.language}</span>
        </span>
        <div className={mobileStyles.utilityLanguageGrid}>
          {LANG_OPTIONS.map((option) => {
            const isActive = option.value === language

            return (
              <button
                key={option.value}
                type="button"
                className={cx(
                  mobileStyles.utilityLanguageButton,
                  isActive && mobileStyles.utilityLanguageButtonActive
                )}
                onClick={() => onLanguageChange(option.value)}
              >
                <span>{option.shortLabel}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function MenuContent({
  copy,
  language,
  onLanguageChange,
  theme,
  onThemeChange,
  accountLabel,
  accountInitial,
  activeSection,
  onSelectSection,
  onLogoutPreview,
  balance,
  onOpenBalance,
  showBalanceCard = false,
  largeActions = false,
}) {
  return (
    <div className={mobileStyles.menuContent}>
      <ProfileCard accountLabel={accountLabel} accountInitial={accountInitial} />

      {showBalanceCard ? (
        <button type="button" className={mobileStyles.balanceCard} onClick={onOpenBalance}>
          <span className={mobileStyles.balanceCardLabel}>{copy.balance}</span>
          <span className={mobileStyles.balanceCardValue}>
            {balance.amountLabel} {balance.activeCurrencyCode}
          </span>
        </button>
      ) : null}

      <div className={mobileStyles.menuSectionLabel}>{copy.navigation}</div>

      <div
        className={cx(
          mobileStyles.menuActionGrid,
          largeActions && mobileStyles.menuActionGridLarge
        )}
      >
        <MenuAction
          label={copy.market}
          icon={<MarketIcon />}
          active={activeSection === 'market'}
          onClick={() => onSelectSection('market')}
          large={largeActions}
        />
        <MenuAction
          label={copy.dashboard}
          icon={<DashboardIcon />}
          active={activeSection === 'dashboard'}
          onClick={() => onSelectSection('dashboard')}
          large={largeActions}
        />
        <MenuAction
          label={copy.profile}
          icon={<ProfileIcon />}
          active={activeSection === 'profile'}
          onClick={() => onSelectSection('profile')}
          large={largeActions}
        />
        <MenuAction
          label={copy.wallet}
          icon={<WalletIcon />}
          active={activeSection === 'wallet'}
          onClick={() => onSelectSection('wallet')}
          large={largeActions}
        />
      </div>

      <UtilityCard
        copy={copy}
        language={language}
        onLanguageChange={onLanguageChange}
        theme={theme}
        onThemeChange={onThemeChange}
      />

      <button
        type="button"
        className={cx(mobileStyles.menuAction, mobileStyles.menuActionAccent)}
        onClick={onLogoutPreview}
      >
        <span className={mobileStyles.menuActionIcon} aria-hidden="true">
          <LogoutIcon />
        </span>
        <span className={mobileStyles.menuActionLabel}>{copy.logout}</span>
      </button>
    </div>
  )
}

function BalanceSheet({ copy, balance, language, open, panelId, onClose, onWalletSelect }) {
  return (
    <ModalSurface
      open={open}
      onClose={onClose}
      panelId={panelId}
      ariaLabel={copy.balance}
      backdropClassName={mobileStyles.sheetBackdrop}
      panelClassName={mobileStyles.sheetPanel}
    >
      <PanelHeader copy={copy} title={copy.balance} subtitle={copy.availableCurrencies} onClose={onClose} />
      <div className={mobileStyles.sharedPanelContent}>
        <HeaderBalanceMenuContent
          copy={copy}
          language={language}
          balance={balance}
          isVisible={open}
          onClose={onClose}
          walletHref={null}
          onWalletSelect={onWalletSelect}
        />
      </div>
    </ModalSurface>
  )
}

function BottomNavigation({ items, floating = false, className }) {
  return (
    <div
      className={cx(
        mobileStyles.bottomNavigationWrap,
        floating && mobileStyles.bottomNavigationWrapFloating
      )}
    >
      <div
        className={cx(
          mobileStyles.bottomNavigation,
          floating && mobileStyles.bottomNavigationFloating,
          className
        )}
      >
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            className={cx(
              mobileStyles.bottomNavigationItem,
              item.active && mobileStyles.bottomNavigationItemActive
            )}
            onClick={item.onClick}
          >
            <span className={mobileStyles.bottomNavigationIcon} aria-hidden="true">
              {item.icon}
            </span>
            <span className={mobileStyles.bottomNavigationLabel}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function SegmentedTabs({ items, className }) {
  return (
    <div className={cx(mobileStyles.segmentedTabs, className)}>
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          className={cx(
            mobileStyles.segmentedTab,
            item.active && mobileStyles.segmentedTabActive
          )}
          onClick={item.onClick}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

function AnchoredMenu({
  open,
  onClose,
  panelId,
  ariaLabel,
  trigger,
  panelClassName,
  children,
}) {
  const wrapRef = useRef(null)

  useDismissibleLayer({
    open,
    ref: wrapRef,
    onClose,
  })

  return (
    <div className={mobileStyles.anchoredWrap} ref={wrapRef}>
      {trigger}
      {open ? (
        <div
          id={panelId}
          className={panelClassName}
          role="dialog"
          aria-modal="false"
          aria-label={ariaLabel}
        >
          {children}
        </div>
      ) : null}
    </div>
  )
}

function buildPrimaryItems(copy) {
  return [
    {
      key: 'market',
      label: copy.market,
      icon: <MarketIcon />,
    },
    {
      key: 'dashboard',
      label: copy.dashboard,
      icon: <DashboardIcon />,
    },
    {
      key: 'wallet',
      label: copy.wallet,
      icon: <WalletIcon />,
    },
    {
      key: 'profile',
      label: copy.profile,
      icon: <ProfileIcon />,
    },
  ]
}

function usePreviewController() {
  const [activeSection, setActiveSection] = useState('market')

  return {
    activeSection,
    selectSection: setActiveSection,
  }
}

function ClassicRightDrawer(props) {
  const {
    copy,
    language,
    onLanguageChange,
    theme,
    onThemeChange,
    accountLabel,
    accountInitial,
    balance,
  } = props
  const { activeSection, selectSection } = usePreviewController()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [balanceOpen, setBalanceOpen] = useState(false)
  const drawerId = useId()
  const balanceId = useId()

  return (
    <div className={mobileStyles.root}>
      <div className={mobileStyles.topBar}>
        <HeaderLogoLink copy={copy} compact />
        <div className={mobileStyles.actionCluster}>
          <MobileBalanceButton
            copy={copy}
            balance={balance}
            expanded={balanceOpen}
            controlsId={balanceId}
            onClick={() => setBalanceOpen((current) => !current)}
          />
          <NotificationBell />
          <MobileIconButton
            label={copy.openMenu}
            expanded={drawerOpen}
            controlsId={drawerId}
            onClick={() => setDrawerOpen((current) => !current)}
          >
            <MenuIcon />
          </MobileIconButton>
        </div>
      </div>

      <BalanceSheet
        copy={copy}
        balance={balance}
        language={language}
        open={balanceOpen}
        panelId={balanceId}
        onClose={() => setBalanceOpen(false)}
        onWalletSelect={() => {
          selectSection('wallet')
          setBalanceOpen(false)
        }}
      />

      <ModalSurface
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        panelId={drawerId}
        ariaLabel={copy.menu}
        backdropClassName={mobileStyles.drawerBackdrop}
        panelClassName={cx(mobileStyles.drawerPanel, mobileStyles.drawerPanelRight)}
      >
        <PanelHeader copy={copy} title={copy.menu} subtitle={copy.navAria} onClose={() => setDrawerOpen(false)} />
        <MenuContent
          copy={copy}
          language={language}
          onLanguageChange={onLanguageChange}
          theme={theme}
          onThemeChange={onThemeChange}
          accountLabel={accountLabel}
          accountInitial={accountInitial}
          activeSection={activeSection}
          onSelectSection={(value) => {
            selectSection(value)
            setDrawerOpen(false)
          }}
          onLogoutPreview={() => setDrawerOpen(false)}
          balance={balance}
        />
      </ModalSurface>
    </div>
  )
}

function LeftGamingDrawer(props) {
  const {
    copy,
    language,
    onLanguageChange,
    theme,
    onThemeChange,
    accountLabel,
    accountInitial,
    balance,
  } = props
  const { activeSection, selectSection } = usePreviewController()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [balanceOpen, setBalanceOpen] = useState(false)
  const drawerId = useId()
  const balanceId = useId()

  return (
    <div className={cx(mobileStyles.root, mobileStyles.rootGaming)}>
      <div className={cx(mobileStyles.topBar, mobileStyles.topBarGaming)}>
        <MobileIconButton
          label={copy.openMenu}
          expanded={drawerOpen}
          controlsId={drawerId}
          onClick={() => setDrawerOpen((current) => !current)}
          className={mobileStyles.iconButtonGaming}
        >
          <MenuIcon />
        </MobileIconButton>
        <HeaderLogoLink copy={copy} compact className={mobileStyles.logoCentered} />
        <div className={mobileStyles.actionCluster}>
          <MobileBalanceButton
            copy={copy}
            balance={balance}
            expanded={balanceOpen}
            controlsId={balanceId}
            onClick={() => setBalanceOpen((current) => !current)}
            compact
            className={mobileStyles.balanceButtonGaming}
          />
          <NotificationBell />
        </div>
      </div>

      <BalanceSheet
        copy={copy}
        balance={balance}
        language={language}
        open={balanceOpen}
        panelId={balanceId}
        onClose={() => setBalanceOpen(false)}
        onWalletSelect={() => {
          selectSection('wallet')
          setBalanceOpen(false)
        }}
      />

      <ModalSurface
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        panelId={drawerId}
        ariaLabel={copy.menu}
        backdropClassName={mobileStyles.drawerBackdrop}
        panelClassName={cx(
          mobileStyles.drawerPanel,
          mobileStyles.drawerPanelLeft,
          mobileStyles.drawerPanelGaming
        )}
      >
        <PanelHeader copy={copy} title={copy.menu} subtitle="Prime Market" onClose={() => setDrawerOpen(false)} />
        <MenuContent
          copy={copy}
          language={language}
          onLanguageChange={onLanguageChange}
          theme={theme}
          onThemeChange={onThemeChange}
          accountLabel={accountLabel}
          accountInitial={accountInitial}
          activeSection={activeSection}
          onSelectSection={(value) => {
            selectSection(value)
            setDrawerOpen(false)
          }}
          onLogoutPreview={() => setDrawerOpen(false)}
          balance={balance}
        />
      </ModalSurface>
    </div>
  )
}

function BottomTabBarVariant(props) {
  const {
    copy,
    language,
    onLanguageChange,
    theme,
    onThemeChange,
    accountLabel,
    accountInitial,
    balance,
  } = props
  const { activeSection, selectSection } = usePreviewController()
  const [profileOpen, setProfileOpen] = useState(false)
  const [balanceOpen, setBalanceOpen] = useState(false)
  const profileId = useId()
  const balanceId = useId()
  const items = useMemo(
    () =>
      buildPrimaryItems(copy).map((item) => ({
        ...item,
        active: activeSection === item.key,
        onClick:
          item.key === 'profile'
            ? () => {
                selectSection('profile')
                setProfileOpen(true)
              }
            : () => selectSection(item.key),
      })),
    [activeSection, copy, selectSection]
  )

  return (
    <div className={cx(mobileStyles.root, mobileStyles.rootBottomNav)}>
      <div className={mobileStyles.topBar}>
        <HeaderLogoLink copy={copy} compact />
        <div className={mobileStyles.actionCluster}>
          <MobileBalanceButton
            copy={copy}
            balance={balance}
            expanded={balanceOpen}
            controlsId={balanceId}
            onClick={() => setBalanceOpen((current) => !current)}
            compact
          />
          <NotificationBell />
        </div>
      </div>

      <BottomNavigation items={items} />

      <BalanceSheet
        copy={copy}
        balance={balance}
        language={language}
        open={balanceOpen}
        panelId={balanceId}
        onClose={() => setBalanceOpen(false)}
        onWalletSelect={() => {
          selectSection('wallet')
          setBalanceOpen(false)
        }}
      />

      <ModalSurface
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        panelId={profileId}
        ariaLabel={copy.profileMenu}
        backdropClassName={mobileStyles.sheetBackdrop}
        panelClassName={mobileStyles.sheetPanel}
      >
        <PanelHeader copy={copy} title={copy.profileMenu} subtitle={copy.account} onClose={() => setProfileOpen(false)} />
        <MenuContent
          copy={copy}
          language={language}
          onLanguageChange={onLanguageChange}
          theme={theme}
          onThemeChange={onThemeChange}
          accountLabel={accountLabel}
          accountInitial={accountInitial}
          activeSection={activeSection}
          onSelectSection={(value) => {
            selectSection(value)
            setProfileOpen(false)
          }}
          onLogoutPreview={() => setProfileOpen(false)}
          balance={balance}
        />
      </ModalSurface>
    </div>
  )
}

function HybridTopBottomVariant(props) {
  const {
    copy,
    language,
    onLanguageChange,
    theme,
    onThemeChange,
    accountLabel,
    accountInitial,
    balance,
  } = props
  const { activeSection, selectSection } = usePreviewController()
  const [profileOpen, setProfileOpen] = useState(false)
  const [balanceOpen, setBalanceOpen] = useState(false)
  const profileId = useId()
  const balanceId = useId()
  const items = useMemo(
    () =>
      buildPrimaryItems(copy).map((item) => ({
        ...item,
        active: activeSection === item.key,
        onClick:
          item.key === 'profile'
            ? () => {
                selectSection('profile')
                setProfileOpen(true)
              }
            : () => selectSection(item.key),
      })),
    [activeSection, copy, selectSection]
  )

  return (
    <div className={cx(mobileStyles.root, mobileStyles.rootBottomNav)}>
      <div className={cx(mobileStyles.topBar, mobileStyles.topBarHybrid)}>
        <HeaderLogoLink copy={copy} compact />
        <div className={mobileStyles.actionCluster}>
          <MobileBalanceButton
            copy={copy}
            balance={balance}
            expanded={balanceOpen}
            controlsId={balanceId}
            onClick={() => setBalanceOpen((current) => !current)}
          />
          <NotificationBell />
        </div>
      </div>

      <BottomNavigation items={items} className={mobileStyles.bottomNavigationHybrid} />

      <BalanceSheet
        copy={copy}
        balance={balance}
        language={language}
        open={balanceOpen}
        panelId={balanceId}
        onClose={() => setBalanceOpen(false)}
        onWalletSelect={() => {
          selectSection('wallet')
          setBalanceOpen(false)
        }}
      />

      <ModalSurface
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        panelId={profileId}
        ariaLabel={copy.profileMenu}
        backdropClassName={mobileStyles.sheetBackdrop}
        panelClassName={cx(mobileStyles.sheetPanel, mobileStyles.sheetPanelWide)}
      >
        <PanelHeader copy={copy} title={copy.profileMenu} subtitle={copy.account} onClose={() => setProfileOpen(false)} />
        <MenuContent
          copy={copy}
          language={language}
          onLanguageChange={onLanguageChange}
          theme={theme}
          onThemeChange={onThemeChange}
          accountLabel={accountLabel}
          accountInitial={accountInitial}
          activeSection={activeSection}
          onSelectSection={(value) => {
            selectSection(value)
            setProfileOpen(false)
          }}
          onLogoutPreview={() => setProfileOpen(false)}
          balance={balance}
        />
      </ModalSurface>
    </div>
  )
}

function FullscreenMenuVariant(props) {
  const {
    copy,
    language,
    onLanguageChange,
    theme,
    onThemeChange,
    accountLabel,
    accountInitial,
    balance,
  } = props
  const { activeSection, selectSection } = usePreviewController()
  const [menuOpen, setMenuOpen] = useState(false)
  const [balanceOpen, setBalanceOpen] = useState(false)
  const menuId = useId()
  const balanceId = useId()

  return (
    <div className={cx(mobileStyles.root, mobileStyles.rootFullscreen)}>
      <div className={cx(mobileStyles.topBar, mobileStyles.topBarFullscreen)}>
        <HeaderLogoLink copy={copy} compact />
        <div className={mobileStyles.actionCluster}>
          <NotificationBell />
          <MobileIconButton
            label={copy.openMenu}
            expanded={menuOpen}
            controlsId={menuId}
            onClick={() => setMenuOpen((current) => !current)}
          >
            <MenuIcon />
          </MobileIconButton>
        </div>
      </div>

      <BalanceSheet
        copy={copy}
        balance={balance}
        language={language}
        open={balanceOpen}
        panelId={balanceId}
        onClose={() => setBalanceOpen(false)}
        onWalletSelect={() => {
          selectSection('wallet')
          setBalanceOpen(false)
        }}
      />

      <ModalSurface
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        panelId={menuId}
        ariaLabel={copy.menu}
        backdropClassName={mobileStyles.fullscreenBackdrop}
        panelClassName={mobileStyles.fullscreenPanel}
      >
        <PanelHeader copy={copy} title={copy.menu} subtitle="Prime Market" onClose={() => setMenuOpen(false)} />
        <MenuContent
          copy={copy}
          language={language}
          onLanguageChange={onLanguageChange}
          theme={theme}
          onThemeChange={onThemeChange}
          accountLabel={accountLabel}
          accountInitial={accountInitial}
          activeSection={activeSection}
          onSelectSection={(value) => {
            selectSection(value)
            setMenuOpen(false)
          }}
          onLogoutPreview={() => setMenuOpen(false)}
          balance={balance}
          onOpenBalance={() => setBalanceOpen(true)}
          showBalanceCard
          largeActions
        />
      </ModalSurface>
    </div>
  )
}

function CompactExchangeVariant(props) {
  const {
    copy,
    language,
    onLanguageChange,
    theme,
    onThemeChange,
    accountLabel,
    accountInitial,
    balance,
  } = props
  const { activeSection, selectSection } = usePreviewController()
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [balanceOpen, setBalanceOpen] = useState(false)
  const menuId = useId()
  const profileId = useId()
  const balanceId = useId()

  return (
    <div className={cx(mobileStyles.root, mobileStyles.rootCompact)}>
      <div className={cx(mobileStyles.topBar, mobileStyles.topBarCompact)}>
        <HeaderLogoLink copy={copy} compact />
        <div className={mobileStyles.actionCluster}>
          <MobileBalanceButton
            copy={copy}
            balance={balance}
            expanded={balanceOpen}
            controlsId={balanceId}
            onClick={() => setBalanceOpen((current) => !current)}
            compact
          />
          <NotificationBell />

          <AnchoredMenu
            open={profileOpen}
            onClose={() => setProfileOpen(false)}
            panelId={profileId}
            ariaLabel={copy.profileMenu}
            panelClassName={mobileStyles.dropdownPanel}
            trigger={
              <MobileAvatarButton
                copy={copy}
                accountLabel={accountLabel}
                accountInitial={accountInitial}
                expanded={profileOpen}
                controlsId={profileId}
                onClick={() => setProfileOpen((current) => !current)}
              />
            }
          >
            <div className={mobileStyles.dropdownBody}>
              <MenuContent
                copy={copy}
                language={language}
                onLanguageChange={onLanguageChange}
                theme={theme}
                onThemeChange={onThemeChange}
                accountLabel={accountLabel}
                accountInitial={accountInitial}
                activeSection={activeSection}
                onSelectSection={(value) => {
                  selectSection(value)
                  setProfileOpen(false)
                }}
                onLogoutPreview={() => setProfileOpen(false)}
                balance={balance}
              />
            </div>
          </AnchoredMenu>

          <AnchoredMenu
            open={menuOpen}
            onClose={() => setMenuOpen(false)}
            panelId={menuId}
            ariaLabel={copy.menu}
            panelClassName={cx(mobileStyles.dropdownPanel, mobileStyles.dropdownPanelTight)}
            trigger={
              <button
                type="button"
                className={mobileStyles.menuTextButton}
                onClick={() => setMenuOpen((current) => !current)}
                aria-label={copy.openMenu}
                aria-expanded={menuOpen}
                aria-controls={menuId}
                aria-haspopup="dialog"
              >
                <span>{copy.menu}</span>
                <span className={mobileStyles.menuTextChevron} aria-hidden="true">
                  <ChevronIcon />
                </span>
              </button>
            }
          >
            <div className={mobileStyles.dropdownMenuActions}>
              <MenuAction
                label={copy.market}
                icon={<MarketIcon />}
                active={activeSection === 'market'}
                onClick={() => {
                  selectSection('market')
                  setMenuOpen(false)
                }}
              />
              <MenuAction
                label={copy.dashboard}
                icon={<DashboardIcon />}
                active={activeSection === 'dashboard'}
                onClick={() => {
                  selectSection('dashboard')
                  setMenuOpen(false)
                }}
              />
              <MenuAction
                label={copy.wallet}
                icon={<WalletIcon />}
                active={activeSection === 'wallet'}
                onClick={() => {
                  selectSection('wallet')
                  setMenuOpen(false)
                }}
              />
            </div>
          </AnchoredMenu>
        </div>
      </div>

      <BalanceSheet
        copy={copy}
        balance={balance}
        language={language}
        open={balanceOpen}
        panelId={balanceId}
        onClose={() => setBalanceOpen(false)}
        onWalletSelect={() => {
          selectSection('wallet')
          setBalanceOpen(false)
        }}
      />
    </div>
  )
}

function FloatingDockVariant(props) {
  const {
    copy,
    language,
    onLanguageChange,
    theme,
    onThemeChange,
    accountLabel,
    accountInitial,
    balance,
  } = props
  const { activeSection, selectSection } = usePreviewController()
  const [profileOpen, setProfileOpen] = useState(false)
  const [balanceOpen, setBalanceOpen] = useState(false)
  const profileId = useId()
  const balanceId = useId()
  const items = useMemo(
    () =>
      buildPrimaryItems(copy).map((item) => ({
        ...item,
        active: activeSection === item.key,
        onClick:
          item.key === 'profile'
            ? () => {
                selectSection('profile')
                setProfileOpen(true)
              }
            : () => selectSection(item.key),
      })),
    [activeSection, copy, selectSection]
  )

  return (
    <div className={cx(mobileStyles.root, mobileStyles.rootDock)}>
      <div className={cx(mobileStyles.topBar, mobileStyles.topBarMinimal)}>
        <HeaderLogoLink copy={copy} compact />
        <div className={mobileStyles.actionCluster}>
          <MobileBalanceButton
            copy={copy}
            balance={balance}
            expanded={balanceOpen}
            controlsId={balanceId}
            onClick={() => setBalanceOpen((current) => !current)}
            compact
          />
          <NotificationBell />
          <MobileAvatarButton
            copy={copy}
            accountLabel={accountLabel}
            accountInitial={accountInitial}
            expanded={profileOpen}
            controlsId={profileId}
            onClick={() => setProfileOpen((current) => !current)}
          />
        </div>
      </div>

      <BottomNavigation items={items} floating />

      <BalanceSheet
        copy={copy}
        balance={balance}
        language={language}
        open={balanceOpen}
        panelId={balanceId}
        onClose={() => setBalanceOpen(false)}
        onWalletSelect={() => {
          selectSection('wallet')
          setBalanceOpen(false)
        }}
      />

      <ModalSurface
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        panelId={profileId}
        ariaLabel={copy.profileMenu}
        backdropClassName={mobileStyles.sheetBackdrop}
        panelClassName={mobileStyles.sheetPanel}
      >
        <PanelHeader copy={copy} title={copy.profileMenu} subtitle={copy.account} onClose={() => setProfileOpen(false)} />
        <MenuContent
          copy={copy}
          language={language}
          onLanguageChange={onLanguageChange}
          theme={theme}
          onThemeChange={onThemeChange}
          accountLabel={accountLabel}
          accountInitial={accountInitial}
          activeSection={activeSection}
          onSelectSection={(value) => {
            selectSection(value)
            setProfileOpen(false)
          }}
          onLogoutPreview={() => setProfileOpen(false)}
          balance={balance}
        />
      </ModalSurface>
    </div>
  )
}

function ProfileCentricVariant(props) {
  const {
    copy,
    language,
    onLanguageChange,
    theme,
    onThemeChange,
    accountLabel,
    accountInitial,
    balance,
  } = props
  const { activeSection, selectSection } = usePreviewController()
  const [profileOpen, setProfileOpen] = useState(false)
  const [balanceOpen, setBalanceOpen] = useState(false)
  const profileId = useId()
  const balanceId = useId()

  return (
    <div className={cx(mobileStyles.root, mobileStyles.rootProfile)}>
      <div className={cx(mobileStyles.topBar, mobileStyles.topBarProfile)}>
        <HeaderLogoLink copy={copy} compact />
        <div className={mobileStyles.actionCluster}>
          <MobileBalanceButton
            copy={copy}
            balance={balance}
            expanded={balanceOpen}
            controlsId={balanceId}
            onClick={() => setBalanceOpen((current) => !current)}
          />
          <NotificationBell />
          <MobileAvatarButton
            copy={copy}
            accountLabel={accountLabel}
            accountInitial={accountInitial}
            expanded={profileOpen}
            controlsId={profileId}
            onClick={() => setProfileOpen((current) => !current)}
            showName
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
        onWalletSelect={() => {
          selectSection('wallet')
          setBalanceOpen(false)
        }}
      />

      <ModalSurface
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        panelId={profileId}
        ariaLabel={copy.profileMenu}
        backdropClassName={mobileStyles.sheetBackdrop}
        panelClassName={cx(mobileStyles.sheetPanel, mobileStyles.sheetPanelWide)}
      >
        <PanelHeader copy={copy} title={copy.profileMenu} subtitle={copy.account} onClose={() => setProfileOpen(false)} />
        <MenuContent
          copy={copy}
          language={language}
          onLanguageChange={onLanguageChange}
          theme={theme}
          onThemeChange={onThemeChange}
          accountLabel={accountLabel}
          accountInitial={accountInitial}
          activeSection={activeSection}
          onSelectSection={(value) => {
            selectSection(value)
            setProfileOpen(false)
          }}
          onLogoutPreview={() => setProfileOpen(false)}
          balance={balance}
          onOpenBalance={() => setBalanceOpen(true)}
          showBalanceCard
        />
      </ModalSurface>
    </div>
  )
}

function TwoLevelVariant(props) {
  const {
    copy,
    language,
    onLanguageChange,
    theme,
    onThemeChange,
    accountLabel,
    accountInitial,
    balance,
  } = props
  const { activeSection, selectSection } = usePreviewController()
  const [profileOpen, setProfileOpen] = useState(false)
  const [balanceOpen, setBalanceOpen] = useState(false)
  const profileId = useId()
  const balanceId = useId()
  const tabItems = [
    {
      key: 'market',
      label: copy.market,
      active: activeSection === 'market',
      onClick: () => selectSection('market'),
    },
    {
      key: 'dashboard',
      label: copy.dashboard,
      active: activeSection === 'dashboard',
      onClick: () => selectSection('dashboard'),
    },
  ]

  return (
    <div className={cx(mobileStyles.root, mobileStyles.rootTwoLevel)}>
      <div className={cx(mobileStyles.topBar, mobileStyles.topBarTwoLevel)}>
        <HeaderLogoLink copy={copy} compact />
        <div className={mobileStyles.actionCluster}>
          <NotificationBell />
          <MobileAvatarButton
            copy={copy}
            accountLabel={accountLabel}
            accountInitial={accountInitial}
            expanded={profileOpen}
            controlsId={profileId}
            onClick={() => setProfileOpen((current) => !current)}
          />
        </div>
      </div>

      <div className={mobileStyles.secondRow}>
        <MobileBalanceButton
          copy={copy}
          balance={balance}
          expanded={balanceOpen}
          controlsId={balanceId}
          onClick={() => setBalanceOpen((current) => !current)}
          className={mobileStyles.secondRowBalance}
        />
        <SegmentedTabs items={tabItems} className={mobileStyles.secondRowTabs} />
      </div>

      <BalanceSheet
        copy={copy}
        balance={balance}
        language={language}
        open={balanceOpen}
        panelId={balanceId}
        onClose={() => setBalanceOpen(false)}
        onWalletSelect={() => {
          selectSection('wallet')
          setBalanceOpen(false)
        }}
      />

      <ModalSurface
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        panelId={profileId}
        ariaLabel={copy.profileMenu}
        backdropClassName={mobileStyles.sheetBackdrop}
        panelClassName={mobileStyles.sheetPanel}
      >
        <PanelHeader copy={copy} title={copy.profileMenu} subtitle={copy.account} onClose={() => setProfileOpen(false)} />
        <MenuContent
          copy={copy}
          language={language}
          onLanguageChange={onLanguageChange}
          theme={theme}
          onThemeChange={onThemeChange}
          accountLabel={accountLabel}
          accountInitial={accountInitial}
          activeSection={activeSection}
          onSelectSection={(value) => {
            selectSection(value)
            setProfileOpen(false)
          }}
          onLogoutPreview={() => setProfileOpen(false)}
          balance={balance}
        />
      </ModalSurface>
    </div>
  )
}

function MinimalPremiumVariant(props) {
  const {
    copy,
    language,
    onLanguageChange,
    theme,
    onThemeChange,
    accountLabel,
    accountInitial,
    balance,
  } = props
  const { activeSection, selectSection } = usePreviewController()
  const [menuOpen, setMenuOpen] = useState(false)
  const [balanceOpen, setBalanceOpen] = useState(false)
  const menuId = useId()
  const balanceId = useId()

  return (
    <div className={cx(mobileStyles.root, mobileStyles.rootMinimal)}>
      <div className={cx(mobileStyles.topBar, mobileStyles.topBarMinimalPremium)}>
        <HeaderLogoLink copy={copy} compact />
        <MobileBalanceButton
          copy={copy}
          balance={balance}
          expanded={balanceOpen}
          controlsId={balanceId}
          onClick={() => setBalanceOpen((current) => !current)}
          className={mobileStyles.balanceButtonPremium}
        />
        <div className={mobileStyles.actionCluster}>
          <NotificationBell />
          <MobileIconButton
            label={copy.openMenu}
            expanded={menuOpen}
            controlsId={menuId}
            onClick={() => setMenuOpen((current) => !current)}
          >
            <MenuIcon />
          </MobileIconButton>
        </div>
      </div>

      <BalanceSheet
        copy={copy}
        balance={balance}
        language={language}
        open={balanceOpen}
        panelId={balanceId}
        onClose={() => setBalanceOpen(false)}
        onWalletSelect={() => {
          selectSection('wallet')
          setBalanceOpen(false)
        }}
      />

      <ModalSurface
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        panelId={menuId}
        ariaLabel={copy.menu}
        backdropClassName={mobileStyles.sheetBackdrop}
        panelClassName={cx(mobileStyles.sheetPanel, mobileStyles.sheetPanelPremium)}
      >
        <PanelHeader copy={copy} title={copy.menu} subtitle={accountLabel} onClose={() => setMenuOpen(false)} />
        <MenuContent
          copy={copy}
          language={language}
          onLanguageChange={onLanguageChange}
          theme={theme}
          onThemeChange={onThemeChange}
          accountLabel={accountLabel}
          accountInitial={accountInitial}
          activeSection={activeSection}
          onSelectSection={(value) => {
            selectSection(value)
            setMenuOpen(false)
          }}
          onLogoutPreview={() => setMenuOpen(false)}
          balance={balance}
          onOpenBalance={() => setBalanceOpen(true)}
          showBalanceCard
        />
      </ModalSurface>
    </div>
  )
}

function GuestVariant({ copy }) {
  return (
    <div className={mobileStyles.root}>
      <div className={mobileStyles.topBar}>
        <HeaderLogoLink copy={copy} compact />
        <div className={mobileStyles.guestActions}>
          <a className={mobileStyles.guestAction} href="/login">
            {copy.login}
          </a>
          <a className={mobileStyles.guestActionAccent} href="/register">
            {copy.register}
          </a>
        </div>
      </div>
    </div>
  )
}

const VARIANT_COMPONENTS = {
  1: ClassicRightDrawer,
  2: LeftGamingDrawer,
  3: BottomTabBarVariant,
  4: HybridTopBottomVariant,
  5: FullscreenMenuVariant,
  6: CompactExchangeVariant,
  7: FloatingDockVariant,
  8: ProfileCentricVariant,
  9: TwoLevelVariant,
  10: MinimalPremiumVariant,
}

export default function HeaderLabMobileVariants({
  variantId,
  copy,
  language,
  onLanguageChange,
  theme,
  onThemeChange,
  isAuthed,
  accountLabel,
  accountInitial,
}) {
  const balance = useHeaderBalance({ isAuthed, copy, language })
  const VariantComponent = VARIANT_COMPONENTS[variantId] || ClassicRightDrawer

  if (!isAuthed) {
    return <GuestVariant copy={copy} />
  }

  return (
    <VariantComponent
      copy={copy}
      language={language}
      onLanguageChange={onLanguageChange}
      theme={theme}
      onThemeChange={onThemeChange}
      accountLabel={accountLabel}
      accountInitial={accountInitial}
      balance={balance}
    />
  )
}
