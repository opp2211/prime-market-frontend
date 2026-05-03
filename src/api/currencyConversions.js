import { http } from './http'

export function createCurrencyConversion(payload) {
  return http.post('/currency-conversions', payload)
}
