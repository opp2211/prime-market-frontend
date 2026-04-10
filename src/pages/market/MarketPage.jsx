import { useEffect, useMemo, useState } from 'react'
import {
  createMarketOfferQuote,
  getMarketCategories,
  getMarketGames,
  getMarketOfferSchema,
  getMarketOffers,
} from '../../api/market'
import { useI18n } from '../../app/i18n'
import { getErrorMessage } from '../../shared/lib/errors'
import MarketOfferModal from './MarketOfferModal'
import MarketOffersTable from './MarketOffersTable'
import MarketToolbar from './MarketToolbar'
import { getMarketCopy } from './marketCopy'
import {
  buildMarketQuery,
  createMarketFilterState,
  MARKET_DEFAULT_STATE,
  MARKET_SORT_OPTIONS,
  MARKET_SUPPORTED_CATEGORY,
  MARKET_VIEWER_CURRENCIES,
  mapSchemaToMarketFilters,
  resolveCurrencyCategory,
  resolveDefaultGameSlug,
  syncMarketFilterStateWithSchema,
} from './marketFilters'
import { resolveMarketIntentLabel } from './marketPresentation'

function shallowEqualState(left, right) {
  const leftKeys = Object.keys(left || {})
  const rightKeys = Object.keys(right || {})

  if (leftKeys.length !== rightKeys.length) return false

  return leftKeys.every((key) => left[key] === right[key])
}

function MarketPageSkeleton() {
  return (
    <div className="market-page">
      <div className="card market-panel market-panel--loading">
        <div className="skeleton market-skeleton market-skeleton--eyebrow" />
        <div className="skeleton market-skeleton market-skeleton--panel-title" />
        <div className="skeleton market-skeleton market-skeleton--panel-subtitle" />
        <div className="market-toolbar">
          <div className="market-toolbar__row">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="market-toolbar__field">
                <div className="skeleton market-skeleton market-skeleton--label" />
                <div className="skeleton market-skeleton market-skeleton--control" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="card market-table">
        <div className="market-table__body">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="market-row market-row--skeleton">
              <div className="market-row__main">
                <div className="skeleton market-skeleton market-skeleton--title" />
                <div className="skeleton market-skeleton market-skeleton--subline" />
              </div>
              <div className="market-row__action">
                <div className="skeleton market-skeleton market-skeleton--button" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function MarketPage() {
  const { language } = useI18n()
  const copy = getMarketCopy(language)

  const [filterState, setFilterState] = useState(() => createMarketFilterState())
  const [games, setGames] = useState([])
  const [gamesStatus, setGamesStatus] = useState('loading')
  const [gamesError, setGamesError] = useState('')
  const [gamesReloadKey, setGamesReloadKey] = useState(0)

  const [categories, setCategories] = useState([])
  const [categoriesStatus, setCategoriesStatus] = useState('idle')
  const [categoriesError, setCategoriesError] = useState('')
  const [categoriesReloadKey, setCategoriesReloadKey] = useState(0)

  const [schema, setSchema] = useState(null)
  const [schemaStatus, setSchemaStatus] = useState('idle')
  const [schemaError, setSchemaError] = useState('')
  const [schemaReloadKey, setSchemaReloadKey] = useState(0)

  const [offers, setOffers] = useState([])
  const [listStatus, setListStatus] = useState('idle')
  const [listError, setListError] = useState('')
  const [listMeta, setListMeta] = useState({
    page: MARKET_DEFAULT_STATE.page,
    size: MARKET_DEFAULT_STATE.size,
    total: 0,
  })
  const [offersReloadKey, setOffersReloadKey] = useState(0)

  const [selectedOfferSnapshot, setSelectedOfferSnapshot] = useState(null)
  const [openingOfferId, setOpeningOfferId] = useState(null)
  const [openingOfferError, setOpeningOfferError] = useState('')

  const schemaFilters = useMemo(() => mapSchemaToMarketFilters(schema), [schema])
  const currencyCategory = useMemo(() => resolveCurrencyCategory(categories), [categories])
  const isUnsupportedCategory =
    categoriesStatus === 'ready' && !currencyCategory && Boolean(filterState.gameSlug)

  function resetMarketResults() {
    setOffers([])
    setListStatus('idle')
    setListError('')
    setListMeta({
      page: MARKET_DEFAULT_STATE.page,
      size: MARKET_DEFAULT_STATE.size,
      total: 0,
    })
  }

  useEffect(() => {
    let active = true

    const loadGames = async () => {
      setGamesStatus('loading')
      setGamesError('')

      try {
        const response = await getMarketGames()
        if (!active) return
        const items = Array.isArray(response?.data) ? response.data : []
        setGames(items)
        setFilterState((current) => {
          const hasCurrentGame = items.some((game) => game.slug === current.gameSlug)
          if (hasCurrentGame) return current

          const defaultGameSlug = resolveDefaultGameSlug(items)
          if (!defaultGameSlug) return current

          return {
            ...current,
            gameSlug: defaultGameSlug,
            categorySlug: '',
            page: 0,
          }
        })
        setGamesStatus('ready')
      } catch (err) {
        if (!active) return
        setGames([])
        setGamesError(getErrorMessage(err, copy.errors.games))
        setGamesStatus('error')
      }
    }

    loadGames()

    return () => {
      active = false
    }
  }, [copy.errors.games, gamesReloadKey])

  useEffect(() => {
    if (!filterState.gameSlug) return undefined

    let active = true

    const loadCategories = async () => {
      setCategoriesStatus('loading')
      setCategoriesError('')
      setSchema(null)
      setSchemaStatus('idle')
      setSchemaError('')

      try {
        const response = await getMarketCategories(filterState.gameSlug)
        if (!active) return
        const items = Array.isArray(response?.data) ? response.data : []
        setCategories(items)
        setFilterState((current) => {
          const nextCategorySlug = resolveCurrencyCategory(items)?.slug || ''
          if (current.categorySlug === nextCategorySlug) return current

          return {
            ...current,
            categorySlug: nextCategorySlug,
            page: 0,
          }
        })
        setCategoriesStatus('ready')
      } catch (err) {
        if (!active) return
        setCategories([])
        setCategoriesError(getErrorMessage(err, copy.errors.categories))
        setCategoriesStatus('error')
      }
    }

    loadCategories()

    return () => {
      active = false
    }
  }, [copy.errors.categories, categoriesReloadKey, filterState.gameSlug])

  useEffect(() => {
    if (!filterState.gameSlug || filterState.categorySlug !== MARKET_SUPPORTED_CATEGORY) return undefined

    let active = true

    const loadSchema = async () => {
      setSchemaStatus('loading')
      setSchemaError('')

      try {
        const response = await getMarketOfferSchema(
          filterState.gameSlug,
          filterState.categorySlug
        )
        if (!active) return
        const nextSchema = response?.data || null
        setSchema(nextSchema)
        setFilterState((current) => {
          const nextState = syncMarketFilterStateWithSchema(current, nextSchema)
          return shallowEqualState(current, nextState) ? current : nextState
        })
        setSchemaStatus('ready')
      } catch (err) {
        if (!active) return
        setSchema(null)
        setSchemaError(getErrorMessage(err, copy.errors.schema))
        setSchemaStatus('error')
      }
    }

    loadSchema()

    return () => {
      active = false
    }
  }, [
    copy.errors.schema,
    filterState.categorySlug,
    filterState.gameSlug,
    schemaReloadKey,
  ])

  const canLoadOffers =
    gamesStatus === 'ready' &&
    categoriesStatus === 'ready' &&
    schemaStatus === 'ready' &&
    filterState.gameSlug &&
    filterState.categorySlug === MARKET_SUPPORTED_CATEGORY &&
    !isUnsupportedCategory

  useEffect(() => {
    if (!canLoadOffers) return undefined

    let active = true

    const loadOffers = async () => {
      setListStatus((current) => (current === 'ready' ? 'refreshing' : 'loading'))
      setListError('')

      try {
        const response = await getMarketOffers(buildMarketQuery(filterState, schema))
        if (!active) return
        const data = response?.data || {}
        const items = Array.isArray(data.items) ? data.items : []
        setOffers(items)
        setListMeta({
          page: typeof data.page === 'number' ? data.page : filterState.page,
          size: typeof data.size === 'number' ? data.size : filterState.size,
          total: typeof data.total === 'number' ? data.total : items.length,
        })
        setListStatus('ready')
      } catch (err) {
        if (!active) return
        setListError(getErrorMessage(err, copy.errors.offers))
        setListStatus('error')
      }
    }

    loadOffers()

    return () => {
      active = false
    }
  }, [canLoadOffers, copy.errors.offers, filterState, offersReloadKey, schema])

  const resultsCount = listMeta.total || offers.length
  const panelIntentLabel = resolveMarketIntentLabel(filterState.intent, copy)

  const listBlockedState = useMemo(() => {
    if (gamesStatus === 'loading' && !games.length) return 'loading'
    if (categoriesStatus === 'loading') return 'loading'
    if (categoriesStatus === 'error') return 'blocked'
    if (schemaStatus === 'loading') return 'loading'
    if (schemaStatus === 'error') return 'blocked'
    if (isUnsupportedCategory) return 'unsupported'
    return null
  }, [categoriesStatus, games.length, gamesStatus, isUnsupportedCategory, schemaStatus])

  function updateFilters(patch, options = {}) {
    setOpeningOfferError('')
    setFilterState((current) => {
      const nextPatch = typeof patch === 'function' ? patch(current) : patch
      const nextState = {
        ...current,
        ...nextPatch,
      }

      if (options.resetPage !== false) {
        nextState.page = 0
      }

      return shallowEqualState(current, nextState) ? current : nextState
    })
  }

  async function handleOpenOffer(offer) {
    if (!offer?.id || openingOfferId) return

    if (offer?.offerVersion == null || offer?.price?.amount == null) {
      setOpeningOfferError(copy.errors.quoteCreate || copy.errors.offerDetails || copy.errors.offers)
      return
    }

    setOpeningOfferError('')
    setOpeningOfferId(offer.id)

    try {
      const response = await createMarketOfferQuote(offer.id, {
        intent: filterState.intent,
        viewerCurrencyCode: filterState.viewerCurrencyCode,
        listedOfferVersion: offer.offerVersion,
        listedUnitPriceAmount: offer?.price?.amount,
      })
      const quote = response?.data || null

      if (!quote?.quoteId) {
        throw new Error(copy.errors.quoteCreate || copy.errors.offerDetails || copy.errors.offers)
      }

      setSelectedOfferSnapshot({
        listingOffer: offer,
        initialQuote: quote,
      })
    } catch (err) {
      setOpeningOfferError(
        getErrorMessage(err, copy.errors.quoteCreate || copy.errors.offerDetails || copy.errors.offers)
      )
    } finally {
      setOpeningOfferId(null)
    }
  }

  function handleReset() {
    setSelectedOfferSnapshot(null)
    setOpeningOfferError('')
    const baseState = createMarketFilterState({
      gameSlug: filterState.gameSlug || resolveDefaultGameSlug(games),
      categorySlug: resolveCurrencyCategory(categories)?.slug || '',
    })
    const nextState =
      schemaStatus === 'ready' && schema
        ? syncMarketFilterStateWithSchema(baseState, schema)
        : baseState

    resetMarketResults()
    setFilterState(nextState)
  }

  if (gamesStatus === 'loading' && !games.length) {
    return <MarketPageSkeleton />
  }

  if (gamesStatus === 'error' && !games.length) {
    return (
      <div className="market-page">
        <div className="card offer-state offer-state--error">
          <div className="offer-state__title">{gamesError}</div>
          <div className="offer-state__actions">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => setGamesReloadKey((value) => value + 1)}
            >
              {copy.common.retry}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="market-page">
      <section className="card market-panel">
        <div className="market-panel__header">
          <div>
            <div className="market-panel__eyebrow">{copy.eyebrow}</div>
            <h1 className="h1 market-panel__title">{copy.title}</h1>
            <p className="market-panel__subtitle">{copy.subtitle}</p>
          </div>

          <div className="market-panel__stats">
            <div className="market-panel__stat">
              <span className="market-panel__stat-label">{copy.toolbar.intent}</span>
              <strong className="market-panel__stat-value">{panelIntentLabel}</strong>
            </div>
            <div className="market-panel__stat">
              <span className="market-panel__stat-label">{copy.list.title}</span>
              <strong className="market-panel__stat-value">
                {resultsCount} {copy.common.results}
              </strong>
            </div>
          </div>
        </div>

        <MarketToolbar
          copy={copy}
          filterState={filterState}
          games={games}
          categories={categories}
          viewerCurrencies={MARKET_VIEWER_CURRENCIES}
          sortOptions={MARKET_SORT_OPTIONS}
          schemaFilters={schemaFilters}
          categoriesStatus={categoriesStatus}
          categoriesError={categoriesError}
          schemaStatus={schemaStatus}
          schemaError={schemaError}
          isUnsupportedCategory={isUnsupportedCategory}
          onIntentChange={(intent) => updateFilters({ intent })}
          onGameChange={(gameSlug) => {
            setSelectedOfferSnapshot(null)
            setOpeningOfferError('')
            setCategories([])
            setCategoriesStatus('idle')
            setCategoriesError('')
            setSchema(null)
            setSchemaStatus('idle')
            setSchemaError('')
            resetMarketResults()
            updateFilters({
              gameSlug,
              categorySlug: '',
            })
          }}
          onCategoryChange={(categorySlug) => {
            setSelectedOfferSnapshot(null)
            setOpeningOfferError('')
            setSchema(null)
            setSchemaStatus('idle')
            setSchemaError('')
            resetMarketResults()
            updateFilters({ categorySlug })
          }}
          onViewerCurrencyChange={(viewerCurrencyCode) =>
            updateFilters({ viewerCurrencyCode })
          }
          onDynamicFilterChange={(stateKey, value) => updateFilters({ [stateKey]: value })}
          onSortChange={(sort) => updateFilters({ sort })}
          onReset={handleReset}
          onRetryCategories={() => setCategoriesReloadKey((value) => value + 1)}
          onRetrySchema={() => setSchemaReloadKey((value) => value + 1)}
        />
      </section>

      <MarketOffersTable
        copy={copy}
        language={language}
        offers={offers}
        total={listMeta.total}
        page={listMeta.page}
        size={listMeta.size}
        status={listStatus}
        error={openingOfferError || listError}
        blockedState={listBlockedState}
        onRetry={() => setOffersReloadKey((value) => value + 1)}
        onOpenOffer={handleOpenOffer}
        openingOfferId={openingOfferId}
        onPrevPage={() =>
          updateFilters(
            (current) => ({
              page: Math.max(0, current.page - 1),
            }),
            { resetPage: false }
          )
        }
        onNextPage={() =>
          updateFilters(
            (current) => ({
              page: current.page + 1,
            }),
            { resetPage: false }
          )
        }
      />

      {selectedOfferSnapshot ? (
        <MarketOfferModal
          offer={selectedOfferSnapshot.listingOffer}
          initialQuote={selectedOfferSnapshot.initialQuote}
          copy={copy}
          language={language}
          onClose={() => setSelectedOfferSnapshot(null)}
        />
      ) : null}
    </div>
  )
}
