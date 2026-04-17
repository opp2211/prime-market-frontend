import { useEffect, useMemo, useState } from 'react'
import {
  getOrderConversationMessages,
  getOrderConversations,
  sendOrderConversationMessage,
} from '../../api/orderChats'
import { useUser } from '../../app/user'
import { getErrorMessage } from '../../shared/lib/errors'
import Button from '../../shared/ui/Button'
import OrderChatComposer from './OrderChatComposer'
import OrderChatMessages from './OrderChatMessages'
import OrderChatTabs from './OrderChatTabs'
import {
  getDefaultOrderConversationId,
  getOrderChatCopy,
  getOrderConversationDescription,
  getOrderConversationId,
  getOrderConversationLabel,
  isOrderMainConversation,
  isOrderSupportConversation,
} from './orderChatPresentation'

function OrderChatShellSkeleton({ copy }) {
  return (
    <div className="order-chat">
      <div className="order-chat-tabs" aria-hidden="true">
        <div className="skeleton order-skeleton order-skeleton--chat-tab" />
        <div className="skeleton order-skeleton order-skeleton--chat-tab" />
      </div>
      <div className="order-chat-panel">
        <div className="order-chat-panel__head">
          <div>
            <div className="skeleton order-skeleton order-skeleton--section-title" />
            <div className="skeleton order-skeleton order-skeleton--chat-panel-text" />
          </div>
        </div>
        <div className="order-chat-messages">
          <div className="order-chat-state">
            <div className="order-chat-state__title">{copy.loadingConversations}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function OrderChatState({ title, text, tone = 'default', actionLabel, onAction }) {
  return (
    <div
      className={`order-chat-state${
        tone === 'error' ? ' order-chat-state--error' : ''
      }`}
    >
      {title ? <div className="order-chat-state__title">{title}</div> : null}
      {text ? <div className="order-chat-state__text">{text}</div> : null}
      {actionLabel && onAction ? (
        <div className="order-chat-state__actions">
          <Button type="button" variant="secondary" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </div>
  )
}

function filterConversationsByKind(conversations, conversationKind) {
  const items = Array.isArray(conversations) ? conversations : []

  if (conversationKind === 'main') {
    return items.filter(isOrderMainConversation)
  }

  if (conversationKind === 'support') {
    return items.filter(isOrderSupportConversation)
  }

  return items
}

function buildConversationAvailability(conversations, status = 'ready') {
  const items = Array.isArray(conversations) ? conversations : []

  return {
    hasAnyConversation: items.length > 0,
    hasMainConversation: items.some(isOrderMainConversation),
    hasSupportConversation: items.some(isOrderSupportConversation),
    status,
  }
}

export default function OrderChatsSection({
  orderId,
  order,
  language,
  conversationKind = 'all',
  embedded = false,
  onAvailabilityChange,
}) {
  const { user } = useUser()
  const copy = useMemo(() => getOrderChatCopy(language), [language])
  const [conversations, setConversations] = useState([])
  const [conversationsStatus, setConversationsStatus] = useState('loading')
  const [conversationsError, setConversationsError] = useState('')
  const [conversationsReloadKey, setConversationsReloadKey] = useState(0)
  const [selectedConversationId, setSelectedConversationId] = useState('')
  const [messages, setMessages] = useState([])
  const [messagesStatus, setMessagesStatus] = useState('idle')
  const [messagesError, setMessagesError] = useState('')
  const [messagesReloadKey, setMessagesReloadKey] = useState(0)
  const [sendStatus, setSendStatus] = useState('idle')
  const [sendError, setSendError] = useState('')

  useEffect(() => {
    setConversations([])
    setConversationsStatus('loading')
    setConversationsError('')
    setSelectedConversationId('')
    setMessages([])
    setMessagesStatus('idle')
    setMessagesError('')
    setSendStatus('idle')
    setSendError('')
  }, [conversationKind, orderId])

  useEffect(() => {
    let active = true

    const loadConversations = async () => {
      if (!orderId) {
        setConversations([])
        setSelectedConversationId('')
        setConversationsStatus('error')
        setConversationsError(copy.errors.conversations)
        return
      }

      setConversationsStatus((current) =>
        current === 'ready' || current === 'refreshing' ? 'refreshing' : 'loading'
      )
      setConversationsError('')

      try {
        const response = await getOrderConversations(orderId)
        if (!active) return

        const allItems = Array.isArray(response?.data?.items)
          ? response.data.items.filter((conversation) =>
              Boolean(getOrderConversationId(conversation))
            )
          : []
        const items = filterConversationsByKind(allItems, conversationKind)

        setConversations(items)
        setSelectedConversationId((currentId) =>
          getDefaultOrderConversationId(items, currentId)
        )
        setConversationsStatus('ready')
        onAvailabilityChange?.(buildConversationAvailability(allItems, 'ready'))
      } catch (err) {
        if (!active) return
        setConversationsError(getErrorMessage(err, copy.errors.conversations))
        setConversationsStatus((current) =>
          current === 'ready' || current === 'refreshing' ? 'ready' : 'error'
        )
        onAvailabilityChange?.(buildConversationAvailability([], 'error'))
      }
    }

    loadConversations()

    return () => {
      active = false
    }
  }, [
    conversationKind,
    copy.errors.conversations,
    conversationsReloadKey,
    onAvailabilityChange,
    orderId,
  ])

  useEffect(() => {
    let active = true

    const loadMessages = async () => {
      if (!selectedConversationId) {
        setMessages([])
        setMessagesStatus('idle')
        setMessagesError('')
        return
      }

      setMessagesStatus((current) =>
        current === 'ready' || current === 'refreshing' ? 'refreshing' : 'loading'
      )
      setMessagesError('')

      try {
        const response = await getOrderConversationMessages(selectedConversationId)
        if (!active) return

        const items = Array.isArray(response?.data?.items) ? response.data.items : []
        setMessages(items)
        setMessagesStatus('ready')
      } catch (err) {
        if (!active) return
        setMessagesError(getErrorMessage(err, copy.errors.messages))
        setMessagesStatus((current) =>
          current === 'ready' || current === 'refreshing' ? 'ready' : 'error'
        )
      }
    }

    loadMessages()

    return () => {
      active = false
    }
  }, [copy.errors.messages, selectedConversationId, messagesReloadKey])

  const selectedConversation = useMemo(
    () =>
      conversations.find(
        (conversation) => getOrderConversationId(conversation) === selectedConversationId
      ) || null,
    [conversations, selectedConversationId]
  )

  const isConversationsInitialLoading =
    conversationsStatus === 'loading' && conversations.length === 0
  const isMessagesRefreshing = messagesStatus === 'refreshing'
  const isSending = sendStatus === 'sending'

  function handleSelectConversation(conversationId) {
    if (!conversationId || conversationId === selectedConversationId) return
    setSelectedConversationId(conversationId)
    setMessages([])
    setMessagesStatus('loading')
    setMessagesError('')
    setSendError('')
  }

  async function handleSendMessage(rawBody) {
    if (isSending || !selectedConversationId) return false

    const body = rawBody.trim()
    if (!body) {
      setSendError(copy.errors.emptyBody)
      return false
    }

    setSendStatus('sending')
    setSendError('')

    try {
      await sendOrderConversationMessage(selectedConversationId, body)
      setMessagesReloadKey((value) => value + 1)
      return true
    } catch (err) {
      setSendError(getErrorMessage(err, copy.errors.send))
      return false
    } finally {
      setSendStatus('idle')
    }
  }

  const rootClassName = [
    embedded ? 'order-chat-section order-chat-section--embedded' : 'card order-section order-chat-section',
    conversationKind === 'support' ? 'order-chat-section--support' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <section className={rootClassName}>
      <div className="order-section__head">
        <h2 className="order-section__title">{copy.title}</h2>
        <p className="order-section__description">{copy.description}</p>
      </div>

      <div className="order-section__body">
        {conversationsError && conversations.length > 0 ? (
          <div className="error">{conversationsError}</div>
        ) : null}

        {isConversationsInitialLoading ? <OrderChatShellSkeleton copy={copy} /> : null}

        {!isConversationsInitialLoading &&
        conversationsError &&
        conversations.length === 0 ? (
          <OrderChatState
            title={conversationsError}
            tone="error"
            actionLabel={copy.retry}
            onAction={() => setConversationsReloadKey((value) => value + 1)}
          />
        ) : null}

        {!isConversationsInitialLoading &&
        !conversationsError &&
        conversations.length === 0 ? (
          <OrderChatState title={copy.unavailableTitle} text={copy.unavailableText} />
        ) : null}

        {!isConversationsInitialLoading && conversations.length > 0 ? (
          <div className="order-chat">
            <OrderChatTabs
              conversations={conversations}
              selectedConversationId={selectedConversationId}
              copy={copy}
              onSelect={handleSelectConversation}
            />

            {selectedConversation ? (
              <div
                className={`order-chat-panel${
                  isOrderSupportConversation(selectedConversation)
                    ? ' order-chat-panel--support'
                    : ''
                }`}
              >
                <div className="order-chat-panel__head">
                  <div className="order-chat-panel__title-block">
                    <h3 className="order-chat-panel__title">
                      {getOrderConversationLabel(selectedConversation, copy)}
                    </h3>
                    <p className="order-chat-panel__description">
                      {getOrderConversationDescription(selectedConversation, copy)}
                    </p>
                  </div>
                  {isMessagesRefreshing ? (
                    <span className="order-refresh-badge">
                      {copy.refreshingMessages}
                    </span>
                  ) : null}
                </div>

                <OrderChatMessages
                  conversation={selectedConversation}
                  messages={messages}
                  status={messagesStatus}
                  error={messagesError}
                  copy={copy}
                  language={language}
                  order={order}
                  user={user}
                  onRetry={() => setMessagesReloadKey((value) => value + 1)}
                />

                <OrderChatComposer
                  key={selectedConversationId}
                  copy={copy}
                  disabled={!selectedConversationId}
                  isSending={isSending}
                  error={sendError}
                  onSend={handleSendMessage}
                  onClearError={() => setSendError('')}
                />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  )
}
