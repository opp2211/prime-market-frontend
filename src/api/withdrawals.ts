import { toArray, toNonNegativeNumberParam, toPositiveNumberParam, type MaybeArray } from './apiParams'
import { apiGet, apiPost, type ApiQuery, type ApiRequestBody } from './openapiClient'

type WithdrawalListParams = {
  status?: MaybeArray<string> | null
  page?: number | string | null
  size?: number | string | null
  sort?: MaybeArray<string> | null
}

function toWithdrawalListQuery(params: WithdrawalListParams = {}) {
  return {
    status: toArray(params.status),
    page: toNonNegativeNumberParam(params.page),
    size: toPositiveNumberParam(params.size),
    sort: toArray(params.sort),
  } as ApiQuery<'/api/withdrawal-requests', 'get'>
}

export function getWithdrawalMethods(currencyCode: string) {
  return apiGet('/api/withdrawal-methods', {
    params: { currency_code: currencyCode },
  })
}

export function createWithdrawalRequest(payload: ApiRequestBody<'/api/withdrawal-requests', 'post'>) {
  return apiPost('/api/withdrawal-requests', { body: payload })
}

export function getWithdrawalRequests(params?: WithdrawalListParams) {
  return apiGet('/api/withdrawal-requests', {
    params: toWithdrawalListQuery(params),
  })
}

export function getWithdrawalRequest(requestCode: string) {
  return apiGet('/api/withdrawal-requests/{requestCode}', {
    path: { requestCode },
  })
}

export function cancelWithdrawalRequest(requestCode: string) {
  return apiPost('/api/withdrawal-requests/{requestCode}/cancel', {
    path: { requestCode },
  })
}
