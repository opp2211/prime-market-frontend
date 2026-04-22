import { http } from './http'
import { runRequestVariants } from './requestFallbacks'

export function getPayoutProfiles(params) {
  return http.get('/payout-profiles', { params })
}

export function createPayoutProfile(payload) {
  return http.post('/payout-profiles', payload)
}

export function updatePayoutProfile(profileId, payload) {
  return runRequestVariants([
    () => http.patch(`/payout-profiles/${profileId}`, payload),
    () => http.put(`/payout-profiles/${profileId}`, payload),
  ])
}

export function deletePayoutProfile(profileId) {
  return http.delete(`/payout-profiles/${profileId}`)
}

export function markDefaultPayoutProfile(profileId) {
  return runRequestVariants([
    () => http.post(`/payout-profiles/${profileId}/make-default`),
    () => http.post(`/payout-profiles/${profileId}/set-default`),
    () => http.patch(`/payout-profiles/${profileId}`, { is_default: true }),
  ])
}
