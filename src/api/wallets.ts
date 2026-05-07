import { apiGet, type ApiQuery } from './openapiClient'

export function getMyWallets() {
  return apiGet('/api/wallets/me')
}

export function getMyWalletTransactions(params?: ApiQuery<'/api/wallets/me/txs', 'get'>) {
  return apiGet('/api/wallets/me/txs', { params })
}

export function getMyWalletWorkSummary() {
  return apiGet('/api/wallets/me/work-summary')
}
