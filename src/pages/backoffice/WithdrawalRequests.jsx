import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { getCurrencies } from '../../api/deposit'
import { getAdminWithdrawalRequests } from '../../api/adminWithdrawalRequests'
import { useI18n } from '../../app/i18n'
import { useUser } from '../../app/user'
import { getErrorMessage } from '../../shared/lib/errors'
import {
  formatMoneyAmount,
  formatMoneyDateTime,
  getPageContent,
  getWithdrawalStatusLabel,
  getWithdrawalStatusTone,
} from '../../shared/lib/money'
import { getMoneyCopy } from '../money/moneyCopy'
import { MoneyPageHeader, MoneyPagination, MoneyStateCard } from '../money/MoneyUI'
import {
  canViewWithdrawalRequests,
  getDefaultBackofficePath,
} from './backofficeAccess'
import { getBackofficeMoneyCopy } from './backofficeMoneyCopy'
import {
  WITHDRAWAL_ACTIONABLE_STATUSES,
  WITHDRAWAL_STATUS_OPTIONS,
  getProcessedByLabel,
  getRequestSearchToken,
  getWithdrawalImportantTimestamp,
  getWithdrawalUserIdentityLabel,
  normalizeBackofficeWithdrawalRequest,
} from './backofficeMoneyPresentation'

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

function getWithdrawalSearchToken(request) {
  return [
    getRequestSearchToken(request),
    request?.userId,
    request?.userAccountId,
    request?.processedByUserId,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

export default function BackofficeWithdrawalRequests() {
  const { language } = useI18n()
  const { permissions, status: userStatus } = useUser()
  const copy = getBackofficeMoneyCopy(language)
  const moneyCopy = getMoneyCopy(language)
  const [searchParams, setSearchParams] = useSearchParams()
  const [currencies, setCurrencies] = useState([])
  const [requests, setRequests] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [pageInfo, setPageInfo] = useState({
    page: 0,
    totalPages: 1,
    totalElements: 0,
  })

  const allowed = canViewWithdrawalRequests(permissions)
  const fallbackPath = getDefaultBackofficePath(permissions)
  const scope = searchParams.get('scope') || 'actionable'
  const statusFilter = searchParams.get('status') || ''
  const currencyFilter = searchParams.get('currency') || ''
  const methodFilter = searchParams.get('method') || ''
  const queryFilter = (searchParams.get('query') || '').trim().toLowerCase()
  const page = Math.max(0, Number(searchParams.get('page')) || 0)
  const listPath = useMemo(() => {
    const query = searchParams.toString()
    return query ? `/backoffice/withdrawal-requests?${query}` : '/backoffice/withdrawal-requests'
  }, [searchParams])

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

    if (allowed) {
      loadCurrencies()
    }

    return () => {
      active = false
    }
  }, [allowed])

  useEffect(() => {
    let active = true

    async function loadRequests() {
      setStatus('loading')
      setError('')

      try {
        const response = await getAdminWithdrawalRequests({
          page,
          size: 20,
          sort: 'createdAt,desc',
          ...(statusFilter
            ? { status: statusFilter }
            : scope === 'actionable'
              ? { status: WITHDRAWAL_ACTIONABLE_STATUSES }
              : {}),
        })

        if (!active) return

        const pageData = getPageContent(response?.data)
        const normalized = pageData.content.map(normalizeBackofficeWithdrawalRequest).filter(Boolean)
        setRequests(normalized)
        setPageInfo({
          page: pageData.number,
          totalPages: Math.max(pageData.totalPages || 1, 1),
          totalElements: Number.isFinite(Number(pageData.totalElements))
            ? Number(pageData.totalElements)
            : normalized.length,
        })
        setStatus('ready')
      } catch (loadError) {
        if (!active) return
        setError(getErrorMessage(loadError, moneyCopy.withdrawals.listError))
        setStatus('error')
      }
    }

    if (allowed) {
      loadRequests()
    }

    return () => {
      active = false
    }
  }, [allowed, moneyCopy.withdrawals.listError, page, reloadKey, scope, statusFilter])

  const updateParams = (patch) => {
    setSearchParams(buildSearchParams(searchParams, patch))
  }

  const methodOptions = useMemo(() => {
    const values = new Set()
    requests.forEach((item) => {
      if (item?.methodTitle) values.add(item.methodTitle)
    })
    if (methodFilter) values.add(methodFilter)
    return Array.from(values).sort((left, right) => left.localeCompare(right))
  }, [methodFilter, requests])

  const filteredRequests = useMemo(() => {
    return requests.filter((item) => {
      if (currencyFilter && item.currencyCode !== currencyFilter) return false
      if (methodFilter && item.methodTitle !== methodFilter) return false
      if (queryFilter && !getWithdrawalSearchToken(item).includes(queryFilter)) return false
      return true
    })
  }, [currencyFilter, methodFilter, queryFilter, requests])

  const openCount = filteredRequests.filter((item) => (item?.status || '').toUpperCase() === 'OPEN').length
  const processingCount = filteredRequests.filter(
    (item) => (item?.status || '').toUpperCase() === 'PROCESSING'
  ).length
  const totalCount = filteredRequests.length

  if (userStatus === 'ready' && !allowed) {
    if (fallbackPath && fallbackPath !== '/backoffice/withdrawal-requests') {
      return <Navigate to={fallbackPath} replace />
    }
    return (
      <div className="account-page money-page">
        <MoneyStateCard
          tone="danger"
          title={copy.common.noAccessTitle}
          text={copy.common.noAccessText}
        />
      </div>
    )
  }

  return (
    <div className="account-page money-page">
      <MoneyPageHeader
        eyebrow={copy.common.title}
        title={copy.withdrawals.title}
        subtitle={copy.withdrawals.subtitle}
        actions={
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => setReloadKey((value) => value + 1)}
          >
            {copy.common.refresh}
          </button>
        }
      />

      <div className="money-overview-grid">
        <div className="card money-metric-card">
          <div className="money-metric-card__label">{copy.withdrawals.metrics.open}</div>
          <div className="money-metric-card__value">{openCount}</div>
          <div className="money-metric-card__helper">
            {getWithdrawalStatusLabel('OPEN', moneyCopy)}
          </div>
        </div>
        <div className="card money-metric-card">
          <div className="money-metric-card__label">{copy.withdrawals.metrics.processing}</div>
          <div className="money-metric-card__value">{processingCount}</div>
          <div className="money-metric-card__helper">
            {getWithdrawalStatusLabel('PROCESSING', moneyCopy)}
          </div>
        </div>
        <div className="card money-metric-card">
          <div className="money-metric-card__label">{copy.withdrawals.metrics.total}</div>
          <div className="money-metric-card__value">{totalCount}</div>
          <div className="money-metric-card__helper">
            {copy.common.queuedTotal}: {pageInfo.totalElements}
          </div>
        </div>
      </div>

      <div className="tabs">
        <button
          type="button"
          className={`tab${scope === 'actionable' ? ' is-active' : ''}`}
          onClick={() => updateParams({ scope: 'actionable', page: '' })}
        >
          {copy.common.queueActionable}
        </button>
        <button
          type="button"
          className={`tab${scope === 'all' ? ' is-active' : ''}`}
          onClick={() => updateParams({ scope: 'all', page: '' })}
        >
          {copy.common.queueAll}
        </button>
      </div>

      <div className="card money-filter-card">
        <div className="money-filter-card__title">{copy.common.filtersTitle}</div>
        <div className="money-filter-grid">
          <label className="field">
            <span className="field__label">{moneyCopy.common.status}</span>
            <select
              className="input"
              value={statusFilter}
              onChange={(event) => updateParams({ status: event.target.value, page: '' })}
            >
              <option value="">{moneyCopy.common.all}</option>
              {WITHDRAWAL_STATUS_OPTIONS.map((statusCode) => (
                <option key={statusCode} value={statusCode}>
                  {getWithdrawalStatusLabel(statusCode, moneyCopy)}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field__label">{moneyCopy.common.currency}</span>
            <select
              className="input"
              value={currencyFilter}
              onChange={(event) => updateParams({ currency: event.target.value, page: '' })}
            >
              <option value="">{moneyCopy.common.all}</option>
              {currencies.map((currencyCode) => (
                <option key={currencyCode} value={currencyCode}>
                  {currencyCode}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field__label">{moneyCopy.common.method}</span>
            <select
              className="input"
              value={methodFilter}
              onChange={(event) => updateParams({ method: event.target.value, page: '' })}
            >
              <option value="">{moneyCopy.common.all}</option>
              {methodOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field__label">{copy.common.searchLabel}</span>
            <input
              className="input"
              type="search"
              value={searchParams.get('query') || ''}
              placeholder={copy.common.searchPlaceholder}
              onChange={(event) => updateParams({ query: event.target.value, page: '' })}
            />
          </label>
        </div>

        <div className="money-state__actions">
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() =>
              updateParams({
                status: '',
                currency: '',
                method: '',
                query: '',
                page: '',
              })
            }
          >
            {copy.common.clearFilters}
          </button>
        </div>
      </div>

      {status === 'loading' ? (
        <MoneyStateCard title={moneyCopy.common.loading} text={copy.withdrawals.subtitle} />
      ) : null}

      {status === 'error' ? (
        <MoneyStateCard
          tone="danger"
          title={moneyCopy.common.noDataTitle}
          text={error}
          action={
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => setReloadKey((value) => value + 1)}
            >
              {moneyCopy.common.retry}
            </button>
          }
        />
      ) : null}

      {status === 'ready' && filteredRequests.length === 0 ? (
        <MoneyStateCard
          title={copy.withdrawals.emptyTitle}
          text={copy.withdrawals.emptyText}
          action={
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() =>
                updateParams({
                  status: '',
                  currency: '',
                  method: '',
                  query: '',
                  page: '',
                })
              }
            >
              {copy.common.clearFilters}
            </button>
          }
        />
      ) : null}

      {status === 'ready' && filteredRequests.length > 0 ? (
        <>
          <div className="card requests-table money-table-card">
            <div className="requests-table__head requests-table__head--bo-withdrawals">
              <div>{copy.withdrawals.columns.request}</div>
              <div>{copy.withdrawals.columns.user}</div>
              <div>{copy.withdrawals.columns.amounts}</div>
              <div>{copy.withdrawals.columns.method}</div>
              <div>{copy.withdrawals.columns.assignment}</div>
              <div>{copy.withdrawals.columns.status}</div>
            </div>

            <div className="requests-table__body">
              {filteredRequests.map((item) => (
                <Link
                  key={item.publicCode}
                  to={`/backoffice/withdrawal-requests/${item.publicCode}`}
                  className="requests-row requests-row--bo-withdrawals"
                  state={{ request: item, from: listPath }}
                >
                  <div className="requests-cell requests-cell--stacked" data-label={copy.withdrawals.columns.request}>
                    <span className="requests-cell__title">{item.publicCode}</span>
                    <span className="requests-cell__meta">
                      {moneyCopy.common.createdAt}:{' '}
                      {formatMoneyDateTime(item.createdAt, {
                        language,
                        fallback: moneyCopy.common.notAvailable,
                      })}
                    </span>
                    <span className="requests-cell__meta">
                      {copy.common.lastChange}:{' '}
                      {formatMoneyDateTime(getWithdrawalImportantTimestamp(item), {
                        language,
                        fallback: moneyCopy.common.notAvailable,
                      })}
                    </span>
                  </div>

                  <div className="requests-cell requests-cell--stacked" data-label={copy.withdrawals.columns.user}>
                    <span className="requests-cell__title">
                      {getWithdrawalUserIdentityLabel(item, copy)}
                    </span>
                    <span className="requests-cell__meta">{copy.common.openHint}</span>
                  </div>

                  <div className="requests-cell requests-cell--stacked" data-label={copy.withdrawals.columns.amounts}>
                    <span className="requests-cell__amount">
                      {formatMoneyAmount(item.amount, {
                        language,
                        fallback: moneyCopy.common.notAvailable,
                      })}{' '}
                      {item.currencyCode}
                    </span>
                    <span className="requests-cell__meta">
                      {moneyCopy.common.actualPayoutAmount}:{' '}
                      {item.actualPayoutAmount != null
                        ? `${formatMoneyAmount(item.actualPayoutAmount, {
                            language,
                            fallback: moneyCopy.common.notAvailable,
                          })} ${item.currencyCode}`
                        : moneyCopy.common.notAvailable}
                    </span>
                  </div>

                  <div className="requests-cell requests-cell--stacked" data-label={copy.withdrawals.columns.method}>
                    <span className="requests-cell__title">
                      {item.methodTitle || moneyCopy.common.notAvailable}
                    </span>
                    <span className="requests-cell__meta">
                      ID: {item.withdrawalMethodId ?? moneyCopy.common.notAvailable}
                    </span>
                  </div>

                  <div className="requests-cell requests-cell--stacked" data-label={copy.withdrawals.columns.assignment}>
                    <span className="requests-cell__title">
                      {getProcessedByLabel(item, copy)}
                    </span>
                    <span className="requests-cell__meta">
                      {item.processingAt
                        ? formatMoneyDateTime(item.processingAt, {
                            language,
                            fallback: moneyCopy.common.notAvailable,
                          })
                        : copy.common.notAssigned}
                    </span>
                  </div>

                  <div className="requests-cell requests-cell--stacked requests-cell--status" data-label={copy.withdrawals.columns.status}>
                    <span className={`status-chip status-chip--${getWithdrawalStatusTone(item.status)}`}>
                      {getWithdrawalStatusLabel(item.status, moneyCopy)}
                    </span>
                    <span className="requests-cell__meta">
                      {copy.common.importantAt}:{' '}
                      {formatMoneyDateTime(getWithdrawalImportantTimestamp(item), {
                        language,
                        fallback: moneyCopy.common.notAvailable,
                      })}
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
            copy={moneyCopy}
          />
        </>
      ) : null}
    </div>
  )
}
