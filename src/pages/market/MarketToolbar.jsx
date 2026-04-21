import { MARKET_SUPPORTED_CATEGORY } from './marketFilters'
import { resolveMarketIntentLabel } from './marketPresentation'

function FieldShell({ label, children }) {
  return (
    <label className="market-field">
      <span className="market-field__label">{label}</span>
      {children}
    </label>
  )
}

function IntentToggle({ copy, value, onChange, dense = false }) {
  const options = [
    {
      value: 'buy',
      label: resolveMarketIntentLabel('buy', copy),
      hint: copy.toolbar.buyHint,
    },
    {
      value: 'sell',
      label: resolveMarketIntentLabel('sell', copy),
      hint: copy.toolbar.sellHint,
    },
  ]

  return (
    <div className={`market-intent ${dense ? 'market-intent--dense' : ''}`}>
      <div className="market-section-label">{copy.toolbar.intentPrompt}</div>
      <div className="market-intent__toggle" role="tablist" aria-label={copy.toolbar.intent}>
        {options.map((option) => {
          const isActive = value === option.value

          return (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`market-intent__item market-intent__item--${option.value} ${
                isActive ? 'is-active' : ''
              }`}
              onClick={() => onChange(option.value)}
            >
              <span className="market-intent__label">{option.label}</span>
              {!dense ? <span className="market-intent__hint">{option.hint}</span> : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function CurrencyDisplayPicker({
  copy,
  value,
  options,
  status,
  onChange,
}) {
  const isLoading = status === 'loading'
  const currencyOptions = Array.isArray(options) ? options : []

  return (
    <FieldShell label={copy.toolbar.viewerCurrency}>
      <select
        className="input market-filter-select"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={isLoading || !currencyOptions.length}
        aria-label={copy.toolbar.viewerCurrency}
      >
        {isLoading ? (
          <option value={value}>{copy.toolbar.viewerCurrencyLoading}</option>
        ) : null}
        {currencyOptions.map((currency) => (
          <option key={currency.code} value={currency.code}>
            {currency.code}
            {currency.title && currency.title !== currency.code ? ` - ${currency.title}` : ''}
          </option>
        ))}
      </select>
    </FieldShell>
  )
}

function GamePicker({
  copy,
  games,
  gamesStatus,
  selectedGameSlug,
  onGameChange,
}) {
  const isLoading = gamesStatus === 'loading'
  const hasSelectedGame = games.some((game) => game?.slug === selectedGameSlug)

  return (
    <FieldShell label={copy.toolbar.game}>
      <select
        className="input market-filter-select"
        value={selectedGameSlug || ''}
        onChange={(event) => onGameChange(event.target.value)}
        disabled={isLoading || !games.length}
        aria-label={copy.toolbar.game}
      >
        {isLoading ? (
          <option value={selectedGameSlug || ''}>{copy.toolbar.gamesLoading}</option>
        ) : null}
        {!isLoading && !hasSelectedGame ? (
          <option value="">{copy.toolbar.selectGame}</option>
        ) : null}
        {games.map((game) => (
          <option key={game.slug} value={game.slug}>
            {game.title}
          </option>
        ))}
      </select>
    </FieldShell>
  )
}

function CategoryChips({
  copy,
  categories,
  categoriesStatus,
  selectedCategorySlug,
  onCategoryChange,
}) {
  if (categoriesStatus === 'loading') {
    return (
      <div className="market-category">
        <div className="market-section-label">{copy.toolbar.category}</div>
        <div className="market-category__chips">
          {Array.from({ length: 4 }).map((_, index) => (
            <span key={index} className="market-category__skeleton skeleton" />
          ))}
        </div>
      </div>
    )
  }

  if (!categories.length) {
    return (
      <div className="market-category">
        <div className="market-section-label">{copy.toolbar.category}</div>
        <div className="market-picker-empty">{copy.common.noCategories}</div>
      </div>
    )
  }

  return (
    <div className="market-category">
      <div className="market-section-label">{copy.toolbar.category}</div>
      <div className="market-category__chips">
        {categories.map((category) => {
          const isSelected = selectedCategorySlug === category.slug
          const isSupported = category.slug === MARKET_SUPPORTED_CATEGORY

          return (
            <button
              key={category.slug}
              type="button"
              className={`market-category__chip ${isSelected ? 'is-active' : ''} ${
                !isSupported ? 'is-disabled' : ''
              }`}
              onClick={() => {
                if (isSupported) onCategoryChange(category.slug)
              }}
              disabled={!isSupported}
              aria-disabled={!isSupported}
              title={isSupported ? copy.category.currencyDescription : copy.category.soonDescription}
            >
              <span>{category.title || category.slug}</span>
              {!isSupported ? <small>{copy.common.comingSoon}</small> : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function FilterSelect({ copy, filter, value, onChange }) {
  return (
    <FieldShell label={filter.title}>
      <select
        className="input market-filter-select"
        value={value || ''}
        onChange={(event) => onChange(filter.stateKey, event.target.value)}
      >
        <option value="">{copy.common.noValue}</option>
        {filter.options.map((option) => (
          <option key={option.slug} value={option.slug}>
            {option.title}
          </option>
        ))}
      </select>
    </FieldShell>
  )
}

function FilterSkeletonRow() {
  return (
    <div className="market-filter-stack">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="market-field">
          <div className="skeleton market-skeleton market-skeleton--label" />
          <div className="skeleton market-skeleton market-skeleton--control" />
        </div>
      ))}
    </div>
  )
}

function MarketNotice({ error, onRetry, copy }) {
  if (!error) return null

  return (
    <div className="error market-toolbar__notice">
      <span>{error}</span>
      {onRetry ? (
        <button type="button" className="btn btn--ghost" onClick={onRetry}>
          {copy.common.retry}
        </button>
      ) : null}
    </div>
  )
}

export function MarketSidebar({
  copy,
  filterState,
  games,
  gamesStatus,
  gamesError,
  categories,
  viewerCurrencies,
  currenciesStatus,
  currenciesError,
  sortOptions,
  schemaFilters,
  categoriesStatus,
  categoriesError,
  schemaStatus,
  schemaError,
  onIntentChange,
  onGameChange,
  onCategoryChange,
  onViewerCurrencyChange,
  onDynamicFilterChange,
  onSortChange,
  onReset,
  onRetryGames,
  onRetryCurrencies,
  onRetryCategories,
  onRetrySchema,
}) {
  const isSupportedCategory = filterState.categorySlug === MARKET_SUPPORTED_CATEGORY
  const showAdvancedControls = Boolean(filterState.categorySlug && isSupportedCategory)
  const showSchemaSkeleton =
    showAdvancedControls && schemaStatus === 'loading' && schemaFilters.allFilters.length === 0
  const dynamicFilters = [
    ...schemaFilters.contextFilters,
    ...schemaFilters.attributeFilters,
  ]

  return (
    <aside className="market-sidebar">
      <div className="market-sidebar__body">
        <div className="market-sidebar__section">
          <IntentToggle
            copy={copy}
            value={filterState.intent}
            onChange={onIntentChange}
            dense
          />
        </div>

        <div className="market-sidebar__section">
          <GamePicker
            copy={copy}
            games={games}
            gamesStatus={gamesStatus}
            selectedGameSlug={filterState.gameSlug}
            onGameChange={onGameChange}
          />
          <MarketNotice error={gamesError} onRetry={onRetryGames} copy={copy} />
        </div>

        <div className="market-sidebar__section">
          <CurrencyDisplayPicker
            copy={copy}
            value={filterState.viewerCurrencyCode}
            options={viewerCurrencies}
            status={currenciesStatus}
            onChange={onViewerCurrencyChange}
          />
          <MarketNotice error={currenciesError} onRetry={onRetryCurrencies} copy={copy} />
        </div>

        <div className="market-sidebar__section">
          <CategoryChips
            copy={copy}
            categories={categories}
            categoriesStatus={categoriesStatus}
            selectedCategorySlug={filterState.categorySlug}
            onCategoryChange={onCategoryChange}
          />
          <MarketNotice error={categoriesError} onRetry={onRetryCategories} copy={copy} />
        </div>

        <div className="market-sidebar__section">
          {showSchemaSkeleton ? <FilterSkeletonRow /> : null}

          {schemaStatus === 'ready' ? (
            <div className="market-filter-stack">
              {dynamicFilters.map((filter) => (
                <FilterSelect
                  key={filter.stateKey}
                  copy={copy}
                  filter={filter}
                  value={filterState[filter.stateKey]}
                  onChange={onDynamicFilterChange}
                />
              ))}

              <FieldShell label={copy.toolbar.sort}>
                <select
                  className="input market-filter-select"
                  value={filterState.sort}
                  onChange={(event) => onSortChange(event.target.value)}
                >
                  {sortOptions.map((sortKey) => (
                    <option key={sortKey} value={sortKey}>
                      {copy.sort[sortKey] || sortKey}
                    </option>
                  ))}
                </select>
              </FieldShell>
            </div>
          ) : null}

          <MarketNotice error={schemaError} onRetry={onRetrySchema} copy={copy} />
        </div>

        <button type="button" className="btn btn--ghost market-reset-btn" onClick={onReset}>
          {copy.common.reset}
        </button>
      </div>
    </aside>
  )
}

export default function MarketToolbar({
  copy,
}) {
  return (
    <section className="market-control-shell">
      <div className="market-control-header">
        <div className="market-control-title">
          <div className="market-panel__eyebrow">{copy.eyebrow}</div>
          <h1 className="h1 market-panel__title">{copy.title}</h1>
          <p className="market-panel__subtitle">{copy.subtitle}</p>
        </div>
      </div>
    </section>
  )
}
