import { NavLink, useLocation } from 'react-router-dom'
import { useI18n } from '../../app/i18n'
import { getOfferCopy } from '../myOffers/offerCopy'
import { getOrderCopy } from '../orders/orderCopy'
import { getUserAreaCopy } from './userAreaCopy'

function UserAreaNavLink({ to, children, end, isActiveOverride }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `account-nav__link${isActiveOverride || isActive ? ' is-active' : ''}`
      }
    >
      {children}
    </NavLink>
  )
}

function SoonNavItem({ children, badge }) {
  return (
    <span className="account-nav__link account-nav__link--disabled">
      <span>{children}</span>
      <span className="account-nav__badge">{badge}</span>
    </span>
  )
}

export default function UserAreaNavigation({ section = 'account', variant = '' }) {
  const location = useLocation()
  const { t, language } = useI18n()
  const userAreaCopy = getUserAreaCopy(language)
  const offerCopy = getOfferCopy(language)
  const orderCopy = getOrderCopy(language)
  const currentSection = userAreaCopy.sections[section] || userAreaCopy.sections.account
  const isOrdersActive =
    location.pathname === '/dashboard/orders' ||
    location.pathname.startsWith('/dashboard/orders/') ||
    location.pathname.startsWith('/orders/')

  if (section === 'trading') {
    return (
      <nav className="account-nav" aria-label={userAreaCopy.sections.trading.title}>
        <UserAreaNavLink to="/dashboard" end>
          {userAreaCopy.nav.dashboard}
        </UserAreaNavLink>
        <UserAreaNavLink to="/dashboard/offers">{offerCopy.navLabel}</UserAreaNavLink>
        <UserAreaNavLink to="/dashboard/orders" isActiveOverride={isOrdersActive}>
          {orderCopy.navLabel}
        </UserAreaNavLink>
        <SoonNavItem badge={userAreaCopy.nav.comingSoon}>
          {userAreaCopy.nav.analytics}
        </SoonNavItem>
      </nav>
    )
  }

  if (section === 'money') {
    const labMoneyNavLabels = language === 'ru'
      ? {
          convert: 'Конвертация',
          depositRequests: 'Пополнения',
          withdrawalRequests: 'Выводы',
        }
      : {
          convert: 'Conversion',
          depositRequests: 'Deposits',
          withdrawalRequests: 'Withdrawals',
        }
    const moneyNavLabels = variant ? labMoneyNavLabels : userAreaCopy.nav
    const moneyNavClassName = [
      'account-nav',
      'account-nav--money',
      variant ? 'account-nav--money-lab' : '',
      variant ? `account-nav--money-${variant}` : '',
    ]
      .filter(Boolean)
      .join(' ')
    const isWalletActive =
      location.pathname === '/money/wallet' ||
      location.pathname === '/money/wallet-lab' ||
      location.pathname === '/wallet-lab' ||
      location.pathname.startsWith('/wallet-lab-')
    const isTransactionsActive =
      location.pathname === '/money/transactions' ||
      location.pathname === '/transactions-lab' ||
      location.pathname.startsWith('/transactions-lab-')
    const walletPath = location.pathname === '/wallet-lab' || location.pathname.startsWith('/wallet-lab-')
      ? '/wallet-lab'
      : '/money/wallet'
    const transactionsPath = location.pathname === '/transactions-lab' || location.pathname.startsWith('/transactions-lab-')
      ? '/transactions-lab-1'
      : '/money/transactions'

    return (
      <div className="account-nav-wrap">
        <nav className={moneyNavClassName} aria-label={userAreaCopy.sections.money.title}>
          <UserAreaNavLink to={walletPath} end isActiveOverride={isWalletActive}>
            {t('account.walletTitle')}
          </UserAreaNavLink>
          <UserAreaNavLink to={transactionsPath} isActiveOverride={isTransactionsActive}>
            {userAreaCopy.nav.transactions}
          </UserAreaNavLink>
          {variant ? null : (
            <UserAreaNavLink to="/money/convert">{moneyNavLabels.convert}</UserAreaNavLink>
          )}
          <UserAreaNavLink to="/money/deposit-requests">
            {moneyNavLabels.depositRequests}
          </UserAreaNavLink>
          <UserAreaNavLink to="/money/withdrawal-requests">
            {moneyNavLabels.withdrawalRequests}
          </UserAreaNavLink>
          <UserAreaNavLink to="/money/payout-profiles">
            {userAreaCopy.nav.payoutProfiles}
          </UserAreaNavLink>
          {variant ? (
            <UserAreaNavLink to="/money/convert">{moneyNavLabels.convert}</UserAreaNavLink>
          ) : null}
        </nav>
      </div>
    )
  }

  return (
    <nav className="account-nav" aria-label={currentSection.title}>
      <UserAreaNavLink to="/account/profile">{t('account.profileTitle')}</UserAreaNavLink>
      <UserAreaNavLink to="/notifications">{userAreaCopy.nav.notifications}</UserAreaNavLink>
      <UserAreaNavLink to="/account/email">{userAreaCopy.nav.email}</UserAreaNavLink>
      <UserAreaNavLink to="/account/password">{userAreaCopy.nav.password}</UserAreaNavLink>
      <UserAreaNavLink to="/account/integrations">
        {userAreaCopy.nav.integrations}
      </UserAreaNavLink>
    </nav>
  )
}
