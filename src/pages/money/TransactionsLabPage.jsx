import { useMemo, useState } from 'react'
import TransactionsHistoryExperienceView from './TransactionsHistoryExperience'

const TRANSACTION_LAB_ITEMS = [
  {
    id: 'TX-2026-000184',
    createdAt: '2026-05-06T13:42:00+05:00',
    type: 'SALE',
    typeLabel: 'Продажа игровой валюты',
    description: 'Diablo IV, золото',
    currency: 'RUB',
    amount: 18450,
    balanceAfter: 126450.25,
    relatedLabel: 'Заказ PM-18420',
    relatedHref: '/orders/PM-18420',
  },
  {
    id: 'TX-2026-000183',
    createdAt: '2026-05-06T12:10:00+05:00',
    type: 'ORDER_RESERVE',
    typeLabel: 'Резерв по заказу',
    description: 'World of Warcraft, услуга',
    currency: 'RUB',
    amount: -7730,
    balanceAfter: 108000.25,
    relatedLabel: 'Заказ PM-18419',
    relatedHref: '/orders/PM-18419',
  },
  {
    id: 'TX-2026-000182',
    createdAt: '2026-05-05T19:04:00+05:00',
    type: 'DEPOSIT',
    typeLabel: 'Пополнение',
    description: 'Банковский перевод',
    currency: 'RUB',
    amount: 50000,
    balanceAfter: 115730.25,
    relatedLabel: 'Пополнение PMD-4831',
    relatedHref: '/money/deposit-requests/PMD-4831',
  },
  {
    id: 'TX-2026-000181',
    createdAt: '2026-05-05T17:28:00+05:00',
    type: 'WITHDRAWAL',
    typeLabel: 'Вывод',
    description: 'СБП, карта получателя',
    currency: 'RUB',
    amount: -32000,
    balanceAfter: 65730.25,
    relatedLabel: 'Вывод WDR-2049',
    relatedHref: '/money/withdrawal-requests/WDR-2049',
  },
  {
    id: 'TX-2026-000180',
    createdAt: '2026-05-04T22:16:00+05:00',
    type: 'CONVERSION',
    typeLabel: 'Конвертация',
    description: 'USD в RUB',
    currency: 'RUB',
    amount: 12800,
    balanceAfter: 97730.25,
    relatedLabel: 'Конвертация CNV-0318',
    relatedHref: '/money/convert',
  },
  {
    id: 'TX-2026-000179',
    createdAt: '2026-05-04T22:16:00+05:00',
    type: 'CONVERSION',
    typeLabel: 'Конвертация',
    description: 'USD в RUB',
    currency: 'USD',
    amount: -150,
    balanceAfter: 482.9,
    relatedLabel: 'Конвертация CNV-0318',
    relatedHref: '/money/convert',
  },
  {
    id: 'TX-2026-000178',
    createdAt: '2026-05-03T11:44:00+05:00',
    type: 'PURCHASE',
    typeLabel: 'Покупка предмета',
    description: 'Path of Exile 2, сферы',
    currency: 'USD',
    amount: -64.4,
    balanceAfter: 632.9,
    relatedLabel: 'Заказ PM-18412',
    relatedHref: '/orders/PM-18412',
  },
  {
    id: 'TX-2026-000177',
    createdAt: '2026-05-03T10:08:00+05:00',
    type: 'REFUND',
    typeLabel: 'Возврат',
    description: 'Отмена заказа покупателем',
    currency: 'USD',
    amount: 64.4,
    balanceAfter: 697.3,
    relatedLabel: 'Заказ PM-18408',
    relatedHref: '/orders/PM-18408',
  },
  {
    id: 'TX-2026-000176',
    createdAt: '2026-05-02T21:19:00+05:00',
    type: 'SALE',
    typeLabel: 'Продажа товара',
    description: 'Counter-Strike 2, скин',
    currency: 'EUR',
    amount: 118.2,
    balanceAfter: 118.2,
    relatedLabel: 'Заказ PM-18401',
    relatedHref: '/orders/PM-18401',
  },
  {
    id: 'TX-2026-000175',
    createdAt: '2026-05-02T13:32:00+05:00',
    type: 'FEE',
    typeLabel: 'Комиссия',
    description: 'Комиссия платформы по продаже',
    currency: 'EUR',
    amount: -5.91,
    balanceAfter: 0,
    relatedLabel: 'Заказ PM-18401',
    relatedHref: '/orders/PM-18401',
  },
  {
    id: 'TX-2026-000174',
    createdAt: '2026-04-30T18:27:00+05:00',
    type: 'DEPOSIT',
    typeLabel: 'Пополнение',
    description: 'USDT TRC20',
    currency: 'USD',
    amount: 700,
    balanceAfter: 700,
    relatedLabel: 'Пополнение PMD-4802',
    relatedHref: '/money/deposit-requests/PMD-4802',
  },
  {
    id: 'TX-2026-000173',
    createdAt: '2026-04-29T16:11:00+05:00',
    type: 'ORDER_RESERVE',
    typeLabel: 'Резерв по заказу',
    description: 'Lineage 2, адена',
    currency: 'CNY',
    amount: -250,
    balanceAfter: 2400.5,
    relatedLabel: 'Заказ PM-18392',
    relatedHref: '/orders/PM-18392',
  },
  {
    id: 'TX-2026-000172',
    createdAt: '2026-04-29T14:02:00+05:00',
    type: 'SALE',
    typeLabel: 'Продажа услуги',
    description: 'World of Warcraft, прохождение',
    currency: 'CNY',
    amount: 2400.5,
    balanceAfter: 2650.5,
    relatedLabel: 'Заказ PM-18391',
    relatedHref: '/orders/PM-18391',
  },
  {
    id: 'TX-2026-000171',
    createdAt: '2026-04-27T10:18:00+05:00',
    type: 'CONVERSION',
    typeLabel: 'Конвертация',
    description: 'CNY в RUB',
    currency: 'CNY',
    amount: -1800,
    balanceAfter: 250,
    relatedLabel: 'Конвертация CNV-0297',
    relatedHref: '/money/convert',
  },
  {
    id: 'TX-2026-000170',
    createdAt: '2026-04-27T10:18:00+05:00',
    type: 'CONVERSION',
    typeLabel: 'Конвертация',
    description: 'CNY в RUB',
    currency: 'RUB',
    amount: 21960,
    balanceAfter: 65730.25,
    relatedLabel: 'Конвертация CNV-0297',
    relatedHref: '/money/convert',
  },
  {
    id: 'TX-2026-000169',
    createdAt: '2026-04-25T09:35:00+05:00',
    type: 'WITHDRAWAL',
    typeLabel: 'Вывод',
    description: 'Карта получателя',
    currency: 'RUB',
    amount: -12000,
    balanceAfter: 43770.25,
    relatedLabel: 'Вывод WDR-2018',
    relatedHref: '/money/withdrawal-requests/WDR-2018',
  },
]

const PAGE_SIZE = 10

function getEmptyTransactionFilters() {
  return {
    query: '',
    currency: '',
    type: '',
    dateFrom: '',
    dateTo: '',
  }
}

function matchesSearch(item, query) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return true

  return [
    item.id,
    item.type,
    item.typeLabel,
    item.description,
    item.currency,
    item.relatedLabel,
  ]
    .filter(Boolean)
    .some((value) => value.toLowerCase().includes(normalized))
}

function matchesDateRange(item, dateFrom, dateTo) {
  const date = item.createdAt.slice(0, 10)
  if (dateFrom && date < dateFrom) return false
  if (dateTo && date > dateTo) return false
  return true
}

function getUniqueTransactionOptions(items, key) {
  return Array.from(new Set(items.map((item) => item[key]).filter(Boolean)))
}

function getTransactionTypeOptions(items) {
  const map = new Map()
  items.forEach((item) => {
    if (item.type) map.set(item.type, item.typeLabel)
  })
  return Array.from(map.entries()).map(([value, label]) => ({ value, label }))
}

function filterTransactions(items, filters) {
  return items.filter((item) => {
    if (filters.currency && item.currency !== filters.currency) return false
    if (filters.type && item.type !== filters.type) return false
    if (!matchesSearch(item, filters.query || '')) return false
    return matchesDateRange(item, filters.dateFrom, filters.dateTo)
  })
}

function toTransactionHistoryItem(item) {
  return {
    id: item.id || '',
    createdAt: item.createdAt || '',
    type: item.type || '',
    typeLabel: item.typeLabel || item.type || 'Операция',
    description: item.description || 'Описание операции не указано',
    currency: item.currency || item.currencyCode || '',
    amount: Number(item.amount || 0),
    balanceAfter: item.balanceAfter,
    relatedLabel: item.relatedLabel || 'Связанная сущность',
    relatedHref: item.relatedHref || '/money/transactions',
  }
}

export default function TransactionsLabPage() {
  const [filters, setFilters] = useState(getEmptyTransactionFilters)
  const [page, setPage] = useState(0)
  const transactions = useMemo(
    () => TRANSACTION_LAB_ITEMS.map(toTransactionHistoryItem),
    []
  )
  const filteredItems = useMemo(
    () => filterTransactions(transactions, filters),
    [filters, transactions]
  )
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages - 1)
  const pageItems = filteredItems.slice(
    currentPage * PAGE_SIZE,
    currentPage * PAGE_SIZE + PAGE_SIZE
  )
  const currencyOptions = useMemo(
    () => getUniqueTransactionOptions(transactions, 'currency'),
    [transactions]
  )
  const typeOptions = useMemo(
    () => getTransactionTypeOptions(transactions),
    [transactions]
  )

  function handleFilterChange(name, value) {
    setFilters((current) => ({ ...current, [name]: value }))
    setPage(0)
  }

  function handleClearFilters() {
    setFilters(getEmptyTransactionFilters())
    setPage(0)
  }

  return (
    <TransactionsHistoryExperienceView
      subtitle="Поступления и списания по всем валютам."
      filters={filters}
      currencyOptions={currencyOptions}
      typeOptions={typeOptions}
      items={pageItems}
      page={currentPage}
      totalPages={totalPages}
      onFilterChange={handleFilterChange}
      onClearFilters={handleClearFilters}
      onPageChange={setPage}
    />
  )
}
