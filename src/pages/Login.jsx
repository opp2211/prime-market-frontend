import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import { loginLocal, oauthStart, resendVerification } from '../api/auth'
import { setAuthFromResponse } from '../app/auth'
import { getErrorMessage } from '../app/errors'
import { useI18n } from '../app/i18n'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})
  const [needsVerification, setNeedsVerification] = useState(false)
  const [resendStatus, setResendStatus] = useState('idle')
  const [resendMessage, setResendMessage] = useState('')
  const navigate = useNavigate()
  const { t } = useI18n()

  function onChange(e) {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
    setErrors((p) => (p[name] ? { ...p, [name]: '' } : p))
    if (name === 'email') {
      setNeedsVerification(false)
      setResendStatus('idle')
      setResendMessage('')
    }
  }

  function validate(values) {
    const next = {}
    if (!values.email?.trim()) {
      next.email = t('login.emailRequired')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      next.email = t('login.emailInvalid')
    }
    if (!values.password?.trim()) {
      next.password = t('login.passwordRequired')
    }
    return next
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setNeedsVerification(false)
    setResendStatus('idle')
    setResendMessage('')
    const nextErrors = validate(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return
    }
    setLoading(true)
    try {
      const res = await loginLocal(form)
      setAuthFromResponse(res.data)
      navigate('/')
    } catch (err) {
      const status = err?.response?.status
      const data = err?.response?.data
      const code = data?.code || data?.errorCode
      if (code === 'EMAIL_NOT_VERIFIED') {
        setNeedsVerification(true)
        setError(t('login.emailNotVerified'))
      } else if (status === 401 || status === 403) {
        setError(t('login.invalidCredentials'))
      } else {
        setError(getErrorMessage(err, t('login.errorFallback')))
      }
    } finally {
      setLoading(false)
    }
  }

  async function onResend() {
    if (!form.email?.trim()) {
      setResendStatus('error')
      setResendMessage(t('login.resendMissingEmail'))
      return
    }
    setResendStatus('sending')
    setResendMessage('')
    try {
      await resendVerification({ email: form.email.trim() })
      setResendStatus('sent')
      setResendMessage(t('login.resendSent'))
    } catch (err) {
      setResendStatus('error')
      setResendMessage(getErrorMessage(err, t('login.resendError')))
    }
  }

  return (
    <section className="auth">
      <div className="card auth__card">
        <h1 className="h1">{t('login.title')}</h1>

        <form onSubmit={onSubmit} className="form" noValidate>
          <label className="field">
            <span className="field__label">{t('login.emailLabel')}</span>
            <input
              className="input"
              id="login-email"
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              autoComplete="email"
              placeholder={t('login.emailPlaceholder')}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'login-email-error' : undefined}
              required
            />
            {errors.email ? (
              <div id="login-email-error" className="field__error" role="alert">
                {errors.email}
              </div>
            ) : null}
          </label>

          <label className="field">
            <span className="field__label">{t('login.passwordLabel')}</span>
            <input
              className="input"
              id="login-password"
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              autoComplete="current-password"
              placeholder={t('login.passwordPlaceholder')}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'login-password-error' : undefined}
              required
            />
            {errors.password ? (
              <div id="login-password-error" className="field__error" role="alert">
                {errors.password}
              </div>
            ) : null}
          </label>

          {error ? <div className="error">{error}</div> : null}
          {needsVerification ? (
            <div className="auth__note">
              <div className="auth__actions">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onResend}
                  disabled={resendStatus === 'sending'}
                >
                  {resendStatus === 'sending'
                    ? t('login.resendSending')
                    : t('login.resendVerification')}
                </Button>
              </div>
              {resendMessage ? (
                <div className={resendStatus === 'error' ? 'error' : 'notice'}>
                  {resendMessage}
                </div>
              ) : null}
            </div>
          ) : null}

          <Button type="submit" disabled={loading}>
            {loading ? t('login.submitting') : t('login.submit')}
          </Button>
        </form>

        <div className="divider">
          <span>{t('login.divider')}</span>
        </div>

        <div className="oauth">
          <Button variant="secondary" onClick={() => oauthStart('google')}>
            {t('login.oauthGoogle')}
          </Button>
          <Button variant="secondary" onClick={() => oauthStart('discord')}>
            {t('login.oauthDiscord')}
          </Button>
        </div>

        <p className="muted small auth__hint">
          {t('login.noAccount')}{' '}
          <Link className="link" to="/register">
            {t('login.registerLink')}
          </Link>
        </p>

      </div>
    </section>
  )
}
