import { toArray, toNonNegativeNumberParam, toPositiveNumberParam, type MaybeArray } from './apiParams'
import { apiGet, apiPost, type ApiQuery, type ApiRequestBody } from './openapiClient'

type AdminDepositListParams = {
  status?: MaybeArray<string> | null
  statuses?: string[] | null
  page?: number | string | null
  size?: number | string | null
  sort?: MaybeArray<string> | null
}

function toAdminDepositListQuery(params: AdminDepositListParams = {}) {
  return {
    status: toArray(params.statuses ?? params.status),
    page: toNonNegativeNumberParam(params.page),
    size: toPositiveNumberParam(params.size),
    sort: toArray(params.sort),
  } as ApiQuery<'/api/backoffice/deposit-requests', 'get'>
}

export function getAdminDepositRequests(params?: AdminDepositListParams) {
  return apiGet('/api/backoffice/deposit-requests', {
    params: toAdminDepositListQuery(params),
  })
}

export function getAdminDepositRequest(requestCode: string) {
  return apiGet('/api/backoffice/deposit-requests/{requestCode}', {
    path: { requestCode },
  })
}

export function rejectAdminDepositRequest(
  requestCode: string,
  payload: ApiRequestBody<'/api/backoffice/deposit-requests/{requestCode}/reject', 'post'>,
) {
  return apiPost('/api/backoffice/deposit-requests/{requestCode}/reject', {
    body: payload,
    path: { requestCode },
  })
}

export function issueAdminDepositDetails(
  requestCode: string,
  payload: ApiRequestBody<'/api/backoffice/deposit-requests/{requestCode}/issue-details', 'post'>,
) {
  return apiPost('/api/backoffice/deposit-requests/{requestCode}/issue-details', {
    body: payload,
    path: { requestCode },
  })
}

export function confirmAdminDepositRequest(
  requestCode: string,
  payload: ApiRequestBody<'/api/backoffice/deposit-requests/{requestCode}/confirm', 'post'>,
) {
  return apiPost('/api/backoffice/deposit-requests/{requestCode}/confirm', {
    body: payload,
    path: { requestCode },
  })
}
