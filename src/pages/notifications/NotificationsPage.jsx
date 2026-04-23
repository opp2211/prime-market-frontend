import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../api/notifications'
import {
  refreshUnreadNotifications,
  syncAllNotificationsRead,
  syncNotificationRead,
  useNotifications,
} from '../../app/notifications'
import { useI18n } from '../../app/i18n'
import { getErrorMessage } from '../../shared/lib/errors'
import { getPageContent } from '../../shared/lib/money'
import Button from '../../shared/ui/Button'
import UserAreaLayout from '../account/UserAreaLayout'
import { MoneyStateCard } from '../money/MoneyUI'
import {
  NOTIFICATION_FILTERS,
  NOTIFICATIONS_PAGE_SIZE,
  applyNotificationUpdate,
  formatNotificationDateTime,
  getNotificationFilter,
  getNotificationIsReadFilter,
  markNotificationListRead,
  normalizeNotificationItem,
  resolveNotificationDestination,
} from './notificationHelpers'
import { getNotificationsCopy } from './notificationsCopy'

function buildSearchParams(current, patch) {
  const next = new URLSearchParams(current)

  Object.entries(patch).forEach(([key, value]) => {
    if (
      value == null ||
      value === '' ||
      value === 'all' ||
      (key === 'page' && (value === 0 || value === '0'))
    ) {
      next.delete(key)
      return
    }

    next.set(key, String(value))
  })

  return next
}

function NotificationCard({
  notification,
  copy,
  language,
  onOpen,
  onMarkRead,
  isOpening,
  isMarkingRead,
  isDisabled,
}) {
  const isUnread = !notification.isRead
  const isBusy = isOpening || isMarkingRead || isDisabled

  return (
    <article className={`card notification-card${isUnread ? ' is-unread' : ' is-read'}`}>
      <div className="notification-card__head">
        <div className="notification-card__meta">
          <span
            className={`notification-card__state${
              isUnread ? ' notification-card__state--unread' : ''
            }`}
          >
            {isUnread ? copy.page.unread : copy.page.read}
          </span>
          <span className="notification-card__date">
            {formatNotificationDateTime(notification.createdAt, {
              language,
              fallback: copy.common.notAvailable,
            })}
          </span>
        </div>
      </div>

      <h2 className="notification-card__title">{notification.title || copy.common.untitled}</h2>
      <p className="notification-card__body">{notification.body || copy.common.emptyBody}</p>

      <div className="notification-card__actions">
        {!notification.isRead ? (
          <Button
            variant="secondary"
            onClick={() => onMarkRead(notification)}
            disabled={isBusy}
          >
            {copy.page.markRead}
          </Button>
        ) : (
          <span className="notification-card__read-pill">{copy.page.read}</span>
        )}
        <Button variant="ghost" onClick={() => onOpen(notification)} disabled={isBusy}>
          {copy.page.open}
        </Button>
      </div>
    </article>
  )
}

export default function NotificationsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { language } = useI18n()
  const copy = getNotificationsCopy(language)
  const { unreadCount } = useNotifications()
  const [notifications, setNotifications] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [markingReadId, setMarkingReadId] = useState('')
  const [openingId, setOpeningId] = useState('')
  const [markAllPending, setMarkAllPending] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [pageInfo, setPageInfo] = useState({
    page: 0,
    totalPages: 1,
  })
  const filter = getNotificationFilter(searchParams.get('filter'))
  const page = Math.max(0, Number.parseInt(searchParams.get('page') || '0', 10) || 0)
  const isReadFilter = getNotificationIsReadFilter(filter)
  const hasUnreadItems = notifications.some((notification) => !notification.isRead)

  useEffect(() => {
    refreshUnreadNotifications({ silent: true }).catch(() => {})
  }, [])

  useEffect(() => {
    let active = true

    async function loadNotifications() {
      setStatus('loading')
      setError('')

      try {
        const response = await listNotifications({
          page,
          size: NOTIFICATIONS_PAGE_SIZE,
          sort: 'createdAt,desc',
          ...(typeof isReadFilter === 'boolean' ? { isRead: isReadFilter } : {}),
        })

        if (!active) return

        const pageData = getPageContent(response?.data)
        setNotifications(pageData.content.map(normalizeNotificationItem))
        setPageInfo({
          page: pageData.number,
          totalPages: Math.max(pageData.totalPages || 1, 1),
        })
        setStatus('ready')
      } catch (loadError) {
        if (!active) return

        setError(getErrorMessage(loadError, copy.page.loadError))
        setStatus('error')
      }
    }

    loadNotifications()

    return () => {
      active = false
    }
  }, [copy.page.loadError, isReadFilter, page, reloadKey])

  function updateSearch(patch) {
    setSearchParams(buildSearchParams(searchParams, patch))
  }

  async function handleOpenNotification(notification) {
    if (!notification?.publicId || markingReadId || openingId || markAllPending) return

    const destination = resolveNotificationDestination(notification)
    setOpeningId(notification.publicId)

    try {
      if (!notification.isRead) {
        try {
          const response = await markNotificationRead(notification.publicId)
          const updatedNotification = normalizeNotificationItem(
            response?.data || { ...notification, isRead: true }
          )
          syncNotificationRead(notification, updatedNotification)
          setNotifications((current) =>
            applyNotificationUpdate(current, updatedNotification, filter)
          )
        } catch {
          // Navigation should still continue even if read-state sync fails.
        }
      }

      navigate(destination)
    } finally {
      setOpeningId('')
    }
  }

  async function handleMarkNotificationRead(notification) {
    if (
      !notification?.publicId ||
      notification.isRead ||
      markingReadId ||
      openingId ||
      markAllPending
    ) {
      return
    }

    setMarkingReadId(notification.publicId)
    setActionError('')

    try {
      const response = await markNotificationRead(notification.publicId)
      const updatedNotification = normalizeNotificationItem(
        response?.data || { ...notification, isRead: true }
      )

      syncNotificationRead(notification, updatedNotification)
      setNotifications((current) => applyNotificationUpdate(current, updatedNotification, filter))

      if (filter === 'unread') {
        setReloadKey((value) => value + 1)
      }
    } catch (markReadError) {
      setActionError(getErrorMessage(markReadError, copy.page.actionError))
    } finally {
      setMarkingReadId('')
    }
  }

  async function handleMarkAllRead() {
    if (markAllPending || (!hasUnreadItems && unreadCount <= 0)) return

    setMarkAllPending(true)
    setActionError('')

    try {
      await markAllNotificationsRead()
      syncAllNotificationsRead()
      setNotifications((current) =>
        filter === 'unread' ? [] : markNotificationListRead(current)
      )
      setReloadKey((value) => value + 1)
    } catch (markAllError) {
      setActionError(getErrorMessage(markAllError, copy.page.actionError))
    } finally {
      setMarkAllPending(false)
    }
  }

  const emptyState = copy.page.empty[filter] || copy.page.empty.all

  return (
    <UserAreaLayout section="notifications">
      <div className="notifications-page">
        <div className="money-page-header">
          <div className="money-page-header__copy">
            <div className="money-page-header__eyebrow">{copy.page.eyebrow}</div>
            <h1 className="h1 money-page-header__title">{copy.page.title}</h1>
            <p className="money-page-header__subtitle">{copy.page.subtitle}</p>
          </div>
          <div className="money-page-header__actions">
            <Button
              variant="secondary"
              onClick={handleMarkAllRead}
              disabled={markAllPending || (!hasUnreadItems && unreadCount <= 0)}
            >
              {copy.page.markAll}
            </Button>
          </div>
        </div>

        <div className="card money-filter-card">
          <div className="money-filter-card__title">{copy.page.filtersLabel}</div>
          <div className="tabs">
            {NOTIFICATION_FILTERS.map((value) => (
              <button
                key={value}
                type="button"
                className={`tab${filter === value ? ' is-active' : ''}`}
                onClick={() => updateSearch({ filter: value, page: '' })}
              >
                {copy.page.filters[value]}
              </button>
            ))}
          </div>
        </div>

        {actionError ? <div className="error notifications-page__banner">{actionError}</div> : null}

        {status === 'loading' ? (
          <MoneyStateCard title={copy.page.loadingTitle} text={copy.page.loadingText} />
        ) : null}

        {status === 'error' ? (
          <MoneyStateCard
            tone="danger"
            title={copy.page.errorTitle}
            text={error}
            action={
              <Button variant="secondary" onClick={() => setReloadKey((value) => value + 1)}>
                {copy.page.retry}
              </Button>
            }
          />
        ) : null}

        {status === 'ready' && notifications.length === 0 ? (
          <MoneyStateCard title={emptyState.title} text={emptyState.text} />
        ) : null}

        {status === 'ready' && notifications.length > 0 ? (
          <>
            <section className="card notifications-list-card">
              <div className="notifications-list-card__head">
                <div className="notifications-list-card__title">{copy.page.listTitle}</div>
                <div className="notifications-list-card__subtitle">{copy.page.listSubtitle}</div>
              </div>

              <div className="notifications-list">
                {notifications.map((notification) => (
                  <NotificationCard
                    key={notification.publicId}
                    notification={notification}
                    copy={copy}
                    language={language}
                    onOpen={handleOpenNotification}
                    onMarkRead={handleMarkNotificationRead}
                    isOpening={openingId === notification.publicId}
                    isMarkingRead={markingReadId === notification.publicId}
                    isDisabled={markAllPending}
                  />
                ))}
              </div>
            </section>

            {pageInfo.totalPages > 1 ? (
              <div className="money-pagination">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={pageInfo.page <= 0}
                  onClick={() => updateSearch({ page: Math.max(0, pageInfo.page - 1) })}
                >
                  {copy.page.previousPage}
                </Button>
                <div className="money-pagination__summary">
                  {copy.page.pageLabel} {pageInfo.page + 1} {copy.page.of} {pageInfo.totalPages}
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={pageInfo.page >= pageInfo.totalPages - 1}
                  onClick={() => updateSearch({ page: pageInfo.page + 1 })}
                >
                  {copy.page.nextPage}
                </Button>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </UserAreaLayout>
  )
}
