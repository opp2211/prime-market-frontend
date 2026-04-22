import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import Button from '../../shared/ui/Button'
import { useI18n } from '../../app/i18n'
import { cancelWithdrawalRequest, getWithdrawalRequest } from '../../api/withdrawals'
import { copyToClipboard } from '../../shared/lib/clipboard'
import { getErrorMessage } from '../../shared/lib/errors'
import {
  canCancelWithdrawalRequest,
  formatMoneyAmount,
  formatMoneyDateTime,
  getWithdrawalStatusLabel,
  getWithdrawalStatusTone,
  normalizeDetailsList,
  normalizeWithdrawalRequest,
} from '../../shared/lib/money'
import {
  MoneyDetailList,
  MoneyPageHeader,
  MoneyStateCard,
  MoneyTimeline,
} from './MoneyUI'
import { getMoneyCopy } from './moneyCopy'

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 9h9v11H9z" fill="currentColor" />
      <path
        d="M6 5h9a1 1 0 0 1 1 1v1H8a2 2 0 0 0-2 2v10H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"
        fill="currentColor"
        opacity="0.55"
      />
    </svg>
  )
}

export default function WithdrawalRequestPage() {
  const { language } = useI18n()
  const copy = useMemo(() => getMoneyCopy(language), [language])
  const { publicId } = useParams()
  const location = useLocation()
  const [request, setRequest] = useState(
    location.state?.request ? normalizeWithdrawalRequest(location.state.request) : null
  )
  const [status, setStatus] = useState(location.state?.request ? 'ready' : 'loading')
  const [error, setError] = useState('')
  const [actionStatus, setActionStatus] = useState('idle')
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    let active = true

    async function loadRequest() {
      setStatus('loading')
      setError('')

      try {
        const response = await getWithdrawalRequest(publicId)
        if (!active) return
        setRequest(normalizeWithdrawalRequest(response?.data))
        setStatus('ready')
      } catch (loadError) {
        if (!active) return
        setError(getErrorMessage(loadError, copy.withdrawals.detailsError))
        setStatus('error')
      }
    }

    if (publicId) {
      loadRequest()
    } else {
      setStatus('error')
      setError(copy.withdrawals.detailsError)
    }

    return () => {
      active = false
    }
  }, [copy.withdrawals.detailsError, publicId])

  const detailsList = useMemo(
    () => normalizeDetailsList(request?.requisitesSnapshot),
    [request?.requisitesSnapshot]
  )

  const summaryItems = [
    {
      label: copy.common.requestId,
      value: request?.publicId || copy.common.notAvailable,
    },
    {
      label: copy.common.method,
      value: request?.methodTitle || copy.common.notAvailable,
    },
    {
      label: copy.common.requestedAmount,
      value: `${formatMoneyAmount(request?.amount, {
        language,
        fallback: copy.common.notAvailable,
      })} ${request?.currencyCode || ''}`.trim(),
    },
    request?.actualPayoutAmount != null
      ? {
          label: copy.common.actualPayoutAmount,
          value: `${formatMoneyAmount(request.actualPayoutAmount, {
            language,
            fallback: copy.common.notAvailable,
          })} ${request?.currencyCode || ''}`.trim(),
        }
      : null,
  ].filter(Boolean)

  const timelineItems = [
    request?.createdAt
      ? {
          label: copy.common.createdAt,
          value: formatMoneyDateTime(request.createdAt, {
            language,
            fallback: copy.common.notAvailable,
          }),
        }
      : null,
    request?.approvedAt
      ? {
          label: copy.common.approvedAt,
          value: formatMoneyDateTime(request.approvedAt, {
            language,
            fallback: copy.common.notAvailable,
          }),
        }
      : null,
    request?.completedAt
      ? {
          label: copy.common.completedAt,
          value: formatMoneyDateTime(request.completedAt, {
            language,
            fallback: copy.common.notAvailable,
          }),
        }
      : null,
    request?.rejectedAt
      ? {
          label: copy.common.rejectedAt,
          value: formatMoneyDateTime(request.rejectedAt, {
            language,
            fallback: copy.common.notAvailable,
          }),
        }
      : null,
    request?.cancelledAt
      ? {
          label: copy.common.cancelledAt,
          value: formatMoneyDateTime(request.cancelledAt, {
            language,
            fallback: copy.common.notAvailable,
          }),
        }
      : null,
  ].filter(Boolean)

  const handleCancel = async () => {
    if (!publicId || actionStatus === 'loading') return

    setActionStatus('loading')
    setActionError('')

    try {
      const response = await cancelWithdrawalRequest(publicId)
      setRequest(normalizeWithdrawalRequest(response?.data))
    } catch (submitError) {
      setActionError(getErrorMessage(submitError, copy.withdrawals.cancelError))
    } finally {
      setActionStatus('idle')
    }
  }

  return (
    <div className="account-page money-page">
      <MoneyPageHeader
        eyebrow={copy.common.withdraw}
        title={copy.withdrawals.requestsTitle}
        subtitle={copy.withdrawals.detailsSubtitle}
        actions={
          <div className="money-page-header__actions">
            <Link to="/money/withdrawal-requests" className="btn btn--secondary">
              {copy.withdrawals.requestsTitle}
            </Link>
            <Link to="/money/withdraw" className="btn btn--primary">
              {copy.withdrawals.newWithdrawal}
            </Link>
          </div>
        }
      />

      {status === 'loading' ? (
        <MoneyStateCard title={copy.common.loading} text={copy.withdrawals.detailsSubtitle} />
      ) : null}
      {status === 'error' ? (
        <MoneyStateCard tone="danger" title={copy.common.noDataTitle} text={error} />
      ) : null}

      {status === 'ready' && request ? (
        <>
          <div className="money-two-column">
            <div className="card money-section-card">
              <div className="money-section-card__head">
                <div className="money-section-card__title">{copy.common.summary}</div>
                <span className={`status-chip status-chip--${getWithdrawalStatusTone(request.status)}`}>
                  {getWithdrawalStatusLabel(request.status, copy)}
                </span>
              </div>

              <MoneyDetailList items={summaryItems} />
              <div className="request-id request-id--inline">
                <button
                  type="button"
                  className="request-id__value"
                  onClick={() => copyToClipboard(request.publicId)}
                >
                  {request.publicId}
                </button>
                <button
                  type="button"
                  className="copy-btn copy-btn--inline"
                  onClick={() => copyToClipboard(request.publicId)}
                  title={copy.common.requestId}
                  aria-label={copy.common.requestId}
                >
                  <CopyIcon />
                </button>
              </div>

              {request.operatorComment ? (
                <div className="money-note-box">
                  <div className="money-note-box__title">{copy.withdrawals.detailComment}</div>
                  <div className="money-note-box__text">{request.operatorComment}</div>
                </div>
              ) : null}

              {request.rejectReason ? (
                <div className="money-note-box money-note-box--danger">
                  <div className="money-note-box__title">{copy.withdrawals.detailReason}</div>
                  <div className="money-note-box__text">{request.rejectReason}</div>
                </div>
              ) : null}

              {actionError ? <div className="error">{actionError}</div> : null}
              {canCancelWithdrawalRequest(request.status) ? (
                <div className="request-actions">
                  <Button
                    type="button"
                    variant="secondary"
                    className="request-action request-action--danger"
                    disabled={actionStatus === 'loading'}
                    onClick={handleCancel}
                  >
                    {copy.withdrawals.cancelAction}
                  </Button>
                </div>
              ) : null}
            </div>

            <div className="card money-section-card">
              <div className="money-section-card__head">
                <div className="money-section-card__title">{copy.withdrawals.timeline}</div>
              </div>
              <MoneyTimeline items={timelineItems} emptyLabel={copy.withdrawals.noTimeline} />
            </div>
          </div>

          <div className="card payment-details">
            <div className="payment-details__head">
              <div className="payment-details__title">{copy.withdrawals.payoutRequisites}</div>
              {detailsList.length > 0 ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    copyToClipboard(detailsList.map((item) => `${item.key}: ${item.value}`).join('\n'))
                  }
                >
                  {copy.common.requisites}
                </Button>
              ) : null}
            </div>

            {detailsList.length > 0 ? (
              <div className="payment-details__list">
                {detailsList.map((item) => (
                  <div className="payment-details__row" key={`${item.key}-${item.value}`}>
                    <div className="payment-details__key">{item.key}</div>
                    <div className="payment-details__value">
                      <button
                        type="button"
                        className="payment-details__value-btn"
                        onClick={() => copyToClipboard(item.value)}
                      >
                        {item.value}
                      </button>
                      <button
                        type="button"
                        className="copy-btn copy-btn--inline"
                        onClick={() => copyToClipboard(item.value)}
                      >
                        <CopyIcon />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="muted">{copy.withdrawals.payoutRequisitesEmpty}</div>
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}
