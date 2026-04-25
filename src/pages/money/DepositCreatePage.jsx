import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Button from '../../shared/ui/Button'
import { useI18n } from '../../app/i18n'
import { getDepositMethods } from '../../api/deposit'
import { createDepositRequest } from '../../api/depositRequests'
import { getMyWallets } from '../../api/wallets'
import { getErrorMessage } from '../../shared/lib/errors'
import { formatMoneyAmount, getDisplayWallet, normalizeWalletEntries } from '../../shared/lib/money'
import { MoneyPageHeader, MoneyStateCard } from './MoneyUI'
import { getMoneyCopy } from './moneyCopy'

const METHOD_TITLES = {
  'Bank Transfer': {
    ru: 'Банковский перевод',
    en: 'Bank Transfer',
  },
}

function resolveMethodTitle(title, language) {
  if (!title) return ''
  const mapped = METHOD_TITLES[title]
  return mapped?.[language] || title
}

function getStep(selectedCurrency, selectedMethod) {
  if (selectedMethod) return 3
  if (selectedCurrency) return 2
  return 1
}

export default function DepositCreatePage() {
  const { t, language } = useI18n()
  const copy = useMemo(() => getMoneyCopy(language), [language])
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const requestedCurrency = (searchParams.get('currency') || '').toUpperCase()
  const [walletEntries, setWalletEntries] = useState([])
  const [currencies, setCurrencies] = useState([])
  const [currencyStatus, setCurrencyStatus] = useState('loading')
  const [currencyError, setCurrencyError] = useState('')
  const [selectedCurrency, setSelectedCurrency] = useState(requestedCurrency)
  const [methods, setMethods] = useState([])
  const [methodsStatus, setMethodsStatus] = useState('idle')
  const [methodsError, setMethodsError] = useState('')
  const [selectedMethodId, setSelectedMethodId] = useState(null)
  const [amount, setAmount] = useState('')
  const [createStatus, setCreateStatus] = useState('idle')
  const [createError, setCreateError] = useState('')

  useEffect(() => {
    let active = true

    async function loadCatalog() {
      setCurrencyStatus('loading')
      setCurrencyError('')

      try {
        const walletsRes = await getMyWallets()
        if (!active) return

        const walletList = normalizeWalletEntries(walletsRes?.data || {})
        const codes = walletList.map((item) => item.code).filter(Boolean)

        setCurrencies(codes)
        setWalletEntries(walletList)
        setSelectedCurrency((current) =>
          current && codes.includes(current) ? current : requestedCurrency && codes.includes(requestedCurrency) ? requestedCurrency : current
        )
        setCurrencyStatus('ready')
      } catch (error) {
        if (!active) return
        setCurrencyError(getErrorMessage(error, t('account.depositCurrenciesError')))
        setCurrencyStatus('error')
      }
    }

    loadCatalog()

    return () => {
      active = false
    }
  }, [requestedCurrency, t])

  useEffect(() => {
    let active = true

    if (!selectedCurrency) {
      setMethods([])
      setMethodsStatus('idle')
      setMethodsError('')
      setSelectedMethodId(null)
      return () => {
        active = false
      }
    }

    async function loadMethods() {
      setMethods([])
      setMethodsStatus('loading')
      setMethodsError('')

      try {
        const response = await getDepositMethods(selectedCurrency)
        if (!active) return
        const list = Array.isArray(response?.data) ? response.data : []
        setMethods(list)
        setMethodsStatus('ready')
      } catch (error) {
        if (!active) return
        setMethodsError(getErrorMessage(error, t('account.depositMethodsError')))
        setMethodsStatus('error')
      }
    }

    loadMethods()

    return () => {
      active = false
    }
  }, [selectedCurrency, t])

  const selectedMethod = useMemo(
    () => methods.find((method) => method?.id === selectedMethodId) || null,
    [methods, selectedMethodId]
  )
  const selectedWallet = getDisplayWallet(walletEntries, selectedCurrency)
  const currentStep = getStep(selectedCurrency, selectedMethod)
  const methodIsAuto = Boolean(selectedMethod?.auto_confirmation)
  const normalizedAmount = amount.replace(',', '.')
  const amountValue = Number(normalizedAmount)
  const amountIsValid = Number.isFinite(amountValue) && amountValue > 0
  const canSubmit = Boolean(selectedMethod) && amountIsValid && createStatus !== 'loading'

  const pageActions = (
    <Link to="/money/deposit-requests" className="btn btn--secondary">
      {copy.deposits.openList}
    </Link>
  )

  const handleCurrencyChange = (event) => {
    setSelectedCurrency(event.target.value)
    setSelectedMethodId(null)
    setAmount('')
    setCreateError('')
  }

  const handleSubmit = async () => {
    if (createStatus === 'loading') return
    setCreateError('')

    if (!selectedMethod) {
      setCreateError(t('account.depositMethodRequired'))
      return
    }

    if (!amountIsValid) {
      setCreateError(t('account.depositAmountInvalid'))
      return
    }

    setCreateStatus('loading')
    try {
      const response = await createDepositRequest({
        deposit_method_id: selectedMethod.id,
        amount: amountValue,
      })
      const request = response?.data
      if (request?.public_id) {
        navigate(`/money/deposit-requests/${request.public_id}`, { state: { request } })
        return
      }
      setCreateError(t('account.depositRequestInvalid'))
    } catch (error) {
      setCreateError(getErrorMessage(error, t('account.depositRequestError')))
    } finally {
      setCreateStatus('idle')
    }
  }

  return (
    <div className="account-page deposit-page money-page">
      <MoneyPageHeader
        eyebrow={copy.common.deposit}
        title={copy.deposits.title}
        subtitle={copy.deposits.subtitle}
        actions={pageActions}
      />

      {currencyStatus === 'error' ? (
        <MoneyStateCard tone="danger" title={copy.common.noDataTitle} text={currencyError} />
      ) : null}

      <div className="card deposit-hero">
        <div className="deposit-hero__content">
          <div className="deposit-steps">
            <div className={`deposit-step${currentStep >= 1 ? ' is-active' : ''}`}>
              <div className="deposit-step__num">1</div>
              <div>
                <div className="deposit-step__title">{t('account.depositStepCurrency')}</div>
                <div className="deposit-step__desc">{t('account.depositStepCurrencyHint')}</div>
              </div>
            </div>
            <div className={`deposit-step${currentStep >= 2 ? ' is-active' : ''}`}>
              <div className="deposit-step__num">2</div>
              <div>
                <div className="deposit-step__title">{t('account.depositStepMethod')}</div>
                <div className="deposit-step__desc">{t('account.depositStepMethodHint')}</div>
              </div>
            </div>
            <div className={`deposit-step${currentStep >= 3 ? ' is-active' : ''}`}>
              <div className="deposit-step__num">3</div>
              <div>
                <div className="deposit-step__title">{t('account.depositStepAmount')}</div>
                <div className="deposit-step__desc">{t('account.depositStepAmountHint')}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="deposit-hero__glow" aria-hidden="true" />
      </div>

      <div className="deposit-grid">
        <div className="card deposit-card">
          <div className="deposit-card__title">{copy.deposits.chooseCurrency}</div>
          <div className="deposit-card__hint">{t('account.depositCurrencyHint')}</div>
          <label className="field">
            <span className="field__label">{t('account.depositCurrencyLabel')}</span>
            <select className="input deposit-select" value={selectedCurrency} onChange={handleCurrencyChange}>
              <option value="">{t('account.depositCurrencyPlaceholder')}</option>
              {currencies.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </label>
          {currencyStatus === 'loading' ? <div className="muted small">{copy.common.loading}</div> : null}
          {selectedCurrency ? (
            <div className="money-inline-card">
              <div className="money-inline-card__label">{copy.deposits.selectedWallet}</div>
              <div className="money-inline-card__value">
                {selectedCurrency}
                {selectedWallet ? (
                  <span className="money-inline-card__meta">
                    {copy.common.balance}:{' '}
                    {formatMoneyAmount(selectedWallet.balance, {
                      language,
                      fallback: copy.common.notAvailable,
                    })}
                  </span>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        {selectedCurrency ? (
          <div className="card deposit-card">
            <div className="deposit-card__title">{copy.deposits.chooseMethod}</div>
            <div className="deposit-card__hint">{t('account.depositMethodHint')}</div>
            {methodsStatus === 'loading' ? <div className="muted">{copy.common.loading}</div> : null}
            {methodsError ? <div className="error">{methodsError}</div> : null}
            {!methodsError && methodsStatus !== 'loading' && methods.length === 0 ? (
              <div className="notice small">{t('account.depositMethodEmpty')}</div>
            ) : null}
            {methods.length > 0 ? (
              <div className="deposit-methods">
                {methods.map((method) => {
                  const isAuto = Boolean(method?.auto_confirmation)
                  const isSelected = selectedMethodId === method?.id
                  return (
                    <button
                      key={method?.id}
                      type="button"
                      className={`deposit-method${isSelected ? ' is-active' : ''}`}
                      onClick={() => setSelectedMethodId(method?.id ?? null)}
                    >
                      <div>
                        <div className="deposit-method__title">
                          {resolveMethodTitle(method?.title, language)}
                        </div>
                      </div>
                      <span
                        className={`deposit-tag ${isAuto ? 'deposit-tag--auto' : 'deposit-tag--manual'}`}
                        data-tooltip={isAuto ? t('account.depositAutoHelp') : t('account.depositManualHelp')}
                      >
                        ?
                      </span>
                    </button>
                  )
                })}
              </div>
            ) : null}
          </div>
        ) : null}

        {selectedMethod ? (
          <div className="card deposit-card">
            <div className="deposit-card__title">{t('account.depositAmountTitle')}</div>
            <div className="deposit-card__hint">{copy.deposits.amountHint}</div>
            <div
              className={`deposit-confirmation ${
                methodIsAuto ? 'deposit-confirmation--auto' : 'deposit-confirmation--manual'
              }`}
            >
              <div className="deposit-confirmation__title">
                {methodIsAuto ? t('account.depositAutoHighlight') : t('account.depositManualHighlight')}
              </div>
              <div className="deposit-confirmation__text">
                {methodIsAuto ? t('account.depositAutoHelp') : t('account.depositManualHelp')}
              </div>
            </div>
            <label className="field">
              <span className="field__label">{t('account.depositAmountLabel')}</span>
              <div className="deposit-amount">
                <input
                  className="input deposit-amount__input"
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder={t('account.depositAmountPlaceholder')}
                />
                <span className="deposit-amount__code">{selectedCurrency}</span>
              </div>
            </label>
            {createError ? <div className="error small">{createError}</div> : null}
            <Button type="button" className="deposit-continue" onClick={handleSubmit} disabled={!canSubmit}>
              {createStatus === 'loading' ? t('account.depositCreating') : t('account.depositContinue')}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
