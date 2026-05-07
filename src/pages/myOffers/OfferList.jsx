import { Link } from 'react-router-dom'
import {
  formatOfferNumber,
  formatOfferPrice,
  resolveOfferDisplayTitle,
  resolveOfferMetaDate,
  resolveOfferSideLabel,
  resolveOfferSideTone,
  resolveOfferStatusLabel,
  resolveOfferStatusTone,
} from './offerPresentation'

function getStatusAction(status, copy) {
  const normalized = (status || '').toString().trim().toLowerCase()
  if (normalized === 'active') return { nextStatus: 'paused', label: copy.list.pause }
  if (normalized === 'paused' || normalized === 'draft') {
    return { nextStatus: 'active', label: copy.list.publish }
  }
  return null
}

function OfferSkeletonRows() {
  return (
    <div className="offer-list">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="offer-row offer-row--skeleton">
          <div className="offer-row__main">
            <div className="skeleton offer-skeleton offer-skeleton--title" />
            <div className="skeleton offer-skeleton offer-skeleton--meta" />
          </div>
          <div className="offer-row__price">
            <div className="skeleton offer-skeleton offer-skeleton--price" />
            <div className="skeleton offer-skeleton offer-skeleton--meta" />
          </div>
          <div className="offer-row__status">
            <div className="skeleton offer-skeleton offer-skeleton--chip" />
          </div>
          <div className="offer-row__actions">
            <div className="skeleton offer-skeleton offer-skeleton--button" />
            <div className="skeleton offer-skeleton offer-skeleton--button" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function OfferList({
  copy,
  language,
  offers,
  isLoading,
  error,
  actionError,
  notice,
  onRetry,
  onStatusAction,
  actionOfferId,
}) {
  if (isLoading) {
    return (
      <div className="card offer-table">
        <OfferSkeletonRows />
      </div>
    )
  }

  if (error) {
    return (
      <div className="card offer-state offer-state--error">
        <div className="offer-state__title">{error}</div>
        <button type="button" className="btn btn--secondary" onClick={onRetry}>
          {copy.common.retry}
        </button>
      </div>
    )
  }

  if (!offers.length) {
    return (
      <div className="card offer-empty">
        <div className="offer-empty__icon" aria-hidden="true">
          PM
        </div>
        <div className="offer-empty__title">{copy.list.emptyTitle}</div>
        <div className="offer-empty__subtitle">{copy.list.emptySubtitle}</div>
        <Link to="/dashboard/offers/new" className="btn btn--primary">
          {copy.list.emptyCta}
        </Link>
      </div>
    )
  }

  return (
    <>
      {notice ? <div className="notice offer-inline-banner">{notice}</div> : null}
      {actionError ? <div className="error offer-inline-banner">{actionError}</div> : null}
      <div className="card offer-table">
        <div className="offer-table__head">
          <div>{copy.list.columns.offer}</div>
          <div>{copy.list.columns.price}</div>
          <div>{copy.list.columns.status}</div>
          <div>{copy.list.columns.actions}</div>
        </div>
        <div className="offer-list">
          {offers.map((offer) => {
            const statusAction = getStatusAction(offer?.status, copy)
            const isUpdating = actionOfferId === offer?.id
            const quantityLabel =
              offer?.quantity != null
                ? `${copy.list.quantityLabel}: ${formatOfferNumber(offer.quantity, language)}`
                : copy.common.noValue

            return (
              <div key={offer?.id} className="offer-row">
                <div className="offer-row__main">
                  <div className="offer-row__title">
                    {resolveOfferDisplayTitle(offer, language)}
                  </div>
                  <div className="offer-row__meta">
                    <span>{offer?.game?.title || copy.common.noValue}</span>
                    <span className="offer-row__dot" aria-hidden="true" />
                    <span>{offer?.category?.title || copy.common.noValue}</span>
                    <span
                      className={`offer-chip offer-chip--${resolveOfferSideTone(offer?.side)}`}
                    >
                      {resolveOfferSideLabel(offer?.side, language)}
                    </span>
                  </div>
                </div>

                <div className="offer-row__price">
                  <div className="offer-row__price-value">
                    {formatOfferPrice(offer?.priceAmount, offer?.priceCurrencyCode, language)}
                  </div>
                  <div className="offer-row__meta offer-row__meta--compact">
                    {quantityLabel}
                  </div>
                </div>

                <div className="offer-row__status">
                  <span
                    className={`status-chip status-chip--${resolveOfferStatusTone(offer?.status)}`}
                  >
                    {resolveOfferStatusLabel(offer?.status, language)}
                  </span>
                  <div className="offer-row__meta offer-row__meta--compact">
                    {resolveOfferMetaDate(offer, language)}
                  </div>
                </div>

                <div className="offer-row__actions">
                  <Link
                    to={`/dashboard/offers/${offer?.publicCode || offer?.id}/edit`}
                    className="btn btn--ghost offer-row__action"
                  >
                    {copy.list.edit}
                  </Link>
                  {statusAction ? (
                    <button
                      type="button"
                      className="btn btn--secondary offer-row__action"
                      onClick={() => onStatusAction(offer, statusAction.nextStatus)}
                      disabled={isUpdating}
                    >
                      {isUpdating ? copy.list.updating : statusAction.label}
                    </button>
                  ) : (
                    <span className="offer-row__action-note">{copy.list.noAction}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
