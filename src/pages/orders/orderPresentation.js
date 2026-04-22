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

function getFinancialLabels(language = 'ru') {
  if (language === 'en') {
    return {
      dealAmount: 'Deal amount',
      feeAmount: 'Fee',
      feeRate: 'Fee rate',
      primaryFallback: 'Deal amount',
      toReceive: 'To receive',
      unitPrice: 'Unit price',
    }
  }

  return {
    dealAmount: '\u0421\u0443\u043c\u043c\u0430 \u0441\u0434\u0435\u043b\u043a\u0438',
    feeAmount: '\u041a\u043e\u043c\u0438\u0441\u0441\u0438\u044f',
    feeRate: '\u0421\u0442\u0430\u0432\u043a\u0430 \u043a\u043e\u043c\u0438\u0441\u0441\u0438\u0438',
    primaryFallback: '\u0421\u0443\u043c\u043c\u0430 \u0441\u0434\u0435\u043b\u043a\u0438',
    toReceive: '\u041a \u043f\u043e\u043b\u0443\u0447\u0435\u043d\u0438\u044e',
    unitPrice: '\u0426\u0435\u043d\u0430 \u0437\u0430 \u0435\u0434\u0438\u043d\u0438\u0446\u0443',
  }
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

export function formatMoneyWithCurrency(amount, currencyCode, language = 'ru') {
  const formattedAmount = formatOrderNumber(amount, language, 2)
  return currencyCode ? `${formattedAmount} ${currencyCode}` : formattedAmount
}

function formatFinancialPercent(value, language = 'ru') {
  const numberValue = Number(value)
  if (!Number.isFinite(numberValue)) return '\u2014'

  return `${formatOrderNumber(numberValue, language, 2)}%`
}

function getFinancialSummary(order) {
  const summary = order?.financialSummary || order?.financial_summary
  if (!summary || typeof summary !== 'object' || Array.isArray(summary)) return null
  return summary
}

function getFinancialSummaryValue(summary, camelKey, snakeKey) {
  return summary?.[camelKey] ?? summary?.[snakeKey]
}

function resolveFinancialCurrency(summary, primary = false) {
  if (!summary) return ''

  if (primary) {
    return (
      getFinancialSummaryValue(
        summary,
        'primaryCurrencyCode',
        'primary_currency_code'
      ) ||
      getFinancialSummaryValue(summary, 'currencyCode', 'currency_code') ||
      ''
    )
  }

  return (
    getFinancialSummaryValue(summary, 'currencyCode', 'currency_code') ||
    getFinancialSummaryValue(
      summary,
      'primaryCurrencyCode',
      'primary_currency_code'
    ) ||
    ''
  )
}

function resolveFinancialPerspective(summary) {
  return normalizeValue(
    getFinancialSummaryValue(summary, 'viewerPerspective', 'viewer_perspective')
  )
}

function resolveFeeRatePercent(summary) {
  const feeRatePercent = toFiniteNumber(
    getFinancialSummaryValue(summary, 'feeRatePercent', 'fee_rate_percent')
  )
  if (feeRatePercent != null) return feeRatePercent

  const feeRateBps = toFiniteNumber(
    getFinancialSummaryValue(summary, 'feeRateBps', 'fee_rate_bps')
  )
  return feeRateBps != null ? feeRateBps / 100 : null
}

function buildLegacyFinancialPrimary(order, language = 'ru') {
  const labels = getFinancialLabels(language)
  const currencyCode = order?.viewerCurrencyCode || order?.price?.currencyCode
  const totalAmount = order?.displayTotalAmount ?? order?.price?.totalAmount

  return {
    key: 'primary',
    label: labels.primaryFallback,
    value: formatMoneyWithCurrency(totalAmount, currencyCode, language),
    viewerPerspective: '',
  }
}

function buildLegacyFinancialMetaRows(order, language = 'ru') {
  const labels = getFinancialLabels(language)
  const currencyCode = order?.viewerCurrencyCode || order?.price?.currencyCode
  const unitAmount = order?.displayUnitPriceAmount ?? order?.price?.unitAmount

  return [
    {
      key: 'unitPrice',
      label: labels.unitPrice,
      value: formatMoneyWithCurrency(unitAmount, currencyCode, language),
    },
  ]
}

export function getFinancialPrimary(order, language = 'ru') {
  const summary = getFinancialSummary(order)
  if (!summary) return buildLegacyFinancialPrimary(order, language)

  const labels = getFinancialLabels(language)
  const viewerPerspective = resolveFinancialPerspective(summary)
  const primaryLabel =
    getFinancialSummaryValue(summary, 'primaryLabel', 'primary_label') ||
    (viewerPerspective === 'maker' ? labels.toReceive : labels.primaryFallback)
  const primaryAmount = getFinancialSummaryValue(
    summary,
    'primaryAmount',
    'primary_amount'
  )
  const primaryCurrencyCode = resolveFinancialCurrency(summary, true)

  return {
    key: 'primary',
    label: primaryLabel,
    value: formatMoneyWithCurrency(primaryAmount, primaryCurrencyCode, language),
    viewerPerspective,
  }
}

export function formatFinancialPrimary(order, language = 'ru') {
  return getFinancialPrimary(order, language).value
}

export function getFinancialMetaRows(order, language = 'ru') {
  const summary = getFinancialSummary(order)
  if (!summary) return buildLegacyFinancialMetaRows(order, language)

  const labels = getFinancialLabels(language)
  const viewerPerspective = resolveFinancialPerspective(summary)
  const currencyCode = resolveFinancialCurrency(summary)
  const unitPriceAmount = getFinancialSummaryValue(
    summary,
    'unitPriceAmount',
    'unit_price_amount'
  )

  if (viewerPerspective !== 'maker') {
    return [
      {
        key: 'unitPrice',
        label: labels.unitPrice,
        value: formatMoneyWithCurrency(unitPriceAmount, currencyCode, language),
      },
    ]
  }

  return [
    {
      key: 'dealAmount',
      label: labels.dealAmount,
      value: formatMoneyWithCurrency(
        getFinancialSummaryValue(summary, 'dealAmount', 'deal_amount'),
        currencyCode,
        language
      ),
    },
    {
      key: 'unitPrice',
      label: labels.unitPrice,
      value: formatMoneyWithCurrency(unitPriceAmount, currencyCode, language),
    },
    {
      key: 'feeRate',
      label: labels.feeRate,
      value: formatFinancialPercent(resolveFeeRatePercent(summary), language),
    },
    {
      key: 'feeAmount',
      label: labels.feeAmount,
      value: formatMoneyWithCurrency(
        getFinancialSummaryValue(summary, 'feeAmount', 'fee_amount'),
        currencyCode,
        language
      ),
    },
  ]
}

export function getFinancialDetailRows(order, language = 'ru') {
  return [
    getFinancialPrimary(order, language),
    ...getFinancialMetaRows(order, language),
  ]
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
  if (normalized === 'support') {
    return language === 'en' ? 'Support' : '\u041f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0430'
  }
  return copy.roles[normalized] || copy.roles.unknown
}

export function resolveOrderRoleTone(role) {
  const normalized = normalizeValue(role)
  if (normalized === 'buyer') return 'info'
  if (normalized === 'seller') return 'accent'
  if (normalized === 'support') return 'warn'
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
  const canApprove = canApproveOrderRequest(request)
  const canReject = canRejectOrderRequest(request)

  return canApprove || canReject
    ? copy.details.requests.waitingYourDecision
    : copy.details.requests.waitingCounterpartyDecision
}

export function canApproveOrderRequest(request) {
  return Boolean(request?.canApprove ?? request?.availableActions?.canApprove)
}

export function canRejectOrderRequest(request) {
  return Boolean(request?.canReject ?? request?.availableActions?.canReject)
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

export function formatOrderShortId(value, visibleLength = 7) {
  const rawValue =
    value && typeof value === 'object' ? resolveOrderRouteId(value) : value
  const compactValue = `${rawValue || ''}`.trim().replace(/[^a-zA-Z0-9]/g, '')

  if (!compactValue) return ''

  return compactValue.slice(-visibleLength)
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
