import { http } from './http'

function buildQuery(params = {}) {
  const query = new URLSearchParams()
  const { status, statuses, page, size, sort } = params

  if (Array.isArray(statuses)) {
    statuses.forEach((value) => {
      if (value) query.append('status', value)
    })
  } else if (status) {
    query.append('status', status)
  }

  if (Number.isFinite(Number(page)) && Number(page) >= 0) {
    query.set('page', String(page))
  }

  if (Number.isFinite(Number(size)) && Number(size) > 0) {
    query.set('size', String(size))
  }

  if (sort) {
    query.set('sort', sort)
  }

  const output = query.toString()
  return output ? `?${output}` : ''
}

export function getAdminDepositRequests(params) {
  return http.get(`/backoffice/deposit-requests${buildQuery(params)}`)
}

export function getAdminDepositRequest(requestCode) {
  return http.get(`/backoffice/deposit-requests/${requestCode}`)
}

export function rejectAdminDepositRequest(requestCode, payload) {
  return http.post(`/backoffice/deposit-requests/${requestCode}/reject`, payload)
}

export function issueAdminDepositDetails(requestCode, payload) {
  return http.post(`/backoffice/deposit-requests/${requestCode}/issue-details`, payload)
}

export function confirmAdminDepositRequest(requestCode, payload) {
  return http.post(`/backoffice/deposit-requests/${requestCode}/confirm`, payload)
}
