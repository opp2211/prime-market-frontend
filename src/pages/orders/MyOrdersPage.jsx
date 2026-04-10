import { useEffect, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { getMyOrders } from '../../api/orders'
import { useI18n } from '../../app/i18n'
import { getErrorMessage } from '../../shared/lib/errors'
import OrdersList from './OrdersList'
import { getOrderCopy } from './orderCopy'
import {
  ORDER_ROLE_FILTERS,
  ORDER_STATUS_FILTERS,
  isActiveOrderStatus,
  resolveOrderFilterLabel,
} from './orderPresentation'

const DEFAULT_PAGE = 0
const DEFAULT_SIZE = 20

function normalizeFilterValue(value, supportedValues) {
  return supportedValues.includes(value) ? value : 'all'
}

function parsePageValue(value) {
  const parsed = Number.parseInt(value || `${DEFAULT_PAGE}`, 10)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : DEFAULT_PAGE
}

export default function MyOrdersPage() {
  const { language } = useI18n()
  const copy = getOrderCopy(language)
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()

  const statusFilter = normalizeFilterValue(
    (searchParams.get('status') || 'all').toLowerCase(),
    ORDER_STATUS_FILTERS
  )
  const roleFilter = normalizeFilterValue(
    (searchParams.get('role') || 'all').toLowerCase(),
    ORDER_ROLE_FILTERS
  )
  const page = parsePageValue(searchParams.get('page'))

  const [orders, setOrders] = useState([])
  const [listStatus, setListStatus] = useState('loading')
  const [error, setError] = useState('')
  const [meta, setMeta] = useState({
    total: 0,
    page: DEFAULT_PAGE,
    size: DEFAULT_SIZE,
  })
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true

    const loadOrders = async () => {
      setListStatus((current) => (current === 'ready' || current === 'refreshing' ? 'refreshing' : 'loading'))
      setError('')

      try {
        const response = await getMyOrders({
          page,
          size: DEFAULT_SIZE,
          status: statusFilter === 'all' ? undefined : statusFilter,
          role: roleFilter === 'all' ? undefined : roleFilter,
        })

        if (!active) return

        const data = response?.data || {}
        const items = Array.isArray(data.items) ? data.items : []
        setOrders(items)
        setMeta({
          total: typeof data.total === 'number' ? data.total : items.length,
          page: typeof data.page === 'number' ? data.page : page,
          size: typeof data.size === 'number' ? data.size : DEFAULT_SIZE,
        })
        setListStatus('ready')
      } catch (err) {
        if (!active) return
        setError(getErrorMessage(err, copy.errors.list))
        setListStatus('error')
      }
    }

    loadOrders()

    return () => {
      active = false
    }
  }, [copy.errors.list, page, reloadKey, roleFilter, statusFilter])

  function updateSearch(nextPatch) {
    const nextParams = new URLSearchParams(searchParams)

    Object.entries(nextPatch).forEach(([key, value]) => {
      if (value == null || value === '' || value === 'all' || value === `${DEFAULT_PAGE}`) {
        nextParams.delete(key)
      } else {
        nextParams.set(key, value)
      }
    })

    setSearchParams(nextParams)
  }

  function handleStatusFilterChange(nextStatus) {
    updateSearch({
      status: nextStatus,
      page: `${DEFAULT_PAGE}`,
    })
  }

  function handleRoleFilterChange(nextRole) {
    updateSearch({
      role: nextRole,
      page: `${DEFAULT_PAGE}`,
    })
  }

  const pendingCount = orders.filter((order) => order?.status === 'pending').length
  const activeCount = orders.filter((order) => isActiveOrderStatus(order?.status)).length
  const isPanelLoading = listStatus === 'loading' && orders.length === 0
  const backTo = `${location.pathname}${location.search}`

  return (
    <div className="order-page">
      <section className="card order-panel">
        <div className="order-panel__header">
          <div>
            <div className="order-panel__eyebrow">{copy.navLabel}</div>
            <h1 className="h1 order-panel__title">{copy.list.title}</h1>
            <p className="order-panel__subtitle">{copy.list.subtitle}</p>
          </div>

          <div className="order-panel__stats">
            <div className="order-panel__stat">
              <span className="order-panel__stat-label">{copy.list.showing}</span>
              <strong className="order-panel__stat-value">
                {isPanelLoading ? copy.common.loading : `${orders.length} / ${meta.total}`}
              </strong>
            </div>
            <div className="order-panel__stat">
              <span className="order-panel__stat-label">{copy.status.pending}</span>
              <strong className="order-panel__stat-value">
                {isPanelLoading ? copy.common.loading : copy.list.awaitingSummary(pendingCount)}
              </strong>
            </div>
            <div className="order-panel__stat">
              <span className="order-panel__stat-label">{copy.status.in_progress}</span>
              <strong className="order-panel__stat-value">
                {isPanelLoading ? copy.common.loading : copy.list.activeSummary(activeCount)}
              </strong>
            </div>
          </div>
        </div>

        <div className="order-toolbar">
          <div className="order-filter-group">
            <div className="order-filter-group__label">{copy.filters.status}</div>
            <div className="tabs">
              {ORDER_STATUS_FILTERS.map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`tab${statusFilter === value ? ' is-active' : ''}`}
                  onClick={() => handleStatusFilterChange(value)}
                >
                  {resolveOrderFilterLabel('status', value, language)}
                </button>
              ))}
            </div>
          </div>

          <div className="order-filter-group">
            <div className="order-filter-group__label">{copy.filters.role}</div>
            <div className="tabs">
              {ORDER_ROLE_FILTERS.map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`tab${roleFilter === value ? ' is-active' : ''}`}
                  onClick={() => handleRoleFilterChange(value)}
                >
                  {resolveOrderFilterLabel('role', value, language)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <OrdersList
        copy={copy}
        language={language}
        orders={orders}
        total={meta.total}
        page={meta.page}
        size={meta.size}
        status={listStatus}
        error={error}
        backTo={backTo}
        onRetry={() => setReloadKey((value) => value + 1)}
        onPrevPage={() =>
          updateSearch({
            page: `${Math.max(DEFAULT_PAGE, page - 1)}`,
          })
        }
        onNextPage={() =>
          updateSearch({
            page: `${page + 1}`,
          })
        }
      />
    </div>
  )
}
