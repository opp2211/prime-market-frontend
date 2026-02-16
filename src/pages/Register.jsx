import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import { registerLocal } from '../api/auth'
import { setAuthFromResponse } from '../app/auth'
import { getErrorMessage } from '../app/errors'
import { useI18n } from '../app/i18n'

export default function Register() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
  })
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

    if (form.password !== form.passwordConfirm) {
      setError(t('register.mismatch'))
      return
    }

    setLoading(true)
    try {
      const res = await registerLocal({
        username: form.username,
        email: form.email,
        password: form.password,
      })
      setAuthFromResponse(res.data)
      navigate('/')
    } catch (err) {
      setError(getErrorMessage(err, t('register.errorFallback')))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth">
      <div className="card auth__card">
        <h1 className="h1">{t('register.title')}</h1>

        <form onSubmit={onSubmit} className="form">
          <label className="field">
            <span className="field__label">{t('register.usernameLabel')}</span>
            <input
              className="input"
              name="username"
              value={form.username}
              onChange={onChange}
              autoComplete="username"
              placeholder={t('register.usernamePlaceholder')}
              required
            />
          </label>

          <label className="field">
            <span className="field__label">{t('register.emailLabel')}</span>
            <input
              className="input"
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              autoComplete="email"
              placeholder={t('register.emailPlaceholder')}
              required
            />
          </label>

          <label className="field">
            <span className="field__label">{t('register.passwordLabel')}</span>
            <input
              className="input"
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              autoComplete="new-password"
              placeholder={t('register.passwordPlaceholder')}
              required
            />
          </label>

          <label className="field">
            <span className="field__label">{t('register.passwordConfirmLabel')}</span>
            <input
              className="input"
              type="password"
              name="passwordConfirm"
              value={form.passwordConfirm}
              onChange={onChange}
              autoComplete="new-password"
              placeholder={t('register.passwordConfirmPlaceholder')}
              required
            />
          </label>

          {error ? <div className="error">{error}</div> : null}

          <Button type="submit" disabled={loading}>
            {loading ? t('register.submitting') : t('register.submit')}
          </Button>
        </form>

        <p className="muted small auth__hint">
          {t('register.haveAccount')}{' '}
          <Link className="link" to="/login">
            {t('register.loginLink')}
          </Link>
        </p>
      </div>
    </section>
  )
}
