import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

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

function formatAmount(value) {
  const numberValue = Number(value)
  if (!Number.isFinite(numberValue)) return '0,00'

  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numberValue)
}

function formatMoney(value, currency, { signed = false } = {}) {
  const numberValue = Number(value || 0)
  const sign = signed && numberValue > 0 ? '+' : ''
  return `${sign}${formatAmount(numberValue)} ${currency || ''}`.trim()
}

function formatDateTime(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function formatDay(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Дата не указана'

  const today = new Date()
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffDays = Math.round((startOfToday - startOfDate) / 86400000)

  if (diffDays === 0) return 'Сегодня'
  if (diffDays === 1) return 'Вчера'

  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function getAmountTone(value) {
  if (Number(value) > 0) return 'positive'
  if (Number(value) < 0) return 'negative'
  return 'neutral'
}

function getDirectionLabel(value) {
  if (Number(value) > 0) return 'Зачисление'
  if (Number(value) < 0) return 'Списание'
  return 'Нулевая операция'
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

function groupByDay(items) {
  return items.reduce((groups, item) => {
    const day = formatDay(item.createdAt)
    if (!groups.has(day)) groups.set(day, [])
    groups.get(day).push(item)
    return groups
  }, new Map())
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

function TransactionsHistoryFilters({
  filters,
  currencyOptions,
  typeOptions,
  onChange,
  onClear,
  showSearch = true,
}) {
  const className = [
    'transactions-lab-filters',
    'transactions-lab-filters--compact',
    showSearch ? '' : 'transactions-lab-filters--no-search',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={className}>
      {showSearch ? (
        <label className="transactions-lab-field transactions-lab-field--search">
          <span>Поиск</span>
          <input
            value={filters.query}
            onChange={(event) => onChange('query', event.target.value)}
            placeholder="txid, заказ, заявка или игра"
          />
        </label>
      ) : null}
      <label className="transactions-lab-field">
        <span>Валюта</span>
        <select value={filters.currency} onChange={(event) => onChange('currency', event.target.value)}>
          <option value="">Все</option>
          {currencyOptions.map((currency) => (
            <option key={currency} value={currency}>
              {currency}
            </option>
          ))}
        </select>
      </label>
      <label className="transactions-lab-field">
        <span>Тип</span>
        <select value={filters.type} onChange={(event) => onChange('type', event.target.value)}>
          <option value="">Все</option>
          {typeOptions.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </label>
      <label className="transactions-lab-field">
        <span>С даты</span>
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(event) => onChange('dateFrom', event.target.value)}
        />
      </label>
      <label className="transactions-lab-field">
        <span>По дату</span>
        <input
          type="date"
          value={filters.dateTo}
          onChange={(event) => onChange('dateTo', event.target.value)}
        />
      </label>
      <button className="transactions-lab-clear" type="button" onClick={onClear}>
        Сбросить
      </button>
    </div>
  )
}

function TransactionsHistoryPagination({ page, totalPages, onPageChange }) {
  return (
    <div className="transactions-lab-pagination">
      <span>
        Страница {page + 1} из {totalPages}
      </span>
      <div>
        <button type="button" disabled={page === 0} onClick={() => onPageChange(page - 1)}>
          Назад
        </button>
        <button
          type="button"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
        >
          Вперёд
        </button>
      </div>
    </div>
  )
}

function TransactionsHistoryEmpty({ text = 'Попробуйте изменить фильтры или убрать поисковый запрос.' }) {
  return (
    <div className="transactions-lab-empty">
      <strong>Операции не найдены</strong>
      <span>{text}</span>
    </div>
  )
}

function TransactionLinkButton({ item, onOpen }) {
  return (
    <button
      className="transactions-lab-link-button"
      type="button"
      onClick={() => onOpen(item)}
    >
      {item.typeLabel}
    </button>
  )
}

function TransactionsHistoryJournal({ items, onOpenDetails, emptyText }) {
  const groups = groupByDay(items)

  if (!items.length) return <TransactionsHistoryEmpty text={emptyText} />

  return (
    <div className="transactions-lab-journal">
      {Array.from(groups.entries()).map(([day, dayItems]) => (
        <section className="transactions-lab-day" key={day}>
          <h3>{day}</h3>
          <div>
            {dayItems.map((item) => (
              <article className="transactions-lab-event" key={item.id || `${item.createdAt}-${item.amount}`}>
                <div className="transactions-lab-event__marker" aria-hidden="true" />
                <div className="transactions-lab-event__main">
                  <div>
                    <TransactionLinkButton item={item} onOpen={onOpenDetails} />
                    <span>{item.description}</span>
                  </div>
                  <Link to={item.relatedHref}>{item.relatedLabel}</Link>
                </div>
                <div className="transactions-lab-event__meta">
                  <time>{formatDateTime(item.createdAt)}</time>
                  <span>{item.id}</span>
                </div>
                <strong
                  className={`transactions-lab-amount transactions-lab-amount--${getAmountTone(item.amount)}`}
                >
                  {formatMoney(item.amount, item.currency, { signed: true })}
                </strong>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function TransactionsHistoryModal({ transaction, onClose }) {
  if (!transaction) return null

  const hasBalanceAfter = transaction.balanceAfter !== undefined && transaction.balanceAfter !== null

  return (
    <div className="transactions-lab-modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="transactions-lab-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="transactions-lab-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="transactions-lab-modal__head">
          <div>
            <span>{transaction.id}</span>
            <h2 id="transactions-lab-modal-title">{transaction.typeLabel}</h2>
            <p>{transaction.description}</p>
          </div>
          <button type="button" onClick={onClose}>Закрыть</button>
        </div>
        <div className="transactions-lab-modal__body">
          <div>
            <span>Сумма</span>
            <strong className={`transactions-lab-amount--${getAmountTone(transaction.amount)}`}>
              {formatMoney(transaction.amount, transaction.currency, { signed: true })}
            </strong>
          </div>
          <div>
            <span>Валюта</span>
            <strong>{transaction.currency || '—'}</strong>
          </div>
          <div>
            <span>Направление</span>
            <strong>{getDirectionLabel(transaction.amount)}</strong>
          </div>
          <div>
            <span>Дата и время</span>
            <strong>{formatDateTime(transaction.createdAt)}</strong>
          </div>
          {hasBalanceAfter ? (
            <div>
              <span>Баланс после операции</span>
              <strong>{formatMoney(transaction.balanceAfter, transaction.currency)}</strong>
            </div>
          ) : null}
          <div>
            <span>Связанная сущность</span>
            <Link to={transaction.relatedHref}>{transaction.relatedLabel}</Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export function TransactionsHistoryExperience({
  title = 'История операций',
  subtitle = '',
  filters,
  currencyOptions,
  typeOptions,
  items,
  page,
  totalPages,
  status = 'ready',
  error = '',
  emptyText = 'Попробуйте изменить фильтры.',
  showSearch = true,
  onFilterChange,
  onClearFilters,
  onPageChange,
}) {
  const [selectedTransaction, setSelectedTransaction] = useState(null)

  return (
    <div className="account-page wallet-lab-page transactions-lab-page">
      <header className="transactions-lab-page__head">
        <div>
          <h1>{title}</h1>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
      </header>

      <section className="transactions-lab-panel transactions-lab-panel--filters">
        <TransactionsHistoryFilters
          filters={filters}
          currencyOptions={currencyOptions}
          typeOptions={typeOptions}
          onChange={onFilterChange}
          onClear={onClearFilters}
          showSearch={showSearch}
        />
      </section>

      <section className="transactions-lab-panel transactions-lab-panel--journal transactions-lab-panel--results">
        {status === 'loading' ? (
          <div className="transactions-lab-empty">
            <strong>Загружаем операции</strong>
            <span>История появится через несколько секунд.</span>
          </div>
        ) : null}
        {status === 'error' ? (
          <div className="transactions-lab-empty transactions-lab-empty--error">
            <strong>Не удалось загрузить операции</strong>
            <span>{error || 'Попробуйте обновить страницу.'}</span>
          </div>
        ) : null}
        {status === 'ready' ? (
          <TransactionsHistoryJournal
            items={items}
            onOpenDetails={setSelectedTransaction}
            emptyText={emptyText}
          />
        ) : null}
        {status === 'ready' ? (
          <TransactionsHistoryPagination
            page={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        ) : null}
      </section>

      <TransactionsHistoryModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </div>
  )
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
    <TransactionsHistoryExperience
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
