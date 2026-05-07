import {
  MARKET_DEFAULT_STATE,
  MARKET_FALLBACK_VIEWER_CURRENCIES,
  isMarketViewerCurrencySupported,
  resolveMarketViewerCurrencies,
} from './marketFilters'

export const MARKET_GAME_QUERY_PARAM = 'game'
export const MARKET_CATEGORY_QUERY_PARAM = 'category'
export const INITIAL_VIEWER_CURRENCY_OPTIONS = resolveMarketViewerCurrencies(
  MARKET_FALLBACK_VIEWER_CURRENCIES
)

export function readMarketRouteFilters(searchParams) {
  const gameSlug = searchParams.get(MARKET_GAME_QUERY_PARAM) || ''
  const categorySlug = gameSlug ? searchParams.get(MARKET_CATEGORY_QUERY_PARAM) || '' : ''

  return {
    gameSlug,
    categorySlug,
  }
}

export function shallowEqualState(left, right) {
  const leftKeys = Object.keys(left || {})
  const rightKeys = Object.keys(right || {})

  if (leftKeys.length !== rightKeys.length) return false

  return leftKeys.every((key) => left[key] === right[key])
}

export function getCurrencyCodes(options) {
  return (Array.isArray(options) ? options : []).map((option) => option.code).filter(Boolean)
}

export function formatCopyTemplate(template, values) {
  return Object.entries(values).reduce(
    (message, [key, value]) => message.replaceAll(`{${key}}`, value),
    template || ''
  )
}

export function resolveInitialViewerCurrency(displayCurrency) {
  return isMarketViewerCurrencySupported(displayCurrency, INITIAL_VIEWER_CURRENCY_OPTIONS)
    ? displayCurrency
    : MARKET_DEFAULT_STATE.viewerCurrencyCode
}
