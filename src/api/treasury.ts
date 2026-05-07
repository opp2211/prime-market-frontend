import {
  toNonNegativeNumberParam,
  toNumericId,
  toPositiveNumberParam,
  type PagingParams,
} from './apiParams'
import { apiGet, apiPatch, apiPost, type ApiQuery, type ApiRequestBody } from './openapiClient'

type TreasuryListParams = PagingParams & {
  activeOnly?: boolean | null
  accountId?: string | number | null
  depositMethodId?: string | number | null
}

function toTreasuryAccountsQuery(params: TreasuryListParams = {}) {
  return {
    active_only: params.activeOnly ?? undefined,
    page: toNonNegativeNumberParam(params.page),
    size: toPositiveNumberParam(params.size),
    sort: params.sort,
  } as ApiQuery<'/api/backoffice/treasury/accounts', 'get'>
}

function toTreasuryTransactionsQuery(params: TreasuryListParams = {}) {
  return {
    account_id: params.accountId,
    page: toNonNegativeNumberParam(params.page),
    size: toPositiveNumberParam(params.size),
    sort: params.sort,
  } as ApiQuery<'/api/backoffice/treasury/transactions', 'get'>
}

function toPlatformTransactionsQuery(params: TreasuryListParams = {}) {
  return {
    page: toNonNegativeNumberParam(params.page),
    size: toPositiveNumberParam(params.size),
    sort: params.sort,
  } as ApiQuery<'/api/backoffice/platform-accounts/transactions', 'get'>
}

function toDepositPaymentRoutesQuery(params: TreasuryListParams = {}) {
  return {
    deposit_method_id: params.depositMethodId,
    page: toNonNegativeNumberParam(params.page),
    size: toPositiveNumberParam(params.size),
    sort: params.sort,
  } as ApiQuery<'/api/backoffice/deposit-payment-routes', 'get'>
}

export function getTreasuryAccounts(params?: TreasuryListParams) {
  return apiGet('/api/backoffice/treasury/accounts', {
    params: toTreasuryAccountsQuery(params),
  })
}

export function createTreasuryAccount(
  payload: ApiRequestBody<'/api/backoffice/treasury/accounts', 'post'>,
) {
  return apiPost('/api/backoffice/treasury/accounts', { body: payload })
}

export function updateTreasuryAccount(
  id: string | number,
  payload: ApiRequestBody<'/api/backoffice/treasury/accounts/{id}', 'patch'>,
) {
  return apiPatch('/api/backoffice/treasury/accounts/{id}', {
    body: payload,
    path: { id: toNumericId(id) },
  })
}

export function getTreasuryTransactions(params?: TreasuryListParams) {
  return apiGet('/api/backoffice/treasury/transactions', {
    params: toTreasuryTransactionsQuery(params),
  })
}

export function createTreasuryTransaction(
  payload: ApiRequestBody<'/api/backoffice/treasury/transactions', 'post'>,
) {
  return apiPost('/api/backoffice/treasury/transactions', { body: payload })
}

export function createTreasuryTransfer(
  payload: ApiRequestBody<'/api/backoffice/treasury/transfers', 'post'>,
) {
  return apiPost('/api/backoffice/treasury/transfers', { body: payload })
}

export function getTreasuryExposure() {
  return apiGet('/api/backoffice/treasury/exposure')
}

export function getPlatformAccounts() {
  return apiGet('/api/backoffice/platform-accounts')
}

export function getPlatformAccountTransactions(params?: TreasuryListParams) {
  return apiGet('/api/backoffice/platform-accounts/transactions', {
    params: toPlatformTransactionsQuery(params),
  })
}

export function createPlatformAccountAdjustment(
  payload: ApiRequestBody<'/api/backoffice/platform-accounts/transactions', 'post'>,
) {
  return apiPost('/api/backoffice/platform-accounts/transactions', { body: payload })
}

export function getBackofficeDepositMethods() {
  return apiGet('/api/backoffice/deposit-methods')
}

export function getDepositPaymentRoutes(params?: TreasuryListParams) {
  return apiGet('/api/backoffice/deposit-payment-routes', {
    params: toDepositPaymentRoutesQuery(params),
  })
}

export function createDepositPaymentRoute(
  payload: ApiRequestBody<'/api/backoffice/deposit-payment-routes', 'post'>,
) {
  return apiPost('/api/backoffice/deposit-payment-routes', { body: payload })
}

export function updateDepositPaymentRoute(
  id: string | number,
  payload: ApiRequestBody<'/api/backoffice/deposit-payment-routes/{id}', 'patch'>,
) {
  return apiPatch('/api/backoffice/deposit-payment-routes/{id}', {
    body: payload,
    path: { id: toNumericId(id) },
  })
}
