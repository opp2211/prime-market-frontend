import { getOrderCopy } from './orderCopy'

export const ORDER_STATUS_FILTERS = [
  'all',
  'pending',
  'in_progress',
  'partially_delivered',
  'delivered',
  'completed',
  'canceled',
  'expired',
]

export const ORDER_ROLE_FILTERS = ['all', 'buyer', 'seller']

function getOrderLocale(language = 'ru') {
  return language === 'en' ? 'en-US' : 'ru-RU'
}

function normalizeValue(value) {
  return (value || '').toString().trim().toLowerCase()
}

function toFiniteNumber(value) {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : null
}

export function formatOrderNumber(value, language = 'ru', maximumFractionDigits = 2) {
  const numberValue = Number(value)
  if (!Number.isFinite(numberValue)) return '\u2014'

  return new Intl.NumberFormat(getOrderLocale(language), {
    minimumFractionDigits: numberValue % 1 === 0 ? 0 : 2,
    maximumFractionDigits,
  }).format(numberValue)
}

export function formatOrderMoney(amount, currencyCode, language = 'ru') {
  const numberValue = Number(amount)
  if (!Number.isFinite(numberValue)) {
    return currencyCode ? `\u2014 ${currencyCode}` : '\u2014'
  }

  if (currencyCode) {
    try {
      return new Intl.NumberFormat(getOrderLocale(language), {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: numberValue % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
      }).format(numberValue)
    } catch {
      return `${formatOrderNumber(numberValue, language, 2)} ${currencyCode}`
    }
  }

  return formatOrderNumber(numberValue, language, 2)
}

export function formatOrderDate(value, language = 'ru') {
  if (!value) return '\u2014'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '\u2014'

  return new Intl.DateTimeFormat(getOrderLocale(language), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

export function formatOrderDateTime(value, language = 'ru') {
  if (!value) return '\u2014'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '\u2014'

  return new Intl.DateTimeFormat(getOrderLocale(language), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function resolveOrderStatusLabel(status, language = 'ru') {
  const copy = getOrderCopy(language)
  const normalized = normalizeValue(status)
  return copy.status[normalized] || copy.status.unknown
}

export function resolveOrderStatusDescription(status, language = 'ru') {
  const copy = getOrderCopy(language)
  const normalized = normalizeValue(status)
  return copy.statusDescriptions[normalized] || copy.statusDescriptions.unknown
}

export function resolveOrderStatusTone(status) {
  const normalized = normalizeValue(status)

  switch (normalized) {
    case 'pending':
      return 'warn'
    case 'in_progress':
      return 'info'
    case 'partially_delivered':
      return 'accent'
    case 'delivered':
      return 'info'
    case 'completed':
      return 'success'
    case 'canceled':
    case 'expired':
      return 'muted'
    default:
      return 'muted'
  }
}

export function isActiveOrderStatus(status) {
  const normalized = normalizeValue(status)
  return (
    normalized === 'in_progress' ||
    normalized === 'partially_delivered' ||
    normalized === 'delivered'
  )
}

export function resolveOrderRoleLabel(role, language = 'ru') {
  const copy = getOrderCopy(language)
  const normalized = normalizeValue(role)
  return copy.roles[normalized] || copy.roles.unknown
}

export function resolveOrderRoleTone(role) {
  const normalized = normalizeValue(role)
  if (normalized === 'buyer') return 'info'
  if (normalized === 'seller') return 'accent'
  return 'muted'
}

export function resolveOrderRequestId(request) {
  return request?.id || request?.publicId || request?.public_id || ''
}

export function normalizeOrderRequestType(requestType) {
  const normalized = normalizeValue(requestType)

  if (
    normalized === 'cancel' ||
    normalized === 'request_cancel' ||
    normalized === 'cancel_order' ||
    normalized === 'request-cancel'
  ) {
    return 'cancel'
  }

  if (
    normalized === 'amend_quantity' ||
    normalized === 'request_amend_quantity' ||
    normalized === 'quantity_change' ||
    normalized === 'change_quantity' ||
    normalized === 'request-amend-quantity'
  ) {
    return 'amend_quantity'
  }

  return normalized || 'unknown'
}

export function resolveOrderRequestTypeLabel(requestType, language = 'ru') {
  const copy = getOrderCopy(language)
  const normalized = normalizeOrderRequestType(requestType)
  return copy.requestTypes[normalized] || copy.requestTypes.unknown
}

export function resolveOrderRequestStatusLabel(status, language = 'ru') {
  const copy = getOrderCopy(language)
  const normalized = normalizeValue(status)
  return copy.requestStatus[normalized] || copy.requestStatus.unknown
}

export function resolveOrderRequestStatusTone(status) {
  const normalized = normalizeValue(status)

  if (normalized === 'pending') return 'warn'
  if (normalized === 'approved') return 'success'
  if (normalized === 'rejected') return 'danger'
  return 'muted'
}

export function resolveOrderRequestQuantity(request) {
  return (
    request?.requestedQuantity ??
    request?.requested_quantity ??
    request?.quantity ??
    request?.payload?.requestedQuantity ??
    request?.payload?.requested_quantity ??
    request?.payload?.quantity ??
    null
  )
}

export function resolveOrderRequestRoleLabel(request, language = 'ru') {
  return resolveOrderRoleLabel(
    request?.requestedByRole || request?.requested_by_role,
    language
  )
}

export function buildOrderRequestSummary(request, language = 'ru') {
  const copy = getOrderCopy(language)
  const requestType = normalizeOrderRequestType(
    request?.requestType || request?.request_type || request?.type
  )
  const roleLabel = resolveOrderRequestRoleLabel(request, language)

  if (requestType === 'cancel') {
    return copy.details.requests.cancelSummary(roleLabel)
  }

  if (requestType === 'amend_quantity') {
    const quantityLabel = formatOrderNumber(resolveOrderRequestQuantity(request), language, 4)
    return copy.details.requests.amendQuantitySummary(quantityLabel, roleLabel)
  }

  return resolveOrderRequestTypeLabel(requestType, language)
}

export function resolveOrderRequestDecisionText(request, language = 'ru') {
  const copy = getOrderCopy(language)
  const canApprove = Boolean(request?.availableActions?.canApprove)
  const canReject = Boolean(request?.availableActions?.canReject)

  return canApprove || canReject
    ? copy.details.requests.waitingYourDecision
    : copy.details.requests.waitingCounterpartyDecision
}

export function resolveOrderDisplayTitle(order, language = 'ru') {
  const copy = getOrderCopy(language)
  const title = order?.title?.trim()
  if (title) return title
  return copy.common.fallbackTitle
}

export function resolveOrderRouteId(order) {
  return order?.publicId || order?.public_id || order?.id || ''
}

export function resolveOrderCounterparty(order, language = 'ru') {
  const copy = getOrderCopy(language)
  return order?.counterparty?.username || copy.common.counterpartyFallback
}

export function buildOrderSubtitle(order, language = 'ru') {
  const copy = getOrderCopy(language)
  const counterparty = resolveOrderCounterparty(order, language)
  const myRole = normalizeValue(order?.myRole)

  if (myRole === 'buyer') return copy.subtitles.buyer(counterparty)
  if (myRole === 'seller') return copy.subtitles.seller(counterparty)
  return copy.subtitles.generic(counterparty)
}

export function resolveOrderFilterLabel(kind, value, language = 'ru') {
  const copy = getOrderCopy(language)
  const normalized = normalizeValue(value)
  if (normalized === 'all') return copy.common.all
  if (kind === 'role') return resolveOrderRoleLabel(normalized, language)
  return resolveOrderStatusLabel(normalized, language)
}

export function resolveOrderListDate(order, language = 'ru') {
  const copy = getOrderCopy(language)
  const status = normalizeValue(order?.status)

  if (status === 'pending' && order?.expiresAt) {
    return {
      label: copy.list.dateExpires,
      value: formatOrderDateTime(order.expiresAt, language),
    }
  }

  if (order?.updatedAt && order?.updatedAt !== order?.createdAt) {
    return {
      label: copy.list.dateUpdated,
      value: formatOrderDateTime(order.updatedAt, language),
    }
  }

  return {
    label: copy.list.dateCreated,
    value: formatOrderDateTime(order?.createdAt, language),
  }
}

export function buildOrderTagItems(items, valueKey, fallbackKey) {
  return (Array.isArray(items) ? items : [])
    .map((item) => item?.[valueKey] || item?.[fallbackKey])
    .filter(Boolean)
}

export function hasSellerFinance(order) {
  return [order?.sellerGrossAmount, order?.sellerFeeAmount, order?.sellerNetAmount].some(
    (value) => Number.isFinite(Number(value))
  )
}

export function resolveOrderDeliveryMetrics(order) {
  const status = normalizeValue(order?.status)
  const orderedQuantity = toFiniteNumber(order?.orderedQuantity)
  const rawDeliveredQuantity = toFiniteNumber(order?.deliveredQuantity)
  const normalizedOrderedQuantity =
    orderedQuantity != null && orderedQuantity > 0 ? orderedQuantity : null
  const normalizedDeliveredQuantity = Math.max(rawDeliveredQuantity ?? 0, 0)
  const clampedDeliveredQuantity =
    normalizedOrderedQuantity != null
      ? Math.min(normalizedDeliveredQuantity, normalizedOrderedQuantity)
      : normalizedDeliveredQuantity
  const isFullyDelivered =
    normalizedOrderedQuantity != null &&
    (status === 'delivered' || status === 'completed')
  const displayDeliveredQuantity = isFullyDelivered
    ? normalizedOrderedQuantity
    : clampedDeliveredQuantity
  const remainingQuantity =
    normalizedOrderedQuantity != null
      ? Math.max(normalizedOrderedQuantity - displayDeliveredQuantity, 0)
      : null
  const progressPercent =
    normalizedOrderedQuantity != null && normalizedOrderedQuantity > 0
      ? Math.round((displayDeliveredQuantity / normalizedOrderedQuantity) * 100)
      : status === 'completed'
        ? 100
        : 0

  return {
    orderedQuantity: normalizedOrderedQuantity,
    deliveredQuantity: clampedDeliveredQuantity,
    displayDeliveredQuantity,
    remainingQuantity,
    progressPercent,
  }
}
