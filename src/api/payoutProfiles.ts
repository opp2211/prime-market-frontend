import { toNumericId } from './apiParams'
import { apiDelete, apiGet, apiPatch, apiPost, type ApiRequestBody } from './openapiClient'

export function getPayoutProfiles() {
  return apiGet('/api/payout-profiles')
}

export function createPayoutProfile(payload: ApiRequestBody<'/api/payout-profiles', 'post'>) {
  return apiPost('/api/payout-profiles', { body: payload })
}

export function updatePayoutProfile(
  profileId: string | number,
  payload: ApiRequestBody<'/api/payout-profiles/{id}', 'patch'>,
) {
  return apiPatch('/api/payout-profiles/{id}', {
    body: payload,
    path: { id: toNumericId(profileId) },
  })
}

export function deletePayoutProfile(profileId: string | number) {
  return apiDelete('/api/payout-profiles/{id}', {
    path: { id: toNumericId(profileId) },
  })
}

export function markDefaultPayoutProfile(profileId: string | number) {
  return apiPost('/api/payout-profiles/{id}/make-default', {
    path: { id: toNumericId(profileId) },
  })
}
