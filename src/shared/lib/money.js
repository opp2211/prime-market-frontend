const ZERO_EPSILON = 0.00000001
const WALLET_COLLECTION_KEYS = ['items', 'content', 'wallets', 'balances', 'data', 'result']
const WALLET_META_KEYS = new Set([
  ...WALLET_COLLECTION_KEYS,
  'page',
  'size',
  'number',
  'total',
  'totalelements',
  'totalpages',
])

function toNumber(value, fallback = 0) {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : fallback
}

export function normalizeCurrencyCode(value) {
  return (value || '').toString().trim().toUpperCase()
}

export function getMoneyLocale(language = 'ru') {
  return language === 'en' ? 'en-US' : 'ru-RU'
}

export function formatMoneyAmount(
  value,
  {
    language = 'ru',
    fallback = '\u2014',
    minimumFractionDigits = 2,
    maximumFractionDigits = 8,
  } = {}
) {
  const numberValue = Number(value)
  if (!Number.isFinite(numberValue)) return fallback

  try {
    return new Intl.NumberFormat(getMoneyLocale(language), {
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(numberValue)
  } catch {
    return numberValue.toFixed(Math.max(minimumFractionDigits, 2))
  }
}

export function formatMoneyDateTime(value, { language = 'ru', fallback = '\u2014' } = {}) {
  if (!value) return fallback
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return fallback

  try {
    return new Intl.DateTimeFormat(getMoneyLocale(language), {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date)
  } catch {
    return date.toLocaleString()
  }
}

export function isNonZeroAmount(value) {
  return Math.abs(toNumber(value, 0)) > ZERO_EPSILON
}

export function hasWalletValue(wallet) {
  if (!wallet) return false
  return (
    isNonZeroAmount(wallet.balance) ||
    isNonZeroAmount(wallet.available) ||
    isNonZeroAmount(wallet.reserved)
  )
}

function readWalletEntryCode(wallet, fallback = '') {
  return normalizeCurrencyCode(
    wallet?.currencyCode ||
      wallet?.currency_code ||
      wallet?.walletCurrencyCode ||
      wallet?.wallet_currency_code ||
      wallet?.code ||
      fallback
  )
}

function unwrapWalletCollection(wallets) {
  if (!wallets || typeof wallets !== 'object') return wallets

  for (const key of WALLET_COLLECTION_KEYS) {
    const nested = wallets[key]
    if (Array.isArray(nested)) return nested
    if (nested && typeof nested === 'object') return nested
  }

  return wallets
}

function isWalletMetaCode(code) {
  return WALLET_META_KEYS.has((code || '').toString().trim().toLowerCase())
}

export function normalizeWalletEntries(wallets, currencies = []) {
  const codes = new Set()
  const walletRecords = new Map()

  const addCode = (value) => {
    const normalized = normalizeCurrencyCode(value)
    if (normalized && !isWalletMetaCode(normalized)) codes.add(normalized)
  }

  const addWalletRecord = (code, wallet) => {
    const normalizedCode = normalizeCurrencyCode(code)
    if (!normalizedCode || isWalletMetaCode(normalizedCode)) return
    codes.add(normalizedCode)
    walletRecords.set(normalizedCode, wallet && typeof wallet === 'object' ? wallet : {})
  }

  const walletSource = unwrapWalletCollection(wallets)
  const normalizedWallets = walletSource && typeof walletSource === 'object' ? walletSource : {}
  currencies.forEach((item) => addCode(item?.code || item))

  if (Array.isArray(walletSource)) {
    walletSource.forEach((wallet) => addWalletRecord(readWalletEntryCode(wallet), wallet))
  } else {
    Object.entries(normalizedWallets).forEach(([code, wallet]) => {
      if (!wallet || typeof wallet !== 'object') return
      addWalletRecord(readWalletEntryCode(wallet, code), wallet)
    })
  }

  return Array.from(codes)
    .map((code) => {
      const wallet = walletRecords.get(code) || {}

      return {
        code,
        balance: toNumber(wallet?.balance, 0),
        reserved: toNumber(wallet?.reserved, 0),
        available: toNumber(wallet?.available, 0),
      }
    })
}

export function getDisplayWallet(entries, currencyCode) {
  const normalizedCode = normalizeCurrencyCode(currencyCode)
  return entries.find((item) => item.code === normalizedCode) || null
}

export function safeJsonParse(value) {
  if (value == null) return null
  if (typeof value === 'object') return value
  if (typeof value !== 'string') return null

  const trimmed = value.trim()
  if (!trimmed) return null

  try {
    return JSON.parse(trimmed)
  } catch {
    return null
  }
}

export function humanizeCode(value) {
  const source = (value || '').toString().trim()
  if (!source) return ''

  return source
    .replace(/[_-]+/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export function normalizeTransaction(item) {
  if (!item || typeof item !== 'object') return null

  const payload = safeJsonParse(item?.payload) || item?.payload || null
  const description =
    item?.description ||
    item?.label ||
    item?.note ||
    payload?.description ||
    payload?.label ||
    payload?.note ||
    ''

  return {
    id: item?.public_id || item?.publicId || item?.id || '',
    createdAt: item?.created_at || item?.createdAt || '',
    amount: toNumber(item?.amount, 0),
    currencyCode: normalizeCurrencyCode(item?.currency_code || item?.currencyCode),
    type: item?.type || item?.tx_type || item?.txType || '',
    description,
  }
}

export function getAmountTone(value) {
  const numberValue = toNumber(value, 0)
  if (numberValue > ZERO_EPSILON) return 'positive'
  if (numberValue < -ZERO_EPSILON) return 'negative'
  return 'neutral'
}

export function normalizeDepositPaymentInstruction(item) {
  if (!item || typeof item !== 'object') return null

  return {
    publicId: item?.public_id || item?.publicId || '',
    depositPaymentRoutePublicId:
      item?.deposit_payment_route_public_id || item?.depositPaymentRoutePublicId || '',
    treasuryAccountPublicId:
      item?.treasury_account_public_id || item?.treasuryAccountPublicId || '',
    treasuryAccountCode: item?.treasury_account_code || item?.treasuryAccountCode || '',
    treasuryAccountTitle: item?.treasury_account_title || item?.treasuryAccountTitle || '',
    paymentDetails: item?.payment_details || item?.paymentDetails || {},
    amount: toNumber(item?.amount, 0),
    currencyCode: normalizeCurrencyCode(item?.currency_code || item?.currencyCode),
    treasuryAmount: toNumber(item?.treasury_amount ?? item?.treasuryAmount, 0),
    treasuryCurrencyCode: normalizeCurrencyCode(
      item?.treasury_currency_code || item?.treasuryCurrencyCode
    ),
    status: item?.status || '',
    expiresAt: item?.expires_at || item?.expiresAt || '',
    issuedAt: item?.issued_at || item?.issuedAt || '',
    issuedByUserId: item?.issued_by_user_id ?? item?.issuedByUserId ?? null,
    operatorComment: item?.operator_comment || item?.operatorComment || '',
  }
}

export function normalizeDepositRequest(item) {
  if (!item || typeof item !== 'object') return null

  const paymentInstruction = normalizeDepositPaymentInstruction(
    item?.payment_instruction || item?.paymentInstruction
  )

  return {
    publicId: item?.public_id || item?.publicId || '',
    amount: toNumber(item?.amount, 0),
    currencyCode: normalizeCurrencyCode(item?.currency_code || item?.currencyCode),
    methodTitle: item?.deposit_method_title || item?.depositMethodTitle || '',
    status: item?.status || '',
    paymentDetails:
      item?.payment_details ||
      item?.paymentDetails ||
      paymentInstruction?.paymentDetails ||
      '',
    paymentInstruction,
    detailsIssuedAt: item?.details_issued_at || item?.detailsIssuedAt || '',
    detailsIssuedByUserId: item?.details_issued_by_user_id ?? item?.detailsIssuedByUserId ?? null,
    userMarkedPaidAt: item?.user_marked_paid_at || item?.userMarkedPaidAt || '',
    confirmedAt: item?.confirmed_at || item?.confirmedAt || '',
    confirmedByUserId: item?.confirmed_by_user_id ?? item?.confirmedByUserId ?? null,
    confirmationReference: item?.confirmation_reference || item?.confirmationReference || '',
    rejectedAt: item?.rejected_at || item?.rejectedAt || '',
    rejectedByUserId: item?.rejected_by_user_id ?? item?.rejectedByUserId ?? null,
    rejectReason: item?.reject_reason || item?.rejectReason || '',
    operatorComment: item?.operator_comment || item?.operatorComment || '',
    treasuryAccountId: item?.treasury_account_id ?? item?.treasuryAccountId ?? null,
    treasuryTransactionId: item?.treasury_transaction_id ?? item?.treasuryTransactionId ?? null,
    treasuryTransactions: normalizeTreasuryTransactions(
      item?.treasury_transactions || item?.treasuryTransactions
    ),
    cancelledAt: item?.cancelled_at || item?.cancelledAt || '',
    createdAt: item?.created_at || item?.createdAt || '',
    updatedAt: item?.updated_at || item?.updatedAt || '',
    events: normalizeMoneyOperationEvents(item?.events),
  }
}

export function normalizeWithdrawalMethod(item) {
  if (!item || typeof item !== 'object') return null

  const code = normalizeCurrencyCode(
    item?.code || item?.method_code || item?.withdrawal_method_code || item?.slug || item?.type
  )
  const networks =
    item?.networks ||
    item?.supported_networks ||
    item?.supportedNetworks ||
    item?.networks_available ||
    []

  return {
    id: item?.id ?? item?.method_id ?? item?.withdrawal_method_id ?? null,
    code,
    title: item?.title || item?.label || humanizeCode(code),
    currencyCode: normalizeCurrencyCode(item?.currency_code || item?.currencyCode),
    minAmount:
      item?.min_amount ??
      item?.minAmount ??
      item?.minimum_amount ??
      item?.minimumAmount ??
      null,
    note: item?.note || item?.description || item?.help || '',
    roundingInfo:
      item?.rounding_info || item?.roundingInfo || item?.rounding_note || item?.roundingNote || '',
    networks: Array.isArray(networks) ? networks.filter(Boolean) : [],
  }
}

export function getMethodIdentityPayload(
  method,
  { idKey = 'withdrawal_method_id', codeKey = 'withdrawal_method_code' } = {}
) {
  if (!method) return {}
  if (method.id != null && method.id !== '') return { [idKey]: method.id }
  if (method.code) return { [codeKey]: method.code }
  return {}
}

export function getEntityId(item) {
  if (!item || typeof item !== 'object') return ''
  return item.publicId || item.public_id || item.id || item.profile_id || ''
}

export function getProfileIdentityPayload(
  profile,
  { idKey = 'payout_profile_id', publicIdKey = 'payout_profile_public_id' } = {}
) {
  if (!profile) return {}
  if (profile.id != null && profile.id !== '') return { [idKey]: profile.id }
  if (profile.publicId) return { [publicIdKey]: profile.publicId }
  return {}
}

export function extractRequisitesSnapshot(item) {
  const raw =
    item?.requisites_snapshot ||
    item?.requisitesSnapshot ||
    item?.payout_details_snapshot ||
    item?.payoutDetailsSnapshot ||
    item?.requisites ||
    item?.details ||
    item?.snapshot ||
    null

  const parsed = safeJsonParse(raw)
  if (parsed && typeof parsed === 'object') return parsed
  if (raw && typeof raw === 'object') return raw
  if (typeof raw === 'string' && raw.trim()) return { value: raw.trim() }
  return {}
}

export function normalizePayoutProfile(item) {
  if (!item || typeof item !== 'object') return null

  const methodCode = normalizeCurrencyCode(
    item?.method_code ||
      item?.withdrawal_method_code ||
      item?.withdrawalMethodCode ||
      item?.method?.code ||
      item?.withdrawal_method?.code
  )

  return {
    id: item?.id ?? item?.profile_id ?? null,
    publicId: item?.public_id || item?.publicId || '',
    label: item?.label || item?.title || item?.name || '',
    currencyCode: normalizeCurrencyCode(item?.currency_code || item?.currencyCode),
    methodCode,
    methodTitle:
      item?.method_title ||
      item?.withdrawal_method_title ||
      item?.method?.title ||
      item?.withdrawal_method?.title ||
      humanizeCode(methodCode),
    requisites: extractRequisitesSnapshot(item),
    isDefault: Boolean(item?.is_default ?? item?.isDefault ?? item?.default_profile ?? item?.default),
    createdAt: item?.created_at || item?.createdAt || '',
    updatedAt: item?.updated_at || item?.updatedAt || '',
  }
}

export function normalizeWithdrawalPayoutPlan(item) {
  if (!item || typeof item !== 'object') return null

  return {
    publicId: item?.public_id || item?.publicId || '',
    treasuryAccountPublicId:
      item?.treasury_account_public_id || item?.treasuryAccountPublicId || '',
    treasuryAccountCode: item?.treasury_account_code || item?.treasuryAccountCode || '',
    treasuryAccountTitle: item?.treasury_account_title || item?.treasuryAccountTitle || '',
    plannedUserAmount: toNumber(item?.planned_user_amount ?? item?.plannedUserAmount, 0),
    userCurrencyCode: normalizeCurrencyCode(item?.user_currency_code || item?.userCurrencyCode),
    treasuryAmount: toNumber(item?.treasury_amount ?? item?.treasuryAmount, 0),
    treasuryCurrencyCode: normalizeCurrencyCode(
      item?.treasury_currency_code || item?.treasuryCurrencyCode
    ),
    externalReference: item?.external_reference || item?.externalReference || '',
    operatorComment: item?.operator_comment || item?.operatorComment || '',
    status: item?.status || '',
    plannedByUserId: item?.planned_by_user_id ?? item?.plannedByUserId ?? null,
    plannedAt: item?.planned_at || item?.plannedAt || '',
    completedAt: item?.completed_at || item?.completedAt || '',
    cancelledAt: item?.cancelled_at || item?.cancelledAt || '',
  }
}

export function normalizeWithdrawalRequest(item) {
  if (!item || typeof item !== 'object') return null

  const methodCode = normalizeCurrencyCode(
    item?.method_code ||
      item?.withdrawal_method_code ||
      item?.withdrawalMethodCode ||
      item?.method?.code ||
      item?.withdrawal_method?.code
  )

  return {
    publicId: item?.public_id || item?.publicId || '',
    amount:
      item?.requested_amount ??
      item?.requestedAmount ??
      item?.amount ??
      0,
    actualPayoutAmount:
      item?.actual_payout_amount ??
      item?.actualPayoutAmount ??
      item?.payout_amount ??
      item?.payoutAmount ??
      item?.net_amount ??
      item?.netAmount ??
      null,
    currencyCode: normalizeCurrencyCode(item?.currency_code || item?.currencyCode),
    methodCode,
    methodTitle:
      item?.method_title ||
      item?.withdrawal_method_title ||
      item?.method?.title ||
      item?.withdrawal_method?.title ||
      humanizeCode(methodCode),
    status: item?.status || '',
    operatorComment:
      item?.operator_comment ||
      item?.operatorComment ||
      item?.comment ||
      item?.internal_comment ||
      '',
    rejectReason:
      item?.reject_reason || item?.rejection_reason || item?.rejectReason || item?.rejectionReason || '',
    treasuryAccountId: item?.treasury_account_id ?? item?.treasuryAccountId ?? null,
    treasuryTransactionId: item?.treasury_transaction_id ?? item?.treasuryTransactionId ?? null,
    treasuryTransactions: normalizeTreasuryTransactions(
      item?.treasury_transactions || item?.treasuryTransactions
    ),
    payoutPlan: normalizeWithdrawalPayoutPlan(item?.payout_plan || item?.payoutPlan),
    requisitesSnapshot: extractRequisitesSnapshot(item),
    createdAt: item?.created_at || item?.createdAt || '',
    updatedAt: item?.updated_at || item?.updatedAt || '',
    completedAt: item?.completed_at || item?.completedAt || '',
    rejectedAt: item?.rejected_at || item?.rejectedAt || '',
    cancelledAt: item?.cancelled_at || item?.cancelledAt || '',
    approvedAt: item?.approved_at || item?.approvedAt || '',
    openUntil: item?.open_until || item?.openUntil || '',
    events: normalizeMoneyOperationEvents(item?.events),
  }
}

export function getWithdrawalStatusTone(status) {
  switch ((status || '').toUpperCase()) {
    case 'COMPLETED':
    case 'DONE':
    case 'PAID':
      return 'success'
    case 'REJECTED':
    case 'FAILED':
      return 'danger'
    case 'CANCELLED':
    case 'EXPIRED':
      return 'muted'
    case 'PROCESSING':
    case 'IN_PROGRESS':
    case 'UNDER_REVIEW':
      return 'warn'
    case 'OPEN':
    case 'PENDING':
    case 'CREATED':
      return 'info'
    default:
      return 'muted'
  }
}

export function getWithdrawalStatusLabel(status, copy) {
  const normalized = (status || '').toUpperCase()
  const known = copy?.statuses?.withdrawal?.[normalized]
  return known || humanizeCode(normalized || copy?.common?.unknown || 'UNKNOWN')
}

export function canCancelWithdrawalRequest(status) {
  const normalized = (status || '').toUpperCase()
  return normalized === 'OPEN' || normalized === 'CREATED' || normalized === 'PENDING'
}

export function normalizeDetailsList(details) {
  if (!details) return []

  if (Array.isArray(details)) {
    return details
      .map((value, index) => ({
        key: String(index + 1),
        value: value == null ? '' : String(value),
      }))
      .filter((item) => item.value)
  }

  if (typeof details === 'object') {
    return Object.entries(details)
      .map(([key, value]) => ({
        key: humanizeCode(key),
        value:
          value == null
            ? ''
            : typeof value === 'object'
              ? JSON.stringify(value)
              : String(value),
      }))
      .filter((item) => item.value)
  }

  if (typeof details === 'string' && details.trim()) {
    const parsed = safeJsonParse(details)
    if (parsed && parsed !== details) {
      return normalizeDetailsList(parsed)
    }
    return [{ key: 'Value', value: details.trim() }]
  }

  return []
}

export function normalizeMoneyOperationEvent(item) {
  if (!item || typeof item !== 'object') return null

  return {
    publicId: item?.public_id || item?.publicId || '',
    operationType: item?.operation_type || item?.operationType || '',
    operationPublicId: item?.operation_public_id || item?.operationPublicId || '',
    eventType: item?.event_type || item?.eventType || '',
    statusBefore: item?.status_before || item?.statusBefore || '',
    statusAfter: item?.status_after || item?.statusAfter || '',
    actorType: item?.actor_type || item?.actorType || '',
    actorUserId: item?.actor_user_id ?? item?.actorUserId ?? null,
    publicNote: item?.public_note || item?.publicNote || '',
    operatorNote: item?.operator_note || item?.operatorNote || '',
    payload: safeJsonParse(item?.payload) || item?.payload || {},
    createdAt: item?.created_at || item?.createdAt || '',
  }
}

export function normalizeMoneyOperationEvents(events) {
  return Array.isArray(events) ? events.map(normalizeMoneyOperationEvent).filter(Boolean) : []
}

export function normalizeTreasuryAccount(item) {
  if (!item || typeof item !== 'object') return null

  return {
    publicId: item?.public_id || item?.publicId || '',
    code: item?.code || '',
    title: item?.title || '',
    currencyCode: normalizeCurrencyCode(item?.currency_code || item?.currencyCode),
    accountType: item?.account_type || item?.accountType || '',
    balance: toNumber(item?.balance, 0),
    isActive: Boolean(item?.is_active ?? item?.isActive ?? item?.active),
    details: safeJsonParse(item?.details) || item?.details || {},
    note: item?.note || '',
    createdAt: item?.created_at || item?.createdAt || '',
    updatedAt: item?.updated_at || item?.updatedAt || '',
  }
}

export function normalizeTreasuryAccounts(items) {
  return Array.isArray(items) ? items.map(normalizeTreasuryAccount).filter(Boolean) : []
}

export function normalizeTreasuryTransaction(item) {
  if (!item || typeof item !== 'object') return null

  return {
    publicId: item?.public_id || item?.publicId || '',
    groupPublicId: item?.group_public_id || item?.groupPublicId || '',
    treasuryAccountPublicId:
      item?.treasury_account_public_id || item?.treasuryAccountPublicId || '',
    treasuryAccountCode: item?.treasury_account_code || item?.treasuryAccountCode || '',
    treasuryAccountTitle: item?.treasury_account_title || item?.treasuryAccountTitle || '',
    currencyCode: normalizeCurrencyCode(item?.currency_code || item?.currencyCode),
    amount: toNumber(item?.amount, 0),
    transactionType: item?.transaction_type || item?.transactionType || '',
    operationType: item?.operation_type || item?.operationType || '',
    operationPublicId: item?.operation_public_id || item?.operationPublicId || '',
    externalReference: item?.external_reference || item?.externalReference || '',
    description: item?.description || '',
    operatorComment: item?.operator_comment || item?.operatorComment || '',
    actorUserId: item?.actor_user_id ?? item?.actorUserId ?? null,
    metadata: safeJsonParse(item?.metadata) || item?.metadata || {},
    createdAt: item?.created_at || item?.createdAt || '',
  }
}

export function normalizeTreasuryTransactions(items) {
  return Array.isArray(items) ? items.map(normalizeTreasuryTransaction).filter(Boolean) : []
}

export function normalizePlatformAccount(item) {
  if (!item || typeof item !== 'object') return null

  return {
    publicId: item?.public_id || item?.publicId || '',
    accountCode: item?.account_code || item?.accountCode || '',
    title: item?.title || '',
    currencyCode: normalizeCurrencyCode(item?.currency_code || item?.currencyCode),
    balance: toNumber(item?.balance, 0),
    isActive: Boolean(item?.is_active ?? item?.isActive ?? item?.active),
    note: item?.note || '',
    createdAt: item?.created_at || item?.createdAt || '',
    updatedAt: item?.updated_at || item?.updatedAt || '',
  }
}

export function normalizePlatformAccounts(items) {
  return Array.isArray(items) ? items.map(normalizePlatformAccount).filter(Boolean) : []
}

export function normalizePlatformAccountTransaction(item) {
  if (!item || typeof item !== 'object') return null

  return {
    publicId: item?.public_id || item?.publicId || '',
    groupPublicId: item?.group_public_id || item?.groupPublicId || '',
    platformAccountPublicId:
      item?.platform_account_public_id || item?.platformAccountPublicId || '',
    platformAccountCode: item?.platform_account_code || item?.platformAccountCode || '',
    currencyCode: normalizeCurrencyCode(item?.currency_code || item?.currencyCode),
    amount: toNumber(item?.amount, 0),
    transactionType: item?.transaction_type || item?.transactionType || '',
    refType: item?.ref_type || item?.refType || '',
    refPublicId: item?.ref_public_id || item?.refPublicId || '',
    description: item?.description || '',
    actorUserId: item?.actor_user_id ?? item?.actorUserId ?? null,
    metadata: safeJsonParse(item?.metadata) || item?.metadata || {},
    createdAt: item?.created_at || item?.createdAt || '',
  }
}

export function normalizePlatformAccountTransactions(items) {
  return Array.isArray(items)
    ? items.map(normalizePlatformAccountTransaction).filter(Boolean)
    : []
}

export function normalizeTreasuryExposure(payload) {
  const rows = Array.isArray(payload?.rows) ? payload.rows : []

  return {
    generatedAt: payload?.generatedAt || payload?.generated_at || '',
    rows: rows.map((item) => ({
      currencyCode: normalizeCurrencyCode(item?.currency_code || item?.currencyCode),
      treasuryBalance: toNumber(item?.treasury_balance ?? item?.treasuryBalance, 0),
      userBalance: toNumber(item?.user_balance ?? item?.userBalance, 0),
      userReserved: toNumber(item?.user_reserved ?? item?.userReserved, 0),
      userAvailable: toNumber(item?.user_available ?? item?.userAvailable, 0),
      platformBalance: toNumber(item?.platform_balance ?? item?.platformBalance, 0),
      expectedTreasuryBalance: toNumber(
        item?.expected_treasury_balance ?? item?.expectedTreasuryBalance,
        0
      ),
      difference: toNumber(item?.difference, 0),
    })),
  }
}

export function normalizeDepositPaymentRoute(item) {
  if (!item || typeof item !== 'object') return null

  return {
    publicId: item?.public_id || item?.publicId || '',
    depositMethodId: item?.deposit_method_id ?? item?.depositMethodId ?? null,
    depositMethodTitle: item?.deposit_method_title || item?.depositMethodTitle || '',
    depositCurrencyCode: normalizeCurrencyCode(
      item?.deposit_currency_code || item?.depositCurrencyCode
    ),
    treasuryAccountPublicId:
      item?.treasury_account_public_id || item?.treasuryAccountPublicId || '',
    treasuryAccountCode: item?.treasury_account_code || item?.treasuryAccountCode || '',
    treasuryAccountTitle: item?.treasury_account_title || item?.treasuryAccountTitle || '',
    treasuryCurrencyCode: normalizeCurrencyCode(
      item?.treasury_currency_code || item?.treasuryCurrencyCode
    ),
    title: item?.title || '',
    paymentDetails: item?.payment_details || item?.paymentDetails || {},
    minAmount: item?.min_amount ?? item?.minAmount ?? '',
    maxAmount: item?.max_amount ?? item?.maxAmount ?? '',
    priority: Number.isFinite(Number(item?.priority)) ? Number(item.priority) : 0,
    isActive: Boolean(item?.is_active ?? item?.isActive ?? item?.active),
    note: item?.note || '',
    createdAt: item?.created_at || item?.createdAt || '',
    updatedAt: item?.updated_at || item?.updatedAt || '',
  }
}

export function normalizeDepositPaymentRoutes(items) {
  return Array.isArray(items) ? items.map(normalizeDepositPaymentRoute).filter(Boolean) : []
}

export function normalizeCurrencyConversion(item) {
  if (!item || typeof item !== 'object') return null

  return {
    publicId: item?.public_id || item?.publicId || '',
    fromCurrencyCode: normalizeCurrencyCode(item?.from_currency_code || item?.fromCurrencyCode),
    toCurrencyCode: normalizeCurrencyCode(item?.to_currency_code || item?.toCurrencyCode),
    fromAmount: toNumber(item?.from_amount ?? item?.fromAmount, 0),
    toAmount: toNumber(item?.to_amount ?? item?.toAmount, 0),
    rate: toNumber(item?.rate, 0),
    rateSource: item?.rate_source || item?.rateSource || '',
    status: item?.status || '',
    createdAt: item?.created_at || item?.createdAt || '',
  }
}

function maskMiddle(value, leading = 4, trailing = 4) {
  const text = (value || '').toString().trim()
  if (!text) return ''
  if (text.length <= leading + trailing) return text
  return `${text.slice(0, leading)}...${text.slice(-trailing)}`
}

export function maskPayoutProfile(profile) {
  if (!profile) return ''
  const methodCode = normalizeCurrencyCode(profile.methodCode)
  const requisites = profile.requisites || {}

  if (methodCode === 'SBP') {
    const phone = requisites.phone_number || requisites.phone || ''
    const bankName = requisites.bank_name || requisites.bankName || ''
    const recipient = requisites.recipient_name || requisites.recipientName || ''
    const phoneTail = phone ? phone.toString().trim().slice(-4) : ''
    return [phoneTail ? `•••• ${phoneTail}` : '', bankName, recipient].filter(Boolean).join(' • ')
  }

  if (methodCode === 'ONCHAIN_USDT') {
    const address = requisites.address || ''
    const network = requisites.network || ''
    return [network, maskMiddle(address, 6, 4)].filter(Boolean).join(' • ')
  }

  if (methodCode === 'BINANCE_UID' || methodCode === 'BYBIT_UID') {
    const uid = requisites.uid || ''
    return uid ? `${humanizeCode(methodCode)} • •••• ${uid.toString().trim().slice(-4)}` : humanizeCode(methodCode)
  }

  const values = Object.values(requisites).filter(Boolean)
  return values.length > 0 ? values.map((value) => maskMiddle(String(value), 4, 3)).join(' • ') : ''
}

export function getPageContent(payload) {
  if (Array.isArray(payload)) {
    return {
      content: payload,
      totalPages: 1,
      number: 0,
      totalElements: payload.length,
      size: payload.length,
    }
  }

  return {
    content: Array.isArray(payload?.content) ? payload.content : [],
    totalPages: Number.isFinite(Number(payload?.totalPages)) ? Number(payload.totalPages) : 1,
    number: Number.isFinite(Number(payload?.number)) ? Number(payload.number) : 0,
    totalElements: Number.isFinite(Number(payload?.totalElements))
      ? Number(payload.totalElements)
      : Array.isArray(payload?.content)
        ? payload.content.length
        : 0,
    size: Number.isFinite(Number(payload?.size)) ? Number(payload.size) : 0,
  }
}
