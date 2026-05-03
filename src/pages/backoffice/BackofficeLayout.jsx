import { useEffect } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../app/auth'
import { useI18n } from '../../app/i18n'
import { useUser } from '../../app/user'
import { getBackofficeDisputesCopy } from './backofficeDisputesCopy'
import { getBackofficeMoneyCopy } from './backofficeMoneyCopy'
import {
  canAccessBackoffice,
  canViewDepositRequests,
  canViewDisputes,
  canViewTreasury,
  canViewWithdrawalRequests,
} from './backofficeAccess'

export default function BackofficeLayout() {
  const { isAuthed, isReady } = useAuth()
  const { status: userStatus, permissions } = useUser()
  const navigate = useNavigate()
  const location = useLocation()
  const { language, t } = useI18n()
  const disputesCopy = getBackofficeDisputesCopy(language)
  const moneyCopy = getBackofficeMoneyCopy(language)

  const hasAccess = canAccessBackoffice(permissions)
  const canApproveDeposits = canViewDepositRequests(permissions)
  const canReviewDisputes = canViewDisputes(permissions)
  const canReviewWithdrawals = canViewWithdrawalRequests(permissions)
  const canOpenTreasury = canViewTreasury(permissions)

  useEffect(() => {
    if (!isReady) return
    if (!isAuthed) {
      navigate('/login', { replace: true, state: { from: location.pathname } })
    }
  }, [isReady, isAuthed, navigate, location.pathname])

  useEffect(() => {
    if (!isReady || !isAuthed) return
    if (userStatus !== 'ready') return
    if (!hasAccess) {
      navigate('/', { replace: true })
    }
  }, [isReady, isAuthed, userStatus, hasAccess, navigate])

  if (!isReady) {
    return (
      <div className="account account--single">
        <div className="card account__content account__content--single">
          <div className="muted">{t('account.loading')}</div>
        </div>
      </div>
    )
  }

  if (isAuthed && userStatus === 'error') {
    return (
      <div className="account account--single">
        <div className="card account__content account__content--single">
          <div className="error">{t('backoffice.userLoadError')}</div>
        </div>
      </div>
    )
  }

  if (isAuthed && userStatus !== 'ready') {
    return (
      <div className="account account--single">
        <div className="card account__content account__content--single">
          <div className="muted">{t('account.loading')}</div>
        </div>
      </div>
    )
  }

  if (!isAuthed || !hasAccess) {
    return null
  }

  return (
    <div className="account backoffice">
      <aside className="card account__sidebar">
        <div className="account__title">{t('backoffice.title')}</div>
        <nav className="account-nav" aria-label={t('backoffice.title')}>
          {canReviewWithdrawals ? (
            <NavLink
              to="/backoffice/withdrawal-requests"
              className={({ isActive }) =>
                `account-nav__link${isActive ? ' is-active' : ''}`
              }
            >
              {moneyCopy.withdrawals.navLabel}
            </NavLink>
          ) : null}
          {canApproveDeposits ? (
            <NavLink
              to="/backoffice/deposit-requests"
              className={({ isActive }) =>
                `account-nav__link${isActive ? ' is-active' : ''}`
              }
            >
              {moneyCopy.deposits.navLabel}
            </NavLink>
          ) : null}
          {canOpenTreasury ? (
            <NavLink
              to="/backoffice/treasury"
              className={({ isActive }) =>
                `account-nav__link${isActive ? ' is-active' : ''}`
              }
            >
              Treasury
            </NavLink>
          ) : null}
          {canReviewDisputes ? (
            <NavLink
              to="/backoffice/disputes"
              className={({ isActive }) =>
                `account-nav__link${isActive ? ' is-active' : ''}`
              }
            >
              {disputesCopy.navLabel}
            </NavLink>
          ) : null}
        </nav>
      </aside>
      <section className="account__content">
        <Outlet />
      </section>
    </div>
  )
}
