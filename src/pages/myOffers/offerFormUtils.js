const SYSTEM_FIELD_MAP = {
  quantity: 'quantity',
  'min-trade-quantity': 'minTradeQuantity',
  'max-trade-quantity': 'maxTradeQuantity',
  'quantity-step': 'quantityStep',
  'trade-terms': 'tradeTerms',
  'delivery-methods': 'deliveryMethods',
}

const NUMERIC_FIELDS = new Set([
  'priceAmount',
  'quantity',
  'minTradeQuantity',
  'maxTradeQuantity',
  'quantityStep',
])

const COLLECTION_FIELDS = ['contexts', 'attributes', 'deliveryMethods']

const PATCH_SCALAR_FIELDS = [
  'gameId',
  'categoryId',
  'side',
  'title',
  'description',
  'tradeTerms',
  'priceCurrencyCode',
  'priceAmount',
  'quantity',
  'minTradeQuantity',
  'maxTradeQuantity',
  'quantityStep',
  'status',
]

export function createEmptyOfferFormState() {
  return {
    gameId: '',
    gameSlug: '',
    categoryId: '',
    categorySlug: '',
    side: 'sell',
    title: '',
    description: '',
    tradeTerms: '',
    priceCurrencyCode: 'USD',
    priceAmount: '',
    quantity: '',
    minTradeQuantity: '',
    maxTradeQuantity: '',
    quantityStep: '',
    status: 'active',
    contexts: {},
    attributes: {},
    deliveryMethods: [],
  }
}

export function mapOfferToFormState(offer) {
  const contexts = {}
  const attributes = {}

  for (const item of Array.isArray(offer?.contexts) ? offer.contexts : []) {
    if (!item?.dimensionSlug) continue
    contexts[item.dimensionSlug] = item.valueSlug || ''
  }

  for (const item of Array.isArray(offer?.attributes) ? offer.attributes : []) {
    const attributeSlug = item?.attributeSlug
    if (!attributeSlug) continue

    if (typeof item.optionSlug === 'string') {
      const prev = attributes[attributeSlug]
      if (Array.isArray(prev)) {
        attributes[attributeSlug] = [...prev, item.optionSlug]
      } else if (prev) {
        attributes[attributeSlug] = [prev, item.optionSlug]
      } else {
        attributes[attributeSlug] = item.optionSlug
      }
      continue
    }

    if (typeof item.valueText === 'string') {
      attributes[attributeSlug] = item.valueText
      continue
    }

    if (typeof item.valueNumber === 'number') {
      attributes[attributeSlug] = String(item.valueNumber)
      continue
    }

    if (typeof item.valueBoolean === 'boolean') {
      attributes[attributeSlug] = item.valueBoolean
    }
  }

  return {
    gameId: offer?.gameId ? String(offer.gameId) : '',
    gameSlug: offer?.game?.slug || '',
    categoryId: offer?.categoryId ? String(offer.categoryId) : '',
    categorySlug: offer?.category?.slug || '',
    side: offer?.side || 'sell',
    title: offer?.title || '',
    description: offer?.description || '',
    tradeTerms: offer?.tradeTerms || '',
    priceCurrencyCode: offer?.priceCurrencyCode || 'USD',
    priceAmount:
      typeof offer?.priceAmount === 'number' ? String(offer.priceAmount) : '',
    quantity: typeof offer?.quantity === 'number' ? String(offer.quantity) : '',
    minTradeQuantity:
      typeof offer?.minTradeQuantity === 'number' ? String(offer.minTradeQuantity) : '',
    maxTradeQuantity:
      typeof offer?.maxTradeQuantity === 'number' ? String(offer.maxTradeQuantity) : '',
    quantityStep:
      typeof offer?.quantityStep === 'number' ? String(offer.quantityStep) : '',
    status: offer?.status || 'active',
    contexts,
    attributes,
    deliveryMethods: Array.isArray(offer?.deliveryMethods) ? offer.deliveryMethods : [],
  }
}

export function getTradeFieldMap(schema) {
  const map = {}
  for (const field of Array.isArray(schema?.tradeFields) ? schema.tradeFields : []) {
    if (!field?.fieldSlug) continue
    map[field.fieldSlug] = field
  }
  return map
}

export function isTradeFieldVisible(schema, fieldSlug) {
  return Boolean(getTradeFieldMap(schema)[fieldSlug]?.isVisible)
}

export function syncFormStateWithSchema(formState, schema) {
  if (!schema) {
    return {
      ...formState,
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

  const nextContexts = {}
  for (const context of Array.isArray(schema.contexts) ? schema.contexts : []) {
    const options = Array.isArray(context?.options) ? context.options : []
    const currentValue = formState.contexts?.[context.slug]
    const hasCurrent = options.some((option) => option?.slug === currentValue)
    if (hasCurrent) {
      nextContexts[context.slug] = currentValue
      continue
    }
    nextContexts[context.slug] = context?.defaultValue?.slug || ''
  }

  const nextAttributes = {}
  for (const attribute of Array.isArray(schema.attributes) ? schema.attributes : []) {
    const currentValue = formState.attributes?.[attribute.slug]
    const optionSlugs = new Set(
      (Array.isArray(attribute?.options) ? attribute.options : [])
        .map((option) => option?.slug)
        .filter(Boolean)
    )

    if (attribute?.dataType === 'multiselect') {
      const values = Array.isArray(currentValue) ? currentValue : []
      nextAttributes[attribute.slug] = values.filter((value) => optionSlugs.has(value))
      continue
    }

    if (attribute?.dataType === 'select') {
      nextAttributes[attribute.slug] =
        typeof currentValue === 'string' && optionSlugs.has(currentValue) ? currentValue : ''
      continue
    }

    if (attribute?.dataType === 'number') {
      nextAttributes[attribute.slug] =
        typeof currentValue === 'string' || typeof currentValue === 'number'
          ? String(currentValue)
          : ''
      continue
    }

    if (attribute?.dataType === 'boolean') {
      nextAttributes[attribute.slug] =
        typeof currentValue === 'boolean' ? currentValue : null
      continue
    }

    nextAttributes[attribute.slug] = typeof currentValue === 'string' ? currentValue : ''
  }

  const tradeFieldMap = getTradeFieldMap(schema)
  const nextFields = { ...formState }

  for (const [fieldSlug, formKey] of Object.entries(SYSTEM_FIELD_MAP)) {
    const config = tradeFieldMap[fieldSlug]
    if (!config?.isVisible) {
      nextFields[formKey] = formKey === 'deliveryMethods' ? [] : ''
      continue
    }

    if (formKey === 'deliveryMethods') {
      const validSlugs = new Set(
        (Array.isArray(schema.deliveryMethods) ? schema.deliveryMethods : [])
          .map((method) => method?.slug)
          .filter(Boolean)
      )
      nextFields.deliveryMethods = (Array.isArray(formState.deliveryMethods)
        ? formState.deliveryMethods
        : []
      ).filter((slug) => validSlugs.has(slug))
      continue
    }

    const currentValue = formState[formKey]
    if (String(currentValue || '').trim()) continue

    if (config?.dataType === 'number' && config?.defaultValueNumber != null) {
      nextFields[formKey] = String(config.defaultValueNumber)
      continue
    }

    if (config?.dataType === 'text' && config?.defaultValueText) {
      nextFields[formKey] = config.defaultValueText
    }
  }

  return {
    ...nextFields,
    contexts: nextContexts,
    attributes: nextAttributes,
  }
}

function normalizeTextValue(value) {
  if (value == null) return null
  const next = String(value).trim()
  return next ? next : null
}

function normalizeCurrencyCode(value) {
  if (value == null) return null
  const next = String(value).trim().toUpperCase()
  return next ? next : null
}

function normalizeNumberValue(value) {
  if (value == null || value === '') return null
  const normalized = String(value).replace(',', '.').trim()
  if (!normalized) return null
  const numberValue = Number(normalized)
  return Number.isFinite(numberValue) ? numberValue : null
}

function sortCollection(items, keyBuilder) {
  return [...items].sort((left, right) => keyBuilder(left).localeCompare(keyBuilder(right)))
}

function buildContextsPayload(formState, schema) {
  const items = []
  for (const context of Array.isArray(schema?.contexts) ? schema.contexts : []) {
    const valueSlug = formState.contexts?.[context.slug]
    if (!valueSlug) continue
    items.push({
      dimensionSlug: context.slug,
      valueSlug,
    })
  }

  return sortCollection(items, (item) => `${item.dimensionSlug}:${item.valueSlug}`)
}

function buildAttributesPayload(formState, schema) {
  const items = []

  for (const attribute of Array.isArray(schema?.attributes) ? schema.attributes : []) {
    const value = formState.attributes?.[attribute.slug]
    if (attribute?.dataType === 'select') {
      if (value) {
        items.push({ attributeSlug: attribute.slug, optionSlug: value })
      }
      continue
    }

    if (attribute?.dataType === 'multiselect') {
      for (const optionSlug of Array.isArray(value) ? value : []) {
        if (!optionSlug) continue
        items.push({ attributeSlug: attribute.slug, optionSlug })
      }
      continue
    }

    if (attribute?.dataType === 'number') {
      const normalizedValue = normalizeNumberValue(value)
      if (normalizedValue != null) {
        items.push({ attributeSlug: attribute.slug, valueNumber: normalizedValue })
      }
      continue
    }

    if (attribute?.dataType === 'boolean') {
      if (typeof value === 'boolean') {
        items.push({ attributeSlug: attribute.slug, valueBoolean: value })
      }
      continue
    }

    const normalizedValue = normalizeTextValue(value)
    if (normalizedValue != null) {
      items.push({ attributeSlug: attribute.slug, valueText: normalizedValue })
    }
  }

  return sortCollection(items, (item) =>
    [
      item.attributeSlug,
      item.optionSlug,
      item.valueText,
      item.valueNumber,
      item.valueBoolean,
    ]
      .filter((value) => value != null)
      .join(':')
  )
}

function normalizeDeliveryMethods(formState, schema) {
  const validSlugs = new Set(
    (Array.isArray(schema?.deliveryMethods) ? schema.deliveryMethods : [])
      .map((method) => method?.slug)
      .filter(Boolean)
  )

  const list = (Array.isArray(formState.deliveryMethods) ? formState.deliveryMethods : []).filter(
    (slug) => validSlugs.has(slug)
  )

  return [...new Set(list)].sort((left, right) => left.localeCompare(right))
}

function buildComparableFormData(formState, schema) {
  return {
    gameId: formState.gameId ? Number(formState.gameId) : null,
    categoryId: formState.categoryId ? Number(formState.categoryId) : null,
    side: normalizeTextValue(formState.side),
    title: normalizeTextValue(formState.title),
    description: normalizeTextValue(formState.description),
    tradeTerms: isTradeFieldVisible(schema, 'trade-terms')
      ? normalizeTextValue(formState.tradeTerms)
      : null,
    priceCurrencyCode: normalizeCurrencyCode(formState.priceCurrencyCode),
    priceAmount: normalizeNumberValue(formState.priceAmount),
    quantity: isTradeFieldVisible(schema, 'quantity')
      ? normalizeNumberValue(formState.quantity)
      : null,
    minTradeQuantity: isTradeFieldVisible(schema, 'min-trade-quantity')
      ? normalizeNumberValue(formState.minTradeQuantity)
      : null,
    maxTradeQuantity: isTradeFieldVisible(schema, 'max-trade-quantity')
      ? normalizeNumberValue(formState.maxTradeQuantity)
      : null,
    quantityStep: isTradeFieldVisible(schema, 'quantity-step')
      ? normalizeNumberValue(formState.quantityStep)
      : null,
    status: normalizeTextValue(formState.status),
    contexts: buildContextsPayload(formState, schema),
    attributes: buildAttributesPayload(formState, schema),
    deliveryMethods: isTradeFieldVisible(schema, 'delivery-methods')
      ? normalizeDeliveryMethods(formState, schema)
      : [],
  }
}

function buildComparableOfferData(offer) {
  return {
    gameId: typeof offer?.gameId === 'number' ? offer.gameId : null,
    categoryId: typeof offer?.categoryId === 'number' ? offer.categoryId : null,
    side: normalizeTextValue(offer?.side),
    title: normalizeTextValue(offer?.title),
    description: normalizeTextValue(offer?.description),
    tradeTerms: normalizeTextValue(offer?.tradeTerms),
    priceCurrencyCode: normalizeCurrencyCode(offer?.priceCurrencyCode),
    priceAmount: typeof offer?.priceAmount === 'number' ? offer.priceAmount : null,
    quantity: typeof offer?.quantity === 'number' ? offer.quantity : null,
    minTradeQuantity:
      typeof offer?.minTradeQuantity === 'number' ? offer.minTradeQuantity : null,
    maxTradeQuantity:
      typeof offer?.maxTradeQuantity === 'number' ? offer.maxTradeQuantity : null,
    quantityStep: typeof offer?.quantityStep === 'number' ? offer.quantityStep : null,
    status: normalizeTextValue(offer?.status),
    contexts: sortCollection(
      (Array.isArray(offer?.contexts) ? offer.contexts : [])
        .filter((item) => item?.dimensionSlug && item?.valueSlug)
        .map((item) => ({
          dimensionSlug: item.dimensionSlug,
          valueSlug: item.valueSlug,
        })),
      (item) => `${item.dimensionSlug}:${item.valueSlug}`
    ),
    attributes: sortCollection(
      (Array.isArray(offer?.attributes) ? offer.attributes : [])
        .filter((item) => item?.attributeSlug)
        .map((item) => {
          const normalized = { attributeSlug: item.attributeSlug }
          if (item.optionSlug != null) normalized.optionSlug = item.optionSlug
          if (item.valueText != null) normalized.valueText = item.valueText
          if (item.valueNumber != null) normalized.valueNumber = item.valueNumber
          if (item.valueBoolean != null) normalized.valueBoolean = item.valueBoolean
          return normalized
        }),
      (item) =>
        [
          item.attributeSlug,
          item.optionSlug,
          item.valueText,
          item.valueNumber,
          item.valueBoolean,
        ]
          .filter((value) => value != null)
          .join(':')
    ),
    deliveryMethods: [...new Set(Array.isArray(offer?.deliveryMethods) ? offer.deliveryMethods : [])]
      .sort((left, right) => left.localeCompare(right)),
  }
}

function areEqual(left, right) {
  if (Array.isArray(left) || Array.isArray(right)) {
    return JSON.stringify(left || []) === JSON.stringify(right || [])
  }
  return left === right
}

export function buildCreateOfferPayload(formState, schema) {
  const normalized = buildComparableFormData(formState, schema)

  return {
    gameId: normalized.gameId,
    categoryId: normalized.categoryId,
    side: normalized.side,
    title: normalized.title,
    description: normalized.description,
    tradeTerms: normalized.tradeTerms,
    priceCurrencyCode: normalized.priceCurrencyCode,
    priceAmount: normalized.priceAmount,
    quantity: normalized.quantity,
    minTradeQuantity: normalized.minTradeQuantity,
    maxTradeQuantity: normalized.maxTradeQuantity,
    quantityStep: normalized.quantityStep,
    status: 'active',
    contexts: normalized.contexts,
    attributes: normalized.attributes,
    deliveryMethods: normalized.deliveryMethods,
  }
}

export function buildPatchOfferPayload(initialOffer, formState, schema) {
  const initialComparable = buildComparableOfferData(initialOffer)
  const currentComparable = buildComparableFormData(formState, schema)
  const payload = {}

  for (const field of PATCH_SCALAR_FIELDS) {
    if (!areEqual(initialComparable[field], currentComparable[field])) {
      payload[field] = currentComparable[field]
    }
  }

  for (const field of COLLECTION_FIELDS) {
    if (!areEqual(initialComparable[field], currentComparable[field])) {
      payload[field] = currentComparable[field]
    }
  }

  return payload
}

export function validateOfferForm(formState, schema, copy) {
  const errors = {}
  const tradeFieldMap = getTradeFieldMap(schema)
  const quantityValue = normalizeNumberValue(formState.quantity)
  const minValue = normalizeNumberValue(formState.minTradeQuantity)
  const maxValue = normalizeNumberValue(formState.maxTradeQuantity)
  const priceValue = normalizeNumberValue(formState.priceAmount)

  if (!formState.gameId) errors.gameId = copy.form.validation.gameRequired
  if (!formState.categoryId) errors.categoryId = copy.form.validation.categoryRequired
  if (!normalizeTextValue(formState.side)) errors.side = copy.form.validation.sideRequired

  if (!normalizeCurrencyCode(formState.priceCurrencyCode)) {
    errors.priceCurrencyCode = copy.form.validation.currencyRequired
  }

  if (formState.priceAmount === '') {
    errors.priceAmount = copy.form.validation.priceAmountRequired
  } else if (priceValue == null || priceValue <= 0) {
    errors.priceAmount = copy.form.validation.priceAmountInvalid
  }

  for (const [fieldSlug, formKey] of Object.entries(SYSTEM_FIELD_MAP)) {
    const config = tradeFieldMap[fieldSlug]
    if (!config?.isVisible || formKey === 'deliveryMethods') continue
    const value = formState[formKey]
    if (NUMERIC_FIELDS.has(formKey)) {
      if (config?.isRequired && value === '') {
        errors[formKey] = copy.form.validation.numericRequired
      } else if (value !== '') {
        const normalized = normalizeNumberValue(value)
        if (normalized == null || normalized <= 0) {
          errors[formKey] = copy.form.validation.numericInvalid
        }
      }
      continue
    }

    if (config?.isRequired && !normalizeTextValue(value)) {
      errors[formKey] = copy.form.validation.attributeRequired
    }
  }

  if (quantityValue != null && maxValue != null && maxValue > quantityValue) {
    errors.maxTradeQuantity = copy.form.validation.maxQuantityInvalid
  }

  if (quantityValue != null && minValue != null && minValue > quantityValue) {
    errors.minTradeQuantity = copy.form.validation.minQuantityInvalid
  }

  if (minValue != null && maxValue != null && minValue > maxValue) {
    errors.minTradeQuantity = copy.form.validation.minMaxInvalid
    errors.maxTradeQuantity = copy.form.validation.minMaxInvalid
  }

  for (const context of Array.isArray(schema?.contexts) ? schema.contexts : []) {
    if (!context?.isRequired) continue
    if (!formState.contexts?.[context.slug]) {
      errors[`context:${context.slug}`] = copy.form.validation.contextRequired
    }
  }

  for (const attribute of Array.isArray(schema?.attributes) ? schema.attributes : []) {
    const value = formState.attributes?.[attribute.slug]
    const errorKey = `attribute:${attribute.slug}`
    if (!attribute?.isRequired) continue

    if (attribute?.dataType === 'multiselect') {
      if (!Array.isArray(value) || value.length === 0) {
        errors[errorKey] = copy.form.validation.multiselectRequired
      }
      continue
    }

    if (attribute?.dataType === 'boolean') {
      if (typeof value !== 'boolean') {
        errors[errorKey] = copy.form.validation.attributeRequired
      }
      continue
    }

    if (attribute?.dataType === 'number') {
      const normalized = normalizeNumberValue(value)
      if (normalized == null) {
        errors[errorKey] = copy.form.validation.numericRequired
      }
      continue
    }

    if (!normalizeTextValue(value)) {
      errors[errorKey] = copy.form.validation.attributeRequired
    }
  }

  if (tradeFieldMap['delivery-methods']?.isVisible && tradeFieldMap['delivery-methods']?.isRequired) {
    if (!Array.isArray(formState.deliveryMethods) || formState.deliveryMethods.length === 0) {
      errors.deliveryMethods = copy.form.validation.multiselectRequired
    }
  }

  return errors
}
