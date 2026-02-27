import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import Button from '../../components/Button'
import {
  cancelDepositRequest,
  getDepositRequest,
  markDepositRequestPaid,
} from '../../api/depositRequests'
import { getErrorMessage } from '../../app/errors'
import { useI18n } from '../../app/i18n'
import {
  canCancelDepositRequest,
  canMarkPaidDepositRequest,
  resolveDepositStatusLabel,
  resolveDepositStatusTone,
} from '../../app/depositRequests'

function formatAmount(value) {
  const num = Number(value)
  if (Number.isFinite(num)) return num.toFixed(4)
  return '—'
}

function formatDate(value, t) {
  if (!value) return t('account.notAvailable')
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return t('account.notAvailable')
  return date.toLocaleString()
}

function copyToClipboard(text) {
  if (!text) return
  const value = String(text)
  if (navigator?.clipboard?.writeText) {
    navigator.clipboard.writeText(value)
    return
  }
  const textarea = document.createElement('textarea')
  textarea.value = value
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'absolute'
  textarea.style.left = '-9999px'
  document.body.appendChild(textarea)
  textarea.select()
  try {
    document.execCommand('copy')
  } catch {
    // ignore
  }
  document.body.removeChild(textarea)
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

function normalizePaymentDetails(details, t) {
  if (!details) return []
  let payload = details
  if (typeof details === 'string') {
    const trimmed = details.trim()
    if (!trimmed) return []
    try {
      payload = JSON.parse(trimmed)
    } catch {
      return [[t('account.depositRequestPaymentDetails'), trimmed]]
    }
  }

  const formatDetailValue = (value) => {
    if (value == null) return ''
    if (typeof value === 'object') return JSON.stringify(value)
    return String(value)
  }

  if (Array.isArray(payload)) {
    return payload.map((value, index) => [String(index + 1), formatDetailValue(value)])
  }

  if (payload && typeof payload === 'object') {
    return Object.entries(payload).map(([key, value]) => [key, formatDetailValue(value)])
  }

  return [[t('account.depositRequestPaymentDetails'), formatDetailValue(payload)]]
}

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
      if (rejectReason) {
        return `${t('account.depositInfoRejected')} ${t('account.depositInfoRejectedReason')}: ${rejectReason}`
      }
      return t('account.depositInfoRejected')
    case 'CANCELLED':
      return t('account.depositInfoCancelled')
    default:
      return t('account.depositInfoDefault')
  }
}

function getStatusTime(status, request, t) {
  if (!request) return null
  const mapping = {
    WAITING_PAYMENT: [t('account.depositRequestDetailsIssuedAt'), request.details_issued_at],
    PAYMENT_VERIFICATION: [
      t('account.depositRequestMarkedPaidAt'),
      request.user_marked_paid_at,
    ],
    CONFIRMED: [t('account.depositRequestConfirmedAt'), request.confirmed_at],
    REJECTED: [t('account.depositRequestRejectedAt'), request.rejected_at],
    CANCELLED: [t('account.depositRequestCancelledAt'), request.cancelled_at],
  }
  const entry = mapping[status]
  if (!entry) return null
  const [label, value] = entry
  if (!value) return null
  return { label, value }
}

export default function DepositRequest() {
  const { t } = useI18n()
  const { publicId } = useParams()
  const location = useLocation()
  const initialRequest = location.state?.request || null
  const [request, setRequest] = useState(initialRequest)
  const [status, setStatus] = useState(initialRequest ? 'ready' : 'loading')
  const [error, setError] = useState('')
  const [actionStatus, setActionStatus] = useState('idle')
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    let active = true

    const loadRequest = async () => {
      setStatus('loading')
      setError('')
      try {
        const res = await getDepositRequest(publicId)
        if (!active) return
        setRequest(res?.data || null)
        setStatus('ready')
      } catch (err) {
        if (!active) return
        setError(getErrorMessage(err, t('account.depositRequestLoadError')))
        setStatus('error')
      }
    }

    if (publicId) {
      loadRequest()
    } else {
      setStatus('error')
      setError(t('account.depositRequestLoadError'))
    }

    return () => {
      active = false
    }
  }, [publicId, t])

  const isLoading = status === 'loading'
  const statusLabel = resolveDepositStatusLabel(request?.status, t)
  const statusTone = resolveDepositStatusTone(request?.status)
  const allowMarkPaid = canMarkPaidDepositRequest(request?.status)
  const allowCancel = canCancelDepositRequest(request?.status)
  const actionLoading = actionStatus === 'loading'
  const statusTime = getStatusTime(request?.status, request, t)

  const paymentDetails = useMemo(
    () => normalizePaymentDetails(request?.payment_details, t),
    [request?.payment_details, t]
  )
  const detailsIssuedAt = request?.details_issued_at

  const handleMarkPaid = async () => {
    if (actionLoading || !publicId) return
    setActionError('')
    setActionStatus('loading')
    try {
      const res = await markDepositRequestPaid(publicId)
      setRequest(res?.data || request)
    } catch (err) {
      setActionError(getErrorMessage(err, t('account.depositRequestActionError')))
    } finally {
      setActionStatus('idle')
    }
  }

  const handleCancel = async () => {
    if (actionLoading || !publicId) return
    setActionError('')
    setActionStatus('loading')
    try {
      const res = await cancelDepositRequest(publicId)
      setRequest(res?.data || request)
    } catch (err) {
      setActionError(getErrorMessage(err, t('account.depositRequestActionError')))
    } finally {
      setActionStatus('idle')
    }
  }

  const handleCopyAllDetails = () => {
    if (paymentDetails.length === 0) return
    const lines = paymentDetails.map(([key, value]) => `${key}: ${value}`)
    copyToClipboard(lines.join('\n'))
  }

  const infoText = getStatusInfo(request?.status, request?.reject_reason, t)
  const currencyCode = request?.currency_code || ''
  const amountLine = `${formatAmount(request?.amount)}${currencyCode ? ` ${currencyCode}` : ''}`
  const requestId = request?.public_id || t('account.notAvailable')
  const canCopyId = Boolean(request?.public_id)

  return (
    <div className="account-page">
      <div className="account-page__head">
        <h1 className="h1 account-page__title">{t('account.depositRequestTitle')}</h1>
        <div className="account-page__actions">
          <Link to="/account/deposit-requests" className="btn btn--secondary">
            {t('account.depositRequestBack')}
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="card">
          <div className="muted">{t('account.loading')}</div>
        </div>
      ) : null}
      {error ? (
        <div className="card">
          <div className="error">{error}</div>
        </div>
      ) : null}
      {!isLoading && !error && request ? (
        <>
          <div className="card request-info">
            <div className="request-info__title">{t('account.depositInfoTitle')}</div>
            <div className="request-info__text">{infoText}</div>
          </div>

          <div className="card request-details">
            <div className="request-details__head">
              <div>
                <div className="request-details__title">
                  {t('account.depositRequestTitle')}
                </div>
                <div className="request-id">
                  <span className="request-id__label">{t('account.depositRequestIdLabel')}</span>
                  <button
                    type="button"
                    className="request-id__value"
                    onClick={() => (canCopyId ? copyToClipboard(request?.public_id) : null)}
                    title={t('account.depositCopyId')}
                    aria-label={t('account.depositCopyId')}
                  >
                    {requestId}
                  </button>
                  <button
                    type="button"
                    className="copy-btn"
                    onClick={() => (canCopyId ? copyToClipboard(request?.public_id) : null)}
                    title={t('account.depositCopyId')}
                    aria-label={t('account.depositCopyId')}
                  >
                    <CopyIcon />
                  </button>
                </div>
                <div className="request-created">
                  {t('account.depositRequestCreatedAt')}: {formatDate(request?.created_at, t)}
                </div>
              </div>
              <div className="request-status">
                <span className={`status-chip status-chip--${statusTone}`}>{statusLabel}</span>
                {statusTime ? (
                  <div className="request-status__time">
                    {statusTime.label}: {formatDate(statusTime.value, t)}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="request-amount">
              <div className="request-amount__value">{amountLine}</div>
              <div className="request-amount__meta">
                {request?.deposit_method_title || t('account.notAvailable')}
              </div>
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

          <div className="card payment-details">
            <div className="payment-details__head">
              <div className="payment-details__title">
                {t('account.depositRequestPaymentDetails')}
              </div>
              {paymentDetails.length > 0 ? (
                <Button type="button" variant="secondary" onClick={handleCopyAllDetails}>
                  {t('account.depositCopyAllDetails')}
                </Button>
              ) : null}
            </div>

            {paymentDetails.length > 0 ? (
              <div className="payment-details__list">
                {paymentDetails.map(([key, value]) => (
                  <div className="payment-details__row" key={key}>
                    <div className="payment-details__key">{key}</div>
                    <div className="payment-details__value">
                      <button
                        type="button"
                        className="payment-details__value-btn"
                        onClick={() => copyToClipboard(value)}
                        title={t('account.depositCopy')}
                        aria-label={t('account.depositCopy')}
                      >
                        {value}
                      </button>
                      <button
                        type="button"
                        className="copy-btn copy-btn--inline"
                        onClick={() => copyToClipboard(value)}
                        title={t('account.depositCopy')}
                        aria-label={t('account.depositCopy')}
                      >
                        <CopyIcon />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="muted">{t('account.depositDetailsPending')}</div>
            )}

            {detailsIssuedAt ? (
              <div className="payment-details__meta">
                {t('account.depositRequestDetailsIssuedAt')}: {formatDate(detailsIssuedAt, t)}
              </div>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  )
}

