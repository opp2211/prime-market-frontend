import { useEffect, useMemo, useState } from 'react'
import Button from '../../shared/ui/Button'
import { useI18n } from '../../app/i18n'
import { getCurrencies } from '../../api/deposit'
import {
  createPayoutProfile,
  deletePayoutProfile,
  getPayoutProfiles,
  markDefaultPayoutProfile,
  updatePayoutProfile,
} from '../../api/payoutProfiles'
import { getWithdrawalMethods } from '../../api/withdrawals'
import { getErrorMessage } from '../../shared/lib/errors'
import {
  getEntityId,
  getPageContent,
  maskPayoutProfile,
  normalizePayoutProfile,
  normalizeWithdrawalMethod,
} from '../../shared/lib/money'
import { getMethodFieldValues, validateMethodFieldValues } from './moneyFields'
import { getMoneyCopy } from './moneyCopy'
import { MoneyPageHeader, MoneyRequisitesFields, MoneyStateCard } from './MoneyUI'
import {
  buildCreatePayoutProfilePayload,
  buildUpdatePayoutProfilePayload,
} from './withdrawalHelpers'

function getMethodKey(method) {
  if (!method) return ''
  return method.id != null ? String(method.id) : method.code || ''
}

function findMethodByKey(methods, key) {
  return methods.find((method) => {
    if (method.id != null && String(method.id) === key) return true
    return method.code === key
  }) || null
}

function buildEmptyFormState() {
  return {
    currencyCode: '',
    methodKey: '',
    label: '',
    isDefault: false,
  }
}

export default function PayoutProfilesPage() {
  const { language } = useI18n()
  const copy = useMemo(() => getMoneyCopy(language), [language])
  const [profiles, setProfiles] = useState([])
  const [profilesStatus, setProfilesStatus] = useState('loading')
  const [profilesError, setProfilesError] = useState('')
  const [reloadToken, setReloadToken] = useState(0)
  const [currencies, setCurrencies] = useState([])
  const [methods, setMethods] = useState([])
  const [methodsStatus, setMethodsStatus] = useState('idle')
  const [methodsError, setMethodsError] = useState('')
  const [formState, setFormState] = useState(buildEmptyFormState)
  const [fieldValues, setFieldValues] = useState({})
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitStatus, setSubmitStatus] = useState('idle')
  const [submitError, setSubmitError] = useState('')
  const [busyProfileId, setBusyProfileId] = useState('')
  const [editingProfileId, setEditingProfileId] = useState('')

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

    loadCurrencies()

    return () => {
      active = false
    }
  }, [])

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
  }, [copy.payoutProfiles.loadError, reloadToken])

  useEffect(() => {
    let active = true

    if (!formState.currencyCode) {
      setMethods([])
      setMethodsStatus('idle')
      setMethodsError('')
      return () => {
        active = false
      }
    }

    async function loadMethods() {
      setMethods([])
      setMethodsStatus('loading')
      setMethodsError('')

      try {
        const response = await getWithdrawalMethods(formState.currencyCode)
        if (!active) return
        setMethods(
          (Array.isArray(response?.data) ? response.data : [])
            .map(normalizeWithdrawalMethod)
            .filter(Boolean)
        )
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
  }, [copy.withdrawals.loadError, formState.currencyCode])

  const selectedMethod = useMemo(
    () => findMethodByKey(methods, formState.methodKey),
    [formState.methodKey, methods]
  )
  const editingProfile = useMemo(
    () => profiles.find((profile) => getEntityId(profile) === editingProfileId) || null,
    [editingProfileId, profiles]
  )

  useEffect(() => {
    if (!selectedMethod) {
      setFieldValues({})
      setFieldErrors({})
      return
    }

    if (editingProfile) {
      setFieldValues(getMethodFieldValues(selectedMethod, editingProfile.requisites, copy))
      setFieldErrors({})
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
  }, [copy, editingProfile, selectedMethod])

  const groupedProfiles = useMemo(() => {
    const groups = new Map()

    profiles.forEach((profile) => {
      const groupKey = profile.methodTitle || copy.payoutProfiles.groupFallback
      if (!groups.has(groupKey)) groups.set(groupKey, [])
      groups.get(groupKey).push(profile)
    })

    return Array.from(groups.entries())
      .map(([title, items]) => ({
        title,
        items: [...items].sort((left, right) => {
          if (left.isDefault !== right.isDefault) return left.isDefault ? -1 : 1
          return (left.label || '').localeCompare(right.label || '')
        }),
      }))
      .sort((left, right) => left.title.localeCompare(right.title))
  }, [copy.payoutProfiles.groupFallback, profiles])

  const resetForm = () => {
    setEditingProfileId('')
    setFormState(buildEmptyFormState())
    setFieldValues({})
    setFieldErrors({})
    setSubmitError('')
  }

  const startEdit = (profile) => {
    setEditingProfileId(getEntityId(profile))
    setFormState({
      currencyCode: profile.currencyCode || '',
      methodKey: profile.methodCode || '',
      label: profile.label || '',
      isDefault: Boolean(profile.isDefault),
    })
    setFieldValues({})
    setFieldErrors({})
    setSubmitError('')
  }

  const handleSave = async () => {
    setSubmitError('')
    setFieldErrors({})

    if (!formState.currencyCode) {
      setSubmitError(copy.withdrawals.currencyRequired)
      return
    }

    if (!selectedMethod) {
      setSubmitError(copy.withdrawals.methodRequired)
      return
    }

    if (!formState.label.trim()) {
      setFieldErrors({ label: copy.withdrawals.labelRequired })
      setSubmitError(copy.payoutProfiles.saveError)
      return
    }

    const errors = validateMethodFieldValues(selectedMethod, fieldValues, copy)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setSubmitError(copy.withdrawals.requisitesRequired)
      return
    }

    setSubmitStatus('loading')
    try {
      if (editingProfileId) {
        await updatePayoutProfile(
          editingProfileId,
          buildUpdatePayoutProfilePayload({
            method: selectedMethod,
            label: formState.label.trim(),
            values: fieldValues,
            copy,
          })
        )

        if (formState.isDefault && !editingProfile?.isDefault) {
          await markDefaultPayoutProfile(editingProfileId)
        }
      } else {
        await createPayoutProfile(
          buildCreatePayoutProfilePayload({
            method: selectedMethod,
            label: formState.label.trim(),
            values: fieldValues,
            isDefault: formState.isDefault,
            copy,
          })
        )
      }

      resetForm()
      setReloadToken((value) => value + 1)
    } catch (error) {
      setSubmitError(getErrorMessage(error, copy.payoutProfiles.saveError))
    } finally {
      setSubmitStatus('idle')
    }
  }

  const handleDelete = async (profile) => {
    const profileId = getEntityId(profile)
    if (!profileId) return
    if (!window.confirm(copy.payoutProfiles.deleteConfirm)) return

    setBusyProfileId(profileId)
    try {
      await deletePayoutProfile(profileId)
      if (editingProfileId === profileId) resetForm()
      setReloadToken((value) => value + 1)
    } catch (error) {
      setProfilesError(getErrorMessage(error, copy.payoutProfiles.deleteError))
    } finally {
      setBusyProfileId('')
    }
  }

  const handleMakeDefault = async (profile) => {
    const profileId = getEntityId(profile)
    if (!profileId) return

    setBusyProfileId(profileId)
    try {
      await markDefaultPayoutProfile(profileId)
      setReloadToken((value) => value + 1)
    } catch (error) {
      setProfilesError(getErrorMessage(error, copy.payoutProfiles.defaultError))
    } finally {
      setBusyProfileId('')
    }
  }

  return (
    <div className="account-page money-page">
      <MoneyPageHeader
        eyebrow={copy.common.profile}
        title={copy.payoutProfiles.title}
        subtitle={copy.payoutProfiles.subtitle}
        actions={
          <Button type="button" onClick={resetForm}>
            {copy.payoutProfiles.createAction}
          </Button>
        }
      />

      <div className="money-split-grid">
        <div className="card money-section-card">
          <div className="money-section-card__head">
            <div>
              <div className="money-section-card__title">{copy.payoutProfiles.listTitle}</div>
              <div className="money-section-card__subtitle">{copy.payoutProfiles.setDefaultHint}</div>
            </div>
          </div>

          {profilesStatus === 'loading' ? <div className="muted">{copy.common.loading}</div> : null}
          {profilesStatus === 'error' ? <div className="error">{profilesError}</div> : null}
          {profilesStatus === 'ready' && groupedProfiles.length === 0 ? (
            <MoneyStateCard
              title={copy.payoutProfiles.emptyTitle}
              text={copy.payoutProfiles.emptyText}
            />
          ) : null}

          {profilesStatus === 'ready' && groupedProfiles.length > 0 ? (
            <div className="money-group-list">
              {groupedProfiles.map((group) => (
                <div className="money-group" key={group.title}>
                  <div className="money-group__title">{group.title}</div>
                  <div className="money-profile-list">
                    {group.items.map((profile) => {
                      const profileId = getEntityId(profile)
                      const isBusy = busyProfileId === profileId
                      const isEditing = editingProfileId === profileId
                      return (
                        <div
                          className={`money-profile-card${isEditing ? ' is-editing' : ''}`}
                          key={profileId}
                        >
                          <div className="money-profile-card__head">
                            <div>
                              <div className="money-profile-card__title">
                                {profile.label || copy.common.notAvailable}
                                {profile.isDefault ? (
                                  <span className="money-badge">{copy.payoutProfiles.defaultBadge}</span>
                                ) : null}
                              </div>
                              <div className="money-profile-card__meta">
                                {profile.currencyCode} • {maskPayoutProfile(profile) || copy.common.notAvailable}
                              </div>
                            </div>
                          </div>
                          <div className="money-profile-card__actions">
                            <button
                              type="button"
                              className="money-text-link"
                              onClick={() => startEdit(profile)}
                            >
                              {copy.common.edit}
                            </button>
                            {!profile.isDefault ? (
                              <button
                                type="button"
                                className="money-text-link"
                                onClick={() => handleMakeDefault(profile)}
                                disabled={isBusy}
                              >
                                {copy.common.makeDefault}
                              </button>
                            ) : null}
                            <button
                              type="button"
                              className="money-text-link money-text-link--danger"
                              onClick={() => handleDelete(profile)}
                              disabled={isBusy}
                            >
                              {copy.common.delete}
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="card money-section-card">
          <div className="money-section-card__head">
            <div>
              <div className="money-section-card__title">
                {editingProfileId ? copy.payoutProfiles.editTitle : copy.payoutProfiles.createTitle}
              </div>
              <div className="money-section-card__subtitle">{copy.payoutProfiles.formSubtitle}</div>
            </div>
            <Button type="button" variant="secondary" onClick={resetForm}>
              {copy.payoutProfiles.resetForm}
            </Button>
          </div>

          <div className="money-helper-text">{copy.payoutProfiles.methodHelp}</div>

          <div className="money-form-grid">
            <label className="field">
              <span className="field__label">{copy.methodFields.currencyLabel}</span>
              <select
                className="input"
                value={formState.currencyCode}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    currencyCode: event.target.value,
                    methodKey: '',
                  }))
                }
              >
                <option value="">{copy.methodFields.currencyPlaceholder}</option>
                {currencies.map((currencyCode) => (
                  <option key={currencyCode} value={currencyCode}>
                    {currencyCode}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span className="field__label">{copy.methodFields.methodLabel}</span>
              <select
                className="input"
                value={formState.methodKey}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    methodKey: event.target.value,
                  }))
                }
                disabled={!formState.currencyCode || methodsStatus === 'loading'}
              >
                <option value="">{copy.methodFields.methodPlaceholder}</option>
                {methods.map((method) => (
                  <option key={getMethodKey(method)} value={getMethodKey(method)}>
                    {method.title}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {methodsError ? <div className="error small">{methodsError}</div> : null}

          <label className="field">
            <span className="field__label">{copy.common.label}</span>
            <input
              className="input"
              type="text"
              value={formState.label}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  label: event.target.value,
                }))
              }
              placeholder={copy.methodFields.profilePlaceholder}
            />
            {fieldErrors.label ? <span className="money-form-error">{fieldErrors.label}</span> : null}
          </label>

          {selectedMethod ? (
            <MoneyRequisitesFields
              method={selectedMethod}
              values={fieldValues}
              errors={fieldErrors}
              onChange={(name, value) =>
                setFieldValues((current) => ({
                  ...current,
                  [name]: value,
                }))
              }
              copy={copy}
            />
          ) : null}

          <label className="money-checkbox">
            <input
              type="checkbox"
              checked={formState.isDefault}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  isDefault: event.target.checked,
                }))
              }
            />
            <span>{copy.common.makeDefault}</span>
          </label>

          {submitError ? <div className="error">{submitError}</div> : null}

          <div className="money-form-actions">
            <Button type="button" onClick={handleSave} disabled={submitStatus === 'loading'}>
              {submitStatus === 'loading' ? copy.common.saving : copy.common.save}
            </Button>
            {editingProfileId ? (
              <Button type="button" variant="secondary" onClick={resetForm}>
                {copy.common.cancel}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
