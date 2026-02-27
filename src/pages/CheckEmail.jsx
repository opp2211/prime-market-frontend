import { useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import Button from '../shared/ui/Button'
import { resendVerification } from '../api/auth'
import { getErrorMessage } from '../shared/lib/errors'
import { useI18n } from '../app/i18n'

export default function CheckEmail() {
  const { t } = useI18n()
  const location = useLocation()
  const [params] = useSearchParams()
  const stateEmail = location.state?.email
  const queryEmail = params.get('email')
  const email = (stateEmail || queryEmail || '').trim()
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')

  async function onResend() {
    if (!email) {
      setStatus('error')
      setMessage(t('checkEmail.noEmail'))
      return
    }
    setStatus('sending')
    setMessage('')
    try {
      await resendVerification({ email })
      setStatus('sent')
      setMessage(t('checkEmail.resent'))
    } catch (err) {
      setStatus('error')
      setMessage(getErrorMessage(err, t('checkEmail.resentError')))
    }
  }

  return (
    <section className="auth">
      <div className="card auth__card">
        <h1 className="h1">{t('checkEmail.title')}</h1>
        <p className="muted auth__note">
          {email ? (
            <>
              {t('checkEmail.subtitleEmail')} <strong>{email}</strong>.
            </>
          ) : (
            t('checkEmail.subtitle')
          )}
        </p>
        <p className="muted auth__note">{t('checkEmail.tip')}</p>

        {message ? (
          <div className={status === 'error' ? 'error' : 'notice'}>{message}</div>
        ) : null}

        <div className="auth__actions">
          <Button
            type="button"
            variant="secondary"
            onClick={onResend}
            disabled={!email || status === 'sending'}
          >
            {status === 'sending' ? t('checkEmail.resending') : t('checkEmail.resend')}
          </Button>
          <Link className="btn btn--ghost" to="/login">
            {t('checkEmail.loginLink')}
          </Link>
        </div>
      </div>
    </section>
  )
}

