import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import { getMyWallets } from '../../api/wallets'
import { getErrorMessage } from '../../app/errors'
import { useI18n } from '../../app/i18n'

function formatAmount(value) {
  const num = Number(value)
  if (Number.isFinite(num)) return num.toFixed(4)
  return '—'
}

export default function Wallet() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [wallets, setWallets] = useState({})
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const loadWallets = async () => {
      await Promise.resolve()
      if (!active) return
      setStatus('loading')
      setError('')

      try {
        const res = await getMyWallets()
        if (!active) return
        setWallets(res?.data || {})
        setStatus('ready')
      } catch (err) {
        if (!active) return
        setError(getErrorMessage(err, t('account.walletError')))
        setStatus('error')
      }
    }

    loadWallets()

    return () => {
      active = false
    }
  }, [t])

  const items = useMemo(() => Object.entries(wallets || {}), [wallets])
  const isLoading = status === 'loading'

  return (
    <div className="account-page">
      <div className="account-page__head">
        <h1 className="h1 account-page__title">{t('account.walletTitle')}</h1>
        <div className="account-page__actions">
          <Button type="button" onClick={() => navigate('/account/deposit')}>
            {t('account.deposit')}
          </Button>
          <Button type="button" variant="secondary">
            {t('account.withdraw')}
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
          <div className="wallet-empty">{t('account.walletEmpty')}</div>
        </div>
      ) : null}
      {!isLoading && !error && items.length > 0 ? (
        <div className="wallet-grid">
          {items.map(([code, data]) => (
            <article key={code} className="card wallet-card">
              <div className="wallet-card__head">
                <div className="wallet-card__code">{code}</div>
              </div>
              <div className="wallet-card__grid">
                <div>
                  <div className="wallet-card__label">{t('account.balance')}</div>
                  <div className="wallet-card__value">{formatAmount(data?.balance)}</div>
                </div>
                <div>
                  <div className="wallet-card__label">{t('account.available')}</div>
                  <div className="wallet-card__value">{formatAmount(data?.available)}</div>
                </div>
                <div>
                  <div className="wallet-card__label">{t('account.reserved')}</div>
                  <div className="wallet-card__value">{formatAmount(data?.reserved)}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  )
}
