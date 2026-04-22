import { http } from './http'

export function createOrderDispute(orderId, payload) {
  return http.post(`/orders/${orderId}/disputes`, payload)
}

export function getOrderDispute(orderId) {
  return http.get(`/orders/${orderId}/dispute`)
}

export function getBackofficeDisputes() {
  return http.get('/backoffice/disputes')
}

export function takeOrderDisputeInWork(disputeId) {
  return http.post(`/order-disputes/${disputeId}/take`, {})
}

export function resolveOrderDisputeCancel(disputeId) {
  return http.post(`/order-disputes/${disputeId}/resolve-cancel`, {})
}

export function resolveOrderDisputeComplete(disputeId) {
  return http.post(`/order-disputes/${disputeId}/resolve-complete`, {})
}

export function resolveOrderDisputeAmendQuantityAndComplete(disputeId, quantity) {
  return http.post(`/order-disputes/${disputeId}/resolve-amend-quantity-and-complete`, {
    quantity,
  })
}
