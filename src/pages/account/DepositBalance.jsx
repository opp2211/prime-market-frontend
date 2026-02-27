import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../shared/ui/Button'
import { getCurrencies, getDepositMethods } from '../../api/deposit'
import { createDepositRequest } from '../../api/depositRequests'
import { getErrorMessage } from '../../shared/lib/errors'
import { useI18n } from '../../app/i18n'

const METHOD_TITLES = {
  'Bank Transfer': {
    ru: 'Банковский перевод',
    en: 'Bank Transfer',
  },
}

function resolveMethodTitle(title, language) {
  if (!title) return ''
  const mapped = METHOD_TITLES[title]
  if (!mapped) return title
  return mapped[language] || title
}

function getStep(selectedCurrency, selectedMethod) {
  if (selectedMethod) return 3
  if (selectedCurrency) return 2
  return 1
}

export default function DepositBalance() {
  const { t, language } = useI18n()
  const navigate = useNavigate()
  const [currencies, setCurrencies] = useState([])
  const [currencyStatus, setCurrencyStatus] = useState('loading')
  const [currencyError, setCurrencyError] = useState('')
  const [selectedCurrency, setSelectedCurrency] = useState('')

  const [methods, setMethods] = useState([])
  const [methodsStatus, setMethodsStatus] = useState('idle')
  const [methodsError, setMethodsError] = useState('')
  const [selectedMethodId, setSelectedMethodId] = useState(null)

  const [amount, setAmount] = useState('')
  const [createStatus, setCreateStatus] = useState('idle')
  const [createError, setCreateError] = useState('')

  useEffect(() => {
    let active = true

    const loadCurrencies = async () => {
      setCurrencyStatus('loading')
      setCurrencyError('')
      try {
        const res = await getCurrencies()
        if (!active) return
        const list = Array.isArray(res?.data) ? res.data : []
        const codes = list.map((item) => item?.code).filter(Boolean)
        setCurrencies(codes)
        setCurrencyStatus('ready')
      } catch (err) {
        if (!active) return
        setCurrencyError(getErrorMessage(err, t('account.depositCurrenciesError')))
        setCurrencyStatus('error')
      }
    }

    loadCurrencies()

    return () => {
      active = false
    }
  }, [t])

  useEffect(() => {
    let active = true

    if (!selectedCurrency) {
      setMethods([])
      setMethodsStatus('idle')
      setMethodsError('')
      return () => {
        active = false
      }
    }

    const loadMethods = async () => {
      setMethods([])
      setMethodsStatus('loading')
      setMethodsError('')
      try {
        const res = await getDepositMethods(selectedCurrency)
        if (!active) return
        const list = Array.isArray(res?.data) ? res.data : []
        setMethods(list)
        setMethodsStatus('ready')
      } catch (err) {
        if (!active) return
        setMethodsError(getErrorMessage(err, t('account.depositMethodsError')))
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

  const currentStep = getStep(selectedCurrency, selectedMethod)

  const handleCurrencyChange = (event) => {
    const next = event.target.value
    setSelectedCurrency(next)
    setSelectedMethodId(null)
    setAmount('')
  }

  const handleMethodClick = (method) => {
    setSelectedMethodId(method?.id ?? null)
  }

  const methodIsAuto = Boolean(selectedMethod?.auto_confirmation)
  const normalizedAmount = amount.replace(',', '.')
  const amountValue = Number(normalizedAmount)
  const amountIsValid = Number.isFinite(amountValue) && amountValue > 0
  const canSubmit = Boolean(selectedMethod) && amountIsValid && createStatus !== 'loading'

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
      const res = await createDepositRequest({
        deposit_method_id: selectedMethod.id,
        amount: amountValue,
      })
      const request = res?.data
      if (request?.public_id) {
        navigate(`/account/deposit-requests/${request.public_id}`, { state: { request } })
      } else {
        setCreateError(t('account.depositRequestInvalid'))
      }
    } catch (err) {
      setCreateError(getErrorMessage(err, t('account.depositRequestError')))
    } finally {
      setCreateStatus('idle')
    }
  }

  return (
    <div className="account-page deposit-page">
      <div className="card deposit-hero">
        <div className="deposit-hero__content">
          <h1 className="h1 account-page__title">{t('account.depositTitle')}</h1>
          <p className="deposit-hero__subtitle">{t('account.depositSubtitle')}</p>
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
          <div className="deposit-card__title">{t('account.depositCurrencyTitle')}</div>
          <div className="deposit-card__hint">{t('account.depositCurrencyHint')}</div>
          <label className="field">
            <span className="field__label">{t('account.depositCurrencyLabel')}</span>
            <select
              className="input deposit-select"
              value={selectedCurrency}
              onChange={handleCurrencyChange}
            >
              <option value="">{t('account.depositCurrencyPlaceholder')}</option>
              {currencies.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </label>
          {currencyStatus === 'loading' ? (
            <div className="muted small">{t('account.loading')}</div>
          ) : null}
          {currencyError ? <div className="error small">{currencyError}</div> : null}
        </div>

        {selectedCurrency ? (
          <div className="card deposit-card">
            <div className="deposit-card__title">{t('account.depositMethodTitle')}</div>
            <div className="deposit-card__hint">{t('account.depositMethodHint')}</div>
            {methodsStatus === 'loading' ? (
              <div className="muted">{t('account.loading')}</div>
            ) : null}
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
                      onClick={() => handleMethodClick(method)}
                    >
                      <div>
                        <div className="deposit-method__title">
                          {resolveMethodTitle(method?.title, language)}
                        </div>
                      </div>
                      <span
                        className={`deposit-tag ${
                          isAuto ? 'deposit-tag--auto' : 'deposit-tag--manual'
                        }`}
                        data-tooltip={
                          isAuto
                            ? t('account.depositAutoHelp')
                            : t('account.depositManualHelp')
                        }
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
            <div className="deposit-card__hint">{t('account.depositAmountHint')}</div>
            <div
              className={`deposit-confirmation ${
                methodIsAuto ? 'deposit-confirmation--auto' : 'deposit-confirmation--manual'
              }`}
            >
              <div className="deposit-confirmation__title">
                {methodIsAuto
                  ? t('account.depositAutoHighlight')
                  : t('account.depositManualHighlight')}
              </div>
              <div className="deposit-confirmation__text">
                {methodIsAuto
                  ? t('account.depositAutoHelp')
                  : t('account.depositManualHelp')}
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
            <Button
              type="button"
              className="deposit-continue"
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              {createStatus === 'loading'
                ? t('account.depositCreating')
                : t('account.depositContinue')}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  )
}







