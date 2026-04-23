import { useEffect, useRef, useState } from 'react'
import { useNotifications } from '../../app/notifications'
import {
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

export default function useOrderLiveRefresh(orderId) {
  const { events, eventVersion, resyncVersion } = useNotifications()
  const previousOrderIdRef = useRef(orderId)
  const handledEventVersionRef = useRef(eventVersion)
  const handledResyncVersionRef = useRef(resyncVersion)
  const [refreshState, setRefreshState] = useState(createRefreshState)

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
      if (!isNotificationForOrder(notification, orderId)) return

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

    let cancelled = false

    queueMicrotask(() => {
      if (cancelled) return

      setRefreshState((current) => ({
        order: current.order + (shouldRefreshOrderBlock ? 1 : 0),
        timeline: current.timeline + (shouldRefreshTimelineBlock ? 1 : 0),
        chats: current.chats + (shouldRefreshChatsBlock ? 1 : 0),
        messages: current.messages + (shouldRefreshMessagesBlock ? 1 : 0),
      }))
    })

    return () => {
      cancelled = true
    }
  }, [eventVersion, events, orderId])

  useEffect(() => {
    if (!orderId) return undefined
    if (resyncVersion <= handledResyncVersionRef.current) return undefined

    handledResyncVersionRef.current = resyncVersion
    let cancelled = false

    queueMicrotask(() => {
      if (cancelled) return

      setRefreshState((current) => ({
        order: current.order + 1,
        timeline: current.timeline + 1,
        chats: current.chats + 1,
        messages: current.messages + 1,
      }))
    })

    return () => {
      cancelled = true
    }
  }, [orderId, resyncVersion])

  return refreshState
}
