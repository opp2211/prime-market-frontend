import {
  getMethodIdentityPayload,
  getProfileIdentityPayload,
  normalizeCurrencyCode,
} from '../../shared/lib/money'
import { buildRequisitesPayload } from './moneyFields'

export function matchesMethodAndCurrency(profile, method, currencyCode) {
  if (!profile) return false

  const normalizedCurrency = normalizeCurrencyCode(currencyCode)
  const profileCurrency = normalizeCurrencyCode(profile.currencyCode)
  const profileMethod = normalizeCurrencyCode(profile.methodCode)
  const methodCode = normalizeCurrencyCode(method?.code)

  return profileCurrency === normalizedCurrency && profileMethod === methodCode
}

export function getPreferredProfile(profiles, method, currencyCode) {
  const matchingProfiles = profiles.filter((profile) =>
    matchesMethodAndCurrency(profile, method, currencyCode)
  )

  if (matchingProfiles.length === 0) return null
  return matchingProfiles.find((profile) => profile.isDefault) || matchingProfiles[0]
}

export function buildWithdrawalCreatePayload({
  method,
  profile,
  mode,
  amount,
  values,
  saveProfile,
  profileLabel,
  copy,
}) {
  const payload = {
    ...getMethodIdentityPayload(method),
    amount,
  }

  if (mode === 'saved' && profile) {
    return {
      ...payload,
      ...getProfileIdentityPayload(profile),
    }
  }

  return {
    ...payload,
    requisites: buildRequisitesPayload(method, values, copy),
    ...(saveProfile
      ? {
          save_payout_profile: true,
          payout_profile_label: profileLabel,
        }
      : {}),
  }
}

export function buildPayoutProfilePayload({
  method,
  currencyCode,
  label,
  values,
  isDefault,
  copy,
}) {
  return {
    ...getMethodIdentityPayload(method),
    currency_code: currencyCode,
    label,
    requisites: buildRequisitesPayload(method, values, copy),
    is_default: Boolean(isDefault),
  }
}
