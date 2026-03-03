import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../shared/ui/Button'
import { getMyWallets, getMyWalletTransactions } from '../../api/wallets'
import { getErrorMessage } from '../../shared/lib/errors'
import { formatAmount, formatDateTime } from '../../shared/lib/format'
import { useI18n } from '../../app/i18n'

export default function Wallet() {
  const { t, language } = useI18n()
  const navigate = useNavigate()
  const [wallets, setWallets] = useState({})
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [transactions, setTransactions] = useState([])
  const [txStatus, setTxStatus] = useState('loading')
  const [txError, setTxError] = useState('')
  const [selectedCurrencies, setSelectedCurrencies] = useState([])
  const [selectedTypes, setSelectedTypes] = useState([])

  useEffect(() => {
    let active = true
    const loadWallets = async () => {
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

  useEffect(() => {
    let active = true

    const loadTransactions = async () => {
      setTxStatus('loading')
      setTxError('')
      try {
        const params = {
          page: 0,
          size: 20,
          sort: 'createdAt,desc',
        }
        if (selectedCurrencies.length > 0) params.currency = selectedCurrencies
        if (selectedTypes.length > 0) params.type = selectedTypes
        const res = await getMyWalletTransactions(params)
        if (!active) return
        const list = Array.isArray(res?.data?.content) ? res.data.content : []
        setTransactions(list)
        setTxStatus('ready')
      } catch (err) {
        if (!active) return
        setTxError(getErrorMessage(err, t('account.walletTxsError')))
        setTxStatus('error')
      }
    }

    loadTransactions()

    return () => {
      active = false
    }
  }, [selectedCurrencies, selectedTypes, t])

  const toggleSelection = (value, setter) => {
    setter((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    )
  }

  const items = useMemo(() => Object.entries(wallets || {}), [wallets])
  const walletCurrencies = useMemo(
    () => items.map(([code]) => code).filter(Boolean),
    [items]
  )
  const currencyOptions = useMemo(() => {
    const seen = new Set()
    const list = []
    for (const code of [...walletCurrencies, ...selectedCurrencies]) {
      if (!code || seen.has(code)) continue
      seen.add(code)
      list.push(code)
    }
    return list
  }, [walletCurrencies, selectedCurrencies])
  const txItems = useMemo(
    () => (Array.isArray(transactions) ? transactions : []),
    [transactions]
  )
  const typeOptions = useMemo(() => {
    const seen = new Set()
    const list = []
    for (const type of [...selectedTypes, ...txItems.map((item) => item?.type)]) {
      if (!type || seen.has(type)) continue
      seen.add(type)
      list.push(type)
    }
    return list
  }, [selectedTypes, txItems])
  const isLoading = status === 'loading'
  const isTxLoading = txStatus === 'loading'
  const emptyLabel = t('account.notAvailable')
  const locale = language === 'en' ? 'en-US' : 'ru-RU'

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
                  <div className="wallet-card__value">
                    {formatAmount(data?.balance, emptyLabel)}
                  </div>
                </div>
                <div>
                  <div className="wallet-card__label">{t('account.available')}</div>
                  <div className="wallet-card__value">
                    {formatAmount(data?.available, emptyLabel)}
                  </div>
                </div>
                <div>
                  <div className="wallet-card__label">{t('account.reserved')}</div>
                  <div className="wallet-card__value">
                    {formatAmount(data?.reserved, emptyLabel)}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      <div className="card txs-table">
        <div className="txs-table__header">
          <div className="txs-table__title">
            <h2 className="h2">{t('account.walletTxsTitle')}</h2>
          </div>
          <div className="txs-table__filters">
            <div className="txs-filter">
              <div className="txs-filter__label">
                {t('account.walletTxsFilterCurrency')}
              </div>
              <div className="txs-filter__options">
                {currencyOptions.length > 0 ? (
                  currencyOptions.map((code) => (
                    <label key={code} className="txs-check">
                      <input
                        type="checkbox"
                        checked={selectedCurrencies.includes(code)}
                        onChange={() => toggleSelection(code, setSelectedCurrencies)}
                      />
                      <span>{code}</span>
                    </label>
                  ))
                ) : (
                  <span className="muted small">
                    {t('account.walletTxsFilterEmpty')}
                  </span>
                )}
              </div>
            </div>
            <div className="txs-filter">
              <div className="txs-filter__label">{t('account.walletTxsFilterType')}</div>
              <div className="txs-filter__options">
                {typeOptions.length > 0 ? (
                  typeOptions.map((type) => (
                    <label key={type} className="txs-check">
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(type)}
                        onChange={() => toggleSelection(type, setSelectedTypes)}
                      />
                      <span>{type}</span>
                    </label>
                  ))
                ) : (
                  <span className="muted small">
                    {t('account.walletTxsFilterEmpty')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {isTxLoading ? (
          <div className="txs-table__status">
            <div className="muted">{t('account.loading')}</div>
          </div>
        ) : null}
        {txError ? (
          <div className="txs-table__status">
            <div className="error">{txError}</div>
          </div>
        ) : null}
        {!isTxLoading && !txError && txItems.length === 0 ? (
          <div className="txs-table__status">
            <div className="muted">{t('account.walletTxsEmpty')}</div>
          </div>
        ) : null}
        {!isTxLoading && !txError && txItems.length > 0 ? (
          <>
            <div className="txs-table__head">
              <div>{t('account.walletTxsDate')}</div>
              <div>{t('account.walletTxsType')}</div>
              <div>{t('account.walletTxsAmount')}</div>
              <div>{t('account.walletTxsCurrency')}</div>
              <div>{t('account.walletTxsId')}</div>
            </div>
            <div className="txs-table__body">
              {txItems.map((item, index) => {
                const currency = item?.currency_code
                const publicId = item?.public_id
                const createdAt = item?.created_at
                return (
                  <div
                    key={`${publicId || createdAt || 'tx'}-${index}`}
                    className="txs-row"
                  >
                    <div
                      className="txs-cell"
                      data-label={t('account.walletTxsDate')}
                    >
                      {formatDateTime(createdAt, emptyLabel, locale)}
                    </div>
                    <div
                      className="txs-cell"
                      data-label={t('account.walletTxsType')}
                    >
                      {item?.type || emptyLabel}
                    </div>
                    <div
                      className="txs-cell"
                      data-label={t('account.walletTxsAmount')}
                    >
                      <span className="txs-cell__amount">
                        {formatAmount(item?.amount, emptyLabel)}
                      </span>
                    </div>
                    <div
                      className="txs-cell"
                      data-label={t('account.walletTxsCurrency')}
                    >
                      {currency || emptyLabel}
                    </div>
                    <div
                      className="txs-cell"
                      data-label={t('account.walletTxsId')}
                    >
                      <span className="txs-cell__id">{publicId || emptyLabel}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}

