import { http } from './http'

export function getWithdrawalMethods(currencyCode) {
  return http.get('/withdrawal-methods', {
    params: { currency_code: currencyCode },
  })
}

export function createWithdrawalRequest(payload) {
  return http.post('/withdrawal-requests', payload)
}

export function getWithdrawalRequests(params) {
  return http.get('/withdrawal-requests', { params })
}

export function getWithdrawalRequest(publicId) {
  return http.get(`/withdrawal-requests/${publicId}`)
}

export function cancelWithdrawalRequest(publicId) {
  return http.post(`/withdrawal-requests/${publicId}/cancel`)
}
