import { useState } from 'react'
import Button from '../../shared/ui/Button'
import {
  formatOrderNumber,
  resolveOrderDeliveryMetrics,
  resolveOrderStatusDescription,
  resolveOrderStatusLabel,
  resolveOrderStatusTone,
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

function ActionStat({ label, value }) {
  return (
    <div className="order-action-stats__item">
      <div className="order-action-stats__label">{label}</div>
      <div className="order-action-stats__value">{value}</div>
    </div>
  )
}

function ActionGroup({ title, description, tone = 'default', message, children }) {
  return (
    <section className={`order-action-group order-action-group--${tone}`}>
      <div className="order-action-group__head">
        <div className="order-action-group__title">{title}</div>
        <div className="order-action-group__text">{description}</div>
      </div>

      <ActionFeedback message={message} />
      {children}
    </section>
  )
}

export default function OrderActionsPanel({
  copy,
  language,
  order,
  actionState,
  actionMessage,
  isRefreshing,
  onConfirmReady,
  onConfirmCancel,
  onMarkPartiallyDelivered,
  onMarkDelivered,
  onConfirmReceived,
}) {
  const canConfirmReady = Boolean(order?.availableActions?.canConfirmReady)
  const canCancel = Boolean(order?.availableActions?.canCancel)
  const canMarkPartiallyDelivered = Boolean(order?.availableActions?.canMarkPartiallyDelivered)
  const canMarkDelivered = Boolean(order?.availableActions?.canMarkDelivered)
  const canConfirmReceived = Boolean(order?.availableActions?.canConfirmReceived)
  const isBusy = actionState !== 'idle'
  const deliveryMetrics = resolveOrderDeliveryMetrics(order)
  const orderedQuantity = deliveryMetrics.orderedQuantity
  const rawDeliveredQuantity = Number(order?.deliveredQuantity)
  const currentDeliveredQuantity = Number.isFinite(rawDeliveredQuantity)
    ? rawDeliveredQuantity
    : 0
  const remainingQuantity =
    orderedQuantity != null ? Math.max(orderedQuantity - currentDeliveredQuantity, 0) : null
  const orderedLabel = formatOrderNumber(orderedQuantity, language, 4)
  const currentDeliveredLabel = formatOrderNumber(currentDeliveredQuantity, language, 4)
  const remainingLabel = formatOrderNumber(remainingQuantity, language, 4)
  const statusTone = resolveOrderStatusTone(order?.status)

  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false)
  const [isPartialFormOpen, setIsPartialFormOpen] = useState(false)
  const [isDeliveredConfirmOpen, setIsDeliveredConfirmOpen] = useState(false)
  const [isReceivedConfirmOpen, setIsReceivedConfirmOpen] = useState(false)
  const [partialValue, setPartialValue] = useState('')
  const [partialError, setPartialError] = useState('')

  function closeTransientPanels() {
    setIsCancelConfirmOpen(false)
    setIsDeliveredConfirmOpen(false)
    setIsReceivedConfirmOpen(false)
  }

  function togglePartialForm() {
    const nextValue = !isPartialFormOpen
    closeTransientPanels()
    setIsPartialFormOpen(nextValue)
    setPartialError('')
    if (!nextValue) {
      setPartialValue('')
    }
  }

  function openCancelConfirm() {
    setIsCancelConfirmOpen(true)
    setIsPartialFormOpen(false)
    setIsDeliveredConfirmOpen(false)
    setIsReceivedConfirmOpen(false)
    setPartialError('')
  }

  function openDeliveredConfirm() {
    setIsDeliveredConfirmOpen(true)
    setIsCancelConfirmOpen(false)
    setIsPartialFormOpen(false)
    setIsReceivedConfirmOpen(false)
    setPartialError('')
  }

  function openReceivedConfirm() {
    setIsReceivedConfirmOpen(true)
    setIsCancelConfirmOpen(false)
    setIsPartialFormOpen(false)
    setIsDeliveredConfirmOpen(false)
    setPartialError('')
  }

  function parsePartialValue(value) {
    return Number.parseFloat(`${value || ''}`.replace(',', '.'))
  }

  function validatePartialValue(value) {
    const trimmedValue = `${value || ''}`.trim()
    if (!trimmedValue) return copy.details.partialDelivery.validationRequired

    const parsedValue = parsePartialValue(trimmedValue)
    if (!Number.isFinite(parsedValue)) {
      return copy.details.partialDelivery.validationNumber
    }

    if (parsedValue <= currentDeliveredQuantity) {
      return copy.details.partialDelivery.validationGreater(currentDeliveredLabel)
    }

    if (orderedQuantity != null && parsedValue >= orderedQuantity) {
      return copy.details.partialDelivery.validationLess(orderedLabel)
    }

    return ''
  }

  async function handlePartialSubmit(event) {
    event.preventDefault()
    if (isBusy) return

    const validationError = validatePartialValue(partialValue)
    if (validationError) {
      setPartialError(validationError)
      return
    }

    const didSubmit = await onMarkPartiallyDelivered(parsePartialValue(partialValue))
    if (didSubmit) {
      setPartialError('')
      setPartialValue('')
    }
  }

  const readyMessage = matchesScope(actionMessage, ['confirm-ready']) ? actionMessage : null
  const sellerMessage = matchesScope(actionMessage, ['partial-delivery', 'mark-delivered'])
    ? actionMessage
    : null
  const buyerMessage = matchesScope(actionMessage, ['confirm-received']) ? actionMessage : null
  const cancelMessage = matchesScope(actionMessage, ['cancel']) ? actionMessage : null

  const showReadyGroup = canConfirmReady || Boolean(readyMessage)
  const showSellerGroup =
    canMarkPartiallyDelivered ||
    canMarkDelivered ||
    isPartialFormOpen ||
    isDeliveredConfirmOpen ||
    Boolean(sellerMessage)
  const showBuyerGroup =
    canConfirmReceived || isReceivedConfirmOpen || Boolean(buyerMessage)
  const showCancelGroup = canCancel || isCancelConfirmOpen || Boolean(cancelMessage)
  const hasVisibleGroups =
    showReadyGroup || showSellerGroup || showBuyerGroup || showCancelGroup

  return (
    <div className="card order-actions">
      <div className="order-actions__head">
        <div className="order-actions__title">{copy.details.actionsTitle}</div>
        <div className="order-actions__subtitle">{copy.details.actionsSubtitle}</div>
      </div>

      <div className="order-actions__state">
        <div className="order-actions__state-top">
          <span className="order-actions__state-caption">{copy.details.stageLabel}</span>
          <span className={`status-chip status-chip--${statusTone}`}>
            {resolveOrderStatusLabel(order?.status, language)}
          </span>
        </div>
        <span className="order-actions__state-label">
          {resolveOrderStatusDescription(order?.status, language)}
        </span>
      </div>

      {isRefreshing ? <div className="notice">{copy.details.refreshing}</div> : null}

      {showReadyGroup ? (
        <ActionGroup
          title={copy.details.actionGroups.readyTitle}
          description={copy.details.actionGroups.readyText}
          message={readyMessage}
        >
          {canConfirmReady ? (
            <div className="order-actions__buttons">
              <Button
                type="button"
                className="order-actions__button"
                onClick={onConfirmReady}
                disabled={isBusy}
              >
                {actionState === 'confirm-ready'
                  ? copy.details.confirmReadyLoading
                  : copy.details.confirmReady}
              </Button>
            </div>
          ) : null}
        </ActionGroup>
      ) : null}

      {showSellerGroup ? (
        <ActionGroup
          title={copy.details.actionGroups.sellerDeliveryTitle}
          description={copy.details.actionGroups.sellerDeliveryText}
          message={sellerMessage}
        >
          {(canMarkPartiallyDelivered || canMarkDelivered) ? (
            <div className="order-actions__buttons">
              {canMarkPartiallyDelivered ? (
                <Button
                  type="button"
                  variant={canMarkDelivered ? 'secondary' : 'primary'}
                  className="order-actions__button"
                  onClick={togglePartialForm}
                  disabled={isBusy}
                >
                  {isPartialFormOpen
                    ? copy.details.partialDelivery.hide
                    : copy.details.partialDelivery.button}
                </Button>
              ) : null}

              {canMarkDelivered ? (
                <Button
                  type="button"
                  className="order-actions__button"
                  onClick={openDeliveredConfirm}
                  disabled={isBusy}
                >
                  {actionState === 'mark-delivered'
                    ? copy.details.markDelivered.loading
                    : copy.details.markDelivered.button}
                </Button>
              ) : null}
            </div>
          ) : null}

          {isPartialFormOpen ? (
            <form className="order-action-form" onSubmit={handlePartialSubmit}>
              <div className="order-action-form__title">{copy.details.partialDelivery.title}</div>
              <div className="order-action-form__text">
                {copy.details.partialDelivery.description}
              </div>

              <div className="order-action-stats">
                <ActionStat
                  label={copy.details.fields.orderedQuantity}
                  value={orderedLabel}
                />
                <ActionStat
                  label={copy.details.fields.deliveredQuantity}
                  value={currentDeliveredLabel}
                />
                <ActionStat
                  label={copy.details.fields.remainingQuantity}
                  value={remainingLabel}
                />
              </div>

              <label className="field">
                <span className="field__label">{copy.details.partialDelivery.inputLabel}</span>
                <input
                  type="number"
                  className="input"
                  inputMode="decimal"
                  step="any"
                  placeholder={copy.details.partialDelivery.inputPlaceholder}
                  value={partialValue}
                  onChange={(event) => {
                    setPartialValue(event.target.value)
                    if (partialError) {
                      setPartialError('')
                    }
                  }}
                  disabled={isBusy}
                />
                <span className="field__label">
                  {copy.details.partialDelivery.hint(currentDeliveredLabel, orderedLabel)}
                </span>
                {partialError ? <span className="field__error">{partialError}</span> : null}
              </label>

              <div className="order-actions__buttons order-actions__buttons--inline">
                <Button
                  type="submit"
                  className="order-actions__button"
                  disabled={isBusy}
                >
                  {actionState === 'partial-delivery'
                    ? copy.details.partialDelivery.submitting
                    : copy.details.partialDelivery.submit}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="order-actions__button"
                  onClick={togglePartialForm}
                  disabled={isBusy}
                >
                  {copy.details.partialDelivery.dismiss}
                </Button>
              </div>
            </form>
          ) : null}

          {isDeliveredConfirmOpen ? (
            <div className="order-actions__confirm">
              <div className="order-actions__confirm-title">
                {copy.details.markDelivered.confirmTitle}
              </div>
              <div className="order-actions__confirm-text">
                {copy.details.markDelivered.confirmText}
              </div>
              <div className="order-actions__buttons order-actions__buttons--inline">
                <Button
                  type="button"
                  className="order-actions__button"
                  onClick={onMarkDelivered}
                  disabled={isBusy}
                >
                  {actionState === 'mark-delivered'
                    ? copy.details.markDelivered.loading
                    : copy.details.markDelivered.confirmAction}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="order-actions__button"
                  onClick={() => setIsDeliveredConfirmOpen(false)}
                  disabled={isBusy}
                >
                  {copy.details.markDelivered.dismiss}
                </Button>
              </div>
            </div>
          ) : null}
        </ActionGroup>
      ) : null}

      {showBuyerGroup ? (
        <ActionGroup
          title={copy.details.actionGroups.buyerCompletionTitle}
          description={copy.details.actionGroups.buyerCompletionText}
          message={buyerMessage}
        >
          {canConfirmReceived ? (
            <div className="order-actions__buttons">
              <Button
                type="button"
                className="order-actions__button"
                onClick={openReceivedConfirm}
                disabled={isBusy}
              >
                {actionState === 'confirm-received'
                  ? copy.details.confirmReceived.loading
                  : copy.details.confirmReceived.button}
              </Button>
            </div>
          ) : null}

          {isReceivedConfirmOpen ? (
            <div className="order-actions__confirm order-actions__confirm--success">
              <div className="order-actions__confirm-title">
                {copy.details.confirmReceived.confirmTitle}
              </div>
              <div className="order-actions__confirm-text">
                {copy.details.confirmReceived.confirmText}
              </div>
              <div className="order-actions__buttons order-actions__buttons--inline">
                <Button
                  type="button"
                  className="order-actions__button"
                  onClick={onConfirmReceived}
                  disabled={isBusy}
                >
                  {actionState === 'confirm-received'
                    ? copy.details.confirmReceived.loading
                    : copy.details.confirmReceived.confirmAction}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="order-actions__button"
                  onClick={() => setIsReceivedConfirmOpen(false)}
                  disabled={isBusy}
                >
                  {copy.details.confirmReceived.dismiss}
                </Button>
              </div>
            </div>
          ) : null}
        </ActionGroup>
      ) : null}

      {showCancelGroup ? (
        <ActionGroup
          title={copy.details.actionGroups.cancelTitle}
          description={copy.details.actionGroups.cancelText}
          tone="danger"
          message={cancelMessage}
        >
          {isCancelConfirmOpen ? (
            <div className="order-actions__confirm">
              <div className="order-actions__confirm-title">{copy.details.cancelConfirmTitle}</div>
              <div className="order-actions__confirm-text">{copy.details.cancelConfirmText}</div>
              <div className="order-actions__buttons order-actions__buttons--inline">
                <Button
                  type="button"
                  variant="secondary"
                  className="request-action request-action--danger order-actions__button"
                  onClick={onConfirmCancel}
                  disabled={isBusy}
                >
                  {actionState === 'cancel'
                    ? copy.details.cancelLoading
                    : copy.details.cancelConfirmAction}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="order-actions__button"
                  onClick={() => setIsCancelConfirmOpen(false)}
                  disabled={isBusy}
                >
                  {copy.details.cancelDismiss}
                </Button>
              </div>
            </div>
          ) : canCancel ? (
            <div className="order-actions__buttons">
              <Button
                type="button"
                variant="secondary"
                className="request-action request-action--danger order-actions__button"
                onClick={openCancelConfirm}
                disabled={isBusy}
              >
                {copy.details.cancel}
              </Button>
            </div>
          ) : null}
        </ActionGroup>
      ) : null}

      {!hasVisibleGroups ? <div className="muted">{copy.details.unavailable}</div> : null}
    </div>
  )
}
