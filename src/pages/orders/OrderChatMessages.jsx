import { useEffect, useMemo, useRef } from 'react'
import {
  getOrderConversationEmptyText,
  getOrderMessageId,
  mapOrderMessageToDisplay,
} from './orderChatPresentation'
import Button from '../../shared/ui/Button'

function MessageSkeleton() {
  return (
    <div className="order-chat-skeleton" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className={`order-chat-skeleton__row${
            index % 2 === 1 ? ' order-chat-skeleton__row--mine' : ''
          }`}
        >
          <div className="skeleton order-skeleton order-skeleton--chat-meta" />
          <div className="skeleton order-skeleton order-skeleton--chat-bubble" />
        </div>
      ))}
    </div>
  )
}

function ChatState({ title, text, tone = 'default', actionLabel, onAction }) {
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

function OrderChatMessage({ display }) {
  if (display.isSystem) {
    return (
      <div className="order-chat-system-message">
        <div className="order-chat-system-message__body">{display.body}</div>
        <time className="order-chat-system-message__time" dateTime={display.dateTime}>
          {display.timestamp}
        </time>
      </div>
    )
  }

  const modifier = display.isOwn
    ? ' order-chat-message--mine'
    : display.isSupport
      ? ' order-chat-message--support'
      : ' order-chat-message--other'

  return (
    <article className={`order-chat-message${modifier}`}>
      <div className="order-chat-message__bubble">
        <div className="order-chat-message__meta">
          <span className="order-chat-message__sender">{display.senderLabel}</span>
          <span className="order-chat-message__role">{display.senderRoleLabel}</span>
          <time className="order-chat-message__time" dateTime={display.dateTime}>
            {display.timestamp}
          </time>
        </div>
        <div className="order-chat-message__body">{display.body}</div>
      </div>
    </article>
  )
}

export default function OrderChatMessages({
  conversation,
  messages,
  status,
  error,
  copy,
  language,
  order,
  user,
  onRetry,
}) {
  const endRef = useRef(null)
  const isInitialLoading = status === 'loading' && messages.length === 0
  const displayMessages = useMemo(
    () =>
      messages.map((message) =>
        mapOrderMessageToDisplay(message, {
          copy,
          language,
          order,
          user,
        })
      ),
    [copy, language, messages, order, user]
  )

  useEffect(() => {
    if (status === 'ready' && displayMessages.length > 0) {
      endRef.current?.scrollIntoView({ block: 'end' })
    }
  }, [displayMessages.length, status])

  if (isInitialLoading) {
    return (
      <div className="order-chat-messages">
        <MessageSkeleton />
      </div>
    )
  }

  if (error && messages.length === 0) {
    return (
      <div className="order-chat-messages">
        <ChatState
          title={error}
          tone="error"
          actionLabel={copy.retry}
          onAction={onRetry}
        />
      </div>
    )
  }

  if (!error && displayMessages.length === 0) {
    return (
      <div className="order-chat-messages">
        <ChatState text={getOrderConversationEmptyText(conversation, copy)} />
      </div>
    )
  }

  return (
    <div className="order-chat-messages">
      {error ? <div className="error">{error}</div> : null}
      <div className="order-chat-message-list">
        {displayMessages.map((display, index) => (
          <OrderChatMessage
            key={getOrderMessageId(messages[index], index)}
            display={display}
          />
        ))}
        <div ref={endRef} />
      </div>
    </div>
  )
}
