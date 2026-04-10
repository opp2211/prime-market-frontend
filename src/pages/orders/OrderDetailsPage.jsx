import { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import {
  cancelOrder,
  confirmOrderReady,
  confirmReceived,
  getOrder,
  markDelivered,
  markPartiallyDelivered,
} from '../../api/orders'
import { useI18n } from '../../app/i18n'
import { getErrorMessage } from '../../shared/lib/errors'
import OrderActionsPanel from './OrderActionsPanel'
import { getOrderCopy } from './orderCopy'
import OrderTimeline from './OrderTimeline'
import OrderHeader from './OrderHeader'
import {
  buildOrderTagItems,
  formatOrderDateTime,
  formatOrderMoney,
  formatOrderNumber,
  hasSellerFinance,
  resolveOrderDeliveryMetrics,
  resolveOrderCounterparty,
  resolveOrderFilterLabel,
  resolveOrderRouteId,
  resolveOrderStatusLabel,
  resolveOrderStatusTone,
} from './orderPresentation'
import OrderSummaryCard from './OrderSummaryCard'

function OrderField({ label, value }) {
  return (
    <div className="order-field">
      <div className="order-field__label">{label}</div>
      <div className="order-field__value">{value}</div>
    </div>
  )
}

function OrderTags({ items, emptyLabel }) {
  if (!items.length) {
    return <div className="muted">{emptyLabel}</div>
  }

  return (
    <div className="order-tag-list">
      {items.map((item) => (
        <span key={item} className="order-tag">
          {item}
        </span>
      ))}
    </div>
  )
}

function OrderTextSection({ value, emptyLabel }) {
  if (!value) {
    return <div className="muted">{emptyLabel}</div>
  }

  return <div className="order-text-block">{value}</div>
}

function OrderSection({ title, description, children }) {
  return (
    <section className="card order-section">
      <div className="order-section__head">
        <h2 className="order-section__title">{title}</h2>
        <p className="order-section__description">{description}</p>
      </div>
      <div className="order-section__body">{children}</div>
    </section>
  )
}

function OrderProgressStat({ label, value }) {
  return (
    <div className="order-progress__stat">
      <div className="order-progress__stat-label">{label}</div>
      <div className="order-progress__stat-value">{value}</div>
    </div>
  )
}

function OrderDeliveryProgressSection({ copy, language, order }) {
  const metrics = resolveOrderDeliveryMetrics(order)
  const status = (order?.status || '').toString().trim().toLowerCase()
  const myRole = (order?.myRole || '').toString().trim().toLowerCase()
  const statusTone = resolveOrderStatusTone(order?.status)
  const orderedLabel = formatOrderNumber(metrics.orderedQuantity, language, 4)
  const deliveredLabel = formatOrderNumber(metrics.displayDeliveredQuantity, language, 4)
  const remainingLabel = formatOrderNumber(metrics.remainingQuantity, language, 4)
  const completionLabel = formatOrderNumber(metrics.progressPercent, language, 0)

  let helperText =
    myRole === 'seller'
      ? copy.details.progress.sellerReported(deliveredLabel, orderedLabel)
      : copy.details.progress.buyerReported(deliveredLabel, orderedLabel)

  if (status === 'delivered') {
    helperText =
      myRole === 'seller'
        ? copy.details.progress.sellerDelivered
        : copy.details.progress.buyerDelivered
  }

  if (status === 'completed') {
    helperText =
      myRole === 'seller'
        ? copy.details.progress.sellerCompleted
        : copy.details.progress.buyerCompleted
  }

  return (
    <OrderSection
      title={copy.details.progress.title}
      description={copy.details.progress.description}
    >
      <div className="order-progress">
        <div className="order-progress__summary">
          <div className="order-progress__summary-main">
            <div className="order-progress__eyebrow">{copy.details.progress.title}</div>
            <div className="order-progress__value">
              {copy.details.progress.deliveredOfTotal(deliveredLabel, orderedLabel)}
            </div>
            <p className="order-progress__helper">{helperText}</p>
          </div>

          <div className="order-progress__summary-side">
            <span className={`status-chip status-chip--${statusTone}`}>
              {resolveOrderStatusLabel(order?.status, language)}
            </span>
            <div className="order-progress__completion">
              {copy.details.progress.completionLabel(completionLabel)}
            </div>
          </div>
        </div>

        <div
          className="order-progress__meter"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={metrics.progressPercent}
          aria-label={copy.details.progress.title}
        >
          <div
            className={`order-progress__meter-fill order-progress__meter-fill--${statusTone}`}
            style={{ width: `${Math.max(0, Math.min(metrics.progressPercent, 100))}%` }}
          />
        </div>

        <div className="order-progress__stats">
          <OrderProgressStat
            label={copy.details.fields.orderedQuantity}
            value={orderedLabel}
          />
          <OrderProgressStat
            label={copy.details.fields.deliveredQuantity}
            value={deliveredLabel}
          />
          <OrderProgressStat
            label={copy.details.fields.remainingQuantity}
            value={remainingLabel}
          />
          <OrderProgressStat
            label={copy.details.fields.completion}
            value={copy.details.progress.completionLabel(completionLabel)}
          />
        </div>
      </div>
    </OrderSection>
  )
}

function OrderDetailsSkeleton() {
  return (
    <div className="order-page">
      <div className="card order-header order-header--skeleton">
        <div className="skeleton order-skeleton order-skeleton--eyebrow" />
        <div className="skeleton order-skeleton order-skeleton--hero-title" />
        <div className="skeleton order-skeleton order-skeleton--hero-subtitle" />
      </div>

      <div className="order-layout">
        <div className="order-layout__main">
          <div className="card order-summary-card">
            <div className="skeleton order-skeleton order-skeleton--summary-value" />
            <div className="order-summary-card__stats">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="skeleton order-skeleton order-skeleton--summary-stat"
                />
              ))}
            </div>
          </div>

          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="card order-section">
              <div className="skeleton order-skeleton order-skeleton--section-title" />
              <div className="order-section__body">
                <div className="skeleton order-skeleton order-skeleton--section-block" />
                <div className="skeleton order-skeleton order-skeleton--section-block" />
              </div>
            </div>
          ))}
        </div>

        <div className="order-layout__aside">
          <div className="card order-actions">
            <div className="skeleton order-skeleton order-skeleton--section-title" />
            <div className="skeleton order-skeleton order-skeleton--button" />
            <div className="skeleton order-skeleton order-skeleton--button" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OrderDetailsPage() {
  const { orderId } = useParams()
  const location = useLocation()
  const { language } = useI18n()
  const copy = getOrderCopy(language)

  const [order, setOrder] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [actionState, setActionState] = useState('idle')
  const [actionMessage, setActionMessage] = useState({
    scope: '',
    tone: '',
    text: '',
  })

  useEffect(() => {
    setError('')
    setActionState('idle')
    setActionMessage({
      scope: '',
      tone: '',
      text: '',
    })
  }, [orderId])

  useEffect(() => {
    let active = true

    const loadOrder = async () => {
      setStatus((current) => (current === 'ready' || current === 'refreshing' ? 'refreshing' : 'loading'))
      setError('')

      try {
        const response = await getOrder(orderId)
        if (!active) return
        setOrder(response?.data || null)
        setStatus('ready')
      } catch (err) {
        if (!active) return
        const nextError = getErrorMessage(err, copy.errors.details)
        setError(nextError)
        setStatus((current) => (current === 'refreshing' || current === 'ready' ? 'ready' : 'error'))
      }
    }

    if (orderId) {
      loadOrder()
    } else {
      setStatus('error')
      setError(copy.errors.details)
    }

    return () => {
      active = false
    }
  }, [copy.errors.details, orderId, reloadKey])

  async function handleAction({ actionName, actionFn, successMessage, successScope = actionName }) {
    if (actionState !== 'idle' || !orderId) return false

    setActionState(actionName)
    setActionMessage({
      scope: '',
      tone: '',
      text: '',
    })

    try {
      const response = await actionFn(orderId)
      if (response?.data && typeof response.data === 'object') {
        setOrder(response.data)
      }
      setActionMessage({
        scope: successScope,
        tone: 'success',
        text: successMessage,
      })
      setReloadKey((value) => value + 1)
      return true
    } catch (err) {
      setActionMessage({
        scope: successScope,
        tone: 'error',
        text: getErrorMessage(err, copy.errors.action),
      })
      return false
    } finally {
      setActionState('idle')
    }
  }

  if (status === 'loading' && !order) {
    return <OrderDetailsSkeleton />
  }

  if (status === 'error' && !order) {
    return (
      <div className="order-page">
        <div className="card offer-state offer-state--error">
          <div className="offer-state__title">{error}</div>
          <div className="offer-state__actions">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => setReloadKey((value) => value + 1)}
            >
              {copy.common.retry}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return null
  }

  const currencyCode = order?.price?.currencyCode || order?.viewerCurrencyCode
  const backTo = typeof location.state?.from === 'string' ? location.state.from : '/my-orders'
  const isRefreshing = status === 'refreshing'
  const contextItems = buildOrderTagItems(order?.contexts, 'valueTitle', 'valueSlug')
  const attributeItems = buildOrderTagItems(order?.attributes, 'optionTitle', 'optionSlug')
  const deliveryItems = buildOrderTagItems(order?.deliveryMethods, 'title', 'slug')
  const showFinance = hasSellerFinance(order)

  return (
    <div className="order-page">
      {error ? <div className="error">{error}</div> : null}

      <OrderHeader
        copy={copy}
        language={language}
        order={order}
        backTo={backTo}
        isRefreshing={isRefreshing}
      />

      <div className="order-layout">
        <div className="order-layout__main">
          <OrderSummaryCard copy={copy} language={language} order={order} />
          <OrderDeliveryProgressSection copy={copy} language={language} order={order} />

          <OrderSection
            title={copy.details.sections.overview}
            description={copy.details.sections.overviewText}
          >
            <div className="order-field-grid order-field-grid--3">
              <OrderField
                label={copy.details.fields.game}
                value={order?.game?.title || copy.common.noValue}
              />
              <OrderField
                label={copy.details.fields.category}
                value={order?.category?.title || copy.common.noValue}
              />
              <OrderField
                label={copy.details.fields.counterparty}
                value={resolveOrderCounterparty(order, language)}
              />
              <OrderField
                label={copy.details.fields.myRole}
                value={resolveOrderFilterLabel('role', order?.myRole, language)}
              />
              <OrderField
                label={copy.details.fields.counterpartyRole}
                value={resolveOrderFilterLabel('role', order?.counterpartyRole, language)}
              />
              <OrderField label={copy.details.orderId} value={resolveOrderRouteId(order)} />
              <OrderField
                label={copy.details.fields.createdAt}
                value={formatOrderDateTime(order?.createdAt, language)}
              />
              <OrderField
                label={copy.details.fields.updatedAt}
                value={formatOrderDateTime(order?.updatedAt, language)}
              />
              <OrderField
                label={copy.details.fields.expiresAt}
                value={formatOrderDateTime(order?.expiresAt, language)}
              />
            </div>
          </OrderSection>

          <OrderSection
            title={copy.details.sections.conditions}
            description={copy.details.sections.conditionsText}
          >
            <div className="order-field-grid order-field-grid--3">
              <OrderField
                label={copy.details.fields.orderedQuantity}
                value={formatOrderNumber(order?.orderedQuantity, language, 4)}
              />
              <OrderField
                label={copy.details.fields.deliveredQuantity}
                value={formatOrderNumber(order?.deliveredQuantity, language, 4)}
              />
              <OrderField
                label={copy.details.fields.unitPrice}
                value={formatOrderMoney(order?.price?.unitAmount, currencyCode, language)}
              />
              <OrderField
                label={copy.details.fields.totalAmount}
                value={formatOrderMoney(order?.price?.totalAmount, currencyCode, language)}
              />
              <OrderField
                label={copy.details.fields.currency}
                value={currencyCode || copy.common.noValue}
              />
            </div>
          </OrderSection>

          <OrderSection
            title={copy.details.sections.item}
            description={copy.details.sections.itemText}
          >
            <div className="order-field-grid order-field-grid--2">
              <div className="order-field order-field--stacked">
                <div className="order-field__label">{copy.details.fields.contexts}</div>
                <OrderTags items={contextItems} emptyLabel={copy.details.emptyText} />
              </div>
              <div className="order-field order-field--stacked">
                <div className="order-field__label">{copy.details.fields.attributes}</div>
                <OrderTags items={attributeItems} emptyLabel={copy.details.emptyText} />
              </div>
            </div>
          </OrderSection>

          <OrderSection
            title={copy.details.sections.delivery}
            description={copy.details.sections.deliveryText}
          >
            <OrderTags items={deliveryItems} emptyLabel={copy.details.emptyText} />
          </OrderSection>

          <OrderSection
            title={copy.details.sections.terms}
            description={copy.details.sections.termsText}
          >
            <OrderTextSection value={order?.tradeTerms} emptyLabel={copy.details.emptyText} />
          </OrderSection>

          <OrderSection
            title={copy.details.sections.description}
            description={copy.details.sections.descriptionText}
          >
            <OrderTextSection value={order?.description} emptyLabel={copy.details.emptyText} />
          </OrderSection>

          {showFinance ? (
            <OrderSection
              title={copy.details.sections.finance}
              description={copy.details.sections.financeText}
            >
              <div className="order-field-grid order-field-grid--3">
                <OrderField
                  label={copy.details.fields.gross}
                  value={formatOrderMoney(order?.sellerGrossAmount, currencyCode, language)}
                />
                <OrderField
                  label={copy.details.fields.fee}
                  value={formatOrderMoney(order?.sellerFeeAmount, currencyCode, language)}
                />
                <OrderField
                  label={copy.details.fields.net}
                  value={formatOrderMoney(order?.sellerNetAmount, currencyCode, language)}
                />
              </div>
            </OrderSection>
          ) : null}

          <OrderTimeline
            orderId={orderId}
            order={order}
            copy={copy}
            language={language}
            refreshKey={reloadKey}
          />
        </div>

        <aside className="order-layout__aside">
          <OrderActionsPanel
            key={`${resolveOrderRouteId(order)}-${order?.status || 'unknown'}-${order?.deliveredQuantity ?? 'none'}-${order?.updatedAt || 'na'}`}
            copy={copy}
            language={language}
            order={order}
            actionState={actionState}
            actionMessage={actionMessage}
            isRefreshing={isRefreshing}
            onConfirmReady={() =>
              handleAction({
                actionName: 'confirm-ready',
                actionFn: confirmOrderReady,
                successMessage: copy.success.confirmReady,
              })
            }
            onConfirmCancel={() =>
              handleAction({
                actionName: 'cancel',
                actionFn: cancelOrder,
                successMessage: copy.success.cancel,
              })
            }
            onMarkPartiallyDelivered={(deliveredQuantity) =>
              handleAction({
                actionName: 'partial-delivery',
                actionFn: (nextOrderId) =>
                  markPartiallyDelivered(nextOrderId, deliveredQuantity),
                successMessage: copy.success.partialDelivery,
              })
            }
            onMarkDelivered={() =>
              handleAction({
                actionName: 'mark-delivered',
                actionFn: markDelivered,
                successMessage: copy.success.markDelivered,
              })
            }
            onConfirmReceived={() =>
              handleAction({
                actionName: 'confirm-received',
                actionFn: confirmReceived,
                successMessage: copy.success.confirmReceived,
              })
            }
          />
        </aside>
      </div>
    </div>
  )
}
