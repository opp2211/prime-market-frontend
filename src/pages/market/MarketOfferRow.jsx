import {
  buildContextSummary,
  buildDeliveryMethodsSummary,
  buildMarketOfferTitle,
  formatMarketDate,
  formatMarketNumber,
  formatMarketPrice,
  resolveMarketActionLabel,
  resolveMarketSideLabel,
} from './marketPresentation'

function MetaItem({ label, value }) {
  return (
    <div className="market-row__meta-item">
      <span className="market-row__meta-label">{label}</span>
      <span className="market-row__meta-value">{value}</span>
    </div>
  )
}

export default function MarketOfferRow({ copy, language, offer, onOpen }) {
  return (
    <div className="market-row">
      <div className="market-row__main">
        <div className="market-row__topline">
          <div className="market-row__title-wrap">
            <div className="market-row__title">{buildMarketOfferTitle(offer, copy)}</div>
            <div className="market-row__subline">
              <span className="market-row__owner">
                {copy.list.owner}: {offer?.owner?.username || copy.common.noValue}
              </span>
              <span className="offer-chip offer-chip--info">
                {resolveMarketSideLabel(offer?.side, copy)}
              </span>
            </div>
          </div>

          <div className="market-row__price-block">
            <div className="market-row__price">
              {formatMarketPrice(offer?.price?.amount, offer?.price?.currencyCode, language)}
            </div>
            <div className="market-row__rate">
              {copy.list.rate}: {formatMarketNumber(offer?.price?.rate, language, 8)}
            </div>
          </div>
        </div>

        <div className="market-row__meta-grid">
          <MetaItem
            label={copy.list.quantity}
            value={formatMarketNumber(offer?.quantity, language)}
          />
          <MetaItem
            label={copy.list.limits}
            value={`${formatMarketNumber(offer?.minTradeQuantity, language)} – ${formatMarketNumber(offer?.maxTradeQuantity, language)}`}
          />
          <MetaItem
            label={copy.list.step}
            value={formatMarketNumber(offer?.quantityStep, language)}
          />
          <MetaItem
            label={copy.list.context}
            value={buildContextSummary(offer, copy.common.noValue)}
          />
          <MetaItem
            label={copy.list.delivery}
            value={buildDeliveryMethodsSummary(offer, copy.common.noValue)}
          />
          <MetaItem
            label={copy.list.published}
            value={formatMarketDate(offer?.publishedAt, language)}
          />
        </div>
      </div>

      <div className="market-row__action">
        <button
          type="button"
          className="btn btn--primary market-row__cta"
          onClick={() => onOpen(offer)}
        >
          {resolveMarketActionLabel(offer?.action, copy)}
        </button>
      </div>
    </div>
  )
}
