import { toNumericId } from './apiParams'
import { apiGet, apiPost } from './openapiClient'

export function getOrderConversations(orderId: string) {
  return apiGet('/api/orders/{orderCode}/conversations', {
    path: { orderCode: orderId },
  })
}

export function getOrderConversationMessages(conversationId: string | number) {
  return apiGet('/api/order-conversations/{conversationId}/messages', {
    path: { conversationId: toNumericId(conversationId) },
  })
}

export function sendOrderConversationMessage(conversationId: string | number, body: string) {
  return apiPost('/api/order-conversations/{conversationId}/messages', {
    body: { body },
    path: { conversationId: toNumericId(conversationId) },
  })
}
