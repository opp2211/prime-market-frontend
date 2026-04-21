import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  createOffer,
  getGameCategories,
  getGames,
  getOffer,
  getOfferSchema,
  updateOffer,
} from '../../api/offers'
import { useI18n } from '../../app/i18n'
import { getErrorMessage } from '../../shared/lib/errors'
import { getOfferCopy } from './offerCopy'
import {
  formatOfferPrice,
  resolveOfferSideLabel,
  resolveOfferStatusLabel,
  resolveOfferStatusTone,
} from './offerPresentation'
import {
  buildCreateOfferPayload,
  buildPatchOfferPayload,
  createEmptyOfferFormState,
  getTradeFieldMap,
  mapOfferToFormState,
  syncFormStateWithSchema,
  validateOfferForm,
} from './offerFormUtils'

const PRICE_CURRENCY_OPTIONS = ['USD', 'EUR', 'GBP', 'RUB']
const FORM_STEP_KEYS = ['main', 'context', 'attributes', 'trade', 'publication']

function removeErrorKeys(state, keys) {
  if (!keys.length) return state
  let changed = false
  const next = { ...state }
  for (const key of keys) {
    if (key in next) {
      delete next[key]
      changed = true
    }
  }
  return changed ? next : state
}

function resetSchemaDrivenState(base) {
  return {
    ...base,
    contexts: {},
    attributes: {},
    deliveryMethods: [],
    quantity: '',
    minTradeQuantity: '',
    maxTradeQuantity: '',
    quantityStep: '',
    tradeTerms: '',
  }
}

function Field({ label, hint, error, required, children }) {
  return (
    <label className="field offer-field">
      <span className="field__label offer-field__label">
        {label}
        {required ? <span className="offer-field__required"> *</span> : null}
      </span>
      {children}
      {hint ? <span className="offer-field__hint">{hint}</span> : null}
      {error ? <span className="field__error">{error}</span> : null}
    </label>
  )
}

function SectionCard({ title, description, children }) {
  return (
    <section className="card offer-section">
      <div className="offer-section__head">
        <div className="offer-section__title">{title}</div>
        <p className="offer-section__description">{description}</p>
      </div>
      <div className="offer-section__body">{children}</div>
    </section>
  )
}

function PillChoiceGroup({ options, value, onChange }) {
  return (
    <div className="offer-choice-group">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`offer-choice ${value === option.value ? ' is-active' : ''}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

function MultiPillGroup({ options, value, onToggle, variant = 'default', copy }) {
  return (
    <div className={`offer-pill-grid offer-pill-grid--${variant}`}>
      {options.map((option) => {
        const isActive = value.includes(option.slug)
        return (
          <button
            key={option.slug}
            type="button"
            className={`offer-pill offer-pill--${variant} ${isActive ? ' is-active' : ''}`}
            onClick={() => onToggle(option.slug)}
          >
            <span className="offer-pill__title">{option.title}</span>
            {variant === 'delivery' ? (
              <span className="offer-pill__meta">
                {isActive ? copy.common.selected : copy.common.available}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

function BooleanField({ label, hint, value, error, onChange }) {
  return (
    <div className="offer-boolean">
      <label className={`offer-switch ${value === true ? ' is-active' : ''}`}>
        <input
          type="checkbox"
          checked={value === true}
          onChange={(event) => onChange(event.target.checked ? true : false)}
        />
        <span className="offer-switch__track">
          <span className="offer-switch__thumb" />
        </span>
        <span className="offer-switch__copy">{label}</span>
      </label>
      {hint ? <div className="offer-field__hint">{hint}</div> : null}
      {error ? <div className="field__error">{error}</div> : null}
    </div>
  )
}

function SummaryItem({ label, value }) {
  return (
    <div className="offer-summary__item">
      <div className="offer-summary__label">{label}</div>
      <div className="offer-summary__value">{value}</div>
    </div>
  )
}

function resolveOptionTitle(options, slug, fallback) {
  return options.find((option) => option?.slug === slug)?.title || fallback
}

function formatContextSummary(schema, formState, copy) {
  const items = (Array.isArray(schema?.contexts) ? schema.contexts : [])
    .map((context) => {
      const valueSlug = formState.contexts?.[context.slug]
      if (!valueSlug) return null
      const optionTitle = resolveOptionTitle(
        Array.isArray(context.options) ? context.options : [],
        valueSlug,
        valueSlug
      )
      return optionTitle
    })
    .filter(Boolean)

  if (!items.length) return copy.common.noValue
  return items.slice(0, 3).join(' • ')
}

function formatKeyAttributeSummary(schema, formState, copy) {
  for (const attribute of Array.isArray(schema?.attributes) ? schema.attributes : []) {
    const value = formState.attributes?.[attribute.slug]
    if (attribute.dataType === 'select' && value) {
      const optionTitle = resolveOptionTitle(
        Array.isArray(attribute.options) ? attribute.options : [],
        value,
        value
      )
      return `${attribute.title}: ${optionTitle}`
    }

    if (attribute.dataType === 'multiselect' && Array.isArray(value) && value.length > 0) {
      const optionTitles = value
        .map((slug) =>
          resolveOptionTitle(Array.isArray(attribute.options) ? attribute.options : [], slug, slug)
        )
        .filter(Boolean)
      if (optionTitles.length > 0) {
        return `${attribute.title}: ${optionTitles.slice(0, 2).join(', ')}`
      }
    }

    if (attribute.dataType === 'boolean' && typeof value === 'boolean') {
      return `${attribute.title}: ${value ? copy.common.yes : copy.common.no}`
    }

    if ((attribute.dataType === 'text' || attribute.dataType === 'number') && `${value || ''}`.trim()) {
      return `${attribute.title}: ${value}`
    }
  }

  return copy.common.noValue
}

function formatDeliverySummary(schema, formState, copy) {
  const options = Array.isArray(schema?.deliveryMethods) ? schema.deliveryMethods : []
  const selected = (Array.isArray(formState.deliveryMethods) ? formState.deliveryMethods : [])
    .map((slug) => resolveOptionTitle(options, slug, slug))
    .filter(Boolean)

  if (!selected.length) return copy.common.noValue
  if (selected.length === 1) return selected[0]
  return copy.form.deliverySummary(selected.length)
}

function OfferFormSkeleton() {
  return (
    <div className="offer-page offer-page--editor">
      <div className="card offer-hero offer-hero--editor">
        <div className="skeleton offer-skeleton offer-skeleton--tag" />
        <div className="skeleton offer-skeleton offer-skeleton--hero-title" />
        <div className="skeleton offer-skeleton offer-skeleton--hero-subtitle" />
      </div>
      <div className="offer-editor">
        <div className="offer-editor__main">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="card offer-section">
              <div className="skeleton offer-skeleton offer-skeleton--section-title" />
              <div className="offer-section__body offer-section__body--skeleton">
                <div className="skeleton offer-skeleton offer-skeleton--field" />
                <div className="skeleton offer-skeleton offer-skeleton--field" />
                <div className="skeleton offer-skeleton offer-skeleton--field" />
              </div>
            </div>
          ))}
        </div>
        <aside className="offer-editor__aside">
          <div className="card offer-summary">
            <div className="skeleton offer-skeleton offer-skeleton--section-title" />
            <div className="skeleton offer-skeleton offer-skeleton--field" />
            <div className="skeleton offer-skeleton offer-skeleton--field" />
          </div>
        </aside>
      </div>
    </div>
  )
}

export default function OfferForm({ mode, offerId }) {
  const isEdit = mode === 'edit'
  const navigate = useNavigate()
  const { language } = useI18n()
  const copy = getOfferCopy(language)

  const [games, setGames] = useState([])
  const [gamesStatus, setGamesStatus] = useState('loading')
  const [gamesError, setGamesError] = useState('')

  const [categories, setCategories] = useState([])
  const [categoriesStatus, setCategoriesStatus] = useState('idle')
  const [categoriesError, setCategoriesError] = useState('')

  const [schema, setSchema] = useState(null)
  const [schemaStatus, setSchemaStatus] = useState('idle')
  const [schemaError, setSchemaError] = useState('')

  const [initialOffer, setInitialOffer] = useState(null)
  const [offerStatus, setOfferStatus] = useState(isEdit ? 'loading' : 'ready')
  const [offerError, setOfferError] = useState('')

  const [formState, setFormState] = useState(createEmptyOfferFormState)
  const [errors, setErrors] = useState({})
  const [submitStatus, setSubmitStatus] = useState('idle')
  const [submitError, setSubmitError] = useState('')

  const [gamesReloadKey, setGamesReloadKey] = useState(0)
  const [categoriesReloadKey, setCategoriesReloadKey] = useState(0)
  const [schemaReloadKey, setSchemaReloadKey] = useState(0)
  const [offerReloadKey, setOfferReloadKey] = useState(0)

  useEffect(() => {
    let active = true

    const loadGames = async () => {
      setGamesStatus('loading')
      setGamesError('')
      try {
        const res = await getGames()
        if (!active) return
        setGames(Array.isArray(res?.data) ? res.data : [])
        setGamesStatus('ready')
      } catch (err) {
        if (!active) return
        setGamesError(getErrorMessage(err, copy.common.gamesError))
        setGamesStatus('error')
      }
    }

    loadGames()

    return () => {
      active = false
    }
  }, [copy.common.gamesError, gamesReloadKey])

  useEffect(() => {
    if (!isEdit || !offerId) return undefined

    let active = true

    const loadOffer = async () => {
      setOfferStatus('loading')
      setOfferError('')
      try {
        const res = await getOffer(offerId)
        if (!active) return
        setInitialOffer(res?.data || null)
        setFormState(mapOfferToFormState(res?.data))
        setOfferStatus('ready')
      } catch (err) {
        if (!active) return
        setOfferError(getErrorMessage(err, copy.common.loadOfferError))
        setOfferStatus('error')
      }
    }

    loadOffer()

    return () => {
      active = false
    }
  }, [copy.common.loadOfferError, isEdit, offerId, offerReloadKey])

  useEffect(() => {
    let active = true
    const gameSlug = formState.gameSlug

    if (!gameSlug) {
      setCategories([])
      setCategoriesStatus('idle')
      setCategoriesError('')
      return () => {
        active = false
      }
    }

    const loadCategories = async () => {
      setCategoriesStatus('loading')
      setCategoriesError('')
      try {
        const res = await getGameCategories(gameSlug)
        if (!active) return
        setCategories(Array.isArray(res?.data) ? res.data : [])
        setCategoriesStatus('ready')
      } catch (err) {
        if (!active) return
        setCategories([])
        setCategoriesError(getErrorMessage(err, copy.common.categoriesError))
        setCategoriesStatus('error')
      }
    }

    loadCategories()

    return () => {
      active = false
    }
  }, [categoriesReloadKey, copy.common.categoriesError, formState.gameSlug])

  useEffect(() => {
    let active = true

    if (!formState.gameSlug || !formState.categorySlug) {
      setSchema(null)
      setSchemaStatus('idle')
      setSchemaError('')
      return () => {
        active = false
      }
    }

    const loadSchema = async () => {
      setSchemaStatus('loading')
      setSchemaError('')
      try {
        const res = await getOfferSchema(formState.gameSlug, formState.categorySlug)
        if (!active) return
        const nextSchema = res?.data || null
        setSchema(nextSchema)
        setFormState((current) => syncFormStateWithSchema(current, nextSchema))
        setSchemaStatus('ready')
      } catch (err) {
        if (!active) return
        setSchema(null)
        setSchemaError(getErrorMessage(err, copy.common.schemaError))
        setSchemaStatus('error')
      }
    }

    loadSchema()

    return () => {
      active = false
    }
  }, [copy.common.schemaError, formState.categorySlug, formState.gameSlug, schemaReloadKey])

  const gameOptions = useMemo(() => {
    if (games.length > 0) return games
    if (initialOffer?.game) {
      return [
        {
          id: initialOffer.gameId,
          slug: initialOffer.game.slug,
          title: initialOffer.game.title,
        },
      ]
    }
    return []
  }, [games, initialOffer])

  const categoryOptions = useMemo(() => {
    if (categories.length > 0) return categories
    if (initialOffer?.category && formState.gameSlug === initialOffer?.game?.slug) {
      return [
        {
          id: initialOffer.categoryId,
          slug: initialOffer.category.slug,
          title: initialOffer.category.title,
        },
      ]
    }
    return []
  }, [categories, formState.gameSlug, initialOffer])

  const selectedGame =
    gameOptions.find((game) => String(game.id) === formState.gameId) ||
    gameOptions.find((game) => game.slug === formState.gameSlug) ||
    null

  const selectedCategory =
    categoryOptions.find((category) => String(category.id) === formState.categoryId) ||
    categoryOptions.find((category) => category.slug === formState.categorySlug) ||
    null

  const tradeFieldMap = getTradeFieldMap(schema)
  const patchPayload =
    isEdit && initialOffer && schema
      ? buildPatchOfferPayload(initialOffer, formState, schema)
      : null
  const isDirty = Boolean(patchPayload && Object.keys(patchPayload).length > 0)

  const isBlockingLoad =
    (isEdit && offerStatus === 'loading') ||
    (gamesStatus === 'loading' && gameOptions.length === 0)

  const summaryStatus = isEdit ? formState.status : 'active'
  const statusLabel = resolveOfferStatusLabel(summaryStatus, language)
  const sideLabel = resolveOfferSideLabel(formState.side, language)
  const priceLabel = formatOfferPrice(
    formState.priceAmount,
    formState.priceCurrencyCode,
    language
  )

  const tradeFieldCount = Object.values(tradeFieldMap).filter((field) => field?.isVisible).length
  const hasVolumeFields =
    tradeFieldMap.quantity?.isVisible ||
    tradeFieldMap['min-trade-quantity']?.isVisible ||
    tradeFieldMap['max-trade-quantity']?.isVisible ||
    tradeFieldMap['quantity-step']?.isVisible
  const hasSchemaContent =
    (Array.isArray(schema?.contexts) ? schema.contexts.length : 0) +
      (Array.isArray(schema?.attributes) ? schema.attributes.length : 0) +
      tradeFieldCount >
    0

  const sideOptions = [
    { value: 'sell', label: copy.side.sell },
    { value: 'buy', label: copy.side.buy },
  ]
  const publicationStatusLabel = isEdit
    ? copy.common.currentStatus
    : copy.form.createPublicationLabel
  const publicationBodyText = isEdit
    ? copy.common.publishFromList
    : copy.form.createPublicationHelper
  const publicationMetaText = isEdit ? copy.form.editHint : copy.form.createHint
  const summaryStatusItemLabel = isEdit
    ? copy.common.currentStatus
    : copy.form.createSummaryStatusLabel
  const readinessIssues = schema ? Object.keys(validateOfferForm(formState, schema, copy)).length : 0
  const readinessLabel = !schema
    ? copy.form.selectGameAndCategory
    : readinessIssues === 0
      ? copy.form.readyToPublish
      : copy.form.fieldsLeft(readinessIssues)
  const keyAttributeSummary = formatKeyAttributeSummary(schema, formState, copy)
  const contextSummary = formatContextSummary(schema, formState, copy)
  const deliverySummary = formatDeliverySummary(schema, formState, copy)
  const quantitySummary = formState.quantity || copy.common.noValue

  function clearErrors(...keys) {
    setErrors((current) => removeErrorKeys(current, keys))
  }

  function handleGameChange(event) {
    const nextId = event.target.value
    const nextGame = gameOptions.find((item) => String(item.id) === nextId) || null
    setFormState((current) =>
      resetSchemaDrivenState({
        ...current,
        gameId: nextId,
        gameSlug: nextGame?.slug || '',
        categoryId: '',
        categorySlug: '',
      })
    )
    setCategories([])
    setSchema(null)
    clearErrors('gameId', 'categoryId')
  }

  function handleCategoryChange(event) {
    const nextId = event.target.value
    const nextCategory =
      categoryOptions.find((item) => String(item.id) === nextId) || null
    setFormState((current) =>
      resetSchemaDrivenState({
        ...current,
        categoryId: nextId,
        categorySlug: nextCategory?.slug || '',
      })
    )
    setSchema(null)
    clearErrors('categoryId')
  }

  function handleFieldChange(field, value) {
    setFormState((current) => ({ ...current, [field]: value }))
    clearErrors(field)
  }

  function handleCurrencyChange(event) {
    handleFieldChange('priceCurrencyCode', event.target.value.toUpperCase())
  }

  function handleContextChange(slug, value) {
    setFormState((current) => ({
      ...current,
      contexts: {
        ...current.contexts,
        [slug]: value,
      },
    }))
    clearErrors(`context:${slug}`)
  }

  function handleAttributeChange(slug, value) {
    setFormState((current) => ({
      ...current,
      attributes: {
        ...current.attributes,
        [slug]: value,
      },
    }))
    clearErrors(`attribute:${slug}`)
  }

  function toggleAttributeOption(slug, optionSlug) {
    setFormState((current) => {
      const currentValue = Array.isArray(current.attributes?.[slug])
        ? current.attributes[slug]
        : []
      const nextValue = currentValue.includes(optionSlug)
        ? currentValue.filter((item) => item !== optionSlug)
        : [...currentValue, optionSlug]
      return {
        ...current,
        attributes: {
          ...current.attributes,
          [slug]: nextValue,
        },
      }
    })
    clearErrors(`attribute:${slug}`)
  }

  function toggleDeliveryMethod(slug) {
    setFormState((current) => {
      const currentValue = Array.isArray(current.deliveryMethods) ? current.deliveryMethods : []
      const nextValue = currentValue.includes(slug)
        ? currentValue.filter((item) => item !== slug)
        : [...currentValue, slug]
      return {
        ...current,
        deliveryMethods: nextValue,
      }
    })
    clearErrors('deliveryMethods')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (submitStatus === 'loading') return

    setSubmitError('')

    if (!schema) {
      setSubmitError(copy.common.schemaPending)
      return
    }

    const nextErrors = validateOfferForm(formState, schema, copy)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    if (isEdit && !isDirty) {
      setSubmitError(copy.form.validation.noChanges)
      return
    }

    setSubmitStatus('loading')

    try {
      if (isEdit) {
        await updateOffer(offerId, patchPayload)
        navigate('/dashboard/offers', {
          replace: true,
          state: { offerNotice: copy.common.saveSuccess },
        })
      } else {
        const payload = buildCreateOfferPayload(formState, schema)
        await createOffer(payload)
        navigate('/dashboard/offers', {
          replace: true,
          state: { offerNotice: copy.common.createSuccess },
        })
      }
    } catch (err) {
      setSubmitError(
        getErrorMessage(err, isEdit ? copy.common.saveError : copy.common.createError)
      )
    } finally {
      setSubmitStatus('idle')
    }
  }

  if (isBlockingLoad) {
    return <OfferFormSkeleton />
  }

  if (isEdit && offerStatus === 'error') {
    return (
      <div className="offer-page offer-page--editor">
        <div className="card offer-state offer-state--error">
          <div className="offer-state__title">{offerError}</div>
          <div className="offer-state__actions">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => setOfferReloadKey((value) => value + 1)}
            >
              {copy.form.retryOffer}
            </button>
            <Link to="/dashboard/offers" className="btn btn--ghost">
              {copy.common.backToList}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form className="offer-page offer-page--editor" onSubmit={handleSubmit}>
      <div className="card offer-hero offer-hero--editor">
        <Link to="/dashboard/offers" className="offer-back-link">
          <span aria-hidden="true">←</span>
          {copy.common.backToList}
        </Link>
        <div className="offer-hero__content">
          <span className="offer-hero__eyebrow">{copy.navLabel}</span>
          <h1 className="h1 account-page__title">
            {isEdit ? copy.form.editTitle : copy.form.createTitle}
          </h1>
          <p className="offer-hero__subtitle">
            {isEdit ? copy.form.editSubtitle : copy.form.createSubtitle}
          </p>
        </div>
        <div className="offer-steps">
          {FORM_STEP_KEYS.map((stepKey, index) => (
            <div key={stepKey} className="offer-step">
              <span className="offer-step__num">{index + 1}</span>
              <span className="offer-step__label">{copy.form.sections[stepKey]}</span>
            </div>
          ))}
        </div>
        <div className="offer-hero__glow" aria-hidden="true" />
      </div>

      <div className="offer-editor">
        <div className="offer-editor__main">
          {gamesError ? (
            <div className="error offer-inline-banner">
              {gamesError}
              <button
                type="button"
                className="btn btn--ghost offer-inline-banner__action"
                onClick={() => setGamesReloadKey((value) => value + 1)}
              >
                {copy.common.retry}
              </button>
            </div>
          ) : null}

          <SectionCard
            title={copy.form.sections.main}
            description={copy.form.sectionDescriptions.main}
          >
            <div className="offer-form-grid offer-form-grid--2">
              <Field label={copy.form.fields.game} error={errors.gameId} required>
                <select
                  className="input"
                  value={formState.gameId}
                  onChange={handleGameChange}
                  disabled={gamesStatus === 'loading'}
                >
                  <option value="">{copy.form.fields.game}</option>
                  {gameOptions.map((game) => (
                    <option key={game.id} value={game.id}>
                      {game.title}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label={copy.form.fields.category} error={errors.categoryId} required>
                <select
                  className="input"
                  value={formState.categoryId}
                  onChange={handleCategoryChange}
                  disabled={!formState.gameSlug || categoriesStatus === 'loading'}
                >
                  <option value="">{copy.form.fields.category}</option>
                  {categoryOptions.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.title}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            {categoriesError ? (
              <div className="error offer-inline-banner">
                {categoriesError}
                <button
                  type="button"
                  className="btn btn--ghost offer-inline-banner__action"
                  onClick={() => setCategoriesReloadKey((value) => value + 1)}
                >
                  {copy.common.retry}
                </button>
              </div>
            ) : null}

            <div className="offer-form-grid offer-form-grid--1">
              <Field label={copy.form.fields.side} error={errors.side} required>
                <PillChoiceGroup
                  options={sideOptions}
                  value={formState.side}
                  onChange={(value) => handleFieldChange('side', value)}
                />
              </Field>

              <Field
                label={copy.form.fields.title}
                hint={copy.form.helpers.title}
                error={errors.title}
              >
                <input
                  className="input"
                  value={formState.title}
                  onChange={(event) => handleFieldChange('title', event.target.value)}
                  placeholder={copy.form.fields.title}
                />
              </Field>

              <Field
                label={copy.form.fields.description}
                hint={copy.form.helpers.description}
                error={errors.description}
              >
                <textarea
                  className="input offer-textarea"
                  value={formState.description}
                  onChange={(event) => handleFieldChange('description', event.target.value)}
                  placeholder={copy.form.fields.description}
                />
              </Field>

              <div className="notice offer-inline-note">{copy.common.changeResetHint}</div>
            </div>
          </SectionCard>

          <SectionCard
            title={copy.form.sections.context}
            description={copy.form.sectionDescriptions.context}
          >
            {!formState.gameSlug || !formState.categorySlug ? (
              <div className="notice">{copy.common.schemaPending}</div>
            ) : null}

            {schemaStatus === 'loading' ? (
              <div className="offer-section__loading">
                <div className="skeleton offer-skeleton offer-skeleton--field" />
                <div className="skeleton offer-skeleton offer-skeleton--field" />
              </div>
            ) : null}

            {schemaError ? (
              <div className="error offer-inline-banner">
                {schemaError}
                <button
                  type="button"
                  className="btn btn--ghost offer-inline-banner__action"
                  onClick={() => setSchemaReloadKey((value) => value + 1)}
                >
                  {copy.common.retry}
                </button>
              </div>
            ) : null}

            {schemaStatus === 'ready' &&
            Array.isArray(schema?.contexts) &&
            schema.contexts.length > 0 ? (
              <div className="offer-form-grid offer-form-grid--2">
                {schema.contexts.map((context) => (
                  <Field
                    key={context.slug}
                    label={context.title}
                    error={errors[`context:${context.slug}`]}
                    required={Boolean(context.isRequired)}
                  >
                    <select
                      className="input"
                      value={formState.contexts?.[context.slug] || ''}
                      onChange={(event) =>
                        handleContextChange(context.slug, event.target.value)
                      }
                    >
                      <option value="">
                        {context.isRequired ? context.title : copy.common.optional}
                      </option>
                      {(Array.isArray(context.options) ? context.options : []).map((option) => (
                        <option key={option.slug} value={option.slug}>
                          {option.title}
                        </option>
                      ))}
                    </select>
                  </Field>
                ))}
              </div>
            ) : null}

            {schemaStatus === 'ready' &&
            (!Array.isArray(schema?.contexts) || schema.contexts.length === 0) ? (
              <div className="notice">{copy.common.schemaEmpty}</div>
            ) : null}
          </SectionCard>

          <SectionCard
            title={copy.form.sections.attributes}
            description={copy.form.sectionDescriptions.attributes}
          >
            {schemaStatus === 'ready' &&
            Array.isArray(schema?.attributes) &&
            schema.attributes.length > 0 ? (
              <div className="offer-form-grid offer-form-grid--2">
                {schema.attributes.map((attribute) => {
                  const errorKey = `attribute:${attribute.slug}`
                  const value = formState.attributes?.[attribute.slug]

                  if (attribute.dataType === 'select') {
                    return (
                      <Field
                        key={attribute.slug}
                        label={attribute.title}
                        error={errors[errorKey]}
                        required={Boolean(attribute.isRequired)}
                      >
                        <select
                          className="input"
                          value={value || ''}
                          onChange={(event) =>
                            handleAttributeChange(attribute.slug, event.target.value)
                          }
                        >
                          <option value="">
                            {attribute.isRequired ? attribute.title : copy.common.optional}
                          </option>
                          {(Array.isArray(attribute.options) ? attribute.options : []).map(
                            (option) => (
                              <option key={option.slug} value={option.slug}>
                                {option.title}
                              </option>
                            )
                          )}
                        </select>
                      </Field>
                    )
                  }

                  if (attribute.dataType === 'multiselect') {
                    return (
                      <div key={attribute.slug} className="offer-grouped-field">
                        <div className="field__label offer-field__label">
                          {attribute.title}
                          {attribute.isRequired ? (
                            <span className="offer-field__required"> *</span>
                          ) : null}
                        </div>
                        <MultiPillGroup
                          options={Array.isArray(attribute.options) ? attribute.options : []}
                          value={Array.isArray(value) ? value : []}
                          onToggle={(optionSlug) =>
                            toggleAttributeOption(attribute.slug, optionSlug)
                          }
                          copy={copy}
                        />
                        {errors[errorKey] ? (
                          <span className="field__error">{errors[errorKey]}</span>
                        ) : null}
                      </div>
                    )
                  }

                  if (attribute.dataType === 'number') {
                    return (
                      <Field
                        key={attribute.slug}
                        label={attribute.title}
                        error={errors[errorKey]}
                        required={Boolean(attribute.isRequired)}
                      >
                        <input
                          className="input"
                          type="number"
                          min="0"
                          step="0.01"
                          value={value || ''}
                          onChange={(event) =>
                            handleAttributeChange(attribute.slug, event.target.value)
                          }
                        />
                      </Field>
                    )
                  }

                  if (attribute.dataType === 'boolean') {
                    return (
                      <BooleanField
                        key={attribute.slug}
                        label={attribute.title}
                        value={typeof value === 'boolean' ? value : null}
                        error={errors[errorKey]}
                        onChange={(nextValue) =>
                          handleAttributeChange(attribute.slug, nextValue)
                        }
                      />
                    )
                  }

                  return (
                    <Field
                      key={attribute.slug}
                      label={attribute.title}
                      error={errors[errorKey]}
                      required={Boolean(attribute.isRequired)}
                    >
                      <input
                        className="input"
                        value={value || ''}
                        onChange={(event) =>
                          handleAttributeChange(attribute.slug, event.target.value)
                        }
                      />
                    </Field>
                  )
                })}
              </div>
            ) : null}

            {schemaStatus === 'ready' &&
            (!Array.isArray(schema?.attributes) || schema.attributes.length === 0) ? (
              <div className="notice">{copy.common.schemaEmpty}</div>
            ) : null}
          </SectionCard>

          <SectionCard
            title={copy.form.sections.trade}
            description={copy.form.sectionDescriptions.trade}
          >
            <div className="offer-trade-stack">
              <div className="offer-trade-group">
                <div className="offer-trade-group__title">{copy.form.fields.priceAmount}</div>
                <div className="offer-form-grid offer-form-grid--price">
                  <Field
                    label={copy.form.fields.priceAmount}
                    hint={copy.form.helpers.price}
                    error={errors.priceAmount}
                    required
                  >
                    <input
                      className="input"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formState.priceAmount}
                      onChange={(event) => handleFieldChange('priceAmount', event.target.value)}
                    />
                  </Field>

                  <Field
                    label={copy.form.fields.priceCurrencyCode}
                    hint={copy.form.helpers.priceCurrencyCode}
                    error={errors.priceCurrencyCode}
                    required
                  >
                    <>
                      <input
                        className="input"
                        list="offer-price-currency-list"
                        value={formState.priceCurrencyCode}
                        onChange={handleCurrencyChange}
                      />
                      <datalist id="offer-price-currency-list">
                        {PRICE_CURRENCY_OPTIONS.map((code) => (
                          <option key={code} value={code} />
                        ))}
                      </datalist>
                    </>
                  </Field>
                </div>
              </div>

              {hasVolumeFields ? (
                <div className="offer-trade-group">
                  <div className="offer-trade-group__title">{copy.form.fields.quantity}</div>
                  <div className="offer-form-grid offer-form-grid--2 offer-form-grid--trade">
                    {tradeFieldMap.quantity?.isVisible ? (
                      <Field
                        label={copy.form.fields.quantity}
                        error={errors.quantity}
                        required={Boolean(tradeFieldMap.quantity?.isRequired)}
                      >
                        <input
                          className="input"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formState.quantity}
                          onChange={(event) => handleFieldChange('quantity', event.target.value)}
                        />
                      </Field>
                    ) : null}

                    {tradeFieldMap['quantity-step']?.isVisible ? (
                      <Field
                        label={copy.form.fields.quantityStep}
                        error={errors.quantityStep}
                        required={Boolean(tradeFieldMap['quantity-step']?.isRequired)}
                      >
                        <input
                          className="input"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formState.quantityStep}
                          onChange={(event) =>
                            handleFieldChange('quantityStep', event.target.value)
                          }
                        />
                      </Field>
                    ) : null}

                    {tradeFieldMap['min-trade-quantity']?.isVisible ? (
                      <Field
                        label={copy.form.fields.minTradeQuantity}
                        error={errors.minTradeQuantity}
                        required={Boolean(tradeFieldMap['min-trade-quantity']?.isRequired)}
                      >
                        <input
                          className="input"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formState.minTradeQuantity}
                          onChange={(event) =>
                            handleFieldChange('minTradeQuantity', event.target.value)
                          }
                        />
                      </Field>
                    ) : null}

                    {tradeFieldMap['max-trade-quantity']?.isVisible ? (
                      <Field
                        label={copy.form.fields.maxTradeQuantity}
                        error={errors.maxTradeQuantity}
                        required={Boolean(tradeFieldMap['max-trade-quantity']?.isRequired)}
                      >
                        <input
                          className="input"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formState.maxTradeQuantity}
                          onChange={(event) =>
                            handleFieldChange('maxTradeQuantity', event.target.value)
                          }
                        />
                      </Field>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {tradeFieldMap['trade-terms']?.isVisible ? (
                <div className="offer-trade-group">
                  <Field
                    label={copy.form.fields.tradeTerms}
                    hint={copy.form.helpers.tradeTerms}
                    error={errors.tradeTerms}
                    required={Boolean(tradeFieldMap['trade-terms']?.isRequired)}
                  >
                    <textarea
                      className="input offer-textarea"
                      value={formState.tradeTerms}
                      onChange={(event) => handleFieldChange('tradeTerms', event.target.value)}
                    />
                  </Field>
                </div>
              ) : null}

              {tradeFieldMap['delivery-methods']?.isVisible ? (
                <div className="offer-grouped-field offer-grouped-field--delivery">
                  <div className="field__label offer-field__label">
                    {copy.form.fields.deliveryMethods}
                    {tradeFieldMap['delivery-methods']?.isRequired ? (
                      <span className="offer-field__required"> *</span>
                    ) : null}
                  </div>
                  <div className="offer-field__hint">{copy.form.helpers.deliveryMethods}</div>
                  <MultiPillGroup
                    options={Array.isArray(schema?.deliveryMethods) ? schema.deliveryMethods : []}
                    value={Array.isArray(formState.deliveryMethods) ? formState.deliveryMethods : []}
                    onToggle={toggleDeliveryMethod}
                    variant="delivery"
                    copy={copy}
                  />
                  {errors.deliveryMethods ? (
                    <span className="field__error">{errors.deliveryMethods}</span>
                  ) : null}
                </div>
              ) : null}
            </div>

            {schemaStatus === 'ready' && !hasSchemaContent ? (
              <div className="notice">{copy.common.schemaEmpty}</div>
            ) : null}
          </SectionCard>

          <SectionCard
            title={copy.form.sections.publication}
            description={copy.form.sectionDescriptions.publication}
          >
            <div className="offer-publication">
              <div className="offer-publication__status">
                <div className="offer-summary__label">{publicationStatusLabel}</div>
                <span
                  className={`status-chip status-chip--${resolveOfferStatusTone(summaryStatus)}`}
                >
                  {statusLabel}
                </span>
              </div>
              <div className="offer-publication__text">{publicationBodyText}</div>
              <div className="offer-publication__text offer-publication__text--muted">
                {publicationMetaText}
              </div>
            </div>
          </SectionCard>
        </div>

        <aside className="offer-editor__aside">
          <div className="card offer-summary">
            <div className="offer-summary__head">
              <div className="offer-summary__title">{copy.form.overviewTitle}</div>
              <div className="offer-summary__subtitle">{copy.form.overviewSubtitle}</div>
            </div>

            <div className="offer-summary__grid">
              <SummaryItem
                label={copy.form.fields.game}
                value={selectedGame?.title || initialOffer?.game?.title || copy.common.noValue}
              />
              <SummaryItem
                label={copy.form.fields.category}
                value={
                  selectedCategory?.title ||
                  initialOffer?.category?.title ||
                  copy.common.noValue
                }
              />
              <SummaryItem label={copy.form.fields.side} value={sideLabel} />
              <SummaryItem label={copy.form.fields.priceAmount} value={priceLabel} />
              <SummaryItem label={copy.form.fields.quantity} value={quantitySummary} />
              <SummaryItem label={copy.form.keyAttributeLabel} value={keyAttributeSummary} />
              <SummaryItem label={copy.form.contextSummaryLabel} value={contextSummary} />
              <SummaryItem label={copy.form.deliverySummaryLabel} value={deliverySummary} />
              <SummaryItem label={summaryStatusItemLabel} value={statusLabel} />
            </div>

            <div className="offer-summary__meta">
              {isEdit ? (
                <span className={`offer-dirty ${isDirty ? 'is-dirty' : ''}`}>
                  {isDirty ? copy.common.unsavedChanges : copy.common.noUnsavedChanges}
                </span>
              ) : (
                <span className="offer-dirty">{copy.common.notCreatedYet}</span>
              )}
              <span className={`offer-dirty ${readinessIssues === 0 && schema ? 'is-dirty' : ''}`}>
                {readinessLabel}
              </span>
            </div>

            {submitError ? <div className="error">{submitError}</div> : null}

            <div className="offer-summary__actions">
              <button
                type="submit"
                className="btn btn--primary offer-summary__submit"
                disabled={
                  !schema ||
                  submitStatus === 'loading' ||
                  schemaStatus === 'loading' ||
                  (isEdit && !isDirty)
                }
              >
                {submitStatus === 'loading'
                  ? copy.common.loading
                  : isEdit
                    ? copy.form.actions.save
                    : copy.form.actions.create}
              </button>
              <Link to="/dashboard/offers" className="btn btn--ghost offer-summary__cancel">
                {copy.form.actions.cancel}
              </Link>
            </div>
            <div className="offer-summary__helper">
              {isEdit && !isDirty ? copy.common.noUnsavedChanges : publicationBodyText}
            </div>
          </div>
        </aside>
      </div>
    </form>
  )
}
