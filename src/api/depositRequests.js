import { http } from './http'

export function createDepositRequest(payload) {
  return http.post('/deposit-requests', payload)
}

export function getDepositRequests(params) {
  return http.get('/deposit-requests', { params })
}

export function getDepositRequest(publicId) {
  return http.get(`/deposit-requests/${publicId}`)
}

export function markDepositRequestPaid(publicId) {
  return http.post(`/deposit-requests/${publicId}/mark-paid`)
}

export function cancelDepositRequest(publicId) {
  return http.post(`/deposit-requests/${publicId}/cancel`)
}
