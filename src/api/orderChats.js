import { http } from './http'

export function getOrderConversations(orderId) {
  return http.get(`/orders/${orderId}/conversations`)
}

export function getOrderConversationMessages(conversationId) {
  return http.get(`/order-conversations/${conversationId}/messages`)
}

export function sendOrderConversationMessage(conversationId, body) {
  return http.post(`/order-conversations/${conversationId}/messages`, {
    body,
  })
}
