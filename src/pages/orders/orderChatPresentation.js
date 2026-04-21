import { formatOrderDateTime } from './orderPresentation'

const ORDER_CHAT_COPY = {
  ru: {
    title: '\u0427\u0430\u0442',
    description:
      '\u041e\u0431\u0441\u0443\u0436\u0434\u0430\u0439\u0442\u0435 \u0434\u0435\u0442\u0430\u043b\u0438 \u0441\u0434\u0435\u043b\u043a\u0438 \u0438 \u043f\u0438\u0448\u0438\u0442\u0435 \u0432 \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0443 \u043f\u043e \u044d\u0442\u043e\u043c\u0443 \u0437\u0430\u043a\u0430\u0437\u0443.',
    conversationsAria:
      '\u0427\u0430\u0442\u044b \u043f\u043e \u0437\u0430\u043a\u0430\u0437\u0443',
    loadingConversations:
      '\u0417\u0430\u0433\u0440\u0443\u0436\u0430\u0435\u043c \u0447\u0430\u0442\u044b',
    loadingMessages:
      '\u0417\u0430\u0433\u0440\u0443\u0436\u0430\u0435\u043c \u0441\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u044f',
    refreshingMessages:
      '\u041e\u0431\u043d\u043e\u0432\u043b\u044f\u0435\u043c \u0447\u0430\u0442',
    retry: '\u041f\u043e\u0432\u0442\u043e\u0440\u0438\u0442\u044c',
    unavailableTitle:
      '\u0427\u0430\u0442\u044b \u043f\u043e\u043a\u0430 \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u043d\u044b',
    unavailableText:
      '\u041a\u043e\u0433\u0434\u0430 backend \u0432\u0435\u0440\u043d\u0435\u0442 \u0447\u0430\u0442\u044b \u043f\u043e \u044d\u0442\u043e\u043c\u0443 \u0437\u0430\u043a\u0430\u0437\u0443, \u043e\u043d\u0438 \u043f\u043e\u044f\u0432\u044f\u0442\u0441\u044f \u0437\u0434\u0435\u0441\u044c.',
    conversations: {
      main: '\u041e\u0431\u0449\u0438\u0439 \u0447\u0430\u0442',
      support:
        '\u0427\u0430\u0442 \u0441 \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u043e\u0439',
      fallback: '\u0427\u0430\u0442',
    },
    panel: {
      main: '\u041e\u0431\u0449\u0438\u0439 \u0447\u0430\u0442 \u043f\u043e \u0441\u0434\u0435\u043b\u043a\u0435',
      support:
        '\u041f\u0440\u0438\u0432\u0430\u0442\u043d\u044b\u0439 \u0447\u0430\u0442 \u0441 \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u043e\u0439 \u043f\u043e \u044d\u0442\u043e\u0439 \u0441\u0434\u0435\u043b\u043a\u0435',
      fallback: '\u041f\u0435\u0440\u0435\u043f\u0438\u0441\u043a\u0430 \u043f\u043e \u044d\u0442\u043e\u0439 \u0441\u0434\u0435\u043b\u043a\u0435',
    },
    empty: {
      main:
        '\u0421\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0439 \u043f\u043e\u043a\u0430 \u043d\u0435\u0442. \u041e\u0431\u0441\u0443\u0434\u0438\u0442\u0435 \u0434\u0435\u0442\u0430\u043b\u0438 \u0441\u0434\u0435\u043b\u043a\u0438 \u0437\u0434\u0435\u0441\u044c.',
      support:
        '\u0421\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0439 \u0432 \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0443 \u043f\u043e\u043a\u0430 \u043d\u0435\u0442. \u041d\u0430\u043f\u0438\u0448\u0438\u0442\u0435, \u0435\u0441\u043b\u0438 \u043d\u0443\u0436\u043d\u0430 \u043f\u043e\u043c\u043e\u0449\u044c \u043f\u043e \u044d\u0442\u043e\u0439 \u0441\u0434\u0435\u043b\u043a\u0435.',
      fallback:
        '\u0421\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0439 \u043f\u043e\u043a\u0430 \u043d\u0435\u0442.',
    },
    roles: {
      buyer: '\u041f\u043e\u043a\u0443\u043f\u0430\u0442\u0435\u043b\u044c',
      seller: '\u041f\u0440\u043e\u0434\u0430\u0432\u0435\u0446',
      support: '\u041f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0430',
      system: '\u0421\u0438\u0441\u0442\u0435\u043c\u0430',
      unknown: '\u0423\u0447\u0430\u0441\u0442\u043d\u0438\u043a',
    },
    me: '\u0412\u044b',
    composer: {
      label: '\u0421\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0435',
      placeholder:
        '\u041d\u0430\u043f\u0438\u0448\u0438\u0442\u0435 \u0441\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0435...',
      send: '\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c',
      sending: '\u041e\u0442\u043f\u0440\u0430\u0432\u043b\u044f\u0435\u043c...',
      hint: 'Enter \u0434\u043e\u0431\u0430\u0432\u0438\u0442 \u043d\u043e\u0432\u0443\u044e \u0441\u0442\u0440\u043e\u043a\u0443.',
    },
    errors: {
      conversations:
        '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u0447\u0430\u0442\u044b \u0441\u0434\u0435\u043b\u043a\u0438.',
      messages:
        '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u0441\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u044f.',
      send:
        '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u043e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c \u0441\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0435.',
      emptyBody:
        '\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043d\u0435\u043f\u0443\u0441\u0442\u043e\u0435 \u0441\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0435.',
    },
  },
  en: {
    title: 'Chat',
    description:
      'Discuss order details and contact support for this order.',
    conversationsAria: 'Order chats',
    loadingConversations: 'Loading chats',
    loadingMessages: 'Loading messages',
    refreshingMessages: 'Refreshing chat',
    retry: 'Retry',
    unavailableTitle: 'Chats are not available yet',
    unavailableText:
      'When the backend returns conversations for this order, they will appear here.',
    conversations: {
      main: 'General chat',
      support: 'Support chat',
      fallback: 'Chat',
    },
    panel: {
      main: 'Main order chat',
      support: 'Private support chat for this order',
      fallback: 'Conversation for this order',
    },
    empty: {
      main: 'No messages yet. Discuss deal details here.',
      support:
        'No support messages yet. Write here if you need help with this order.',
      fallback: 'No messages yet.',
    },
    roles: {
      buyer: 'Buyer',
      seller: 'Seller',
      support: 'Support',
      system: 'System',
      unknown: 'Participant',
    },
    me: 'You',
    composer: {
      label: 'Message',
      placeholder: 'Write a message...',
      send: 'Send',
      sending: 'Sending...',
      hint: 'Enter adds a new line.',
    },
    errors: {
      conversations: "Couldn't load order chats.",
      messages: "Couldn't load messages.",
      send: "Couldn't send the message.",
      emptyBody: 'Enter a non-empty message.',
    },
  },
}

function normalizeValue(value) {
  return (value || '').toString().trim().toLowerCase()
}

export function getOrderChatCopy(language = 'ru') {
  return ORDER_CHAT_COPY[language] || ORDER_CHAT_COPY.ru
}

export function getOrderConversationId(conversation) {
  return conversation?.publicId || conversation?.public_id || conversation?.id || ''
}

export function getOrderConversationType(conversation) {
  return normalizeValue(conversation?.conversationType || conversation?.conversation_type)
}

export function isOrderMainConversation(conversation) {
  return getOrderConversationType(conversation) === 'order_main'
}

export function isOrderSupportConversation(conversation) {
  const type = getOrderConversationType(conversation)
  return type === 'order_support_buyer' || type === 'order_support_seller'
}

export function getDefaultOrderConversationId(conversations, currentId = '') {
  const validConversations = Array.isArray(conversations) ? conversations : []

  if (
    currentId &&
    validConversations.some(
      (conversation) => getOrderConversationId(conversation) === currentId
    )
  ) {
    return currentId
  }

  const mainConversation = validConversations.find(isOrderMainConversation)
  return (
    getOrderConversationId(mainConversation) ||
    getOrderConversationId(validConversations[0]) ||
    ''
  )
}

export function getOrderConversationLabel(conversation, copy) {
  if (isOrderMainConversation(conversation)) return copy.conversations.main
  if (isOrderSupportConversation(conversation)) return copy.conversations.support
  return conversation?.title || copy.conversations.fallback
}

export function getOrderConversationDescription(conversation, copy) {
  if (isOrderMainConversation(conversation)) return copy.panel.main
  if (isOrderSupportConversation(conversation)) return copy.panel.support
  return copy.panel.fallback
}

export function getOrderConversationEmptyText(conversation, copy) {
  if (isOrderMainConversation(conversation)) return copy.empty.main
  if (isOrderSupportConversation(conversation)) return copy.empty.support
  return copy.empty.fallback
}

export function getOrderMessageId(message, index) {
  return (
    message?.publicId ||
    message?.public_id ||
    message?.id ||
    `${message?.createdAt || message?.created_at || 'message'}-${index}`
  )
}

export function getOrderMessageTimestamp(message, language = 'ru') {
  return formatOrderDateTime(message?.createdAt || message?.created_at, language)
}

export function getOrderMessageDateTime(message) {
  return message?.createdAt || message?.created_at || ''
}

function normalizeRole(role) {
  const normalized = normalizeValue(role)
  if (
    normalized === 'support' ||
    normalized === 'operator' ||
    normalized === 'support_operator'
  ) {
    return 'support'
  }
  return normalized
}

function getUserSource(user) {
  if (!user || typeof user !== 'object') return null
  return user.user && typeof user.user === 'object' ? user.user : user
}

function getUserId(value) {
  const source = getUserSource(value)
  return source?.userId ?? source?.user_id ?? source?.id ?? ''
}

function getUserName(value) {
  const source = getUserSource(value)
  return source?.username || source?.login || ''
}

export function isOwnOrderMessage(message, { order, user }) {
  const sender = message?.sender
  if (!sender || typeof sender !== 'object') return false

  const currentUserId = getUserId(user)
  const senderUserId = getUserId(sender)
  if (currentUserId !== '' && senderUserId !== '') {
    return String(currentUserId) === String(senderUserId)
  }

  const currentUserName = normalizeValue(getUserName(user))
  const senderUserName = normalizeValue(getUserName(sender))
  if (currentUserName && senderUserName) {
    return currentUserName === senderUserName
  }

  const currentRole = normalizeRole(order?.myRole)
  const senderRole = normalizeRole(sender?.role)
  return Boolean(currentRole && senderRole && currentRole === senderRole)
}

export function getOrderMessageRoleLabel(role, copy) {
  const normalized = normalizeRole(role)
  return copy.roles[normalized] || copy.roles.unknown
}

export function mapOrderMessageToDisplay(message, options) {
  const { copy, language, order, user } = options
  const sender = message?.sender
  const messageType = normalizeValue(message?.messageType || message?.message_type)
  const role = normalizeRole(sender?.role)
  const isSystem = messageType === 'system' || !sender
  const isOwn = !isSystem && isOwnOrderMessage(message, { order, user })
  const isSupport = !isSystem && role === 'support'
  const senderName = isOwn ? copy.me : getUserName(sender)
  const senderRoleLabel = isSystem
    ? copy.roles.system
    : getOrderMessageRoleLabel(sender?.role, copy)

  return {
    body: message?.body || '',
    dateTime: getOrderMessageDateTime(message),
    isOwn,
    isSupport,
    isSystem,
    senderLabel: senderName || senderRoleLabel,
    senderRoleLabel,
    timestamp: getOrderMessageTimestamp(message, language),
  }
}
