import { toNumericId } from './apiParams'
import { apiGet, apiPost, type ApiQuery } from './openapiClient'

export function listNotifications(params?: ApiQuery<'/api/notifications', 'get'>) {
  return apiGet('/api/notifications', { params })
}

export function getUnreadNotificationCount() {
  return apiGet('/api/notifications/unread-count')
}

export function markNotificationRead(id: string | number) {
  return apiPost('/api/notifications/{id}/read', {
    path: { id: toNumericId(id) },
  })
}

export function markAllNotificationsRead() {
  return apiPost('/api/notifications/read-all')
}
