import { useEffect, useState } from 'react'
import Button from '../../shared/ui/Button'
import { getMe } from '../../api/users'
import { getErrorMessage } from '../../shared/lib/errors'
import { useI18n } from '../../app/i18n'

function normalizeProfile(data) {
  if (!data || typeof data !== 'object') return { username: '', email: '' }
  const source = data.user && typeof data.user === 'object' ? data.user : data
  return {
    username: source.username || source.login || '',
    email: source.email || '',
  }
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
            <div className="profile-card__row">
              <div className="profile-card__label">{t('account.username')}</div>
              <div className="profile-card__value">{profile.username || '—'}</div>
            </div>
            <div className="profile-card__row">
              <div className="profile-card__label">{t('account.email')}</div>
              <div className="profile-card__value">{profile.email || '—'}</div>
            </div>

            <div className="profile-card__actions">
              <Button type="button" variant="secondary">
                {t('account.changeEmail')}
              </Button>
              <Button type="button" variant="secondary">
                {t('account.changePassword')}
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}

