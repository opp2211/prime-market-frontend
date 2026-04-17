import { Link } from 'react-router-dom'
import {
  buildOrderSubtitle,
  resolveOrderDisplayTitle,
  resolveOrderRoleLabel,
  resolveOrderRoleTone,
  resolveOrderRouteId,
  resolveOrderStatusLabel,
  resolveOrderStatusTone,
} from './orderPresentation'

export default function OrderHeader({ copy, language, order, backTo, isRefreshing }) {
  const statusTone = resolveOrderStatusTone(order?.status)

  return (
    <div className="card order-header">
      <div className="order-header__top">
        <div className="order-header__main">
          <Link to={backTo} className="offer-back-link order-header__back">
            <span aria-hidden="true">\u2190</span>
            <span>{copy.details.back}</span>
          </Link>

          <div className="order-header__title-row">
            <div>
              <div className="order-header__eyebrow">{copy.navLabel}</div>
              <h1 className="h1 order-header__title">
                {resolveOrderDisplayTitle(order, language)}
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
            <span className="order-refresh-badge">{copy.details.refreshing}</span>
          ) : null}
        </div>
      </div>

      <div className="order-header__meta">
        <span className={`offer-chip offer-chip--${resolveOrderRoleTone(order?.myRole)}`}>
          {resolveOrderRoleLabel(order?.myRole, language)}
        </span>
        <span className="order-meta-pill">
          {copy.details.orderId}: {resolveOrderRouteId(order)}
        </span>
      </div>
    </div>
  )
}
