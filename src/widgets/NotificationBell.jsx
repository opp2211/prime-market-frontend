import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../api/notifications'
import {
  refreshUnreadNotifications,
  seedRecentNotifications,
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
  normalizeNotificationItem,
  resolveNotificationDestination,
} from '../pages/notifications/notificationHelpers'
import { getNotificationsCopy } from '../pages/notifications/notificationsCopy'
import styles from './Header.module.css'

function cx(...values) {
  return values.filter(Boolean).join(' ')
}

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

export default function NotificationBell({ mobileDropdownAlign = 'left' }) {
  const location = useLocation()
  const navigate = useNavigate()
  const wrapRef = useRef(null)
  const loadRequestRef = useRef(0)
  const recentItemsCountRef = useRef(0)
  const { language } = useI18n()
  const copy = getNotificationsCopy(language)
  const { unreadCount, recentItems, resyncVersion } = useNotifications()
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [activeId, setActiveId] = useState('')
  const [markAllPending, setMarkAllPending] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const items = recentItems.slice(0, HEADER_NOTIFICATIONS_LIMIT)
  const isActive = location.pathname.startsWith('/notifications')
  const hasUnreadItems = items.some((item) => !item.isRead)
  const canMarkAll = !markAllPending && (hasUnreadItems || unreadCount > 0)

  useEffect(() => {
    refreshUnreadNotifications({ silent: true }).catch(() => {})
  }, [])

  useEffect(() => {
    recentItemsCountRef.current = recentItems.length
  }, [recentItems.length])

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
    const hasCachedItems = recentItemsCountRef.current > 0

    loadRequestRef.current = requestId
    setStatus(hasCachedItems ? 'ready' : 'loading')
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
        seedRecentNotifications(content.map(normalizeNotificationItem))
        setStatus('ready')
      } catch (loadError) {
        if (loadRequestRef.current !== requestId) return

        if (hasCachedItems) {
          setStatus('ready')
          return
        }

        setError(getErrorMessage(loadError, copy.header.loadError))
        setStatus('error')
      }
    }

    loadNotifications()
  }, [copy.header.loadError, open, reloadKey, resyncVersion])

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
    } catch (markAllError) {
      setError(getErrorMessage(markAllError, copy.page.actionError))
    } finally {
      setMarkAllPending(false)
    }
  }

  return (
    <div
      className={cx(
        styles.notificationControl,
        open && styles.notificationControlOpen,
        isActive && styles.notificationControlActive
      )}
      ref={wrapRef}
    >
      <button
        type="button"
        className={cx(styles.iconButton, styles.notificationTrigger)}
        onClick={() => setOpen((currentOpen) => !currentOpen)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={copy.header.buttonAria(unreadCount)}
        title={copy.header.buttonLabel}
      >
        <span className={styles.notificationIcon} aria-hidden="true">
          <NotificationBellIcon />
        </span>
        {unreadCount > 0 ? (
          <span className={styles.notificationBadge}>{formatUnreadBadge(unreadCount)}</span>
        ) : null}
      </button>

      <div
        className={cx(
          styles.dropdownPanel,
          styles.notificationDropdown,
          mobileDropdownAlign === 'right' && styles.notificationDropdownMobileRight,
          open && styles.dropdownOpen
        )}
        role="menu"
        aria-label={copy.header.panelTitle}
        aria-hidden={!open}
      >
        <div className={styles.notificationHeader}>
          <div>
            <div className={styles.notificationTitle}>{copy.header.panelTitle}</div>
            <div className={styles.notificationSubtitle}>{copy.header.panelSubtitle}</div>
          </div>
          <button
            type="button"
            className={styles.notificationMarkAll}
            onClick={handleMarkAllRead}
            disabled={!canMarkAll}
          >
            {copy.header.markAll}
          </button>
        </div>

        {status === 'loading' ? (
          <div className={styles.notificationState}>
            <div className={styles.notificationStateTitle}>{copy.header.loadingTitle}</div>
            <div className={styles.notificationStateText}>{copy.header.loadingText}</div>
          </div>
        ) : null}

        {status === 'error' ? (
          <div className={cx(styles.notificationState, styles.notificationStateDanger)}>
            <div className={styles.notificationStateTitle}>{copy.header.errorTitle}</div>
            <div className={styles.notificationStateText}>{error}</div>
            <Button
              variant="secondary"
              className={styles.notificationRetry}
              onClick={() => setReloadKey((value) => value + 1)}
            >
              {copy.header.retry}
            </Button>
          </div>
        ) : null}

        {status === 'ready' && items.length === 0 ? (
          <div className={styles.notificationState}>
            <div className={styles.notificationStateTitle}>{copy.header.emptyTitle}</div>
            <div className={styles.notificationStateText}>{copy.header.emptyText}</div>
          </div>
        ) : null}

        {status === 'ready' && items.length > 0 ? (
          <div className={styles.notificationList}>
            {items.map((notification) => (
              <button
                key={notification.publicId}
                type="button"
                className={cx(
                  styles.notificationItem,
                  notification.isRead
                    ? styles.notificationItemRead
                    : styles.notificationItemUnread
                )}
                onClick={() => handleNotificationOpen(notification)}
                disabled={Boolean(activeId) || markAllPending}
              >
                <span className={styles.notificationItemTop}>
                  <span className={styles.notificationItemTitle}>
                    {notification.title || copy.common.untitled}
                  </span>
                  {!notification.isRead ? (
                    <span className={styles.notificationItemBadge}>{copy.page.unread}</span>
                  ) : null}
                </span>
                <span className={styles.notificationItemBody}>
                  {notification.body || copy.common.emptyBody}
                </span>
                <span className={styles.notificationItemMeta}>
                  {formatNotificationDateTime(notification.createdAt, {
                    language,
                    fallback: copy.common.notAvailable,
                  })}
                </span>
              </button>
            ))}
          </div>
        ) : null}

        <div className={styles.notificationFooter}>
          <div className={styles.notificationCounter}>
            {copy.common.unreadCount(unreadCount)}
          </div>
          <Link
            to="/notifications"
            className={styles.notificationAllLink}
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
