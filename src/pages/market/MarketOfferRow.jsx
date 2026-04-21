import {
  buildAttributeSummary,
  buildContextSummary,
  buildDeliveryMethodsSummary,
  buildMarketOfferTitle,
  formatMarketDate,
  formatMarketNumber,
  formatMarketPrice,
  resolveMarketActionLabel,
  resolveMarketSideLabel,
} from './marketPresentation'

function getTraderInitial(username, fallback) {
  return (username || fallback || 'T').toString().trim().slice(0, 1).toUpperCase() || 'T'
}

function DetailLine({ label, value }) {
  return (
    <span className="market-row__detail">
      <span>{label}</span>
      <strong>{value}</strong>
    </span>
  )
}

export default function MarketOfferRow({ copy, language, offer, onOpen, isOpening = false }) {
  const username = offer?.owner?.username || copy.common.noValue
  const context = buildContextSummary(offer, copy.common.noValue)
  const attributes = buildAttributeSummary(offer, copy.common.noValue)
  const delivery = buildDeliveryMethodsSummary(offer, copy.common.noValue)
  const quantity = formatMarketNumber(offer?.quantity, language)
  const minTradeQuantity = formatMarketNumber(offer?.minTradeQuantity, language)
  const maxTradeQuantity = formatMarketNumber(offer?.maxTradeQuantity, language)
  const quantityStep = formatMarketNumber(offer?.quantityStep, language)

  return (
    <article className="market-row">
      <div className="market-row__seller">
        <span className="market-row__avatar" aria-hidden="true">
          {getTraderInitial(username, copy.list.owner)}
        </span>
        <span className="market-row__seller-body">
          <span className="market-row__owner">{username}</span>
          <span className="market-row__published">
            {formatMarketDate(offer?.publishedAt, language)}
          </span>
        </span>
      </div>

      <div className="market-row__offer">
        <div className="market-row__title">{buildMarketOfferTitle(offer, copy)}</div>
        <div className="market-row__tags">
          <span className="offer-chip offer-chip--info">
            {resolveMarketSideLabel(offer?.side, copy)}
          </span>
          <span className="market-row__tag">{context}</span>
          <span className="market-row__tag">{attributes}</span>
          <span className="market-row__tag">{delivery}</span>
        </div>
      </div>

      <div className="market-row__trade">
        <div className="market-row__price-block">
          <span className="market-row__mobile-label">{copy.list.columns.price}</span>
          <div className="market-row__price">
            {formatMarketPrice(offer?.price?.amount, offer?.price?.currencyCode, language)}
          </div>
          <div className="market-row__rate">
            {copy.list.rate}: {formatMarketNumber(offer?.price?.rate, language, 8)}
          </div>
        </div>

        <div className="market-row__limits">
          <DetailLine label={copy.list.quantity} value={quantity} />
          <DetailLine label={copy.list.limits} value={`${minTradeQuantity} - ${maxTradeQuantity}`} />
          <DetailLine label={copy.list.step} value={quantityStep} />
        </div>
      </div>

      <div className="market-row__action">
        <button
          type="button"
          className="btn btn--primary market-row__cta"
          onClick={() => onOpen(offer)}
          disabled={isOpening}
        >
          {isOpening ? copy.common.loading : resolveMarketActionLabel(offer?.action, copy)}
        </button>
      </div>
    </article>
  )
}
