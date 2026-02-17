/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const LANG_KEY = 'pm_lang'
const SUPPORTED_LANGS = ['ru', 'en']

const messages = {
  ru: {
    brand: {
      subtitle: 'Биржа игровых активов и цифровых товаров',
      aria: 'Prime Market — на главную',
    },
    header: {
      themeToggle: 'Переключить тему',
      themeLight: 'Светлая',
      themeDark: 'Тёмная',
      languageTitle: 'Язык',
      languageAria: 'Выбор языка',
      openMenu: 'Открыть меню',
      menuTitle: 'Аккаунт',
      logout: 'Выйти',
      login: 'Войти',
      register: 'Регистрация',
    },
    home: {
      eyebrow: 'Площадка для игровых активов',
      title: 'Prime Market — современный маркетплейс цифровых товаров',
      description:
        'Покупайте и продавайте игровые предметы, аккаунты и услуги в одном месте. Понятный интерфейс, быстрый старт и прозрачные условия.',
      ctaPrimary: 'Создать аккаунт',
      ctaSecondary: 'Войти',
      pillOne: 'Простое размещение лотов',
      pillTwo: 'Сделки без лишних шагов',
      pillThree: 'Понятные комиссии',
      sectionTitle: 'Как это работает',
      sectionSubtitle: 'Три простых шага, чтобы начать работу на площадке.',
      stepOneTitle: 'Создайте аккаунт',
      stepOneText: 'Заполните профиль и добавьте основные данные для связи.',
      stepTwoTitle: 'Опубликуйте лот',
      stepTwoText: 'Добавьте описание, цену и формат сделки, чтобы вас нашли покупатели.',
      stepThreeTitle: 'Договоритесь о сделке',
      stepThreeText: 'Обсудите детали и завершите покупку на удобных условиях.',
    },
    login: {
      title: 'Вход',
      emailLabel: 'Email',
      emailPlaceholder: 'Введите email',
      emailRequired: 'Введите email.',
      emailInvalid: 'Некорректный формат email.',
      passwordLabel: 'Пароль',
      passwordPlaceholder: 'Введите пароль',
      passwordRequired: 'Введите пароль.',
      submit: 'Войти',
      submitting: 'Входим...',
      divider: 'или',
      oauthGoogle: 'Продолжить с Google',
      oauthDiscord: 'Продолжить с Discord',
      noAccount: 'Нет аккаунта?',
      registerLink: 'Зарегистрироваться',
      invalidCredentials: 'Неверный email или пароль.',
      errorFallback: 'Не удалось войти. Проверьте email и пароль.',
    },
    register: {
      title: 'Регистрация',
      usernameLabel: 'Имя пользователя',
      usernamePlaceholder: 'Введите имя пользователя',
      emailLabel: 'Email',
      emailPlaceholder: 'Введите email',
      passwordLabel: 'Пароль',
      passwordPlaceholder: 'Введите пароль',
      passwordConfirmLabel: 'Повторите пароль',
      passwordConfirmPlaceholder: 'Повторите пароль',
      submit: 'Зарегистрироваться',
      submitting: 'Регистрируем...',
      haveAccount: 'Уже есть аккаунт?',
      loginLink: 'Войти',
      mismatch: 'Пароли не совпадают.',
      errorFallback: 'Не удалось зарегистрироваться. Проверьте данные.',
    },
  },
  en: {
    brand: {
      subtitle: 'Marketplace for gaming assets and digital goods',
      aria: 'Prime Market - home',
    },
    header: {
      themeToggle: 'Toggle theme',
      themeLight: 'Light',
      themeDark: 'Dark',
      languageTitle: 'Language',
      languageAria: 'Language selection',
      openMenu: 'Open menu',
      menuTitle: 'Account',
      logout: 'Log out',
      login: 'Log in',
      register: 'Sign up',
    },
    home: {
      eyebrow: 'Marketplace for gaming assets',
      title: 'Prime Market — a modern hub for digital goods',
      description:
        'Buy and sell in-game items, accounts, and services in one place. Clear interface, quick start, and transparent terms.',
      ctaPrimary: 'Create account',
      ctaSecondary: 'Log in',
      pillOne: 'Easy listings',
      pillTwo: 'No extra steps',
      pillThree: 'Clear terms',
      sectionTitle: 'How it works',
      sectionSubtitle: 'Three simple steps to get started on the marketplace.',
      stepOneTitle: 'Create an account',
      stepOneText: 'Set up your profile and add the essentials to get started.',
      stepTwoTitle: 'Publish a listing',
      stepTwoText: 'Add description, price, and deal type so buyers can find you.',
      stepThreeTitle: 'Close the deal',
      stepThreeText: 'Agree on details and complete the transaction on your terms.',
    },
    login: {
      title: 'Log in',
      emailLabel: 'Email',
      emailPlaceholder: 'Enter email',
      emailRequired: 'Enter email.',
      emailInvalid: 'Invalid email format.',
      passwordLabel: 'Password',
      passwordPlaceholder: 'Enter password',
      passwordRequired: 'Enter password.',
      submit: 'Log in',
      submitting: 'Logging in...',
      divider: 'or',
      oauthGoogle: 'Continue with Google',
      oauthDiscord: 'Continue with Discord',
      noAccount: 'No account?',
      registerLink: 'Sign up',
      invalidCredentials: 'Invalid email or password.',
      errorFallback: "Couldn't log in. Check email/password.",
    },
    register: {
      title: 'Sign up',
      usernameLabel: 'Username',
      usernamePlaceholder: 'Enter username',
      emailLabel: 'Email',
      emailPlaceholder: 'Enter email',
      passwordLabel: 'Password',
      passwordPlaceholder: 'Enter password',
      passwordConfirmLabel: 'Confirm password',
      passwordConfirmPlaceholder: 'Confirm password',
      submit: 'Sign up',
      submitting: 'Signing up...',
      haveAccount: 'Already have an account?',
      loginLink: 'Log in',
      mismatch: 'Passwords do not match.',
      errorFallback: "Couldn't sign up. Check your details.",
    },
  },
}

function resolvePath(obj, path) {
  const parts = path.split('.')
  let current = obj
  for (const part of parts) {
    if (!current || typeof current !== 'object') return null
    current = current[part]
  }
  return current
}

function getInitialLanguage() {
  if (typeof window === 'undefined') return 'ru'
  let stored = null
  try {
    stored = localStorage.getItem(LANG_KEY)
  } catch {
    stored = null
  }
  if (SUPPORTED_LANGS.includes(stored)) return stored
  const navLang = (navigator?.language || '').toLowerCase()
  return navLang.startsWith('en') ? 'en' : 'ru'
}

function applyLanguage(next) {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = next
  }
  try {
    localStorage.setItem(LANG_KEY, next)
  } catch {
    // ignore storage errors
  }
}

const I18nContext = createContext({
  language: 'ru',
  setLanguage: () => {},
  t: (key) => key,
})

export function I18nProvider({ children }) {
  const [language, setLanguageState] = useState(getInitialLanguage)

  useEffect(() => {
    applyLanguage(language)
  }, [language])

  const value = useMemo(() => {
    const t = (key) => {
      const langPack = messages[language] || messages.ru
      const resolved = resolvePath(langPack, key)
      return resolved == null ? key : resolved
    }

    const setLanguage = (next) => {
      if (!SUPPORTED_LANGS.includes(next)) return
      setLanguageState(next)
    }

    return { language, setLanguage, t }
  }, [language])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  return useContext(I18nContext)
}
