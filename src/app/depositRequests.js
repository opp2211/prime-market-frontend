export const DEPOSIT_REQUEST_STATUS = {
  PENDING_DETAILS: 'PENDING_DETAILS',
  WAITING_PAYMENT: 'WAITING_PAYMENT',
  PAYMENT_VERIFICATION: 'PAYMENT_VERIFICATION',
  CONFIRMED: 'CONFIRMED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
}

const CANCEL_ALLOWED = new Set([
  DEPOSIT_REQUEST_STATUS.PENDING_DETAILS,
  DEPOSIT_REQUEST_STATUS.WAITING_PAYMENT,
  DEPOSIT_REQUEST_STATUS.PAYMENT_VERIFICATION,
])

export function canCancelDepositRequest(status) {
  return CANCEL_ALLOWED.has(status)
}

export function canMarkPaidDepositRequest(status) {
  return status === DEPOSIT_REQUEST_STATUS.WAITING_PAYMENT
}

export function resolveDepositStatusLabel(status, t) {
  switch (status) {
    case DEPOSIT_REQUEST_STATUS.PENDING_DETAILS:
      return t('account.depositStatusPendingDetails')
    case DEPOSIT_REQUEST_STATUS.WAITING_PAYMENT:
      return t('account.depositStatusWaitingPayment')
    case DEPOSIT_REQUEST_STATUS.PAYMENT_VERIFICATION:
      return t('account.depositStatusPaymentVerification')
    case DEPOSIT_REQUEST_STATUS.CONFIRMED:
      return t('account.depositStatusConfirmed')
    case DEPOSIT_REQUEST_STATUS.REJECTED:
      return t('account.depositStatusRejected')
    case DEPOSIT_REQUEST_STATUS.CANCELLED:
      return t('account.depositStatusCancelled')
    default:
      return status || t('account.depositStatusUnknown')
  }
}

export function resolveDepositStatusTone(status) {
  switch (status) {
    case DEPOSIT_REQUEST_STATUS.CONFIRMED:
      return 'success'
    case DEPOSIT_REQUEST_STATUS.REJECTED:
      return 'danger'
    case DEPOSIT_REQUEST_STATUS.CANCELLED:
      return 'muted'
    case DEPOSIT_REQUEST_STATUS.PAYMENT_VERIFICATION:
      return 'warn'
    case DEPOSIT_REQUEST_STATUS.WAITING_PAYMENT:
      return 'info'
    case DEPOSIT_REQUEST_STATUS.PENDING_DETAILS:
      return 'info'
    default:
      return 'muted'
  }
}
