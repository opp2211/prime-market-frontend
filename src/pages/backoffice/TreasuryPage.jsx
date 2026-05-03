import { useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import Button from '../../shared/ui/Button'
import {
  createTreasuryAccount,
  createTreasuryTransaction,
  createTreasuryTransfer,
  getTreasuryAccounts,
  getTreasuryTransactions,
} from '../../api/treasury'
import { useI18n } from '../../app/i18n'
import { getErrorMessage } from '../../shared/lib/errors'
import {
  formatMoneyAmount,
  formatMoneyDateTime,
  getAmountTone,
  getPageContent,
  humanizeCode,
  normalizeTreasuryAccounts,
  normalizeTreasuryTransactions,
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

function accountLabel(account) {
  if (!account) return ''
  return `${account.code || account.title} - ${account.title || account.code} (${account.currencyCode})`
}

function normalizeAmountInput(value) {
  return String(value || '').trim().replace(',', '.')
}

export default function TreasuryPage() {
  const { language } = useI18n()
  const { permissions, status: userStatus } = useUser()
  const allowed = canViewTreasury(permissions)
  const fallbackPath = getDefaultBackofficePath(permissions)
  const [accounts, setAccounts] = useState([])
  const [transactions, setTransactions] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [actionError, setActionError] = useState('')
  const [actionStatus, setActionStatus] = useState('idle')
  const [reloadKey, setReloadKey] = useState(0)
  const [accountForm, setAccountForm] = useState(emptyAccountForm)
  const [manualForm, setManualForm] = useState(emptyManualForm)
  const [transferForm, setTransferForm] = useState(emptyTransferForm)

  useEffect(() => {
    let active = true

    async function loadTreasury() {
      setStatus('loading')
      setError('')

      try {
        const [accountsResponse, transactionsResponse] = await Promise.all([
          getTreasuryAccounts(),
          getTreasuryTransactions({ page: 0, size: 20, sort: 'createdAt,desc' }),
        ])
        if (!active) return
        setAccounts(normalizeTreasuryAccounts(accountsResponse?.data))
        setTransactions(
          normalizeTreasuryTransactions(getPageContent(transactionsResponse?.data).content)
        )
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
