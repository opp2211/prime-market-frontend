import { useMemo, useState } from 'react'
import Button from '../../shared/ui/Button'
import {
  resolveOrderDisputeAssignmentState,
  resolveOrderDisputeAvailableActions,
} from '../orders/orderDisputePresentation'

function matchesScope(message, scopes) {
  if (!message?.scope || !Array.isArray(scopes)) return false
  return scopes.includes(message.scope)
}

function ActionFeedback({ message }) {
  if (!message?.text) return null

  return <div className={message.tone === 'error' ? 'error' : 'notice'}>{message.text}</div>
}

export default function BackofficeDisputeActionsPanel({
  dispute,
  user,
  language,
  copy,
  actionState,
  actionMessage,
  isRefreshing = false,
  onTakeInWork,
  onResolveCancel,
  onResolveComplete,
  onResolveAmendQuantityAndComplete,
}) {
  const availableActions = useMemo(
    () => resolveOrderDisputeAvailableActions(dispute),
    [dispute]
  )
  const assignmentState = useMemo(
    () => resolveOrderDisputeAssignmentState(dispute, user, language),
    [dispute, language, user]
  )
  const isBusy = actionState !== 'idle' || isRefreshing

  const [activeConfirm, setActiveConfirm] = useState('')
  const [amendQuantity, setAmendQuantity] = useState('')
  const [amendError, setAmendError] = useState('')
  const [amendConfirmOpen, setAmendConfirmOpen] = useState(false)

  const takeMessage = matchesScope(actionMessage, ['take']) ? actionMessage : null
  const resolveMessage = matchesScope(actionMessage, [
    'resolve-cancel',
    'resolve-complete',
    'resolve-amend',
  ])
    ? actionMessage
    : null

  function closeResolutionPanels() {
    setActiveConfirm('')
    setAmendConfirmOpen(false)
    setAmendError('')
  }

  function parseQuantity(value) {
    return Number.parseFloat(`${value || ''}`.replace(',', '.'))
  }

  function validateQuantity(value) {
    const trimmedValue = `${value || ''}`.trim()
    if (!trimmedValue) return copy.review.quantityRequired

    const parsedValue = parseQuantity(trimmedValue)
    if (!Number.isFinite(parsedValue)) return copy.review.quantityInvalid
    if (parsedValue <= 0) return copy.review.quantityPositive
    return ''
  }

  async function handleTakeInWork() {
    if (isBusy) return
    const didSubmit = await onTakeInWork()
    if (didSubmit) {
      closeResolutionPanels()
    }
  }

  async function handleResolveCancel() {
    if (isBusy) return
    const didSubmit = await onResolveCancel()
    if (didSubmit) {
      setActiveConfirm('')
    }
  }

  async function handleResolveComplete() {
    if (isBusy) return
    const didSubmit = await onResolveComplete()
    if (didSubmit) {
      setActiveConfirm('')
    }
  }

  async function handleResolveAmend() {
    if (isBusy) return

    const validationError = validateQuantity(amendQuantity)
    if (validationError) {
      setAmendError(validationError)
      return
    }

    if (!amendConfirmOpen) {
      setAmendError('')
      setAmendConfirmOpen(true)
      return
    }

    const didSubmit = await onResolveAmendQuantityAndComplete(parseQuantity(amendQuantity))
    if (didSubmit) {
      setAmendQuantity('')
      closeResolutionPanels()
    }
  }

  const showTakeSection = availableActions.canTakeInWork || Boolean(takeMessage)
  const showResolutionSection =
    availableActions.canResolveCancel ||
    availableActions.canResolveComplete ||
    availableActions.canResolveAmendQuantityAndComplete ||
    activeConfirm === 'cancel' ||
    activeConfirm === 'complete' ||
    activeConfirm === 'amend' ||
    Boolean(resolveMessage)
  const hasVisibleActions = showTakeSection || showResolutionSection

  return (
    <section className="card backoffice-dispute-actions">
      <div className="backoffice-dispute-actions__head">
        <h2 className="order-section__title">{copy.review.actionsTitle}</h2>
        <p className="order-section__description">{copy.review.actionsDescription}</p>
      </div>

      <div
        className={`backoffice-dispute-actions__assignment backoffice-dispute-actions__assignment--${assignmentState.kind}`}
      >
        <div className="backoffice-dispute-actions__assignment-title">
          {assignmentState.title}
        </div>
        <div className="backoffice-dispute-actions__assignment-text">
          {assignmentState.text}
        </div>
      </div>

      <div className="backoffice-dispute-actions__passive">
        <div className="backoffice-dispute-actions__passive-title">
          {copy.review.passiveTitle}
        </div>
        <div className="backoffice-dispute-actions__passive-text">
          {copy.review.passiveText}
        </div>
      </div>

      {showTakeSection ? (
        <section className="backoffice-dispute-actions__group">
          <ActionFeedback message={takeMessage} />
          {availableActions.canTakeInWork ? (
            <Button type="button" onClick={handleTakeInWork} disabled={isBusy}>
              {actionState === 'take'
                ? copy.review.takeInWorkLoading
                : copy.review.takeInWork}
            </Button>
          ) : null}
        </section>
      ) : null}

      {showResolutionSection ? (
        <section className="backoffice-dispute-actions__group backoffice-dispute-actions__group--danger">
          <div className="backoffice-dispute-actions__group-title">
            {copy.review.resolutionTitle}
          </div>
          <div className="backoffice-dispute-actions__group-text">
            {copy.review.resolutionText}
          </div>

          <ActionFeedback message={resolveMessage} />

          {availableActions.canResolveCancel ||
          availableActions.canResolveComplete ||
          availableActions.canResolveAmendQuantityAndComplete ? (
            <div className="backoffice-dispute-actions__buttons">
              {availableActions.canResolveCancel ? (
                <Button
                  type="button"
                  variant="secondary"
                  className="request-action request-action--danger"
                  onClick={() => {
                    setActiveConfirm((current) => (current === 'cancel' ? '' : 'cancel'))
                    setAmendConfirmOpen(false)
                    setAmendError('')
                  }}
                  disabled={isBusy}
                >
                  {copy.review.resolveCancel}
                </Button>
              ) : null}

              {availableActions.canResolveComplete ? (
                <Button
                  type="button"
                  variant="secondary"
                  className="backoffice-dispute-actions__button"
                  onClick={() => {
                    setActiveConfirm((current) => (current === 'complete' ? '' : 'complete'))
                    setAmendConfirmOpen(false)
                    setAmendError('')
                  }}
                  disabled={isBusy}
                >
                  {copy.review.resolveComplete}
                </Button>
              ) : null}

              {availableActions.canResolveAmendQuantityAndComplete ? (
                <Button
                  type="button"
                  variant="secondary"
                  className="backoffice-dispute-actions__button"
                  onClick={() => {
                    setActiveConfirm((current) => (current === 'amend' ? '' : 'amend'))
                    setAmendConfirmOpen(false)
                    setAmendError('')
                  }}
                  disabled={isBusy}
                >
                  {copy.review.resolveAmend}
                </Button>
              ) : null}
            </div>
          ) : null}

          {activeConfirm === 'cancel' ? (
            <div className="backoffice-dispute-actions__confirm">
              <div className="backoffice-dispute-actions__confirm-title">
                {copy.review.confirmDanger}
              </div>
              <div className="backoffice-dispute-actions__confirm-text">
                {copy.review.confirmCancelText}
              </div>
              <div className="order-actions__buttons order-actions__buttons--inline">
                <Button
                  type="button"
                  variant="secondary"
                  className="request-action request-action--danger"
                  onClick={handleResolveCancel}
                  disabled={isBusy}
                >
                  {actionState === 'resolve-cancel'
                    ? copy.review.resolveCancelLoading
                    : copy.review.confirmAction}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setActiveConfirm('')}
                  disabled={isBusy}
                >
                  {copy.review.dismissAction}
                </Button>
              </div>
            </div>
          ) : null}

          {activeConfirm === 'complete' ? (
            <div className="backoffice-dispute-actions__confirm">
              <div className="backoffice-dispute-actions__confirm-title">
                {copy.review.confirmDanger}
              </div>
              <div className="backoffice-dispute-actions__confirm-text">
                {copy.review.confirmCompleteText}
              </div>
              <div className="order-actions__buttons order-actions__buttons--inline">
                <Button
                  type="button"
                  variant="secondary"
                  className="backoffice-dispute-actions__button"
                  onClick={handleResolveComplete}
                  disabled={isBusy}
                >
                  {actionState === 'resolve-complete'
                    ? copy.review.resolveCompleteLoading
                    : copy.review.confirmAction}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setActiveConfirm('')}
                  disabled={isBusy}
                >
                  {copy.review.dismissAction}
                </Button>
              </div>
            </div>
          ) : null}

          {activeConfirm === 'amend' ? (
            <div className="backoffice-dispute-actions__confirm">
              <div className="backoffice-dispute-actions__confirm-title">
                {copy.review.resolveAmend}
              </div>
              <div className="backoffice-dispute-actions__confirm-text">
                {copy.review.confirmAmendText}
              </div>

              <label className="field">
                <span className="field__label">{copy.review.quantityTitle}</span>
                <input
                  type="number"
                  className="input"
                  inputMode="decimal"
                  step="any"
                  value={amendQuantity}
                  placeholder={copy.review.quantityPlaceholder}
                  onChange={(event) => {
                    setAmendQuantity(event.target.value)
                    setAmendConfirmOpen(false)
                    if (amendError) setAmendError('')
                  }}
                  disabled={isBusy}
                />
                <span className="field__label">{copy.review.quantityHint}</span>
                {amendError ? <span className="field__error">{amendError}</span> : null}
              </label>

              {amendConfirmOpen ? (
                <div className="backoffice-dispute-actions__final-check">
                  <div className="backoffice-dispute-actions__final-check-title">
                    {copy.review.confirmDanger}
                  </div>
                  <div className="backoffice-dispute-actions__final-check-text">
                    {copy.review.quantityTitle}: <strong>{amendQuantity}</strong>
                  </div>
                </div>
              ) : null}

              <div className="order-actions__buttons order-actions__buttons--inline">
                <Button
                  type="button"
                  variant="secondary"
                  className="backoffice-dispute-actions__button"
                  onClick={handleResolveAmend}
                  disabled={isBusy}
                >
                  {actionState === 'resolve-amend'
                    ? copy.review.resolveAmendLoading
                    : amendConfirmOpen
                      ? copy.review.quantitySubmit
                      : copy.review.quantityConfirm}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => closeResolutionPanels()}
                  disabled={isBusy}
                >
                  {copy.review.dismissAction}
                </Button>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {!hasVisibleActions ? <div className="muted">{copy.review.noActions}</div> : null}
    </section>
  )
}
