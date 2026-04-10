export const MARKET_SUPPORTED_CATEGORY = 'currency'
export const MARKET_DEFAULT_GAME_SLUG = 'path-of-exile'
export const MARKET_VIEWER_CURRENCIES = ['RUB', 'USD', 'EUR', 'GBP']
export const MARKET_SORT_OPTIONS = ['price_asc', 'price_desc']
export const MARKET_DEFAULT_STATE = {
  intent: 'buy',
  viewerCurrencyCode: 'RUB',
  gameSlug: '',
  categorySlug: '',
  page: 0,
  size: 20,
  sort: 'price_asc',
}

const RESERVED_QUERY_KEYS = new Set([
  'intent',
  'viewerCurrencyCode',
  'gameSlug',
  'categorySlug',
  'page',
  'size',
  'sort',
])

const RESERVED_STATE_KEYS = [...RESERVED_QUERY_KEYS]

function toCamelCase(slug = '') {
  return slug.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}

function isOptionValid(options, value) {
  return (Array.isArray(options) ? options : []).some((option) => option?.slug === value)
}

export function createMarketFilterState(overrides = {}) {
  return {
    ...MARKET_DEFAULT_STATE,
    ...overrides,
  }
}

export function resolveDefaultGameSlug(games) {
  const list = Array.isArray(games) ? games : []
  const preferred = list.find((game) => game?.slug === MARKET_DEFAULT_GAME_SLUG)
  return preferred?.slug || list[0]?.slug || ''
}

export function resolveCurrencyCategory(categories) {
  return (Array.isArray(categories) ? categories : []).find(
    (category) => category?.slug === MARKET_SUPPORTED_CATEGORY
  ) || null
}

export function mapSchemaToMarketFilters(schema) {
  const contextFilters = (Array.isArray(schema?.contexts) ? schema.contexts : []).map((context) => ({
    kind: 'context',
    slug: context.slug,
    stateKey: toCamelCase(context.slug),
    queryKey: context.slug,
    title: context.title,
    options: Array.isArray(context.options) ? context.options : [],
    defaultValue: context?.defaultValue?.slug || '',
  }))

  const currencyTypeAttribute = (Array.isArray(schema?.attributes) ? schema.attributes : []).find(
    (attribute) => attribute?.slug === 'currency-type'
  )

  const attributeFilters = currencyTypeAttribute
    ? [
        {
          kind: 'attribute',
          slug: currencyTypeAttribute.slug,
          stateKey: 'currencyType',
          queryKey: 'currencyType',
          title: currencyTypeAttribute.title,
          options: Array.isArray(currencyTypeAttribute.options)
            ? currencyTypeAttribute.options
            : [],
          defaultValue: currencyTypeAttribute?.defaultValue?.slug || '',
        },
      ]
    : []

  const allFilters = [...contextFilters, ...attributeFilters]

  return {
    contextFilters,
    attributeFilters,
    allFilters,
    filterKeys: allFilters.map((filter) => filter.stateKey),
  }
}

export function syncMarketFilterStateWithSchema(filterState, schema) {
  const mappedFilters = mapSchemaToMarketFilters(schema)
  const baseState = RESERVED_STATE_KEYS.reduce((acc, key) => {
    acc[key] = filterState[key]
    return acc
  }, {})

  for (const filter of mappedFilters.allFilters) {
    const currentValue = filterState[filter.stateKey]
    baseState[filter.stateKey] = isOptionValid(filter.options, currentValue)
      ? currentValue
      : filter.defaultValue
  }

  return baseState
}

export function buildMarketQuery(filterState, schema) {
  const query = {}
  const schemaFilters = mapSchemaToMarketFilters(schema)
  const stateToQueryKey = new Map(
    schemaFilters.allFilters.map((filter) => [filter.stateKey, filter.queryKey || filter.stateKey])
  )

  for (const key of RESERVED_QUERY_KEYS) {
    const value = filterState[key]
    if (value === '' || value == null) continue
    query[key] = value
  }

  for (const [key, value] of Object.entries(filterState || {})) {
    if (RESERVED_QUERY_KEYS.has(key)) continue
    if (value === '' || value == null) continue
    query[stateToQueryKey.get(key) || key] = value
  }

  return query
}
