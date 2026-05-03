import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Button from '../../shared/ui/Button'
import { getCurrencies } from '../../api/deposit'
import { createCurrencyConversion } from '../../api/currencyConversions'
import { getMyWallets } from '../../api/wallets'
import { useI18n } from '../../app/i18n'
import { getErrorMessage } from '../../shared/lib/errors'
import {
  formatMoneyAmount,
  formatMoneyDateTime,
  getDisplayWallet,
  normalizeCurrencyCode,
  normalizeCurrencyConversion,
  normalizeWalletEntries,
} from '../../shared/lib/money'
import { MoneyPageHeader, MoneyStateCard } from './MoneyUI'
import { getMoneyCopy } from './moneyCopy'

function normalizeAmountInput(value) {
  return String(value || '').trim().replace(',', '.')
}

function getNextCurrency(wallets, currentCode) {
  return wallets.find((wallet) => wallet.code && wallet.code !== currentCode)?.code || ''
}

export default function CurrencyConversionPage() {
  const { language } = useI18n()
  const copy = useMemo(() => getMoneyCopy(language), [language])
  const [searchParams] = useSearchParams()
  const requestedCurrency = normalizeCurrencyCode(searchParams.get('from') || searchParams.get('currency'))
  const [wallets, setWallets] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [actionStatus, setActionStatus] = useState('idle')
  const [actionError, setActionError] = useState('')
  const [conversion, setConversion] = useState(null)
  const [form, setForm] = useState({
    fromCurrencyCode: requestedCurrency,
    toCurrencyCode: '',
    fromAmount: '',
  })

  const loadWallets = useCallback(async (activeFlag) => {
    setStatus('loading')
    setError('')

    try {
      const [walletsResponse, currenciesResponse] = await Promise.all([
        getMyWallets(),
        getCurrencies(),
      ])
      if (!activeFlag.current) return
      const entries = normalizeWalletEntries(walletsResponse?.data || {}, currenciesResponse?.data || [])
      setWallets(entries)
      setStatus('ready')
      setForm((value) => {
        const fromCurrencyCode =
          value.fromCurrencyCode ||
          (requestedCurrency && entries.some((wallet) => wallet.code === requestedCurrency)
            ? requestedCurrency
            : entries[0]?.code || '')
        const toCurrencyCode =
          value.toCurrencyCode && value.toCurrencyCode !== fromCurrencyCode
            ? value.toCurrencyCode
            : getNextCurrency(entries, fromCurrencyCode)

        return {
          ...value,
          fromCurrencyCode,
          toCurrencyCode,
        }
      })
    } catch (loadError) {
      if (!activeFlag.current) return
      setError(getErrorMessage(loadError, "Couldn't load conversion data"))
      setStatus('error')
    }
  }, [requestedCurrency])

  useEffect(() => {
    const activeFlag = { current: true }
    loadWallets(activeFlag)
    return () => {
      activeFlag.current = false
    }
  }, [loadWallets])

  const fromWallet = getDisplayWallet(wallets, form.fromCurrencyCode)
  const toWallet = getDisplayWallet(wallets, form.toCurrencyCode)
  const canSubmit =
    actionStatus === 'idle' &&
    form.fromCurrencyCode &&
    form.toCurrencyCode &&
    form.fromCurrencyCode !== form.toCurrencyCode &&
    Number(normalizeAmountInput(form.fromAmount)) > 0

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (actionStatus !== 'idle') return

    const amount = normalizeAmountInput(form.fromAmount)
    const parsedAmount = Number(amount)
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setActionError('Enter a valid amount.')
      return
    }
    if (form.fromCurrencyCode === form.toCurrencyCode) {
      setActionError('Choose two different currencies.')
      return
    }
    if (fromWallet && parsedAmount > Number(fromWallet.available || 0)) {
      setActionError('Amount is greater than available balance.')
      return
    }

    setActionStatus('convert')
    setActionError('')
    setConversion(null)

    try {
      const response = await createCurrencyConversion({
        from_currency_code: form.fromCurrencyCode,
        to_currency_code: form.toCurrencyCode,
        from_amount: amount,
      })
      setConversion(normalizeCurrencyConversion(response?.data))
      setForm((value) => ({ ...value, fromAmount: '' }))
      const activeFlag = { current: true }
      await loadWallets(activeFlag)
    } catch (submitError) {
      setActionError(getErrorMessage(submitError, "Couldn't convert currency"))
    } finally {
      setActionStatus('idle')
    }
  }

  return (
    <div className="account-page money-page">
      <MoneyPageHeader
        eyebrow="FX"
        title="Currency conversion"
        subtitle="Exchange available wallet balance using the platform rate table."
        actions={
          <div className="money-page-header__actions">
            <Link to="/money/wallet" className="btn btn--secondary">
              Wallet
            </Link>
          </div>
        }
      />

      {status === 'loading' ? (
        <MoneyStateCard title={copy.common.loading} text="Loading wallets and currencies." />
      ) : null}
      {status === 'error' ? (
        <MoneyStateCard tone="danger" title={copy.common.noDataTitle} text={error} />
      ) : null}

      {status === 'ready' ? (
        <>
          <div className="money-two-column">
            <form className="card money-section-card" onSubmit={handleSubmit}>
              <div className="money-section-card__head">
                <div>
                  <div className="money-section-card__title">Convert funds</div>
                  <div className="money-section-card__subtitle">
                    Source balance is debited immediately after backend confirmation.
                  </div>
                </div>
              </div>

              <div className="money-form-grid">
                <label className="field">
                  <span className="field__label">From</span>
                  <select
                    className="input"
                    value={form.fromCurrencyCode}
                    onChange={(event) =>
                      setForm((value) => ({
                        ...value,
                        fromCurrencyCode: event.target.value,
                        toCurrencyCode:
                          value.toCurrencyCode === event.target.value
                            ? getNextCurrency(wallets, event.target.value)
                            : value.toCurrencyCode,
                      }))
                    }
                  >
                    <option value="">Select currency</option>
                    {wallets.map((wallet) => (
                      <option key={wallet.code} value={wallet.code}>
                        {wallet.code}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span className="field__label">To</span>
                  <select
                    className="input"
                    value={form.toCurrencyCode}
                    onChange={(event) =>
                      setForm((value) => ({ ...value, toCurrencyCode: event.target.value }))
                    }
                  >
                    <option value="">Select currency</option>
                    {wallets.map((wallet) => (
                      <option key={wallet.code} value={wallet.code}>
                        {wallet.code}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="field">
                <span className="field__label">Amount</span>
                <input
                  className="input"
                  type="text"
                  value={form.fromAmount}
                  placeholder={`0.0000 ${form.fromCurrencyCode || ''}`.trim()}
                  onChange={(event) =>
                    setForm((value) => ({ ...value, fromAmount: event.target.value }))
                  }
                />
              </label>

              {actionError ? <div className="error">{actionError}</div> : null}

              <div className="money-form-actions">
                <Button type="submit" disabled={!canSubmit}>
                  Convert
                </Button>
              </div>
            </form>

            <div className="card money-section-card">
              <div className="money-section-card__head">
                <div>
                  <div className="money-section-card__title">Balances</div>
                  <div className="money-section-card__subtitle">Available source and target wallets.</div>
                </div>
              </div>

              <div className="money-summary-box">
                <div className="money-summary-box__row">
                  <span>{form.fromCurrencyCode || 'From'}</span>
                  <strong>
                    {formatMoneyAmount(fromWallet?.available, {
                      language,
                      fallback: copy.common.notAvailable,
                    })}{' '}
                    {form.fromCurrencyCode}
                  </strong>
                </div>
                <div className="money-summary-box__row">
                  <span>{form.toCurrencyCode || 'To'}</span>
                  <strong>
                    {formatMoneyAmount(toWallet?.available, {
                      language,
                      fallback: copy.common.notAvailable,
                    })}{' '}
                    {form.toCurrencyCode}
                  </strong>
                </div>
              </div>

              {conversion ? (
                <div className="money-note-box">
                  <div className="money-note-box__title">Conversion completed</div>
                  <div className="money-note-box__text">
                    {formatMoneyAmount(conversion.fromAmount, { language })}{' '}
                    {conversion.fromCurrencyCode} to{' '}
                    {formatMoneyAmount(conversion.toAmount, { language })} {conversion.toCurrencyCode}
                    {' at '}
                    {formatMoneyAmount(conversion.rate, {
                      language,
                      minimumFractionDigits: 4,
                      maximumFractionDigits: 8,
                    })}
                    . {formatMoneyDateTime(conversion.createdAt, { language })}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
