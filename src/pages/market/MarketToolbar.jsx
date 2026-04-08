import { MARKET_SUPPORTED_CATEGORY } from './marketFilters'
import { resolveMarketIntentLabel } from './marketPresentation'

function ToolbarField({ label, children }) {
  return (
    <label className="field market-toolbar__field">
      <span className="field__label">{label}</span>
      {children}
    </label>
  )
}

function ToolbarSkeletonRow({ count = 3 }) {
  return (
    <div className="market-toolbar__row">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="market-toolbar__field">
          <div className="skeleton market-skeleton market-skeleton--label" />
          <div className="skeleton market-skeleton market-skeleton--control" />
        </div>
      ))}
    </div>
  )
}

function IntentToggle({ copy, value, onChange }) {
  const options = ['buy', 'sell']

  return (
    <div className="market-intent-toggle" role="tablist" aria-label={copy.toolbar.intent}>
      {options.map((option) => {
        const isActive = value === option
        return (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`market-intent-toggle__item ${isActive ? 'is-active' : ''}`}
            onClick={() => onChange(option)}
          >
            {resolveMarketIntentLabel(option, copy)}
          </button>
        )
      })}
    </div>
  )
}

export default function MarketToolbar({
  copy,
  filterState,
  games,
  categories,
  viewerCurrencies,
  sortOptions,
  schemaFilters,
  categoriesStatus,
  categoriesError,
  schemaStatus,
  schemaError,
  isUnsupportedCategory,
  onIntentChange,
  onGameChange,
  onCategoryChange,
  onViewerCurrencyChange,
  onDynamicFilterChange,
  onSortChange,
  onReset,
  onRetryCategories,
  onRetrySchema,
}) {
  const showSchemaSkeleton = schemaStatus === 'loading' && schemaFilters.allFilters.length === 0

  return (
    <div className="market-toolbar">
      <div className="market-toolbar__row market-toolbar__row--top">
        <ToolbarField label={copy.toolbar.intent}>
          <IntentToggle copy={copy} value={filterState.intent} onChange={onIntentChange} />
        </ToolbarField>

        <ToolbarField label={copy.toolbar.game}>
          <select
            className="input"
            value={filterState.gameSlug}
            onChange={(event) => onGameChange(event.target.value)}
            disabled={!games.length}
          >
            {!games.length ? (
              <option value="">{copy.common.allGames}</option>
            ) : null}
            {games.map((game) => (
              <option key={game.slug} value={game.slug}>
                {game.title}
              </option>
            ))}
          </select>
        </ToolbarField>

        <ToolbarField label={copy.toolbar.category}>
          <select
            className="input"
            value={filterState.categorySlug}
            onChange={(event) => onCategoryChange(event.target.value)}
            disabled={!categories.length || categoriesStatus === 'loading'}
          >
            {!categories.length ? (
              <option value="">
                {categoriesStatus === 'loading'
                  ? copy.toolbar.categoriesLoading
                  : copy.common.noCategories}
              </option>
            ) : null}
            {categories.map((category) => {
              const isSupported = category.slug === MARKET_SUPPORTED_CATEGORY
              return (
                <option key={category.slug} value={category.slug} disabled={!isSupported}>
                  {isSupported ? category.title : `${category.title} (${copy.common.comingSoon})`}
                </option>
              )
            })}
          </select>
        </ToolbarField>

        <ToolbarField label={copy.toolbar.viewerCurrency}>
          <select
            className="input"
            value={filterState.viewerCurrencyCode}
            onChange={(event) => onViewerCurrencyChange(event.target.value)}
          >
            {viewerCurrencies.map((currencyCode) => (
              <option key={currencyCode} value={currencyCode}>
                {currencyCode}
              </option>
            ))}
          </select>
        </ToolbarField>
      </div>

      {categoriesError ? (
        <div className="error market-toolbar__notice">
          <span>{categoriesError}</span>
          <button type="button" className="btn btn--ghost" onClick={onRetryCategories}>
            {copy.common.retry}
          </button>
        </div>
      ) : null}

      {isUnsupportedCategory ? (
        <div className="notice market-toolbar__notice">
          <span>
            <strong>{copy.unsupportedCategoryTitle}.</strong> {copy.unsupportedCategoryText}
          </span>
        </div>
      ) : null}

      {showSchemaSkeleton ? <ToolbarSkeletonRow count={3} /> : null}

      {schemaStatus === 'ready' && schemaFilters.allFilters.length > 0 ? (
        <div className="market-toolbar__row market-toolbar__row--filters">
          {schemaFilters.contextFilters.map((filter) => (
            <ToolbarField key={filter.stateKey} label={filter.title}>
              <select
                className="input"
                value={filterState[filter.stateKey] || ''}
                onChange={(event) =>
                  onDynamicFilterChange(filter.stateKey, event.target.value)
                }
              >
                <option value="">{copy.common.noValue}</option>
                {filter.options.map((option) => (
                  <option key={option.slug} value={option.slug}>
                    {option.title}
                  </option>
                ))}
              </select>
            </ToolbarField>
          ))}

          {schemaFilters.attributeFilters.map((filter) => (
            <ToolbarField key={filter.stateKey} label={filter.title}>
              <select
                className="input"
                value={filterState[filter.stateKey] || ''}
                onChange={(event) =>
                  onDynamicFilterChange(filter.stateKey, event.target.value)
                }
              >
                <option value="">{copy.common.noValue}</option>
                {filter.options.map((option) => (
                  <option key={option.slug} value={option.slug}>
                    {option.title}
                  </option>
                ))}
              </select>
            </ToolbarField>
          ))}
        </div>
      ) : null}

      {schemaError ? (
        <div className="error market-toolbar__notice">
          <span>{schemaError}</span>
          <button type="button" className="btn btn--ghost" onClick={onRetrySchema}>
            {copy.common.retry}
          </button>
        </div>
      ) : null}

      <div className="market-toolbar__row market-toolbar__row--bottom">
        <ToolbarField label={copy.toolbar.sort}>
          <select
            className="input"
            value={filterState.sort}
            onChange={(event) => onSortChange(event.target.value)}
          >
            {sortOptions.map((sortKey) => (
              <option key={sortKey} value={sortKey}>
                {copy.sort[sortKey] || sortKey}
              </option>
            ))}
          </select>
        </ToolbarField>

        <div className="market-toolbar__actions">
          <button type="button" className="btn btn--ghost" onClick={onReset}>
            {copy.common.reset}
          </button>
        </div>
      </div>
    </div>
  )
}
