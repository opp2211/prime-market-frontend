import { useState } from 'react'
import Button from '../../shared/ui/Button'
import {
  buildOrderRequestSummary,
  formatOrderDateTime,
  formatOrderNumber,
  resolveOrderRequestDecisionText,
  resolveOrderRequestId,
  resolveOrderRequestQuantity,
  resolveOrderRequestRoleLabel,
  resolveOrderRequestStatusLabel,
  resolveOrderRequestStatusTone,
  resolveOrderRequestTypeLabel,
  resolveOrderRoleTone,
} from './orderPresentation'

function matchesScope(message, scopes) {
  if (!message?.scope || !Array.isArray(scopes)) return false
  return scopes.includes(message.scope)
}

function ActionFeedback({ message }) {
  if (!message?.text) return null

  return (
    <div className={message.tone === 'error' ? 'error' : 'notice'}>
      {message.text}
    </div>
  )
}

function RequestMeta({ label, value, children }) {
  return (
    <div className="order-request-meta">
      <div className="order-request-meta__label">{label}</div>
      <div className="order-request-meta__value">{children || value}</div>
    </div>
  )
}

function buildRequestActionName(action, requestId) {
  return `order-request-${action}-${requestId}`
}

function PendingRequestCard({
  copy,
  language,
  request,
  actionState,
  isBusy,
  pendingConfirm,
  onStartConfirm,
  onCancelConfirm,
  onApproveRequest,
  onRejectRequest,
}) {
  const requestId = resolveOrderRequestId(request)
  const canApprove = Boolean(request?.availableActions?.canApprove) && Boolean(requestId)
  const canReject = Boolean(request?.availableActions?.canReject) && Boolean(requestId)
  const hasActions = canApprove || canReject
  const approveActionName = buildRequestActionName('approve', requestId)
  const rejectActionName = buildRequestActionName('reject', requestId)
  const isApproving = actionState === approveActionName
  const isRejecting = actionState === rejectActionName
  const activeConfirm =
    pendingConfirm?.requestId === requestId ? pendingConfirm?.action : ''
  const roleLabel = resolveOrderRequestRoleLabel(request, language)
  const requestedByRole = request?.requestedByRole || request?.requested_by_role
  const requestedQuantity = resolveOrderRequestQuantity(request)
  const requestedQuantityLabel = formatOrderNumber(requestedQuantity, language, 4)

  async function handleConfirmAction() {
    if (!activeConfirm || isBusy) return

    const didSubmit =
      activeConfirm === 'approve'
        ? await onApproveRequest(requestId, approveActionName)
        : await onRejectRequest(requestId, rejectActionName)

    if (didSubmit) {
      onCancelConfirm()
    }
  }

  return (
    <article className="order-request-card">
      <div className="order-request-card__top">
        <div className="order-request-card__main">
          <div className="order-request-card__eyebrow">
            {resolveOrderRequestTypeLabel(
              request?.requestType || request?.request_type || request?.type,
              language
            )}
          </div>
          <h3 className="order-request-card__title">
            {buildOrderRequestSummary(request, language)}
          </h3>
          <p className="order-request-card__text">
            {resolveOrderRequestDecisionText(request, language)}
          </p>
        </div>

        <span
          className={`status-chip status-chip--${resolveOrderRequestStatusTone(request?.status)}`}
        >
          {resolveOrderRequestStatusLabel(request?.status, language)}
        </span>
      </div>

      <div className="order-request-card__meta">
        <RequestMeta
          label={copy.details.requests.requestedBy}
          value={roleLabel}
        >
          <span className={`offer-chip offer-chip--${resolveOrderRoleTone(requestedByRole)}`}>
            {roleLabel}
          </span>
        </RequestMeta>
        <RequestMeta
          label={copy.details.requests.createdAt}
          value={formatOrderDateTime(request?.createdAt, language)}
        />
        {requestedQuantity != null ? (
          <RequestMeta
            label={copy.details.requests.requestedQuantity}
            value={requestedQuantityLabel}
          />
        ) : null}
      </div>

      {activeConfirm ? (
        <div className="order-actions__confirm order-request-card__confirm">
          <div className="order-actions__confirm-title">
            {activeConfirm === 'approve'
              ? copy.details.requests.approveConfirmTitle
              : copy.details.requests.rejectConfirmTitle}
          </div>
          <div className="order-actions__confirm-text">
            {activeConfirm === 'approve'
              ? copy.details.requests.approveConfirmText
              : copy.details.requests.rejectConfirmText}
          </div>
          <div className="order-actions__buttons order-actions__buttons--inline">
            <Button
              type="button"
              variant={activeConfirm === 'approve' ? 'primary' : 'secondary'}
              className={
                activeConfirm === 'reject'
                  ? 'request-action request-action--danger order-actions__button'
                  : 'order-actions__button'
              }
              onClick={handleConfirmAction}
              disabled={isBusy}
            >
              {isApproving
                ? copy.details.requests.approveLoading
                : isRejecting
                  ? copy.details.requests.rejectLoading
                  : copy.details.requests.confirmAction}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="order-actions__button"
              onClick={onCancelConfirm}
              disabled={isBusy}
            >
              {copy.details.requests.dismiss}
            </Button>
          </div>
        </div>
      ) : hasActions ? (
        <div className="order-request-card__actions">
          {canApprove ? (
            <Button
              type="button"
              className="order-request-card__button"
              onClick={() => onStartConfirm(requestId, 'approve')}
              disabled={isBusy}
            >
              {isApproving ? copy.details.requests.approveLoading : copy.details.requests.approve}
            </Button>
          ) : null}
          {canReject ? (
            <Button
              type="button"
              variant="secondary"
              className="request-action request-action--danger order-request-card__button"
              onClick={() => onStartConfirm(requestId, 'reject')}
              disabled={isBusy}
            >
              {isRejecting ? copy.details.requests.rejectLoading : copy.details.requests.reject}
            </Button>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}

export default function OrderPendingRequestsBlock({
  copy,
  language,
  order,
  actionState,
  actionMessage,
  isRefreshing,
  onApproveRequest,
  onRejectRequest,
}) {
  const [pendingConfirm, setPendingConfirm] = useState(null)
  const requests = Array.isArray(order?.pendingRequests) ? order.pendingRequests : []
  const isBusy = actionState !== 'idle' || isRefreshing
  const message = matchesScope(actionMessage, ['pending-requests']) ? actionMessage : null
  const hasActionableRequests = requests.some(
    (request) =>
      Boolean(resolveOrderRequestId(request)) &&
      (Boolean(request?.availableActions?.canApprove) ||
        Boolean(request?.availableActions?.canReject))
  )

  return (
    <section className="card order-section order-requests-section">
      <div className="order-section__head">
        <div className="order-timeline__heading">
          <div>
            <h2 className="order-section__title">{copy.details.requests.title}</h2>
            <p className="order-section__description">
              {copy.details.requests.description}
            </p>
          </div>

          {isRefreshing ? (
            <span className="order-refresh-badge">{copy.details.requests.refreshing}</span>
          ) : null}
        </div>
      </div>

      <div className="order-section__body">
        <ActionFeedback message={message} />

        {requests.length === 0 ? (
          <div className="order-timeline-state">
            <div className="order-timeline-state__title">
              {copy.details.requests.emptyTitle}
            </div>
            <div className="order-timeline-state__text">
              {copy.details.requests.emptyText}
            </div>
          </div>
        ) : (
          <>
            <div className="order-request-list">
              {requests.map((request, index) => (
                <PendingRequestCard
                  key={resolveOrderRequestId(request) || `${request?.createdAt || 'request'}-${index}`}
                  copy={copy}
                  language={language}
                  request={request}
                  actionState={actionState}
                  isBusy={isBusy}
                  pendingConfirm={pendingConfirm}
                  onStartConfirm={(requestId, action) =>
                    setPendingConfirm({ requestId, action })
                  }
                  onCancelConfirm={() => setPendingConfirm(null)}
                  onApproveRequest={onApproveRequest}
                  onRejectRequest={onRejectRequest}
                />
              ))}
            </div>

            {!hasActionableRequests ? (
              <div className="notice">{copy.details.requests.noActions}</div>
            ) : null}
          </>
        )}
      </div>
    </section>
  )
}
