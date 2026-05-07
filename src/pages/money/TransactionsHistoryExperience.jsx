import { useState } from 'react'
import { Link } from 'react-router-dom'

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
  if (Number.isNaN(date.getTime())) return 'вЂ”'

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
  if (Number.isNaN(date.getTime())) return 'Р”Р°С‚Р° РЅРµ СѓРєР°Р·Р°РЅР°'

  const today = new Date()
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffDays = Math.round((startOfToday - startOfDate) / 86400000)

  if (diffDays === 0) return 'РЎРµРіРѕРґРЅСЏ'
  if (diffDays === 1) return 'Р’С‡РµСЂР°'

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
  if (Number(value) > 0) return 'Р—Р°С‡РёСЃР»РµРЅРёРµ'
  if (Number(value) < 0) return 'РЎРїРёСЃР°РЅРёРµ'
  return 'РќСѓР»РµРІР°СЏ РѕРїРµСЂР°С†РёСЏ'
}

function groupByDay(items) {
  return items.reduce((groups, item) => {
    const day = formatDay(item.createdAt)
    if (!groups.has(day)) groups.set(day, [])
    groups.get(day).push(item)
    return groups
  }, new Map())
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
          <span>РџРѕРёСЃРє</span>
          <input
            value={filters.query}
            onChange={(event) => onChange('query', event.target.value)}
            placeholder="txid, Р·Р°РєР°Р·, Р·Р°СЏРІРєР° РёР»Рё РёРіСЂР°"
          />
        </label>
      ) : null}
      <label className="transactions-lab-field">
        <span>Р’Р°Р»СЋС‚Р°</span>
        <select value={filters.currency} onChange={(event) => onChange('currency', event.target.value)}>
          <option value="">Р’СЃРµ</option>
          {currencyOptions.map((currency) => (
            <option key={currency} value={currency}>
              {currency}
            </option>
          ))}
        </select>
      </label>
      <label className="transactions-lab-field">
        <span>РўРёРї</span>
        <select value={filters.type} onChange={(event) => onChange('type', event.target.value)}>
          <option value="">Р’СЃРµ</option>
          {typeOptions.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </label>
      <label className="transactions-lab-field">
        <span>РЎ РґР°С‚С‹</span>
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(event) => onChange('dateFrom', event.target.value)}
        />
      </label>
      <label className="transactions-lab-field">
        <span>РџРѕ РґР°С‚Сѓ</span>
        <input
          type="date"
          value={filters.dateTo}
          onChange={(event) => onChange('dateTo', event.target.value)}
        />
      </label>
      <button className="transactions-lab-clear" type="button" onClick={onClear}>
        РЎР±СЂРѕСЃРёС‚СЊ
      </button>
    </div>
  )
}

function TransactionsHistoryPagination({ page, totalPages, onPageChange }) {
  return (
    <div className="transactions-lab-pagination">
      <span>
        РЎС‚СЂР°РЅРёС†Р° {page + 1} РёР· {totalPages}
      </span>
      <div>
        <button type="button" disabled={page === 0} onClick={() => onPageChange(page - 1)}>
          РќР°Р·Р°Рґ
        </button>
        <button
          type="button"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
        >
          Р’РїРµСЂС‘Рґ
        </button>
      </div>
    </div>
  )
}

function TransactionsHistoryEmpty({ text = 'РџРѕРїСЂРѕР±СѓР№С‚Рµ РёР·РјРµРЅРёС‚СЊ С„РёР»СЊС‚СЂС‹ РёР»Рё СѓР±СЂР°С‚СЊ РїРѕРёСЃРєРѕРІС‹Р№ Р·Р°РїСЂРѕСЃ.' }) {
  return (
    <div className="transactions-lab-empty">
      <strong>РћРїРµСЂР°С†РёРё РЅРµ РЅР°Р№РґРµРЅС‹</strong>
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
          <button type="button" onClick={onClose}>Р—Р°РєСЂС‹С‚СЊ</button>
        </div>
        <div className="transactions-lab-modal__body">
          <div>
            <span>РЎСѓРјРјР°</span>
            <strong className={`transactions-lab-amount--${getAmountTone(transaction.amount)}`}>
              {formatMoney(transaction.amount, transaction.currency, { signed: true })}
            </strong>
          </div>
          <div>
            <span>Р’Р°Р»СЋС‚Р°</span>
            <strong>{transaction.currency || 'вЂ”'}</strong>
          </div>
          <div>
            <span>РќР°РїСЂР°РІР»РµРЅРёРµ</span>
            <strong>{getDirectionLabel(transaction.amount)}</strong>
          </div>
          <div>
            <span>Р”Р°С‚Р° Рё РІСЂРµРјСЏ</span>
            <strong>{formatDateTime(transaction.createdAt)}</strong>
          </div>
          {hasBalanceAfter ? (
            <div>
              <span>Р‘Р°Р»Р°РЅСЃ РїРѕСЃР»Рµ РѕРїРµСЂР°С†РёРё</span>
              <strong>{formatMoney(transaction.balanceAfter, transaction.currency)}</strong>
            </div>
          ) : null}
          <div>
            <span>РЎРІСЏР·Р°РЅРЅР°СЏ СЃСѓС‰РЅРѕСЃС‚СЊ</span>
            <Link to={transaction.relatedHref}>{transaction.relatedLabel}</Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default function TransactionsHistoryExperience({
  title = 'РСЃС‚РѕСЂРёСЏ РѕРїРµСЂР°С†РёР№',
  subtitle = '',
  filters,
  currencyOptions,
  typeOptions,
  items,
  page,
  totalPages,
  status = 'ready',
  error = '',
  emptyText = 'РџРѕРїСЂРѕР±СѓР№С‚Рµ РёР·РјРµРЅРёС‚СЊ С„РёР»СЊС‚СЂС‹.',
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
            <strong>Р—Р°РіСЂСѓР¶Р°РµРј РѕРїРµСЂР°С†РёРё</strong>
            <span>РСЃС‚РѕСЂРёСЏ РїРѕСЏРІРёС‚СЃСЏ С‡РµСЂРµР· РЅРµСЃРєРѕР»СЊРєРѕ СЃРµРєСѓРЅРґ.</span>
          </div>
        ) : null}
        {status === 'error' ? (
          <div className="transactions-lab-empty transactions-lab-empty--error">
            <strong>РќРµ СѓРґР°Р»РѕСЃСЊ Р·Р°РіСЂСѓР·РёС‚СЊ РѕРїРµСЂР°С†РёРё</strong>
            <span>{error || 'РџРѕРїСЂРѕР±СѓР№С‚Рµ РѕР±РЅРѕРІРёС‚СЊ СЃС‚СЂР°РЅРёС†Сѓ.'}</span>
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
