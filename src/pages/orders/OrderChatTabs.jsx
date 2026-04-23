import {
  getOrderConversationId,
  getOrderConversationLabel,
} from './orderChatPresentation'

export default function OrderChatTabs({
  conversations,
  selectedConversationId,
  copy,
  updatedConversationIds = [],
  onSelect,
}) {
  const updatedConversationIdSet = new Set(
    Array.isArray(updatedConversationIds) ? updatedConversationIds : []
  )

  return (
    <div className="order-chat-tabs" role="tablist" aria-label={copy.conversationsAria}>
      {conversations.map((conversation) => {
        const conversationId = getOrderConversationId(conversation)
        const isActive = conversationId === selectedConversationId
        const hasUpdates =
          !isActive && updatedConversationIdSet.has(conversationId)

        return (
          <button
            key={conversationId}
            type="button"
            className={`order-chat-tab${isActive ? ' is-active' : ''}`}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onSelect(conversationId)}
          >
            <span>{getOrderConversationLabel(conversation, copy)}</span>
            {hasUpdates ? (
              <span className="order-chat-tab__badge" aria-hidden="true" />
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
