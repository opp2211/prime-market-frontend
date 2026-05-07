import { useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './WalletExperience.module.css'

function classNames(...names) {
  return names
    .filter(Boolean)
    .map((name) => styles[name] || name)
    .join(' ')
}

function getWalletExperienceClassName() {
  return classNames('account-page', 'wallet-lab-page', 'wallet-lab-page--standalone')
}

export function WalletExperienceFrame({ children }) {
  return <div className={getWalletExperienceClassName()}>{children}</div>
}
function formatAmount(value) {
  const numberValue = Number(value)
  if (!Number.isFinite(numberValue)) return '0,00'

  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numberValue)
}

function formatMoney(value, currency, { dashZero = false } = {}) {
  const numberValue = Number(value || 0)
  if (dashZero && Math.abs(numberValue) === 0) return '—'
  return `${formatAmount(numberValue)} ${currency}`
}

function formatSignedAmount(value, currency) {
  const sign = value > 0 ? '+' : ''
  return `${sign}${formatAmount(value)} ${currency}`
}

function getAmountTone(value) {
  if (value > 0) return 'positive'
  if (value < 0) return 'negative'
  return 'neutral'
}

function hasWalletValue(wallet) {
  return (
    Math.abs(Number(wallet?.balance || 0)) > 0 ||
    Math.abs(Number(wallet?.available || 0)) > 0 ||
    Math.abs(Number(wallet?.reserved || 0)) > 0
  )
}

function getOperationsLabel(count) {
  const normalized = Math.abs(Number(count) || 0)
  const mod10 = normalized % 10
  const mod100 = normalized % 100

  if (mod10 === 1 && mod100 !== 11) return `${normalized} операция`
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${normalized} операции`
  }
  return `${normalized} операций`
}

function aggregateAmountsByCurrency(items) {
  const amounts = new Map()

  items.forEach((item) => {
    const currency = item.currency || item.currencyCode || 'RUB'
    const amount = Number(item.amount || 0)
    amounts.set(currency, (amounts.get(currency) || 0) + amount)
  })

  return Array.from(amounts.entries()).map(([currency, amount]) => ({
    currency,
    amount,
  }))
}

function getWorkItemHref(item) {
  if (item.to) return item.to
  if (item.sourceType === 'ORDER' && item.refCode) return `/orders/${item.refCode}`
  if (item.sourceType === 'WITHDRAWAL_REQUEST' && item.refCode) {
    return `/money/withdrawal-requests/${item.refCode}`
  }
  if (item.sourceType === 'DEPOSIT_REQUEST' && item.refCode) {
    return `/money/deposit-requests/${item.refCode}`
  }
  if (item.sourceType === 'OFFER' && item.refId) return `/dashboard/offers/${item.refId}/edit`
  return '/money/wallet'
}

function getWorkItemLinkLabel(item) {
  if (item.linkLabel) return item.linkLabel
  if (item.sourceType === 'ORDER') return 'Открыть заказ'
  if (item.sourceType === 'WITHDRAWAL_REQUEST') return 'Открыть заявку'
  if (item.sourceType === 'OFFER') return 'Открыть предложение'
  if (item.sourceType === 'DEPOSIT_REQUEST') return 'Открыть пополнение'
  return 'Открыть'
}

function WalletLabActions({ compact = false }) {
  return (
    <div className={classNames('wallet-lab-actions', compact && 'wallet-lab-actions--compact')}>
      <Link className={classNames('wallet-lab-action-button', 'wallet-lab-action-button--primary')} to="/money/deposit">
        Пополнить
      </Link>
      <Link className={classNames('wallet-lab-action-button', 'wallet-lab-action-button--secondary')} to="/money/withdraw">
        Вывести
      </Link>
    </div>
  )
}

function WalletLabPrimaryMark({ isPrimary }) {
  if (!isPrimary) return null

  const tooltipText = 'Основная валюта отображается в шапке сайта и используется для сделок в маркете'

  return (
    <span
      className={classNames('wallet-lab-primary-mark')}
      tabIndex={0}
      aria-label={tooltipText}
      data-tooltip={tooltipText}
    >
      Основная
    </span>
  )
}

function WalletLabRowMenu({ wallet, isPrimary, isOpen, onToggle, onMakePrimary }) {
  return (
    <div className={classNames('wallet-lab-row-menu')}>
      <button
        type="button"
        className={classNames('wallet-lab-row-menu__trigger')}
        aria-label={`Действия для ${wallet.code}`}
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>
      {isOpen ? (
        <div className={classNames('wallet-lab-row-menu__panel')}>
          <button
            type="button"
            className={classNames(isPrimary && 'is-disabled')}
            onClick={onMakePrimary}
            disabled={isPrimary}
          >
            Сделать основной валютой
          </button>
          <Link to={`/money/deposit?currency=${wallet.code}`}>Пополнить</Link>
          <Link to={`/money/withdraw?currency=${wallet.code}`}>Вывести</Link>
          <Link to={`/money/convert?currency=${wallet.code}`}>Конвертировать</Link>
        </div>
      ) : null}
    </div>
  )
}

function WalletLabOverview({ primaryWallet }) {
  return (
    <section className={classNames('wallet-lab-overview')}>
      <div className={classNames('wallet-lab-overview__main')}>
        <span className={classNames('wallet-lab-overview__badge')}>
          Основная валюта <strong>{primaryWallet.code}</strong>
        </span>
        <h1>Доступно</h1>
        <strong className={classNames('wallet-lab-overview__amount')}>
          {formatMoney(primaryWallet.available, primaryWallet.code)}
        </strong>
      </div>
      <div className={classNames('wallet-lab-overview__meta')} aria-label="Сводка по основной валюте">
        <div>
          <span>Всего</span>
          <strong>{formatMoney(primaryWallet.balance, primaryWallet.code)}</strong>
        </div>
        <div>
          <span>В резерве</span>
          <strong>{formatMoney(primaryWallet.reserved, primaryWallet.code, { dashZero: true })}</strong>
        </div>
      </div>
      <WalletLabActions />
    </section>
  )
}

function WalletLabCurrencyFilter({ showZeroCurrencies, onToggleZeroCurrencies }) {
  return (
    <label className={classNames('wallet-lab-filter')}>
      <input
        type="checkbox"
        checked={showZeroCurrencies}
        onChange={() => onToggleZeroCurrencies?.()}
      />
      <span aria-hidden="true" />
      Отображать пустые
    </label>
  )
}

function WalletLabCurrencyList({
  wallets,
  primaryCurrencyCode,
  openMenuCode,
  onToggleMenu,
  onMakePrimary,
}) {
  if (wallets.length === 0) {
    return (
      <div className={classNames('wallet-lab-empty')}>
        <strong>Балансов пока нет</strong>
        <span>Когда появится активная валюта, она будет показана здесь.</span>
      </div>
    )
  }

  return (
    <div className={classNames('wallet-lab-wallet-list')}>
      {wallets.map((wallet) => {
        const isPrimary = wallet.code === primaryCurrencyCode
        const isEmpty = !hasWalletValue(wallet)
        const rowClassName = classNames(
          'wallet-lab-wallet-row',
          isPrimary && 'is-primary',
          isEmpty && 'is-empty'
        )

        return (
          <article className={rowClassName} key={wallet.code}>
            <div className={classNames('wallet-lab-wallet-row__currency')}>
              <span className={classNames('wallet-lab-wallet-row__code')}>{wallet.code}</span>
              <div>
                <strong>{wallet.name}</strong>
                <WalletLabPrimaryMark isPrimary={isPrimary} />
              </div>
            </div>
            <div className={classNames('wallet-lab-wallet-row__available')}>
              <span>Доступно</span>
              <strong>{formatMoney(wallet.available, wallet.code, { dashZero: true })}</strong>
            </div>
            <div className={classNames('wallet-lab-wallet-row__secondary')}>
              <span>
                Всего
                <strong>{formatMoney(wallet.balance, wallet.code, { dashZero: true })}</strong>
              </span>
              <span>
                В резерве
                <strong>{formatMoney(wallet.reserved, wallet.code, { dashZero: true })}</strong>
              </span>
            </div>
            <div className={classNames('wallet-lab-row-actions')}>
              <Link to={`/money/deposit?currency=${wallet.code}`}>Пополнить</Link>
              <Link to={`/money/withdraw?currency=${wallet.code}`}>Вывести</Link>
              <WalletLabRowMenu
                wallet={wallet}
                isPrimary={isPrimary}
                isOpen={openMenuCode === wallet.code}
                onToggle={() => onToggleMenu(wallet.code)}
                onMakePrimary={() => onMakePrimary(wallet.code)}
              />
            </div>
          </article>
        )
      })}
    </div>
  )
}

function WalletLabOperationModal({
  isOpen,
  onClose,
  title,
  subtitle,
  items = [],
  emptyText,
}) {
  if (!isOpen) return null

  const titleId = `wallet-lab-modal-${title}`

  return (
    <div className={classNames('wallet-lab-modal-backdrop')} role="presentation" onClick={onClose}>
      <section
        className={classNames('wallet-lab-modal')}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={classNames('wallet-lab-modal__head')}>
          <div>
            <h2 id={titleId}>{title}</h2>
            <p className={classNames('wallet-lab-modal__subtitle')}>{subtitle}</p>
          </div>
          <button type="button" onClick={onClose}>
            Закрыть
          </button>
        </div>
        <div className={classNames('wallet-lab-reserve-list')}>
          {items.length === 0 ? (
            <div className={classNames('wallet-lab-reserve-list__empty')}>{emptyText}</div>
          ) : null}
          {items.map((reason) => (
            <div className={classNames('wallet-lab-reserve-list__row')} key={reason.id}>
              <div>
                <strong>{reason.title}</strong>
                <span>{reason.description}</span>
              </div>
              <strong>{formatMoney(reason.amount, reason.currency || reason.currencyCode)}</strong>
              <Link to={getWorkItemHref(reason)}>{getWorkItemLinkLabel(reason)}</Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function WalletLabProcessRow({
  label,
  count,
  amounts,
  onClick,
}) {
  const className = classNames('wallet-lab-process-row')

  return (
    <button type="button" className={className} onClick={onClick}>
      <div>
        <strong className={classNames('wallet-lab-process-row__title')}>{label}</strong>
        <span className={classNames('wallet-lab-process-row__count')}>{getOperationsLabel(count)}</span>
      </div>
      <em className={classNames('wallet-lab-process-row__amounts')}>
        {amounts.length ? (
          amounts.map((item) => (
            <span key={item.currency}>{formatMoney(item.amount, item.currency)}</span>
          ))
        ) : (
          <span>Сумм нет</span>
        )}
      </em>
      <span className={classNames('wallet-lab-process-row__arrow')} aria-hidden="true">
        →
      </span>
    </button>
  )
}

function WalletLabProcessPanel({
  reserveItems,
  pendingDepositItems,
  workStatus,
  workError,
  onOpenReserveDetails,
  onOpenPendingDepositDetails,
}) {
  const reserveAmounts = aggregateAmountsByCurrency(reserveItems)
  const pendingDepositAmounts = aggregateAmountsByCurrency(pendingDepositItems)
  const hasReserveItems = reserveItems.length > 0
  const hasPendingDepositItems = pendingDepositItems.length > 0
  const hasActiveOperations = hasReserveItems || hasPendingDepositItems

  return (
    <aside className={classNames('wallet-lab-panel', 'wallet-lab-process-panel')}>
      <div className={classNames('wallet-lab-panel__head')}>
        <h2>Активные операции</h2>
      </div>
      {workStatus === 'loading' ? (
        <div className={classNames('wallet-lab-panel__state')}>Загрузка...</div>
      ) : null}
      {workStatus === 'error' ? (
        <div className={classNames('wallet-lab-panel__state', 'wallet-lab-panel__state--error')}>
          {workError || 'Не удалось загрузить данные'}
        </div>
      ) : null}
      {workStatus === 'ready' ? (
        <div className={classNames('wallet-lab-process-list')}>
          {hasReserveItems ? (
            <WalletLabProcessRow
              label="Зарезервировано"
              count={reserveItems.length}
              amounts={reserveAmounts}
              onClick={onOpenReserveDetails}
            />
          ) : null}
          {hasPendingDepositItems ? (
            <WalletLabProcessRow
              label="Ожидает зачисления"
              count={pendingDepositItems.length}
              amounts={pendingDepositAmounts}
              onClick={onOpenPendingDepositDetails}
            />
          ) : null}
          {!hasActiveOperations ? (
            <div className={classNames('wallet-lab-process-empty')}>Сейчас нет активных операций</div>
          ) : null}
        </div>
      ) : null}
    </aside>
  )
}

function WalletLabTransactions({
  title = 'Последние операции',
  transactions = [],
  status = 'ready',
  error = '',
  emptyText = 'Операций пока нет.',
}) {
  return (
    <section className={classNames('wallet-lab-section', 'wallet-lab-transactions-section')}>
      <div className={classNames('wallet-lab-section__head')}>
        <h2>{title}</h2>
        <Link to="/money/transactions">Вся история →</Link>
      </div>
      <div className={classNames('wallet-lab-ledger')}>
        {status === 'loading' ? <div className={classNames('wallet-lab-ledger__state')}>Загрузка...</div> : null}
        {status === 'error' ? <div className={classNames('wallet-lab-ledger__state', 'wallet-lab-ledger__state--error')}>{error}</div> : null}
        {status === 'ready' && transactions.length === 0 ? (
          <div className={classNames('wallet-lab-ledger__state')}>{emptyText}</div>
        ) : null}
        {status === 'ready' ? transactions.map((item) => (
          <div className={classNames('wallet-lab-ledger__row')} key={item.id}>
            <div>
              <strong>{item.type}</strong>
              <span>{item.target}</span>
            </div>
            <time>{item.date}</time>
            <strong className={classNames('wallet-lab-amount', `wallet-lab-amount--${getAmountTone(item.amount)}`)}>
              {formatSignedAmount(item.amount, item.currency)}
            </strong>
          </div>
        )) : null}
      </div>
    </section>
  )
}

function WalletLabLayout({
  wallets,
  primaryWallet,
  showZeroCurrencies,
  reserveItems = [],
  pendingDepositItems = [],
  transactions = [],
  transactionStatus = 'ready',
  transactionError = '',
  transactionEmptyText = 'Операций пока нет.',
  workStatus = 'ready',
  workError = '',
  isReserveModalOpen,
  isPendingDepositModalOpen,
  primaryCurrencyCode,
  openMenuCode,
  onToggleMenu,
  onMakePrimary,
  onToggleZeroCurrencies,
  onOpenReserveDetails,
  onCloseReserveDetails,
  onOpenPendingDepositDetails,
  onClosePendingDepositDetails,
}) {
  return (
    <section className={classNames('wallet-lab-stage')}>
      <header className={classNames('wallet-lab-page-head')}>
        <h1>Кошелек</h1>
      </header>
      <WalletLabOverview primaryWallet={primaryWallet} />

      <div className={classNames('wallet-lab-main-grid')}>
        <section className={classNames('wallet-lab-section', 'wallet-lab-wallets-section')}>
          <div className={classNames('wallet-lab-section__head', 'wallet-lab-section__head--with-action')}>
            <div>
              <h2>Все валюты</h2>
            </div>
            <WalletLabCurrencyFilter
              showZeroCurrencies={showZeroCurrencies}
              onToggleZeroCurrencies={onToggleZeroCurrencies}
            />
          </div>
          <WalletLabCurrencyList
            wallets={wallets}
            primaryCurrencyCode={primaryCurrencyCode}
            openMenuCode={openMenuCode}
            onToggleMenu={onToggleMenu}
            onMakePrimary={onMakePrimary}
          />
        </section>

        <WalletLabProcessPanel
          reserveItems={reserveItems}
          pendingDepositItems={pendingDepositItems}
          workStatus={workStatus}
          workError={workError}
          onOpenReserveDetails={onOpenReserveDetails}
          onOpenPendingDepositDetails={onOpenPendingDepositDetails}
        />
      </div>

      <WalletLabTransactions
        title="Последние операции"
        transactions={transactions}
        status={transactionStatus}
        error={transactionError}
        emptyText={transactionEmptyText}
      />
      <WalletLabOperationModal
        isOpen={isReserveModalOpen}
        onClose={onCloseReserveDetails}
        title="Резервы"
        subtitle="Операции, удерживающие баланс"
        items={reserveItems}
        emptyText="Зарезервированных средств сейчас нет."
      />
      <WalletLabOperationModal
        isOpen={isPendingDepositModalOpen}
        onClose={onClosePendingDepositDetails}
        title="Пополнения"
        subtitle="Активные пополнения, которые ожидают зачисления"
        items={pendingDepositItems}
        emptyText="Активных пополнений сейчас нет."
      />
    </section>
  )
}

export function WalletExperience({
  allWallets = [],
  wallets,
  primaryCurrencyCode,
  onMakePrimary,
  showZeroCurrencies = false,
  onToggleZeroCurrencies,
  reserveItems = [],
  pendingDepositItems = [],
  transactions = [],
  transactionStatus = 'ready',
  transactionError = '',
  transactionEmptyText = 'Операций пока нет.',
  workStatus = 'ready',
  workError = '',
}) {
  const [openMenuCode, setOpenMenuCode] = useState('')
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false)
  const [isPendingDepositModalOpen, setIsPendingDepositModalOpen] = useState(false)
  const visibleWallets = wallets || (showZeroCurrencies ? allWallets : allWallets.filter(hasWalletValue))
  const primaryWallet =
    allWallets.find((wallet) => wallet.code === primaryCurrencyCode) ||
    allWallets.find(hasWalletValue) ||
    allWallets[0] ||
    { code: primaryCurrencyCode || 'RUB', balance: 0, available: 0, reserved: 0 }

  function handleToggleMenu(code) {
    setOpenMenuCode((current) => (current === code ? '' : code))
  }

  function handleMakePrimary(code) {
    onMakePrimary?.(code)
    setOpenMenuCode('')
  }

  return (
    <WalletExperienceFrame>
      <WalletLabLayout
        wallets={visibleWallets}
        primaryWallet={primaryWallet}
        showZeroCurrencies={showZeroCurrencies}
        reserveItems={reserveItems}
        pendingDepositItems={pendingDepositItems}
        transactions={transactions}
        transactionStatus={transactionStatus}
        transactionError={transactionError}
        transactionEmptyText={transactionEmptyText}
        workStatus={workStatus}
        workError={workError}
        isReserveModalOpen={isReserveModalOpen}
        isPendingDepositModalOpen={isPendingDepositModalOpen}
        primaryCurrencyCode={primaryCurrencyCode}
        openMenuCode={openMenuCode}
        onToggleMenu={handleToggleMenu}
        onMakePrimary={handleMakePrimary}
        onToggleZeroCurrencies={onToggleZeroCurrencies}
        onOpenReserveDetails={() => setIsReserveModalOpen(true)}
        onCloseReserveDetails={() => setIsReserveModalOpen(false)}
        onOpenPendingDepositDetails={() => setIsPendingDepositModalOpen(true)}
        onClosePendingDepositDetails={() => setIsPendingDepositModalOpen(false)}
      />
    </WalletExperienceFrame>
  )
}
