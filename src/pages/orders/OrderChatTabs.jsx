import {
  getOrderConversationId,
  getOrderConversationLabel,
} from './orderChatPresentation'

export default function OrderChatTabs({
  conversations,
  selectedConversationId,
  copy,
  onSelect,
}) {
  return (
    <div className="order-chat-tabs" role="tablist" aria-label={copy.conversationsAria}>
      {conversations.map((conversation) => {
        const conversationId = getOrderConversationId(conversation)
        const isActive = conversationId === selectedConversationId

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
            {getOrderConversationLabel(conversation, copy)}
          </button>
        )
      })}
    </div>
  )
}
