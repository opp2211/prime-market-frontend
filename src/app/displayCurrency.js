import { useSyncExternalStore } from 'react'
import { readLocalStorage, writeLocalStorage } from '../shared/lib/storage'

const DISPLAY_CURRENCY_KEY = 'pm_display_currency'
const DEFAULT_DISPLAY_CURRENCY = 'RUB'
const listeners = new Set()

let displayCurrencyState = {
  currencyCode: readInitialCurrency(),
}

function readInitialCurrency() {
  const stored = readLocalStorage(DISPLAY_CURRENCY_KEY)
  return normalizeCurrencyCode(stored) || DEFAULT_DISPLAY_CURRENCY
}

function normalizeCurrencyCode(value) {
  const normalized = (value || '').toString().trim().toUpperCase()
  return normalized || ''
}

function notify() {
  listeners.forEach((listener) => listener())
}

export function getDisplayCurrencySnapshot() {
  return displayCurrencyState
}

export function setDisplayCurrency(currencyCode) {
  const nextCurrencyCode = normalizeCurrencyCode(currencyCode)
  if (!nextCurrencyCode || nextCurrencyCode === displayCurrencyState.currencyCode) return

  displayCurrencyState = { currencyCode: nextCurrencyCode }
  writeLocalStorage(DISPLAY_CURRENCY_KEY, nextCurrencyCode)
  notify()
}

export function subscribeDisplayCurrency(listener) {
  listeners.add(listener)

  const onStorage = (event) => {
    if (event.key !== DISPLAY_CURRENCY_KEY) return
    const nextCurrencyCode = normalizeCurrencyCode(event.newValue) || DEFAULT_DISPLAY_CURRENCY
    if (nextCurrencyCode === displayCurrencyState.currencyCode) return

    displayCurrencyState = { currencyCode: nextCurrencyCode }
    notify()
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', onStorage)
  }

  return () => {
    listeners.delete(listener)
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', onStorage)
    }
  }
}

export function useDisplayCurrency() {
  return useSyncExternalStore(
    subscribeDisplayCurrency,
    getDisplayCurrencySnapshot,
    getDisplayCurrencySnapshot
  )
}
