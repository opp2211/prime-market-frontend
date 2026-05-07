import { apiPost, type ApiRequestBody } from './openapiClient'

export function createCurrencyConversion(
  payload: ApiRequestBody<'/api/currency-conversions', 'post'>,
) {
  return apiPost('/api/currency-conversions', { body: payload })
}
