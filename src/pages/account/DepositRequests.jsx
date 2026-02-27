import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import { getDepositRequests } from '../../api/depositRequests'
import { getErrorMessage } from '../../app/errors'
import { useI18n } from '../../app/i18n'
import { resolveDepositStatusLabel, resolveDepositStatusTone } from '../../app/depositRequests'

function formatAmount(value) {
  const num = Number(value)
  if (Number.isFinite(num)) return num.toFixed(4)
  return '—'
}

function formatDate(value, t) {
  if (!value) return t('account.notAvailable')
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return t('account.notAvailable')
  return date.toLocaleString()
}

export default function DepositRequests() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const loadRequests = async () => {
      setStatus('loading')
      setError('')
      try {
        const res = await getDepositRequests()
        if (!active) return
        const list = Array.isArray(res?.data?.content) ? res.data.content : []
        setRequests(list)
        setStatus('ready')
      } catch (err) {
        if (!active) return
        setError(getErrorMessage(err, t('account.depositRequestsError')))
        setStatus('error')
      }
    }

    loadRequests()

    return () => {
      active = false
    }
  }, [t])

  const items = useMemo(() => (Array.isArray(requests) ? requests : []), [requests])
  const isLoading = status === 'loading'

  return (
    <div className="account-page">
      <div className="account-page__head">
        <h1 className="h1 account-page__title">{t('account.depositRequestsTitle')}</h1>
        <div className="account-page__actions">
          <Button type="button" onClick={() => navigate('/account/deposit')}>
            {t('account.deposit')}
          </Button>
        </div>
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
          <div className="muted">{t('account.depositRequestsEmpty')}</div>
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
                to={`/account/deposit-requests/${item?.public_id}`}
                className="requests-row"
              >
                <div
                  className="requests-cell"
                  data-label={t('account.depositRequestCreatedAt')}
                >
                  {formatDate(item?.created_at, t)}
                </div>
                <div className="requests-cell" data-label={t('account.depositAmountLabel')}>
                  <span className="requests-cell__amount">
                    {formatAmount(item?.amount)}
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
