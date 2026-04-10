import { http } from './http'

export function getMyOrders(params) {
  return http.get('/my/orders', { params })
}

export function createOrder(payload) {
  return http.post('/orders', payload)
}

export function getOrder(orderId) {
  return http.get(`/orders/${orderId}`)
}

export function getOrderEvents(orderId) {
  return http.get(`/orders/${orderId}/events`)
}

export function confirmOrderReady(orderId) {
  return http.post(`/orders/${orderId}/confirm-ready`)
}

export function cancelOrder(orderId) {
  return http.post(`/orders/${orderId}/cancel`)
}

export function markPartiallyDelivered(orderId, deliveredQuantity) {
  return http.post(`/orders/${orderId}/mark-partially-delivered`, {
    deliveredQuantity,
  })
}

export function markDelivered(orderId) {
  return http.post(`/orders/${orderId}/mark-delivered`, {})
}

export function confirmReceived(orderId) {
  return http.post(`/orders/${orderId}/confirm-received`, {})
}
