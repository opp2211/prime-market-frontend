import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../app/auth'
import { useI18n } from '../../app/i18n'
import UserAreaNavigation from './UserAreaNavigation'

export default function UserAreaLayout({ children }) {
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
        <UserAreaNavigation />
      </aside>
      <section className="account__content">{children}</section>
    </div>
  )
}
