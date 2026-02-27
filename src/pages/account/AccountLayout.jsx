import { useEffect } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../app/auth'
import { useI18n } from '../../app/i18n'

export default function AccountLayout() {
  const { isAuthed, isReady } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useI18n()

  useEffect(() => {
    if (!isReady) return
    if (!isAuthed) {
      navigate('/login', { replace: true, state: { from: location.pathname } })
    }
  }, [isReady, isAuthed, navigate, location.pathname])

  if (!isReady) {
    return (
      <div className="account account--single">
        <div className="card account__content account__content--single">
          <div className="muted">{t('account.loading')}</div>
        </div>
      </div>
    )
  }

  if (!isAuthed) {
    return null
  }

  return (
    <div className="account">
      <aside className="card account__sidebar">
        <div className="account__title">{t('account.title')}</div>
        <nav className="account-nav">
          <NavLink
            to="/account/profile"
            className={({ isActive }) =>
              `account-nav__link${isActive ? ' is-active' : ''}`
            }
          >
            {t('account.profileTitle')}
          </NavLink>
          <NavLink
            to="/account/wallet"
            className={({ isActive }) =>
              `account-nav__link${isActive ? ' is-active' : ''}`
            }
          >
            {t('account.walletTitle')}
          </NavLink>
          <NavLink
            to="/account/deposit-requests"
            className={({ isActive }) =>
              `account-nav__link${isActive ? ' is-active' : ''}`
            }
          >
            {t('account.depositRequestsTitle')}
          </NavLink>
        </nav>
      </aside>
      <section className="account__content">
        <Outlet />
      </section>
    </div>
  )
}
