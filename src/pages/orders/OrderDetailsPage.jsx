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
  OrderDetailsSkeleton,
  OrderSummaryRailCard,
  OrderWorkspaceDetailsTab,
  OrderWorkspaceTabButton,
} from './OrderDetailsWorkspace'
import { getOrderWorkspaceCopy } from './orderWorkspaceCopy'
import {
  buildOrderTagItems,
  resolveOrderRouteId,
} from './orderPresentation'

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
