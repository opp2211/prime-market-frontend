export const ACCOUNT_TYPES = [
  'BANK_CARD',
  'BANK_ACCOUNT',
  'CRYPTO_WALLET',
  'EXCHANGE_ACCOUNT',
  'P2P_DROP',
  'CASH',
  'OTHER',
]

export const MANUAL_TYPES = ['MANUAL_IN', 'MANUAL_OUT', 'ADJUSTMENT']
export const PLATFORM_TRANSACTION_TYPES = ['MANUAL', 'ADJUSTMENT', 'FEE', 'FX_IN', 'FX_OUT', 'ROUNDING']

export const emptyAccountForm = {
  code: '',
  title: '',
  currencyCode: 'RUB',
  accountType: 'BANK_CARD',
  note: '',
}

export const emptyManualForm = {
  accountId: '',
  transactionType: 'MANUAL_IN',
  amount: '',
  externalReference: '',
  description: '',
  operatorComment: '',
}

export const emptyTransferForm = {
  fromAccountId: '',
  toAccountId: '',
  fromAmount: '',
  toAmount: '',
  externalReference: '',
  description: '',
}

export const emptyPlatformAdjustmentForm = {
  platformAccountId: '',
  transactionType: 'MANUAL',
  amount: '',
  description: '',
}

export const emptyRouteForm = {
  depositMethodId: '',
  treasuryAccountId: '',
  title: '',
  paymentDetails: '{\n  "bank": "",\n  "recipient": "",\n  "account": ""\n}',
  minAmount: '',
  maxAmount: '',
  priority: '100',
  isActive: true,
  note: '',
}

export function accountLabel(account) {
  if (!account) return ''
  return `${account.code || account.title} - ${account.title || account.code} (${account.currencyCode})`
}

export function normalizeAmountInput(value) {
  return String(value || '').trim().replace(',', '.')
}

export function parseJsonObject(value) {
  const trimmed = String(value || '').trim()
  if (!trimmed) return {}
  const parsed = JSON.parse(trimmed)
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('JSON must be an object.')
  }
  return parsed
}
