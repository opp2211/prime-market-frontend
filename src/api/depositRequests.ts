import { toArray, toNonNegativeNumberParam, toPositiveNumberParam, type MaybeArray } from './apiParams'
import { apiGet, apiPost, type ApiQuery, type ApiRequestBody } from './openapiClient'

type DepositRequestListParams = {
  status?: MaybeArray<string> | null
  page?: number | string | null
  size?: number | string | null
  sort?: MaybeArray<string> | null
}

function toDepositRequestListQuery(params: DepositRequestListParams = {}) {
  return {
    status: toArray(params.status),
    page: toNonNegativeNumberParam(params.page),
    size: toPositiveNumberParam(params.size),
    sort: toArray(params.sort),
  } as ApiQuery<'/api/deposit-requests', 'get'>
}

export function createDepositRequest(payload: ApiRequestBody<'/api/deposit-requests', 'post'>) {
  return apiPost('/api/deposit-requests', { body: payload })
}

export function getDepositRequests(params?: DepositRequestListParams) {
  return apiGet('/api/deposit-requests', {
    params: toDepositRequestListQuery(params),
  })
}

export function getDepositRequest(requestCode: string) {
  return apiGet('/api/deposit-requests/{requestCode}', {
    path: { requestCode },
  })
}

export function markDepositRequestPaid(requestCode: string) {
  return apiPost('/api/deposit-requests/{requestCode}/mark-paid', {
    path: { requestCode },
  })
}

export function cancelDepositRequest(requestCode: string) {
  return apiPost('/api/deposit-requests/{requestCode}/cancel', {
    path: { requestCode },
  })
}
