import { useEffect, useMemo, useState } from 'react'
import Button from '../../shared/ui/Button'
import {
  getOrderDisputeCopy,
  getOrderDisputeReasonOptions,
  hasOrderDispute,
  resolveOrderDisputeAssignedSupportLabel,
  resolveOrderDisputeAvailableActions,
  resolveOrderDisputeCreatedAt,
  resolveOrderDisputeHelperText,
  resolveOrderDisputeOpenedByLabel,
  resolveOrderDisputeReasonLabel,
  resolveOrderDisputeResolutionLabel,
  resolveOrderDisputeResolutionQuantityLabel,
  resolveOrderDisputeStatusLabel,
  resolveOrderDisputeStatusTone,
} from './orderDisputePresentation'

const PANEL_COPY = {
  ru: {
    title: '\u041f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0430 \u043f\u043e \u0437\u0430\u043a\u0430\u0437\u0443',
    description:
      '\u0415\u0441\u043b\u0438 \u043e\u0431\u044b\u0447\u043d\u044b\u0439 \u0445\u043e\u0434 \u0441\u0434\u0435\u043b\u043a\u0438 \u0437\u0430\u0448\u0451\u043b \u0432 \u0442\u0443\u043f\u0438\u043a, \u043c\u043e\u0436\u043d\u043e \u043e\u0442\u043a\u0440\u044b\u0442\u044c \u043e\u0431\u0440\u0430\u0449\u0435\u043d\u0438\u0435 \u0432 \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0443.',
    openTitle: '\u041d\u0443\u0436\u043d\u0430 \u043f\u043e\u043c\u043e\u0449\u044c \u043f\u043e \u0437\u0430\u043a\u0430\u0437\u0443?',
    openText:
      '\u042d\u0442\u043e \u043e\u0442\u0434\u0435\u043b\u044c\u043d\u043e\u0435 \u043e\u0431\u0440\u0430\u0449\u0435\u043d\u0438\u0435 \u0432 \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0443. \u041e\u043d\u043e \u043d\u0435 \u043f\u043e\u0434\u043c\u0435\u043d\u044f\u0435\u0442 \u043e\u0431\u044b\u0447\u043d\u044b\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044f \u043f\u043e \u0437\u0430\u043a\u0430\u0437\u0443.',
    openAction: '\u041e\u0431\u0440\u0430\u0442\u0438\u0442\u044c\u0441\u044f \u0432 \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0443',
    hideAction: '\u0421\u043a\u0440\u044b\u0442\u044c \u0444\u043e\u0440\u043c\u0443',
    formTitle: '\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u0434\u0438\u0441\u043f\u0443\u0442',
    formText:
      '\u041a\u0440\u0430\u0442\u043a\u043e \u043e\u043f\u0438\u0448\u0438\u0442\u0435 \u0441\u0438\u0442\u0443\u0430\u0446\u0438\u044e. \u041f\u043e\u0441\u043b\u0435 \u043e\u0442\u043f\u0440\u0430\u0432\u043a\u0438 \u043d\u0430 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0435 \u043f\u043e\u044f\u0432\u0438\u0442\u0441\u044f \u0431\u043b\u043e\u043a \u0434\u0438\u0441\u043f\u0443\u0442\u0430, \u0430 \u0447\u0430\u0442 \u0441 \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u043e\u0439 \u0441\u0442\u0430\u043d\u0435\u0442 \u0434\u043e\u0441\u0442\u0443\u043f\u0435\u043d.',
    reasonLabel: '\u041f\u0440\u0438\u0447\u0438\u043d\u0430',
    descriptionLabel: '\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435',
    descriptionPlaceholder:
      '\u041e\u043f\u0438\u0448\u0438\u0442\u0435, \u0447\u0442\u043e \u0438\u043c\u0435\u043d\u043d\u043e \u043f\u043e\u0448\u043b\u043e \u043d\u0435 \u0442\u0430\u043a.',
    submit: '\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c \u0432 \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0443',
    submitting: '\u041e\u0442\u043f\u0440\u0430\u0432\u043b\u044f\u0435\u043c...',
    dismiss: '\u041e\u0442\u043c\u0435\u043d\u0430',
    requiredReason:
      '\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u043f\u0440\u0438\u0447\u0438\u043d\u0443 \u043e\u0431\u0440\u0430\u0449\u0435\u043d\u0438\u044f.',
    requiredDescription:
      '\u041e\u043f\u0438\u0448\u0438\u0442\u0435 \u043f\u0440\u043e\u0431\u043b\u0435\u043c\u0443, \u0447\u0442\u043e\u0431\u044b \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0430 \u043c\u043e\u0433\u043b\u0430 \u0431\u044b\u0441\u0442\u0440\u043e \u0432\u043a\u043b\u044e\u0447\u0438\u0442\u044c\u0441\u044f.',
    activeTitle: '\u0414\u0438\u0441\u043f\u0443\u0442 \u043e\u0442\u043a\u0440\u044b\u0442',
  },
  en: {
    title: 'Order support',
    description:
      'If the normal order flow is blocked, you can escalate this order to support.',
    openTitle: 'Need support on this order?',
    openText:
      'This is a dedicated escalation path and should stay separate from normal order actions.',
    openAction: 'Contact support',
    hideAction: 'Hide form',
    formTitle: 'Open dispute',
    formText:
      'Briefly describe the issue. After submission, the dispute block will appear here and the support chat will become available.',
    reasonLabel: 'Reason',
    descriptionLabel: 'Description',
    descriptionPlaceholder: 'Describe what went wrong.',
    submit: 'Send to support',
    submitting: 'Sending...',
    dismiss: 'Cancel',
    requiredReason: 'Select a dispute reason.',
    requiredDescription: 'Describe the issue so support can review it.',
    activeTitle: 'Dispute is active',
  },
}

function getPanelCopy(language = 'ru') {
  return PANEL_COPY[language] || PANEL_COPY.ru
}

function DisputeMetaItem({ label, value }) {
  if (!value) return null

  return (
    <div className="order-dispute-meta__item">
      <div className="order-dispute-meta__label">{label}</div>
      <div className="order-dispute-meta__value">{value}</div>
    </div>
  )
}

function ActionFeedback({ message }) {
  if (!message?.text) return null

  return <div className={message.tone === 'error' ? 'error' : 'notice'}>{message.text}</div>
}

export default function OrderDisputePanel({
  order,
  dispute,
  language,
  title,
  description,
  actionState = 'idle',
  actionMessage = null,
  isRefreshing = false,
  allowCreate = false,
  onCreateDispute,
}) {
  const copy = useMemo(() => getPanelCopy(language), [language])
  const disputeCopy = useMemo(() => getOrderDisputeCopy(language), [language])
  const reasonOptions = useMemo(() => getOrderDisputeReasonOptions(language), [language])
  const resolvedDispute = dispute || order?.dispute || null
  const hasDisputeValue = hasOrderDispute(resolvedDispute)
  const availableActions = resolveOrderDisputeAvailableActions(resolvedDispute || order)
  const canOpenDispute = allowCreate && !hasDisputeValue && availableActions.canOpenDispute
  const isSubmitting = actionState === 'create-dispute'

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [reasonCode, setReasonCode] = useState(reasonOptions[0]?.value || '')
  const [descriptionValue, setDescriptionValue] = useState('')
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (hasDisputeValue) {
      setIsFormOpen(false)
    }
  }, [hasDisputeValue])

  useEffect(() => {
    setReasonCode(reasonOptions[0]?.value || '')
  }, [reasonOptions])

  if (!hasDisputeValue && !canOpenDispute && !actionMessage?.text) {
    return null
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!onCreateDispute || isSubmitting) return

    if (!reasonCode) {
      setFormError(copy.requiredReason)
      return
    }

    if (!descriptionValue.trim()) {
      setFormError(copy.requiredDescription)
      return
    }

    const didSubmit = await onCreateDispute({
      reasonCode,
      description: descriptionValue.trim(),
    })

    if (didSubmit) {
      setFormError('')
      setDescriptionValue('')
      setReasonCode(reasonOptions[0]?.value || '')
      setIsFormOpen(false)
    }
  }

  const helperText = hasDisputeValue
    ? resolveOrderDisputeHelperText(resolvedDispute, language)
    : copy.openText
  const panelTitle = title || copy.title
  const panelDescription = description || copy.description
  const refreshLabel = language === 'en' ? 'Refreshing' : '\u041e\u0431\u043d\u043e\u0432\u043b\u044f\u0435\u043c'
  const disputeDescription = [
    resolvedDispute?.description,
    resolvedDispute?.body,
    resolvedDispute?.details,
    resolvedDispute?.comment,
  ].find((value) => typeof value === 'string' && value.trim())
  const resolutionQuantityLabel = resolveOrderDisputeResolutionQuantityLabel(
    resolvedDispute,
    language
  )

  return (
    <section className="card order-dispute-card">
      <div className="order-dispute-card__head">
        <div>
          <h2 className="order-section__title">{panelTitle}</h2>
          <p className="order-section__description">{panelDescription}</p>
        </div>
        {isRefreshing ? <span className="order-refresh-badge">{refreshLabel}</span> : null}
      </div>

      <ActionFeedback message={actionMessage} />

      {hasDisputeValue ? (
        <div className="order-dispute-card__body">
          <div className="order-dispute-card__summary">
            <div>
              <div className="order-dispute-card__eyebrow">{copy.activeTitle}</div>
              <div className="order-dispute-card__helper">{helperText}</div>
            </div>

            <span
              className={`status-chip status-chip--${resolveOrderDisputeStatusTone(
                resolvedDispute
              )}`}
            >
              {resolveOrderDisputeStatusLabel(resolvedDispute, language)}
            </span>
          </div>

          {disputeDescription ? (
            <div className="order-dispute-card__description">{disputeDescription}</div>
          ) : null}

          <div className="order-dispute-meta">
            <DisputeMetaItem
              label={disputeCopy.meta.reason}
              value={resolveOrderDisputeReasonLabel(resolvedDispute, language)}
            />
            <DisputeMetaItem
              label={disputeCopy.meta.openedBy}
              value={resolveOrderDisputeOpenedByLabel(resolvedDispute, language)}
            />
            <DisputeMetaItem
              label={disputeCopy.meta.createdAt}
              value={resolveOrderDisputeCreatedAt(resolvedDispute, language)}
            />
            <DisputeMetaItem
              label={disputeCopy.meta.assignedTo}
              value={resolveOrderDisputeAssignedSupportLabel(resolvedDispute, language)}
            />
            <DisputeMetaItem
              label={disputeCopy.meta.resolution}
              value={resolveOrderDisputeResolutionLabel(resolvedDispute, language)}
            />
            <DisputeMetaItem
              label={disputeCopy.meta.amendedQuantity}
              value={resolutionQuantityLabel}
            />
          </div>
        </div>
      ) : (
        <div className="order-dispute-card__body">
          <div className="order-dispute-card__summary">
            <div>
              <div className="order-dispute-card__eyebrow">{copy.openTitle}</div>
              <div className="order-dispute-card__helper">{helperText}</div>
            </div>

            {canOpenDispute ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsFormOpen((current) => !current)
                  setFormError('')
                }}
                disabled={isSubmitting}
              >
                {isFormOpen ? copy.hideAction : copy.openAction}
              </Button>
            ) : null}
          </div>

          {isFormOpen ? (
            <form className="order-dispute-form" onSubmit={handleSubmit}>
              <div className="order-dispute-form__head">
                <div className="order-action-form__title">{copy.formTitle}</div>
                <div className="order-action-form__text">{copy.formText}</div>
              </div>

              <label className="field">
                <span className="field__label">{copy.reasonLabel}</span>
                <select
                  className="input"
                  value={reasonCode}
                  onChange={(event) => {
                    setReasonCode(event.target.value)
                    if (formError) setFormError('')
                  }}
                  disabled={isSubmitting}
                >
                  {reasonOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span className="field__label">{copy.descriptionLabel}</span>
                <textarea
                  className="input order-dispute-form__textarea"
                  rows={4}
                  value={descriptionValue}
                  placeholder={copy.descriptionPlaceholder}
                  onChange={(event) => {
                    setDescriptionValue(event.target.value)
                    if (formError) setFormError('')
                  }}
                  disabled={isSubmitting}
                />
                {formError ? <span className="field__error">{formError}</span> : null}
              </label>

              <div className="order-actions__buttons order-actions__buttons--inline">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? copy.submitting : copy.submit}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setIsFormOpen(false)
                    setFormError('')
                  }}
                  disabled={isSubmitting}
                >
                  {copy.dismiss}
                </Button>
              </div>
            </form>
          ) : null}
        </div>
      )}
    </section>
  )
}
