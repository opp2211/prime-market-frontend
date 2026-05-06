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

const CONCEPTS = [
  {
    id: 1,
    path: '/transactions-lab-1',
    name: 'Реестр',
    title: 'Финансовый реестр',
    note: 'Максимально привычная таблица для сверки: txid, дата, операция, валюта и сумма на первом уровне.',
  },
  {
    id: 2,
    path: '/transactions-lab-2',
    name: 'Журнал',
    title: 'Журнал операций',
    note: 'Лучше раскрывает смысл операции: группировка по датам, связанная сущность рядом с типом, меньше табличной сухости.',
  },
  {
    id: 3,
    path: '/transactions-lab-3',
    name: 'Операционный центр',
    title: 'Операционный центр',
    note: 'Для частой работы с фильтрами: плотная таблица, боковая панель, быстрые срезы по деньгам и типам.',
  },
]

const PAGE_SIZE = 7

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
  return `${sign}${formatAmount(numberValue)} ${currency}`
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

  const today = new Date('2026-05-06T12:00:00+05:00')
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

function getUniqueOptions(items, key) {
  return Array.from(new Set(items.map((item) => item[key]).filter(Boolean)))
}

function getTypeOptions(items) {
  const map = new Map()
  items.forEach((item) => {
    if (item.type) map.set(item.type, item.typeLabel)
  })
  return Array.from(map.entries()).map(([value, label]) => ({ value, label }))
}

function getSummary(items) {
  return {
    count: items.length,
    incomeCount: items.filter((item) => item.amount > 0).length,
    outcomeCount: items.filter((item) => item.amount < 0).length,
    currencies: getUniqueOptions(items, 'currency').length,
  }
}

function TransactionsLabConceptSwitch({ variant }) {
  return (
    <nav className="transactions-lab-switch" aria-label="Варианты страницы операций">
      {CONCEPTS.map((concept) => (
        <Link
          className={concept.id === variant ? 'is-active' : ''}
          key={concept.id}
          to={concept.path}
        >
          {concept.name}
        </Link>
      ))}
    </nav>
  )
}

function TransactionsLabFilters({
  filters,
  currencyOptions,
  typeOptions,
  onChange,
  onClear,
  compact = false,
}) {
  return (
    <div className={`transactions-lab-filters${compact ? ' transactions-lab-filters--compact' : ''}`}>
      <label className="transactions-lab-field transactions-lab-field--search">
        <span>Поиск</span>
        <input
          value={filters.query}
          onChange={(event) => onChange('query', event.target.value)}
          placeholder="txid, заказ, заявка или игра"
        />
      </label>
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

function TransactionsLabSummary({ summary }) {
  return (
    <div className="transactions-lab-summary" aria-label="Сводка по выбранным операциям">
      <div>
        <span>Операций</span>
        <strong>{summary.count}</strong>
      </div>
      <div>
        <span>Зачисления</span>
        <strong className="transactions-lab-amount--positive">{summary.incomeCount}</strong>
      </div>
      <div>
        <span>Списания</span>
        <strong className="transactions-lab-amount--negative">{summary.outcomeCount}</strong>
      </div>
      <div>
        <span>Валют</span>
        <strong>{summary.currencies}</strong>
      </div>
    </div>
  )
}

function TransactionsLabPagination({ page, totalPages, totalItems, onPageChange }) {
  return (
    <div className="transactions-lab-pagination">
      <span>
        Страница {page + 1} из {totalPages} · {totalItems} операций
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

function TransactionsLabEmpty() {
  return (
    <div className="transactions-lab-empty">
      <strong>Операции не найдены</strong>
      <span>Попробуйте изменить фильтры или убрать поисковый запрос.</span>
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

function TransactionsLabTable({ items, onOpenDetails }) {
  if (!items.length) return <TransactionsLabEmpty />

  return (
    <div className="transactions-lab-table">
      <div className="transactions-lab-table__head">
        <div>TXID</div>
        <div>Дата</div>
        <div>Операция</div>
        <div>Валюта</div>
        <div>Сумма</div>
        <div>Связь</div>
      </div>
      <div className="transactions-lab-table__body">
        {items.map((item) => (
          <div className="transactions-lab-row" key={item.id}>
            <div className="transactions-lab-row__id" data-label="TXID">
              {item.id}
            </div>
            <time data-label="Дата">{formatDateTime(item.createdAt)}</time>
            <div className="transactions-lab-row__operation" data-label="Операция">
              <TransactionLinkButton item={item} onOpen={onOpenDetails} />
              <span>{item.description}</span>
            </div>
            <div className="transactions-lab-row__currency" data-label="Валюта">
              {item.currency}
            </div>
            <strong
              className={`transactions-lab-amount transactions-lab-amount--${getAmountTone(item.amount)}`}
              data-label="Сумма"
            >
              {formatMoney(item.amount, item.currency, { signed: true })}
            </strong>
            <Link className="transactions-lab-related" to={item.relatedHref} data-label="Связь">
              {item.relatedLabel}
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

function TransactionsLabRegisterConcept({
  concept,
  filters,
  currencyOptions,
  typeOptions,
  pageItems,
  page,
  totalPages,
  totalItems,
  summary,
  onFilterChange,
  onClearFilters,
  onPageChange,
  onOpenDetails,
}) {
  return (
    <>
      <section className="transactions-lab-hero transactions-lab-hero--register">
        <div>
          <p className="transactions-lab-kicker">Концепт 1</p>
          <h2>{concept.title}</h2>
          <span>{concept.note}</span>
        </div>
        <TransactionsLabSummary summary={summary} />
      </section>

      <section className="transactions-lab-panel">
        <div className="transactions-lab-panel__head">
          <h2>Операции</h2>
          <span>Постраничный реестр с быстрым доступом к связанной сущности</span>
        </div>
        <TransactionsLabFilters
          filters={filters}
          currencyOptions={currencyOptions}
          typeOptions={typeOptions}
          onChange={onFilterChange}
          onClear={onClearFilters}
        />
        <TransactionsLabTable items={pageItems} onOpenDetails={onOpenDetails} />
        <TransactionsLabPagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={onPageChange}
        />
      </section>
    </>
  )
}

function TransactionsLabJournalConcept({
  concept,
  filters,
  currencyOptions,
  typeOptions,
  pageItems,
  page,
  totalPages,
  totalItems,
  summary,
  onFilterChange,
  onClearFilters,
  onPageChange,
  onOpenDetails,
}) {
  const groups = groupByDay(pageItems)

  return (
    <>
      <section className="transactions-lab-hero transactions-lab-hero--journal">
        <div>
          <p className="transactions-lab-kicker">Концепт 2</p>
          <h2>{concept.title}</h2>
          <span>{concept.note}</span>
        </div>
        <div className="transactions-lab-hero__metrics">
          <strong>{summary.count}</strong>
          <span>операций в выборке</span>
        </div>
      </section>

      <section className="transactions-lab-panel transactions-lab-panel--journal">
        <div className="transactions-lab-panel__head">
          <h2>Лента операций</h2>
          <span>Тип операции открывает детали, связанная сущность остается на виду</span>
        </div>
        <TransactionsLabFilters
          compact
          filters={filters}
          currencyOptions={currencyOptions}
          typeOptions={typeOptions}
          onChange={onFilterChange}
          onClear={onClearFilters}
        />
        {pageItems.length ? (
          <div className="transactions-lab-journal">
            {Array.from(groups.entries()).map(([day, items]) => (
              <section className="transactions-lab-day" key={day}>
                <h3>{day}</h3>
                <div>
                  {items.map((item) => (
                    <article className="transactions-lab-event" key={item.id}>
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
        ) : (
          <TransactionsLabEmpty />
        )}
        <TransactionsLabPagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={onPageChange}
        />
      </section>
    </>
  )
}

function TransactionsLabCommandConcept({
  concept,
  filters,
  currencyOptions,
  typeOptions,
  pageItems,
  page,
  totalPages,
  totalItems,
  summary,
  onFilterChange,
  onClearFilters,
  onPageChange,
  onOpenDetails,
}) {
  const topTypes = typeOptions.slice(0, 4)

  return (
    <>
      <section className="transactions-lab-hero transactions-lab-hero--command">
        <div>
          <p className="transactions-lab-kicker">Концепт 3</p>
          <h2>{concept.title}</h2>
          <span>{concept.note}</span>
        </div>
        <TransactionsLabSummary summary={summary} />
      </section>

      <div className="transactions-lab-command-grid">
        <aside className="transactions-lab-aside">
          <div className="transactions-lab-aside__block">
            <h2>Фильтры</h2>
            <TransactionsLabFilters
              compact
              filters={filters}
              currencyOptions={currencyOptions}
              typeOptions={typeOptions}
              onChange={onFilterChange}
              onClear={onClearFilters}
            />
          </div>
          <div className="transactions-lab-aside__block">
            <h2>Быстрые срезы</h2>
            <div className="transactions-lab-chips">
              {topTypes.map((type) => (
                <button
                  className={filters.type === type.value ? 'is-active' : ''}
                  type="button"
                  key={type.value}
                  onClick={() => onFilterChange('type', filters.type === type.value ? '' : type.value)}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section className="transactions-lab-panel transactions-lab-panel--command">
          <div className="transactions-lab-panel__head">
            <h2>Таблица операций</h2>
            <span>Плотная версия для сверки и поддержки</span>
          </div>
          <TransactionsLabTable items={pageItems} onOpenDetails={onOpenDetails} />
          <TransactionsLabPagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={onPageChange}
          />
        </section>
      </div>
    </>
  )
}

function TransactionsLabModal({ transaction, onClose }) {
  if (!transaction) return null

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
            <strong>{transaction.currency}</strong>
          </div>
          <div>
            <span>Направление</span>
            <strong>{getDirectionLabel(transaction.amount)}</strong>
          </div>
          <div>
            <span>Дата и время</span>
            <strong>{formatDateTime(transaction.createdAt)}</strong>
          </div>
          <div>
            <span>Баланс после операции</span>
            <strong>{formatMoney(transaction.balanceAfter, transaction.currency)}</strong>
          </div>
          <div>
            <span>Связанная сущность</span>
            <Link to={transaction.relatedHref}>{transaction.relatedLabel}</Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default function TransactionsLabPage({ variant = 1 }) {
  const numericVariant = Number(variant) || 1
  const concept = CONCEPTS.find((item) => item.id === numericVariant) || CONCEPTS[0]
  const [filters, setFilters] = useState({
    query: '',
    currency: '',
    type: '',
    dateFrom: '',
    dateTo: '',
  })
  const [page, setPage] = useState(0)
  const [selectedTransaction, setSelectedTransaction] = useState(null)

  const currencyOptions = useMemo(
    () => getUniqueOptions(TRANSACTION_LAB_ITEMS, 'currency'),
    []
  )
  const typeOptions = useMemo(
    () => getTypeOptions(TRANSACTION_LAB_ITEMS),
    []
  )
  const filteredItems = useMemo(
    () =>
      TRANSACTION_LAB_ITEMS.filter((item) => {
        if (filters.currency && item.currency !== filters.currency) return false
        if (filters.type && item.type !== filters.type) return false
        if (!matchesSearch(item, filters.query)) return false
        return matchesDateRange(item, filters.dateFrom, filters.dateTo)
      }),
    [filters]
  )
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages - 1)
  const pageItems = filteredItems.slice(
    currentPage * PAGE_SIZE,
    currentPage * PAGE_SIZE + PAGE_SIZE
  )
  const summary = useMemo(() => getSummary(filteredItems), [filteredItems])

  function handleFilterChange(name, value) {
    setFilters((current) => ({ ...current, [name]: value }))
    setPage(0)
  }

  function handleClearFilters() {
    setFilters({
      query: '',
      currency: '',
      type: '',
      dateFrom: '',
      dateTo: '',
    })
    setPage(0)
  }

  const commonProps = {
    concept,
    filters,
    currencyOptions,
    typeOptions,
    pageItems,
    page: currentPage,
    totalPages,
    totalItems: filteredItems.length,
    summary,
    onFilterChange: handleFilterChange,
    onClearFilters: handleClearFilters,
    onPageChange: setPage,
    onOpenDetails: setSelectedTransaction,
  }

  return (
    <div className={`account-page wallet-lab-page transactions-lab-page transactions-lab-page--${numericVariant}`}>
      <header className="transactions-lab-page__head">
        <div>
          <h1>История операций</h1>
          <p>Лаборатория интерфейса для постраничной истории транзакций.</p>
        </div>
        <TransactionsLabConceptSwitch variant={numericVariant} />
      </header>

      {numericVariant === 2 ? (
        <TransactionsLabJournalConcept {...commonProps} />
      ) : numericVariant === 3 ? (
        <TransactionsLabCommandConcept {...commonProps} />
      ) : (
        <TransactionsLabRegisterConcept {...commonProps} />
      )}

      <TransactionsLabModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </div>
  )
}
