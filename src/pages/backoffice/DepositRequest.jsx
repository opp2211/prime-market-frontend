import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import Button from '../../shared/ui/Button'
import {
  confirmAdminDepositRequest,
  getAdminDepositRequest,
  issueAdminDepositDetails,
  rejectAdminDepositRequest,
} from '../../api/adminDepositRequests'
import { getErrorMessage } from '../../shared/lib/errors'
import { copyToClipboard } from '../../shared/lib/clipboard'
import { formatAmount, formatDateTime } from '../../shared/lib/format'
import { useI18n } from '../../app/i18n'
import { resolveDepositStatusLabel, resolveDepositStatusTone } from '../../app/depositRequests'

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

export default function BackofficeDepositRequest() {
  const { t } = useI18n()
  const { publicId } = useParams()
  const location = useLocation()
  const initialRequest = location.state?.request || null
  const [request, setRequest] = useState(initialRequest)
  const [status, setStatus] = useState(initialRequest ? 'ready' : 'loading')
  const [error, setError] = useState('')
  const [actionStatus, setActionStatus] = useState('idle')
  const [actionError, setActionError] = useState('')
  const [paymentDetailsInput, setPaymentDetailsInput] = useState('')
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    let active = true

    const loadRequest = async () => {
      setStatus('loading')
      setError('')
      try {
        const res = await getAdminDepositRequest(publicId)
        if (!active) return
        setRequest(res?.data || null)
        setStatus('ready')
      } catch (err) {
        if (!active) return
        setError(getErrorMessage(err, t('backoffice.depositRequestLoadError')))
        setStatus('error')
      }
    }

    if (publicId) {
      loadRequest()
    } else {
      setStatus('error')
      setError(t('backoffice.depositRequestLoadError'))
    }

    return () => {
      active = false
    }
  }, [publicId, t])

  const isLoading = status === 'loading'
  const statusLabel = resolveDepositStatusLabel(request?.status, t)
  const statusTone = resolveDepositStatusTone(request?.status)
  const actionLoading = actionStatus === 'loading'
  const statusTime = getStatusTime(request?.status, request, t)
  const emptyLabel = t('account.notAvailable')
  const isPendingDetails = request?.status === 'PENDING_DETAILS'
  const isPaymentVerification = request?.status === 'PAYMENT_VERIFICATION'

  const paymentDetails = useMemo(
    () => normalizePaymentDetails(request?.payment_details, t),
    [request?.payment_details, t]
  )

  const handleReject = async () => {
    if (actionLoading || !publicId) return
    if (!rejectReason.trim()) {
      setActionError(t('backoffice.rejectReasonRequired'))
      return
    }
    setActionError('')
    setActionStatus('loading')
    try {
      const res = await rejectAdminDepositRequest(publicId, {
        reject_reason: rejectReason.trim(),
      })
      setRequest(res?.data || request)
    } catch (err) {
      setActionError(getErrorMessage(err, t('backoffice.depositRequestActionError')))
    } finally {
      setActionStatus('idle')
    }
  }

  const handleIssueDetails = async () => {
    if (actionLoading || !publicId) return
    if (!paymentDetailsInput.trim()) {
      setActionError(t('backoffice.paymentDetailsRequired'))
      return
    }
    setActionError('')
    setActionStatus('loading')
    try {
      const res = await issueAdminDepositDetails(publicId, {
        payment_details: paymentDetailsInput.trim(),
      })
      setRequest(res?.data || request)
    } catch (err) {
      setActionError(getErrorMessage(err, t('backoffice.depositRequestActionError')))
    } finally {
      setActionStatus('idle')
    }
  }

  const handleConfirm = async () => {
    if (actionLoading || !publicId) return
    setActionError('')
    setActionStatus('loading')
    try {
      const res = await confirmAdminDepositRequest(publicId)
      setRequest(res?.data || request)
    } catch (err) {
      setActionError(getErrorMessage(err, t('backoffice.depositRequestActionError')))
    } finally {
      setActionStatus('idle')
    }
  }

  const handleCopyAllDetails = () => {
    if (paymentDetails.length === 0) return
    const lines = paymentDetails.map(([key, value]) => `${key}: ${value}`)
    copyToClipboard(lines.join('\n'))
  }

  const currencyCode = request?.currency_code || ''
  const amountLine = `${formatAmount(request?.amount, emptyLabel)}${
    currencyCode ? ` ${currencyCode}` : ''
  }`
  const requestId = request?.public_id || emptyLabel
  const canCopyId = Boolean(request?.public_id)

  return (
    <div className="account-page">
      <div className="account-page__head">
        <h1 className="h1 account-page__title">{t('backoffice.depositRequestTitle')}</h1>
        <div className="account-page__actions">
          <Link to="/backoffice/deposit-requests" className="btn btn--secondary">
            {t('backoffice.depositRequestBack')}
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
          <div className="card request-details">
            <div className="request-details__head">
              <div>
                <div className="request-details__title">{t('backoffice.depositRequestInfo')}</div>
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
                  {t('account.depositRequestCreatedAt')}:{" "}
                  {formatDateTime(request?.created_at, emptyLabel)}
                </div>
              </div>
              <div className="request-status">
                <span className={`status-chip status-chip--${statusTone}`}>{statusLabel}</span>
                {statusTime ? (
                  <div className="request-status__time">
                    {statusTime.label}: {formatDateTime(statusTime.value, emptyLabel)}
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

            <div className="request-details__grid request-details__grid--meta">
              <div className="request-details__block">
                <div className="request-details__label">{t('backoffice.depositRequestUserId')}</div>
                <div className="request-details__value">
                  {request?.user_id != null ? request.user_id : emptyLabel}
                </div>
              </div>
              <div className="request-details__block">
                <div className="request-details__label">{t('account.depositRequestStatusLabel')}</div>
                <div className="request-details__value">{statusLabel}</div>
              </div>
            </div>

            {request?.reject_reason ? (
              <div className="request-details__block">
                <div className="request-details__label">
                  {t('account.depositRequestRejectReason')}
                </div>
                <div className="request-details__text">{request.reject_reason}</div>
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
              <div className="muted">{t('backoffice.depositDetailsEmpty')}</div>
            )}

            {request?.details_issued_at ? (
              <div className="payment-details__meta">
                {t('account.depositRequestDetailsIssuedAt')}:{" "}
                {formatDateTime(request?.details_issued_at, emptyLabel)}
              </div>
            ) : null}
          </div>

          {(isPendingDetails || isPaymentVerification) ? (
            <div className="card">
              <div className="request-details__title">{t('backoffice.depositRequestActions')}</div>

              <div className="form">
                {isPendingDetails ? (
                  <label className="field">
                    <span className="field__label">{t('backoffice.paymentDetailsLabel')}</span>
                    <textarea
                      className="input"
                      rows={4}
                      value={paymentDetailsInput}
                      onChange={(e) => setPaymentDetailsInput(e.target.value)}
                      placeholder={t('backoffice.paymentDetailsPlaceholder')}
                    />
                  </label>
                ) : null}

                <label className="field">
                  <span className="field__label">{t('account.depositRequestRejectReason')}</span>
                  <textarea
                    className="input"
                    rows={3}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder={t('backoffice.rejectReasonPlaceholder')}
                  />
                </label>
              </div>

              {actionError ? <div className="error">{actionError}</div> : null}

              <div className="request-actions">
                {isPendingDetails ? (
                  <Button type="button" onClick={handleIssueDetails} disabled={actionLoading}>
                    {t('backoffice.issueDetails')}
                  </Button>
                ) : null}
                {isPaymentVerification ? (
                  <Button type="button" onClick={handleConfirm} disabled={actionLoading}>
                    {t('backoffice.confirm')}
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="secondary"
                  className="request-action request-action--danger"
                  onClick={handleReject}
                  disabled={actionLoading}
                >
                  {t('backoffice.reject')}
                </Button>
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
