import { apiGet } from './openapiClient'

export function getCurrencies() {
  return apiGet('/api/currencies')
}

export function getDepositMethods(currencyCode: string) {
  return apiGet('/api/deposit-methods', {
    params: { currency_code: currencyCode },
  })
}
