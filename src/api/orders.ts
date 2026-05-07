import { toNumericId } from './apiParams'
import { apiGet, apiPost, type ApiQuery, type ApiRequestBody } from './openapiClient'

export function getMyOrders(params?: ApiQuery<'/api/my/orders', 'get'>) {
  return apiGet('/api/my/orders', { params })
}

export function createOrder(payload: ApiRequestBody<'/api/orders', 'post'>) {
  return apiPost('/api/orders', { body: payload })
}

export function getOrder(orderId: string) {
  return apiGet('/api/orders/{orderCode}', {
    path: { orderCode: orderId },
  })
}

export function getOrderEvents(orderId: string) {
  return apiGet('/api/orders/{orderCode}/events', {
    path: { orderCode: orderId },
  })
}

export function confirmOrderReady(orderId: string) {
  return apiPost('/api/orders/{orderCode}/confirm-ready', {
    path: { orderCode: orderId },
  })
}

export function cancelOrder(orderId: string) {
  return apiPost('/api/orders/{orderCode}/cancel', {
    path: { orderCode: orderId },
  })
}

export function requestCancel(orderId: string) {
  return apiPost('/api/orders/{orderCode}/request-cancel', {
    path: { orderCode: orderId },
  })
}

export function requestAmendQuantity(orderId: string, quantity: number) {
  return apiPost('/api/orders/{orderCode}/request-amend-quantity', {
    body: { quantity },
    path: { orderCode: orderId },
  })
}

export function approveOrderRequest(requestId: string | number) {
  return apiPost('/api/order-requests/{requestId}/approve', {
    path: { requestId: toNumericId(requestId) },
  })
}

export function rejectOrderRequest(requestId: string | number) {
  return apiPost('/api/order-requests/{requestId}/reject', {
    path: { requestId: toNumericId(requestId) },
  })
}

export function markPartiallyDelivered(orderId: string, deliveredQuantity: number) {
  return apiPost('/api/orders/{orderCode}/mark-partially-delivered', {
    body: { deliveredQuantity },
    path: { orderCode: orderId },
  })
}

export function markDelivered(orderId: string) {
  return apiPost('/api/orders/{orderCode}/mark-delivered', {
    path: { orderCode: orderId },
  })
}

export function confirmReceived(orderId: string) {
  return apiPost('/api/orders/{orderCode}/confirm-received', {
    path: { orderCode: orderId },
  })
}
