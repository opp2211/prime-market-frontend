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

export function requestCancel(orderId) {
  return http.post(`/orders/${orderId}/request-cancel`, {})
}

export function requestAmendQuantity(orderId, quantity) {
  return http.post(`/orders/${orderId}/request-amend-quantity`, {
    quantity,
  })
}

export function approveOrderRequest(requestId) {
  return http.post(`/order-requests/${requestId}/approve`, {})
}

export function rejectOrderRequest(requestId) {
  return http.post(`/order-requests/${requestId}/reject`, {})
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
