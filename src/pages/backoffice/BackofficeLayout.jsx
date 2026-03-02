import { useEffect } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../app/auth'
import { useI18n } from '../../app/i18n'
import { useUser } from '../../app/user'

export default function BackofficeLayout() {
  const { isAuthed, isReady } = useAuth()
  const { status: userStatus, permissions } = useUser()
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useI18n()

  const hasAccess = permissions?.includes('BACKOFFICE_ACCESS')
  const canApproveDeposits = permissions?.includes('DEPOSIT_APPROVE')

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
        <nav className="account-nav">
          {canApproveDeposits ? (
            <NavLink
              to="/backoffice/deposit-requests"
              className={({ isActive }) =>
                `account-nav__link${isActive ? ' is-active' : ''}`
              }
            >
              {t('backoffice.depositRequestsNav')}
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
