import { useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import Button from '../../shared/ui/Button'
import {
  createDepositPaymentRoute,
  createPlatformAccountAdjustment,
  createTreasuryAccount,
  createTreasuryTransaction,
  createTreasuryTransfer,
  getBackofficeDepositMethods,
  getDepositPaymentRoutes,
  getPlatformAccounts,
  getPlatformAccountTransactions,
  getTreasuryAccounts,
  getTreasuryExposure,
  getTreasuryTransactions,
  updateDepositPaymentRoute,
} from '../../api/treasury'
import { useI18n } from '../../app/i18n'
import { getErrorMessage } from '../../shared/lib/errors'
import {
  formatMoneyAmount,
  formatMoneyDateTime,
  getAmountTone,
  getPageContent,
  humanizeCode,
  normalizeDepositPaymentRoutes,
  normalizePlatformAccounts,
  normalizePlatformAccountTransactions,
  normalizeTreasuryAccounts,
  normalizeTreasuryExposure,
  normalizeTreasuryTransactions,
  normalizeDetailsList,
} from '../../shared/lib/money'
import { useUser } from '../../app/user'
import { MoneyPageHeader, MoneyStateCard } from '../money/MoneyUI'
import { canViewTreasury, getDefaultBackofficePath } from './backofficeAccess'

const ACCOUNT_TYPES = [
  'BANK_CARD',
  'BANK_ACCOUNT',
  'CRYPTO_WALLET',
  'EXCHANGE_ACCOUNT',
  'P2P_DROP',
  'CASH',
  'OTHER',
]

const MANUAL_TYPES = ['MANUAL_IN', 'MANUAL_OUT', 'ADJUSTMENT']
const PLATFORM_TRANSACTION_TYPES = ['MANUAL', 'ADJUSTMENT', 'FEE', 'FX_IN', 'FX_OUT', 'ROUNDING']

const emptyAccountForm = {
  code: '',
  title: '',
  currencyCode: 'RUB',
  accountType: 'BANK_CARD',
  note: '',
}

const emptyManualForm = {
  accountPublicId: '',
  transactionType: 'MANUAL_IN',
  amount: '',
  externalReference: '',
  description: '',
  operatorComment: '',
}

const emptyTransferForm = {
  fromAccountPublicId: '',
  toAccountPublicId: '',
  fromAmount: '',
  toAmount: '',
  externalReference: '',
  description: '',
}

const emptyPlatformAdjustmentForm = {
  platformAccountPublicId: '',
  transactionType: 'MANUAL',
  amount: '',
  description: '',
}

const emptyRouteForm = {
  depositMethodId: '',
  treasuryAccountPublicId: '',
  title: '',
  paymentDetails: '{\n  "bank": "",\n  "recipient": "",\n  "account": ""\n}',
  minAmount: '',
  maxAmount: '',
  priority: '100',
  isActive: true,
  note: '',
}

function accountLabel(account) {
  if (!account) return ''
  return `${account.code || account.title} - ${account.title || account.code} (${account.currencyCode})`
}

function normalizeAmountInput(value) {
  return String(value || '').trim().replace(',', '.')
}

function parseJsonObject(value) {
  const trimmed = String(value || '').trim()
  if (!trimmed) return {}
  const parsed = JSON.parse(trimmed)
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('JSON must be an object.')
  }
  return parsed
}

export default function TreasuryPage() {
  const { language } = useI18n()
  const { permissions, status: userStatus } = useUser()
  const allowed = canViewTreasury(permissions)
  const fallbackPath = getDefaultBackofficePath(permissions)
  const [accounts, setAccounts] = useState([])
  const [transactions, setTransactions] = useState([])
  const [exposure, setExposure] = useState({ generatedAt: '', rows: [] })
  const [platformAccounts, setPlatformAccounts] = useState([])
  const [platformTransactions, setPlatformTransactions] = useState([])
  const [depositMethods, setDepositMethods] = useState([])
  const [depositRoutes, setDepositRoutes] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [actionError, setActionError] = useState('')
  const [actionStatus, setActionStatus] = useState('idle')
  const [reloadKey, setReloadKey] = useState(0)
  const [accountForm, setAccountForm] = useState(emptyAccountForm)
  const [manualForm, setManualForm] = useState(emptyManualForm)
  const [transferForm, setTransferForm] = useState(emptyTransferForm)
  const [platformAdjustmentForm, setPlatformAdjustmentForm] = useState(emptyPlatformAdjustmentForm)
  const [routeForm, setRouteForm] = useState(emptyRouteForm)

  useEffect(() => {
    let active = true

    async function loadTreasury() {
      setStatus('loading')
      setError('')

      try {
        const [
          accountsResponse,
          transactionsResponse,
          exposureResponse,
          platformAccountsResponse,
          platformTransactionsResponse,
          depositMethodsResponse,
          depositRoutesResponse,
        ] = await Promise.all([
          getTreasuryAccounts(),
          getTreasuryTransactions({ page: 0, size: 20, sort: 'createdAt,desc' }),
          getTreasuryExposure(),
          getPlatformAccounts(),
          getPlatformAccountTransactions({ page: 0, size: 20, sort: 'createdAt,desc' }),
          getBackofficeDepositMethods(),
          getDepositPaymentRoutes({ activeOnly: false }),
        ])
        if (!active) return
        setAccounts(normalizeTreasuryAccounts(accountsResponse?.data))
        setTransactions(
          normalizeTreasuryTransactions(getPageContent(transactionsResponse?.data).content)
        )
        setExposure(normalizeTreasuryExposure(exposureResponse?.data))
        setPlatformAccounts(normalizePlatformAccounts(platformAccountsResponse?.data))
        setPlatformTransactions(
          normalizePlatformAccountTransactions(
            getPageContent(platformTransactionsResponse?.data).content
          )
        )
        setDepositMethods(Array.isArray(depositMethodsResponse?.data) ? depositMethodsResponse.data : [])
        setDepositRoutes(normalizeDepositPaymentRoutes(depositRoutesResponse?.data))
        setStatus('ready')
      } catch (loadError) {
        if (!active) return
        setError(getErrorMessage(loadError, 'Failed to load Treasury'))
        setStatus('error')
      }
    }

    if (allowed) {
      loadTreasury()
    }

    return () => {
      active = false
    }
  }, [allowed, reloadKey])

  const totals = useMemo(() => {
    const byCurrency = new Map()
    accounts.forEach((account) => {
      const current = byCurrency.get(account.currencyCode) || 0
      byCurrency.set(account.currencyCode, current + Number(account.balance || 0))
    })
    return Array.from(byCurrency.entries()).sort(([left], [right]) => left.localeCompare(right))
  }, [accounts])

  const defaultAccountPublicId = accounts[0]?.publicId || ''
  const defaultPlatformAccountPublicId = platformAccounts[0]?.publicId || ''

  useEffect(() => {
    if (!defaultAccountPublicId) return
    setManualForm((value) => ({
      ...value,
      accountPublicId: value.accountPublicId || defaultAccountPublicId,
    }))
    setTransferForm((value) => ({
      ...value,
      fromAccountPublicId: value.fromAccountPublicId || defaultAccountPublicId,
      toAccountPublicId:
        value.toAccountPublicId ||
        accounts.find((account) => account.publicId !== defaultAccountPublicId)?.publicId ||
        '',
    }))
  }, [accounts, defaultAccountPublicId])

  useEffect(() => {
    if (!defaultPlatformAccountPublicId) return
    setPlatformAdjustmentForm((value) => ({
      ...value,
      platformAccountPublicId: value.platformAccountPublicId || defaultPlatformAccountPublicId,
    }))
  }, [defaultPlatformAccountPublicId])

  useEffect(() => {
    if (depositMethods.length === 0 && accounts.length === 0) return
    setRouteForm((value) => ({
      ...value,
      depositMethodId: value.depositMethodId || String(depositMethods[0]?.id || ''),
      treasuryAccountPublicId: value.treasuryAccountPublicId || accounts[0]?.publicId || '',
    }))
  }, [accounts, depositMethods])

  const reload = () => setReloadKey((value) => value + 1)

  const handleCreateAccount = async (event) => {
    event.preventDefault()
    if (actionStatus !== 'idle') return

    setActionStatus('account')
    setActionError('')
    setNotice('')

    try {
      await createTreasuryAccount({
        code: accountForm.code.trim(),
        title: accountForm.title.trim(),
        currency_code: accountForm.currencyCode.trim().toUpperCase(),
        account_type: accountForm.accountType,
        note: accountForm.note.trim() || null,
      })
      setAccountForm(emptyAccountForm)
      setNotice('Treasury account created.')
      reload()
    } catch (submitError) {
      setActionError(getErrorMessage(submitError, 'Failed to create Treasury account'))
    } finally {
      setActionStatus('idle')
    }
  }

  const handleCreateManualTransaction = async (event) => {
    event.preventDefault()
    if (actionStatus !== 'idle') return

    setActionStatus('manual')
    setActionError('')
    setNotice('')

    try {
      await createTreasuryTransaction({
        treasury_account_public_id: manualForm.accountPublicId,
        transaction_type: manualForm.transactionType,
        amount: normalizeAmountInput(manualForm.amount),
        external_reference: manualForm.externalReference.trim() || null,
        description: manualForm.description.trim() || null,
        operator_comment: manualForm.operatorComment.trim() || null,
      })
      setManualForm((value) => ({ ...emptyManualForm, accountPublicId: value.accountPublicId }))
      setNotice('Treasury transaction recorded.')
      reload()
    } catch (submitError) {
      setActionError(getErrorMessage(submitError, 'Failed to record Treasury transaction'))
    } finally {
      setActionStatus('idle')
    }
  }

  const handleCreateTransfer = async (event) => {
    event.preventDefault()
    if (actionStatus !== 'idle') return

    setActionStatus('transfer')
    setActionError('')
    setNotice('')

    try {
      await createTreasuryTransfer({
        from_account_public_id: transferForm.fromAccountPublicId,
        to_account_public_id: transferForm.toAccountPublicId,
        from_amount: normalizeAmountInput(transferForm.fromAmount),
        to_amount: normalizeAmountInput(transferForm.toAmount),
        external_reference: transferForm.externalReference.trim() || null,
        description: transferForm.description.trim() || null,
      })
      setTransferForm((value) => ({
        ...emptyTransferForm,
        fromAccountPublicId: value.fromAccountPublicId,
        toAccountPublicId: value.toAccountPublicId,
      }))
      setNotice('Treasury transfer recorded.')
      reload()
    } catch (submitError) {
      setActionError(getErrorMessage(submitError, 'Failed to record Treasury transfer'))
    } finally {
      setActionStatus('idle')
    }
  }

  const handleCreatePlatformAdjustment = async (event) => {
    event.preventDefault()
    if (actionStatus !== 'idle') return

    setActionStatus('platform')
    setActionError('')
    setNotice('')

    try {
      await createPlatformAccountAdjustment({
        platform_account_public_id: platformAdjustmentForm.platformAccountPublicId,
        transaction_type: platformAdjustmentForm.transactionType,
        amount: normalizeAmountInput(platformAdjustmentForm.amount),
        description: platformAdjustmentForm.description.trim() || null,
      })
      setPlatformAdjustmentForm((value) => ({
        ...emptyPlatformAdjustmentForm,
        platformAccountPublicId: value.platformAccountPublicId,
      }))
      setNotice('Platform account transaction recorded.')
      reload()
    } catch (submitError) {
      setActionError(getErrorMessage(submitError, 'Failed to record platform account transaction'))
    } finally {
      setActionStatus('idle')
    }
  }

  const handleCreateRoute = async (event) => {
    event.preventDefault()
    if (actionStatus !== 'idle') return

    setActionStatus('route')
    setActionError('')
    setNotice('')

    try {
      await createDepositPaymentRoute({
        deposit_method_id: Number(routeForm.depositMethodId),
        treasury_account_public_id: routeForm.treasuryAccountPublicId,
        title: routeForm.title.trim(),
        payment_details: parseJsonObject(routeForm.paymentDetails),
        min_amount: normalizeAmountInput(routeForm.minAmount) || null,
        max_amount: normalizeAmountInput(routeForm.maxAmount) || null,
        priority: Number(routeForm.priority || 0),
        is_active: Boolean(routeForm.isActive),
        note: routeForm.note.trim() || null,
      })
      setRouteForm((value) => ({
        ...emptyRouteForm,
        depositMethodId: value.depositMethodId,
        treasuryAccountPublicId: value.treasuryAccountPublicId,
      }))
      setNotice('Deposit payment route created.')
      reload()
    } catch (submitError) {
      setActionError(getErrorMessage(submitError, 'Failed to create deposit payment route'))
    } finally {
      setActionStatus('idle')
    }
  }

  const handleToggleRoute = async (route) => {
    if (!route?.publicId || actionStatus !== 'idle') return

    setActionStatus(`route-${route.publicId}`)
    setActionError('')
    setNotice('')

    try {
      await updateDepositPaymentRoute(route.publicId, {
        is_active: !route.isActive,
      })
      setNotice('Deposit payment route updated.')
      reload()
    } catch (submitError) {
      setActionError(getErrorMessage(submitError, 'Failed to update deposit payment route'))
    } finally {
      setActionStatus('idle')
    }
  }

  if (userStatus === 'ready' && !allowed) {
    if (fallbackPath && fallbackPath !== '/backoffice/treasury') {
      return <Navigate to={fallbackPath} replace />
    }
    return (
      <div className="account-page money-page">
        <MoneyStateCard
          tone="danger"
          title="No Treasury access"
          text="Treasury requires TREASURY_VIEW permission."
        />
      </div>
    )
  }

  return (
    <div className="account-page money-page">
      <MoneyPageHeader
        eyebrow="Backoffice"
        title="Treasury"
        subtitle="Operator accounts, actual balances, manual corrections and P2P/conversion movements."
        actions={
          <button type="button" className="btn btn--secondary" onClick={reload}>
            Refresh
          </button>
        }
      />

      {status === 'loading' ? <MoneyStateCard title="Loading Treasury" text="Fetching accounts and transactions." /> : null}
      {status === 'error' ? <MoneyStateCard tone="danger" title="Treasury unavailable" text={error} /> : null}
      {notice ? <div className="card backoffice-flash backoffice-flash--success">{notice}</div> : null}
      {actionError ? <div className="card backoffice-flash backoffice-flash--danger">{actionError}</div> : null}

      {status === 'ready' ? (
        <>
          <div className="money-overview-grid">
            <div className="card money-metric-card">
              <div className="money-metric-card__label">Accounts</div>
              <div className="money-metric-card__value">{accounts.length}</div>
              <div className="money-metric-card__helper">Active and inactive operator balances</div>
            </div>
            {totals.slice(0, 2).map(([currencyCode, total]) => (
              <div className="card money-metric-card" key={currencyCode}>
                <div className="money-metric-card__label">{currencyCode} total</div>
                <div className="money-metric-card__value">
                  {formatMoneyAmount(total, { language })}{' '}
                  <span className="money-metric-card__amount">{currencyCode}</span>
                </div>
                <div className="money-metric-card__helper">Across Treasury accounts</div>
              </div>
            ))}
          </div>

          <div className="card money-section-card">
            <div className="money-section-card__head">
              <div>
                <div className="money-section-card__title">Treasury vs liabilities</div>
                <div className="money-section-card__subtitle">
                  Generated {formatMoneyDateTime(exposure.generatedAt, { language })}
                </div>
              </div>
            </div>

            <div className="money-transaction-preview">
              {exposure.rows.length === 0 ? <div className="muted">No exposure rows yet.</div> : null}
              {exposure.rows.map((row) => (
                <div className="money-transaction-preview__row" key={row.currencyCode}>
                  <div className="money-transaction-preview__meta">
                    <div className="money-transaction-preview__type">{row.currencyCode}</div>
                    <div className="money-transaction-preview__description">
                      Treasury {formatMoneyAmount(row.treasuryBalance, { language })} / expected{' '}
                      {formatMoneyAmount(row.expectedTreasuryBalance, { language })}
                    </div>
                    <div className="money-transaction-preview__date">
                      Users {formatMoneyAmount(row.userBalance, { language })}, platform{' '}
                      {formatMoneyAmount(row.platformBalance, { language })}
                    </div>
                  </div>
                  <div className={`money-amount money-amount--${getAmountTone(row.difference)}`}>
                    {formatMoneyAmount(row.difference, { language })} {row.currencyCode}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="money-two-column">
            <div className="card money-section-card">
              <div className="money-section-card__head">
                <div>
                  <div className="money-section-card__title">Treasury accounts</div>
                  <div className="money-section-card__subtitle">
                    Real operator accounts used for deposits, payouts and P2P.
                  </div>
                </div>
              </div>

              <div className="money-transaction-preview">
                {accounts.length === 0 ? <div className="muted">No accounts yet.</div> : null}
                {accounts.map((account) => (
                  <div className="money-transaction-preview__row" key={account.publicId}>
                    <div className="money-transaction-preview__meta">
                      <div className="money-transaction-preview__type">{accountLabel(account)}</div>
                      <div className="money-transaction-preview__description">
                        {humanizeCode(account.accountType)} {account.isActive ? 'active' : 'inactive'}
                      </div>
                    </div>
                    <div className={`money-amount money-amount--${getAmountTone(account.balance)}`}>
                      {formatMoneyAmount(account.balance, { language })} {account.currencyCode}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <form className="card money-section-card" onSubmit={handleCreateAccount}>
              <div className="money-section-card__head">
                <div>
                  <div className="money-section-card__title">Create account</div>
                  <div className="money-section-card__subtitle">
                    Add bank card, exchange account, cash box or P2P drop.
                  </div>
                </div>
              </div>

              <div className="money-form-grid">
                <label className="field">
                  <span className="field__label">Code</span>
                  <input
                    className="input"
                    value={accountForm.code}
                    placeholder="TBANK-RUB-MAIN"
                    onChange={(event) => setAccountForm((value) => ({ ...value, code: event.target.value }))}
                    required
                  />
                </label>
                <label className="field">
                  <span className="field__label">Title</span>
                  <input
                    className="input"
                    value={accountForm.title}
                    placeholder="T-Bank RUB main"
                    onChange={(event) => setAccountForm((value) => ({ ...value, title: event.target.value }))}
                    required
                  />
                </label>
                <label className="field">
                  <span className="field__label">Currency</span>
                  <input
                    className="input"
                    value={accountForm.currencyCode}
                    placeholder="RUB"
                    onChange={(event) =>
                      setAccountForm((value) => ({ ...value, currencyCode: event.target.value }))
                    }
                    required
                  />
                </label>
                <label className="field">
                  <span className="field__label">Type</span>
                  <select
                    className="input"
                    value={accountForm.accountType}
                    onChange={(event) =>
                      setAccountForm((value) => ({ ...value, accountType: event.target.value }))
                    }
                  >
                    {ACCOUNT_TYPES.map((type) => (
                      <option value={type} key={type}>
                        {humanizeCode(type)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="field">
                <span className="field__label">Note</span>
                <textarea
                  className="input backoffice-action-card__textarea"
                  rows={3}
                  value={accountForm.note}
                  placeholder="Internal account note"
                  onChange={(event) => setAccountForm((value) => ({ ...value, note: event.target.value }))}
                />
              </label>

              <div className="money-form-actions">
                <Button type="submit" disabled={actionStatus !== 'idle'}>
                  Create account
                </Button>
              </div>
            </form>
          </div>

          <div className="money-two-column">
            <div className="card money-section-card">
              <div className="money-section-card__head">
                <div>
                  <div className="money-section-card__title">Platform accounts</div>
                  <div className="money-section-card__subtitle">
                    Internal balances for fees, FX desk, rounding and adjustments.
                  </div>
                </div>
              </div>

              <div className="money-transaction-preview">
                {platformAccounts.length === 0 ? <div className="muted">No platform accounts yet.</div> : null}
                {platformAccounts.map((account) => (
                  <div className="money-transaction-preview__row" key={account.publicId}>
                    <div className="money-transaction-preview__meta">
                      <div className="money-transaction-preview__type">
                        {humanizeCode(account.accountCode)} - {account.title}
                      </div>
                      <div className="money-transaction-preview__description">
                        {account.isActive ? 'active' : 'inactive'} {account.note || ''}
                      </div>
                    </div>
                    <div className={`money-amount money-amount--${getAmountTone(account.balance)}`}>
                      {formatMoneyAmount(account.balance, { language })} {account.currencyCode}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <form className="card money-section-card" onSubmit={handleCreatePlatformAdjustment}>
              <div className="money-section-card__head">
                <div>
                  <div className="money-section-card__title">Platform adjustment</div>
                  <div className="money-section-card__subtitle">
                    Manual internal ledger movement for platform-owned money.
                  </div>
                </div>
              </div>

              <div className="money-form-grid">
                <label className="field">
                  <span className="field__label">Account</span>
                  <select
                    className="input"
                    value={platformAdjustmentForm.platformAccountPublicId}
                    onChange={(event) =>
                      setPlatformAdjustmentForm((value) => ({
                        ...value,
                        platformAccountPublicId: event.target.value,
                      }))
                    }
                    required
                  >
                    <option value="">Select account</option>
                    {platformAccounts.map((account) => (
                      <option value={account.publicId} key={account.publicId}>
                        {humanizeCode(account.accountCode)} - {account.title} ({account.currencyCode})
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span className="field__label">Type</span>
                  <select
                    className="input"
                    value={platformAdjustmentForm.transactionType}
                    onChange={(event) =>
                      setPlatformAdjustmentForm((value) => ({
                        ...value,
                        transactionType: event.target.value,
                      }))
                    }
                  >
                    {PLATFORM_TRANSACTION_TYPES.map((type) => (
                      <option value={type} key={type}>
                        {humanizeCode(type)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span className="field__label">Amount</span>
                  <input
                    className="input"
                    value={platformAdjustmentForm.amount}
                    placeholder="-10.0000"
                    onChange={(event) =>
                      setPlatformAdjustmentForm((value) => ({ ...value, amount: event.target.value }))
                    }
                    required
                  />
                </label>
              </div>

              <label className="field">
                <span className="field__label">Description</span>
                <textarea
                  className="input backoffice-action-card__textarea"
                  rows={3}
                  value={platformAdjustmentForm.description}
                  placeholder="Fee correction, FX desk position, rounding cleanup"
                  onChange={(event) =>
                    setPlatformAdjustmentForm((value) => ({ ...value, description: event.target.value }))
                  }
                />
              </label>

              <div className="money-form-actions">
                <Button type="submit" disabled={actionStatus !== 'idle' || platformAccounts.length === 0}>
                  Record platform movement
                </Button>
              </div>
            </form>
          </div>

          <div className="money-two-column">
            <form className="card money-section-card" onSubmit={handleCreateManualTransaction}>
              <div className="money-section-card__head">
                <div>
                  <div className="money-section-card__title">Manual transaction</div>
                  <div className="money-section-card__subtitle">
                    Opening balance, correction, fee or cash movement not tied to a request.
                  </div>
                </div>
              </div>

              <div className="money-form-grid">
                <label className="field">
                  <span className="field__label">Account</span>
                  <select
                    className="input"
                    value={manualForm.accountPublicId}
                    onChange={(event) =>
                      setManualForm((value) => ({ ...value, accountPublicId: event.target.value }))
                    }
                    required
                  >
                    <option value="">Select account</option>
                    {accounts.map((account) => (
                      <option value={account.publicId} key={account.publicId}>
                        {accountLabel(account)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span className="field__label">Type</span>
                  <select
                    className="input"
                    value={manualForm.transactionType}
                    onChange={(event) =>
                      setManualForm((value) => ({ ...value, transactionType: event.target.value }))
                    }
                  >
                    {MANUAL_TYPES.map((type) => (
                      <option value={type} key={type}>
                        {humanizeCode(type)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span className="field__label">Amount</span>
                  <input
                    className="input"
                    value={manualForm.amount}
                    placeholder="1000.0000"
                    onChange={(event) => setManualForm((value) => ({ ...value, amount: event.target.value }))}
                    required
                  />
                </label>
                <label className="field">
                  <span className="field__label">Reference</span>
                  <input
                    className="input"
                    value={manualForm.externalReference}
                    placeholder="Statement line, tx hash, P2P order"
                    onChange={(event) =>
                      setManualForm((value) => ({ ...value, externalReference: event.target.value }))
                    }
                  />
                </label>
              </div>

              <label className="field">
                <span className="field__label">Description</span>
                <textarea
                  className="input backoffice-action-card__textarea"
                  rows={3}
                  value={manualForm.description}
                  placeholder="Why this movement exists"
                  onChange={(event) =>
                    setManualForm((value) => ({ ...value, description: event.target.value }))
                  }
                />
              </label>

              <div className="money-form-actions">
                <Button type="submit" disabled={actionStatus !== 'idle' || accounts.length === 0}>
                  Record transaction
                </Button>
              </div>
            </form>

            <form className="card money-section-card" onSubmit={handleCreateTransfer}>
              <div className="money-section-card__head">
                <div>
                  <div className="money-section-card__title">Transfer / conversion</div>
                  <div className="money-section-card__subtitle">
                    Move money between accounts, including cross-currency P2P conversion.
                  </div>
                </div>
              </div>

              <div className="money-form-grid">
                <label className="field">
                  <span className="field__label">From account</span>
                  <select
                    className="input"
                    value={transferForm.fromAccountPublicId}
                    onChange={(event) =>
                      setTransferForm((value) => ({ ...value, fromAccountPublicId: event.target.value }))
                    }
                    required
                  >
                    <option value="">Select source</option>
                    {accounts.map((account) => (
                      <option value={account.publicId} key={account.publicId}>
                        {accountLabel(account)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span className="field__label">To account</span>
                  <select
                    className="input"
                    value={transferForm.toAccountPublicId}
                    onChange={(event) =>
                      setTransferForm((value) => ({ ...value, toAccountPublicId: event.target.value }))
                    }
                    required
                  >
                    <option value="">Select destination</option>
                    {accounts.map((account) => (
                      <option value={account.publicId} key={account.publicId}>
                        {accountLabel(account)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span className="field__label">From amount</span>
                  <input
                    className="input"
                    value={transferForm.fromAmount}
                    placeholder="2600.0000"
                    onChange={(event) =>
                      setTransferForm((value) => ({ ...value, fromAmount: event.target.value }))
                    }
                    required
                  />
                </label>
                <label className="field">
                  <span className="field__label">To amount</span>
                  <input
                    className="input"
                    value={transferForm.toAmount}
                    placeholder="33.6400"
                    onChange={(event) =>
                      setTransferForm((value) => ({ ...value, toAmount: event.target.value }))
                    }
                    required
                  />
                </label>
              </div>

              <label className="field">
                <span className="field__label">Reference</span>
                <input
                  className="input"
                  value={transferForm.externalReference}
                  placeholder="P2P order, exchange tx, internal note"
                  onChange={(event) =>
                    setTransferForm((value) => ({ ...value, externalReference: event.target.value }))
                  }
                />
              </label>

              <div className="money-form-actions">
                <Button type="submit" disabled={actionStatus !== 'idle' || accounts.length < 2}>
                  Record transfer
                </Button>
              </div>
            </form>
          </div>

          <div className="money-two-column">
            <div className="card money-section-card">
              <div className="money-section-card__head">
                <div>
                  <div className="money-section-card__title">Deposit payment routes</div>
                  <div className="money-section-card__subtitle">
                    Method-to-Treasury links used for payment instruction snapshots.
                  </div>
                </div>
              </div>

              <div className="money-transaction-preview">
                {depositRoutes.length === 0 ? <div className="muted">No routes yet.</div> : null}
                {depositRoutes.map((route) => {
                  const routeDetails = normalizeDetailsList(route.paymentDetails)
                  return (
                    <div className="money-transaction-preview__row" key={route.publicId}>
                      <div className="money-transaction-preview__meta">
                        <div className="money-transaction-preview__type">
                          {route.title} - {route.depositMethodTitle}
                        </div>
                        <div className="money-transaction-preview__description">
                          {route.depositCurrencyCode} to {route.treasuryAccountCode} ({route.treasuryCurrencyCode})
                        </div>
                        <div className="money-transaction-preview__date">
                          {routeDetails.slice(0, 2).map((item) => `${item.key}: ${item.value}`).join(' / ')}
                        </div>
                      </div>
                      <div className="wallet-card__actions">
                        <span className={`status-chip status-chip--${route.isActive ? 'success' : 'muted'}`}>
                          {route.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <button
                          type="button"
                          className="money-inline-button"
                          onClick={() => handleToggleRoute(route)}
                          disabled={actionStatus !== 'idle'}
                        >
                          {route.isActive ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <form className="card money-section-card" onSubmit={handleCreateRoute}>
              <div className="money-section-card__head">
                <div>
                  <div className="money-section-card__title">Create payment route</div>
                  <div className="money-section-card__subtitle">
                    Bind deposit method details to a real Treasury account.
                  </div>
                </div>
              </div>

              <div className="money-form-grid">
                <label className="field">
                  <span className="field__label">Deposit method</span>
                  <select
                    className="input"
                    value={routeForm.depositMethodId}
                    onChange={(event) =>
                      setRouteForm((value) => ({ ...value, depositMethodId: event.target.value }))
                    }
                    required
                  >
                    <option value="">Select method</option>
                    {depositMethods.map((method) => (
                      <option value={method.id} key={method.id}>
                        {method.title} ({method.currency_code || method.currencyCode})
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span className="field__label">Treasury account</span>
                  <select
                    className="input"
                    value={routeForm.treasuryAccountPublicId}
                    onChange={(event) =>
                      setRouteForm((value) => ({
                        ...value,
                        treasuryAccountPublicId: event.target.value,
                      }))
                    }
                    required
                  >
                    <option value="">Select account</option>
                    {accounts.map((account) => (
                      <option value={account.publicId} key={account.publicId}>
                        {accountLabel(account)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span className="field__label">Title</span>
                  <input
                    className="input"
                    value={routeForm.title}
                    placeholder="T-Bank SBP main"
                    onChange={(event) => setRouteForm((value) => ({ ...value, title: event.target.value }))}
                    required
                  />
                </label>
                <label className="field">
                  <span className="field__label">Priority</span>
                  <input
                    className="input"
                    type="number"
                    value={routeForm.priority}
                    onChange={(event) => setRouteForm((value) => ({ ...value, priority: event.target.value }))}
                  />
                </label>
              </div>

              <div className="money-form-grid">
                <label className="field">
                  <span className="field__label">Min amount</span>
                  <input
                    className="input"
                    value={routeForm.minAmount}
                    placeholder="100"
                    onChange={(event) => setRouteForm((value) => ({ ...value, minAmount: event.target.value }))}
                  />
                </label>
                <label className="field">
                  <span className="field__label">Max amount</span>
                  <input
                    className="input"
                    value={routeForm.maxAmount}
                    placeholder="50000"
                    onChange={(event) => setRouteForm((value) => ({ ...value, maxAmount: event.target.value }))}
                  />
                </label>
              </div>

              <label className="field">
                <span className="field__label">Payment details JSON</span>
                <textarea
                  className="input backoffice-action-card__textarea"
                  rows={6}
                  value={routeForm.paymentDetails}
                  onChange={(event) =>
                    setRouteForm((value) => ({ ...value, paymentDetails: event.target.value }))
                  }
                />
              </label>

              <label className="field">
                <span className="field__label">Note</span>
                <textarea
                  className="input backoffice-action-card__textarea"
                  rows={2}
                  value={routeForm.note}
                  onChange={(event) => setRouteForm((value) => ({ ...value, note: event.target.value }))}
                />
              </label>

              <label className="money-checkbox">
                <input
                  type="checkbox"
                  checked={routeForm.isActive}
                  onChange={(event) =>
                    setRouteForm((value) => ({ ...value, isActive: event.target.checked }))
                  }
                />
                <span>Active</span>
              </label>

              <div className="money-form-actions">
                <Button
                  type="submit"
                  disabled={actionStatus !== 'idle' || accounts.length === 0 || depositMethods.length === 0}
                >
                  Create route
                </Button>
              </div>
            </form>
          </div>

          <div className="card money-section-card">
            <div className="money-section-card__head">
              <div>
                <div className="money-section-card__title">Recent platform account transactions</div>
                <div className="money-section-card__subtitle">
                  Internal platform-owned ledger movements.
                </div>
              </div>
            </div>

            <div className="money-transaction-preview">
              {platformTransactions.length === 0 ? <div className="muted">No platform transactions yet.</div> : null}
              {platformTransactions.map((transaction) => (
                <div className="money-transaction-preview__row" key={transaction.publicId}>
                  <div className="money-transaction-preview__meta">
                    <div className="money-transaction-preview__type">
                      {humanizeCode(transaction.transactionType)} - {humanizeCode(transaction.platformAccountCode)}
                    </div>
                    <div className="money-transaction-preview__date">
                      {formatMoneyDateTime(transaction.createdAt, { language })}
                    </div>
                    <div className="money-transaction-preview__description">
                      {transaction.description || transaction.refPublicId || transaction.publicId}
                    </div>
                  </div>
                  <div className={`money-amount money-amount--${getAmountTone(transaction.amount)}`}>
                    {formatMoneyAmount(transaction.amount, { language })} {transaction.currencyCode}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card money-section-card">
            <div className="money-section-card__head">
              <div>
                <div className="money-section-card__title">Recent Treasury transactions</div>
                <div className="money-section-card__subtitle">
                  Signed immutable movements. Positive means incoming to account.
                </div>
              </div>
            </div>

            <div className="money-transaction-preview">
              {transactions.length === 0 ? <div className="muted">No transactions yet.</div> : null}
              {transactions.map((transaction) => (
                <div className="money-transaction-preview__row" key={transaction.publicId}>
                  <div className="money-transaction-preview__meta">
                    <div className="money-transaction-preview__type">
                      {humanizeCode(transaction.transactionType)} - {transaction.treasuryAccountCode}
                    </div>
                    <div className="money-transaction-preview__date">
                      {formatMoneyDateTime(transaction.createdAt, { language })}
                    </div>
                    <div className="money-transaction-preview__description">
                      {transaction.description || transaction.externalReference || transaction.operationPublicId || transaction.publicId}
                    </div>
                  </div>
                  <div className={`money-amount money-amount--${getAmountTone(transaction.amount)}`}>
                    {formatMoneyAmount(transaction.amount, { language })} {transaction.currencyCode}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
