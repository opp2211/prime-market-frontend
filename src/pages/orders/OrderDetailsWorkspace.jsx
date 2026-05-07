import {
  formatOrderDateTime,
  formatOrderNumber,
  getFinancialDetailRows,
  getFinancialMetaRows,
  getFinancialPrimary,
  resolveOrderCounterparty,
  resolveOrderDeliveryMetrics,
  resolveOrderFilterLabel,
  resolveOrderRouteId,
  resolveOrderStatusLabel,
  resolveOrderStatusTone,
} from './orderPresentation'

function OrderField({ label, value }) {
  return (
    <div className="order-field">
      <div className="order-field__label">{label}</div>
      <div className="order-field__value">{value}</div>
    </div>
  )
}

function OrderTags({ items, emptyLabel }) {
  if (!items.length) {
    return <div className="muted">{emptyLabel}</div>
  }

  return (
    <div className="order-tag-list">
      {items.map((item) => (
        <span key={item} className="order-tag">
          {item}
        </span>
      ))}
    </div>
  )
}

function OrderTextSection({ value, emptyLabel }) {
  if (!value) {
    return <div className="muted">{emptyLabel}</div>
  }

  return <div className="order-text-block">{value}</div>
}

export function OrderSummaryRailCard({ copy, language, order }) {
  const financialPrimary = getFinancialPrimary(order, language)
  const financialMetaRows = getFinancialMetaRows(order, language)
  const visibleRows = [
    ...financialMetaRows,
    {
      key: 'counterparty',
      label: copy.details.counterparty,
      value: resolveOrderCounterparty(order, language),
    },
    {
      key: 'updatedAt',
      label: copy.details.updatedAt,
      value: formatOrderDateTime(order?.updatedAt, language),
    },
  ]

  return (
    <section className="card order-command-card order-command-card--overview">
      <div className="order-command-card__head">
        <h2 className="order-command-card__title">{copy.details.summaryTitle}</h2>
      </div>

      <div className="order-overview-amount">
        <div className="order-overview-amount__label">
          {financialPrimary.label}
        </div>
        <div className="order-overview-amount__value">{financialPrimary.value}</div>
      </div>

      <div className="order-overview-metrics">
        {visibleRows.map((row) => (
          <div key={row.key} className="order-overview-metric">
            <div className="order-overview-metric__label">{row.label}</div>
            <div className="order-overview-metric__value">{row.value}</div>
          </div>
        ))}
      </div>

      <OrderDeliveryProgressSection copy={copy} language={language} order={order} />
    </section>
  )
}

function OrderDeliveryProgressSection({ copy, language, order }) {
  const metrics = resolveOrderDeliveryMetrics(order)
  const status = (order?.status || '').toString().trim().toLowerCase()
  const myRole = (order?.myRole || '').toString().trim().toLowerCase()
  const statusTone = resolveOrderStatusTone(order?.status)
  const orderedLabel = formatOrderNumber(metrics.orderedQuantity, language, 4)
  const deliveredLabel = formatOrderNumber(metrics.displayDeliveredQuantity, language, 4)
  const completionLabel = formatOrderNumber(metrics.progressPercent, language, 0)

  let helperText =
    myRole === 'seller'
      ? copy.details.progress.sellerReported(deliveredLabel, orderedLabel)
      : copy.details.progress.buyerReported(deliveredLabel, orderedLabel)

  if (status === 'delivered') {
    helperText =
      myRole === 'seller'
        ? copy.details.progress.sellerDelivered
        : copy.details.progress.buyerDelivered
  }

  if (status === 'completed') {
    helperText =
      myRole === 'seller'
        ? copy.details.progress.sellerCompleted
        : copy.details.progress.buyerCompleted
  }

  return (
    <section className="order-progress-inline">
      <div className="order-progress order-progress--compact">
        <div className="order-progress__summary">
          <div className="order-progress__summary-main">
            <div className="order-progress__eyebrow">{copy.details.progress.title}</div>
            <div className="order-progress__value">
              {copy.details.progress.deliveredOfTotal(deliveredLabel, orderedLabel)}
            </div>
            <p className="order-progress__helper">{helperText}</p>
          </div>

          <div className="order-progress__summary-side">
            <span className={`status-chip status-chip--${statusTone}`}>
              {resolveOrderStatusLabel(order?.status, language)}
            </span>
            <div className="order-progress__completion">
              {copy.details.progress.completionLabel(completionLabel)}
            </div>
          </div>
        </div>

        <div
          className="order-progress__meter"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={metrics.progressPercent}
          aria-label={copy.details.progress.title}
        >
          <div
            className={`order-progress__meter-fill order-progress__meter-fill--${statusTone}`}
            style={{ width: `${Math.max(0, Math.min(metrics.progressPercent, 100))}%` }}
          />
        </div>
      </div>
    </section>
  )
}

export function OrderWorkspaceTabButton({ activeTab, tabId, label, onSelect }) {
  const isActive = activeTab === tabId

  return (
    <button
      type="button"
      className={`order-workspace-tab${isActive ? ' is-active' : ''}`}
      role="tab"
      aria-selected={isActive}
      tabIndex={isActive ? 0 : -1}
      onClick={() => onSelect(tabId)}
    >
      {label}
    </button>
  )
}

function OrderDetailsGroup({ title, children }) {
  return (
    <section className="order-details-group">
      <h3 className="order-details-group__title">{title}</h3>
      <div className="order-details-group__body">{children}</div>
    </section>
  )
}

export function OrderWorkspaceDetailsTab({
  copy,
  workspaceCopy,
  language,
  order,
  contextItems,
  attributeItems,
  deliveryItems,
}) {
  const financialDetailRows = getFinancialDetailRows(order, language)

  return (
    <div className="order-workspace-details">
      <OrderDetailsGroup title={workspaceCopy.details.commercial}>
        <div className="order-field-grid order-field-grid--3">
          <OrderField
            label={copy.details.fields.orderedQuantity}
            value={formatOrderNumber(order?.orderedQuantity, language, 4)}
          />
          <OrderField
            label={copy.details.fields.deliveredQuantity}
            value={formatOrderNumber(order?.deliveredQuantity, language, 4)}
          />
          {financialDetailRows.map((row) => (
            <OrderField key={row.key} label={row.label} value={row.value} />
          ))}
        </div>
      </OrderDetailsGroup>

      <OrderDetailsGroup title={workspaceCopy.details.item}>
        <div className="order-field-grid order-field-grid--2">
          <OrderField
            label={copy.details.fields.game}
            value={order?.game?.title || copy.common.noValue}
          />
          <OrderField
            label={copy.details.fields.category}
            value={order?.category?.title || copy.common.noValue}
          />
          <div className="order-field order-field--stacked">
            <div className="order-field__label">{copy.details.fields.contexts}</div>
            <OrderTags items={contextItems} emptyLabel={copy.details.emptyText} />
          </div>
          <div className="order-field order-field--stacked">
            <div className="order-field__label">{copy.details.fields.attributes}</div>
            <OrderTags items={attributeItems} emptyLabel={copy.details.emptyText} />
          </div>
          <div className="order-field order-field--stacked order-field--wide">
            <div className="order-field__label">{copy.details.fields.deliveryMethods}</div>
            <OrderTags items={deliveryItems} emptyLabel={copy.details.emptyText} />
          </div>
        </div>
      </OrderDetailsGroup>

      <OrderDetailsGroup title={workspaceCopy.details.parties}>
        <div className="order-field-grid order-field-grid--3">
          <OrderField
            label={copy.details.fields.counterparty}
            value={resolveOrderCounterparty(order, language)}
          />
          <OrderField
            label={copy.details.fields.myRole}
            value={resolveOrderFilterLabel('role', order?.myRole, language)}
          />
          <OrderField
            label={copy.details.fields.counterpartyRole}
            value={resolveOrderFilterLabel('role', order?.counterpartyRole, language)}
          />
          <OrderField label={copy.details.orderId} value={resolveOrderRouteId(order)} />
          <OrderField
            label={copy.details.fields.createdAt}
            value={formatOrderDateTime(order?.createdAt, language)}
          />
          <OrderField
            label={copy.details.fields.updatedAt}
            value={formatOrderDateTime(order?.updatedAt, language)}
          />
          <OrderField
            label={copy.details.fields.expiresAt}
            value={formatOrderDateTime(order?.expiresAt, language)}
          />
        </div>
      </OrderDetailsGroup>

      <OrderDetailsGroup title={workspaceCopy.details.texts}>
        <div className="order-details-text-grid">
          <div>
            <div className="order-field__label order-details-text-label">
              {copy.details.sections.terms}
            </div>
            <OrderTextSection
              value={order?.tradeTerms}
              emptyLabel={copy.details.emptyText}
            />
          </div>
          <div>
            <div className="order-field__label order-details-text-label">
              {copy.details.sections.description}
            </div>
            <OrderTextSection
              value={order?.description}
              emptyLabel={copy.details.emptyText}
            />
          </div>
        </div>
      </OrderDetailsGroup>
    </div>
  )
}

export function OrderDetailsSkeleton() {
  return (
    <div className="order-page order-page--workspace">
      <div className="card order-header order-header--skeleton">
        <div className="skeleton order-skeleton order-skeleton--eyebrow" />
        <div className="skeleton order-skeleton order-skeleton--hero-title" />
        <div className="skeleton order-skeleton order-skeleton--hero-subtitle" />
      </div>

      <div className="order-dashboard-grid">
        <div className="order-dashboard-main">
          <div className="card order-command-card order-command-card--overview">
            <div className="skeleton order-skeleton order-skeleton--summary-value" />
            <div className="order-overview-metrics">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="skeleton order-skeleton order-skeleton--summary-stat"
                />
              ))}
            </div>
          </div>

          <section className="card order-workspace-panel">
            <div className="order-workspace-tabs" aria-hidden="true">
              {Array.from({ length: 2 }).map((_, index) => (
                <div
                  key={index}
                  className="skeleton order-skeleton order-skeleton--chat-tab"
                />
              ))}
            </div>

            <div className="order-workspace-panel__body">
              <div className="order-chat-panel">
                <div className="order-chat-panel__head">
                  <div className="skeleton order-skeleton order-skeleton--section-title" />
                </div>
                <div className="order-chat-messages">
                  <div className="order-chat-skeleton">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={index}
                        className={`order-chat-skeleton__row${
                          index % 2 === 1 ? ' order-chat-skeleton__row--mine' : ''
                        }`}
                      >
                        <div className="skeleton order-skeleton order-skeleton--chat-meta" />
                        <div className="skeleton order-skeleton order-skeleton--chat-bubble" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <aside className="order-dashboard-aside">
          <div className="card order-command-card order-command-card--actions">
            <div className="skeleton order-skeleton order-skeleton--section-title" />
            <div className="skeleton order-skeleton order-skeleton--button" />
            <div className="skeleton order-skeleton order-skeleton--button" />
          </div>

          <div className="card order-timeline-card">
            <div className="skeleton order-skeleton order-skeleton--section-title" />
            <div className="skeleton order-skeleton order-skeleton--section-block" />
          </div>
        </aside>
      </div>
    </div>
  )
}
