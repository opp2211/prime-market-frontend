import { Link } from 'react-router-dom'
import OrderListItem from './OrderListItem'

function OrdersSkeleton() {
  return (
    <div className="order-table__body">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="order-row order-row--skeleton">
          <div className="order-row__cell order-row__cell--main">
            <div className="skeleton order-skeleton order-skeleton--title" />
            <div className="skeleton order-skeleton order-skeleton--meta" />
          </div>
          <div className="order-row__cell">
            <div className="skeleton order-skeleton order-skeleton--party" />
            <div className="skeleton order-skeleton order-skeleton--meta" />
          </div>
          <div className="order-row__cell">
            <div className="skeleton order-skeleton order-skeleton--amount" />
            <div className="skeleton order-skeleton order-skeleton--meta" />
          </div>
          <div className="order-row__cell">
            <div className="skeleton order-skeleton order-skeleton--chip" />
            <div className="skeleton order-skeleton order-skeleton--meta" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function OrdersList({
  copy,
  language,
  orders,
  total,
  page,
  size,
  status,
  error,
  backTo,
  onRetry,
  onPrevPage,
  onNextPage,
}) {
  const pageCount = Math.max(1, Math.ceil((total || 0) / size))
  const isInitialLoading = status === 'loading' && orders.length === 0
  const isRefreshing = status === 'refreshing' && orders.length > 0

  if (isInitialLoading) {
    return (
      <div className="card order-table">
        <OrdersSkeleton />
      </div>
    )
  }

  if (error && orders.length === 0) {
    return (
      <div className="card offer-state offer-state--error">
        <div className="offer-state__title">{error}</div>
        <div className="offer-state__actions">
          <button type="button" className="btn btn--secondary" onClick={onRetry}>
            {copy.common.retry}
          </button>
        </div>
      </div>
    )
  }

  if (!orders.length) {
    return (
      <div className="card offer-empty order-empty">
        <div className="offer-empty__icon" aria-hidden="true">
          TX
        </div>
        <div className="offer-empty__title">{copy.empty.title}</div>
        <div className="offer-empty__subtitle">{copy.empty.subtitle}</div>
        <Link to="/market" className="btn btn--primary">
          {copy.empty.cta}
        </Link>
      </div>
    )
  }

  return (
    <div className="card order-table">
      <div className="order-table__header">
        <div>
          <div className="order-table__title">{copy.list.title}</div>
          <div className="order-table__subtitle">
            {copy.list.showingSummary(orders.length, total)}
          </div>
        </div>
        {isRefreshing ? (
          <div className="order-table__refresh">{copy.list.loadingRefresh}</div>
        ) : null}
      </div>

      {error ? <div className="error order-table__banner">{error}</div> : null}

      <div className="order-table__head">
        <div>{copy.list.columns.order}</div>
        <div>{copy.list.columns.counterparty}</div>
        <div>{copy.list.columns.summary}</div>
        <div>{copy.list.columns.status}</div>
      </div>

      <div className="order-table__body">
        {orders.map((order) => (
          <OrderListItem
            key={order?.publicId || order?.public_id || order?.id}
            copy={copy}
            language={language}
            order={order}
            backTo={backTo}
          />
        ))}
      </div>

      {pageCount > 1 ? (
        <div className="order-table__footer">
          <div className="order-table__page">
            {copy.common.page} {page + 1} {copy.common.of} {pageCount}
          </div>
          <div className="order-table__pager">
            <button
              type="button"
              className="btn btn--ghost"
              onClick={onPrevPage}
              disabled={page <= 0}
            >
              {copy.list.previous}
            </button>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={onNextPage}
              disabled={page + 1 >= pageCount}
            >
              {copy.list.next}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
