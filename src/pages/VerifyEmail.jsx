import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Button from '../components/Button'
import { verifyEmail } from '../api/auth'
import { setAuthFromResponse } from '../app/auth'
import { getErrorMessage } from '../app/errors'
import { useI18n } from '../app/i18n'

export default function VerifyEmail() {
  const { t } = useI18n()
  const [params] = useSearchParams()
  const token = (params.get('token') || '').trim()
  const navigate = useNavigate()
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage(t('verifyEmail.noToken'))
      return
    }
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

  return (
    <section className="auth">
      <div className="card auth__card">
        <h1 className="h1">{t('verifyEmail.title')}</h1>

        {status === 'loading' ? (
          <p className="muted auth__note">{t('verifyEmail.loading')}</p>
        ) : null}

        {status === 'success' ? (
          <div className="notice">{t('verifyEmail.success')}</div>
        ) : null}

        {status === 'error' ? <div className="error">{message}</div> : null}

        <div className="auth__actions">
          {status === 'success' ? (
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
