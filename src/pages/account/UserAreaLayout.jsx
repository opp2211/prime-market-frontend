import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../app/auth'
import { useI18n } from '../../app/i18n'
import UserAreaNavigation from './UserAreaNavigation'
import { getUserAreaCopy } from './userAreaCopy'

export default function UserAreaLayout({
  children,
  variant = 'default',
  section = 'account',
  sidebarVariant = '',
}) {
  const { isAuthed, isReady } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { t, language } = useI18n()
  const userAreaCopy = getUserAreaCopy(language)
  const sectionCopy = userAreaCopy.sections[section] || userAreaCopy.sections.account
  const isMoneySection = section === 'money'

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

  if (variant === 'workspace') {
    return (
      <div className="account account--workspace">
        <section className="account__content account__content--workspace">
          {children}
        </section>
      </div>
    )
  }

  const accountClassName = [
    'account',
    isMoneySection ? 'account--money' : '',
    sidebarVariant ? `account--money-${sidebarVariant}` : '',
    sidebarVariant ? 'account--money-lab' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const sidebarClassName = [
    'card',
    'account__sidebar',
    isMoneySection ? 'account__sidebar--money' : '',
    sidebarVariant ? `account__sidebar--money-${sidebarVariant}` : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={accountClassName}>
      <aside className={sidebarClassName}>
        <div className="account__title">{sectionCopy.title}</div>
        <div className="account__subtitle">{sectionCopy.subtitle}</div>
        <UserAreaNavigation section={section} variant={sidebarVariant} />
      </aside>
      <section className="account__content">{children}</section>
    </div>
  )
}
