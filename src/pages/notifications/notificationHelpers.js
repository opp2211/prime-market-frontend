import { formatDateTime } from '../../shared/lib/format'

export const HEADER_NOTIFICATIONS_LIMIT = 6
export const NOTIFICATIONS_PAGE_SIZE = 20
export const NOTIFICATION_FILTERS = ['all', 'unread', 'read']

const ORDER_NOTIFICATION_TYPES = new Set([
  'order_created',
  'order_status_changed',
  'order_message_received',
  'order_request_created',
  'order_request_resolved',
  'dispute_opened',
  'dispute_taken_in_work',
])

const DEPOSIT_NOTIFICATION_TYPES = new Set(['deposit_confirmed', 'deposit_rejected'])

const WITHDRAWAL_NOTIFICATION_TYPES = new Set([
  'withdrawal_completed',
  'withdrawal_rejected',
])

function normalizeType(type = '') {
  return type.toString().trim().toLowerCase()
}

function normalizeCount(value) {
  const parsed = Number.parseInt(`${value ?? 0}`, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}

function getPayloadValue(payload, key) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return ''
  const value = payload[key]
  return typeof value === 'string' ? value : ''
}

export function normalizeNotificationItem(item) {
  const payload =
    item?.payload && typeof item.payload === 'object' && !Array.isArray(item.payload)
      ? item.payload
      : {}

  return {
    publicId: item?.publicId || '',
    type: normalizeType(item?.type),
    title: item?.title || '',
    body: item?.body || '',
    payload,
    isRead: Boolean(item?.isRead),
    createdAt: item?.createdAt || '',
    readAt: item?.readAt || '',
  }
}

export function getNotificationFilter(value) {
  return NOTIFICATION_FILTERS.includes(value) ? value : 'all'
}

export function getNotificationIsReadFilter(filter = 'all') {
  if (filter === 'unread') return false
  if (filter === 'read') return true
  return undefined
}

export function formatNotificationDateTime(value, { language = 'ru', fallback = '—' } = {}) {
  return formatDateTime(value, fallback, language === 'en' ? 'en-US' : 'ru-RU')
}

export function formatUnreadBadge(count) {
  const normalized = normalizeCount(count)
  return normalized > 99 ? '99+' : `${normalized}`
}

export function resolveNotificationDestination(notification) {
  const type = normalizeType(notification?.type)

  if (ORDER_NOTIFICATION_TYPES.has(type)) {
    const orderPublicId = getPayloadValue(notification?.payload, 'orderPublicId')
    return orderPublicId ? `/orders/${orderPublicId}` : '/dashboard/orders'
  }

  if (DEPOSIT_NOTIFICATION_TYPES.has(type)) {
    const depositRequestPublicId = getPayloadValue(
      notification?.payload,
      'depositRequestPublicId'
    )
    return depositRequestPublicId
      ? `/money/deposit-requests/${depositRequestPublicId}`
      : '/money/deposit-requests'
  }

  if (WITHDRAWAL_NOTIFICATION_TYPES.has(type)) {
    const withdrawalRequestPublicId = getPayloadValue(
      notification?.payload,
      'withdrawalRequestPublicId'
    )
    return withdrawalRequestPublicId
      ? `/money/withdrawal-requests/${withdrawalRequestPublicId}`
      : '/money/withdrawal-requests'
  }

  return '/notifications'
}

export function applyNotificationUpdate(items, updatedNotification, filter = 'all') {
  if (!Array.isArray(items)) return []
  if (!updatedNotification?.publicId) return items

  const nextItems = items.map((item) =>
    item?.publicId === updatedNotification.publicId ? { ...item, ...updatedNotification } : item
  )

  if (filter === 'unread' && updatedNotification.isRead) {
    return nextItems.filter((item) => item?.publicId !== updatedNotification.publicId)
  }

  return nextItems
}

export function prependNotificationItem(items, notification, { filter = 'all', limit } = {}) {
  if (!Array.isArray(items)) return []

  const normalizedNotification = normalizeNotificationItem(notification)
  if (!normalizedNotification.publicId) return items
  if (filter === 'read' || (filter === 'unread' && normalizedNotification.isRead)) {
    return items
  }

  const currentItem = items.find((item) => item?.publicId === normalizedNotification.publicId)
  const mergedNotification = currentItem
    ? { ...currentItem, ...normalizedNotification }
    : normalizedNotification
  const nextItems = [
    mergedNotification,
    ...items.filter((item) => item?.publicId !== normalizedNotification.publicId),
  ]

  if (typeof limit === 'number' && limit > 0) {
    return nextItems.slice(0, limit)
  }

  return nextItems
}

export function applyNotificationEvents(items, events, { filter = 'all', limit } = {}) {
  if (!Array.isArray(items)) return []

  return (Array.isArray(events) ? events : []).reduce((currentItems, event) => {
    if (!event || typeof event !== 'object') return currentItems

    if (event.type === 'notification.created') {
      return prependNotificationItem(currentItems, event.notification, { filter, limit })
    }

    if (event.type === 'notification.updated') {
      return applyNotificationUpdate(currentItems, event.notification, filter)
    }

    if (event.type === 'notifications.read_all') {
      return filter === 'unread' ? [] : markNotificationListRead(currentItems)
    }

    return currentItems
  }, items)
}

export function markNotificationListRead(items) {
  if (!Array.isArray(items)) return []
  return items.map((item) => (item?.isRead ? item : { ...item, isRead: true }))
}
