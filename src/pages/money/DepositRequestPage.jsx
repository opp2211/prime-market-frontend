import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import Button from '../../shared/ui/Button'
import {
  cancelDepositRequest,
  getDepositRequest,
  markDepositRequestPaid,
} from '../../api/depositRequests'
import { useI18n } from '../../app/i18n'
import {
  canCancelDepositRequest,
  canMarkPaidDepositRequest,
  resolveDepositStatusLabel,
  resolveDepositStatusTone,
} from '../../app/depositRequests'
import { getErrorMessage } from '../../shared/lib/errors'
import { copyToClipboard } from '../../shared/lib/clipboard'
import {
  formatMoneyAmount,
  formatMoneyDateTime,
  normalizeDepositRequest,
  normalizeDetailsList,
} from '../../shared/lib/money'
import {
  MoneyDetailList,
  MoneyPageHeader,
  MoneyStateCard,
  MoneyTimeline,
} from './MoneyUI'
import { getMoneyCopy } from './moneyCopy'

function getStatusInfo(status, rejectReason, t) {
  switch (status) {
    case 'PENDING_DETAILS':
      return t('account.depositInfoPendingDetails')
    case 'WAITING_PAYMENT':
      return t('account.depositInfoWaitingPayment')
    case 'PAYMENT_VERIFICATION':
      return t('account.depositInfoPaymentVerification')
    case 'CONFIRMED':
      return t('account.depositInfoConfirmed')
    case 'REJECTED':
      return rejectReason
        ? `${t('account.depositInfoRejected')} ${t('account.depositInfoRejectedReason')}: ${rejectReason}`
        : t('account.depositInfoRejected')
    case 'CANCELLED':
      return t('account.depositInfoCancelled')
    default:
      return t('account.depositInfoDefault')
  }
}

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

export default function DepositRequestPage() {
  const { t, language } = useI18n()
  const copy = useMemo(() => getMoneyCopy(language), [language])
  const { publicCode } = useParams()
  const location = useLocation()
  const [request, setRequest] = useState(
    location.state?.request ? normalizeDepositRequest(location.state.request) : null
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
        const response = await getDepositRequest(publicCode)
        if (!active) return
        setRequest(normalizeDepositRequest(response?.data))
        setStatus('ready')
      } catch (loadError) {
        if (!active) return
        setError(getErrorMessage(loadError, t('account.depositRequestLoadError')))
        setStatus('error')
      }
    }

    if (publicCode) {
      loadRequest()
    } else {
      setStatus('error')
      setError(t('account.depositRequestLoadError'))
    }

    return () => {
      active = false
    }
  }, [publicCode, t])

  const paymentDetails = useMemo(
    () => normalizeDetailsList(request?.paymentDetails),
    [request?.paymentDetails]
  )

  const actionLoading = actionStatus === 'loading'
  const allowMarkPaid = canMarkPaidDepositRequest(request?.status)
  const allowCancel = canCancelDepositRequest(request?.status)
  const infoText = getStatusInfo(request?.status, request?.rejectReason, t)
  const detailItems = [
    {
      label: copy.common.requestId,
      value: request?.publicCode || copy.common.notAvailable,
    },
    {
      label: copy.common.method,
      value: request?.methodTitle || copy.common.notAvailable,
    },
    {
      label: copy.common.amount,
      value: `${formatMoneyAmount(request?.amount, {
        language,
        fallback: copy.common.notAvailable,
      })} ${request?.currencyCode || ''}`.trim(),
    },
  ]

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
    request?.detailsIssuedAt
      ? {
          label: t('account.depositRequestDetailsIssuedAt'),
          value: formatMoneyDateTime(request.detailsIssuedAt, {
            language,
            fallback: copy.common.notAvailable,
          }),
        }
      : null,
    request?.userMarkedPaidAt
      ? {
          label: t('account.depositRequestMarkedPaidAt'),
          value: formatMoneyDateTime(request.userMarkedPaidAt, {
            language,
            fallback: copy.common.notAvailable,
          }),
        }
      : null,
    request?.confirmedAt
      ? {
          label: t('account.depositRequestConfirmedAt'),
          value: formatMoneyDateTime(request.confirmedAt, {
            language,
            fallback: copy.common.notAvailable,
          }),
        }
      : null,
    request?.rejectedAt
      ? {
          label: t('account.depositRequestRejectedAt'),
          value: formatMoneyDateTime(request.rejectedAt, {
            language,
            fallback: copy.common.notAvailable,
          }),
        }
      : null,
    request?.cancelledAt
      ? {
          label: t('account.depositRequestCancelledAt'),
          value: formatMoneyDateTime(request.cancelledAt, {
            language,
            fallback: copy.common.notAvailable,
          }),
        }
      : null,
  ].filter(Boolean)

  const handleMarkPaid = async () => {
    if (!publicCode || actionLoading) return
    setActionStatus('loading')
    setActionError('')

    try {
      const response = await markDepositRequestPaid(publicCode)
      setRequest(normalizeDepositRequest(response?.data))
    } catch (submitError) {
      setActionError(getErrorMessage(submitError, t('account.depositRequestActionError')))
    } finally {
      setActionStatus('idle')
    }
  }

  const handleCancel = async () => {
    if (!publicCode || actionLoading) return
    setActionStatus('loading')
    setActionError('')

    try {
      const response = await cancelDepositRequest(publicCode)
      setRequest(normalizeDepositRequest(response?.data))
    } catch (submitError) {
      setActionError(getErrorMessage(submitError, t('account.depositRequestActionError')))
    } finally {
      setActionStatus('idle')
    }
  }

  return (
    <div className="account-page money-page">
      <MoneyPageHeader
        eyebrow={copy.common.deposit}
        title={t('account.depositRequestTitle')}
        subtitle={copy.deposits.detailsSubtitle}
        actions={
          <div className="money-page-header__actions">
            <Link to="/money/deposit-requests" className="btn btn--secondary">
              {copy.deposits.openList}
            </Link>
            <Link to="/money/deposit" className="btn btn--primary">
              {copy.deposits.newDeposit}
            </Link>
          </div>
        }
      />

      {status === 'loading' ? (
        <MoneyStateCard title={copy.common.loading} text={copy.deposits.detailsSubtitle} />
      ) : null}
      {status === 'error' ? (
        <MoneyStateCard tone="danger" title={copy.common.noDataTitle} text={error} />
      ) : null}

      {status === 'ready' && request ? (
        <>
          <div className="card request-info">
            <div className="request-info__title">{copy.deposits.statusNoteTitle}</div>
            <div className="request-info__text">{infoText}</div>
          </div>

          <div className="money-two-column">
            <div className="card money-section-card">
              <div className="money-section-card__head">
                <div className="money-section-card__title">{copy.common.summary}</div>
                <span className={`status-chip status-chip--${resolveDepositStatusTone(request.status)}`}>
                  {resolveDepositStatusLabel(request.status, t)}
                </span>
              </div>
              <MoneyDetailList items={detailItems} />
              <div className="request-id request-id--inline">
                <button
                  type="button"
                  className="request-id__value"
                  onClick={() => copyToClipboard(request.publicCode)}
                >
                  {request.publicCode}
                </button>
                <button
                  type="button"
                  className="copy-btn copy-btn--inline"
                  onClick={() => copyToClipboard(request.publicCode)}
                  title={t('account.depositCopyId')}
                  aria-label={t('account.depositCopyId')}
                >
                  <CopyIcon />
                </button>
              </div>
              {actionError ? <div className="error">{actionError}</div> : null}
              {allowMarkPaid || allowCancel ? (
                <div className="request-actions">
                  {allowMarkPaid ? (
                    <Button type="button" onClick={handleMarkPaid} disabled={actionLoading}>
                      {t('account.depositRequestMarkPaid')}
                    </Button>
                  ) : null}
                  {allowCancel ? (
                    <Button
                      type="button"
                      variant="secondary"
                      className="request-action request-action--danger"
                      onClick={handleCancel}
                      disabled={actionLoading}
                    >
                      {t('account.depositRequestCancel')}
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="card money-section-card">
              <div className="money-section-card__head">
                <div className="money-section-card__title">{copy.deposits.timeline}</div>
              </div>
              <MoneyTimeline items={timelineItems} emptyLabel={copy.deposits.noTimeline} />
            </div>
          </div>

          <div className="card payment-details">
            <div className="payment-details__head">
              <div className="payment-details__title">{copy.common.requisites}</div>
              {paymentDetails.length > 0 ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    copyToClipboard(
                      paymentDetails.map((item) => `${item.key}: ${item.value}`).join('\n')
                    )
                  }
                >
                  {t('account.depositCopyAllDetails')}
                </Button>
              ) : null}
            </div>

            {paymentDetails.length > 0 ? (
              <div className="payment-details__list">
                {paymentDetails.map((item) => (
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
              <div className="muted">{copy.deposits.paymentDetailsEmpty}</div>
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}
