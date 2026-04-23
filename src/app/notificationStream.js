import {
  clearAuth,
  getAccessToken,
  getAuthHeader,
  refreshAccessToken,
  setAuthFromResponse,
} from './auth'
import {
  applyIncomingNotification,
  bumpNotificationsResyncVersion,
  refreshUnreadNotifications,
  setNotificationsStreamState,
  setUnreadNotificationCount,
} from './notifications'
import { normalizeNotificationItem } from '../pages/notifications/notificationHelpers'

const STREAM_URL = '/api/notifications/stream'
const CONNECTED_EVENT = 'stream.connected'
const CREATED_EVENT = 'notification.created'
const KEEPALIVE_EVENT = 'stream.keepalive'
const UNREAD_COUNT_EVENT = 'notifications.unread_count'
const BASE_RECONNECT_DELAY = 1000
const MAX_RECONNECT_DELAY = 30000

let reconnectTimerId = 0
let reconnectAttempt = 0
let manualStop = false
let activeConnectionId = 0
let currentController = null
let currentConnectionPromise = null
let hasConnectedBefore = false

function clearReconnectTimer() {
  if (!reconnectTimerId) return
  window.clearTimeout(reconnectTimerId)
  reconnectTimerId = 0
}

function scheduleReconnect({ immediate = false } = {}) {
  if (manualStop) return

  clearReconnectTimer()

  const delay = immediate
    ? 0
    : Math.min(BASE_RECONNECT_DELAY * 2 ** Math.max(0, reconnectAttempt - 1), MAX_RECONNECT_DELAY)

  setNotificationsStreamState({
    status: hasConnectedBefore ? 'reconnecting' : 'connecting',
    connectionId: '',
    connectedAt: '',
  })

  reconnectTimerId = window.setTimeout(() => {
    reconnectTimerId = 0
    connectNotificationsStream()
  }, delay)
}

async function tryRefreshStreamAuth() {
  try {
    const response = await refreshAccessToken()
    if (!response?.data?.accessToken) return false
    setAuthFromResponse(response.data)
    return true
  } catch {
    clearAuth()
    return false
  }
}

function parseSseEvent(block) {
  let eventName = 'message'
  const dataLines = []

  block.split('\n').forEach((line) => {
    if (!line || line.startsWith(':')) return

    const separatorIndex = line.indexOf(':')
    const field = separatorIndex >= 0 ? line.slice(0, separatorIndex) : line
    let value = separatorIndex >= 0 ? line.slice(separatorIndex + 1) : ''

    if (value.startsWith(' ')) {
      value = value.slice(1)
    }

    if (field === 'event') {
      eventName = value || 'message'
      return
    }

    if (field === 'data') {
      dataLines.push(value)
    }
  })

  return {
    eventName,
    data: dataLines.join('\n'),
  }
}

async function consumeSseStream(body, signal) {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (!signal.aborted) {
      const { value, done } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true }).replace(/\r/g, '')

      let boundaryIndex = buffer.indexOf('\n\n')
      while (boundaryIndex >= 0) {
        const block = buffer.slice(0, boundaryIndex)
        buffer = buffer.slice(boundaryIndex + 2)

        if (block.trim()) {
          handleStreamEvent(parseSseEvent(block))
        }

        boundaryIndex = buffer.indexOf('\n\n')
      }
    }

    buffer += decoder.decode()
    if (buffer.trim()) {
      handleStreamEvent(parseSseEvent(buffer))
    }
  } finally {
    reader.releaseLock()
  }
}

function handleStreamEvent(event) {
  const rawData = event?.data?.trim()
  let payload = null

  if (rawData) {
    try {
      payload = JSON.parse(rawData)
    } catch {
      payload = null
    }
  }

  switch (event?.eventName) {
    case CONNECTED_EVENT: {
      const shouldResync = hasConnectedBefore

      hasConnectedBefore = true
      reconnectAttempt = 0
      setNotificationsStreamState({
        status: 'connected',
        connectionId: payload?.connectionId || '',
        connectedAt: payload?.connectedAt || '',
      })

      refreshUnreadNotifications({ silent: true }).catch(() => {})

      if (shouldResync) {
        bumpNotificationsResyncVersion()
      }
      return
    }

    case UNREAD_COUNT_EVENT:
      setUnreadNotificationCount(payload?.count)
      return

    case CREATED_EVENT:
      applyIncomingNotification(normalizeNotificationItem(payload))
      return

    case KEEPALIVE_EVENT:
      return

    default:
      return
  }
}

async function openNotificationsStream(connectionId, controller) {
  const headers = {
    Accept: 'text/event-stream',
    'Cache-Control': 'no-cache',
  }
  const authHeader = getAuthHeader()
  if (authHeader) {
    headers.Authorization = authHeader
  }

  const response = await fetch(STREAM_URL, {
    method: 'GET',
    headers,
    credentials: 'include',
    cache: 'no-store',
    signal: controller.signal,
  })

  if (controller.signal.aborted || connectionId !== activeConnectionId) {
    return { shouldReconnect: false }
  }

  if (response.status === 401) {
    const refreshed = await tryRefreshStreamAuth()
    return {
      shouldReconnect: refreshed,
      immediateReconnect: refreshed,
    }
  }

  if (!response.ok) {
    throw new Error(`Notifications stream failed with status ${response.status}`)
  }

  if (!response.body) {
    throw new Error('Notifications stream did not return a readable body')
  }

  await consumeSseStream(response.body, controller.signal)

  return { shouldReconnect: true }
}

function connectNotificationsStream() {
  if (manualStop || currentController || currentConnectionPromise) return
  if (!getAccessToken()) return

  const connectionId = activeConnectionId + 1
  activeConnectionId = connectionId
  reconnectAttempt += 1

  setNotificationsStreamState({
    status: hasConnectedBefore ? 'reconnecting' : 'connecting',
    connectionId: '',
    connectedAt: '',
  })

  const controller = new AbortController()
  currentController = controller

  currentConnectionPromise = openNotificationsStream(connectionId, controller)
    .then((result) => {
      if (manualStop || connectionId !== activeConnectionId) return
      if (!result?.shouldReconnect) return
      scheduleReconnect({ immediate: Boolean(result?.immediateReconnect) })
    })
    .catch((error) => {
      if (controller.signal.aborted || manualStop || connectionId !== activeConnectionId) return
      setNotificationsStreamState({
        status: 'reconnecting',
        connectionId: '',
        connectedAt: '',
      })
      scheduleReconnect()
      return error
    })
    .finally(() => {
      if (currentController === controller) {
        currentController = null
      }
      currentConnectionPromise = null
    })
}

export function startNotificationsStream() {
  manualStop = false
  clearReconnectTimer()

  if (currentController || currentConnectionPromise || reconnectTimerId) return

  connectNotificationsStream()
}

export function stopNotificationsStream() {
  manualStop = true
  hasConnectedBefore = false
  reconnectAttempt = 0
  clearReconnectTimer()

  if (currentController) {
    currentController.abort()
    currentController = null
  }

  currentConnectionPromise = null
  setNotificationsStreamState({
    status: 'idle',
    connectionId: '',
    connectedAt: '',
  })
}
