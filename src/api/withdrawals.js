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

function buildWithdrawalListQuery(params = {}) {
  const query = new URLSearchParams()
  const { status, page, size, sort } = params

  if (status) {
    query.set('status', String(status))
  }

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

export function getWithdrawalMethods(currencyCode) {
  return http.get('/withdrawal-methods', {
    params: { currency_code: currencyCode },
  })
}

export function createWithdrawalRequest(payload) {
  return http.post('/withdrawal-requests', payload)
}

export function getWithdrawalRequests(params) {
  return http.get(`/withdrawal-requests${buildWithdrawalListQuery(params)}`)
}

export function getWithdrawalRequest(publicId) {
  return http.get(`/withdrawal-requests/${publicId}`)
}

export function cancelWithdrawalRequest(publicId) {
  return http.post(`/withdrawal-requests/${publicId}/cancel`)
}
