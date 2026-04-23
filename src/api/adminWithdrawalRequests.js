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

export function getAdminWithdrawalRequest(publicId) {
  return http.get(`/backoffice/withdrawal-requests/${publicId}`)
}

export function takeAdminWithdrawalRequest(publicId) {
  return http.post(`/backoffice/withdrawal-requests/${publicId}/take`)
}

export function rejectAdminWithdrawalRequest(publicId, payload) {
  return http.post(`/backoffice/withdrawal-requests/${publicId}/reject`, payload)
}

export function confirmAdminWithdrawalRequest(publicId, payload) {
  return http.post(`/backoffice/withdrawal-requests/${publicId}/confirm`, payload)
}
