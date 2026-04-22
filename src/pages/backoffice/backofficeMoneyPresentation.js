import {
  formatMoneyDateTime,
  humanizeCode,
  normalizeDepositRequest,
  normalizeDetailsList,
  normalizeWithdrawalRequest,
  safeJsonParse,
} from '../../shared/lib/money'
import { resolveDepositStatusLabel, resolveDepositStatusTone } from '../../app/depositRequests'

export const DEPOSIT_ACTIONABLE_STATUSES = ['PENDING_DETAILS', 'PAYMENT_VERIFICATION']
export const DEPOSIT_STATUS_OPTIONS = [
  'PENDING_DETAILS',
  'WAITING_PAYMENT',
  'PAYMENT_VERIFICATION',
  'CONFIRMED',
  'REJECTED',
  'EXPIRED',
  'CANCELLED',
]

export const WITHDRAWAL_ACTIONABLE_STATUSES = ['OPEN', 'PROCESSING']
export const WITHDRAWAL_STATUS_OPTIONS = [
  'OPEN',
  'PROCESSING',
  'COMPLETED',
  'REJECTED',
  'CANCELLED',
]

function normalizeObject(value) {
  if (!value) return null
  if (typeof value === 'object') return value
  const parsed = safeJsonParse(value)
  return parsed && typeof parsed === 'object' ? parsed : null
}

function normalizeDate(...values) {
  return values.find((value) => Boolean(value)) || ''
}

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeUserSummary(value) {
  const summary = normalizeObject(value)
  return summary && Object.keys(summary).length > 0 ? summary : null
}

function getUserSummaryId(summary) {
  if (!summary) return null
  return summary?.user_id ?? summary?.userId ?? summary?.id ?? null
}

function getUserSummaryName(summary) {
  if (!summary) return ''
  const fullName = normalizeText(
    summary?.full_name || summary?.fullName || summary?.display_name || summary?.displayName
  )
  if (fullName) return fullName

  return [summary?.first_name, summary?.firstName, summary?.last_name, summary?.lastName]
    .map(normalizeText)
    .filter(Boolean)
    .join(' ')
}

function getUserSummaryLabel(summary) {
  if (!summary) return ''

  return (
    getUserSummaryName(summary) ||
    normalizeText(summary?.username) ||
    normalizeText(summary?.login) ||
    normalizeText(summary?.email)
  )
}

export function normalizeBackofficeDepositRequest(item) {
  const base = normalizeDepositRequest(item)
  if (!base) return null
  const userSummary = normalizeUserSummary(item?.user_summary || item?.userSummary)

  return {
    ...base,
    userId: item?.user_id ?? item?.userId ?? getUserSummaryId(userSummary),
    userSummary,
    depositMethodId: item?.deposit_method_id ?? item?.depositMethodId ?? null,
    updatedAt: normalizeDate(item?.updated_at, item?.updatedAt, base.updatedAt),
    methodSnapshot: normalizeObject(
      item?.deposit_method_snapshot ||
        item?.depositMethodSnapshot ||
        item?.method_snapshot ||
        item?.methodSnapshot
    ),
  }
}

export function normalizeBackofficeWithdrawalRequest(item) {
  const base = normalizeWithdrawalRequest(item)
  if (!base) return null

  return {
    ...base,
    userId: item?.user_id ?? item?.userId ?? null,
    userAccountId: item?.user_account_id ?? item?.userAccountId ?? null,
    withdrawalMethodId:
      item?.withdrawal_method_id ?? item?.withdrawalMethodId ?? item?.method_id ?? item?.methodId ?? null,
    payoutProfilePublicId: item?.payout_profile_public_id || item?.payoutProfilePublicId || '',
    requisitesSnapshot:
      item?.requisites || item?.requisites_snapshot || item?.requisitesSnapshot || base.requisitesSnapshot,
    methodNote: item?.method_note || item?.methodNote || base.methodNote || '',
    processedByUserId: item?.processed_by_user_id ?? item?.processedByUserId ?? null,
    openedAt: item?.opened_at || item?.openedAt || base.openedAt || base.createdAt,
    processingAt: item?.processing_at || item?.processingAt || '',
    updatedAt: normalizeDate(item?.updated_at, item?.updatedAt, base.updatedAt),
    methodSnapshot: normalizeObject(
      item?.withdrawal_method_snapshot ||
        item?.withdrawalMethodSnapshot ||
        item?.method_snapshot ||
        item?.methodSnapshot
    ),
  }
}

export function getBackofficeEntityLabel(parts, fallback) {
  const filtered = (Array.isArray(parts) ? parts : []).filter(Boolean)
  return filtered.length > 0 ? filtered.join(' · ') : fallback
}

export function getDepositUserIdentityLabel(request, copy) {
  const summaryLabel = getUserSummaryLabel(request?.userSummary)
  if (summaryLabel) return summaryLabel
  if (request?.userId != null) return `${copy.common.userId} ${request.userId}`
  return copy.common.loadingIdentity
}

export function getWithdrawalUserIdentityLabel(request, copy) {
  return getBackofficeEntityLabel(
    [
      request?.userId != null ? `${copy.common.userId} ${request.userId}` : '',
      request?.userAccountId != null ? `${copy.common.userAccountId} ${request.userAccountId}` : '',
    ],
    copy.common.loadingIdentity
  )
}

export function getProcessedByLabel(request, copy, fallback) {
  if (request?.processedByUserId != null) {
    return `${copy.common.userId} ${request.processedByUserId}`
  }
  return fallback || copy.common.notAssigned
}

export function resolveDepositBackofficeStatusLabel(status, t, language = 'ru') {
  if ((status || '').toUpperCase() === 'EXPIRED') {
    return language === 'en' ? 'Expired' : 'Истекла'
  }
  return resolveDepositStatusLabel(status, t)
}

export function resolveDepositBackofficeStatusTone(status) {
  if ((status || '').toUpperCase() === 'EXPIRED') return 'muted'
  return resolveDepositStatusTone(status)
}

export function canIssueDepositDetails(status) {
  return (status || '').toUpperCase() === 'PENDING_DETAILS'
}

export function canConfirmDeposit(status) {
  return (status || '').toUpperCase() === 'PAYMENT_VERIFICATION'
}

export function canRejectDeposit(status) {
  return (status || '').toUpperCase() === 'PAYMENT_VERIFICATION'
}

export function canTakeWithdrawal(status) {
  return (status || '').toUpperCase() === 'OPEN'
}

export function canConfirmWithdrawal(status) {
  return (status || '').toUpperCase() === 'PROCESSING'
}

export function canRejectWithdrawal(status) {
  const normalized = (status || '').toUpperCase()
  return normalized === 'OPEN' || normalized === 'PROCESSING'
}

export function getDepositImportantTimestamp(request) {
  return (
    request?.updatedAt ||
    request?.userMarkedPaidAt ||
    request?.detailsIssuedAt ||
    request?.confirmedAt ||
    request?.rejectedAt ||
    request?.cancelledAt ||
    request?.createdAt ||
    ''
  )
}

export function getWithdrawalImportantTimestamp(request) {
  return (
    request?.updatedAt ||
    request?.processingAt ||
    request?.completedAt ||
    request?.rejectedAt ||
    request?.cancelledAt ||
    request?.openedAt ||
    request?.createdAt ||
    ''
  )
}

export function getRequestSearchToken(request) {
  return [request?.publicId, request?.status, request?.currencyCode, request?.methodTitle]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

export function buildMethodSnapshotList(snapshot, fallbackItems = []) {
  const details = normalizeDetailsList(snapshot)
  return details.length > 0 ? details : fallbackItems
}

export function buildDepositTimeline(request, { t, language }) {
  return [
    request?.createdAt
      ? {
          label: t('account.depositRequestCreatedAt'),
          value: formatMoneyDateTime(request.createdAt, { language }),
        }
      : null,
    request?.detailsIssuedAt
      ? {
          label: t('account.depositRequestDetailsIssuedAt'),
          value: formatMoneyDateTime(request.detailsIssuedAt, { language }),
        }
      : null,
    request?.userMarkedPaidAt
      ? {
          label: t('account.depositRequestMarkedPaidAt'),
          value: formatMoneyDateTime(request.userMarkedPaidAt, { language }),
        }
      : null,
    request?.confirmedAt
      ? {
          label: t('account.depositRequestConfirmedAt'),
          value: formatMoneyDateTime(request.confirmedAt, { language }),
        }
      : null,
    request?.rejectedAt
      ? {
          label: t('account.depositRequestRejectedAt'),
          value: formatMoneyDateTime(request.rejectedAt, { language }),
        }
      : null,
    request?.cancelledAt
      ? {
          label: t('account.depositRequestCancelledAt'),
          value: formatMoneyDateTime(request.cancelledAt, { language }),
        }
      : null,
    request?.updatedAt
      ? {
          label: language === 'en' ? 'Updated' : 'Обновлено',
          value: formatMoneyDateTime(request.updatedAt, { language }),
        }
      : null,
  ].filter(Boolean)
}

export function buildWithdrawalTimeline(request, copy, language) {
  return [
    request?.createdAt
      ? {
          label: copy.common.createdAt,
          value: formatMoneyDateTime(request.createdAt, { language }),
        }
      : null,
    request?.openedAt
      ? {
          label: language === 'en' ? 'Opened' : 'Открыта',
          value: formatMoneyDateTime(request.openedAt, { language }),
        }
      : null,
    request?.processingAt
      ? {
          label: language === 'en' ? 'Taken in work' : 'Взята в работу',
          value: formatMoneyDateTime(request.processingAt, { language }),
          caption: getProcessedByLabel(request, copy),
        }
      : null,
    request?.completedAt
      ? {
          label: copy.common.completedAt,
          value: formatMoneyDateTime(request.completedAt, { language }),
          caption: getProcessedByLabel(request, copy),
        }
      : null,
    request?.rejectedAt
      ? {
          label: copy.common.rejectedAt,
          value: formatMoneyDateTime(request.rejectedAt, { language }),
          caption: getProcessedByLabel(request, copy),
        }
      : null,
    request?.cancelledAt
      ? {
          label: copy.common.cancelledAt,
          value: formatMoneyDateTime(request.cancelledAt, { language }),
        }
      : null,
    request?.updatedAt
      ? {
          label: copy.common.updatedAt,
          value: formatMoneyDateTime(request.updatedAt, { language }),
        }
      : null,
  ].filter(Boolean)
}

export function humanizeFallback(value) {
  return humanizeCode(value || '')
}
