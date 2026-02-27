import { http } from './http'

export function getCurrencies() {
  return http.get('/currencies')
}

export function getDepositMethods(currencyCode) {
  return http.get('/deposit-methods', {
    params: { currency_code: currencyCode },
  })
}
