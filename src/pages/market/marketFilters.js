export const MARKET_DEFAULT_GAME_SLUG = 'path-of-exile'
export const MARKET_FALLBACK_VIEWER_CURRENCIES = ['RUB', 'USD']
export const MARKET_SORT_OPTIONS = ['price_asc', 'price_desc']
export const MARKET_DEFAULT_STATE = {
  intent: 'buy',
  viewerCurrencyCode: MARKET_FALLBACK_VIEWER_CURRENCIES[0],
  gameSlug: '',
  categorySlug: '',
  page: 0,
  size: 20,
  sort: 'price_asc',
}

const MARKET_KNOWN_SAFE_VIEWER_CURRENCIES = new Set(MARKET_FALLBACK_VIEWER_CURRENCIES)

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

function shouldExposeAttributeFilter(attribute) {
  return (
    (attribute?.dataType === 'select' || attribute?.dataType === 'multiselect') &&
    Array.isArray(attribute.options) &&
    attribute.options.length > 0
  )
}

function normalizeCurrencyCode(value) {
  return (value || '').toString().trim().toUpperCase()
}

function readCurrencyCode(item) {
  if (typeof item === 'string') return normalizeCurrencyCode(item)
  return normalizeCurrencyCode(item?.code || item?.currencyCode || item?.currency_code)
}

function readCurrencyTitle(item, code) {
  if (!item || typeof item === 'string') return code
  return (
    item.title ||
    item.name ||
    item.displayName ||
    item.display_name ||
    item.label ||
    code
  )
}

function readMarketSupportFlag(item) {
  if (!item || typeof item === 'string') return null

  const value =
    item.marketEnabled ??
    item.market_enabled ??
    item.marketSupported ??
    item.market_supported ??
    item.viewerCurrencyEnabled ??
    item.viewer_currency_enabled ??
    item.isMarketCurrency ??
    item.is_market_currency

  return typeof value === 'boolean' ? value : null
}

export function normalizeMarketCurrencyOptions(currencies) {
  const seen = new Set()

  return (Array.isArray(currencies) ? currencies : [])
    .map((item) => {
      const code = readCurrencyCode(item)
      if (!code || seen.has(code)) return null
      seen.add(code)

      return {
        code,
        title: readCurrencyTitle(item, code),
        symbol:
          typeof item === 'object' && item
            ? item.symbol || item.sign || item.currencySymbol || item.currency_symbol || ''
            : '',
        marketSupported: readMarketSupportFlag(item),
      }
    })
    .filter(Boolean)
}

export function resolveMarketViewerCurrencies(currencies) {
  const options = normalizeMarketCurrencyOptions(currencies)
  const explicitlySupported = options.filter((option) => option.marketSupported === true)
  const safeFromApi = options.filter((option) =>
    MARKET_KNOWN_SAFE_VIEWER_CURRENCIES.has(option.code)
  )
  const source = explicitlySupported.length ? explicitlySupported : safeFromApi

  if (source.length) return source

  return MARKET_FALLBACK_VIEWER_CURRENCIES.map((code) => ({
    code,
    title: code,
    symbol: '',
    marketSupported: true,
  }))
}

export function isMarketViewerCurrencySupported(currencyCode, currencies) {
  const code = normalizeCurrencyCode(currencyCode)
  if (!code) return false

  return (Array.isArray(currencies) ? currencies : []).some((item) => {
    const itemCode = typeof item === 'string' ? normalizeCurrencyCode(item) : item?.code
    return itemCode === code
  })
}

export function resolveMarketDefaultSort(intent) {
  return intent === 'sell' ? 'price_desc' : 'price_asc'
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

export function resolveDefaultCategorySlug(categories) {
  return (Array.isArray(categories) ? categories : []).find((category) => category?.slug)?.slug || ''
}

export function mapSchemaToMarketFilters(schema) {
  const contextFilters = (Array.isArray(schema?.contexts) ? schema.contexts : []).map((context) => ({
    kind: 'context',
    slug: context.slug,
    stateKey: toCamelCase(context.slug),
    queryKey: `context.${context.slug}`,
    title: context.title,
    options: Array.isArray(context.options) ? context.options : [],
    defaultValue: context?.defaultValue?.slug || '',
  }))

  const attributeFilters = (Array.isArray(schema?.attributes) ? schema.attributes : [])
    .filter(shouldExposeAttributeFilter)
    .map((attribute) => ({
      kind: 'attribute',
      slug: attribute.slug,
      stateKey: toCamelCase(attribute.slug),
      queryKey: `attribute.${attribute.slug}`,
      title: attribute.title,
      options: Array.isArray(attribute.options) ? attribute.options : [],
      defaultValue: attribute?.defaultValue?.slug || '',
    }))

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
