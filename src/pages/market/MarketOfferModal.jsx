import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { refreshMarketOfferQuote } from '../../api/market'
import { createOrder } from '../../api/orders'
import { getErrorMessage } from '../../shared/lib/errors'
import {
  buildContextSummary,
  buildDeliveryMethodsSummary,
  buildMarketOfferTitle,
  formatMarketDate,
  formatMarketNumber,
  formatMarketPrice,
  resolveMarketActionLabel,
} from './marketPresentation'

function DetailsGridItem({ label, value }) {
  return (
    <div className="market-modal__stat">
      <div className="market-modal__stat-label">{label}</div>
      <div className="market-modal__stat-value">{value}</div>
    </div>
  )
}

function DetailsTags({ items, emptyLabel }) {
  if (!items.length) {
    return <div className="market-modal__text">{emptyLabel}</div>
  }

  return (
    <div className="market-modal__tags">
      {items.map((item) => (
        <span key={item.key} className="market-modal__tag">
          {item.label}
        </span>
      ))}
    </div>
  )
}

function toFiniteNumber(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function toPositiveNumber(value) {
  const parsed = toFiniteNumber(value)
  return parsed != null && parsed > 0 ? parsed : null
}

function parseQuantityInput(value) {
  if (value == null) return null
  const normalized = String(value).replace(',', '.').trim()
  if (!normalized) return null
  return toFiniteNumber(normalized)
}

function formatQuoteTimer(secondsLeft) {
  const seconds = Math.max(0, Math.floor(secondsLeft))
  const minutesPart = Math.floor(seconds / 60)
  const secondsPart = seconds % 60
  return `${String(minutesPart).padStart(2, '0')}:${String(secondsPart).padStart(2, '0')}`
}

function resolveCreatedOrderRouteId(payload) {
  if (!payload || typeof payload !== 'object') return ''

  return payload.publicId || ''
}

function resolveInitialQuantity(snapshot) {
  const min = toPositiveNumber(snapshot?.minTradeQuantity)
  const step = toPositiveNumber(snapshot?.quantityStep)
  const max = toPositiveNumber(snapshot?.maxTradeQuantity)
  const available = toPositiveNumber(snapshot?.quantity)

  let candidate = min || step || 1

  if (max && candidate > max) {
    candidate = max
  }
  if (available && candidate > available) {
    candidate = available
  }
  if (!Number.isFinite(candidate) || candidate <= 0) {
    candidate = 1
  }

  return String(candidate)
}

function hasStepMismatch(quantity, step, min) {
  if (!step || step <= 0) return false
  const base = min && min > 0 ? min : 0
  const ratio = (quantity - base) / step
  return Math.abs(ratio - Math.round(ratio)) > 1e-8
}

function validateQuantity({
  quantity,
  minTradeQuantity,
  maxTradeQuantity,
  availableQuantity,
  quantityStep,
  messages,
}) {
  if (quantity == null || !Number.isFinite(quantity)) return messages.invalid
  if (quantity <= 0) return messages.positive
  if (minTradeQuantity && quantity < minTradeQuantity) {
    return messages.min(minTradeQuantity)
  }
  if (maxTradeQuantity && quantity > maxTradeQuantity) {
    return messages.max(maxTradeQuantity)
  }
  if (availableQuantity && quantity > availableQuantity) {
    return messages.available(availableQuantity)
  }
  if (hasStepMismatch(quantity, quantityStep, minTradeQuantity)) {
    return messages.step(quantityStep)
  }

  return ''
}

export default function MarketOfferModal({
  offer,
  initialQuote,
  copy,
  language,
  onClose,
}) {
  const navigate = useNavigate()
  const [quote, setQuote] = useState(initialQuote || null)
  const [quantityInput, setQuantityInput] = useState(() =>
    resolveInitialQuantity(initialQuote || offer)
  )
  const [nowTs, setNowTs] = useState(Date.now)
  const [refreshState, setRefreshState] = useState('idle')
  const [refreshError, setRefreshError] = useState('')
  const [submitState, setSubmitState] = useState('idle')
  const [submitError, setSubmitError] = useState('')

  const modalMessages = {
    quoteTimer: copy.modal.quoteTimer || 'Quote expires in',
    quoteExpired: copy.modal.quoteExpired || 'Quote expired. Refreshing...',
    quoteRefreshing: copy.modal.quoteRefreshing || 'Refreshing quote...',
    refreshButton: copy.modal.refreshButton || 'Refresh quote',
    quantityInputLabel: copy.modal.quantityInputLabel || 'Quantity to order',
    quantityHintsPrefix: copy.modal.quantityHintsPrefix || 'Constraints',
    totalLabel: copy.modal.totalLabel || 'Total',
    unitPriceLabel: copy.modal.unitPriceLabel || 'Unit price',
    sectionOrder: copy.modal.sectionOrder || 'Order',
    quantityHintAvailable: copy.modal.quantityHintAvailable || 'available',
    quantityHintMin: copy.modal.quantityHintMin || 'min',
    quantityHintMax: copy.modal.quantityHintMax || 'max',
    quantityHintStep: copy.modal.quantityHintStep || 'step',
    unavailable:
      copy.modal.unavailable ||
      'Offer is currently unavailable. Close this modal and choose another offer.',
    priceChanged:
      copy.modal.priceChanged ||
      'Price changed due to currency rate update. Please review the updated total.',
    offerUpdated:
      copy.modal.offerUpdated ||
      'Offer updated. Please review the new terms before creating the order.',
    submitPending: copy.modal.submitPending || 'Creating order...',
    submitReady: copy.modal.submitReady || 'Review quantity and create order.',
    submitExpired: copy.modal.submitExpired || 'Quote expired. Waiting for refresh.',
    invalidQuantity: copy.modal.invalidQuantity || 'Enter a valid quantity.',
    positiveQuantity: copy.modal.positiveQuantity || 'Quantity must be greater than zero.',
    minQuantity: (value) =>
      copy.modal.minQuantity?.replace('{value}', String(value)) ||
      `Quantity must be at least ${value}.`,
    maxQuantity: (value) =>
      copy.modal.maxQuantity?.replace('{value}', String(value)) ||
      `Quantity must be at most ${value}.`,
    availableQuantity: (value) =>
      copy.modal.availableQuantity?.replace('{value}', String(value)) ||
      `Quantity cannot exceed available amount (${value}).`,
    stepQuantity: (value) =>
      copy.modal.stepQuantity?.replace('{value}', String(value)) ||
      `Quantity must respect step ${value}.`,
  }

  useEffect(() => {
    const snapshot = initialQuote || offer
    setQuote(initialQuote || null)
    setQuantityInput(resolveInitialQuantity(snapshot))
    setNowTs(Date.now())
    setRefreshState('idle')
    setRefreshError('')
    setSubmitState('idle')
    setSubmitError('')
  }, [initialQuote, offer])

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  useEffect(() => {
    if (!quote?.expiresAt || refreshState === 'unavailable') return undefined

    const timerId = window.setInterval(() => {
      setNowTs(Date.now())
    }, 1000)

    return () => {
      window.clearInterval(timerId)
    }
  }, [quote?.expiresAt, refreshState])
  const quoteId = quote?.quoteId || ''
  const expiresAtTs = Date.parse(quote?.expiresAt || '')
  const hasQuoteExpiration = Number.isFinite(expiresAtTs) && expiresAtTs > 0
  const secondsLeft = hasQuoteExpiration ? Math.max(0, Math.ceil((expiresAtTs - nowTs) / 1000)) : 0
  const isQuoteExpired = !hasQuoteExpiration || secondsLeft <= 0
  const isRefreshing = refreshState === 'refreshing'
  const isUnavailable = refreshState === 'unavailable'
  const isSubmitting = submitState === 'submitting'

  const runRefreshQuote = useCallback(
    async ({ allowDuringSubmit = false, clearSubmitError = true } = {}) => {
      if (!quoteId || isRefreshing || (isSubmitting && !allowDuringSubmit) || isUnavailable) {
        return null
      }

      setRefreshState('refreshing')
      setRefreshError('')
      if (clearSubmitError) {
        setSubmitError('')
      }

      try {
        const response = await refreshMarketOfferQuote(quoteId)
        const nextQuote = response?.data || null

        if (!nextQuote?.quoteId) {
          throw new Error(copy.errors.quoteRefresh || copy.errors.offerDetails || copy.modal.error)
        }

        setQuote(nextQuote)
        setNowTs(Date.now())
        setRefreshState('idle')
        return nextQuote
      } catch (err) {
        const status = err?.response?.status
        setRefreshError(
          getErrorMessage(
            err,
            copy.errors.quoteRefresh || copy.errors.offerDetails || copy.modal.error
          )
        )

        if (status === 404 || status === 409 || status === 410 || status === 422) {
          setRefreshState('unavailable')
        } else {
          setRefreshState('error')
        }

        return null
      }
    },
    [
      copy.errors.offerDetails,
      copy.errors.quoteRefresh,
      copy.modal.error,
      isRefreshing,
      isSubmitting,
      isUnavailable,
      quoteId,
    ]
  )

  useEffect(() => {
    if (!quoteId) return
    if (!hasQuoteExpiration) return
    if (!isQuoteExpired) return
    if (refreshState !== 'idle') return

    void runRefreshQuote()
  }, [hasQuoteExpiration, isQuoteExpired, quoteId, refreshState, runRefreshQuote])

  if (!offer && !quote) return null

  const currentOffer = quote || offer
  const availableQuantity = toPositiveNumber(currentOffer?.quantity)
  const minTradeQuantity = toPositiveNumber(currentOffer?.minTradeQuantity)
  const maxTradeQuantity = toPositiveNumber(currentOffer?.maxTradeQuantity)
  const quantityStep = toPositiveNumber(currentOffer?.quantityStep)

  const parsedQuantity = parseQuantityInput(quantityInput)
  const quantityValidationError = validateQuantity({
    quantity: parsedQuantity,
    minTradeQuantity,
    maxTradeQuantity,
    availableQuantity,
    quantityStep,
    messages: {
      invalid: modalMessages.invalidQuantity,
      positive: modalMessages.positiveQuantity,
      min: modalMessages.minQuantity,
      max: modalMessages.maxQuantity,
      available: modalMessages.availableQuantity,
      step: modalMessages.stepQuantity,
    },
  })

  const unitPriceAmount = toFiniteNumber(currentOffer?.price?.amount)
  const computedTotal =
    unitPriceAmount != null && parsedQuantity != null ? unitPriceAmount * parsedQuantity : null
  const inputMax =
    maxTradeQuantity && availableQuantity
      ? Math.min(maxTradeQuantity, availableQuantity)
      : maxTradeQuantity || availableQuantity || undefined
  const canSubmit =
    Boolean(quoteId) &&
    !isQuoteExpired &&
    !isRefreshing &&
    !isSubmitting &&
    !isUnavailable &&
    !quantityValidationError

  const quantityHints = [
    availableQuantity
      ? `${modalMessages.quantityHintAvailable} ${formatMarketNumber(availableQuantity, language)}`
      : null,
    minTradeQuantity
      ? `${modalMessages.quantityHintMin} ${formatMarketNumber(minTradeQuantity, language)}`
      : null,
    maxTradeQuantity
      ? `${modalMessages.quantityHintMax} ${formatMarketNumber(maxTradeQuantity, language)}`
      : null,
    quantityStep
      ? `${modalMessages.quantityHintStep} ${formatMarketNumber(quantityStep, language)}`
      : null,
  ]
    .filter(Boolean)
    .join(' | ')

  const contextItems = (Array.isArray(currentOffer?.contexts) ? currentOffer.contexts : []).map(
    (item) => ({
      key: `${item.dimensionSlug}:${item.valueSlug}`,
      label: item.valueTitle || item.valueSlug,
    })
  )
  const attributeItems = (Array.isArray(currentOffer?.attributes) ? currentOffer.attributes : []).map(
    (item, index) => ({
      key: `${item.attributeSlug}:${item.optionSlug || item.valueText || item.valueNumber || item.valueBoolean || index}`,
      label:
        item.optionTitle ||
        item.valueText ||
        (item.valueNumber != null ? String(item.valueNumber) : '') ||
        (typeof item.valueBoolean === 'boolean' ? String(item.valueBoolean) : '') ||
        item.attributeSlug,
    })
  )
  const deliveryItems = (
    Array.isArray(currentOffer?.deliveryMethods) ? currentOffer.deliveryMethods : []
  ).map((item) => ({
    key: item.slug,
    label: item.title || item.slug,
  }))

  async function handleSubmitOrder() {
    if (!canSubmit || !quoteId || parsedQuantity == null) return

    setSubmitState('submitting')
    setSubmitError('')

    try {
      const response = await createOrder({
        quoteId,
        quantity: parsedQuantity,
      })
      const publicId = resolveCreatedOrderRouteId(response?.data)

      if (!publicId) {
        throw new Error(copy.errors.orderCreate || copy.errors.offers)
      }

      navigate(`/orders/${publicId}`)
    } catch (err) {
      const status = err?.response?.status
      setSubmitError(getErrorMessage(err, copy.errors.orderCreate || copy.errors.offers))

      if (status === 409 || status === 410 || status === 422) {
        await runRefreshQuote({
          allowDuringSubmit: true,
          clearSubmitError: false,
        })
      }
    } finally {
      setSubmitState('idle')
    }
  }

  const submitHint = isUnavailable
    ? modalMessages.unavailable
    : isSubmitting
      ? modalMessages.submitPending
      : isRefreshing
        ? modalMessages.quoteRefreshing
        : isQuoteExpired
          ? modalMessages.submitExpired
          : quantityValidationError || modalMessages.submitReady

  return createPortal(
    <div className="market-modal" role="presentation">
      <div className="market-modal__backdrop" onClick={onClose} />
      <div className="market-modal__dialog" role="dialog" aria-modal="true">
        <div className="market-modal__head">
          <div>
            <div className="market-modal__eyebrow">{copy.modal.title}</div>
            <div className="market-modal__title">{buildMarketOfferTitle(currentOffer, copy)}</div>
            <div className="market-modal__subtitle">
              {copy.list.owner}: {currentOffer?.owner?.username || copy.common.noValue}
            </div>
          </div>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            {copy.common.close}
          </button>
        </div>

        {quote?.offerUpdated ? (
          <div className="error market-modal__notice">{modalMessages.offerUpdated}</div>
        ) : null}
        {!quote?.offerUpdated && quote?.priceChanged ? (
          <div className="notice market-modal__notice">{modalMessages.priceChanged}</div>
        ) : null}
        {refreshError ? <div className="error market-modal__notice">{refreshError}</div> : null}
        {submitError ? <div className="error market-modal__notice">{submitError}</div> : null}

        <div className="market-modal__deal">
          <section className="market-modal__price-card">
            <div className="market-modal__section-title">{modalMessages.unitPriceLabel}</div>
            <div className="market-modal__price">
              {formatMarketPrice(
                currentOffer?.price?.amount,
                currentOffer?.price?.currencyCode,
                language
              )}
            </div>
            <div className="market-modal__hero-meta">
              {buildContextSummary(currentOffer, copy.common.noValue)} |{' '}
              {buildDeliveryMethodsSummary(currentOffer, copy.common.noValue)}
            </div>
            <div className="market-modal__timer">
              <span>{modalMessages.quoteTimer}</span>
              <strong>
                {isUnavailable
                  ? copy.common.noValue
                  : isRefreshing
                    ? modalMessages.quoteRefreshing
                    : formatQuoteTimer(secondsLeft)}
              </strong>
            </div>
            {isQuoteExpired && !isUnavailable ? (
              <div className="market-modal__text">{modalMessages.quoteExpired}</div>
            ) : null}
            <button
              type="button"
              className="btn btn--ghost market-modal__refresh"
              onClick={runRefreshQuote}
              disabled={!quoteId || isRefreshing || isSubmitting || isUnavailable}
            >
              {modalMessages.refreshButton}
            </button>
          </section>

          <section className="market-modal__ticket">
            <div className="market-modal__section-title">{modalMessages.sectionOrder}</div>
            <label className="field market-modal__quantity-field">
              <span className="field__label">{modalMessages.quantityInputLabel}</span>
              <input
                type="number"
                className="input"
                value={quantityInput}
                min={minTradeQuantity || 0}
                max={inputMax}
                step={quantityStep || 'any'}
                onChange={(event) => setQuantityInput(event.target.value)}
                disabled={isRefreshing || isSubmitting || isUnavailable}
              />
            </label>
            <div className="market-modal__hint">
              {modalMessages.quantityHintsPrefix}: {quantityHints || copy.common.noValue}
            </div>
            <div className="market-modal__summary">
              <div className="market-modal__summary-row">
                <span>{modalMessages.unitPriceLabel}</span>
                <strong>
                  {formatMarketPrice(
                    currentOffer?.price?.amount,
                    currentOffer?.price?.currencyCode,
                    language
                  )}
                </strong>
              </div>
              <div className="market-modal__summary-row">
                <span>{modalMessages.quantityInputLabel}</span>
                <strong>
                  {parsedQuantity != null
                    ? formatMarketNumber(parsedQuantity, language)
                    : copy.common.noValue}
                </strong>
              </div>
              <div className="market-modal__summary-row market-modal__summary-row--total">
                <span>{modalMessages.totalLabel}</span>
                <strong>
                  {computedTotal != null
                    ? formatMarketPrice(computedTotal, currentOffer?.price?.currencyCode, language)
                    : copy.common.noValue}
                </strong>
              </div>
            </div>
            <div className="market-modal__footer-note market-modal__footer-note--ticket">
              {submitHint}
            </div>
          </section>
        </div>

        <div className="market-modal__stats">
          <DetailsGridItem
            label={copy.modal.quantity}
            value={formatMarketNumber(currentOffer?.quantity, language)}
          />
          <DetailsGridItem
            label={copy.modal.minTradeQuantity}
            value={formatMarketNumber(currentOffer?.minTradeQuantity, language)}
          />
          <DetailsGridItem
            label={copy.modal.maxTradeQuantity}
            value={formatMarketNumber(currentOffer?.maxTradeQuantity, language)}
          />
          <DetailsGridItem
            label={copy.modal.quantityStep}
            value={formatMarketNumber(currentOffer?.quantityStep, language)}
          />
          <DetailsGridItem
            label={copy.modal.publishedAt}
            value={formatMarketDate(currentOffer?.publishedAt, language)}
          />
        </div>

        <div className="market-modal__sections">
          <section className="market-modal__section">
            <div className="market-modal__section-title">{copy.modal.sectionContext}</div>
            <DetailsTags items={contextItems} emptyLabel={copy.common.noValue} />
          </section>

          <section className="market-modal__section">
            <div className="market-modal__section-title">{copy.modal.sectionAttributes}</div>
            <DetailsTags items={attributeItems} emptyLabel={copy.common.noValue} />
          </section>

          <section className="market-modal__section">
            <div className="market-modal__section-title">{copy.modal.sectionDelivery}</div>
            <DetailsTags items={deliveryItems} emptyLabel={copy.common.noValue} />
          </section>

          <section className="market-modal__section">
            <div className="market-modal__section-title">{copy.modal.sectionTerms}</div>
            <div className="market-modal__text">
              {currentOffer?.tradeTerms?.trim() || copy.modal.tradeTermsFallback}
            </div>
          </section>

          <section className="market-modal__section">
            <div className="market-modal__section-title">{copy.modal.sectionDescription}</div>
            <div className="market-modal__text">
              {currentOffer?.description?.trim() || copy.modal.descriptionFallback}
            </div>
          </section>

        </div>

        <div className="market-modal__footer">
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleSubmitOrder}
            disabled={!canSubmit}
          >
            {isSubmitting
              ? modalMessages.submitPending
              : resolveMarketActionLabel(currentOffer?.action || offer?.action, copy)}
          </button>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            {copy.common.close}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
