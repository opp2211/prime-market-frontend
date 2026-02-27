import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Button from '../shared/ui/Button'
import { verifyEmail } from '../api/auth'
import { setAuthFromResponse } from '../app/auth'
import { getErrorMessage } from '../shared/lib/errors'
import { useI18n } from '../app/i18n'

export default function VerifyEmail() {
  const { t } = useI18n()
  const [params] = useSearchParams()
  const token = (params.get('token') || '').trim()
  const noToken = !token
  const navigate = useNavigate()
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) return
    let active = true

    const run = async () => {
      setStatus('loading')
      setMessage('')
      try {
        const res = await verifyEmail({ token })
        if (!active) return
        setAuthFromResponse(res.data)
        setStatus('success')
      } catch (err) {
        if (!active) return
        setStatus('error')
        setMessage(getErrorMessage(err, t('verifyEmail.errorFallback')))
      }
    }

    run()
    return () => {
      active = false
    }
  }, [token, t])

  const resolvedStatus = noToken ? 'error' : status
  const resolvedMessage = noToken ? t('verifyEmail.noToken') : message

  return (
    <section className="auth">
      <div className="card auth__card">
        <h1 className="h1">{t('verifyEmail.title')}</h1>

        {resolvedStatus === 'loading' ? (
          <p className="muted auth__note">{t('verifyEmail.loading')}</p>
        ) : null}

        {resolvedStatus === 'success' ? (
          <div className="notice">{t('verifyEmail.success')}</div>
        ) : null}

        {resolvedStatus === 'error' ? <div className="error">{resolvedMessage}</div> : null}

        <div className="auth__actions">
          {resolvedStatus === 'success' ? (
            <Button type="button" onClick={() => navigate('/')}>
              {t('verifyEmail.goHome')}
            </Button>
          ) : null}
          <Link className="btn btn--ghost" to="/login">
            {t('verifyEmail.loginLink')}
          </Link>
        </div>
      </div>
    </section>
  )
}

