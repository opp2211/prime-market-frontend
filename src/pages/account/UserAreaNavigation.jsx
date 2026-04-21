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

export default function UserAreaNavigation({ section = 'account' }) {
  const location = useLocation()
  const { t, language } = useI18n()
  const userAreaCopy = getUserAreaCopy(language)
  const offerCopy = getOfferCopy(language)
  const orderCopy = getOrderCopy(language)
  const isOrdersActive =
    location.pathname === '/dashboard/orders' ||
    location.pathname.startsWith('/dashboard/orders/') ||
    location.pathname.startsWith('/orders/')
  const isWalletActive =
    location.pathname === '/money/wallet' || location.pathname === '/money/deposit'

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
    return (
      <nav className="account-nav" aria-label={userAreaCopy.sections.money.title}>
        <UserAreaNavLink to="/money/wallet" isActiveOverride={isWalletActive}>
          {t('account.walletTitle')}
        </UserAreaNavLink>
        <UserAreaNavLink to="/money/deposit-requests">
          {userAreaCopy.nav.depositRequests}
        </UserAreaNavLink>
        <UserAreaNavLink to="/money/withdrawal-requests">
          {userAreaCopy.nav.withdrawalRequests}
        </UserAreaNavLink>
      </nav>
    )
  }

  return (
    <nav className="account-nav" aria-label={userAreaCopy.sections.account.title}>
      <UserAreaNavLink to="/account/profile">{t('account.profileTitle')}</UserAreaNavLink>
      <UserAreaNavLink to="/account/email">{userAreaCopy.nav.email}</UserAreaNavLink>
      <UserAreaNavLink to="/account/password">{userAreaCopy.nav.password}</UserAreaNavLink>
      <UserAreaNavLink to="/account/integrations">
        {userAreaCopy.nav.integrations}
      </UserAreaNavLink>
    </nav>
  )
}
