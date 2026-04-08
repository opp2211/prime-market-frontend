import { getOfferCopy } from './offerCopy'

export function getOfferLocale(language = 'ru') {
  return language === 'en' ? 'en-US' : 'ru-RU'
}

export function formatOfferPrice(amount, currencyCode, language = 'ru') {
  const numberValue = Number(amount)
  if (!Number.isFinite(numberValue)) {
    return currencyCode ? `— ${currencyCode}` : '—'
  }

  if (currencyCode) {
    try {
      return new Intl.NumberFormat(getOfferLocale(language), {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: numberValue % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
      }).format(numberValue)
    } catch {
      return `${numberValue.toFixed(numberValue % 1 === 0 ? 0 : 2)} ${currencyCode}`
    }
  }

  return new Intl.NumberFormat(getOfferLocale(language), {
    minimumFractionDigits: numberValue % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(numberValue)
}

export function formatOfferNumber(value, language = 'ru') {
  const numberValue = Number(value)
  if (!Number.isFinite(numberValue)) return '—'
  return new Intl.NumberFormat(getOfferLocale(language), {
    minimumFractionDigits: numberValue % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(numberValue)
}

export function formatOfferDate(value, language = 'ru') {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat(getOfferLocale(language), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

export function resolveOfferStatusLabel(status, language = 'ru') {
  const copy = getOfferCopy(language)
  const normalized = (status || '').toString().trim().toLowerCase()
  return copy.status[normalized] || copy.status.unknown
}

export function resolveOfferStatusTone(status) {
  const normalized = (status || '').toString().trim().toLowerCase()
  if (normalized === 'active') return 'success'
  if (normalized === 'paused') return 'warn'
  if (normalized === 'draft') return 'info'
  if (normalized === 'closed') return 'muted'
  return 'muted'
}

export function resolveOfferSideLabel(side, language = 'ru') {
  const copy = getOfferCopy(language)
  const normalized = (side || '').toString().trim().toLowerCase()
  return copy.side[normalized] || side || copy.common.noValue
}

export function resolveOfferSideTone(side) {
  const normalized = (side || '').toString().trim().toLowerCase()
  return normalized === 'buy' ? 'info' : 'accent'
}

export function buildOfferFallbackTitle(offer, language = 'ru') {
  const copy = getOfferCopy(language)
  const sideLabel = resolveOfferSideLabel(offer?.side, language)
  const categoryTitle = offer?.category?.title?.trim()
  const gameTitle = offer?.game?.title?.trim()

  if (sideLabel && categoryTitle) {
    return `${sideLabel} ${categoryTitle}`
  }

  if (sideLabel && gameTitle) {
    return `${sideLabel} ${gameTitle}`
  }

  return gameTitle || categoryTitle || copy.common.fallbackTitle
}

export function resolveOfferDisplayTitle(offer, language = 'ru') {
  const title = offer?.title?.trim()
  if (title) return title
  return buildOfferFallbackTitle(offer, language)
}

export function resolveOfferMetaDate(offer, language = 'ru') {
  const copy = getOfferCopy(language)
  const publishedAt = formatOfferDate(offer?.publishedAt, language)
  if (publishedAt) {
    return `${copy.list.publishedAt} ${publishedAt}`
  }

  const createdAt = formatOfferDate(offer?.createdAt, language)
  if (createdAt) {
    return `${copy.list.createdAt} ${createdAt}`
  }

  return copy.common.noValue
}
