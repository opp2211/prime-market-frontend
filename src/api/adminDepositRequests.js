import { http } from './http'

export function getAdminDepositRequests({ statuses } = {}) {
  if (Array.isArray(statuses) && statuses.length > 0) {
    const params = new URLSearchParams()
    statuses.forEach((status) => {
      if (status) params.append('status', status)
    })
    const query = params.toString()
    return http.get(`/admin/deposit-requests${query ? `?${query}` : ''}`)
  }
  return http.get('/admin/deposit-requests')
}

export function getAdminDepositRequest(publicId) {
  return http.get(`/admin/deposit-requests/${publicId}`)
}

export function rejectAdminDepositRequest(publicId, payload) {
  return http.post(`/admin/deposit-requests/${publicId}/reject`, payload)
}

export function issueAdminDepositDetails(publicId, payload) {
  return http.post(`/admin/deposit-requests/${publicId}/issue-details`, payload)
}

export function confirmAdminDepositRequest(publicId) {
  return http.post(`/admin/deposit-requests/${publicId}/confirm`)
}
