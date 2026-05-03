function getMarketLocale(language = 'ru') {
  return language === 'en' ? 'en-US' : 'ru-RU'
}

function formatNumericValue(value, language = 'ru', maximumFractionDigits = 8) {
  const numberValue = Number(value)
  if (!Number.isFinite(numberValue)) return '-'

  return new Intl.NumberFormat(getMarketLocale(language), {
    minimumFractionDigits: numberValue % 1 === 0 ? 0 : 2,
    maximumFractionDigits,
  }).format(numberValue)
}

export function formatMarketPrice(amount, currencyCode, language = 'ru') {
  const value = formatNumericValue(amount, language)
  return currencyCode ? `${value} ${currencyCode}` : value
}

export function formatMarketNumber(value, language = 'ru', maximumFractionDigits = 4) {
  return formatNumericValue(value, language, maximumFractionDigits)
}

export function formatMarketDate(value, language = 'ru') {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat(getMarketLocale(language), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

export function resolveMarketActionLabel(action, copy) {
  const normalized = (action || '').toString().trim().toLowerCase()
  return copy.actions[normalized] || copy.actions.buy
}

export function resolveMarketIntentLabel(intent, copy) {
  const normalized = (intent || '').toString().trim().toLowerCase()
  return copy.intent[normalized] || copy.intent.buy
}

export function resolveMarketSideLabel(side, copy) {
  const normalized = (side || '').toString().trim().toLowerCase()
  return copy.side[normalized] || copy.side.sell
}

export function buildContextSummary(offer, emptyLabel) {
  const items = (Array.isArray(offer?.contexts) ? offer.contexts : [])
    .map((item) => item?.valueTitle || item?.valueSlug)
    .filter(Boolean)

  if (!items.length) return emptyLabel
  if (items.length <= 2) return items.join(' / ')
  return `${items.slice(0, 2).join(' / ')} +${items.length - 2}`
}

export function buildAttributeSummary(offer, emptyLabel) {
  const items = (Array.isArray(offer?.attributes) ? offer.attributes : [])
    .map((item) => {
      if (item?.optionTitle) return item.optionTitle
      if (item?.valueText) return item.valueText
      if (item?.valueNumber != null) return String(item.valueNumber)
      if (typeof item?.valueBoolean === 'boolean') return String(item.valueBoolean)
      return item?.attributeSlug
    })
    .filter(Boolean)

  if (!items.length) return emptyLabel
  if (items.length <= 2) return items.join(' / ')
  return `${items.slice(0, 2).join(' / ')} +${items.length - 2}`
}

export function buildDeliveryMethodsSummary(offer, emptyLabel) {
  const items = (Array.isArray(offer?.deliveryMethods) ? offer.deliveryMethods : [])
    .map((item) => item?.title || item?.slug)
    .filter(Boolean)

  if (!items.length) return emptyLabel
  if (items.length <= 2) return items.join(' / ')
  return `${items.slice(0, 2).join(' / ')} +${items.length - 2}`
}

export function buildMarketOfferTitle(offer, copy) {
  const title = offer?.title?.trim()
  if (title) return title

  const primaryAttribute = (Array.isArray(offer?.attributes) ? offer.attributes : []).find(
    (attribute) =>
      attribute?.optionTitle ||
      attribute?.valueText ||
      attribute?.valueNumber != null ||
      typeof attribute?.valueBoolean === 'boolean'
  )
  const actionLabel = resolveMarketActionLabel(offer?.action, copy)
  const attributeLabel =
    primaryAttribute?.optionTitle ||
    primaryAttribute?.valueText ||
    (primaryAttribute?.valueNumber != null ? String(primaryAttribute.valueNumber) : '') ||
    (typeof primaryAttribute?.valueBoolean === 'boolean'
      ? String(primaryAttribute.valueBoolean)
      : '')
  const itemLabel = attributeLabel || offer?.category?.title || offer?.game?.title

  if (actionLabel && itemLabel) {
    return `${actionLabel} ${itemLabel}`
  }

  return itemLabel || copy.common.fallbackTitle
}
