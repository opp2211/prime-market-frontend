import { http } from './http'

export function listNotifications(params) {
  return http.get('/notifications', { params })
}

export function getUnreadNotificationCount() {
  return http.get('/notifications/unread-count')
}

export function markNotificationRead(id) {
  return http.post(`/notifications/${id}/read`)
}

export function markAllNotificationsRead() {
  return http.post('/notifications/read-all')
}
