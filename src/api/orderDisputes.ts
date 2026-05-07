import { apiGet, apiPost, type ApiRequestBody } from './openapiClient'

export function createOrderDispute(
  orderId: string,
  payload: ApiRequestBody<'/api/orders/{orderCode}/disputes', 'post'>,
) {
  return apiPost('/api/orders/{orderCode}/disputes', {
    body: payload,
    path: { orderCode: orderId },
  })
}

export function getOrderDispute(orderId: string) {
  return apiGet('/api/orders/{orderCode}/dispute', {
    path: { orderCode: orderId },
  })
}

export function getBackofficeDisputes() {
  return apiGet('/api/backoffice/disputes')
}

export function takeOrderDisputeInWork(disputeId: string) {
  return apiPost('/api/order-disputes/{disputeCode}/take', {
    path: { disputeCode: disputeId },
  })
}

export function resolveOrderDisputeCancel(disputeId: string) {
  return apiPost('/api/order-disputes/{disputeCode}/resolve-cancel', {
    path: { disputeCode: disputeId },
  })
}

export function resolveOrderDisputeComplete(disputeId: string) {
  return apiPost('/api/order-disputes/{disputeCode}/resolve-complete', {
    path: { disputeCode: disputeId },
  })
}

export function resolveOrderDisputeAmendQuantityAndComplete(
  disputeId: string,
  quantity: number,
) {
  return apiPost('/api/order-disputes/{disputeCode}/resolve-amend-quantity-and-complete', {
    body: { quantity },
    path: { disputeCode: disputeId },
  })
}
