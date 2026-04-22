import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import Header from '../widgets/Header'
import { bootstrapAuth, useAuth } from './auth'
import { I18nProvider } from './i18n'
import { clearUser, loadUser, useUser } from './user'
import {
  canAccessBackoffice,
  getDefaultBackofficePath,
} from '../pages/backoffice/backofficeAccess'

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthed, isReady } = useAuth()
  const { status: userStatus, permissions } = useUser()
  const isOrderWorkspaceRoute = location.pathname.startsWith('/orders/')

  useEffect(() => {
    bootstrapAuth()
  }, [])

  useEffect(() => {
    if (!isReady) return
    if (!isAuthed) {
      clearUser()
      return
    }
    if (userStatus === 'idle') {
      loadUser()
    }
  }, [isReady, isAuthed, userStatus])

  useEffect(() => {
    if (!isReady || !isAuthed) return
    if (userStatus !== 'ready') return
    if (canAccessBackoffice(permissions) && location.pathname === '/') {
      navigate(getDefaultBackofficePath(permissions), { replace: true })
    }
  }, [isReady, isAuthed, userStatus, permissions, location.pathname, navigate])

  return (
    <I18nProvider>
      <div className="app">
        <Header />
        <main className={`container${isOrderWorkspaceRoute ? ' container--workspace' : ''}`}>
          <Outlet />
        </main>
      </div>
    </I18nProvider>
  )
}
