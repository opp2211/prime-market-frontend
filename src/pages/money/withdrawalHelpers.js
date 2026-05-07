import {
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
  currencyCode,
  mode,
  amount,
  values,
  saveProfile,
  profileLabel,
  copy,
}) {
  const payload = {
    amount,
    currency_code: normalizeCurrencyCode(currencyCode),
    ...(method?.id != null ? { withdrawal_method_id: method.id } : {}),
  }

  if (mode === 'saved' && profile) {
    return {
      ...payload,
      ...(profile?.id != null ? { payout_profile_id: profile.id } : {}),
    }
  }

  return {
    ...payload,
    requisites: buildRequisitesPayload(method, values, copy),
    ...(saveProfile
      ? {
          save_payout_profile: true,
          payout_profile_title: profileLabel,
        }
      : {}),
  }
}

export function buildCreatePayoutProfilePayload({
  method,
  label,
  values,
  isDefault,
  copy,
}) {
  return {
    ...(method?.id != null ? { withdrawal_method_id: method.id } : {}),
    title: label,
    requisites: buildRequisitesPayload(method, values, copy),
    is_default: Boolean(isDefault),
  }
}

export function buildUpdatePayoutProfilePayload({
  method,
  label,
  values,
  copy,
}) {
  return {
    title: label,
    requisites: buildRequisitesPayload(method, values, copy),
  }
}
