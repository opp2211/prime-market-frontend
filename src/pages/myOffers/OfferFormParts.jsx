export function Field({ label, hint, error, required, children }) {
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

export function SectionCard({ title, description, children }) {
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

export function PillChoiceGroup({ options, value, onChange }) {
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

export function MultiPillGroup({ options, value, onToggle, variant = 'default', copy }) {
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

export function BooleanField({ label, hint, value, error, onChange }) {
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

export function SummaryItem({ label, value }) {
  return (
    <div className="offer-summary__item">
      <div className="offer-summary__label">{label}</div>
      <div className="offer-summary__value">{value}</div>
    </div>
  )
}

export function OfferFormSkeleton() {
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
