import { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import {
  approveOrderRequest,
  cancelOrder,
  confirmOrderReady,
  confirmReceived,
  getOrder,
  markDelivered,
  markPartiallyDelivered,
  rejectOrderRequest,
  requestAmendQuantity,
  requestCancel,
} from '../../api/orders'
import { createOrderDispute } from '../../api/orderDisputes'
import { useI18n } from '../../app/i18n'
import { getErrorMessage } from '../../shared/lib/errors'
import OrderActionsPanel from './OrderActionsPanel'
import OrderDisputePanel from './OrderDisputePanel'
import { getOrderCopy } from './orderCopy'
import OrderPendingRequestsBlock from './OrderPendingRequestsBlock'
import OrderTimeline from './OrderTimeline'
import OrderChatsSection from './OrderChatsSection'
import OrderHeader from './OrderHeader'
import useOrderLiveRefresh from './useOrderLiveRefresh'
import {
  buildOrderTagItems,
  formatOrderDateTime,
  formatOrderNumber,
  getFinancialDetailRows,
  getFinancialMetaRows,
  getFinancialPrimary,
  resolveOrderDeliveryMetrics,
  resolveOrderCounterparty,
  resolveOrderFilterLabel,
  resolveOrderRouteId,
  resolveOrderStatusLabel,
  resolveOrderStatusTone,
} from './orderPresentation'

const ORDER_WORKSPACE_COPY = {
  ru: {
    actionsBodyTitle: '\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044f',
    actionsBodyText:
      '\u0414\u043e\u0441\u0442\u0443\u043f\u043d\u044b\u0435 \u0448\u0430\u0433\u0438 \u0434\u043b\u044f \u0442\u0435\u043a\u0443\u0449\u0435\u0439 \u0441\u0442\u0430\u0434\u0438\u0438 \u0441\u0434\u0435\u043b\u043a\u0438.',
    details: {
      commercial: '\u0420\u0430\u0441\u0447\u0435\u0442\u044b',
      item: '\u041b\u043e\u0442 \u0438 \u043f\u0435\u0440\u0435\u0434\u0430\u0447\u0430',
      parties: '\u0421\u0442\u043e\u0440\u043e\u043d\u044b \u0438 \u0441\u0440\u043e\u043a\u0438',
      texts: '\u0423\u0441\u043b\u043e\u0432\u0438\u044f \u0438 \u043e\u043f\u0438\u0441\u0430\u043d\u0438\u0435',
    },
    tabs: {
      chat: '\u0427\u0430\u0442',
      details: '\u0414\u0435\u0442\u0430\u043b\u0438',
      history: '\u0418\u0441\u0442\u043e\u0440\u0438\u044f',
      support: '\u041f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0430',
    },
    tabsAria: '\u0420\u0430\u0431\u043e\u0447\u0438\u0435 \u0432\u043a\u043b\u0430\u0434\u043a\u0438 \u0441\u0434\u0435\u043b\u043a\u0438',
  },
  en: {
    actionsBodyTitle: 'Actions',
    actionsBodyText: 'Available steps for the current deal stage.',
    details: {
      commercial: 'Commercials',
      item: 'Item and handoff',
      parties: 'Parties and dates',
      texts: 'Terms and description',
    },
    tabs: {
      chat: 'Chat',
      details: 'Details',
      history: 'History',
      support: 'Support',
    },
    tabsAria: 'Order workspace tabs',
  },
}

function getOrderWorkspaceCopy(language = 'ru') {
  return ORDER_WORKSPACE_COPY[language] || ORDER_WORKSPACE_COPY.ru
}

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

function OrderSummaryRailCard({ copy, language, order }) {
  const financialPrimary = getFinancialPrimary(order, language)
  const financialMetaRows = getFinancialMetaRows(order, language)
  const visibleRows = [
    ...financialMetaRows,
    {
      key: 'counterparty',
      label: copy.details.counterparty,
      value: resolveOrderCounterparty(order, language),
    },
    {
      key: 'updatedAt',
      label: copy.details.updatedAt,
      value: formatOrderDateTime(order?.updatedAt, language),
    },
  ]

  return (
    <section className="card order-command-card order-command-card--overview">
      <div className="order-command-card__head">
        <h2 className="order-command-card__title">{copy.details.summaryTitle}</h2>
      </div>

      <div className="order-overview-amount">
        <div className="order-overview-amount__label">
          {financialPrimary.label}
        </div>
        <div className="order-overview-amount__value">{financialPrimary.value}</div>
      </div>

      <div className="order-overview-metrics">
        {visibleRows.map((row) => (
          <div key={row.key} className="order-overview-metric">
            <div className="order-overview-metric__label">{row.label}</div>
            <div className="order-overview-metric__value">{row.value}</div>
          </div>
        ))}
      </div>

      <OrderDeliveryProgressSection copy={copy} language={language} order={order} />
    </section>
  )
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

function OrderDeliveryProgressSection({ copy, language, order }) {
  const metrics = resolveOrderDeliveryMetrics(order)
  const status = (order?.status || '').toString().trim().toLowerCase()
  const myRole = (order?.myRole || '').toString().trim().toLowerCase()
  const statusTone = resolveOrderStatusTone(order?.status)
  const orderedLabel = formatOrderNumber(metrics.orderedQuantity, language, 4)
  const deliveredLabel = formatOrderNumber(metrics.displayDeliveredQuantity, language, 4)
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
    <section className="order-progress-inline">
      <div className="order-progress order-progress--compact">
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
      </div>
    </section>
  )
}

function OrderWorkspaceTabButton({ activeTab, tabId, label, onSelect }) {
  const isActive = activeTab === tabId

  return (
    <button
      type="button"
      className={`order-workspace-tab${isActive ? ' is-active' : ''}`}
      role="tab"
      aria-selected={isActive}
      tabIndex={isActive ? 0 : -1}
      onClick={() => onSelect(tabId)}
    >
      {label}
    </button>
  )
}

function OrderDetailsGroup({ title, children }) {
  return (
    <section className="order-details-group">
      <h3 className="order-details-group__title">{title}</h3>
      <div className="order-details-group__body">{children}</div>
    </section>
  )
}

function OrderWorkspaceDetailsTab({
  copy,
  workspaceCopy,
  language,
  order,
  contextItems,
  attributeItems,
  deliveryItems,
}) {
  const financialDetailRows = getFinancialDetailRows(order, language)

  return (
    <div className="order-workspace-details">
      <OrderDetailsGroup title={workspaceCopy.details.commercial}>
        <div className="order-field-grid order-field-grid--3">
          <OrderField
            label={copy.details.fields.orderedQuantity}
            value={formatOrderNumber(order?.orderedQuantity, language, 4)}
          />
          <OrderField
            label={copy.details.fields.deliveredQuantity}
            value={formatOrderNumber(order?.deliveredQuantity, language, 4)}
          />
          {financialDetailRows.map((row) => (
            <OrderField key={row.key} label={row.label} value={row.value} />
          ))}
        </div>
      </OrderDetailsGroup>

      <OrderDetailsGroup title={workspaceCopy.details.item}>
        <div className="order-field-grid order-field-grid--2">
          <OrderField
            label={copy.details.fields.game}
            value={order?.game?.title || copy.common.noValue}
          />
          <OrderField
            label={copy.details.fields.category}
            value={order?.category?.title || copy.common.noValue}
          />
          <div className="order-field order-field--stacked">
            <div className="order-field__label">{copy.details.fields.contexts}</div>
            <OrderTags items={contextItems} emptyLabel={copy.details.emptyText} />
          </div>
          <div className="order-field order-field--stacked">
            <div className="order-field__label">{copy.details.fields.attributes}</div>
            <OrderTags items={attributeItems} emptyLabel={copy.details.emptyText} />
          </div>
          <div className="order-field order-field--stacked order-field--wide">
            <div className="order-field__label">{copy.details.fields.deliveryMethods}</div>
            <OrderTags items={deliveryItems} emptyLabel={copy.details.emptyText} />
          </div>
        </div>
      </OrderDetailsGroup>

      <OrderDetailsGroup title={workspaceCopy.details.parties}>
        <div className="order-field-grid order-field-grid--3">
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
      </OrderDetailsGroup>

      <OrderDetailsGroup title={workspaceCopy.details.texts}>
        <div className="order-details-text-grid">
          <div>
            <div className="order-field__label order-details-text-label">
              {copy.details.sections.terms}
            </div>
            <OrderTextSection
              value={order?.tradeTerms}
              emptyLabel={copy.details.emptyText}
            />
          </div>
          <div>
            <div className="order-field__label order-details-text-label">
              {copy.details.sections.description}
            </div>
            <OrderTextSection
              value={order?.description}
              emptyLabel={copy.details.emptyText}
            />
          </div>
        </div>
      </OrderDetailsGroup>
    </div>
  )
}

function isOrderDetailsPayload(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return false

  return (
    Object.prototype.hasOwnProperty.call(data, 'myRole') ||
    Object.prototype.hasOwnProperty.call(data, 'counterpartyRole') ||
    Object.prototype.hasOwnProperty.call(data, 'orderedQuantity') ||
    Object.prototype.hasOwnProperty.call(data, 'price') ||
    Object.prototype.hasOwnProperty.call(data, 'game') ||
    Object.prototype.hasOwnProperty.call(data, 'category') ||
    Object.prototype.hasOwnProperty.call(data, 'pendingRequests') ||
    Object.prototype.hasOwnProperty.call(data, 'deliveryMethods')
  )
}

function OrderDetailsSkeleton() {
  return (
    <div className="order-page order-page--workspace">
      <div className="card order-header order-header--skeleton">
        <div className="skeleton order-skeleton order-skeleton--eyebrow" />
        <div className="skeleton order-skeleton order-skeleton--hero-title" />
        <div className="skeleton order-skeleton order-skeleton--hero-subtitle" />
      </div>

      <div className="order-dashboard-grid">
        <div className="order-dashboard-main">
          <div className="card order-command-card order-command-card--overview">
            <div className="skeleton order-skeleton order-skeleton--summary-value" />
            <div className="order-overview-metrics">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="skeleton order-skeleton order-skeleton--summary-stat"
                />
              ))}
            </div>
          </div>

          <section className="card order-workspace-panel">
            <div className="order-workspace-tabs" aria-hidden="true">
              {Array.from({ length: 2 }).map((_, index) => (
                <div
                  key={index}
                  className="skeleton order-skeleton order-skeleton--chat-tab"
                />
              ))}
            </div>

            <div className="order-workspace-panel__body">
              <div className="order-chat-panel">
                <div className="order-chat-panel__head">
                  <div className="skeleton order-skeleton order-skeleton--section-title" />
                </div>
                <div className="order-chat-messages">
                  <div className="order-chat-skeleton">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={index}
                        className={`order-chat-skeleton__row${
                          index % 2 === 1 ? ' order-chat-skeleton__row--mine' : ''
                        }`}
                      >
                        <div className="skeleton order-skeleton order-skeleton--chat-meta" />
                        <div className="skeleton order-skeleton order-skeleton--chat-bubble" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <aside className="order-dashboard-aside">
          <div className="card order-command-card order-command-card--actions">
            <div className="skeleton order-skeleton order-skeleton--section-title" />
            <div className="skeleton order-skeleton order-skeleton--button" />
            <div className="skeleton order-skeleton order-skeleton--button" />
          </div>

          <div className="card order-timeline-card">
            <div className="skeleton order-skeleton order-skeleton--section-title" />
            <div className="skeleton order-skeleton order-skeleton--section-block" />
          </div>
        </aside>
      </div>
    </div>
  )
}

export default function OrderDetailsPage() {
  const { orderId } = useParams()
  const location = useLocation()
  const { language } = useI18n()
  const copy = getOrderCopy(language)
  const liveRefresh = useOrderLiveRefresh(orderId)

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
  const [disputeActionState, setDisputeActionState] = useState('idle')
  const [disputeMessage, setDisputeMessage] = useState({
    tone: '',
    text: '',
  })
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState('chat')

  useEffect(() => {
    setError('')
    setActionState('idle')
    setActionMessage({
      scope: '',
      tone: '',
      text: '',
    })
    setDisputeActionState('idle')
    setDisputeMessage({
      tone: '',
      text: '',
    })
    setActiveWorkspaceTab('chat')
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
  }, [copy.errors.details, liveRefresh.order, orderId, reloadKey])

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
      if (isOrderDetailsPayload(response?.data)) {
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

  async function handleCreateDispute(payload) {
    if (disputeActionState !== 'idle' || !orderId) return false

    setDisputeActionState('create-dispute')
    setDisputeMessage({
      tone: '',
      text: '',
    })

    try {
      await createOrderDispute(orderId, payload)
      setDisputeMessage({
        tone: 'success',
        text:
          language === 'en'
            ? 'Support was notified. The dispute block and support chat will refresh now.'
            : '\u041f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0430 \u0443\u0432\u0435\u0434\u043e\u043c\u043b\u0435\u043d\u0430. \u0411\u043b\u043e\u043a \u0434\u0438\u0441\u043f\u0443\u0442\u0430 \u0438 \u0447\u0430\u0442 \u0441 \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u043e\u0439 \u0441\u0435\u0439\u0447\u0430\u0441 \u043e\u0431\u043d\u043e\u0432\u044f\u0442\u0441\u044f.',
      })
      setActiveWorkspaceTab('chat')
      setReloadKey((value) => value + 1)
      return true
    } catch (err) {
      setDisputeMessage({
        tone: 'error',
        text: getErrorMessage(
          err,
          language === 'en'
            ? "Couldn't open the dispute."
            : '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u043e\u0442\u043a\u0440\u044b\u0442\u044c \u0434\u0438\u0441\u043f\u0443\u0442.'
        ),
      })
      return false
    } finally {
      setDisputeActionState('idle')
    }
  }

  function handleSelectWorkspaceTab(tabId) {
    setActiveWorkspaceTab(tabId)
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

  const backTo =
    typeof location.state?.from === 'string' ? location.state.from : '/dashboard/orders'
  const isRefreshing = status === 'refreshing'
  const contextItems = buildOrderTagItems(order?.contexts, 'valueTitle', 'valueSlug')
  const attributeItems = buildOrderTagItems(order?.attributes, 'optionTitle', 'optionSlug')
  const deliveryItems = buildOrderTagItems(order?.deliveryMethods, 'title', 'slug')
  const workspaceCopy = getOrderWorkspaceCopy(language)
  const workspaceTabs = [
    { id: 'chat', label: workspaceCopy.tabs.chat },
    { id: 'details', label: workspaceCopy.tabs.details },
  ]
  const hasPendingRequests =
    Array.isArray(order?.pendingRequests) && order.pendingRequests.length > 0
  const chatsRefreshKey = reloadKey + liveRefresh.chats
  const timelineRefreshKey = reloadKey + liveRefresh.timeline
  const actionsCard = (
    <section className="card order-command-card order-command-card--actions">
      <div className="order-command-card__head">
        <h2 className="order-command-card__title">
          {workspaceCopy.actionsBodyTitle}
        </h2>
      </div>

      <div className="order-command-card__body">
        {hasPendingRequests ? (
          <OrderPendingRequestsBlock
            copy={copy}
            language={language}
            order={order}
            actionState={actionState}
            actionMessage={actionMessage}
            isRefreshing={isRefreshing}
            embedded
            onApproveRequest={(requestId, actionName) =>
              handleAction({
                actionName,
                actionFn: () => approveOrderRequest(requestId),
                successMessage: copy.success.requestApprove,
                successScope: 'pending-requests',
              })
            }
            onRejectRequest={(requestId, actionName) =>
              handleAction({
                actionName,
                actionFn: () => rejectOrderRequest(requestId),
                successMessage: copy.success.requestReject,
                successScope: 'pending-requests',
              })
            }
          />
        ) : null}

        <OrderActionsPanel
          key={`${resolveOrderRouteId(order)}-${order?.status || 'unknown'}-${order?.deliveredQuantity ?? 'none'}-${order?.updatedAt || 'na'}`}
          copy={copy}
          language={language}
          order={order}
          actionState={actionState}
          actionMessage={actionMessage}
          isRefreshing={isRefreshing}
          embedded
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
          onRequestCancel={() =>
            handleAction({
              actionName: 'request-cancel',
              actionFn: requestCancel,
              successMessage: copy.success.requestCancel,
            })
          }
          onRequestAmendQuantity={(quantity) =>
            handleAction({
              actionName: 'request-amend-quantity',
              actionFn: (nextOrderId) => requestAmendQuantity(nextOrderId, quantity),
              successMessage: copy.success.requestAmendQuantity,
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
      </div>
    </section>
  )

  return (
    <div className="order-page order-page--workspace">
      <div className="order-page__top">
        {error ? <div className="error">{error}</div> : null}

        <OrderHeader
          copy={copy}
          language={language}
          order={order}
          backTo={backTo}
          isRefreshing={isRefreshing}
        />
      </div>

      <div className="order-dashboard-grid">
        <div className="order-dashboard-main">
          <OrderSummaryRailCard copy={copy} language={language} order={order} />

          <OrderDisputePanel
            order={order}
            language={language}
            allowCreate
            actionState={disputeActionState}
            actionMessage={disputeMessage}
            isRefreshing={isRefreshing}
            onCreateDispute={handleCreateDispute}
          />

          <section className="card order-workspace-panel">
            <div
              className="order-workspace-tabs"
              role="tablist"
              aria-label={workspaceCopy.tabsAria}
            >
              {workspaceTabs.map((tab) => (
                <OrderWorkspaceTabButton
                  key={tab.id}
                  activeTab={activeWorkspaceTab}
                  tabId={tab.id}
                  label={tab.label}
                  onSelect={handleSelectWorkspaceTab}
                />
              ))}
            </div>

            <div className="order-workspace-panel__body">
              {activeWorkspaceTab === 'chat' ? (
                <div className="order-workspace-tab-panel" role="tabpanel">
                  <OrderChatsSection
                    orderId={orderId}
                    order={order}
                    language={language}
                    conversationKind="all"
                    embedded
                    refreshKey={chatsRefreshKey}
                    messagesRefreshKey={liveRefresh.messages}
                  />
                </div>
              ) : null}

              {activeWorkspaceTab === 'details' ? (
                <div
                  className="order-workspace-tab-panel order-workspace-tab-panel--scroll"
                  role="tabpanel"
                >
                  <OrderWorkspaceDetailsTab
                    copy={copy}
                    workspaceCopy={workspaceCopy}
                    language={language}
                    order={order}
                    contextItems={contextItems}
                    attributeItems={attributeItems}
                    deliveryItems={deliveryItems}
                  />
                </div>
              ) : null}
            </div>
          </section>
        </div>

        <aside className="order-dashboard-aside">
          {actionsCard}

          <section className="card order-timeline-card">
            <OrderTimeline
              orderId={orderId}
              order={order}
              copy={copy}
              language={language}
              refreshKey={timelineRefreshKey}
              embedded
            />
          </section>
        </aside>
      </div>
    </div>
  )
}
