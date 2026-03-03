import { useEffect, useState } from 'react'
import Button from '../../shared/ui/Button'
import { getMe } from '../../api/users'
import { getErrorMessage } from '../../shared/lib/errors'
import { useI18n } from '../../app/i18n'

function normalizeProfile(data) {
  if (!data || typeof data !== 'object') {
    return { username: '', email: '', status: '', createdAt: '' }
  }
  const source = data.user && typeof data.user === 'object' ? data.user : data
  return {
    username: source.username || source.login || '',
    email: source.email || '',
    status: source.status || source.state || '',
    createdAt:
      source.createdAt ||
      source.created_at ||
      source.registeredAt ||
      source.registered_at ||
      source.created ||
      '',
  }
}

function getInitials(value) {
  if (!value) return 'PM'
  const cleaned = value.trim()
  if (!cleaned) return 'PM'
  const parts = cleaned.split(/[\s_-]+/).filter(Boolean)
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() || '')
  return initials.join('') || cleaned.slice(0, 2).toUpperCase()
}

function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

function getStatusLabel(value, t) {
  const normalized = (value || '').toString().trim().toLowerCase()
  if (!normalized || normalized === 'active') return t('account.statusActive')
  if (normalized === 'inactive') return t('account.statusInactive')
  return value
}

export default function Profile() {
  const { t } = useI18n()
  const [profile, setProfile] = useState({ username: '', email: '' })
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const loadProfile = async () => {
      if (!active) return
      setStatus('loading')
      setError('')

      try {
        const res = await getMe()
        if (!active) return
        setProfile(normalizeProfile(res?.data))
        setStatus('ready')
      } catch (err) {
        if (!active) return
        setError(getErrorMessage(err, t('account.profileError')))
        setStatus('error')
      }
    }

    loadProfile()

    return () => {
      active = false
    }
  }, [t])

  const isLoading = status === 'loading'
  const fallbackValue = t('account.notAvailable')
  const initials = getInitials(profile.username)
  const createdAtLabel = formatDate(profile.createdAt) || fallbackValue
  const statusLabel = getStatusLabel(profile.status, t)

  return (
    <div className="account-page">
      <div className="account-page__head">
        <h1 className="h1 account-page__title">{t('account.profileTitle')}</h1>
      </div>

      <div className="card profile-card">
        {isLoading ? <div className="muted">{t('account.loading')}</div> : null}
        {error ? <div className="error">{error}</div> : null}

        {!isLoading && !error ? (
          <>
            <div className="profile-card__top">
              <div className="profile-card__info">
                <div className="profile-card__avatar" aria-hidden="true">
                  {initials}
                </div>
                <div className="profile-card__identity">
                  <div className="profile-card__name">
                    {profile.username || fallbackValue}
                  </div>
                  <div className="profile-card__email">
                    {profile.email || fallbackValue}
                  </div>
                </div>
              </div>
              <div className="profile-card__actions">
                <Button type="button" variant="primary">
                  {t('account.editProfile')}
                </Button>
                <Button type="button" variant="ghost">
                  {t('account.changeEmail')}
                </Button>
              </div>
            </div>

            <div className="profile-card__meta">
              <div className="profile-meta">
                <div className="profile-meta__label">{t('account.profileStatus')}</div>
                <div className="profile-meta__value">
                  <span className="profile-meta__badge">{statusLabel}</span>
                </div>
              </div>
              <div className="profile-meta">
                <div className="profile-meta__label">{t('account.profileCreatedAt')}</div>
                <div className="profile-meta__value">{createdAtLabel}</div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}

