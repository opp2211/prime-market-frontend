import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import Button from '../../shared/ui/Button'
import {
  confirmAdminWithdrawalRequest,
  getAdminWithdrawalRequest,
  planAdminWithdrawalPayout,
  rejectAdminWithdrawalRequest,
  takeAdminWithdrawalRequest,
} from '../../api/adminWithdrawalRequests'
import { getTreasuryAccounts } from '../../api/treasury'
import { useI18n } from '../../app/i18n'
import { useUser } from '../../app/user'
import { copyToClipboard } from '../../shared/lib/clipboard'
import { getErrorMessage } from '../../shared/lib/errors'
import {
  formatMoneyAmount,
  formatMoneyDateTime,
  getAmountTone,
  getWithdrawalStatusLabel,
  getWithdrawalStatusTone,
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
  const { publicCode } = useParams()
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
  const [treasuryAccounts, setTreasuryAccounts] = useState([])
  const [treasuryAccountId, setTreasuryAccountId] = useState('')
  const [treasuryAmount, setTreasuryAmount] = useState('')
  const [treasuryExternalReference, setTreasuryExternalReference] = useState('')
  const [planTreasuryAccountId, setPlanTreasuryAccountId] = useState('')
  const [planUserAmount, setPlanUserAmount] = useState('')
  const [planTreasuryAmount, setPlanTreasuryAmount] = useState('')
  const [planReference, setPlanReference] = useState('')
  const [planComment, setPlanComment] = useState('')
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
        const response = await getAdminWithdrawalRequest(publicCode)
        if (!active) return
        setRequest(normalizeBackofficeWithdrawalRequest(response?.data))
        setStatus('ready')
      } catch (loadError) {
        if (!active) return
        setError(getErrorMessage(loadError, moneyCopy.withdrawals.detailsError))
        setStatus('error')
      }
    }

    if (allowed && publicCode) {
      loadRequest()
    } else if (!publicCode) {
      setStatus('error')
      setError(moneyCopy.withdrawals.detailsError)
    }

    return () => {
      active = false
    }
  }, [allowed, moneyCopy.withdrawals.detailsError, publicCode])

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
    if (!request?.publicCode) return
    setConfirmAmount(normalizeAmountInput(request.actualPayoutAmount ?? request.amount))
    setConfirmComment('')
    setConfirmChecked(false)
    setTreasuryAccountId('')
    setTreasuryAmount('')
    setTreasuryExternalReference('')
    setPlanTreasuryAccountId(request.payoutPlan?.treasuryAccountId || '')
    setPlanUserAmount(normalizeAmountInput(request.payoutPlan?.plannedUserAmount || request.amount))
    setPlanTreasuryAmount(normalizeAmountInput(request.payoutPlan?.treasuryAmount || request.amount))
    setPlanReference(request.payoutPlan?.externalReference || '')
    setPlanComment(request.payoutPlan?.operatorComment || '')
    setRejectReason('')
    setRejectComment('')
    setActionError('')
  }, [request?.publicCode, request?.status, request?.actualPayoutAmount, request?.amount, request?.payoutPlan])

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
      value: request?.payoutProfileId || moneyCopy.common.notAvailable,
    },
  ])
  const summaryItems = [
    {
      label: moneyCopy.common.requestId,
      value: request?.publicCode || moneyCopy.common.notAvailable,
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
  const canPlanAction =
    ['OPEN', 'PROCESSING'].includes((request?.status || '').toUpperCase()) &&
    canConfirmWithdrawalRequests(permissions)
  const payoutPlan = request?.payoutPlan || null
  const treasuryTransactions = request?.treasuryTransactions || []

  const handleTake = async () => {
    if (!publicCode || actionLoading) return

    setActionError('')
    setActionNotice('')
    setActionStatus('take')

    try {
      const response = await takeAdminWithdrawalRequest(publicCode)
      setRequest(normalizeBackofficeWithdrawalRequest(response?.data))
      setActionNotice(copy.common.successTaken)
    } catch (submitError) {
      setActionError(getErrorMessage(submitError, moneyCopy.withdrawals.detailsError))
    } finally {
      setActionStatus('idle')
    }
  }

  const handlePlanPayout = async () => {
    if (!publicCode || actionLoading) return
    if (!planTreasuryAccountId) {
      setActionError('Select Treasury account for payout plan')
      return
    }

    setActionError('')
    setActionNotice('')
    setActionStatus('plan')

    try {
      const response = await planAdminWithdrawalPayout(publicCode, {
        treasury_account_id: planTreasuryAccountId,
        planned_user_amount: planUserAmount.trim().replace(',', '.') || null,
        treasury_amount: planTreasuryAmount.trim().replace(',', '.') || null,
        external_reference: planReference.trim() || null,
        operator_comment: planComment.trim() || null,
      })
      setRequest(normalizeBackofficeWithdrawalRequest(response?.data))
      setActionNotice('Payout plan saved.')
    } catch (submitError) {
      setActionError(getErrorMessage(submitError, moneyCopy.withdrawals.detailsError))
    } finally {
      setActionStatus('idle')
    }
  }

  const handleConfirm = async () => {
    if (!publicCode || actionLoading) return
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
      const response = await confirmAdminWithdrawalRequest(publicCode, {
        actual_payout_amount: normalizedAmount,
        operator_comment: confirmComment.trim() || null,
        treasury_account_id: treasuryAccountId || null,
        treasury_amount: treasuryAmount.trim().replace(',', '.') || null,
        treasury_external_reference: treasuryExternalReference.trim() || null,
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
    if (!publicCode || actionLoading) return
    if (!rejectReason.trim()) {
      setActionError(copy.withdrawals.rejectionReasonPlaceholder)
      return
    }

    setActionError('')
    setActionNotice('')
    setActionStatus('reject')

    try {
      const response = await rejectAdminWithdrawalRequest(publicCode, {
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
        title={request?.publicCode || copy.withdrawals.title}
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

          <div className="card money-section-card">
            <div className="money-section-card__head">
              <div>
                <div className="money-section-card__title">Treasury movements</div>
                <div className="money-section-card__subtitle">
                  Actual operator-side payout movements linked to this withdrawal.
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
                  <div className={`money-amount money-amount--${getAmountTone(transaction.amount)}`}>
                    {formatMoneyAmount(transaction.amount, { language })} {transaction.currencyCode}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {payoutPlan ? (
            <div className="card money-section-card">
              <div className="money-section-card__head">
                <div>
                  <div className="money-section-card__title">Payout plan</div>
                  <div className="money-section-card__subtitle">
                    {payoutPlan.treasuryAccountCode} - {payoutPlan.treasuryAccountTitle}
                  </div>
                </div>
                <span className={`status-chip status-chip--${getWithdrawalStatusTone(payoutPlan.status)}`}>
                  {payoutPlan.status}
                </span>
              </div>

              <div className="money-summary-box">
                <div className="money-summary-box__row">
                  <span>User amount</span>
                  <strong>
                    {formatMoneyAmount(payoutPlan.plannedUserAmount, { language })}{' '}
                    {payoutPlan.userCurrencyCode || request.currencyCode}
                  </strong>
                </div>
                <div className="money-summary-box__row">
                  <span>Treasury amount</span>
                  <strong>
                    {formatMoneyAmount(payoutPlan.treasuryAmount, { language })}{' '}
                    {payoutPlan.treasuryCurrencyCode}
                  </strong>
                </div>
                <div className="money-summary-box__row">
                  <span>Reference</span>
                  <strong>{payoutPlan.externalReference || moneyCopy.common.notAvailable}</strong>
                </div>
                <div className="money-summary-box__row">
                  <span>Planned</span>
                  <strong>{formatMoneyDateTime(payoutPlan.plannedAt, { language })}</strong>
                </div>
              </div>

              {payoutPlan.operatorComment ? (
                <div className="money-note-box">
                  <div className="money-note-box__title">{moneyCopy.withdrawals.detailComment}</div>
                  <div className="money-note-box__text">{payoutPlan.operatorComment}</div>
                </div>
              ) : null}
            </div>
          ) : null}

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

          {canTakeAction || canPlanAction || canConfirmAction || canRejectAction ? (
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

              {canPlanAction ? (
                <div className="card money-section-card backoffice-action-card">
                  <div className="money-section-card__head">
                    <div>
                      <div className="money-section-card__title">Plan payout</div>
                      <div className="money-section-card__subtitle">
                        Select the real account and amount before confirming the withdrawal.
                      </div>
                    </div>
                  </div>

                  <label className="field">
                    <span className="field__label">Treasury account</span>
                    <select
                      className="input"
                      value={planTreasuryAccountId}
                      onChange={(event) => setPlanTreasuryAccountId(event.target.value)}
                    >
                      <option value="">Select account</option>
                      {treasuryAccounts.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.code} - {account.title} ({account.currencyCode})
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="money-form-grid">
                    <label className="field">
                      <span className="field__label">User amount</span>
                      <input
                        className="input"
                        type="text"
                        value={planUserAmount}
                        placeholder={`${request.amount} ${request.currencyCode}`}
                        onChange={(event) => setPlanUserAmount(event.target.value)}
                      />
                    </label>
                    <label className="field">
                      <span className="field__label">Treasury amount</span>
                      <input
                        className="input"
                        type="text"
                        value={planTreasuryAmount}
                        placeholder={`${request.amount} ${request.currencyCode}`}
                        onChange={(event) => setPlanTreasuryAmount(event.target.value)}
                      />
                    </label>
                  </div>

                  <label className="field">
                    <span className="field__label">Reference ({copy.common.fieldOptional})</span>
                    <input
                      className="input"
                      type="text"
                      value={planReference}
                      placeholder="P2P order, tx hash, bank statement line"
                      onChange={(event) => setPlanReference(event.target.value)}
                    />
                  </label>

                  <label className="field">
                    <span className="field__label">
                      {copy.withdrawals.commentLabel} ({copy.common.fieldOptional})
                    </span>
                    <textarea
                      className="input backoffice-action-card__textarea"
                      rows={3}
                      value={planComment}
                      placeholder={copy.withdrawals.commentPlaceholder}
                      onChange={(event) => setPlanComment(event.target.value)}
                    />
                  </label>

                  <div className="money-form-actions">
                    <Button type="button" onClick={handlePlanPayout} disabled={actionLoading}>
                      Save payout plan
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

                  <div className="money-form-grid">
                    <label className="field">
                      <span className="field__label">Treasury account ({copy.common.fieldOptional})</span>
                      <select
                        className="input"
                        value={treasuryAccountId}
                        onChange={(event) => setTreasuryAccountId(event.target.value)}
                      >
                        <option value="">
                          {payoutPlan?.treasuryAccountId
                            ? 'Use payout plan'
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
                        placeholder={`${confirmAmount || request.amount} ${request.currencyCode}`}
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
                      placeholder="P2P order, tx hash, bank statement line"
                      onChange={(event) => setTreasuryExternalReference(event.target.value)}
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
