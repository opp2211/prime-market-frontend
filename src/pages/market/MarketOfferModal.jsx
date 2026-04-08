import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { getMarketOfferDetails } from '../../api/market'
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

export default function MarketOfferModal({
  offer,
  intent,
  viewerCurrencyCode,
  copy,
  language,
  onClose,
}) {
  const [details, setDetails] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!offer?.id) return undefined

    let active = true

    const loadOffer = async () => {
      setStatus('loading')
      setError('')

      try {
        const response = await getMarketOfferDetails(offer.id, {
          intent,
          viewerCurrencyCode,
        })
        if (!active) return
        setDetails(response?.data || null)
        setStatus('ready')
      } catch (err) {
        if (!active) return
        setDetails(null)
        setError(getErrorMessage(err, copy.errors.offerDetails))
        setStatus('error')
      }
    }

    loadOffer()

    return () => {
      active = false
    }
  }, [copy.errors.offerDetails, intent, offer?.id, reloadKey, viewerCurrencyCode])

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

  if (!offer) return null

  const currentOffer = details || offer
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

        {status === 'loading' ? (
          <div className="market-modal__loading">
            <div className="skeleton market-skeleton market-skeleton--modal-hero" />
            <div className="skeleton market-skeleton market-skeleton--modal-grid" />
            <div className="skeleton market-skeleton market-skeleton--modal-block" />
          </div>
        ) : null}

        {status === 'error' ? (
          <div className="market-modal__error">
            <div className="error">{error || copy.modal.error}</div>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => setReloadKey((value) => value + 1)}
            >
              {copy.common.retry}
            </button>
          </div>
        ) : null}

        {status === 'ready' ? (
          <>
            <div className="market-modal__hero">
              <div className="market-modal__price">
                {formatMarketPrice(
                  currentOffer?.price?.amount,
                  currentOffer?.price?.currencyCode,
                  language
                )}
              </div>
              <div className="market-modal__hero-meta">
                {buildContextSummary(currentOffer, copy.common.noValue)} •{' '}
                {buildDeliveryMethodsSummary(currentOffer, copy.common.noValue)}
              </div>
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
          </>
        ) : null}

        <div className="market-modal__footer">
          <button type="button" className="btn btn--primary" disabled>
            {resolveMarketActionLabel(currentOffer?.action || offer?.action, copy)}
          </button>
          <div className="market-modal__footer-note">{copy.modal.primaryDisabledHint}</div>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            {copy.common.close}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
