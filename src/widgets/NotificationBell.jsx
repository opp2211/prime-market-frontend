import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../api/notifications'
import {
  refreshUnreadNotifications,
  syncAllNotificationsRead,
  syncNotificationRead,
  useNotifications,
} from '../app/notifications'
import { useI18n } from '../app/i18n'
import { getErrorMessage } from '../shared/lib/errors'
import Button from '../shared/ui/Button'
import {
  HEADER_NOTIFICATIONS_LIMIT,
  formatNotificationDateTime,
  formatUnreadBadge,
  markNotificationListRead,
  normalizeNotificationItem,
  resolveNotificationDestination,
} from '../pages/notifications/notificationHelpers'
import { getNotificationsCopy } from '../pages/notifications/notificationsCopy'

function NotificationBellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8 18h8m-6 0a2 2 0 0 0 4 0m6-1H4l1.6-1.8A2 2 0 0 0 6 13.9V11a6 6 0 1 1 12 0v2.9c0 .49.18.96.5 1.32L20 17Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function NotificationBell() {
  const location = useLocation()
  const navigate = useNavigate()
  const wrapRef = useRef(null)
  const loadRequestRef = useRef(0)
  const { language } = useI18n()
  const copy = getNotificationsCopy(language)
  const { unreadCount } = useNotifications()
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [items, setItems] = useState([])
  const [activeId, setActiveId] = useState('')
  const [markAllPending, setMarkAllPending] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const isActive = location.pathname.startsWith('/notifications')
  const hasUnreadItems = items.some((item) => !item.isRead)
  const canMarkAll = !markAllPending && (hasUnreadItems || unreadCount > 0)

  useEffect(() => {
    refreshUnreadNotifications({ silent: true }).catch(() => {})
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [location.pathname, location.search])

  useEffect(() => {
    if (!open) return undefined

    function onDocumentClick(event) {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    function onKeyDown(event) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', onDocumentClick)
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('mousedown', onDocumentClick)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  useEffect(() => {
    return () => {
      loadRequestRef.current += 1
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const requestId = loadRequestRef.current + 1
    loadRequestRef.current = requestId
    setStatus('loading')
    setError('')

    async function loadNotifications() {
      try {
        const response = await listNotifications({
          page: 0,
          size: HEADER_NOTIFICATIONS_LIMIT,
          sort: 'createdAt,desc',
        })

        if (loadRequestRef.current !== requestId) return

        const content = Array.isArray(response?.data?.content) ? response.data.content : []
        setItems(content.map(normalizeNotificationItem))
        setStatus('ready')
      } catch (loadError) {
        if (loadRequestRef.current !== requestId) return

        setError(getErrorMessage(loadError, copy.header.loadError))
        setStatus('error')
      }
    }

    loadNotifications()
  }, [copy.header.loadError, open, reloadKey])

  async function handleNotificationOpen(notification) {
    if (!notification?.publicId || activeId || markAllPending) return

    const destination = resolveNotificationDestination(notification)
    setActiveId(notification.publicId)

    try {
      if (!notification.isRead) {
        try {
          const response = await markNotificationRead(notification.publicId)
          const updatedNotification = normalizeNotificationItem(
            response?.data || { ...notification, isRead: true }
          )
          syncNotificationRead(notification, updatedNotification)
          setItems((current) =>
            current.map((item) =>
              item?.publicId === updatedNotification.publicId
                ? { ...item, ...updatedNotification }
                : item
            )
          )
        } catch {
          // Navigation should not be blocked by a failed read-state update.
        }
      }

      setOpen(false)
      navigate(destination)
    } finally {
      setActiveId('')
    }
  }

  async function handleMarkAllRead() {
    if (!canMarkAll) return

    setMarkAllPending(true)
    setError('')

    try {
      await markAllNotificationsRead()
      syncAllNotificationsRead()
      setItems((current) => markNotificationListRead(current))
    } catch (markAllError) {
      setError(getErrorMessage(markAllError, copy.page.actionError))
    } finally {
      setMarkAllPending(false)
    }
  }

  return (
    <div
      className={`account-entry notification-center${open ? ' is-open' : ''}${
        isActive ? ' is-active' : ''
      }`}
      ref={wrapRef}
    >
      <button
        type="button"
        className="account-entry__main notification-center__trigger"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={copy.header.buttonAria(unreadCount)}
        title={copy.header.buttonLabel}
      >
        <span className="notification-center__icon" aria-hidden="true">
          <NotificationBellIcon />
        </span>
        {unreadCount > 0 ? (
          <span className="notification-center__badge">{formatUnreadBadge(unreadCount)}</span>
        ) : null}
      </button>

      <div
        className="dropdown account-dropdown notification-dropdown"
        role="menu"
        aria-label={copy.header.panelTitle}
        aria-hidden={!open}
      >
        <div className="notification-dropdown__header">
          <div>
            <div className="notification-dropdown__title">{copy.header.panelTitle}</div>
            <div className="notification-dropdown__subtitle">{copy.header.panelSubtitle}</div>
          </div>
          <button
            type="button"
            className="notification-dropdown__mark-all"
            onClick={handleMarkAllRead}
            disabled={!canMarkAll}
          >
            {copy.header.markAll}
          </button>
        </div>

        {status === 'loading' ? (
          <div className="notification-dropdown__state">
            <div className="notification-dropdown__state-title">{copy.header.loadingTitle}</div>
            <div className="notification-dropdown__state-text">{copy.header.loadingText}</div>
          </div>
        ) : null}

        {status === 'error' ? (
          <div className="notification-dropdown__state notification-dropdown__state--danger">
            <div className="notification-dropdown__state-title">{copy.header.errorTitle}</div>
            <div className="notification-dropdown__state-text">{error}</div>
            <Button
              variant="secondary"
              className="notification-dropdown__retry"
              onClick={() => setReloadKey((value) => value + 1)}
            >
              {copy.header.retry}
            </Button>
          </div>
        ) : null}

        {status === 'ready' && items.length === 0 ? (
          <div className="notification-dropdown__state">
            <div className="notification-dropdown__state-title">{copy.header.emptyTitle}</div>
            <div className="notification-dropdown__state-text">{copy.header.emptyText}</div>
          </div>
        ) : null}

        {status === 'ready' && items.length > 0 ? (
          <div className="notification-dropdown__list">
            {items.map((notification) => (
              <button
                key={notification.publicId}
                type="button"
                className={`notification-dropdown__item${
                  notification.isRead ? ' is-read' : ' is-unread'
                }`}
                onClick={() => handleNotificationOpen(notification)}
                disabled={Boolean(activeId) || markAllPending}
              >
                <span className="notification-dropdown__item-top">
                  <span className="notification-dropdown__item-title">
                    {notification.title || copy.common.untitled}
                  </span>
                  {!notification.isRead ? (
                    <span className="notification-dropdown__item-badge">{copy.page.unread}</span>
                  ) : null}
                </span>
                <span className="notification-dropdown__item-body">
                  {notification.body || copy.common.emptyBody}
                </span>
                <span className="notification-dropdown__item-meta">
                  {formatNotificationDateTime(notification.createdAt, {
                    language,
                    fallback: copy.common.notAvailable,
                  })}
                </span>
              </button>
            ))}
          </div>
        ) : null}

        <div className="notification-dropdown__footer">
          <div className="notification-dropdown__counter">
            {copy.common.unreadCount(unreadCount)}
          </div>
          <Link
            to="/notifications"
            className="notification-dropdown__all-link"
            role="menuitem"
            tabIndex={open ? 0 : -1}
            onClick={() => setOpen(false)}
          >
            {copy.header.allNotifications}
          </Link>
        </div>
      </div>
    </div>
  )
}
