import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  createMarketOfferQuote,
  getMarketCategories,
  getMarketCurrencies,
  getMarketGames,
  getMarketOfferSchema,
  getMarketOffers,
} from '../../api/market'
import { useI18n } from '../../app/i18n'
import {
  getDisplayCurrencySnapshot,
  setDisplayCurrency,
  useDisplayCurrency,
} from '../../app/displayCurrency'
import { getErrorMessage } from '../../shared/lib/errors'
import MarketOfferModal from './MarketOfferModal'
import MarketOffersTable from './MarketOffersTable'
import MarketToolbar, { MarketSidebar } from './MarketToolbar'
import { getMarketCopy } from './marketCopy'
import {
  buildMarketQuery,
  createMarketFilterState,
  isMarketViewerCurrencySupported,
  MARKET_DEFAULT_STATE,
  MARKET_FALLBACK_VIEWER_CURRENCIES,
  MARKET_SORT_OPTIONS,
  mapSchemaToMarketFilters,
  resolveDefaultCategorySlug,
  resolveDefaultGameSlug,
  resolveMarketDefaultSort,
  resolveMarketViewerCurrencies,
  syncMarketFilterStateWithSchema,
} from './marketFilters'
import './market.css'

const MARKET_GAME_QUERY_PARAM = 'game'
const MARKET_CATEGORY_QUERY_PARAM = 'category'
const INITIAL_VIEWER_CURRENCY_OPTIONS = resolveMarketViewerCurrencies(
  MARKET_FALLBACK_VIEWER_CURRENCIES
)

function readMarketRouteFilters(searchParams) {
  const gameSlug = searchParams.get(MARKET_GAME_QUERY_PARAM) || ''
  const categorySlug = gameSlug ? searchParams.get(MARKET_CATEGORY_QUERY_PARAM) || '' : ''

  return {
    gameSlug,
    categorySlug,
  }
}

function shallowEqualState(left, right) {
  const leftKeys = Object.keys(left || {})
  const rightKeys = Object.keys(right || {})

  if (leftKeys.length !== rightKeys.length) return false

  return leftKeys.every((key) => left[key] === right[key])
}

function getCurrencyCodes(options) {
  return (Array.isArray(options) ? options : []).map((option) => option.code).filter(Boolean)
}

function formatCopyTemplate(template, values) {
  return Object.entries(values).reduce(
    (message, [key, value]) => message.replaceAll(`{${key}}`, value),
    template || ''
  )
}

function resolveInitialViewerCurrency(displayCurrency) {
  return isMarketViewerCurrencySupported(displayCurrency, INITIAL_VIEWER_CURRENCY_OPTIONS)
    ? displayCurrency
    : MARKET_DEFAULT_STATE.viewerCurrencyCode
}

export default function MarketPage() {
  const { language } = useI18n()
  const { currencyCode: displayCurrencyCode } = useDisplayCurrency()
  const copy = getMarketCopy(language)
  const [searchParams, setSearchParams] = useSearchParams()

  const [viewerCurrencies, setViewerCurrencies] = useState(INITIAL_VIEWER_CURRENCY_OPTIONS)
  const [currenciesStatus, setCurrenciesStatus] = useState('loading')
  const [currenciesError, setCurrenciesError] = useState('')
  const [currencyNotice, setCurrencyNotice] = useState('')
  const [currenciesReloadKey, setCurrenciesReloadKey] = useState(0)

  const [filterState, setFilterState] = useState(() => {
    const displayCurrency = getDisplayCurrencySnapshot().currencyCode
    const routeFilters = readMarketRouteFilters(searchParams)
    return createMarketFilterState({
      viewerCurrencyCode: resolveInitialViewerCurrency(displayCurrency),
      ...routeFilters,
    })
  })
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
  const currencyCodes = useMemo(() => getCurrencyCodes(viewerCurrencies), [viewerCurrencies])
  const defaultViewerCurrencyCode =
    currencyCodes[0] || MARKET_DEFAULT_STATE.viewerCurrencyCode
  const selectedCurrencyIsSupported = isMarketViewerCurrencySupported(
    filterState.viewerCurrencyCode,
    viewerCurrencies
  )

  const resetMarketResults = useCallback(() => {
    setOffers([])
    setListStatus('idle')
    setListError('')
    setListMeta({
      page: MARKET_DEFAULT_STATE.page,
      size: MARKET_DEFAULT_STATE.size,
      total: 0,
    })
  }, [])

  useEffect(() => {
    if (!selectedCurrencyIsSupported) return
    setDisplayCurrency(filterState.viewerCurrencyCode)
  }, [filterState.viewerCurrencyCode, selectedCurrencyIsSupported])

  useEffect(() => {
    const routeFilters = readMarketRouteFilters(searchParams)

    setFilterState((current) => {
      if (
        current.gameSlug === routeFilters.gameSlug &&
        current.categorySlug === routeFilters.categorySlug
      ) {
        return current
      }

      return {
        ...current,
        ...routeFilters,
        page: 0,
      }
    })
  }, [searchParams])

  useEffect(() => {
    if (currenciesStatus !== 'ready') return
    if (isMarketViewerCurrencySupported(displayCurrencyCode, viewerCurrencies)) {
      setFilterState((current) => {
        if (current.viewerCurrencyCode === displayCurrencyCode) return current
        return {
          ...current,
          viewerCurrencyCode: displayCurrencyCode,
          page: 0,
        }
      })
      return
    }

    if (displayCurrencyCode && displayCurrencyCode !== filterState.viewerCurrencyCode) {
      setCurrencyNotice(
        formatCopyTemplate(copy.errors.currencyUnsupported, {
          code: displayCurrencyCode,
          fallback: filterState.viewerCurrencyCode,
        })
      )
      setDisplayCurrency(filterState.viewerCurrencyCode)
    }
  }, [
    copy.errors.currencyUnsupported,
    currenciesStatus,
    displayCurrencyCode,
    filterState.viewerCurrencyCode,
    viewerCurrencies,
  ])

  useEffect(() => {
    if (currenciesStatus !== 'ready' && currenciesStatus !== 'error') return
    if (selectedCurrencyIsSupported || !defaultViewerCurrencyCode) return

    setCurrencyNotice(
      formatCopyTemplate(copy.errors.currencyUnsupported, {
        code: filterState.viewerCurrencyCode,
        fallback: defaultViewerCurrencyCode,
      })
    )
    setFilterState((current) => {
      if (current.viewerCurrencyCode === defaultViewerCurrencyCode) return current
      return {
        ...current,
        viewerCurrencyCode: defaultViewerCurrencyCode,
        page: 0,
      }
    })
  }, [
    copy.errors.currencyUnsupported,
    currenciesStatus,
    defaultViewerCurrencyCode,
    filterState.viewerCurrencyCode,
    selectedCurrencyIsSupported,
  ])

  const setMarketSearchFilters = useCallback((gameSlug, categorySlug, options = {}) => {
    setSearchParams((current) => {
      const nextParams = new URLSearchParams(current)
      const nextGameSlug = gameSlug || ''
      const nextCategorySlug = nextGameSlug ? categorySlug || '' : ''

      if (nextGameSlug) {
        nextParams.set(MARKET_GAME_QUERY_PARAM, nextGameSlug)
      } else {
        nextParams.delete(MARKET_GAME_QUERY_PARAM)
      }

      if (nextCategorySlug) {
        nextParams.set(MARKET_CATEGORY_QUERY_PARAM, nextCategorySlug)
      } else {
        nextParams.delete(MARKET_CATEGORY_QUERY_PARAM)
      }

      return nextParams
    }, options)
  }, [setSearchParams])

  useEffect(() => {
    let active = true

    const loadCurrencies = async () => {
      setCurrenciesStatus('loading')
      setCurrenciesError('')
      setCurrencyNotice('')

      try {
        const response = await getMarketCurrencies()
        if (!active) return
        const payload = response?.data
        const items = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.items)
            ? payload.items
            : []
        const nextCurrencies = resolveMarketViewerCurrencies(items)

        setViewerCurrencies(nextCurrencies)
        setCurrenciesStatus('ready')
      } catch (err) {
        if (!active) return
        const fallbackCurrencies = resolveMarketViewerCurrencies(MARKET_FALLBACK_VIEWER_CURRENCIES)
        setViewerCurrencies(fallbackCurrencies)
        setCurrenciesError(getErrorMessage(err, copy.errors.currencies))
        setCurrenciesStatus('error')
      }
    }

    loadCurrencies()

    return () => {
      active = false
    }
  }, [copy.errors.currencies, copy.errors.currencyUnsupported, currenciesReloadKey])

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
    if (gamesStatus !== 'ready' || filterState.gameSlug || !games.length) return

    const defaultGameSlug = resolveDefaultGameSlug(games)
    if (!defaultGameSlug) return

    setMarketSearchFilters(defaultGameSlug, '', { replace: true })
    setFilterState((current) => {
      if (current.gameSlug) return current
      return {
        ...current,
        gameSlug: defaultGameSlug,
        categorySlug: '',
        page: 0,
      }
    })
  }, [filterState.gameSlug, games, gamesStatus, setMarketSearchFilters])

  useEffect(() => {
    if (!filterState.gameSlug) {
      setCategories([])
      setCategoriesStatus('idle')
      setCategoriesError('')
      setSchema(null)
      setSchemaStatus('idle')
      setSchemaError('')
      resetMarketResults()
      return undefined
    }

    if (gamesStatus !== 'ready') return undefined

    const gameIsAvailable = games.some((game) => game?.slug === filterState.gameSlug)
    if (!gameIsAvailable) {
      setMarketSearchFilters('', '', { replace: true })
      setFilterState((current) => {
        if (!current.gameSlug && !current.categorySlug) return current
        return {
          ...current,
          gameSlug: '',
          categorySlug: '',
          page: 0,
        }
      })
      return undefined
    }

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
  }, [
    copy.errors.categories,
    categoriesReloadKey,
    filterState.gameSlug,
    games,
    gamesStatus,
    resetMarketResults,
    setMarketSearchFilters,
  ])

  useEffect(() => {
    if (categoriesStatus !== 'ready' || !filterState.gameSlug || filterState.categorySlug) return

    const defaultCategorySlug = resolveDefaultCategorySlug(categories)
    if (!defaultCategorySlug) return

    setMarketSearchFilters(filterState.gameSlug, defaultCategorySlug, { replace: true })
    setFilterState((current) => {
      if (current.categorySlug) return current
      return {
        ...current,
        categorySlug: defaultCategorySlug,
        page: 0,
      }
    })
  }, [
    categories,
    categoriesStatus,
    filterState.categorySlug,
    filterState.gameSlug,
    setMarketSearchFilters,
  ])

  useEffect(() => {
    if (categoriesStatus !== 'ready' || !filterState.categorySlug) return

    const categoryIsAvailable = categories.some(
      (category) => category?.slug === filterState.categorySlug
    )
    if (categoryIsAvailable) return

    setMarketSearchFilters(filterState.gameSlug, '', { replace: true })
    setFilterState((current) => {
      if (current.categorySlug !== filterState.categorySlug) return current
      return {
        ...current,
        categorySlug: '',
        page: 0,
      }
    })
  }, [
    categories,
    categoriesStatus,
    filterState.categorySlug,
    filterState.gameSlug,
    setMarketSearchFilters,
  ])

  useEffect(() => {
    if (!filterState.gameSlug || !filterState.categorySlug) {
      setSchema(null)
      setSchemaStatus('idle')
      setSchemaError('')
      resetMarketResults()
      return undefined
    }

    if (categoriesStatus !== 'ready') return undefined

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
    categoriesStatus,
    copy.errors.schema,
    filterState.categorySlug,
    filterState.gameSlug,
    resetMarketResults,
    schemaReloadKey,
  ])

  const canLoadOffers = Boolean(
    gamesStatus === 'ready' &&
    categoriesStatus === 'ready' &&
    schemaStatus === 'ready' &&
    filterState.gameSlug &&
    filterState.categorySlug &&
    selectedCurrencyIsSupported
  )

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

        const status = err?.response?.status
        const fallbackCode = defaultViewerCurrencyCode
        if (
          status === 400 &&
          fallbackCode &&
          filterState.viewerCurrencyCode !== fallbackCode
        ) {
          setCurrencyNotice(
            formatCopyTemplate(copy.errors.currencyUnsupported, {
              code: filterState.viewerCurrencyCode,
              fallback: fallbackCode,
            })
          )
          setFilterState((current) => ({
            ...current,
            viewerCurrencyCode: fallbackCode,
            page: 0,
          }))
          setListStatus('idle')
          return
        }

        setListError(getErrorMessage(err, copy.errors.offers))
        setListStatus('error')
      }
    }

    loadOffers()

    return () => {
      active = false
    }
  }, [
    canLoadOffers,
    copy.errors.currencyUnsupported,
    copy.errors.offers,
    defaultViewerCurrencyCode,
    filterState,
    offersReloadKey,
    schema,
  ])

  const listBlockedState = useMemo(() => {
    if (gamesStatus === 'loading' && !games.length) return 'loading'
    if (gamesStatus === 'error') return 'blocked'
    if (!filterState.gameSlug) return 'blocked'
    if (categoriesStatus === 'loading') return 'loading'
    if (categoriesStatus === 'error') return 'blocked'
    if (!filterState.categorySlug) return 'blocked'
    if (!selectedCurrencyIsSupported) return 'loading'
    if (schemaStatus === 'idle') return 'loading'
    if (schemaStatus === 'loading') return 'loading'
    if (schemaStatus === 'error') return 'blocked'
    return null
  }, [
    categoriesStatus,
    filterState.categorySlug,
    filterState.gameSlug,
    games.length,
    gamesStatus,
    schemaStatus,
    selectedCurrencyIsSupported,
  ])

  function updateFilters(patch, options = {}) {
    setOpeningOfferError('')
    if (
      typeof patch !== 'function' &&
      Object.prototype.hasOwnProperty.call(patch, 'viewerCurrencyCode')
    ) {
      setCurrencyNotice('')
    }
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
    const offerCode = offer?.publicCode || offer?.id
    if (!offerCode || openingOfferId) return

    if (offer?.offerVersion == null || offer?.price?.amount == null) {
      setOpeningOfferError(copy.errors.quoteCreate || copy.errors.offerDetails || copy.errors.offers)
      return
    }

    setOpeningOfferError('')
    setOpeningOfferId(offerCode)

    try {
      const response = await createMarketOfferQuote(offerCode, {
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
    const defaultGameSlug = resolveDefaultGameSlug(games)
    const defaultCategorySlug =
      defaultGameSlug && defaultGameSlug === filterState.gameSlug
        ? resolveDefaultCategorySlug(categories)
        : ''

    setSelectedOfferSnapshot(null)
    setOpeningOfferError('')
    setCurrencyNotice('')
    setMarketSearchFilters(defaultGameSlug, defaultCategorySlug)
    setCategories(defaultGameSlug === filterState.gameSlug ? categories : [])
    setCategoriesStatus(defaultGameSlug === filterState.gameSlug ? categoriesStatus : 'idle')
    setCategoriesError('')
    setSchema(null)
    setSchemaStatus('idle')
    setSchemaError('')
    resetMarketResults()
    setFilterState(
      createMarketFilterState({
        viewerCurrencyCode: defaultViewerCurrencyCode,
        gameSlug: defaultGameSlug,
        categorySlug: defaultCategorySlug,
      })
    )
  }

  return (
    <div className="market-page market-page--workspace">
      <MarketToolbar
        copy={copy}
      />

      <div className="market-workspace">
        <MarketSidebar
          copy={copy}
          filterState={filterState}
          games={games}
          gamesStatus={gamesStatus}
          gamesError={gamesError}
          categories={categories}
          viewerCurrencies={viewerCurrencies}
          currenciesStatus={currenciesStatus}
          currenciesError={currencyNotice || currenciesError}
          sortOptions={MARKET_SORT_OPTIONS}
          schemaFilters={schemaFilters}
          categoriesStatus={categoriesStatus}
          categoriesError={categoriesError}
          schemaStatus={schemaStatus}
          schemaError={schemaError}
          onIntentChange={(intent) =>
            updateFilters({ intent, sort: resolveMarketDefaultSort(intent) })
          }
          onGameChange={(gameSlug) => {
            const nextGameSlug = gameSlug || ''
            setSelectedOfferSnapshot(null)
            setOpeningOfferError('')
            setCategories([])
            setCategoriesStatus('idle')
            setCategoriesError('')
            setSchema(null)
            setSchemaStatus('idle')
            setSchemaError('')
            setMarketSearchFilters(nextGameSlug, '')
            resetMarketResults()
            updateFilters({
              gameSlug: nextGameSlug,
              categorySlug: '',
            })
          }}
          onCategoryChange={(categorySlug) => {
            const nextCategorySlug = categorySlug || ''

            setSelectedOfferSnapshot(null)
            setOpeningOfferError('')
            setSchema(null)
            setSchemaStatus('idle')
            setSchemaError('')
            setMarketSearchFilters(filterState.gameSlug, nextCategorySlug)
            resetMarketResults()
            updateFilters({ categorySlug: nextCategorySlug })
          }}
          onViewerCurrencyChange={(viewerCurrencyCode) =>
            updateFilters({ viewerCurrencyCode })
          }
          onDynamicFilterChange={(stateKey, value) => updateFilters({ [stateKey]: value })}
          onSortChange={(sort) => updateFilters({ sort })}
          onReset={handleReset}
          onRetryGames={() => setGamesReloadKey((value) => value + 1)}
          onRetryCurrencies={() => setCurrenciesReloadKey((value) => value + 1)}
          onRetryCategories={() => setCategoriesReloadKey((value) => value + 1)}
          onRetrySchema={() => setSchemaReloadKey((value) => value + 1)}
        />

        <section className="market-results">
          <MarketOffersTable
            copy={copy}
            language={language}
            intent={filterState.intent}
            viewerCurrencyCode={filterState.viewerCurrencyCode}
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
        </section>
      </div>

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
