import { http } from './http'

function buildQuery(params = {}) {
  const query = new URLSearchParams()

  if (params.activeOnly != null) {
    query.set('active_only', params.activeOnly ? 'true' : 'false')
  }
  if (params.accountPublicId) {
    query.set('account_public_id', params.accountPublicId)
  }
  if (Number.isFinite(Number(params.page)) && Number(params.page) >= 0) {
    query.set('page', String(params.page))
  }
  if (Number.isFinite(Number(params.size)) && Number(params.size) > 0) {
    query.set('size', String(params.size))
  }
  if (params.sort) {
    query.set('sort', params.sort)
  }

  const output = query.toString()
  return output ? `?${output}` : ''
}

export function getTreasuryAccounts(params) {
  return http.get(`/backoffice/treasury/accounts${buildQuery(params)}`)
}

export function createTreasuryAccount(payload) {
  return http.post('/backoffice/treasury/accounts', payload)
}

export function updateTreasuryAccount(publicId, payload) {
  return http.patch(`/backoffice/treasury/accounts/${publicId}`, payload)
}

export function getTreasuryTransactions(params) {
  return http.get(`/backoffice/treasury/transactions${buildQuery(params)}`)
}

export function createTreasuryTransaction(payload) {
  return http.post('/backoffice/treasury/transactions', payload)
}

export function createTreasuryTransfer(payload) {
  return http.post('/backoffice/treasury/transfers', payload)
}
