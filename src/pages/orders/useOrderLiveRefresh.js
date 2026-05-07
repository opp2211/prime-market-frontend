import { useEffect, useReducer, useRef } from 'react'
import { useNotifications } from '../../app/notifications'
import {
  getNotificationOrderCode,
  isOrderNotificationType,
  isNotificationForOrder,
  shouldRefreshOrderChats,
  shouldRefreshOrderDetails,
  shouldRefreshOrderMessages,
  shouldRefreshOrderTimeline,
} from '../notifications/notificationHelpers'

function createRefreshState() {
  return {
    order: 0,
    timeline: 0,
    chats: 0,
    messages: 0,
  }
}

function refreshStateReducer(state, action) {
  if (action?.type === 'increment') {
    return {
      order: state.order + (action.order ? 1 : 0),
      timeline: state.timeline + (action.timeline ? 1 : 0),
      chats: state.chats + (action.chats ? 1 : 0),
      messages: state.messages + (action.messages ? 1 : 0),
    }
  }

  if (action?.type === 'resync') {
    return {
      order: state.order + 1,
      timeline: state.timeline + 1,
      chats: state.chats + 1,
      messages: state.messages + 1,
    }
  }

  return state
}

export default function useOrderLiveRefresh(orderId) {
  const { events, eventVersion, resyncVersion } = useNotifications()
  const previousOrderIdRef = useRef(orderId)
  const handledEventVersionRef = useRef(eventVersion)
  const handledResyncVersionRef = useRef(resyncVersion)
  const [refreshState, dispatchRefreshState] = useReducer(
    refreshStateReducer,
    undefined,
    createRefreshState
  )

  useEffect(() => {
    if (previousOrderIdRef.current === orderId) return

    previousOrderIdRef.current = orderId
    handledEventVersionRef.current = eventVersion
    handledResyncVersionRef.current = resyncVersion
  }, [eventVersion, orderId, resyncVersion])

  useEffect(() => {
    if (!orderId) return undefined
    if (eventVersion <= handledEventVersionRef.current) return undefined

    const nextEvents = (Array.isArray(events) ? events : []).filter(
      (event) => event?.version > handledEventVersionRef.current
    )
    handledEventVersionRef.current = eventVersion

    if (nextEvents.length === 0) return undefined

    let shouldRefreshOrderBlock = false
    let shouldRefreshTimelineBlock = false
    let shouldRefreshChatsBlock = false
    let shouldRefreshMessagesBlock = false

    nextEvents.forEach((event) => {
      if (event?.type !== 'notification.created') return

      const notification = event.notification
      const hasExplicitOrderMatch = isNotificationForOrder(notification, orderId)
      const hasMissingOrderContext =
        !getNotificationOrderCode(notification) &&
        isOrderNotificationType(notification?.type)

      // Runtime notification payloads can arrive without usable orderCode,
      // so keep the currently open order page live by falling back to local refresh.
      if (!hasExplicitOrderMatch && !hasMissingOrderContext) return

      if (shouldRefreshOrderDetails(notification?.type)) {
        shouldRefreshOrderBlock = true
      }

      if (shouldRefreshOrderTimeline(notification?.type)) {
        shouldRefreshTimelineBlock = true
      }

      if (shouldRefreshOrderChats(notification?.type)) {
        shouldRefreshChatsBlock = true
      }

      if (shouldRefreshOrderMessages(notification?.type)) {
        shouldRefreshMessagesBlock = true
      }
    })

    if (
      !shouldRefreshOrderBlock &&
      !shouldRefreshTimelineBlock &&
      !shouldRefreshChatsBlock &&
      !shouldRefreshMessagesBlock
    ) {
      return undefined
    }

    dispatchRefreshState({
      type: 'increment',
      order: shouldRefreshOrderBlock,
      timeline: shouldRefreshTimelineBlock,
      chats: shouldRefreshChatsBlock,
      messages: shouldRefreshMessagesBlock,
    })
  }, [eventVersion, events, orderId])

  useEffect(() => {
    if (!orderId) return undefined
    if (resyncVersion <= handledResyncVersionRef.current) return undefined

    handledResyncVersionRef.current = resyncVersion

    dispatchRefreshState({ type: 'resync' })
  }, [orderId, resyncVersion])

  return refreshState
}
