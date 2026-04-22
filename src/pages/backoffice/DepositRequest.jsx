import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import Button from '../../shared/ui/Button'
import {
  confirmAdminDepositRequest,
  getAdminDepositRequest,
  issueAdminDepositDetails,
  rejectAdminDepositRequest,
} from '../../api/adminDepositRequests'
import { useI18n } from '../../app/i18n'
import { useUser } from '../../app/user'
import { copyToClipboard } from '../../shared/lib/clipboard'
import { getErrorMessage } from '../../shared/lib/errors'
import {
  formatMoneyAmount,
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
  canViewDepositRequests,
  getDefaultBackofficePath,
} from './backofficeAccess'
import { getBackofficeMoneyCopy } from './backofficeMoneyCopy'
import {
  buildDepositTimeline,
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
  const { publicId } = useParams()
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
  const [rejectReason, setRejectReason] = useState('')

  const allowed = canViewDepositRequests(permissions)
  const fallbackPath = getDefaultBackofficePath(permissions)
  const backLink = location.state?.from || '/backoffice/deposit-requests'

  useEffect(() => {
    let active = true

    async function loadRequest() {
      setStatus('loading')
      setError('')

      try {
        const response = await getAdminDepositRequest(publicId)
        if (!active) return
        setRequest(normalizeBackofficeDepositRequest(response?.data))
        setStatus('ready')
      } catch (loadError) {
        if (!active) return
        setError(getErrorMessage(loadError, t('backoffice.depositRequestLoadError')))
        setStatus('error')
      }
    }

    if (allowed && publicId) {
      loadRequest()
    } else if (!publicId) {
      setStatus('error')
      setError(t('backoffice.depositRequestLoadError'))
    }

    return () => {
      active = false
    }
  }, [allowed, publicId, t])

  useEffect(() => {
    if (!request?.publicId) return
    setPaymentDetailsInput('')
    setRejectReason('')
    setActionError('')
  }, [request?.publicId, request?.status])

  const paymentDetails = useMemo(
    () => normalizeDetailsList(request?.paymentDetails),
    [request?.paymentDetails]
  )
  const methodSnapshot = useMemo(
    () =>
      buildMethodSnapshotList(request?.methodSnapshot, [
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
      ]),
    [moneyCopy.common.currency, moneyCopy.common.method, moneyCopy.common.notAvailable, request?.currencyCode, request?.depositMethodId, request?.methodSnapshot, request?.methodTitle]
  )

  const summaryItems = [
    {
      label: moneyCopy.common.requestId,
      value: request?.publicId || moneyCopy.common.notAvailable,
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
  ]

  const timelineItems = useMemo(
    () => buildDepositTimeline(request, { t, language }),
    [language, request, t]
  )
  const actionLoading = actionStatus !== 'idle'
  const canIssue = canIssueDepositDetails(request?.status)
  const canConfirm = canConfirmDeposit(request?.status)
  const canReject = canRejectDeposit(request?.status)

  const handleIssueDetails = async () => {
    if (!publicId || actionLoading) return
    if (!paymentDetailsInput.trim()) {
      setActionError(t('backoffice.paymentDetailsRequired'))
      return
    }

    setActionError('')
    setActionNotice('')
    setActionStatus('issue')

    try {
      const response = await issueAdminDepositDetails(publicId, {
        payment_details: paymentDetailsInput.trim(),
      })
      setRequest(normalizeBackofficeDepositRequest(response?.data))
      setActionNotice(copy.common.successIssued)
      setPaymentDetailsInput('')
    } catch (submitError) {
      setActionError(getErrorMessage(submitError, t('backoffice.depositRequestActionError')))
    } finally {
      setActionStatus('idle')
    }
  }

  const handleConfirm = async () => {
    if (!publicId || actionLoading) return

    setActionError('')
    setActionNotice('')
    setActionStatus('confirm')

    try {
      const response = await confirmAdminDepositRequest(publicId)
      setRequest(normalizeBackofficeDepositRequest(response?.data))
      setActionNotice(copy.common.successConfirmed)
    } catch (submitError) {
      setActionError(getErrorMessage(submitError, t('backoffice.depositRequestActionError')))
    } finally {
      setActionStatus('idle')
    }
  }

  const handleReject = async () => {
    if (!publicId || actionLoading) return
    if (!rejectReason.trim()) {
      setActionError(t('backoffice.rejectReasonRequired'))
      return
    }

    setActionError('')
    setActionNotice('')
    setActionStatus('reject')

    try {
      const response = await rejectAdminDepositRequest(publicId, {
        reject_reason: rejectReason.trim(),
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
        title={request?.publicId || copy.deposits.title}
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
            </div>

            <div className="card money-section-card">
              <div className="money-section-card__head">
                <div className="money-section-card__title">{moneyCopy.deposits.timeline}</div>
              </div>
              <MoneyTimeline items={timelineItems} emptyLabel={moneyCopy.deposits.noTimeline} />
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
                    <span className="field__label">{t('backoffice.paymentDetailsLabel')}</span>
                    <textarea
                      className="input backoffice-action-card__textarea"
                      rows={6}
                      value={paymentDetailsInput}
                      placeholder={t('backoffice.paymentDetailsPlaceholder')}
                      onChange={(event) => setPaymentDetailsInput(event.target.value)}
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
