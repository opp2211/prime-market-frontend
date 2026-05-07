import { http } from './http'

function appendQueryValues(query, key, value) {
  if (Array.isArray(value)) {
    value.filter(Boolean).forEach((item) => query.append(key, item))
    return
  }

  if (value) {
    query.append(key, String(value))
  }
}

function buildQuery(params = {}) {
  const query = new URLSearchParams()
  const { status, page, size, sort } = params

  appendQueryValues(query, 'status', status)

  if (Number.isFinite(Number(page)) && Number(page) >= 0) {
    query.set('page', String(page))
  }

  if (Number.isFinite(Number(size)) && Number(size) > 0) {
    query.set('size', String(size))
  }

  appendQueryValues(query, 'sort', sort)

  const output = query.toString()
  return output ? `?${output}` : ''
}

export function getAdminWithdrawalRequests(params) {
  return http.get(`/backoffice/withdrawal-requests${buildQuery(params)}`)
}

export function getAdminWithdrawalRequest(requestCode) {
  return http.get(`/backoffice/withdrawal-requests/${requestCode}`)
}

export function takeAdminWithdrawalRequest(requestCode) {
  return http.post(`/backoffice/withdrawal-requests/${requestCode}/take`)
}

export function rejectAdminWithdrawalRequest(requestCode, payload) {
  return http.post(`/backoffice/withdrawal-requests/${requestCode}/reject`, payload)
}

export function confirmAdminWithdrawalRequest(requestCode, payload) {
  return http.post(`/backoffice/withdrawal-requests/${requestCode}/confirm`, payload)
}

export function planAdminWithdrawalPayout(requestCode, payload) {
  return http.post(`/backoffice/withdrawal-requests/${requestCode}/payout-plan`, payload)
}
