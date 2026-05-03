import MarketOfferRow from './MarketOfferRow'

function MarketTableSkeleton() {
  return (
    <div className="card market-table market-table--loading">
      <div className="market-table__header">
        <div>
          <div className="skeleton market-skeleton market-skeleton--title" />
          <div className="skeleton market-skeleton market-skeleton--subline" />
        </div>
      </div>
      <div className="market-table__body">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="market-row market-row--skeleton">
            <div className="market-row__seller">
              <div className="skeleton market-skeleton market-skeleton--avatar" />
              <div>
                <div className="skeleton market-skeleton market-skeleton--value" />
                <div className="skeleton market-skeleton market-skeleton--subline" />
              </div>
            </div>
            <div>
              <div className="skeleton market-skeleton market-skeleton--title" />
              <div className="skeleton market-skeleton market-skeleton--subline" />
            </div>
            <div className="skeleton market-skeleton market-skeleton--price" />
            <div className="market-row__limits">
              <div className="skeleton market-skeleton market-skeleton--value" />
              <div className="skeleton market-skeleton market-skeleton--value" />
            </div>
            <div className="skeleton market-skeleton market-skeleton--button" />
          </div>
        ))}
      </div>
    </div>
  )
}

function StateCard({ tone = 'default', title, text, actionLabel, onAction }) {
  return (
    <div className={`card offer-state market-state market-state--${tone}`}>
      <div className="market-state__mark" aria-hidden="true">
        P2P
      </div>
      <div>
        <div className="market-state__title">{title}</div>
        {text ? <div className="market-state__text">{text}</div> : null}
      </div>
      {actionLabel && onAction ? (
        <button type="button" className="btn btn--secondary" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}

export default function MarketOffersTable({
  copy,
  language,
  intent,
  viewerCurrencyCode,
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
  const listSubtitle = intent === 'sell' ? copy.list.subtitleSell : copy.list.subtitleBuy
  const shownTotal = total || offers.length

  if (blockedState === 'loading' || isInitialLoading) {
    return <MarketTableSkeleton />
  }

  if (blockedState === 'unsupported') {
    return (
      <StateCard
        tone="unsupported"
        title={copy.unsupportedCategoryTitle}
        text={copy.unsupportedCategoryText}
      />
    )
  }

  if (blockedState === 'blocked') {
    return (
      <StateCard
        title={copy.list.setupTitle}
        text={copy.list.setupText || copy.common.filtersUnavailable}
      />
    )
  }

  if (error && offers.length === 0) {
    return (
      <StateCard
        tone="error"
        title={error || copy.list.errorTitle}
        actionLabel={copy.common.retry}
        onAction={onRetry}
      />
    )
  }

  if (!offers.length) {
    return (
      <StateCard
        tone="empty"
        title={copy.list.noOffersTitle}
        text={copy.list.noOffersText}
      />
    )
  }

  return (
    <div className="card market-table">
      <div className="market-table__header">
        <div className="market-table__headline">
          <div className="market-table__title">{copy.list.title}</div>
          <div className="market-table__subtitle">{listSubtitle}</div>
        </div>

        <div className="market-table__tools">
          <span className="market-table__currency">{viewerCurrencyCode}</span>
          <span className="market-table__count">
            {offers.length} / {shownTotal} {copy.common.results}
          </span>
          {isRefreshing ? <strong>{copy.list.loadingRefresh}</strong> : null}
        </div>
      </div>

      {error ? <div className="error market-table__banner">{error}</div> : null}

      <div className="market-table__head">
        <div>{copy.list.columns.trader}</div>
        <div>{copy.list.columns.offer}</div>
        <div>{copy.list.columns.trade}</div>
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
