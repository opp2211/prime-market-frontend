import { Link } from 'react-router-dom'
import {
  formatOrderMoney,
  formatOrderNumber,
  isActiveOrderStatus,
  resolveOrderCounterparty,
  resolveOrderDisplayTitle,
  resolveOrderFilterLabel,
  resolveOrderListDate,
  resolveOrderRoleTone,
  resolveOrderRouteId,
  resolveOrderStatusDescription,
  resolveOrderStatusLabel,
  resolveOrderStatusTone,
} from './orderPresentation'

function buildRowClassName(order) {
  const status = (order?.status || '').toString().trim().toLowerCase()
  if (status === 'pending') return 'order-row order-row--attention'
  if (isActiveOrderStatus(status)) {
    return 'order-row order-row--active'
  }
  return 'order-row'
}

export default function OrderListItem({ copy, language, order, backTo }) {
  const routeId = resolveOrderRouteId(order)
  const counterparty = resolveOrderCounterparty(order, language)
  const dateMeta = resolveOrderListDate(order, language)
  const totalAmount = order?.displayTotalAmount ?? order?.price?.totalAmount
  const unitAmount = order?.displayUnitPriceAmount ?? order?.price?.unitAmount
  const currencyCode = order?.viewerCurrencyCode || order?.price?.currencyCode
  const statusTone = resolveOrderStatusTone(order?.status)
  const statusLabel = resolveOrderStatusLabel(order?.status, language)
  const statusDescription = resolveOrderStatusDescription(order?.status, language)
  const myRoleLabel = resolveOrderFilterLabel('role', order?.myRole, language)
  const counterpartyRoleLabel = resolveOrderFilterLabel(
    'role',
    order?.counterpartyRole,
    language
  )
  const rowContent = (
    <>
      <div className="order-row__cell order-row__cell--main">
        <div className="order-row__cell-label">{copy.list.columns.order}</div>
        <div className="order-row__title">{resolveOrderDisplayTitle(order, language)}</div>
        <div className="order-row__meta">
          <span>{order?.game?.title || copy.common.noValue}</span>
          <span className="order-row__dot" aria-hidden="true" />
          <span>{order?.category?.title || copy.common.noValue}</span>
          <span className={`offer-chip offer-chip--${resolveOrderRoleTone(order?.myRole)}`}>
            {myRoleLabel}
          </span>
        </div>
      </div>

      <div className="order-row__cell">
        <div className="order-row__cell-label">{copy.list.columns.counterparty}</div>
        <div className="order-row__party">{counterparty}</div>
        <div className="order-row__meta order-row__meta--compact">
          {counterpartyRoleLabel}
        </div>
      </div>

      <div className="order-row__cell">
        <div className="order-row__cell-label">{copy.list.columns.summary}</div>
        <div className="order-row__amount-value">
          {formatOrderMoney(totalAmount, currencyCode, language)}
        </div>
        <div className="order-row__meta order-row__meta--compact">
          <span>
            {copy.list.quantity}: {formatOrderNumber(order?.orderedQuantity, language, 4)}
          </span>
          <span className="order-row__dot" aria-hidden="true" />
          <span>
            {copy.list.delivered}: {formatOrderNumber(order?.deliveredQuantity, language, 4)}
          </span>
        </div>
        <div className="order-row__meta order-row__meta--compact">
          {copy.details.unitPrice}:{' '}
          {formatOrderMoney(unitAmount, currencyCode, language)}
        </div>
      </div>

      <div className="order-row__cell order-row__cell--status">
        <div className="order-row__cell-label">{copy.list.columns.status}</div>
        <span className={`status-chip status-chip--${statusTone}`}>{statusLabel}</span>
        <div className="order-row__status-note">{statusDescription}</div>
        <div className="order-row__date">
          {dateMeta.label}: {dateMeta.value}
        </div>
        {statusTone === 'warn' ? (
          <div className="order-row__attention">{copy.list.attention}</div>
        ) : null}
        <div className="order-row__open">{copy.list.open}</div>
      </div>
    </>
  )

  if (!routeId) {
    return <div className={buildRowClassName(order)}>{rowContent}</div>
  }

  return (
    <Link to={`/orders/${routeId}`} state={{ from: backTo }} className={buildRowClassName(order)}>
      {rowContent}
    </Link>
  )
}
