import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Button from '../../shared/ui/Button'
import { useDisplayCurrency } from '../../app/displayCurrency'
import { useI18n } from '../../app/i18n'
import { getCurrencies } from '../../api/deposit'
import { getPayoutProfiles } from '../../api/payoutProfiles'
import {
  createWithdrawalRequest,
  getWithdrawalMethods,
} from '../../api/withdrawals'
import { getMyWallets } from '../../api/wallets'
import { getErrorMessage } from '../../shared/lib/errors'
import {
  formatMoneyAmount,
  getDisplayWallet,
  getEntityId,
  getPageContent,
  maskPayoutProfile,
  normalizePayoutProfile,
  normalizeWithdrawalMethod,
  normalizeWalletEntries,
} from '../../shared/lib/money'
import { getMethodFieldValues, validateMethodFieldValues } from './moneyFields'
import { getMoneyCopy } from './moneyCopy'
import { MoneyPageHeader, MoneyRequisitesFields, MoneyStateCard } from './MoneyUI'
import {
  buildWithdrawalCreatePayload,
  getPreferredProfile,
  matchesMethodAndCurrency,
} from './withdrawalHelpers'

function getMethodKey(method) {
  if (!method) return ''
  return method.id != null ? String(method.id) : method.code || ''
}

function findMethodByKey(methods, selectedMethodKey) {
  return methods.find((method) => getMethodKey(method) === selectedMethodKey) || null
}

export default function WithdrawalCreatePage() {
  const navigate = useNavigate()
  const { language } = useI18n()
  const copy = useMemo(() => getMoneyCopy(language), [language])
  const { currencyCode: displayCurrency } = useDisplayCurrency()
  const [searchParams] = useSearchParams()
  const initialCurrency = (searchParams.get('currency') || displayCurrency || '').toUpperCase()
  const [currencies, setCurrencies] = useState([])
  const [walletEntries, setWalletEntries] = useState([])
  const [catalogStatus, setCatalogStatus] = useState('loading')
  const [catalogError, setCatalogError] = useState('')
  const [selectedCurrency, setSelectedCurrency] = useState(initialCurrency)
  const [methods, setMethods] = useState([])
  const [methodsStatus, setMethodsStatus] = useState('idle')
  const [methodsError, setMethodsError] = useState('')
  const [selectedMethodKey, setSelectedMethodKey] = useState('')
  const [profiles, setProfiles] = useState([])
  const [profilesStatus, setProfilesStatus] = useState('loading')
  const [profilesError, setProfilesError] = useState('')
  const [mode, setMode] = useState('manual')
  const [selectedProfileId, setSelectedProfileId] = useState('')
  const [fieldValues, setFieldValues] = useState({})
  const [fieldErrors, setFieldErrors] = useState({})
  const [amount, setAmount] = useState('')
  const [saveProfile, setSaveProfile] = useState(false)
  const [profileLabel, setProfileLabel] = useState('')
  const [createStatus, setCreateStatus] = useState('idle')
  const [createError, setCreateError] = useState('')

  useEffect(() => {
    let active = true

    async function loadCatalog() {
      setCatalogStatus('loading')
      setCatalogError('')

      try {
        const [currenciesRes, walletsRes] = await Promise.all([getCurrencies(), getMyWallets()])
        if (!active) return

        const currencyList = Array.isArray(currenciesRes?.data) ? currenciesRes.data : []
        const walletList = normalizeWalletEntries(walletsRes?.data || {}, currencyList)
        const codes = currencyList.map((item) => item?.code).filter(Boolean)

        setCurrencies(codes)
        setWalletEntries(walletList)
        if (!selectedCurrency && codes.length > 0) {
          setSelectedCurrency(initialCurrency && codes.includes(initialCurrency) ? initialCurrency : codes[0])
        }
        setCatalogStatus('ready')
      } catch (error) {
        if (!active) return
        setCatalogError(getErrorMessage(error, copy.withdrawals.loadError))
        setCatalogStatus('error')
      }
    }

    loadCatalog()

    return () => {
      active = false
    }
  }, [copy.withdrawals.loadError, initialCurrency, selectedCurrency])

  useEffect(() => {
    let active = true

    async function loadProfiles() {
      setProfilesStatus('loading')
      setProfilesError('')

      try {
        const response = await getPayoutProfiles({ page: 0, size: 200, sort: 'updatedAt,desc' })
        if (!active) return

        const pageData = getPageContent(response?.data)
        setProfiles(pageData.content.map(normalizePayoutProfile).filter(Boolean))
        setProfilesStatus('ready')
      } catch (error) {
        if (!active) return
        setProfiles([])
        setProfilesError(getErrorMessage(error, copy.payoutProfiles.loadError))
        setProfilesStatus('error')
      }
    }

    loadProfiles()

    return () => {
      active = false
    }
  }, [copy.payoutProfiles.loadError])

  useEffect(() => {
    let active = true

    if (!selectedCurrency) {
      setMethods([])
      setMethodsStatus('idle')
      setMethodsError('')
      setSelectedMethodKey('')
      return () => {
        active = false
      }
    }

    async function loadMethods() {
      setMethods([])
      setMethodsStatus('loading')
      setMethodsError('')

      try {
        const response = await getWithdrawalMethods(selectedCurrency)
        if (!active) return

        const list = Array.isArray(response?.data) ? response.data : []
        const normalized = list.map(normalizeWithdrawalMethod).filter(Boolean)
        setMethods(normalized)
        setMethodsStatus('ready')
      } catch (error) {
        if (!active) return
        setMethods([])
        setMethodsError(getErrorMessage(error, copy.withdrawals.loadError))
        setMethodsStatus('error')
      }
    }

    loadMethods()

    return () => {
      active = false
    }
  }, [copy.withdrawals.loadError, selectedCurrency])

  const selectedMethod = useMemo(
    () => findMethodByKey(methods, selectedMethodKey),
    [methods, selectedMethodKey]
  )

  const selectedWallet = getDisplayWallet(walletEntries, selectedCurrency)
  const relevantProfiles = useMemo(
    () =>
      profiles.filter((profile) => matchesMethodAndCurrency(profile, selectedMethod, selectedCurrency)),
    [profiles, selectedCurrency, selectedMethod]
  )
  const selectedProfile = useMemo(
    () => relevantProfiles.find((profile) => getEntityId(profile) === selectedProfileId) || null,
    [relevantProfiles, selectedProfileId]
  )

  useEffect(() => {
    if (!selectedMethod) {
      setFieldValues({})
      setFieldErrors({})
      setSelectedProfileId('')
      setMode('manual')
      setSaveProfile(false)
      setProfileLabel('')
      return
    }

    setFieldValues((current) => {
      const next = getMethodFieldValues(selectedMethod, {}, copy)
      Object.keys(next).forEach((key) => {
        if (current[key]) next[key] = current[key]
      })
      return next
    })
    setFieldErrors({})
  }, [copy, selectedMethod])

  useEffect(() => {
    if (!selectedMethod) return

    if (relevantProfiles.length === 0) {
      setMode('manual')
      setSelectedProfileId('')
      return
    }

    const preferredProfile = getPreferredProfile(relevantProfiles, selectedMethod, selectedCurrency)
    if (!selectedProfileId || !selectedProfile) {
      setMode('saved')
      setSelectedProfileId(preferredProfile ? getEntityId(preferredProfile) : '')
    }
  }, [relevantProfiles, selectedMethod, selectedCurrency, selectedProfile, selectedProfileId])

  const amountValue = Number(amount.replace(',', '.'))
  const amountIsValid = Number.isFinite(amountValue) && amountValue > 0
  const canSubmit = createStatus !== 'loading' && Boolean(selectedCurrency)

  const handleMethodSelect = (method) => {
    setSelectedMethodKey(getMethodKey(method))
    setCreateError('')
  }

  const handleFieldChange = (name, value) => {
    setFieldValues((current) => ({ ...current, [name]: value }))
    setFieldErrors((current) => ({ ...current, [name]: '' }))
  }

  const handleSubmit = async () => {
    if (createStatus === 'loading') return

    setCreateError('')
    setFieldErrors({})

    if (!selectedCurrency) {
      setCreateError(copy.withdrawals.currencyRequired)
      return
    }

    if (!selectedMethod) {
      setCreateError(copy.withdrawals.methodRequired)
      return
    }

    if (!amountIsValid) {
      setCreateError(copy.withdrawals.amountInvalid)
      return
    }

    if (selectedMethod.minAmount != null && amountValue < Number(selectedMethod.minAmount)) {
      setCreateError(copy.withdrawals.amountTooSmall)
      return
    }

    if (mode === 'saved') {
      if (!selectedProfile) {
        setCreateError(copy.withdrawals.profileRequired)
        return
      }
    } else {
      const errors = validateMethodFieldValues(selectedMethod, fieldValues, copy)
      if (saveProfile && !profileLabel.trim()) {
        errors.profileLabel = copy.withdrawals.labelRequired
      }
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors)
        setCreateError(copy.withdrawals.requisitesRequired)
        return
      }
    }

    setCreateStatus('loading')
    try {
      const response = await createWithdrawalRequest(
        buildWithdrawalCreatePayload({
          method: selectedMethod,
          profile: selectedProfile,
          mode,
          amount: amountValue,
          values: fieldValues,
          saveProfile,
          profileLabel: profileLabel.trim(),
          copy,
        })
      )
      const request = response?.data
      const nextPublicId = request?.public_id || request?.publicId
      if (nextPublicId) {
        navigate(`/money/withdrawal-requests/${nextPublicId}`, { state: { request } })
        return
      }
      setCreateError(copy.withdrawals.createError)
    } catch (error) {
      setCreateError(getErrorMessage(error, copy.withdrawals.createError))
    } finally {
      setCreateStatus('idle')
    }
  }

  return (
    <div className="account-page money-page">
      <MoneyPageHeader
        eyebrow={copy.common.withdraw}
        title={copy.withdrawals.title}
        subtitle={copy.withdrawals.subtitle}
        actions={
          <div className="money-page-header__actions">
            <Link to="/money/payout-profiles" className="btn btn--secondary">
              {copy.payoutProfiles.title}
            </Link>
            <Link to="/money/withdrawal-requests" className="btn btn--secondary">
              {copy.withdrawals.requestsTitle}
            </Link>
          </div>
        }
      />

      {catalogStatus === 'loading' ? (
        <MoneyStateCard title={copy.common.loading} text={copy.withdrawals.subtitle} />
      ) : null}
      {catalogStatus === 'error' ? (
        <MoneyStateCard tone="danger" title={copy.common.noDataTitle} text={catalogError} />
      ) : null}

      {catalogStatus === 'ready' ? (
        <>
          <div className="card money-flow-hero">
            <div className="money-flow-hero__steps">
              <div className={`money-flow-step${selectedCurrency ? ' is-active' : ''}`}>
                <div className="money-flow-step__num">1</div>
                <div className="money-flow-step__text">{copy.withdrawals.selectCurrency}</div>
              </div>
              <div className={`money-flow-step${selectedMethod ? ' is-active' : ''}`}>
                <div className="money-flow-step__num">2</div>
                <div className="money-flow-step__text">{copy.withdrawals.selectMethod}</div>
              </div>
              <div
                className={`money-flow-step${
                  selectedMethod && (mode === 'manual' || selectedProfile) ? ' is-active' : ''
                }`}
              >
                <div className="money-flow-step__num">3</div>
                <div className="money-flow-step__text">{copy.common.requisites}</div>
              </div>
              <div className={`money-flow-step${amount ? ' is-active' : ''}`}>
                <div className="money-flow-step__num">4</div>
                <div className="money-flow-step__text">{copy.common.amount}</div>
              </div>
            </div>
          </div>

          <div className="money-command-grid">
            <div className="card money-section-card">
              <div className="money-section-card__head">
                <div className="money-section-card__title">{copy.withdrawals.selectCurrency}</div>
              </div>

              <label className="field">
                <span className="field__label">{copy.methodFields.currencyLabel}</span>
                <select
                  className="input"
                  value={selectedCurrency}
                  onChange={(event) => {
                    setSelectedCurrency(event.target.value)
                    setSelectedMethodKey('')
                    setCreateError('')
                  }}
                >
                  <option value="">{copy.methodFields.currencyPlaceholder}</option>
                  {currencies.map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>
              </label>

              {selectedCurrency ? (
                <div className="money-inline-card">
                  <div className="money-inline-card__label">{copy.common.balance}</div>
                  <div className="money-inline-card__value">
                    {selectedCurrency}
                    {selectedWallet ? (
                      <span className="money-inline-card__meta">
                        {formatMoneyAmount(selectedWallet.available, {
                          language,
                          fallback: copy.common.notAvailable,
                        })}
                      </span>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <div className="money-section-card__divider" />

              <div className="money-section-card__title">{copy.withdrawals.selectMethod}</div>
              {methodsStatus === 'loading' ? <div className="muted">{copy.common.loading}</div> : null}
              {methodsError ? <div className="error">{methodsError}</div> : null}
              {methodsStatus === 'ready' && methods.length === 0 ? (
                <div className="muted">{copy.common.noDataTitle}</div>
              ) : null}
              <div className="money-method-list">
                {methods.map((method) => (
                  <button
                    type="button"
                    key={getMethodKey(method)}
                    className={`money-method-card${
                      selectedMethodKey === getMethodKey(method) ? ' is-active' : ''
                    }`}
                    onClick={() => handleMethodSelect(method)}
                  >
                    <div className="money-method-card__title">{method.title}</div>
                    <div className="money-method-card__meta">
                      {method.minAmount != null ? (
                        <span>
                          {copy.withdrawals.minAmount}:{' '}
                          {formatMoneyAmount(method.minAmount, {
                            language,
                            fallback: copy.common.notAvailable,
                          })}{' '}
                          {selectedCurrency}
                        </span>
                      ) : null}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="card money-section-card">
              <div className="money-section-card__head">
                <div className="money-section-card__title">{copy.common.requisites}</div>
              </div>

              {selectedMethod ? (
                <>
                  <div className="money-mode-switch">
                    <button
                      type="button"
                      className={`money-mode-switch__button${mode === 'saved' ? ' is-active' : ''}`}
                      onClick={() => setMode('saved')}
                      disabled={relevantProfiles.length === 0}
                    >
                      {copy.withdrawals.useSaved}
                    </button>
                    <button
                      type="button"
                      className={`money-mode-switch__button${mode === 'manual' ? ' is-active' : ''}`}
                      onClick={() => setMode('manual')}
                    >
                      {copy.withdrawals.enterNew}
                    </button>
                  </div>

                  {profilesError ? <div className="error small">{profilesError}</div> : null}
                  {profilesStatus === 'loading' ? (
                    <div className="muted small">{copy.common.loading}</div>
                  ) : null}
                  {mode === 'saved' ? (
                    relevantProfiles.length > 0 ? (
                      <div className="money-profile-choice-list">
                        {relevantProfiles.map((profile) => {
                          const profileId = getEntityId(profile)
                          return (
                            <label
                              key={profileId}
                              className={`money-profile-choice${
                                selectedProfileId === profileId ? ' is-active' : ''
                              }`}
                            >
                              <input
                                type="radio"
                                name="selectedProfile"
                                checked={selectedProfileId === profileId}
                                onChange={() => setSelectedProfileId(profileId)}
                              />
                              <div>
                                <div className="money-profile-choice__title">
                                  {profile.label || copy.common.notAvailable}
                                  {profile.isDefault ? (
                                    <span className="money-badge">{copy.payoutProfiles.defaultBadge}</span>
                                  ) : null}
                                </div>
                                <div className="money-profile-choice__meta">
                                  {maskPayoutProfile(profile) || copy.common.notAvailable}
                                </div>
                              </div>
                            </label>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="notice small">{copy.withdrawals.savedProfilesEmpty}</div>
                    )
                  ) : (
                    <>
                      <MoneyRequisitesFields
                        method={selectedMethod}
                        values={fieldValues}
                        errors={fieldErrors}
                        onChange={handleFieldChange}
                        copy={copy}
                      />
                      <label className="money-checkbox">
                        <input
                          type="checkbox"
                          checked={saveProfile}
                          onChange={(event) => setSaveProfile(event.target.checked)}
                        />
                        <span>{copy.withdrawals.saveNewProfile}</span>
                      </label>
                      <div className="money-helper-text">{copy.withdrawals.saveNewProfileHint}</div>

                      {saveProfile ? (
                        <label className="field">
                          <span className="field__label">{copy.common.label}</span>
                          <input
                            className="input"
                            type="text"
                            value={profileLabel}
                            onChange={(event) => setProfileLabel(event.target.value)}
                            placeholder={copy.methodFields.profilePlaceholder}
                          />
                          {fieldErrors.profileLabel ? (
                            <span className="money-form-error">{fieldErrors.profileLabel}</span>
                          ) : null}
                        </label>
                      ) : null}
                    </>
                  )}
                </>
              ) : (
                <div className="muted">{copy.withdrawals.methodRequired}</div>
              )}
            </div>

            <div className="card money-section-card money-section-card--summary">
              <div className="money-section-card__head">
                <div className="money-section-card__title">{copy.withdrawals.summaryTitle}</div>
              </div>

              <label className="field">
                <span className="field__label">{copy.common.amount}</span>
                <div className="deposit-amount">
                  <input
                    className="input deposit-amount__input"
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    placeholder={copy.withdrawals.amountPlaceholder}
                  />
                  <span className="deposit-amount__code">{selectedCurrency || '---'}</span>
                </div>
              </label>

              {selectedMethod?.minAmount != null ? (
                <div className="money-helper-text">
                  {copy.withdrawals.minAmount}:{' '}
                  {formatMoneyAmount(selectedMethod.minAmount, {
                    language,
                    fallback: copy.common.notAvailable,
                  })}{' '}
                  {selectedCurrency}
                </div>
              ) : null}
              {selectedMethod?.note ? (
                <div className="money-helper-text">
                  {copy.withdrawals.methodNote}: {selectedMethod.note}
                </div>
              ) : null}
              {selectedMethod?.roundingInfo ? (
                <div className="money-helper-text">
                  {copy.withdrawals.roundingInfo}: {selectedMethod.roundingInfo}
                </div>
              ) : null}

              <div className="money-summary-box">
                <div className="money-summary-box__row">
                  <span>{copy.common.requestedAmount}</span>
                  <strong>
                    {amount
                      ? `${formatMoneyAmount(amountValue, {
                          language,
                          fallback: copy.common.notAvailable,
                        })} ${selectedCurrency}`
                      : copy.common.notAvailable}
                  </strong>
                </div>
                <div className="money-summary-box__row">
                  <span>{copy.common.profile}</span>
                  <strong>
                    {mode === 'saved'
                      ? selectedProfile?.label || copy.common.notAvailable
                      : saveProfile
                        ? profileLabel || copy.common.notAvailable
                        : copy.common.optional}
                  </strong>
                </div>
                <div className="money-summary-box__row">
                  <span>{copy.common.method}</span>
                  <strong>{selectedMethod?.title || copy.common.notAvailable}</strong>
                </div>
              </div>

              <div className="money-helper-text">{copy.withdrawals.summaryHint}</div>
              <div className="money-helper-text">{copy.withdrawals.actualPayoutPending}</div>

              {createError ? <div className="error">{createError}</div> : null}

              <Button type="button" onClick={handleSubmit} disabled={!canSubmit}>
                {createStatus === 'loading' ? copy.common.creating : copy.common.submit}
              </Button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
