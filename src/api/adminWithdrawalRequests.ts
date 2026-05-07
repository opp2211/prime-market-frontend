import { toArray, toNonNegativeNumberParam, toPositiveNumberParam, type MaybeArray } from './apiParams'
import { apiGet, apiPost, type ApiQuery, type ApiRequestBody } from './openapiClient'

type AdminWithdrawalListParams = {
  status?: MaybeArray<string> | null
  page?: number | string | null
  size?: number | string | null
  sort?: MaybeArray<string> | null
}

function toAdminWithdrawalListQuery(params: AdminWithdrawalListParams = {}) {
  return {
    status: toArray(params.status),
    page: toNonNegativeNumberParam(params.page),
    size: toPositiveNumberParam(params.size),
    sort: toArray(params.sort),
  } as ApiQuery<'/api/backoffice/withdrawal-requests', 'get'>
}

export function getAdminWithdrawalRequests(params?: AdminWithdrawalListParams) {
  return apiGet('/api/backoffice/withdrawal-requests', {
    params: toAdminWithdrawalListQuery(params),
  })
}

export function getAdminWithdrawalRequest(requestCode: string) {
  return apiGet('/api/backoffice/withdrawal-requests/{requestCode}', {
    path: { requestCode },
  })
}

export function takeAdminWithdrawalRequest(requestCode: string) {
  return apiPost('/api/backoffice/withdrawal-requests/{requestCode}/take', {
    path: { requestCode },
  })
}

export function rejectAdminWithdrawalRequest(
  requestCode: string,
  payload: ApiRequestBody<'/api/backoffice/withdrawal-requests/{requestCode}/reject', 'post'>,
) {
  return apiPost('/api/backoffice/withdrawal-requests/{requestCode}/reject', {
    body: payload,
    path: { requestCode },
  })
}

export function confirmAdminWithdrawalRequest(
  requestCode: string,
  payload: ApiRequestBody<'/api/backoffice/withdrawal-requests/{requestCode}/confirm', 'post'>,
) {
  return apiPost('/api/backoffice/withdrawal-requests/{requestCode}/confirm', {
    body: payload,
    path: { requestCode },
  })
}

export function planAdminWithdrawalPayout(
  requestCode: string,
  payload: ApiRequestBody<
    '/api/backoffice/withdrawal-requests/{requestCode}/payout-plan',
    'post'
  >,
) {
  return apiPost('/api/backoffice/withdrawal-requests/{requestCode}/payout-plan', {
    body: payload,
    path: { requestCode },
  })
}
