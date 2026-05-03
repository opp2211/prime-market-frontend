import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import Button from '../../shared/ui/Button'
import {
  confirmAdminWithdrawalRequest,
  getAdminWithdrawalRequest,
  rejectAdminWithdrawalRequest,
  takeAdminWithdrawalRequest,
} from '../../api/adminWithdrawalRequests'
import { useI18n } from '../../app/i18n'
import { useUser } from '../../app/user'
import { copyToClipboard } from '../../shared/lib/clipboard'
import { getErrorMessage } from '../../shared/lib/errors'
import {
  formatMoneyAmount,
  getWithdrawalStatusLabel,
  getWithdrawalStatusTone,
  normalizeDetailsList,
} from '../../shared/lib/money'
import { getMoneyCopy } from '../money/moneyCopy'
import {
  MoneyDetailList,
  MoneyPageHeader,
  MoneyStateCard,
  MoneyTimeline,
} from '../money/MoneyUI'
import {
  canConfirmWithdrawalRequests,
  canRejectWithdrawalRequests,
  canTakeWithdrawalRequests,
  canViewWithdrawalRequests,
  getDefaultBackofficePath,
} from './backofficeAccess'
import { getBackofficeMoneyCopy } from './backofficeMoneyCopy'
import {
  buildMoneyAuditTimeline,
  buildMethodSnapshotList,
  buildWithdrawalTimeline,
  canConfirmWithdrawal,
  canRejectWithdrawal,
  canTakeWithdrawal,
  getProcessedByLabel,
  getWithdrawalUserIdentityLabel,
  normalizeBackofficeWithdrawalRequest,
} from './backofficeMoneyPresentation'

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

function normalizeAmountInput(value) {
  if (value == null || value === '') return ''
  return String(value)
}

export default function BackofficeWithdrawalRequest() {
  const { publicId } = useParams()
  const location = useLocation()
  const { language } = useI18n()
  const { permissions, status: userStatus } = useUser()
  const copy = getBackofficeMoneyCopy(language)
  const moneyCopy = getMoneyCopy(language)
  const initialRequest = location.state?.request
    ? normalizeBackofficeWithdrawalRequest(location.state.request)
    : null
  const [request, setRequest] = useState(initialRequest)
  const [status, setStatus] = useState(initialRequest ? 'ready' : 'loading')
  const [error, setError] = useState('')
  const [actionStatus, setActionStatus] = useState('idle')
  const [actionError, setActionError] = useState('')
  const [actionNotice, setActionNotice] = useState('')
  const [confirmAmount, setConfirmAmount] = useState(
    normalizeAmountInput(initialRequest?.actualPayoutAmount ?? initialRequest?.amount)
  )
  const [confirmComment, setConfirmComment] = useState('')
  const [confirmChecked, setConfirmChecked] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectComment, setRejectComment] = useState('')

  const allowed = canViewWithdrawalRequests(permissions)
  const fallbackPath = getDefaultBackofficePath(permissions)
  const backLink = location.state?.from || '/backoffice/withdrawal-requests'

  useEffect(() => {
    let active = true

    async function loadRequest() {
      setStatus('loading')
      setError('')

      try {
        const response = await getAdminWithdrawalRequest(publicId)
        if (!active) return
        setRequest(normalizeBackofficeWithdrawalRequest(response?.data))
        setStatus('ready')
      } catch (loadError) {
        if (!active) return
        setError(getErrorMessage(loadError, moneyCopy.withdrawals.detailsError))
        setStatus('error')
      }
    }

    if (allowed && publicId) {
      loadRequest()
    } else if (!publicId) {
      setStatus('error')
      setError(moneyCopy.withdrawals.detailsError)
    }

    return () => {
      active = false
    }
  }, [allowed, moneyCopy.withdrawals.detailsError, publicId])

  useEffect(() => {
    if (!request?.publicId) return
    setConfirmAmount(normalizeAmountInput(request.actualPayoutAmount ?? request.amount))
    setConfirmComment('')
    setConfirmChecked(false)
    setRejectReason('')
    setRejectComment('')
    setActionError('')
  }, [request?.publicId, request?.status, request?.actualPayoutAmount, request?.amount])

  const requisitesList = useMemo(
    () => normalizeDetailsList(request?.requisitesSnapshot),
    [request?.requisitesSnapshot]
  )
  const methodSnapshot = buildMethodSnapshotList(request?.methodSnapshot, [
    {
      key: moneyCopy.common.method,
      value: request?.methodTitle || moneyCopy.common.notAvailable,
    },
    {
      key: 'Method ID',
      value:
        request?.withdrawalMethodId != null
          ? String(request.withdrawalMethodId)
          : moneyCopy.common.notAvailable,
    },
    {
      key: 'Method code',
      value: request?.methodCode || moneyCopy.common.notAvailable,
    },
    {
      key: 'Payout profile',
      value: request?.payoutProfilePublicId || moneyCopy.common.notAvailable,
    },
  ])
  const summaryItems = [
    {
      label: moneyCopy.common.requestId,
      value: request?.publicId || moneyCopy.common.notAvailable,
    },
    {
      label: copy.common.user,
      value: getWithdrawalUserIdentityLabel(request, copy),
    },
    {
      label: moneyCopy.common.requestedAmount,
      value: `${formatMoneyAmount(request?.amount, {
        language,
        fallback: moneyCopy.common.notAvailable,
      })} ${request?.currencyCode || ''}`.trim(),
    },
    {
      label: moneyCopy.common.actualPayoutAmount,
      value:
        request?.actualPayoutAmount != null
          ? `${formatMoneyAmount(request.actualPayoutAmount, {
              language,
              fallback: moneyCopy.common.notAvailable,
            })} ${request?.currencyCode || ''}`.trim()
          : moneyCopy.common.notAvailable,
    },
    {
      label: moneyCopy.common.method,
      value: request?.methodTitle || moneyCopy.common.notAvailable,
    },
    {
      label: copy.common.processedBy,
      value: getProcessedByLabel(request, copy),
    },
  ]
  const timelineItems = useMemo(
    () => buildWithdrawalTimeline(request, moneyCopy, language),
    [language, moneyCopy, request]
  )
  const auditTimelineItems = buildMoneyAuditTimeline(request?.events, copy, language)

  const actionLoading = actionStatus !== 'idle'
  const canTakeAction =
    canTakeWithdrawal(request?.status) && canTakeWithdrawalRequests(permissions)
  const canConfirmAction =
    canConfirmWithdrawal(request?.status) && canConfirmWithdrawalRequests(permissions)
  const canRejectAction =
    canRejectWithdrawal(request?.status) && canRejectWithdrawalRequests(permissions)

  const handleTake = async () => {
    if (!publicId || actionLoading) return

    setActionError('')
    setActionNotice('')
    setActionStatus('take')

    try {
      const response = await takeAdminWithdrawalRequest(publicId)
      setRequest(normalizeBackofficeWithdrawalRequest(response?.data))
      setActionNotice(copy.common.successTaken)
    } catch (submitError) {
      setActionError(getErrorMessage(submitError, moneyCopy.withdrawals.detailsError))
    } finally {
      setActionStatus('idle')
    }
  }

  const handleConfirm = async () => {
    if (!publicId || actionLoading) return
    if (!confirmChecked) {
      setActionError(copy.withdrawals.confirmIntent)
      return
    }

    const normalizedAmount = confirmAmount.trim().replace(',', '.')
    const parsedAmount = Number(normalizedAmount)
    if (!normalizedAmount || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setActionError(copy.withdrawals.confirmAmountPlaceholder)
      return
    }

    setActionError('')
    setActionNotice('')
    setActionStatus('confirm')

    try {
      const response = await confirmAdminWithdrawalRequest(publicId, {
        actual_payout_amount: normalizedAmount,
        operator_comment: confirmComment.trim() || null,
      })
      setRequest(normalizeBackofficeWithdrawalRequest(response?.data))
      setActionNotice(copy.common.successConfirmed)
    } catch (submitError) {
      setActionError(getErrorMessage(submitError, moneyCopy.withdrawals.detailsError))
    } finally {
      setActionStatus('idle')
    }
  }

  const handleReject = async () => {
    if (!publicId || actionLoading) return
    if (!rejectReason.trim()) {
      setActionError(copy.withdrawals.rejectionReasonPlaceholder)
      return
    }

    setActionError('')
    setActionNotice('')
    setActionStatus('reject')

    try {
      const response = await rejectAdminWithdrawalRequest(publicId, {
        rejection_reason: rejectReason.trim(),
        operator_comment: rejectComment.trim() || null,
      })
      setRequest(normalizeBackofficeWithdrawalRequest(response?.data))
      setActionNotice(copy.common.successRejected)
    } catch (submitError) {
      setActionError(getErrorMessage(submitError, moneyCopy.withdrawals.detailsError))
    } finally {
      setActionStatus('idle')
    }
  }

  if (userStatus === 'ready' && !allowed) {
    if (fallbackPath && fallbackPath !== '/backoffice/withdrawal-requests') {
      return <Navigate to={fallbackPath} replace />
    }
    return (
      <div className="account-page money-page">
        <MoneyStateCard
          tone="danger"
          title={copy.common.noAccessTitle}
          text={copy.common.noAccessText}
        />
      </div>
    )
  }

  return (
    <div className="account-page money-page">
      <MoneyPageHeader
        eyebrow={copy.withdrawals.title}
        title={request?.publicId || copy.withdrawals.title}
        subtitle={copy.withdrawals.detailSubtitle}
        actions={
          <div className="money-page-header__actions">
            <Link to={backLink} className="btn btn--secondary">
              {copy.common.requestQueue}
            </Link>
          </div>
        }
      />

      {status === 'loading' ? (
        <MoneyStateCard title={moneyCopy.common.loading} text={copy.withdrawals.detailSubtitle} />
      ) : null}

      {status === 'error' ? (
        <MoneyStateCard tone="danger" title={moneyCopy.common.noDataTitle} text={error} />
      ) : null}

      {status === 'ready' && request ? (
        <>
          <div className="money-two-column">
            <div className="card money-section-card">
              <div className="money-section-card__head">
                <div>
                  <div className="money-section-card__title">{copy.common.requestOverview}</div>
                  <div className="money-section-card__subtitle">
                    {copy.common.lastChange}:{' '}
                    {request.updatedAt
                      ? new Date(request.updatedAt).toLocaleString(
                          language === 'en' ? 'en-US' : 'ru-RU'
                        )
                      : moneyCopy.common.notAvailable}
                  </div>
                </div>
                <span className={`status-chip status-chip--${getWithdrawalStatusTone(request.status)}`}>
                  {getWithdrawalStatusLabel(request.status, moneyCopy)}
                </span>
              </div>

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
                  title={moneyCopy.common.requestId}
                  aria-label={moneyCopy.common.requestId}
                >
                  <CopyIcon />
                </button>
              </div>

              <div className="request-amount">
                <div className="request-amount__value">
                  {formatMoneyAmount(request.amount, {
                    language,
                    fallback: moneyCopy.common.notAvailable,
                  })}{' '}
                  {request.currencyCode}
                </div>
                <div className="request-amount__meta">
                  {moneyCopy.common.actualPayoutAmount}:{' '}
                  {request.actualPayoutAmount != null
                    ? `${formatMoneyAmount(request.actualPayoutAmount, {
                        language,
                        fallback: moneyCopy.common.notAvailable,
                      })} ${request.currencyCode}`
                    : moneyCopy.common.notAvailable}
                </div>
              </div>

              <MoneyDetailList items={summaryItems} />

              {request.methodNote ? (
                <div className="money-note-box">
                  <div className="money-note-box__title">{copy.withdrawals.methodNoteTitle}</div>
                  <div className="money-note-box__text">{request.methodNote}</div>
                </div>
              ) : null}

              {request.operatorComment ? (
                <div className="money-note-box">
                  <div className="money-note-box__title">{moneyCopy.withdrawals.detailComment}</div>
                  <div className="money-note-box__text">{request.operatorComment}</div>
                </div>
              ) : null}

              {request.rejectReason ? (
                <div className="money-note-box money-note-box--danger">
                  <div className="money-note-box__title">{moneyCopy.withdrawals.detailReason}</div>
                  <div className="money-note-box__text">{request.rejectReason}</div>
                </div>
              ) : null}
            </div>

            <div className="card money-section-card">
              <div className="money-section-card__head">
                <div className="money-section-card__title">{moneyCopy.withdrawals.timeline}</div>
              </div>
              <MoneyTimeline items={timelineItems} emptyLabel={moneyCopy.withdrawals.noTimeline} />
            </div>
          </div>

          <div className="card money-section-card">
            <div className="money-section-card__head">
              <div className="money-section-card__title">Money audit events</div>
            </div>
            <MoneyTimeline items={auditTimelineItems} emptyLabel={copy.common.noActionsText} />
          </div>

          <div className="money-two-column">
            <div className="card payment-details">
              <div className="payment-details__head">
                <div className="payment-details__title">{copy.withdrawals.requisitesTitle}</div>
                {requisitesList.length > 0 ? (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() =>
                      copyToClipboard(requisitesList.map((item) => `${item.key}: ${item.value}`).join('\n'))
                    }
                  >
                    {moneyCopy.common.requisites}
                  </Button>
                ) : null}
              </div>

              {requisitesList.length > 0 ? (
                <div className="payment-details__list">
                  {requisitesList.map((item) => (
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
                <div className="muted">{moneyCopy.withdrawals.payoutRequisitesEmpty}</div>
              )}
            </div>

            <div className="card payment-details">
              <div className="payment-details__head">
                <div className="payment-details__title">{copy.common.methodSnapshot}</div>
              </div>

              <div className="payment-details__list">
                {methodSnapshot.map((item) => (
                  <div className="payment-details__row" key={`${item.key}-${item.value}`}>
                    <div className="payment-details__key">{item.key}</div>
                    <div className="payment-details__value">
                      <span className="payment-details__value-btn">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {actionNotice ? <div className="card backoffice-flash backoffice-flash--success">{actionNotice}</div> : null}
          {actionError ? <div className="card backoffice-flash backoffice-flash--danger">{actionError}</div> : null}

          {canTakeAction || canConfirmAction || canRejectAction ? (
            <div className="money-two-column backoffice-action-grid">
              {canTakeAction ? (
                <div className="card money-section-card backoffice-action-card">
                  <div className="money-section-card__head">
                    <div>
                      <div className="money-section-card__title">{copy.withdrawals.takeTitle}</div>
                      <div className="money-section-card__subtitle">{copy.withdrawals.takeText}</div>
                    </div>
                  </div>

                  <div className="money-inline-card">
                    <div className="money-inline-card__label">{copy.common.assignment}</div>
                    <div className="money-inline-card__value">{copy.common.notAssigned}</div>
                  </div>

                  <div className="money-form-actions">
                    <Button type="button" onClick={handleTake} disabled={actionLoading}>
                      {copy.withdrawals.takeAction}
                    </Button>
                  </div>
                </div>
              ) : null}

              {canConfirmAction ? (
                <div className="card money-section-card backoffice-action-card">
                  <div className="money-section-card__head">
                    <div>
                      <div className="money-section-card__title">{copy.withdrawals.confirmTitle}</div>
                      <div className="money-section-card__subtitle">{copy.withdrawals.confirmText}</div>
                    </div>
                  </div>

                  <div className="money-note-box">
                    <div className="money-note-box__title">{copy.withdrawals.safetyTitle}</div>
                    <div className="money-note-box__text">{copy.withdrawals.safetyText}</div>
                  </div>

                  <div className="money-summary-box">
                    <div className="money-summary-box__row">
                      <span>{moneyCopy.common.requestedAmount}</span>
                      <strong>
                        {formatMoneyAmount(request.amount, {
                          language,
                          fallback: moneyCopy.common.notAvailable,
                        })}{' '}
                        {request.currencyCode}
                      </strong>
                    </div>
                    <div className="money-summary-box__row">
                      <span>{moneyCopy.common.actualPayoutAmount}</span>
                      <strong>
                        {request.actualPayoutAmount != null
                          ? `${formatMoneyAmount(request.actualPayoutAmount, {
                              language,
                              fallback: moneyCopy.common.notAvailable,
                            })} ${request.currencyCode}`
                          : moneyCopy.common.notAvailable}
                      </strong>
                    </div>
                  </div>

                  <label className="field">
                    <span className="field__label">{copy.withdrawals.confirmAmountLabel}</span>
                    <input
                      className="input"
                      type="text"
                      value={confirmAmount}
                      placeholder={copy.withdrawals.confirmAmountPlaceholder}
                      onChange={(event) => setConfirmAmount(event.target.value)}
                    />
                  </label>

                  <label className="field">
                    <span className="field__label">
                      {copy.withdrawals.commentLabel} ({copy.common.fieldOptional})
                    </span>
                    <textarea
                      className="input backoffice-action-card__textarea"
                      rows={4}
                      value={confirmComment}
                      placeholder={copy.withdrawals.commentPlaceholder}
                      onChange={(event) => setConfirmComment(event.target.value)}
                    />
                  </label>

                  <label className="money-checkbox">
                    <input
                      type="checkbox"
                      checked={confirmChecked}
                      onChange={(event) => setConfirmChecked(event.target.checked)}
                    />
                    <span>{copy.withdrawals.confirmIntent}</span>
                  </label>

                  <div className="money-form-actions">
                    <Button type="button" onClick={handleConfirm} disabled={actionLoading}>
                      {copy.withdrawals.confirmAction}
                    </Button>
                  </div>
                </div>
              ) : null}

              {canRejectAction ? (
                <div className="card money-section-card backoffice-action-card backoffice-action-card--danger">
                  <div className="money-section-card__head">
                    <div>
                      <div className="money-section-card__title">{copy.withdrawals.rejectTitle}</div>
                      <div className="money-section-card__subtitle">{copy.withdrawals.rejectText}</div>
                    </div>
                  </div>

                  <label className="field">
                    <span className="field__label">{copy.withdrawals.rejectionReasonLabel}</span>
                    <textarea
                      className="input backoffice-action-card__textarea"
                      rows={4}
                      value={rejectReason}
                      placeholder={copy.withdrawals.rejectionReasonPlaceholder}
                      onChange={(event) => setRejectReason(event.target.value)}
                    />
                  </label>

                  <label className="field">
                    <span className="field__label">
                      {copy.withdrawals.commentLabel} ({copy.common.fieldOptional})
                    </span>
                    <textarea
                      className="input backoffice-action-card__textarea"
                      rows={4}
                      value={rejectComment}
                      placeholder={copy.withdrawals.commentPlaceholder}
                      onChange={(event) => setRejectComment(event.target.value)}
                    />
                  </label>

                  <div className="money-form-actions">
                    <Button
                      type="button"
                      variant="secondary"
                      className="request-action request-action--danger"
                      onClick={handleReject}
                      disabled={actionLoading}
                    >
                      {copy.withdrawals.rejectAction}
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <MoneyStateCard title={copy.common.noActionsTitle} text={copy.common.noActionsText} />
          )}
        </>
      ) : null}
    </div>
  )
}
