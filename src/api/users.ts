import { apiGet, apiPatch } from './openapiClient'

export function getMe() {
  return apiGet('/api/users/me')
}

export function updateMyPrimaryCurrency(currencyCode: string) {
  return apiPatch('/api/users/me/primary-currency', {
    body: {
      currency_code: currencyCode,
    },
  })
}
