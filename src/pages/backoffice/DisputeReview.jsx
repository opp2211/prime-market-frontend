import { useEffect, useMemo, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import {
  getBackofficeDisputes,
  resolveOrderDisputeAmendQuantityAndComplete,
  resolveOrderDisputeCancel,
  resolveOrderDisputeComplete,
  takeOrderDisputeInWork,
} from '../../api/orderDisputes'
import { getOrder } from '../../api/orders'
import { useI18n } from '../../app/i18n'
import { useUser } from '../../app/user'
import { getErrorMessage } from '../../shared/lib/errors'
import OrderChatsSection from '../orders/OrderChatsSection'
import OrderDisputePanel from '../orders/OrderDisputePanel'
import OrderHeader from '../orders/OrderHeader'
import { getOrderCopy } from '../orders/orderCopy'
import {
  hasOrderDispute,
  resolveOrderDisputeAssignmentState,
  resolveOrderDisputeId,
  resolveOrderDisputeOrderId,
  resolveOrderDisputeQueueItems,
} from '../orders/orderDisputePresentation'
import OrderSummaryCard from '../orders/OrderSummaryCard'
import OrderTimeline from '../orders/OrderTimeline'
import BackofficeDisputeActionsPanel from './BackofficeDisputeActionsPanel'
import { getBackofficeDisputesCopy } from './backofficeDisputesCopy'

function ReviewState({ title, text, onRetry, actionLabel }) {
  return (
    <div className="card offer-state offer-state--error">
      <div className="offer-state__title">{title}</div>
      {text ? <div className="offer-state__text">{text}</div> : null}
      {onRetry && actionLabel ? (
        <div className="offer-state__actions">
          <button type="button" className="btn btn--secondary" onClick={onRetry}>
            {actionLabel}
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default function BackofficeDisputeReview() {
  const { disputeId } = useParams()
  const location = useLocation()
  const { language } = useI18n()
  const { user } = useUser()
  const copy = getBackofficeDisputesCopy(language)
  const orderCopy = getOrderCopy(language)
  const initialDispute = location.state?.dispute || null

  const [queueDispute, setQueueDispute] = useState(initialDispute)
  const [queueStatus, setQueueStatus] = useState(initialDispute ? 'ready' : 'loading')
  const [queueError, setQueueError] = useState('')
  const [order, setOrder] = useState(null)
  const [orderStatus, setOrderStatus] = useState('idle')
  const [orderError, setOrderError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [actionState, setActionState] = useState('idle')
  const [actionMessage, setActionMessage] = useState({
    scope: '',
    tone: '',
    text: '',
  })

  useEffect(() => {
    setQueueDispute(initialDispute)
    setQueueStatus(initialDispute ? 'ready' : 'loading')
    setQueueError('')
    setOrder(null)
    setOrderStatus('idle')
    setOrderError('')
    setActionState('idle')
    setActionMessage({
      scope: '',
      tone: '',
      text: '',
    })
  }, [disputeId, initialDispute])

  useEffect(() => {
    let active = true

    const loadDispute = async () => {
      if (!disputeId) {
        setQueueStatus('error')
        setQueueError(copy.review.disputeLoadError)
        return
      }

      setQueueStatus((current) =>
        current === 'ready' || current === 'refreshing' ? 'refreshing' : 'loading'
      )
      setQueueError('')

      try {
        const response = await getBackofficeDisputes()
        if (!active) return

        const queueItems = resolveOrderDisputeQueueItems(response?.data)
        const match =
          queueItems.find((item) => resolveOrderDisputeId(item) === disputeId) || null

        if (match) {
          setQueueDispute(match)
        }
        setQueueStatus('ready')
      } catch (err) {
        if (!active) return
        setQueueError(getErrorMessage(err, copy.review.disputeLoadError))
        setQueueStatus((current) =>
          current === 'ready' || current === 'refreshing' ? 'ready' : 'error'
        )
      }
    }

    loadDispute()

    return () => {
      active = false
    }
  }, [copy.review.disputeLoadError, disputeId, refreshKey])

  const orderId = resolveOrderDisputeOrderId(queueDispute)

  useEffect(() => {
    let active = true

    const loadOrder = async () => {
      if (!orderId) {
        setOrder(null)
        setOrderStatus('idle')
        return
      }

      setOrderStatus((current) =>
        current === 'ready' || current === 'refreshing' ? 'refreshing' : 'loading'
      )
      setOrderError('')

      try {
        const response = await getOrder(orderId)
        if (!active) return
        setOrder(response?.data || null)
        setOrderStatus('ready')
      } catch (err) {
        if (!active) return
        setOrderError(getErrorMessage(err, copy.review.orderLoadError))
        setOrderStatus((current) =>
          current === 'ready' || current === 'refreshing' ? 'ready' : 'error'
        )
      }
    }

    loadOrder()

    return () => {
      active = false
    }
  }, [copy.review.orderLoadError, orderId, refreshKey])

  const dispute = hasOrderDispute(order?.dispute) ? order.dispute : queueDispute
  const assignmentState = useMemo(
    () => resolveOrderDisputeAssignmentState(dispute, user, language),
    [dispute, language, user]
  )
  const canSendMessages = assignmentState.kind === 'mine'
  const isRefreshing =
    queueStatus === 'refreshing' || orderStatus === 'refreshing'

  async function handleAction({ scope, actionFn, successText }) {
    if (!disputeId || actionState !== 'idle') return false

    setActionState(scope)
    setActionMessage({
      scope: '',
      tone: '',
      text: '',
    })

    try {
      await actionFn()
      setActionMessage({
        scope,
        tone: 'success',
        text: successText,
      })
      setRefreshKey((value) => value + 1)
      return true
    } catch (err) {
      setActionMessage({
        scope,
        tone: 'error',
        text: getErrorMessage(err, copy.review.actionError),
      })
      return false
    } finally {
      setActionState('idle')
    }
  }

  if ((queueStatus === 'loading' && !queueDispute) || (orderStatus === 'loading' && !order && orderId)) {
    return (
      <div className="order-page">
        <div className="card">
          <div className="muted">{copy.loading}</div>
        </div>
      </div>
    )
  }

  if (!queueDispute && !queueError) {
    return (
      <div className="order-page">
        <ReviewState title={copy.notFoundTitle} text={copy.notFoundText} />
      </div>
    )
  }

  if (!queueDispute && queueError) {
    return (
      <div className="order-page">
        <ReviewState
          title={queueError}
          actionLabel={copy.refresh}
          onRetry={() => setRefreshKey((value) => value + 1)}
        />
      </div>
    )
  }

  if (!order && orderError) {
    return (
      <div className="order-page">
        <ReviewState
          title={orderError}
          actionLabel={copy.refresh}
          onRetry={() => setRefreshKey((value) => value + 1)}
        />
      </div>
    )
  }

  if (!order) {
    return null
  }

  return (
    <div className="order-page order-page--workspace backoffice-dispute-review">
      <div className="order-page__top">
        {queueError ? <div className="error">{queueError}</div> : null}
        {orderError ? <div className="error">{orderError}</div> : null}

        <OrderHeader
          copy={orderCopy}
          language={language}
          order={order}
          backTo="/backoffice/disputes"
          backLabel={copy.review.back}
          refreshLabel={orderCopy.details.refreshing}
          isRefreshing={isRefreshing}
        />
      </div>

      <div className="order-dashboard-grid">
        <div className="order-dashboard-main">
          <OrderSummaryCard copy={orderCopy} language={language} order={order} />

          <OrderDisputePanel
            dispute={dispute}
            language={language}
            title={copy.review.disputeTitle}
            description={copy.review.disputeDescription}
          />

          <OrderChatsSection
            orderId={resolveOrderDisputeOrderId(dispute)}
            order={order}
            language={language}
            conversationKind="all"
            embedded={false}
            refreshKey={refreshKey}
            sendDisabled={!canSendMessages}
            sendDisabledHint={!canSendMessages ? copy.review.chatsLocked : ''}
          />
        </div>

        <aside className="order-dashboard-aside">
          <BackofficeDisputeActionsPanel
            dispute={dispute}
            user={user}
            language={language}
            copy={copy}
            actionState={actionState}
            actionMessage={actionMessage}
            isRefreshing={isRefreshing}
            onTakeInWork={() =>
              handleAction({
                scope: 'take',
                actionFn: () => takeOrderDisputeInWork(disputeId),
                successText: copy.review.takeInWorkSuccess,
              })
            }
            onResolveCancel={() =>
              handleAction({
                scope: 'resolve-cancel',
                actionFn: () => resolveOrderDisputeCancel(disputeId),
                successText: copy.review.resolveCancelSuccess,
              })
            }
            onResolveComplete={() =>
              handleAction({
                scope: 'resolve-complete',
                actionFn: () => resolveOrderDisputeComplete(disputeId),
                successText: copy.review.resolveCompleteSuccess,
              })
            }
            onResolveAmendQuantityAndComplete={(quantity) =>
              handleAction({
                scope: 'resolve-amend',
                actionFn: () =>
                  resolveOrderDisputeAmendQuantityAndComplete(disputeId, quantity),
                successText: copy.review.resolveAmendSuccess,
              })
            }
          />

          <section className="card order-timeline-card">
            <OrderTimeline
              orderId={resolveOrderDisputeOrderId(dispute)}
              order={order}
              copy={orderCopy}
              language={language}
              refreshKey={refreshKey}
              embedded
            />
          </section>
        </aside>
      </div>
    </div>
  )
}
