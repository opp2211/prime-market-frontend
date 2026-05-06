import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useI18n } from '../../app/i18n'
import { getMyWalletTransactions, getMyWallets } from '../../api/wallets'
import { getErrorMessage } from '../../shared/lib/errors'
import {
  getPageContent,
  humanizeCode,
  normalizeTransaction,
  normalizeWalletEntries,
} from '../../shared/lib/money'
import { getMoneyCopy } from './moneyCopy'
import { TransactionsHistoryExperience } from './TransactionsLabPage'

const REAL_TRANSACTION_TYPE_LABELS = {
  DEPOSIT: 'Пополнение',
  WITHDRAWAL: 'Вывод',
  ORDER_SETTLEMENT_DEBIT: 'Оплата заказа',
  ORDER_SELLER_PAYOUT: 'Выплата продавцу',
}

function getEmptyTransactionFilters() {
  return {
    query: '',
    currency: '',
    type: '',
    dateFrom: '',
    dateTo: '',
  }
}

function buildSearchParams(current, patch) {
  const next = new URLSearchParams(current)

  Object.entries(patch).forEach(([key, value]) => {
    if (value == null || value === '' || value === false) {
      next.delete(key)
      return
    }
    next.set(key, String(value))
  })

  return next
}

function toDayStartInstant(value) {
  if (!value) return ''
  return new Date(`${value}T00:00:00`).toISOString()
}

function toDayEndInstant(value) {
  if (!value) return ''
  return new Date(`${value}T23:59:59.999`).toISOString()
}

function shortPublicId(value) {
  if (!value) return ''
  return value.toString().slice(0, 8)
}

function getTransactionTypeLabel(item) {
  if (item.refType === 'USER_CURRENCY_CONVERSION') return 'Конвертация'
  return REAL_TRANSACTION_TYPE_LABELS[item.type] || humanizeCode(item.type) || 'Операция'
}

function getTransactionTypeOptions(items) {
  const map = new Map()
  items.forEach((item) => {
    if (item.type) map.set(item.type, item.typeLabel)
  })
  return Array.from(map.entries()).map(([value, label]) => ({ value, label }))
}

function getTransactionSummary(items, totalItems = items.length) {
  return {
    count: totalItems,
    incomeCount: items.filter((item) => item.amount > 0).length,
    outcomeCount: items.filter((item) => item.amount < 0).length,
    currencies: Array.from(new Set(items.map((item) => item.currency).filter(Boolean))).length,
  }
}

function getTransactionRelatedInfo(item) {
  const publicId = item.refPublicId || ''
  const shortId = shortPublicId(publicId)

  if (item.refType === 'DEPOSIT_REQUEST' && publicId) {
    return {
      relatedLabel: `Пополнение ${shortId}`,
      relatedHref: `/money/deposit-requests/${publicId}`,
    }
  }

  if (item.refType === 'WITHDRAWAL_REQUEST' && publicId) {
    return {
      relatedLabel: `Вывод ${shortId}`,
      relatedHref: `/money/withdrawal-requests/${publicId}`,
    }
  }

  if (item.refType?.startsWith('ORDER_') && publicId) {
    return {
      relatedLabel: `Заказ ${shortId}`,
      relatedHref: `/orders/${publicId}`,
    }
  }

  if (item.refType === 'USER_CURRENCY_CONVERSION') {
    return {
      relatedLabel: publicId ? `Конвертация ${shortId}` : 'Конвертация',
      relatedHref: '/money/convert',
    }
  }

  return {
    relatedLabel: item.refType ? humanizeCode(item.refType) : 'Связь не указана',
    relatedHref: '/money/transactions',
  }
}

function toHistoryTransaction(item) {
  const typeLabel = getTransactionTypeLabel(item)
  const relatedInfo = getTransactionRelatedInfo(item)

  return {
    id: item.id,
    createdAt: item.createdAt,
    type: item.type,
    typeLabel,
    description: item.label || item.description || relatedInfo.relatedLabel,
    currency: item.currencyCode,
    amount: Number(item.amount || 0),
    ...relatedInfo,
  }
}

export default function TransactionHistoryPage() {
  const { language } = useI18n()
  const copy = useMemo(() => getMoneyCopy(language), [language])
  const [searchParams, setSearchParams] = useSearchParams()
  const [currencies, setCurrencies] = useState([])
  const [transactions, setTransactions] = useState([])
  const [knownTypes, setKnownTypes] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [pageInfo, setPageInfo] = useState({ page: 0, totalPages: 1, totalElements: 0 })

  const filters = {
    ...getEmptyTransactionFilters(),
    currency: searchParams.get('currency') || '',
    type: searchParams.get('type') || '',
    dateFrom: searchParams.get('from') || '',
    dateTo: searchParams.get('to') || '',
  }
  const page = Math.max(0, Number(searchParams.get('page')) || 0)

  useEffect(() => {
    let active = true

    async function loadCurrencies() {
      try {
        const response = await getMyWallets()
        if (!active) return
        const list = normalizeWalletEntries(response?.data || {}).map((item) => item.code)
        setCurrencies(list)
      } catch {
        if (!active) return
        setCurrencies([])
      }
    }

    loadCurrencies()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true

    async function loadTransactions() {
      setStatus('loading')
      setError('')

      try {
        const response = await getMyWalletTransactions({
          page,
          size: 20,
          sort: 'createdAt,desc',
          ...(filters.currency ? { currency: [filters.currency] } : {}),
          ...(filters.type ? { type: [filters.type] } : {}),
          ...(filters.dateFrom ? { from: toDayStartInstant(filters.dateFrom) } : {}),
          ...(filters.dateTo ? { to: toDayEndInstant(filters.dateTo) } : {}),
        })
        if (!active) return

        const pageData = getPageContent(response?.data)
        const items = pageData.content
          .map(normalizeTransaction)
          .filter(Boolean)
          .map(toHistoryTransaction)
        setTransactions(items)
        setPageInfo({
          page: pageData.number,
          totalPages: Math.max(pageData.totalPages || 1, 1),
          totalElements: pageData.totalElements || items.length,
        })
        setKnownTypes((previous) => {
          const next = new Set(previous)
          if (filters.type) next.add(filters.type)
          items.forEach((item) => {
            if (item.type) next.add(item.type)
          })
          return Array.from(next)
        })
        setStatus('ready')
      } catch (loadError) {
        if (!active) return
        setError(getErrorMessage(loadError, copy.transactions.loadError))
        setTransactions([])
        setPageInfo({ page: 0, totalPages: 1, totalElements: 0 })
        setStatus('error')
      }
    }

    loadTransactions()

    return () => {
      active = false
    }
  }, [
    copy.transactions.loadError,
    filters.currency,
    filters.dateFrom,
    filters.dateTo,
    filters.type,
    page,
  ])

  const typeOptions = useMemo(() => {
    const types = knownTypes.map((type) => ({
      type,
      typeLabel: REAL_TRANSACTION_TYPE_LABELS[type] || humanizeCode(type),
    }))
    if (filters.type && !knownTypes.includes(filters.type)) {
      types.push({
        type: filters.type,
        typeLabel: REAL_TRANSACTION_TYPE_LABELS[filters.type] || humanizeCode(filters.type),
      })
    }
    return getTransactionTypeOptions(types)
  }, [filters.type, knownTypes])

  const summary = useMemo(
    () => getTransactionSummary(transactions, pageInfo.totalElements),
    [pageInfo.totalElements, transactions]
  )

  function updateParams(patch) {
    setSearchParams(buildSearchParams(searchParams, patch))
  }

  function handleFilterChange(name, value) {
    const paramName = name === 'dateFrom' ? 'from' : name === 'dateTo' ? 'to' : name
    updateParams({ [paramName]: value, page: '' })
  }

  function handleClearFilters() {
    updateParams({ currency: '', type: '', from: '', to: '', page: '' })
  }

  return (
    <TransactionsHistoryExperience
      filters={filters}
      currencyOptions={currencies}
      typeOptions={typeOptions}
      items={transactions}
      page={pageInfo.page}
      totalPages={pageInfo.totalPages}
      totalItems={pageInfo.totalElements}
      summary={summary}
      status={status}
      error={error}
      emptyText={copy.transactions.emptyText}
      showSearch={false}
      onFilterChange={handleFilterChange}
      onClearFilters={handleClearFilters}
      onPageChange={(nextPage) => updateParams({ page: nextPage || '' })}
    />
  )
}
