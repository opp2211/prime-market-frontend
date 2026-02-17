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
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()
  const { t } = useI18n()

  function onChange(e) {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
    setErrors((p) => (p[name] ? { ...p, [name]: '' } : p))
  }

  function validate(values) {
    const next = {}
    const username = values.username?.trim() || ''
    if (!username) {
      next.username = t('register.usernameRequired')
    } else if (username.length < 3 || username.length > 24) {
      next.username = t('register.usernameLength')
    }
    if (!values.email?.trim()) {
      next.email = t('register.emailRequired')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      next.email = t('register.emailInvalid')
    }
    if (!values.password?.trim()) {
      next.password = t('register.passwordRequired')
    }
    if (!values.passwordConfirm?.trim()) {
      next.passwordConfirm = t('register.passwordConfirmRequired')
    } else if (values.password !== values.passwordConfirm) {
      next.passwordConfirm = t('register.mismatch')
    }
    return next
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    const nextErrors = validate(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
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

        <form onSubmit={onSubmit} className="form" noValidate>
          <label className="field">
            <span className="field__label">{t('register.usernameLabel')}</span>
            <input
              className="input"
              id="register-username"
              name="username"
              value={form.username}
              onChange={onChange}
              autoComplete="username"
              placeholder={t('register.usernamePlaceholder')}
              aria-invalid={Boolean(errors.username)}
              aria-describedby={errors.username ? 'register-username-error' : undefined}
              required
            />
            {errors.username ? (
              <div id="register-username-error" className="field__error" role="alert">
                {errors.username}
              </div>
            ) : null}
          </label>

          <label className="field">
            <span className="field__label">{t('register.emailLabel')}</span>
            <input
              className="input"
              type="email"
              id="register-email"
              name="email"
              value={form.email}
              onChange={onChange}
              autoComplete="email"
              placeholder={t('register.emailPlaceholder')}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'register-email-error' : undefined}
              required
            />
            {errors.email ? (
              <div id="register-email-error" className="field__error" role="alert">
                {errors.email}
              </div>
            ) : null}
          </label>

          <label className="field">
            <span className="field__label">{t('register.passwordLabel')}</span>
            <input
              className="input"
              type="password"
              id="register-password"
              name="password"
              value={form.password}
              onChange={onChange}
              autoComplete="new-password"
              placeholder={t('register.passwordPlaceholder')}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'register-password-error' : undefined}
              required
            />
            {errors.password ? (
              <div id="register-password-error" className="field__error" role="alert">
                {errors.password}
              </div>
            ) : null}
          </label>

          <label className="field">
            <span className="field__label">{t('register.passwordConfirmLabel')}</span>
            <input
              className="input"
              type="password"
              id="register-password-confirm"
              name="passwordConfirm"
              value={form.passwordConfirm}
              onChange={onChange}
              autoComplete="new-password"
              placeholder={t('register.passwordConfirmPlaceholder')}
              aria-invalid={Boolean(errors.passwordConfirm)}
              aria-describedby={
                errors.passwordConfirm ? 'register-password-confirm-error' : undefined
              }
              required
            />
            {errors.passwordConfirm ? (
              <div
                id="register-password-confirm-error"
                className="field__error"
                role="alert"
              >
                {errors.passwordConfirm}
              </div>
            ) : null}
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
