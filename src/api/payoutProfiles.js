import { http } from './http'

export function getPayoutProfiles() {
  return http.get('/payout-profiles')
}

export function createPayoutProfile(payload) {
  return http.post('/payout-profiles', payload)
}

export function updatePayoutProfile(profileId, payload) {
  return http.patch(`/payout-profiles/${profileId}`, payload)
}

export function deletePayoutProfile(profileId) {
  return http.delete(`/payout-profiles/${profileId}`)
}

export function markDefaultPayoutProfile(profileId) {
  return http.post(`/payout-profiles/${profileId}/make-default`)
}
