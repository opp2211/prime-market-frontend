import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import logo from '../assets/logo.svg'
import { applyTheme, getInitialTheme } from '../app/theme'
import { logout, useAuth } from '../app/auth'
import { useI18n } from '../app/i18n'

const LANG_OPTIONS = [
  { value: 'ru', label: 'Русский' },
  { value: 'en', label: 'English' },
]

function ThemeSwitch({ value, onChange, label, ariaLabel, title }) {
  return (
    <button
      type="button"
      className={`switch ${value === 'dark' ? 'is-on' : ''}`}
      onClick={() => onChange(value === 'light' ? 'dark' : 'light')}
      aria-label={ariaLabel}
      title={title}
    >
      <span className="switch__track">
        <span className="switch__thumb" />
      </span>
      <span className="switch__label">{label}</span>
    </button>
  )
}

function LanguageSwitch({ value, onChange, ariaLabel, title }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)
  const current = LANG_OPTIONS.find((option) => option.value === value) || LANG_OPTIONS[0]

  useEffect(() => {
    if (!open) return
    function onDocClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    function onKeyDown(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  function handlePick(next) {
    onChange(next)
    setOpen(false)
  }

  return (
    <div className={`lang ${open ? 'is-open' : ''}`} ref={wrapRef}>
      <button
        type="button"
        className="lang__button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        title={title}
      >
        <span className="lang__label">{current?.label || value}</span>
        <span className="lang__chevron" aria-hidden="true" />
      </button>
      {open && (
        <div className="lang__list" role="listbox" aria-label={ariaLabel}>
          {LANG_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`lang__option ${option.value === value ? 'is-active' : ''}`}
              role="option"
              aria-selected={option.value === value}
              onClick={() => handlePick(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Header() {
  const [theme, setTheme] = useState('light')
  const [menuOpen, setMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const menuRef = useRef(null)
  const { isAuthed } = useAuth()
  const { language, setLanguage, t } = useI18n()

  useEffect(() => {
    const initialTheme = getInitialTheme()
    setTheme(initialTheme)
    applyTheme(initialTheme)
  }, [])

  useEffect(() => {
    function onDocClick(e) {
      if (!menuOpen) return
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [menuOpen])

  function setThemeSafe(next) {
    setTheme(next)
    applyTheme(next)
  }

  async function handleLogout() {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    try {
      await logout()
    } finally {
      setIsLoggingOut(false)
      setMenuOpen(false)
    }
  }

  return (
    <header className="header header--black">
      <div className="container header__inner header__inner--tall">
        <Link to="/" className="brand brand--big" aria-label={t('brand.aria')}>
          <img className="brand__logo brand__logo--big" src={logo} alt="Prime Market" />
          <div className="brand__text">
            <div className="brand__title">Prime Market</div>
            <div className="brand__subtitle">{t('brand.subtitle')}</div>
          </div>
        </Link>

        <div className="header__right">
          <ThemeSwitch
            value={theme}
            onChange={setThemeSafe}
            label={theme === 'light' ? t('header.themeLight') : t('header.themeDark')}
            ariaLabel={t('header.themeToggle')}
            title={t('header.themeToggle')}
          />
          <LanguageSwitch
            value={language}
            onChange={setLanguage}
            ariaLabel={t('header.languageAria')}
            title={t('header.languageTitle')}
          />

          {isAuthed ? (
            <div className="menu" ref={menuRef}>
              <button
                type="button"
                className={`icon-btn ${menuOpen ? 'is-active' : ''}`}
                onClick={() => setMenuOpen((v) => !v)}
                aria-label={t('header.openMenu')}
                title={t('header.menuTitle')}
              >
                <span className="burger" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
              </button>

              {menuOpen && (
                <div className="dropdown">
                  <div className="dropdown__title">{t('header.menuTitle')}</div>
                  <Link
                    to="/account/profile"
                    className="dropdown__item"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t('header.menuProfile')}
                  </Link>
                  <Link
                    to="/account/wallet"
                    className="dropdown__item"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t('header.menuWallet')}
                  </Link>
                  <Link
                    to="/account/deposit-requests"
                    className="dropdown__item"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t('header.menuDepositRequests')}
                  </Link>
                  <div className="dropdown__divider" />
                  <button
                    className="dropdown__item dropdown__item--action"
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    aria-busy={isLoggingOut}
                  >
                    {t('header.logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn--primary header__login">
                {t('header.login')}
              </Link>
              <Link to="/register" className="btn btn--secondary header__login">
                {t('header.register')}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
