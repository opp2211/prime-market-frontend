import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Button from '../../shared/ui/Button'
import { useI18n } from '../../app/i18n'
import { getCurrencies } from '../../api/deposit'
import { getMyWalletTransactions } from '../../api/wallets'
import { getErrorMessage } from '../../shared/lib/errors'
import {
  formatMoneyAmount,
  formatMoneyDateTime,
  getAmountTone,
  getPageContent,
  humanizeCode,
  normalizeTransaction,
} from '../../shared/lib/money'
import { MoneyPageHeader, MoneyPagination, MoneyStateCard } from './MoneyUI'
import { getMoneyCopy } from './moneyCopy'

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

  const currencyFilter = searchParams.get('currency') || ''
  const typeFilter = searchParams.get('type') || ''
  const page = Math.max(0, Number(searchParams.get('page')) || 0)

  useEffect(() => {
    let active = true

    async function loadCurrencies() {
      try {
        const response = await getCurrencies()
        if (!active) return
        const list = Array.isArray(response?.data)
          ? response.data.map((item) => item?.code).filter(Boolean)
          : []
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
          ...(currencyFilter ? { currency: [currencyFilter] } : {}),
          ...(typeFilter ? { type: [typeFilter] } : {}),
        })
        if (!active) return

        const pageData = getPageContent(response?.data)
        const items = pageData.content.map(normalizeTransaction).filter(Boolean)
        setTransactions(items)
        setPageInfo({
          page: pageData.number,
          totalPages: Math.max(pageData.totalPages || 1, 1),
          totalElements: pageData.totalElements || items.length,
        })
        setKnownTypes((previous) => {
          const next = new Set(previous)
          if (typeFilter) next.add(typeFilter)
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
  }, [copy.transactions.loadError, currencyFilter, page, typeFilter])

  const typeOptions = useMemo(() => {
    const next = new Set()
    knownTypes.forEach((item) => {
      if (item) next.add(item)
    })
    if (typeFilter) next.add(typeFilter)
    return Array.from(next)
  }, [knownTypes, typeFilter])

  const updateParams = (patch) => {
    setSearchParams(buildSearchParams(searchParams, patch))
  }

  const headerActions = (
    <Button
      type="button"
      variant="secondary"
      onClick={() => updateParams({ currency: '', type: '', page: '' })}
    >
      {copy.common.clearFilters}
    </Button>
  )

  return (
    <div className="account-page money-page">
      <MoneyPageHeader
        eyebrow={copy.transactions.eyebrow}
        title={copy.transactions.title}
        subtitle={copy.transactions.subtitle}
        actions={headerActions}
      />

      <div className="card money-filter-card">
        <div className="money-filter-card__title">{copy.common.filters}</div>
        <div className="money-filter-grid">
          <label className="field">
            <span className="field__label">{copy.transactions.currencyFilter}</span>
            <select
              className="input"
              value={currencyFilter}
              onChange={(event) =>
                updateParams({ currency: event.target.value, page: '' })
              }
            >
              <option value="">{copy.common.all}</option>
              {currencies.map((currencyCode) => (
                <option key={currencyCode} value={currencyCode}>
                  {currencyCode}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field__label">{copy.transactions.typeFilter}</span>
            <select
              className="input"
              value={typeFilter}
              onChange={(event) => updateParams({ type: event.target.value, page: '' })}
            >
              <option value="">{copy.common.all}</option>
              {typeOptions.map((type) => (
                <option key={type} value={type}>
                  {humanizeCode(type)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {status === 'loading' ? (
        <MoneyStateCard title={copy.common.loading} text={copy.transactions.subtitle} />
      ) : null}

      {status === 'error' ? (
        <MoneyStateCard tone="danger" title={copy.common.noDataTitle} text={error} />
      ) : null}

      {status === 'ready' && transactions.length === 0 ? (
        <MoneyStateCard
          title={copy.transactions.emptyTitle}
          text={copy.transactions.emptyText}
        />
      ) : null}

      {status === 'ready' && transactions.length > 0 ? (
        <>
          <div className="card txs-table money-table-card">
            <div className="txs-table__head money-table-card__head money-table-card__head--transactions">
              <div>{copy.common.createdAt}</div>
              <div>{copy.common.operation}</div>
              <div>{copy.common.amount}</div>
              <div>{copy.common.currency}</div>
              <div>{copy.common.description}</div>
            </div>
            <div className="txs-table__body">
              {transactions.map((item) => {
                const tone = getAmountTone(item.amount)
                return (
                  <div className="txs-row money-table-row" key={item.id || `${item.createdAt}-${item.amount}`}>
                    <div className="txs-cell" data-label={copy.common.createdAt}>
                      {formatMoneyDateTime(item.createdAt, {
                        language,
                        fallback: copy.common.notAvailable,
                      })}
                    </div>
                    <div className="txs-cell" data-label={copy.common.operation}>
                      {item.type ? humanizeCode(item.type) : copy.transactions.typeUnknown}
                    </div>
                    <div className="txs-cell" data-label={copy.common.amount}>
                      <span className={`money-amount money-amount--${tone}`}>
                        {formatMoneyAmount(item.amount, {
                          language,
                          fallback: copy.common.notAvailable,
                        })}
                      </span>
                    </div>
                    <div className="txs-cell" data-label={copy.common.currency}>
                      {item.currencyCode || copy.common.notAvailable}
                    </div>
                    <div className="txs-cell txs-cell--stacked" data-label={copy.common.description}>
                      <span>{item.description || copy.transactions.descriptionEmpty}</span>
                      {item.id ? (
                        <span className="money-inline-meta">
                          {copy.transactions.reference}: {item.id}
                        </span>
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <MoneyPagination
            page={pageInfo.page}
            totalPages={pageInfo.totalPages}
            onPageChange={(nextPage) => updateParams({ page: nextPage || '' })}
            copy={copy}
          />
        </>
      ) : null}
    </div>
  )
}
