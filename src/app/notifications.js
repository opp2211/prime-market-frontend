import { useSyncExternalStore } from 'react'
import { getUnreadNotificationCount } from '../api/notifications'

const listeners = new Set()

let refreshSequence = 0
let unreadCountRequest = null
let notificationState = {
  unreadCount: 0,
  status: 'idle',
  error: '',
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
  notificationState = {
    unreadCount: 0,
    status: 'idle',
    error: '',
  }
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

export function decrementUnreadNotificationCount(step = 1) {
  const nextCount = Math.max(0, notificationState.unreadCount - Math.max(1, normalizeCount(step)))
  if (nextCount === notificationState.unreadCount && notificationState.status === 'ready') return

  setNotificationState({
    unreadCount: nextCount,
    status: 'ready',
    error: '',
  })
  notify()
}

export function syncNotificationRead(previousNotification, updatedNotification) {
  if (!previousNotification || previousNotification.isRead) return
  if (!updatedNotification?.isRead) return
  decrementUnreadNotificationCount(1)
}

export function syncAllNotificationsRead() {
  if (notificationState.unreadCount === 0 && notificationState.status === 'ready') return

  setNotificationState({
    unreadCount: 0,
    status: 'ready',
    error: '',
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
