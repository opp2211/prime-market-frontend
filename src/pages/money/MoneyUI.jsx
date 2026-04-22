import Button from '../../shared/ui/Button'
import { getMethodFieldDefinitions } from './moneyFields'

export function MoneyPageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <div className="money-page-header">
      <div className="money-page-header__copy">
        {eyebrow ? <div className="money-page-header__eyebrow">{eyebrow}</div> : null}
        <h1 className="h1 money-page-header__title">{title}</h1>
        {subtitle ? <p className="money-page-header__subtitle">{subtitle}</p> : null}
      </div>
      {actions ? <div className="money-page-header__actions">{actions}</div> : null}
    </div>
  )
}

export function MoneyStateCard({ title, text, tone = 'muted', action }) {
  return (
    <div className={`card money-state money-state--${tone}`}>
      <div className="money-state__title">{title}</div>
      {text ? <div className="money-state__text">{text}</div> : null}
      {action ? <div className="money-state__actions">{action}</div> : null}
    </div>
  )
}

export function MoneyStatusChip({ tone = 'muted', children }) {
  return <span className={`status-chip status-chip--${tone}`}>{children}</span>
}

export function MoneyPagination({ page, totalPages, onPageChange, copy }) {
  if (!totalPages || totalPages <= 1) return null

  return (
    <div className="money-pagination">
      <Button
        type="button"
        variant="secondary"
        disabled={page <= 0}
        onClick={() => onPageChange(page - 1)}
      >
        {copy.common.previousPage}
      </Button>
      <div className="money-pagination__summary">
        {copy.common.page} {page + 1} {copy.common.of} {totalPages}
      </div>
      <Button
        type="button"
        variant="secondary"
        disabled={page >= totalPages - 1}
        onClick={() => onPageChange(page + 1)}
      >
        {copy.common.nextPage}
      </Button>
    </div>
  )
}

export function MoneyDetailList({ items }) {
  if (!Array.isArray(items) || items.length === 0) return null

  return (
    <div className="money-detail-list">
      {items.map((item) => (
        <div className="money-detail-list__row" key={item.label}>
          <div className="money-detail-list__label">{item.label}</div>
          <div className="money-detail-list__value">{item.value}</div>
        </div>
      ))}
    </div>
  )
}

export function MoneyTimeline({ items, emptyLabel }) {
  if (!Array.isArray(items) || items.length === 0) {
    return <div className="muted">{emptyLabel}</div>
  }

  return (
    <div className="money-timeline">
      {items.map((item) => (
        <div className="money-timeline__item" key={`${item.label}-${item.value}`}>
          <div className="money-timeline__dot" aria-hidden="true" />
          <div className="money-timeline__content">
            <div className="money-timeline__label">{item.label}</div>
            <div className="money-timeline__value">{item.value}</div>
            {item.caption ? <div className="money-timeline__caption">{item.caption}</div> : null}
          </div>
        </div>
      ))}
    </div>
  )
}

export function MoneyRequisitesFields({ method, values, errors, onChange, copy }) {
  const fields = getMethodFieldDefinitions(method, copy)

  return (
    <div className="money-form-grid">
      {fields.map((field) => (
        <label className="field" key={field.name}>
          <span className="field__label">{field.label}</span>
          {field.type === 'select' ? (
            <select
              className="input"
              value={values?.[field.name] || ''}
              onChange={(event) => onChange(field.name, event.target.value)}
            >
              <option value="">{field.placeholder}</option>
              {field.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : (
            <input
              className="input"
              type={field.type}
              value={values?.[field.name] || ''}
              autoComplete={field.autoComplete}
              placeholder={field.placeholder}
              onChange={(event) => onChange(field.name, event.target.value)}
            />
          )}
          {errors?.[field.name] ? (
            <span className="money-form-error">{errors[field.name]}</span>
          ) : null}
        </label>
      ))}
    </div>
  )
}
