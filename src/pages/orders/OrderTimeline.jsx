import { useEffect, useState } from 'react'
import { getOrderEvents } from '../../api/orders'
import { getErrorMessage } from '../../shared/lib/errors'
import Button from '../../shared/ui/Button'
import { mapOrderEventToDisplay, sortOrderEvents } from './orderEventsPresentation'

function buildTimelineKey(event, index) {
  return event?.id || `${event?.createdAt || 'event'}-${event?.eventType || 'unknown'}-${index}`
}

function TimelineSkeleton() {
  return (
    <div className="order-timeline-skeleton" aria-hidden="true">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="order-timeline-skeleton__item">
          <div className="skeleton order-skeleton order-skeleton--timeline-marker" />
          <div className="order-timeline-skeleton__content">
            <div className="skeleton order-skeleton order-skeleton--timeline-title" />
            <div className="skeleton order-skeleton order-skeleton--timeline-text" />
            <div className="skeleton order-skeleton order-skeleton--timeline-meta" />
          </div>
        </div>
      ))}
    </div>
  )
}

function TimelineItem({ display }) {
  return (
    <article className={`order-timeline-item order-timeline-item--${display.tone}`}>
      <div className={`order-timeline-item__marker order-timeline-item__marker--${display.tone}`}>
        <span className="order-timeline-item__marker-core" />
      </div>

      <div className="order-timeline-item__content">
        <div className="order-timeline-item__top">
          <div className="order-timeline-item__main">
            <h3 className="order-timeline-item__title">{display.title || display.fallbackTitle}</h3>
            {display.subtitle ? (
              <p className="order-timeline-item__subtitle">{display.subtitle}</p>
            ) : null}
          </div>

          <time className="order-timeline-item__time" dateTime={display.dateTime}>
            {display.timestamp}
          </time>
        </div>

        <div className="order-timeline-item__meta">
          <span className={`order-timeline-pill order-timeline-pill--${display.actorTone}`}>
            {display.actorLabel}
          </span>
          <span className="order-timeline-item__meta-text">{display.actorNote}</span>
        </div>
      </div>
    </article>
  )
}

export default function OrderTimeline({ orderId, order, copy, language, refreshKey = 0 }) {
  const [events, setEvents] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true

    const loadEvents = async () => {
      if (!orderId) {
        setEvents([])
        setStatus('ready')
        setError('')
        return
      }

      setStatus((current) => (current === 'ready' || current === 'refreshing' ? 'refreshing' : 'loading'))
      setError('')

      try {
        const response = await getOrderEvents(orderId)
        if (!active) return

        const items = Array.isArray(response?.data?.items) ? response.data.items : []
        setEvents(sortOrderEvents(items))
        setStatus('ready')
      } catch (err) {
        if (!active) return

        setError(getErrorMessage(err, copy.errors.history))
        setStatus((current) => (current === 'ready' || current === 'refreshing' ? 'ready' : 'error'))
      }
    }

    loadEvents()

    return () => {
      active = false
    }
  }, [copy.errors.history, orderId, refreshKey, reloadKey])

  const isInitialLoading = status === 'loading' && events.length === 0
  const isRefreshing = status === 'refreshing'
  const displayItems = events.map((event) =>
    mapOrderEventToDisplay(event, {
      language,
      order,
    })
  )

  return (
    <section className="card order-section">
      <div className="order-section__head">
        <div className="order-timeline__heading">
          <div>
            <h2 className="order-section__title">{copy.details.history.title}</h2>
            <p className="order-section__description">{copy.details.history.description}</p>
          </div>

          {isRefreshing ? (
            <span className="order-refresh-badge">{copy.details.history.refreshing}</span>
          ) : null}
        </div>
      </div>

      <div className="order-section__body">
        {error && events.length > 0 ? <div className="error">{error}</div> : null}

        {isInitialLoading ? <TimelineSkeleton /> : null}

        {!isInitialLoading && error && events.length === 0 ? (
          <div className="order-timeline-state order-timeline-state--error">
            <div className="order-timeline-state__title">{error}</div>
            <div className="order-timeline-state__actions">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setReloadKey((value) => value + 1)}
              >
                {copy.common.retry}
              </Button>
            </div>
          </div>
        ) : null}

        {!isInitialLoading && !error && displayItems.length === 0 ? (
          <div className="order-timeline-state">
            <div className="order-timeline-state__title">{copy.details.history.emptyTitle}</div>
            <div className="order-timeline-state__text">{copy.details.history.emptyText}</div>
          </div>
        ) : null}

        {!isInitialLoading && displayItems.length > 0 ? (
          <div className="order-timeline">
            {displayItems.map((display, index) => (
              <TimelineItem
                key={buildTimelineKey(events[index], index)}
                display={display}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}
