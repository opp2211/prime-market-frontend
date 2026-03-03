import { http } from './http'

export function getMyWallets() {
  return http.get('/wallets/me')
}

export function getMyWalletTransactions(params) {
  return http.get('/wallets/me/txs', { params })
}
