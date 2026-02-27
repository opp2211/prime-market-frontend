import { readLocalStorage, writeLocalStorage } from '../shared/lib/storage'

const THEME_KEY = 'pm_theme'

export function getInitialTheme() {
  const saved = readLocalStorage(THEME_KEY)
  if (saved === 'light' || saved === 'dark') return saved
  return 'light'
}

export function applyTheme(theme) {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme)
  }
  writeLocalStorage(THEME_KEY, theme)
}
