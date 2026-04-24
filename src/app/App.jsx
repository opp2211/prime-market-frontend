import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import Header from '../widgets/Header'
import { bootstrapAuth, useAuth } from './auth'
import { startNotificationsStream, stopNotificationsStream } from './notificationStream'
import { I18nProvider } from './i18n'
import { clearNotifications } from './notifications'
import { clearUser, loadUser, useUser } from './user'
import {
  canAccessBackoffice,
  getDefaultBackofficePath,
} from '../pages/backoffice/backofficeAccess'

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const { accessToken, isAuthed, isReady } = useAuth()
  const { status: userStatus, permissions } = useUser()
  const isOrderWorkspaceRoute = location.pathname.startsWith('/orders/')
  const isHeaderLabRoute = location.pathname.startsWith('/header-lab')
  const mainClassName = isHeaderLabRoute
    ? 'header-lab-main'
    : `container${isOrderWorkspaceRoute ? ' container--workspace' : ''}`

  useEffect(() => {
    bootstrapAuth()
  }, [])

  useEffect(() => {
    if (!isReady) return
    if (!isAuthed) {
      stopNotificationsStream()
      clearUser()
      clearNotifications()
      return
    }
    if (userStatus === 'idle') {
      loadUser()
    }
  }, [isReady, isAuthed, userStatus])

  useEffect(() => {
    if (!isReady || !isAuthed || !accessToken) return undefined

    startNotificationsStream()

    return () => {
      stopNotificationsStream()
    }
  }, [accessToken, isAuthed, isReady])

  useEffect(() => {
    if (!isReady || !isAuthed) return
    if (userStatus !== 'ready') return
    if (canAccessBackoffice(permissions) && location.pathname === '/') {
      navigate(getDefaultBackofficePath(permissions), { replace: true })
    }
  }, [isReady, isAuthed, userStatus, permissions, location.pathname, navigate])

  return (
    <I18nProvider>
      <div className={`app${isHeaderLabRoute ? ' app--header-lab' : ''}`}>
        {isHeaderLabRoute ? null : <Header />}
        <main className={mainClassName}>
          <Outlet />
        </main>
      </div>
    </I18nProvider>
  )
}
