import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import { loginLocal, oauthStart } from '../api/auth'
import { setAuthFromResponse } from '../app/auth'
import { getErrorMessage } from '../app/errors'
import { useI18n } from '../app/i18n'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { t } = useI18n()

  function onChange(e) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await loginLocal(form)
      setAuthFromResponse(res.data)
      navigate('/')
    } catch (err) {
      setError(getErrorMessage(err, t('login.errorFallback')))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth">
      <div className="card auth__card">
        <h1 className="h1">{t('login.title')}</h1>

        <form onSubmit={onSubmit} className="form">
          <label className="field">
            <span className="field__label">{t('login.emailLabel')}</span>
            <input
              className="input"
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              autoComplete="email"
              placeholder={t('login.emailPlaceholder')}
              required
            />
          </label>

          <label className="field">
            <span className="field__label">{t('login.passwordLabel')}</span>
            <input
              className="input"
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              autoComplete="current-password"
              placeholder={t('login.passwordPlaceholder')}
              required
            />
          </label>

          {error ? <div className="error">{error}</div> : null}

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
