import {
  formatOrderDateTime,
  formatOrderMoney,
  formatOrderNumber,
  resolveOrderCounterparty,
  resolveOrderStatusLabel,
  resolveOrderStatusTone,
} from './orderPresentation'

function SummaryStat({ label, value }) {
  return (
    <div className="order-summary-card__stat">
      <div className="order-summary-card__stat-label">{label}</div>
      <div className="order-summary-card__stat-value">{value}</div>
    </div>
  )
}

export default function OrderSummaryCard({ copy, language, order }) {
  const currencyCode = order?.price?.currencyCode || order?.viewerCurrencyCode
  const totalAmount = order?.price?.totalAmount ?? order?.displayTotalAmount
  const unitAmount = order?.price?.unitAmount ?? order?.displayUnitPriceAmount
  const primaryDateLabel =
    order?.status === 'pending' && order?.expiresAt ? copy.details.expiresAt : copy.details.createdAt
  const primaryDateValue =
    order?.status === 'pending' && order?.expiresAt
      ? formatOrderDateTime(order.expiresAt, language)
      : formatOrderDateTime(order?.createdAt, language)

  return (
    <div className="card order-summary-card">
      <div className="order-summary-card__hero">
        <div className="order-summary-card__main">
          <div className="order-summary-card__eyebrow">{copy.details.summaryTitle}</div>
          <div className="order-summary-card__value">
            {formatOrderMoney(totalAmount, currencyCode, language)}
          </div>
          <p className="order-summary-card__subtitle">{copy.details.summarySubtitle}</p>
        </div>

        <div className="order-summary-card__status">
          <span className={`status-chip status-chip--${resolveOrderStatusTone(order?.status)}`}>
            {resolveOrderStatusLabel(order?.status, language)}
          </span>
        </div>
      </div>

      <div className="order-summary-card__stats">
        <SummaryStat
          label={copy.details.unitPrice}
          value={formatOrderMoney(unitAmount, currencyCode, language)}
        />
        <SummaryStat
          label={copy.details.quantity}
          value={formatOrderNumber(order?.orderedQuantity, language, 4)}
        />
        <SummaryStat
          label={copy.details.delivered}
          value={formatOrderNumber(order?.deliveredQuantity, language, 4)}
        />
        <SummaryStat
          label={copy.details.counterparty}
          value={resolveOrderCounterparty(order, language)}
        />
        <SummaryStat label={primaryDateLabel} value={primaryDateValue} />
        <SummaryStat
          label={copy.details.updatedAt}
          value={formatOrderDateTime(order?.updatedAt, language)}
        />
      </div>
    </div>
  )
}
