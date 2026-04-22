import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getBackofficeDisputes } from '../../api/orderDisputes'
import { useI18n } from '../../app/i18n'
import { getErrorMessage } from '../../shared/lib/errors'
import {
  filterOrderDisputesByStatus,
  resolveOrderDisputeAssignedSupportLabel,
  resolveOrderDisputeCreatedAt,
  resolveOrderDisputeId,
  resolveOrderDisputeOrderId,
  resolveOrderDisputeParticipant,
  resolveOrderDisputeQueueItems,
  resolveOrderDisputeReasonLabel,
  resolveOrderDisputeStatusLabel,
  resolveOrderDisputeStatusTone,
  sortOrderDisputes,
} from '../orders/orderDisputePresentation'
import { getBackofficeDisputesCopy } from './backofficeDisputesCopy'

const TABS = ['open', 'in_review', 'resolved', 'all']

export default function BackofficeDisputesQueue() {
  const { language } = useI18n()
  const copy = getBackofficeDisputesCopy(language)
  const [activeTab, setActiveTab] = useState('open')
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true

    const loadDisputes = async () => {
      setStatus('loading')
      setError('')

      try {
        const response = await getBackofficeDisputes()
        if (!active) return

        const queueItems = sortOrderDisputes(resolveOrderDisputeQueueItems(response?.data))
        setItems(queueItems)
        setStatus('ready')
      } catch (err) {
        if (!active) return
        setError(getErrorMessage(err, copy.review.disputeLoadError))
        setStatus('error')
      }
    }

    loadDisputes()

    return () => {
      active = false
    }
  }, [copy.review.disputeLoadError, reloadKey])

  const filteredItems = useMemo(
    () => filterOrderDisputesByStatus(items, activeTab),
    [activeTab, items]
  )
  const isLoading = status === 'loading'

  return (
    <div className="account-page">
      <div className="account-page__head">
        <h1 className="h1 account-page__title">{copy.title}</h1>
        <p className="account-page__subtitle">{copy.subtitle}</p>
      </div>

      <div className="tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`tab${activeTab === tab ? ' is-active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {copy.queueTabs[tab]}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="card">
          <div className="muted">{copy.loading}</div>
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="card">
          <div className="error">{error}</div>
          <div className="account-page__actions">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => setReloadKey((value) => value + 1)}
            >
              {copy.refresh}
            </button>
          </div>
        </div>
      ) : null}

      {!isLoading && !error && filteredItems.length === 0 ? (
        <div className="card">
          <div className="muted">{copy.empty}</div>
        </div>
      ) : null}

      {!isLoading && !error && filteredItems.length > 0 ? (
        <div className="card dispute-queue">
          <div className="dispute-queue__head">
            <div>{copy.queueColumns.dispute}</div>
            <div>{copy.queueColumns.parties}</div>
            <div>{copy.queueColumns.assignment}</div>
            <div>{copy.queueColumns.status}</div>
          </div>

          <div className="dispute-queue__body">
            {filteredItems.map((item, index) => {
              const disputeId = resolveOrderDisputeId(item)
              const row = (
                <>
                  <div className="dispute-queue__cell dispute-queue__cell--main">
                    <div className="dispute-queue__cell-label">
                      {copy.queueColumns.dispute}
                    </div>
                    <div className="dispute-queue__title">
                      {copy.queueMeta.order} #{resolveOrderDisputeOrderId(item)}
                    </div>
                    <div className="dispute-queue__meta">
                      <span>
                        {copy.queueMeta.reason}: {resolveOrderDisputeReasonLabel(item, language)}
                      </span>
                    </div>
                    <div className="dispute-queue__meta">
                      <span>
                        {copy.queueMeta.createdAt}:{' '}
                        {resolveOrderDisputeCreatedAt(item, language)}
                      </span>
                    </div>
                  </div>

                  <div className="dispute-queue__cell">
                    <div className="dispute-queue__cell-label">
                      {copy.queueColumns.parties}
                    </div>
                    <div className="dispute-queue__meta">
                      <span>
                        {copy.queueMeta.buyer}:{' '}
                        {resolveOrderDisputeParticipant(item, 'buyer', language)}
                      </span>
                    </div>
                    <div className="dispute-queue__meta">
                      <span>
                        {copy.queueMeta.seller}:{' '}
                        {resolveOrderDisputeParticipant(item, 'seller', language)}
                      </span>
                    </div>
                  </div>

                  <div className="dispute-queue__cell">
                    <div className="dispute-queue__cell-label">
                      {copy.queueColumns.assignment}
                    </div>
                    <div className="dispute-queue__meta">
                      <span>
                        {copy.queueMeta.assignee}:{' '}
                        {resolveOrderDisputeAssignedSupportLabel(item, language)}
                      </span>
                    </div>
                  </div>

                  <div className="dispute-queue__cell dispute-queue__cell--status">
                    <div className="dispute-queue__cell-label">
                      {copy.queueColumns.status}
                    </div>
                    <span
                      className={`status-chip status-chip--${resolveOrderDisputeStatusTone(
                        item
                      )}`}
                    >
                      {resolveOrderDisputeStatusLabel(item, language)}
                    </span>
                    <div className="dispute-queue__open">{copy.queueOpen}</div>
                  </div>
                </>
              )

              if (!disputeId) {
                return (
                  <div key={`missing-${index}`} className="dispute-queue__row">
                    {row}
                  </div>
                )
              }

              return (
                <Link
                  key={disputeId}
                  to={`/backoffice/disputes/${disputeId}`}
                  state={{ dispute: item }}
                  className="dispute-queue__row"
                >
                  {row}
                </Link>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}
