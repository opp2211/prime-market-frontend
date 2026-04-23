import { http } from './http'

export function listNotifications(params) {
  return http.get('/notifications', { params })
}

export function getUnreadNotificationCount() {
  return http.get('/notifications/unread-count')
}

export function markNotificationRead(publicId) {
  return http.post(`/notifications/${publicId}/read`)
}

export function markAllNotificationsRead() {
  return http.post('/notifications/read-all')
}
