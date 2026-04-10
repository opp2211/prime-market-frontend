import MarketOfferRow from './MarketOfferRow'

function MarketTableSkeleton() {
  return (
    <div className="market-table__body">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="market-row market-row--skeleton">
          <div className="market-row__main">
            <div className="skeleton market-skeleton market-skeleton--title" />
            <div className="skeleton market-skeleton market-skeleton--subline" />
            <div className="market-row__meta-grid">
              {Array.from({ length: 6 }).map((__, itemIndex) => (
                <div key={itemIndex} className="market-row__meta-item">
                  <div className="skeleton market-skeleton market-skeleton--label" />
                  <div className="skeleton market-skeleton market-skeleton--value" />
                </div>
              ))}
            </div>
          </div>
          <div className="market-row__action">
            <div className="skeleton market-skeleton market-skeleton--button" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function MarketOffersTable({
  copy,
  language,
  offers,
  total,
  page,
  size,
  status,
  error,
  blockedState,
  onRetry,
  onOpenOffer,
  openingOfferId,
  onPrevPage,
  onNextPage,
}) {
  const pageCount = Math.max(1, Math.ceil((total || 0) / size))
  const isInitialLoading = status === 'loading' && offers.length === 0
  const isRefreshing = status === 'refreshing' && offers.length > 0

  if (blockedState === 'loading' || isInitialLoading) {
    return (
      <div className="card market-table">
        <MarketTableSkeleton />
      </div>
    )
  }

  if (blockedState === 'unsupported') {
    return (
      <div className="card offer-empty market-empty">
        <div className="offer-empty__icon" aria-hidden="true">
          FX
        </div>
        <div className="offer-empty__title">{copy.unsupportedCategoryTitle}</div>
        <div className="offer-empty__subtitle">{copy.unsupportedCategoryText}</div>
      </div>
    )
  }

  if (blockedState === 'blocked') {
    return (
      <div className="card offer-state">
        <div className="offer-state__title">{copy.common.filtersUnavailable}</div>
      </div>
    )
  }

  if (error && offers.length === 0) {
    return (
      <div className="card offer-state offer-state--error">
        <div className="offer-state__title">{error || copy.list.errorTitle}</div>
        <div className="offer-state__actions">
          <button type="button" className="btn btn--secondary" onClick={onRetry}>
            {copy.common.retry}
          </button>
        </div>
      </div>
    )
  }

  if (!offers.length) {
    return (
      <div className="card offer-empty market-empty">
        <div className="offer-empty__icon" aria-hidden="true">
          FX
        </div>
        <div className="offer-empty__title">{copy.list.noOffersTitle}</div>
        <div className="offer-empty__subtitle">{copy.list.noOffersText}</div>
      </div>
    )
  }

  return (
    <div className="card market-table">
      <div className="market-table__header">
        <div>
          <div className="market-table__title">{copy.list.title}</div>
          <div className="market-table__subtitle">
            {copy.list.showing} {offers.length} / {total} {copy.common.results}
          </div>
        </div>
        {isRefreshing ? <div className="market-table__refresh">{copy.list.loadingRefresh}</div> : null}
      </div>

      {error ? <div className="error market-table__banner">{error}</div> : null}

      <div className="market-table__head">
        <div>{copy.list.columns.offer}</div>
        <div>{copy.list.columns.action}</div>
      </div>

      <div className="market-table__body">
        {offers.map((offer) => (
          <MarketOfferRow
            key={offer?.id}
            copy={copy}
            language={language}
            offer={offer}
            onOpen={onOpenOffer}
            isOpening={openingOfferId === offer?.id}
          />
        ))}
      </div>

      <div className="market-table__footer">
        <div className="market-table__page">
          {copy.common.page} {page + 1} {copy.common.of} {pageCount}
        </div>
        <div className="market-table__pager">
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
    </div>
  )
}
