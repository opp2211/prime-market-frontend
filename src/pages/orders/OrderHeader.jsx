import { Link } from 'react-router-dom'
import {
  buildOrderSubtitle,
  formatOrderShortId,
  resolveOrderRoleLabel,
  resolveOrderRoleTone,
  resolveOrderRouteId,
  resolveOrderStatusLabel,
  resolveOrderStatusTone,
} from './orderPresentation'

function resolveOrderHeadline(order, language = 'ru') {
  const shortId = formatOrderShortId(resolveOrderRouteId(order))

  if (shortId) {
    return language === 'en' ? `Order ${shortId}` : `\u0421\u0434\u0435\u043b\u043a\u0430 ${shortId}`
  }

  return language === 'en'
    ? 'Order'
    : '\u0421\u0434\u0435\u043b\u043a\u0430'
}

function resolveOrderIntentLabel(role, language = 'ru') {
  const normalized = (role || '').toString().trim().toLowerCase()

  if (language === 'en') {
    if (normalized === 'buyer') return 'Buying'
    if (normalized === 'seller') return 'Selling'
  }

  if (normalized === 'buyer') return '\u041f\u043e\u043a\u0443\u043f\u043a\u0430'
  if (normalized === 'seller') return '\u041f\u0440\u043e\u0434\u0430\u0436\u0430'

  return resolveOrderRoleLabel(role, language)
}

export default function OrderHeader({
  copy,
  language,
  order,
  backTo,
  isRefreshing,
  backLabel,
  refreshLabel,
}) {
  const statusTone = resolveOrderStatusTone(order?.status)
  const orderRouteId = resolveOrderRouteId(order)
  const shortOrderId = formatOrderShortId(orderRouteId)
  const title = resolveOrderHeadline(order, language)

  return (
    <div className="card order-header">
      <div className="order-header__top">
        <div className="order-header__main">
          <Link to={backTo} className="offer-back-link order-header__back">
            <span aria-hidden="true">\u2190</span>
            <span>{backLabel || copy.details.back}</span>
          </Link>

          <div className="order-header__title-row">
            <div>
              <h1
                className="h1 order-header__title"
                title={orderRouteId || undefined}
              >
                {title}
              </h1>
            </div>
          </div>

          <p className="order-header__subtitle">{buildOrderSubtitle(order, language)}</p>
        </div>

        <div className="order-header__status">
          <span className={`status-chip status-chip--${statusTone}`}>
            {resolveOrderStatusLabel(order?.status, language)}
          </span>
          {isRefreshing ? (
            <span className="order-refresh-badge">
              {refreshLabel || copy.details.refreshing}
            </span>
          ) : null}
        </div>
      </div>

      <div className="order-header__meta">
        <span className={`offer-chip offer-chip--${resolveOrderRoleTone(order?.myRole)}`}>
          {resolveOrderIntentLabel(order?.myRole, language)}
        </span>
        {shortOrderId ? (
          <span
            className="order-meta-pill order-meta-pill--id"
            title={orderRouteId || undefined}
            aria-label={`${copy.details.orderId}: ${orderRouteId}`}
          >
            {copy.details.orderId} {shortOrderId}
          </span>
        ) : null}
      </div>
    </div>
  )
}
