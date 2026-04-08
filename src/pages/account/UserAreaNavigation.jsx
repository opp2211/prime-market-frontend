import { NavLink } from 'react-router-dom'
import { useI18n } from '../../app/i18n'
import { getOfferCopy } from '../myOffers/offerCopy'

export default function UserAreaNavigation() {
  const { t, language } = useI18n()
  const offerCopy = getOfferCopy(language)

  return (
    <nav className="account-nav" aria-label={t('account.title')}>
      <NavLink
        to="/account/profile"
        className={({ isActive }) => `account-nav__link${isActive ? ' is-active' : ''}`}
      >
        {t('account.profileTitle')}
      </NavLink>
      <NavLink
        to="/account/wallet"
        className={({ isActive }) => `account-nav__link${isActive ? ' is-active' : ''}`}
      >
        {t('account.walletTitle')}
      </NavLink>
      <NavLink
        to="/my-offers"
        className={({ isActive }) => `account-nav__link${isActive ? ' is-active' : ''}`}
      >
        {offerCopy.navLabel}
      </NavLink>
      <NavLink
        to="/account/deposit-requests"
        className={({ isActive }) => `account-nav__link${isActive ? ' is-active' : ''}`}
      >
        {t('account.depositRequestsTitle')}
      </NavLink>
    </nav>
  )
}
