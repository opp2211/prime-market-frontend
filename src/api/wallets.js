import { http } from './http'

export function getMyWallets() {
  return http.get('/wallets/me')
}
