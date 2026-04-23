import { useSyncExternalStore } from 'react'
import { getUnreadNotificationCount } from '../api/notifications'
import {
  markNotificationListRead,
  normalizeNotificationItem,
} from '../pages/notifications/notificationHelpers'

const MAX_RECENT_NOTIFICATIONS = 50
const MAX_NOTIFICATION_EVENTS = 40

const listeners = new Set()

let refreshSequence = 0
let unreadCountRequest = null
let notificationState = createInitialNotificationState()

function createInitialNotificationState() {
  return {
    unreadCount: 0,
    status: 'idle',
    error: '',
    recentItems: [],
    streamStatus: 'idle',
    streamConnectionId: '',
    streamConnectedAt: '',
    events: [],
    eventVersion: 0,
    resyncVersion: 0,
  }
}

function normalizeCount(value) {
  const parsed = Number.parseInt(`${value ?? 0}`, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}

function setNotificationState(next) {
  notificationState = { ...notificationState, ...next }
}

function notify() {
  listeners.forEach((listener) => listener())
}

function buildNotificationEvent(type, payload = {}) {
  const version = notificationState.eventVersion + 1
  const nextEvents = [...notificationState.events, { version, type, ...payload }]

  return {
    eventVersion: version,
    events: nextEvents.slice(-MAX_NOTIFICATION_EVENTS),
  }
}

function mergeNotificationLists(primaryItems, secondaryItems = [], limit = MAX_RECENT_NOTIFICATIONS) {
  const nextItems = []
  const indexById = new Map()

  ;[...(Array.isArray(primaryItems) ? primaryItems : []), ...(Array.isArray(secondaryItems) ? secondaryItems : [])]
    .map(normalizeNotificationItem)
    .forEach((item) => {
      if (!item.publicId) return

      const existingIndex = indexById.get(item.publicId)
      if (typeof existingIndex === 'number') {
        nextItems[existingIndex] = { ...nextItems[existingIndex], ...item }
        return
      }

      indexById.set(item.publicId, nextItems.length)
      nextItems.push(item)
    })

  return nextItems.slice(0, limit)
}

function upsertNotificationItem(
  items,
  notification,
  { moveToFront = false, limit = MAX_RECENT_NOTIFICATIONS } = {}
) {
  const normalized = normalizeNotificationItem(notification)
  const currentItems = Array.isArray(items) ? items : []

  if (!normalized.publicId) {
    return currentItems
  }

  const existingItem = currentItems.find((item) => item?.publicId === normalized.publicId)
  const mergedItem = existingItem ? { ...existingItem, ...normalized } : normalized
  const remainingItems = currentItems.filter((item) => item?.publicId !== normalized.publicId)

  if (moveToFront) {
    return [mergedItem, ...remainingItems].slice(0, limit)
  }

  if (existingItem) {
    return currentItems.map((item) =>
      item?.publicId === mergedItem.publicId ? mergedItem : item
    )
  }

  return [...currentItems, mergedItem].slice(0, limit)
}

export function getNotificationsSnapshot() {
  return notificationState
}

export function subscribeNotifications(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useNotifications() {
  return useSyncExternalStore(
    subscribeNotifications,
    getNotificationsSnapshot,
    getNotificationsSnapshot
  )
}

export function clearNotifications() {
  refreshSequence += 1
  unreadCountRequest = null
  notificationState = createInitialNotificationState()
  notify()
}

export function seedRecentNotifications(items) {
  const nextRecentItems = mergeNotificationLists(items, notificationState.recentItems)

  setNotificationState({
    recentItems: nextRecentItems,
  })
  notify()
}

export function setUnreadNotificationCount(count) {
  setNotificationState({
    unreadCount: normalizeCount(count),
    status: 'ready',
    error: '',
  })
  notify()
}

export function setNotificationsStreamState(next = {}) {
  setNotificationState({
    streamStatus: next.status || notificationState.streamStatus,
    streamConnectionId:
      Object.prototype.hasOwnProperty.call(next, 'connectionId')
        ? next.connectionId || ''
        : notificationState.streamConnectionId,
    streamConnectedAt:
      Object.prototype.hasOwnProperty.call(next, 'connectedAt')
        ? next.connectedAt || ''
        : notificationState.streamConnectedAt,
  })
  notify()
}

export function bumpNotificationsResyncVersion() {
  setNotificationState({
    resyncVersion: notificationState.resyncVersion + 1,
  })
  notify()
}

export function applyIncomingNotification(notification) {
  const normalized = normalizeNotificationItem(notification)
  if (!normalized.publicId) return

  const existingItem = notificationState.recentItems.find(
    (item) => item?.publicId === normalized.publicId
  )
  const shouldIncrementUnread = !normalized.isRead && (!existingItem || existingItem.isRead)

  setNotificationState({
    unreadCount: shouldIncrementUnread
      ? notificationState.unreadCount + 1
      : notificationState.unreadCount,
    status: 'ready',
    error: '',
    recentItems: upsertNotificationItem(notificationState.recentItems, normalized, {
      moveToFront: true,
    }),
    ...buildNotificationEvent('notification.created', { notification: normalized }),
  })
  notify()
}

export function syncNotificationRead(previousNotification, updatedNotification) {
  const normalizedUpdated = normalizeNotificationItem(
    updatedNotification || { ...previousNotification, isRead: true }
  )
  if (!normalizedUpdated.publicId) return

  const currentItem = notificationState.recentItems.find(
    (item) => item?.publicId === normalizedUpdated.publicId
  )
  const wasRead = Boolean(
    previousNotification?.isRead ?? currentItem?.isRead ?? normalizedUpdated.isRead
  )
  const shouldDecrementUnread = !wasRead && normalizedUpdated.isRead

  setNotificationState({
    unreadCount: shouldDecrementUnread
      ? Math.max(0, notificationState.unreadCount - 1)
      : notificationState.unreadCount,
    status: 'ready',
    error: '',
    recentItems: upsertNotificationItem(notificationState.recentItems, normalizedUpdated),
    ...buildNotificationEvent('notification.updated', { notification: normalizedUpdated }),
  })
  notify()
}

export function syncAllNotificationsRead() {
  const hasUnreadItems = notificationState.recentItems.some((item) => !item.isRead)

  if (notificationState.unreadCount === 0 && !hasUnreadItems && notificationState.status === 'ready') {
    return
  }

  setNotificationState({
    unreadCount: 0,
    status: 'ready',
    error: '',
    recentItems: markNotificationListRead(notificationState.recentItems),
    ...buildNotificationEvent('notifications.read_all'),
  })
  notify()
}

export async function refreshUnreadNotifications({ silent = false } = {}) {
  if (unreadCountRequest) return unreadCountRequest

  const requestId = refreshSequence + 1
  refreshSequence = requestId

  if (!silent || notificationState.status === 'idle') {
    setNotificationState({
      status: 'loading',
      error: '',
    })
    notify()
  }

  unreadCountRequest = getUnreadNotificationCount()
    .then((response) => {
      if (requestId !== refreshSequence) return notificationState.unreadCount

      setNotificationState({
        unreadCount: normalizeCount(response?.data?.count),
        status: 'ready',
        error: '',
      })
      notify()
      return notificationState.unreadCount
    })
    .catch((error) => {
      if (requestId !== refreshSequence) return notificationState.unreadCount

      setNotificationState({
        status: 'error',
        error: error?.message || 'Failed to load notifications',
      })
      notify()
      throw error
    })
    .finally(() => {
      if (requestId === refreshSequence) {
        unreadCountRequest = null
      }
    })

  return unreadCountRequest
}
