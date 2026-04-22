import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useI18n } from '../../app/i18n'
import { getDepositRequests } from '../../api/depositRequests'
import { getErrorMessage } from '../../shared/lib/errors'
import {
  formatMoneyAmount,
  formatMoneyDateTime,
  getPageContent,
  normalizeDepositRequest,
} from '../../shared/lib/money'
import { resolveDepositStatusLabel, resolveDepositStatusTone } from '../../app/depositRequests'
import { MoneyPageHeader, MoneyPagination, MoneyStateCard } from './MoneyUI'
import { getMoneyCopy } from './moneyCopy'

const DEPOSIT_STATUS_OPTIONS = [
  'PENDING_DETAILS',
  'WAITING_PAYMENT',
  'PAYMENT_VERIFICATION',
  'CONFIRMED',
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

export default function DepositRequestsPage() {
  const { t, language } = useI18n()
  const copy = useMemo(() => getMoneyCopy(language), [language])
  const [searchParams, setSearchParams] = useSearchParams()
  const [requests, setRequests] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [pageInfo, setPageInfo] = useState({ page: 0, totalPages: 1 })
  const statusFilter = searchParams.get('status') || ''
  const page = Math.max(0, Number(searchParams.get('page')) || 0)

  useEffect(() => {
    let active = true

    async function loadRequests() {
      setStatus('loading')
      setError('')

      try {
        const response = await getDepositRequests({
          page,
          size: 20,
          sort: 'createdAt,desc',
          ...(statusFilter ? { status: statusFilter } : {}),
        })
        if (!active) return

        const pageData = getPageContent(response?.data)
        const items = pageData.content.map(normalizeDepositRequest).filter(Boolean)
        setRequests(items)
        setPageInfo({
          page: pageData.number,
          totalPages: Math.max(pageData.totalPages || 1, 1),
        })
        setStatus('ready')
      } catch (loadError) {
        if (!active) return
        setError(getErrorMessage(loadError, t('account.depositRequestsError')))
        setStatus('error')
      }
    }

    loadRequests()

    return () => {
      active = false
    }
  }, [page, statusFilter, t])

  const updateParams = (patch) => {
    setSearchParams(buildSearchParams(searchParams, patch))
  }

  return (
    <div className="account-page money-page">
      <MoneyPageHeader
        eyebrow={copy.common.deposit}
        title={copy.deposits.requestsTitle}
        subtitle={copy.deposits.requestsSubtitle}
        actions={
          <Link to="/money/deposit" className="btn btn--primary">
            {copy.deposits.newDeposit}
          </Link>
        }
      />

      <div className="card money-filter-card">
        <div className="money-filter-card__title">{copy.common.filters}</div>
        <div className="money-filter-grid">
          <label className="field">
            <span className="field__label">{copy.common.status}</span>
            <select
              className="input"
              value={statusFilter}
              onChange={(event) => updateParams({ status: event.target.value, page: '' })}
            >
              <option value="">{copy.common.all}</option>
              {DEPOSIT_STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {resolveDepositStatusLabel(option, t)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {status === 'loading' ? (
        <MoneyStateCard title={copy.common.loading} text={copy.deposits.requestsSubtitle} />
      ) : null}
      {status === 'error' ? (
        <MoneyStateCard tone="danger" title={copy.common.noDataTitle} text={error} />
      ) : null}
      {status === 'ready' && requests.length === 0 ? (
        <MoneyStateCard
          title={t('account.depositRequestsEmpty')}
          text={copy.deposits.requestsSubtitle}
        />
      ) : null}

      {status === 'ready' && requests.length > 0 ? (
        <>
          <div className="card requests-table money-table-card">
            <div className="requests-table__head money-table-card__head money-table-card__head--requests">
              <div>{copy.common.createdAt}</div>
              <div>{copy.common.amount}</div>
              <div>{copy.common.method}</div>
              <div>{copy.common.status}</div>
            </div>
            <div className="requests-table__body">
              {requests.map((item) => (
                <Link
                  key={item.publicId}
                  to={`/money/deposit-requests/${item.publicId}`}
                  className="requests-row money-table-row"
                >
                  <div className="requests-cell" data-label={copy.common.createdAt}>
                    {formatMoneyDateTime(item.createdAt, {
                      language,
                      fallback: copy.common.notAvailable,
                    })}
                  </div>
                  <div className="requests-cell" data-label={copy.common.amount}>
                    <span className="requests-cell__amount">
                      {formatMoneyAmount(item.amount, {
                        language,
                        fallback: copy.common.notAvailable,
                      })}{' '}
                      {item.currencyCode}
                    </span>
                  </div>
                  <div className="requests-cell requests-cell--stacked" data-label={copy.common.method}>
                    <span>{item.methodTitle || copy.common.notAvailable}</span>
                    <span className="money-inline-meta">
                      {copy.common.requestId}: {item.publicId || copy.common.notAvailable}
                    </span>
                  </div>
                  <div className="requests-cell requests-cell--status" data-label={copy.common.status}>
                    <span className={`status-chip status-chip--${resolveDepositStatusTone(item.status)}`}>
                      {resolveDepositStatusLabel(item.status, t)}
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
