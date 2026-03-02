import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdminDepositRequests } from '../../api/adminDepositRequests'
import { getErrorMessage } from '../../shared/lib/errors'
import { formatAmount, formatDateTime } from '../../shared/lib/format'
import { useI18n } from '../../app/i18n'
import { resolveDepositStatusLabel, resolveDepositStatusTone } from '../../app/depositRequests'

const TABS = [
  { key: 'pending', labelKey: 'backoffice.depositRequestsPending' },
  { key: 'all', labelKey: 'backoffice.depositRequestsAll' },
]

const PENDING_STATUSES = ['PENDING_DETAILS', 'PAYMENT_VERIFICATION']

export default function BackofficeDepositRequests() {
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState('pending')
  const [requests, setRequests] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const loadRequests = async () => {
      setStatus('loading')
      setError('')
      try {
        const res = await getAdminDepositRequests(
          activeTab === 'pending' ? { statuses: PENDING_STATUSES } : undefined
        )
        if (!active) return
        const list = Array.isArray(res?.data?.content) ? res.data.content : []
        setRequests(list)
        setStatus('ready')
      } catch (err) {
        if (!active) return
        setError(getErrorMessage(err, t('backoffice.depositRequestsError')))
        setStatus('error')
      }
    }

    loadRequests()

    return () => {
      active = false
    }
  }, [activeTab, t])

  const items = useMemo(() => (Array.isArray(requests) ? requests : []), [requests])
  const isLoading = status === 'loading'
  const emptyLabel = t('account.notAvailable')

  return (
    <div className="account-page">
      <div className="account-page__head">
        <h1 className="h1 account-page__title">{t('backoffice.depositRequestsTitle')}</h1>
      </div>

      <div className="tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`tab${activeTab === tab.key ? ' is-active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {t(tab.labelKey)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="card">
          <div className="muted">{t('account.loading')}</div>
        </div>
      ) : null}
      {error ? (
        <div className="card">
          <div className="error">{error}</div>
        </div>
      ) : null}
      {!isLoading && !error && items.length === 0 ? (
        <div className="card">
          <div className="muted">{t('backoffice.depositRequestsEmpty')}</div>
        </div>
      ) : null}
      {!isLoading && !error && items.length > 0 ? (
        <div className="card requests-table">
          <div className="requests-table__head">
            <div>{t('account.depositRequestCreatedAt')}</div>
            <div>{t('account.depositAmountLabel')}</div>
            <div>{t('account.depositRequestStatusLabel')}</div>
          </div>
          <div className="requests-table__body">
            {items.map((item) => (
              <Link
                key={item?.public_id}
                to={`/backoffice/deposit-requests/${item?.public_id}`}
                className="requests-row"
                state={{ request: item }}
              >
                <div
                  className="requests-cell"
                  data-label={t('account.depositRequestCreatedAt')}
                >
                  {formatDateTime(item?.created_at, emptyLabel)}
                </div>
                <div className="requests-cell" data-label={t('account.depositAmountLabel')}>
                  <span className="requests-cell__amount">
                    {formatAmount(item?.amount, emptyLabel)}
                    {item?.currency_code ? ` ${item.currency_code}` : ''}
                  </span>
                </div>
                <div
                  className="requests-cell requests-cell--status"
                  data-label={t('account.depositRequestStatusLabel')}
                >
                  <span
                    className={`status-chip status-chip--${resolveDepositStatusTone(
                      item?.status
                    )}`}
                  >
                    {resolveDepositStatusLabel(item?.status, t)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
