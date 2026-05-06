import { http } from './http'

export function getMe() {
  return http.get('/users/me')
}

export function updateMyPrimaryCurrency(currencyCode) {
  return http.patch('/users/me/primary-currency', {
    currency_code: currencyCode,
  })
}
