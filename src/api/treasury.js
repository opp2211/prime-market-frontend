import { http } from './http'

function buildQuery(params = {}) {
  const query = new URLSearchParams()

  if (params.activeOnly != null) {
    query.set('active_only', params.activeOnly ? 'true' : 'false')
  }
  if (params.accountId) {
    query.set('account_id', params.accountId)
  }
  if (params.depositMethodId) {
    query.set('deposit_method_id', params.depositMethodId)
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

export function updateTreasuryAccount(id, payload) {
  return http.patch(`/backoffice/treasury/accounts/${id}`, payload)
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

export function getTreasuryExposure() {
  return http.get('/backoffice/treasury/exposure')
}

export function getPlatformAccounts() {
  return http.get('/backoffice/platform-accounts')
}

export function getPlatformAccountTransactions(params) {
  return http.get(`/backoffice/platform-accounts/transactions${buildQuery(params)}`)
}

export function createPlatformAccountAdjustment(payload) {
  return http.post('/backoffice/platform-accounts/transactions', payload)
}

export function getBackofficeDepositMethods() {
  return http.get('/backoffice/deposit-methods')
}

export function getDepositPaymentRoutes(params) {
  return http.get(`/backoffice/deposit-payment-routes${buildQuery(params)}`)
}

export function createDepositPaymentRoute(payload) {
  return http.post('/backoffice/deposit-payment-routes', payload)
}

export function updateDepositPaymentRoute(id, payload) {
  return http.patch(`/backoffice/deposit-payment-routes/${id}`, payload)
}
