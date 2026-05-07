import { http } from './http'

export function createDepositRequest(payload) {
  return http.post('/deposit-requests', payload)
}

export function getDepositRequests(params) {
  return http.get('/deposit-requests', { params })
}

export function getDepositRequest(requestCode) {
  return http.get(`/deposit-requests/${requestCode}`)
}

export function markDepositRequestPaid(requestCode) {
  return http.post(`/deposit-requests/${requestCode}/mark-paid`)
}

export function cancelDepositRequest(requestCode) {
  return http.post(`/deposit-requests/${requestCode}/cancel`)
}
