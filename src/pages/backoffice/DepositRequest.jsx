import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import Button from '../../shared/ui/Button'
import {
  confirmAdminDepositRequest,
  getAdminDepositRequest,
  issueAdminDepositDetails,
  rejectAdminDepositRequest,
} from '../../api/adminDepositRequests'
import { getDepositPaymentRoutes, getTreasuryAccounts } from '../../api/treasury'
import { useI18n } from '../../app/i18n'
import { useUser } from '../../app/user'
import { copyToClipboard } from '../../shared/lib/clipboard'
import { getErrorMessage } from '../../shared/lib/errors'
import {
  formatMoneyAmount,
  formatMoneyDateTime,
  humanizeCode,
  normalizeDepositPaymentRoutes,
  normalizeDetailsList,
  normalizeTreasuryAccounts,
} from '../../shared/lib/money'
import { getMoneyCopy } from '../money/moneyCopy'
import {
  MoneyDetailList,
  MoneyPageHeader,
  MoneyStateCard,
  MoneyTimeline,
} from '../money/MoneyUI'
import {
  canViewDepositRequests,
  getDefaultBackofficePath,
} from './backofficeAccess'
import { getBackofficeMoneyCopy } from './backofficeMoneyCopy'
import {
  buildDepositTimeline,
  buildMoneyAuditTimeline,
  buildMethodSnapshotList,
  canConfirmDeposit,
  canIssueDepositDetails,
  canRejectDeposit,
  getDepositUserIdentityLabel,
  normalizeBackofficeDepositRequest,
  resolveDepositBackofficeStatusLabel,
  resolveDepositBackofficeStatusTone,
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

export default function BackofficeDepositRequest() {
  const { publicCode } = useParams()
  const location = useLocation()
  const { language, t } = useI18n()
  const { permissions, status: userStatus } = useUser()
  const copy = getBackofficeMoneyCopy(language)
  const moneyCopy = getMoneyCopy(language)
  const initialRequest = location.state?.request
    ? normalizeBackofficeDepositRequest(location.state.request)
    : null
  const [request, setRequest] = useState(initialRequest)
  const [status, setStatus] = useState(initialRequest ? 'ready' : 'loading')
  const [error, setError] = useState('')
  const [actionStatus, setActionStatus] = useState('idle')
  const [actionError, setActionError] = useState('')
  const [actionNotice, setActionNotice] = useState('')
  const [paymentDetailsInput, setPaymentDetailsInput] = useState('')
  const [depositRoutes, setDepositRoutes] = useState([])
  const [selectedRouteId, setSelectedRouteId] = useState('')
  const [issueTreasuryAccountId, setIssueTreasuryAccountId] = useState('')
  const [issueTreasuryAmount, setIssueTreasuryAmount] = useState('')
  const [issueExpiresAt, setIssueExpiresAt] = useState('')
  const [issueComment, setIssueComment] = useState('')
  const [confirmationReference, setConfirmationReference] = useState('')
  const [confirmComment, setConfirmComment] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [rejectComment, setRejectComment] = useState('')
  const [treasuryAccounts, setTreasuryAccounts] = useState([])
  const [treasuryAccountId, setTreasuryAccountId] = useState('')
  const [treasuryAmount, setTreasuryAmount] = useState('')
  const [treasuryExternalReference, setTreasuryExternalReference] = useState('')

  const allowed = canViewDepositRequests(permissions)
  const fallbackPath = getDefaultBackofficePath(permissions)
  const backLink = location.state?.from || '/backoffice/deposit-requests'

  useEffect(() => {
    let active = true

    async function loadRequest() {
      setStatus('loading')
      setError('')

      try {
        const response = await getAdminDepositRequest(publicCode)
        if (!active) return
        setRequest(normalizeBackofficeDepositRequest(response?.data))
        setStatus('ready')
      } catch (loadError) {
        if (!active) return
        setError(getErrorMessage(loadError, t('backoffice.depositRequestLoadError')))
        setStatus('error')
      }
    }

    if (allowed && publicCode) {
      loadRequest()
    } else if (!publicCode) {
      setStatus('error')
      setError(t('backoffice.depositRequestLoadError'))
    }

    return () => {
      active = false
    }
  }, [allowed, publicCode, t])

  useEffect(() => {
    let active = true

    async function loadTreasuryAccounts() {
      try {
        const response = await getTreasuryAccounts({ activeOnly: true })
        if (!active) return
        setTreasuryAccounts(normalizeTreasuryAccounts(response?.data))
      } catch {
        if (!active) return
        setTreasuryAccounts([])
      }
    }

    if (allowed) {
      loadTreasuryAccounts()
    }

    return () => {
      active = false
    }
  }, [allowed])

  useEffect(() => {
    let active = true

    async function loadDepositRoutes() {
      try {
        const response = await getDepositPaymentRoutes({
          depositMethodId: request.depositMethodId,
          activeOnly: true,
        })
        if (!active) return
        setDepositRoutes(normalizeDepositPaymentRoutes(response?.data))
      } catch {
        if (!active) return
        setDepositRoutes([])
      }
    }

    if (allowed && request?.depositMethodId) {
      loadDepositRoutes()
    } else {
      setDepositRoutes([])
    }

    return () => {
      active = false
    }
  }, [allowed, request?.depositMethodId])

  useEffect(() => {
    if (!request?.publicCode) return
    setPaymentDetailsInput('')
    setSelectedRouteId('')
    setIssueTreasuryAccountId('')
    setIssueTreasuryAmount('')
    setIssueExpiresAt('')
    setIssueComment('')
    setConfirmationReference('')
    setConfirmComment('')
    setTreasuryAccountId('')
    setTreasuryAmount('')
    setTreasuryExternalReference('')
    setRejectReason('')
    setRejectComment('')
    setActionError('')
  }, [request?.publicCode, request?.status])

  const paymentDetails = useMemo(
    () => normalizeDetailsList(request?.paymentDetails),
    [request?.paymentDetails]
  )
  const paymentInstruction = request?.paymentInstruction || null
  const paymentInstructionDetails = useMemo(
    () => normalizeDetailsList(paymentInstruction?.paymentDetails),
    [paymentInstruction?.paymentDetails]
  )
  const selectedRoute = depositRoutes.find((route) => route.id === selectedRouteId)
  const methodSnapshot = buildMethodSnapshotList(request?.methodSnapshot, [
    {
      key: moneyCopy.common.method,
      value: request?.methodTitle || moneyCopy.common.notAvailable,
    },
    {
      key: 'Method ID',
      value:
        request?.depositMethodId != null
          ? String(request.depositMethodId)
          : moneyCopy.common.notAvailable,
    },
    {
      key: moneyCopy.common.currency,
      value: request?.currencyCode || moneyCopy.common.notAvailable,
    },
  ])

  const summaryItems = [
    {
      label: moneyCopy.common.requestId,
      value: request?.publicCode || moneyCopy.common.notAvailable,
    },
    {
      label: copy.common.user,
      value: getDepositUserIdentityLabel(request, copy),
    },
    {
      label: moneyCopy.common.amount,
      value: `${formatMoneyAmount(request?.amount, {
        language,
        fallback: moneyCopy.common.notAvailable,
      })} ${request?.currencyCode || ''}`.trim(),
    },
    {
      label: moneyCopy.common.method,
      value: request?.methodTitle || moneyCopy.common.notAvailable,
    },
    {
      label: moneyCopy.common.status,
      value: resolveDepositBackofficeStatusLabel(request?.status, t, language),
    },
    {
      label: 'Details issued by',
      value:
        request?.detailsIssuedByUserId != null
          ? `${copy.common.userId} ${request.detailsIssuedByUserId}`
          : moneyCopy.common.notAvailable,
    },
    {
      label: 'Confirmed by',
      value:
        request?.confirmedByUserId != null
          ? `${copy.common.userId} ${request.confirmedByUserId}`
          : moneyCopy.common.notAvailable,
    },
    {
      label: 'Rejected by',
      value:
        request?.rejectedByUserId != null
          ? `${copy.common.userId} ${request.rejectedByUserId}`
          : moneyCopy.common.notAvailable,
    },
    {
      label: 'Confirmation reference',
      value: request?.confirmationReference || moneyCopy.common.notAvailable,
    },
  ]

  const timelineItems = useMemo(
    () => buildDepositTimeline(request, { t, language }),
    [language, request, t]
  )
  const auditTimelineItems = buildMoneyAuditTimeline(request?.events, copy, language)
  const actionLoading = actionStatus !== 'idle'
  const canIssue = canIssueDepositDetails(request?.status)
  const canConfirm = canConfirmDeposit(request?.status)
  const canReject = canRejectDeposit(request?.status)
  const treasuryTransactions = request?.treasuryTransactions || []

  const handleIssueDetails = async () => {
    if (!publicCode || actionLoading) return
    if (!selectedRouteId && !paymentDetailsInput.trim()) {
      setActionError(t('backoffice.paymentDetailsRequired'))
      return
    }

    setActionError('')
    setActionNotice('')
    setActionStatus('issue')

    try {
      const payload = {
        payment_details: selectedRouteId ? null : paymentDetailsInput.trim(),
        deposit_payment_route_id: selectedRouteId || null,
        treasury_account_id: selectedRouteId
          ? null
          : issueTreasuryAccountId || null,
        treasury_amount: issueTreasuryAmount.trim().replace(',', '.') || null,
        expires_at: issueExpiresAt ? new Date(issueExpiresAt).toISOString() : null,
        operator_comment: issueComment.trim() || null,
      }
      const response = await issueAdminDepositDetails(publicCode, {
        ...payload,
      })
      setRequest(normalizeBackofficeDepositRequest(response?.data))
      setActionNotice(copy.common.successIssued)
      setPaymentDetailsInput('')
      setSelectedRouteId('')
      setIssueTreasuryAccountId('')
      setIssueTreasuryAmount('')
      setIssueExpiresAt('')
    } catch (submitError) {
      setActionError(getErrorMessage(submitError, t('backoffice.depositRequestActionError')))
    } finally {
      setActionStatus('idle')
    }
  }

  const handleConfirm = async () => {
    if (!publicCode || actionLoading) return

    setActionError('')
    setActionNotice('')
    setActionStatus('confirm')

    try {
      const response = await confirmAdminDepositRequest(publicCode, {
        confirmation_reference: confirmationReference.trim() || null,
        operator_comment: confirmComment.trim() || null,
        treasury_account_id: treasuryAccountId || null,
        treasury_amount: treasuryAmount.trim().replace(',', '.') || null,
        treasury_external_reference: treasuryExternalReference.trim() || null,
      })
      setRequest(normalizeBackofficeDepositRequest(response?.data))
      setActionNotice(copy.common.successConfirmed)
    } catch (submitError) {
      setActionError(getErrorMessage(submitError, t('backoffice.depositRequestActionError')))
    } finally {
      setActionStatus('idle')
    }
  }

  const handleReject = async () => {
    if (!publicCode || actionLoading) return
    if (!rejectReason.trim()) {
      setActionError(t('backoffice.rejectReasonRequired'))
      return
    }

    setActionError('')
    setActionNotice('')
    setActionStatus('reject')

    try {
      const response = await rejectAdminDepositRequest(publicCode, {
        reject_reason: rejectReason.trim(),
        operator_comment: rejectComment.trim() || null,
      })
      setRequest(normalizeBackofficeDepositRequest(response?.data))
      setActionNotice(copy.common.successRejected)
    } catch (submitError) {
      setActionError(getErrorMessage(submitError, t('backoffice.depositRequestActionError')))
    } finally {
      setActionStatus('idle')
    }
  }

  if (userStatus === 'ready' && !allowed) {
    if (fallbackPath && fallbackPath !== '/backoffice/deposit-requests') {
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
        eyebrow={copy.deposits.title}
        title={request?.publicCode || copy.deposits.title}
        subtitle={copy.deposits.detailSubtitle}
        actions={
          <div className="money-page-header__actions">
            <Link to={backLink} className="btn btn--secondary">
              {copy.common.requestQueue}
            </Link>
          </div>
        }
      />

      {status === 'loading' ? (
        <MoneyStateCard title={moneyCopy.common.loading} text={copy.deposits.detailSubtitle} />
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
                <span
                  className={`status-chip status-chip--${resolveDepositBackofficeStatusTone(
                    request.status
                  )}`}
                >
                  {resolveDepositBackofficeStatusLabel(request.status, t, language)}
                </span>
              </div>

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
                  {request.methodTitle || moneyCopy.common.notAvailable}
                </div>
              </div>

              <MoneyDetailList items={summaryItems} />

              {request.rejectReason ? (
                <div className="money-note-box money-note-box--danger">
                  <div className="money-note-box__title">{t('account.depositRequestRejectReason')}</div>
                  <div className="money-note-box__text">{request.rejectReason}</div>
                </div>
              ) : null}

              {request.operatorComment ? (
                <div className="money-note-box">
                  <div className="money-note-box__title">{copy.withdrawals.commentLabel}</div>
                  <div className="money-note-box__text">{request.operatorComment}</div>
                </div>
              ) : null}
            </div>

            <div className="card money-section-card">
              <div className="money-section-card__head">
                <div className="money-section-card__title">{moneyCopy.deposits.timeline}</div>
              </div>
              <MoneyTimeline items={timelineItems} emptyLabel={moneyCopy.deposits.noTimeline} />
            </div>
          </div>

          <div className="card money-section-card">
            <div className="money-section-card__head">
              <div className="money-section-card__title">Money audit events</div>
            </div>
            <MoneyTimeline items={auditTimelineItems} emptyLabel={copy.common.noActionsText} />
          </div>

          <div className="card money-section-card">
            <div className="money-section-card__head">
              <div>
                <div className="money-section-card__title">Treasury movements</div>
                <div className="money-section-card__subtitle">
                  Actual operator-side money movements linked to this deposit.
                </div>
              </div>
            </div>
            <div className="money-transaction-preview">
              {treasuryTransactions.length === 0 ? <div className="muted">No Treasury movement linked.</div> : null}
              {treasuryTransactions.map((transaction) => (
                <div className="money-transaction-preview__row" key={transaction.id}>
                  <div className="money-transaction-preview__meta">
                    <div className="money-transaction-preview__type">
                      {transaction.treasuryAccountCode || transaction.treasuryAccountTitle}
                    </div>
                    <div className="money-transaction-preview__date">
                      {formatMoneyDateTime(transaction.createdAt, { language })}
                    </div>
                    <div className="money-transaction-preview__description">
                      {transaction.externalReference || transaction.description || transaction.id}
                    </div>
                  </div>
                  <div className="money-amount money-amount--positive">
                    {formatMoneyAmount(transaction.amount, { language })} {transaction.currencyCode}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="money-two-column">
            <div className="card payment-details">
              <div className="payment-details__head">
                <div className="payment-details__title">{copy.deposits.paymentDetailsTitle}</div>
                {paymentDetails.length > 0 ? (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() =>
                      copyToClipboard(paymentDetails.map((item) => `${item.key}: ${item.value}`).join('\n'))
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
                <div className="muted">{t('backoffice.depositDetailsEmpty')}</div>
              )}
            </div>

            <div className="card payment-details">
              <div className="payment-details__head">
                <div className="payment-details__title">{copy.deposits.methodSnapshotTitle}</div>
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

          {paymentInstruction ? (
            <div className="card money-section-card">
              <div className="money-section-card__head">
                <div>
                  <div className="money-section-card__title">Payment instruction snapshot</div>
                  <div className="money-section-card__subtitle">
                    {paymentInstruction.treasuryAccountCode || paymentInstruction.treasuryAccountTitle || 'Manual details'} - {humanizeCode(paymentInstruction.status)}
                  </div>
                </div>
                <span className="status-chip status-chip--info">
                  {paymentInstruction.treasuryCurrencyCode || request.currencyCode}
                </span>
              </div>

              <div className="money-summary-box">
                <div className="money-summary-box__row">
                  <span>User amount</span>
                  <strong>
                    {formatMoneyAmount(paymentInstruction.amount || request.amount, { language })}{' '}
                    {paymentInstruction.currencyCode || request.currencyCode}
                  </strong>
                </div>
                <div className="money-summary-box__row">
                  <span>Treasury amount</span>
                  <strong>
                    {formatMoneyAmount(paymentInstruction.treasuryAmount || request.amount, { language })}{' '}
                    {paymentInstruction.treasuryCurrencyCode || request.currencyCode}
                  </strong>
                </div>
                <div className="money-summary-box__row">
                  <span>Issued</span>
                  <strong>{formatMoneyDateTime(paymentInstruction.issuedAt, { language })}</strong>
                </div>
                <div className="money-summary-box__row">
                  <span>Expires</span>
                  <strong>{formatMoneyDateTime(paymentInstruction.expiresAt, { language })}</strong>
                </div>
              </div>

              {paymentInstructionDetails.length > 0 ? (
                <div className="payment-details__list">
                  {paymentInstructionDetails.map((item) => (
                    <div className="payment-details__row" key={`${item.key}-${item.value}`}>
                      <div className="payment-details__key">{item.key}</div>
                      <div className="payment-details__value">
                        <span className="payment-details__value-btn">{item.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          {actionNotice ? <div className="card backoffice-flash backoffice-flash--success">{actionNotice}</div> : null}
          {actionError ? <div className="card backoffice-flash backoffice-flash--danger">{actionError}</div> : null}

          {canIssue || canConfirm || canReject ? (
            <div className="money-two-column backoffice-action-grid">
              {canIssue ? (
                <div className="card money-section-card backoffice-action-card">
                  <div className="money-section-card__head">
                    <div>
                      <div className="money-section-card__title">{copy.deposits.issueTitle}</div>
                      <div className="money-section-card__subtitle">{copy.deposits.issueText}</div>
                    </div>
                  </div>

                  <label className="field">
                    <span className="field__label">Payment route ({copy.common.fieldOptional})</span>
                    <select
                      className="input"
                      value={selectedRouteId}
                      onChange={(event) => {
                        setSelectedRouteId(event.target.value)
                        if (event.target.value) {
                          setIssueTreasuryAccountId('')
                          setPaymentDetailsInput('')
                        }
                      }}
                    >
                      <option value="">Manual details</option>
                      {depositRoutes.map((route) => (
                        <option key={route.id} value={route.id}>
                          {route.title} - {route.treasuryAccountCode} ({route.treasuryCurrencyCode})
                        </option>
                      ))}
                    </select>
                  </label>

                  {selectedRoute ? (
                    <div className="money-inline-card">
                      <div className="money-inline-card__label">Selected Treasury account</div>
                      <div className="money-inline-card__value">
                        {selectedRoute.treasuryAccountCode} - {selectedRoute.treasuryAccountTitle}
                      </div>
                    </div>
                  ) : (
                    <>
                      <label className="field">
                        <span className="field__label">{t('backoffice.paymentDetailsLabel')}</span>
                        <textarea
                          className="input backoffice-action-card__textarea"
                          rows={6}
                          value={paymentDetailsInput}
                          placeholder={t('backoffice.paymentDetailsPlaceholder')}
                          onChange={(event) => setPaymentDetailsInput(event.target.value)}
                        />
                      </label>

                      <label className="field">
                        <span className="field__label">Treasury account ({copy.common.fieldOptional})</span>
                        <select
                          className="input"
                          value={issueTreasuryAccountId}
                          onChange={(event) => setIssueTreasuryAccountId(event.target.value)}
                        >
                          <option value="">No Treasury snapshot</option>
                          {treasuryAccounts.map((account) => (
                            <option key={account.id} value={account.id}>
                              {account.code} - {account.title} ({account.currencyCode})
                            </option>
                          ))}
                        </select>
                      </label>
                    </>
                  )}

                  <div className="money-form-grid">
                    <label className="field">
                      <span className="field__label">Treasury amount ({copy.common.fieldOptional})</span>
                      <input
                        className="input"
                        type="text"
                        value={issueTreasuryAmount}
                        placeholder={`${request.amount.toFixed(4)} ${request.currencyCode}`}
                        onChange={(event) => setIssueTreasuryAmount(event.target.value)}
                      />
                    </label>
                    <label className="field">
                      <span className="field__label">Expires at ({copy.common.fieldOptional})</span>
                      <input
                        className="input"
                        type="datetime-local"
                        value={issueExpiresAt}
                        onChange={(event) => setIssueExpiresAt(event.target.value)}
                      />
                    </label>
                  </div>

                  <label className="field">
                    <span className="field__label">
                      {copy.withdrawals.commentLabel} ({copy.common.fieldOptional})
                    </span>
                    <textarea
                      className="input backoffice-action-card__textarea"
                      rows={3}
                      value={issueComment}
                      placeholder={copy.withdrawals.commentPlaceholder}
                      onChange={(event) => setIssueComment(event.target.value)}
                    />
                  </label>

                  <div className="money-form-actions">
                    <Button type="button" onClick={handleIssueDetails} disabled={actionLoading}>
                      {copy.deposits.issueAction}
                    </Button>
                  </div>
                </div>
              ) : null}

              {canConfirm ? (
                <div className="card money-section-card backoffice-action-card">
                  <div className="money-section-card__head">
                    <div>
                      <div className="money-section-card__title">{copy.deposits.confirmTitle}</div>
                      <div className="money-section-card__subtitle">{copy.deposits.confirmText}</div>
                    </div>
                  </div>

                  <div className="money-inline-card">
                    <div className="money-inline-card__label">{moneyCopy.common.amount}</div>
                    <div className="money-inline-card__value">
                      {formatMoneyAmount(request.amount, {
                        language,
                        fallback: moneyCopy.common.notAvailable,
                      })}{' '}
                      {request.currencyCode}
                    </div>
                  </div>

                  <label className="field">
                    <span className="field__label">Payment reference ({copy.common.fieldOptional})</span>
                    <input
                      className="input"
                      type="text"
                      value={confirmationReference}
                      placeholder="External payment ID, bank statement note, tx hash"
                      onChange={(event) => setConfirmationReference(event.target.value)}
                    />
                  </label>

                  <div className="money-form-grid">
                    <label className="field">
                      <span className="field__label">Treasury account ({copy.common.fieldOptional})</span>
                      <select
                        className="input"
                        value={treasuryAccountId}
                        onChange={(event) => setTreasuryAccountId(event.target.value)}
                      >
                        <option value="">
                          {paymentInstruction?.treasuryAccountId
                            ? 'Use payment instruction snapshot'
                            : 'No Treasury movement'}
                        </option>
                        {treasuryAccounts.map((account) => (
                          <option key={account.id} value={account.id}>
                            {account.code} - {account.title} ({account.currencyCode})
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="field">
                      <span className="field__label">Treasury amount ({copy.common.fieldOptional})</span>
                      <input
                        className="input"
                        type="text"
                        value={treasuryAmount}
                        placeholder={`${request.amount.toFixed(4)} ${request.currencyCode}`}
                        onChange={(event) => setTreasuryAmount(event.target.value)}
                      />
                    </label>
                  </div>

                  <label className="field">
                    <span className="field__label">Treasury reference ({copy.common.fieldOptional})</span>
                    <input
                      className="input"
                      type="text"
                      value={treasuryExternalReference}
                      placeholder="Statement line, P2P order, tx hash"
                      onChange={(event) => setTreasuryExternalReference(event.target.value)}
                    />
                  </label>

                  <label className="field">
                    <span className="field__label">
                      {copy.withdrawals.commentLabel} ({copy.common.fieldOptional})
                    </span>
                    <textarea
                      className="input backoffice-action-card__textarea"
                      rows={3}
                      value={confirmComment}
                      placeholder={copy.withdrawals.commentPlaceholder}
                      onChange={(event) => setConfirmComment(event.target.value)}
                    />
                  </label>

                  <div className="money-form-actions">
                    <Button type="button" onClick={handleConfirm} disabled={actionLoading}>
                      {copy.deposits.confirmAction}
                    </Button>
                  </div>
                </div>
              ) : null}

              {canReject ? (
                <div className="card money-section-card backoffice-action-card backoffice-action-card--danger">
                  <div className="money-section-card__head">
                    <div>
                      <div className="money-section-card__title">{copy.deposits.rejectTitle}</div>
                      <div className="money-section-card__subtitle">{copy.deposits.rejectText}</div>
                    </div>
                  </div>

                  <label className="field">
                    <span className="field__label">{t('account.depositRequestRejectReason')}</span>
                    <textarea
                      className="input backoffice-action-card__textarea"
                      rows={5}
                      value={rejectReason}
                      placeholder={t('backoffice.rejectReasonPlaceholder')}
                      onChange={(event) => setRejectReason(event.target.value)}
                    />
                  </label>

                  <label className="field">
                    <span className="field__label">
                      {copy.withdrawals.commentLabel} ({copy.common.fieldOptional})
                    </span>
                    <textarea
                      className="input backoffice-action-card__textarea"
                      rows={3}
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
                      {copy.deposits.rejectAction}
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
