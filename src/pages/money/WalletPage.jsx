import { useEffect, useMemo, useState } from 'react'
import Button from '../../shared/ui/Button'
import { useI18n } from '../../app/i18n'
import {
  getMyWalletTransactions,
  getMyWalletWorkSummary,
  getMyWallets,
} from '../../api/wallets'
import { getMe, updateMyPrimaryCurrency } from '../../api/users'
import { useDisplayCurrency, setDisplayCurrency } from '../../app/displayCurrency'
import { getErrorMessage } from '../../shared/lib/errors'
import { readLocalStorage, writeLocalStorage } from '../../shared/lib/storage'
import {
  formatMoneyDateTime,
  getPageContent,
  hasWalletValue,
  humanizeCode,
  normalizeTransaction,
  normalizeWalletEntries,
  normalizeWalletWorkSummary,
} from '../../shared/lib/money'
import { MoneyStateCard } from './MoneyUI'
import { getMoneyCopy } from './moneyCopy'
import { WalletExperience } from './WalletLabPage'

const WALLET_SHOW_ZERO_BALANCES_KEY = 'pm_wallet_show_zero_balances'
const UNEXPECTED_ERROR_MESSAGE = 'Unexpected error'

function readShowZeroBalancesPreference() {
  return readLocalStorage(WALLET_SHOW_ZERO_BALANCES_KEY) === 'true'
}

function normalizeCurrencyCode(value) {
  return (value || '').toString().trim().toUpperCase()
}

function getUserPrimaryCurrencyCode(profile) {
  return normalizeCurrencyCode(profile?.primary_currency_code || profile?.primaryCurrencyCode)
}

function getFriendlyWorkError(error, fallback) {
  const message = getErrorMessage(error, fallback)
  return message === UNEXPECTED_ERROR_MESSAGE ? fallback : message
}

function resolveTransactionTitle(item, copy) {
  return item.label || item.description || humanizeCode(item.type) || copy.transactions.typeUnknown
}

function resolveTransactionTarget(item, copy) {
  if (item.label && item.description && item.label !== item.description) return item.description
  return humanizeCode(item.refType) || copy.transactions.descriptionEmpty
}

function toLedgerTransaction(item, language, copy) {
  return {
    id: item.id || `${item.createdAt}-${item.amount}-${item.currencyCode}`,
    type: resolveTransactionTitle(item, copy),
    target: resolveTransactionTarget(item, copy),
    amount: item.amount,
    currency: item.currencyCode,
    date: formatMoneyDateTime(item.createdAt, {
      language,
      fallback: copy.common.notAvailable,
    }),
  }
}

function resolveWorkItemHref(item) {
  if (item.sourceType === 'ORDER' && item.refCode) return `/orders/${item.refCode}`
  if (item.sourceType === 'WITHDRAWAL_REQUEST' && item.refCode) {
    return `/money/withdrawal-requests/${item.refCode}`
  }
  if (item.sourceType === 'DEPOSIT_REQUEST' && item.refCode) {
    return `/money/deposit-requests/${item.refCode}`
  }
  if (item.sourceType === 'OFFER' && item.refId) return `/dashboard/offers/${item.refId}/edit`
  return '/money/wallet'
}

function resolveWorkItemLinkLabel(item) {
  if (item.sourceType === 'ORDER') return 'Открыть заказ'
  if (item.sourceType === 'WITHDRAWAL_REQUEST') return 'Открыть заявку'
  if (item.sourceType === 'OFFER') return 'Открыть предложение'
  if (item.sourceType === 'DEPOSIT_REQUEST') return 'Открыть пополнение'
  return 'Открыть'
}

function toWorkItem(item) {
  return {
    ...item,
    currency: item.currencyCode,
    to: resolveWorkItemHref(item),
    linkLabel: resolveWorkItemLinkLabel(item),
  }
}

export default function WalletPage() {
  const { language } = useI18n()
  const copy = useMemo(() => getMoneyCopy(language), [language])
  const { currencyCode: displayCurrencyCode } = useDisplayCurrency()
  const [primaryCurrencyCode, setPrimaryCurrencyCode] = useState(
    () => normalizeCurrencyCode(displayCurrencyCode) || 'RUB'
  )
  const [showZeroBalances, setShowZeroBalances] = useState(readShowZeroBalancesPreference)
  const [walletEntries, setWalletEntries] = useState([])
  const [walletStatus, setWalletStatus] = useState('loading')
  const [walletError, setWalletError] = useState('')
  const [recentTransactions, setRecentTransactions] = useState([])
  const [txStatus, setTxStatus] = useState('loading')
  const [txError, setTxError] = useState('')
  const [workSummary, setWorkSummary] = useState({ reserves: [], pendingDeposits: [] })
  const [workStatus, setWorkStatus] = useState('loading')
  const [workError, setWorkError] = useState('')

  useEffect(() => {
    let active = true

    async function loadPrimaryCurrency() {
      try {
        const response = await getMe()
        if (!active) return

        const nextCurrencyCode = getUserPrimaryCurrencyCode(response?.data)
        if (!nextCurrencyCode) return
        setPrimaryCurrencyCode(nextCurrencyCode)
        setDisplayCurrency(nextCurrencyCode)
      } catch {
        // Wallet can still use the local display-currency fallback.
      }
    }

    loadPrimaryCurrency()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true

    async function loadWallets() {
      setWalletStatus('loading')
      setWalletError('')

      try {
        const walletsRes = await getMyWallets()
        if (!active) return

        const normalized = normalizeWalletEntries(walletsRes?.data || {})
        setWalletEntries(normalized)
        setWalletStatus('ready')
      } catch (error) {
        if (!active) return
        setWalletError(getErrorMessage(error, copy.wallet.loadError))
        setWalletStatus('error')
      }
    }

    loadWallets()

    return () => {
      active = false
    }
  }, [copy.wallet.loadError])

  useEffect(() => {
    let active = true

    async function loadRecentTransactions() {
      setTxStatus('loading')
      setTxError('')

      try {
        const response = await getMyWalletTransactions({
          page: 0,
          size: 5,
          sort: 'createdAt,desc',
        })
        if (!active) return

        const pageData = getPageContent(response?.data)
        setRecentTransactions(
          pageData.content.map(normalizeTransaction).filter(Boolean)
        )
        setTxStatus('ready')
      } catch (error) {
        if (!active) return
        setTxError(getErrorMessage(error, copy.transactions.loadError))
        setTxStatus('error')
      }
    }

    loadRecentTransactions()

    return () => {
      active = false
    }
  }, [copy.transactions.loadError])

  useEffect(() => {
    let active = true

    async function loadWorkSummary() {
      setWorkStatus('loading')
      setWorkError('')

      try {
        const response = await getMyWalletWorkSummary()
        if (!active) return

        setWorkSummary(normalizeWalletWorkSummary(response?.data))
        setWorkStatus('ready')
      } catch (error) {
        if (!active) return
        setWorkError(getFriendlyWorkError(error, 'Не удалось загрузить активные операции.'))
        setWorkStatus('error')
      }
    }

    loadWorkSummary()

    return () => {
      active = false
    }
  }, [])

  const visibleWallets = useMemo(() => {
    if (showZeroBalances) return walletEntries
    return walletEntries.filter((item) => {
      const currencyCode = normalizeCurrencyCode(item.currencyCode || item.code)
      return currencyCode === primaryCurrencyCode || hasWalletValue(item)
    })
  }, [primaryCurrencyCode, showZeroBalances, walletEntries])

  const ledgerTransactions = useMemo(
    () => recentTransactions.map((item) => toLedgerTransaction(item, language, copy)),
    [copy, language, recentTransactions]
  )

  const reserves = useMemo(
    () => workSummary.reserves.map(toWorkItem),
    [workSummary.reserves]
  )
  const pendingDeposits = useMemo(
    () => workSummary.pendingDeposits.map(toWorkItem),
    [workSummary.pendingDeposits]
  )

  async function handleMakePrimaryCurrency(currencyCode) {
    const nextCurrencyCode = normalizeCurrencyCode(currencyCode)
    if (!nextCurrencyCode || nextCurrencyCode === primaryCurrencyCode) return

    const previousCurrencyCode = primaryCurrencyCode
    setPrimaryCurrencyCode(nextCurrencyCode)
    setDisplayCurrency(nextCurrencyCode)

    try {
      const response = await updateMyPrimaryCurrency(nextCurrencyCode)
      const savedCurrencyCode = getUserPrimaryCurrencyCode(response?.data) || nextCurrencyCode
      setPrimaryCurrencyCode(savedCurrencyCode)
      setDisplayCurrency(savedCurrencyCode)
    } catch {
      setPrimaryCurrencyCode(previousCurrencyCode)
      setDisplayCurrency(previousCurrencyCode)
    }
  }

  function handleToggleZeroBalances() {
    setShowZeroBalances((value) => {
      const nextValue = !value
      writeLocalStorage(WALLET_SHOW_ZERO_BALANCES_KEY, String(nextValue))
      return nextValue
    })
  }

  if (walletStatus === 'loading') {
    return (
      <div className="account-page wallet-lab-page wallet-lab-page--standalone">
        <MoneyStateCard title={copy.common.loading} text="Загружаем кошелек и балансы." />
      </div>
    )
  }

  if (walletStatus === 'error') {
    return (
      <div className="account-page wallet-lab-page wallet-lab-page--standalone">
        <MoneyStateCard
          tone="danger"
          title={copy.common.noDataTitle}
          text={walletError}
          action={
            <Button type="button" variant="secondary" onClick={() => window.location.reload()}>
              {copy.common.retry}
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <WalletExperience
      allWallets={walletEntries}
      wallets={visibleWallets}
      primaryCurrencyCode={primaryCurrencyCode}
      onMakePrimary={handleMakePrimaryCurrency}
      showZeroCurrencies={showZeroBalances}
      onToggleZeroCurrencies={handleToggleZeroBalances}
      reserveItems={reserves}
      pendingDepositItems={pendingDeposits}
      transactions={ledgerTransactions}
      transactionStatus={txStatus}
      transactionError={txError}
      transactionEmptyText={copy.wallet.recentEmpty}
      workStatus={workStatus}
      workError={workError}
    />
  )
}
