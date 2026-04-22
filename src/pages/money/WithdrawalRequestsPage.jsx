import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useI18n } from '../../app/i18n'
import { getCurrencies } from '../../api/deposit'
import { getWithdrawalRequests } from '../../api/withdrawals'
import { getErrorMessage } from '../../shared/lib/errors'
import {
  formatMoneyAmount,
  formatMoneyDateTime,
  getPageContent,
  getWithdrawalStatusLabel,
  getWithdrawalStatusTone,
  normalizeWithdrawalRequest,
} from '../../shared/lib/money'
import { MoneyPageHeader, MoneyPagination, MoneyStateCard } from './MoneyUI'
import { getMoneyCopy } from './moneyCopy'

const WITHDRAWAL_STATUS_OPTIONS = [
  'OPEN',
  'PENDING',
  'PROCESSING',
  'UNDER_REVIEW',
  'COMPLETED',
  'REJECTED',
  'CANCELLED',
]

function buildSearchParams(current, patch) {
  const next = new URLSearchParams(current)

  Object.entries(patch).forEach(([key, value]) => {
    if (value == null || value === '') {
      next.delete(key)
      return
    }
    next.set(key, String(value))
  })

  return next
}

export default function WithdrawalRequestsPage() {
  const { language } = useI18n()
  const copy = useMemo(() => getMoneyCopy(language), [language])
  const [searchParams, setSearchParams] = useSearchParams()
  const [currencies, setCurrencies] = useState([])
  const [requests, setRequests] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [pageInfo, setPageInfo] = useState({ page: 0, totalPages: 1 })

  const currencyFilter = searchParams.get('currency') || ''
  const statusFilter = searchParams.get('status') || ''
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

    async function loadRequests() {
      setStatus('loading')
      setError('')

      try {
        const response = await getWithdrawalRequests({
          page,
          size: 20,
          sort: 'createdAt,desc',
          ...(currencyFilter ? { currency_code: currencyFilter } : {}),
          ...(statusFilter ? { status: statusFilter } : {}),
        })
        if (!active) return

        const pageData = getPageContent(response?.data)
        setRequests(pageData.content.map(normalizeWithdrawalRequest).filter(Boolean))
        setPageInfo({
          page: pageData.number,
          totalPages: Math.max(pageData.totalPages || 1, 1),
        })
        setStatus('ready')
      } catch (loadError) {
        if (!active) return
        setError(getErrorMessage(loadError, copy.withdrawals.listError))
        setStatus('error')
      }
    }

    loadRequests()

    return () => {
      active = false
    }
  }, [copy.withdrawals.listError, currencyFilter, page, statusFilter])

  const updateParams = (patch) => {
    setSearchParams(buildSearchParams(searchParams, patch))
  }

  return (
    <div className="account-page money-page">
      <MoneyPageHeader
        eyebrow={copy.common.withdraw}
        title={copy.withdrawals.requestsTitle}
        subtitle={copy.withdrawals.requestsSubtitle}
        actions={
          <Link to="/money/withdraw" className="btn btn--primary">
            {copy.withdrawals.newWithdrawal}
          </Link>
        }
      />

      <div className="card money-filter-card">
        <div className="money-filter-card__title">{copy.common.filters}</div>
        <div className="money-filter-grid">
          <label className="field">
            <span className="field__label">{copy.common.currency}</span>
            <select
              className="input"
              value={currencyFilter}
              onChange={(event) => updateParams({ currency: event.target.value, page: '' })}
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
            <span className="field__label">{copy.common.status}</span>
            <select
              className="input"
              value={statusFilter}
              onChange={(event) => updateParams({ status: event.target.value, page: '' })}
            >
              <option value="">{copy.common.all}</option>
              {WITHDRAWAL_STATUS_OPTIONS.map((statusCode) => (
                <option key={statusCode} value={statusCode}>
                  {getWithdrawalStatusLabel(statusCode, copy)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {status === 'loading' ? (
        <MoneyStateCard title={copy.common.loading} text={copy.withdrawals.requestsSubtitle} />
      ) : null}
      {status === 'error' ? (
        <MoneyStateCard tone="danger" title={copy.common.noDataTitle} text={error} />
      ) : null}
      {status === 'ready' && requests.length === 0 ? (
        <MoneyStateCard
          title={copy.withdrawals.emptyTitle}
          text={copy.withdrawals.emptyText}
        />
      ) : null}

      {status === 'ready' && requests.length > 0 ? (
        <>
          <div className="card requests-table money-table-card">
            <div className="requests-table__head money-table-card__head money-table-card__head--withdrawals">
              <div>{copy.common.createdAt}</div>
              <div>{copy.common.amount}</div>
              <div>{copy.common.method}</div>
              <div>{copy.common.status}</div>
            </div>
            <div className="requests-table__body">
              {requests.map((item) => (
                <Link
                  key={item.publicId}
                  to={`/money/withdrawal-requests/${item.publicId}`}
                  className="requests-row money-table-row"
                >
                  <div className="requests-cell" data-label={copy.common.createdAt}>
                    {formatMoneyDateTime(item.createdAt, {
                      language,
                      fallback: copy.common.notAvailable,
                    })}
                  </div>
                  <div className="requests-cell requests-cell--stacked" data-label={copy.common.amount}>
                    <span className="requests-cell__amount">
                      {formatMoneyAmount(item.amount, {
                        language,
                        fallback: copy.common.notAvailable,
                      })}{' '}
                      {item.currencyCode}
                    </span>
                    {item.actualPayoutAmount != null ? (
                      <span className="money-inline-meta">
                        {copy.common.actualPayoutAmount}:{' '}
                        {formatMoneyAmount(item.actualPayoutAmount, {
                          language,
                          fallback: copy.common.notAvailable,
                        })}{' '}
                        {item.currencyCode}
                      </span>
                    ) : null}
                  </div>
                  <div className="requests-cell requests-cell--stacked" data-label={copy.common.method}>
                    <span>{item.methodTitle || copy.common.notAvailable}</span>
                    <span className="money-inline-meta">
                      {copy.common.requestId}: {item.publicId || copy.common.notAvailable}
                    </span>
                  </div>
                  <div className="requests-cell requests-cell--status" data-label={copy.common.status}>
                    <span className={`status-chip status-chip--${getWithdrawalStatusTone(item.status)}`}>
                      {getWithdrawalStatusLabel(item.status, copy)}
                    </span>
                  </div>
                </Link>
              ))}
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
