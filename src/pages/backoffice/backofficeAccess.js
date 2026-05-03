const PERMISSIONS = {
  shell: 'BACKOFFICE_ACCESS',
  depositApprove: 'DEPOSIT_APPROVE',
  disputesView: 'ORDER_DISPUTES_VIEW',
  withdrawalsView: 'WITHDRAWAL_REQUESTS_VIEW',
  withdrawalsTake: 'WITHDRAWAL_REQUESTS_TAKE',
  withdrawalsReject: 'WITHDRAWAL_REQUESTS_REJECT',
  withdrawalsConfirm: 'WITHDRAWAL_REQUESTS_CONFIRM',
  treasuryView: 'TREASURY_VIEW',
  treasuryManage: 'TREASURY_MANAGE',
}

function hasPermission(permissions, permission) {
  return Array.isArray(permissions) && permissions.includes(permission)
}

export function canViewDepositRequests(permissions) {
  return hasPermission(permissions, PERMISSIONS.depositApprove)
}

export function canViewWithdrawalRequests(permissions) {
  return hasPermission(permissions, PERMISSIONS.withdrawalsView)
}

export function canTakeWithdrawalRequests(permissions) {
  return (
    canViewWithdrawalRequests(permissions) &&
    hasPermission(permissions, PERMISSIONS.withdrawalsTake)
  )
}

export function canRejectWithdrawalRequests(permissions) {
  return (
    canViewWithdrawalRequests(permissions) &&
    hasPermission(permissions, PERMISSIONS.withdrawalsReject)
  )
}

export function canConfirmWithdrawalRequests(permissions) {
  return (
    canViewWithdrawalRequests(permissions) &&
    hasPermission(permissions, PERMISSIONS.withdrawalsConfirm)
  )
}

export function canViewDisputes(permissions) {
  return hasPermission(permissions, PERMISSIONS.disputesView)
}

export function canViewTreasury(permissions) {
  return hasPermission(permissions, PERMISSIONS.treasuryView)
}

export function canManageTreasury(permissions) {
  return canViewTreasury(permissions) && hasPermission(permissions, PERMISSIONS.treasuryManage)
}

export function canAccessBackoffice(permissions) {
  return (
    hasPermission(permissions, PERMISSIONS.shell) ||
    canViewDepositRequests(permissions) ||
    canViewWithdrawalRequests(permissions) ||
    canViewTreasury(permissions) ||
    canViewDisputes(permissions)
  )
}

export function getDefaultBackofficePath(permissions) {
  if (canViewWithdrawalRequests(permissions)) return '/backoffice/withdrawal-requests'
  if (canViewDepositRequests(permissions)) return '/backoffice/deposit-requests'
  if (canViewTreasury(permissions)) return '/backoffice/treasury'
  if (canViewDisputes(permissions)) return '/backoffice/disputes'
  if (hasPermission(permissions, PERMISSIONS.shell)) return '/backoffice'
  return '/'
}
