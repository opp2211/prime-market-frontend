import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

const WALLET_LAB_WALLETS = [
  {
    code: 'RUB',
    name: 'Российский рубль',
    balance: 126450.25,
    available: 118720.25,
    reserved: 7730,
  },
  {
    code: 'USD',
    name: 'Доллар США',
    balance: 482.9,
    available: 482.9,
    reserved: 0,
  },
  {
    code: 'EUR',
    name: 'Евро',
    balance: 0,
    available: 0,
    reserved: 0,
  },
  {
    code: 'CNY',
    name: 'Китайский юань',
    balance: 2400.5,
    available: 2150.5,
    reserved: 250,
  },
  {
    code: 'KZT',
    name: 'Казахстанский тенге',
    balance: 0,
    available: 0,
    reserved: 0,
  },
  {
    code: 'UAH',
    name: 'Украинская гривна',
    balance: 0,
    available: 0,
    reserved: 0,
  },
]

const WALLET_LAB_TRANSACTIONS = [
  {
    id: 'tx-1',
    type: 'Продажа игровой валюты',
    target: 'Diablo IV, золото',
    amount: 18450,
    currency: 'RUB',
    date: 'Сегодня, 13:42',
  },
  {
    id: 'tx-2',
    type: 'Резерв по заказу',
    target: 'World of Warcraft, услуга',
    amount: -7730,
    currency: 'RUB',
    date: 'Сегодня, 12:10',
  },
  {
    id: 'tx-3',
    type: 'Пополнение',
    target: 'Заявка PMD-4831',
    amount: 50000,
    currency: 'RUB',
    date: 'Вчера, 19:04',
  },
  {
    id: 'tx-4',
    type: 'Конвертация',
    target: 'USD в RUB',
    amount: 12800,
    currency: 'RUB',
    date: '27 апреля, 10:18',
  },
]

const WALLET_LAB_RESERVE_REASONS = [
  {
    id: 'reserve-order-pm-18420',
    title: 'Заказ PM-18420',
    description: 'World of Warcraft, услуга',
    amount: 7730,
    currency: 'RUB',
    to: '/orders/PM-18420',
    linkLabel: 'Открыть заказ',
  },
  {
    id: 'reserve-withdrawal-wd-2049',
    title: 'Заявка на вывод WD-2049',
    description: 'Ожидает подтверждения реквизитов',
    amount: 250,
    currency: 'CNY',
    to: '/money/withdrawal-requests/WD-2049',
    linkLabel: 'Открыть заявку',
  },
]

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
  if (item.sourceType === 'ORDER' && item.refPublicId) return `/orders/${item.refPublicId}`
  if (item.sourceType === 'WITHDRAWAL_REQUEST' && item.refPublicId) {
    return `/money/withdrawal-requests/${item.refPublicId}`
  }
  if (item.sourceType === 'DEPOSIT_REQUEST' && item.refPublicId) {
    return `/money/deposit-requests/${item.refPublicId}`
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
    <div className={`wallet-lab-actions${compact ? ' wallet-lab-actions--compact' : ''}`}>
      <Link className="btn btn--primary" to="/money/deposit">
        Пополнить
      </Link>
      <Link className="btn btn--secondary" to="/money/withdraw">
        Вывести
      </Link>
      <Link className="btn btn--ghost" to="/money/convert">
        Конвертировать
      </Link>
    </div>
  )
}

function WalletLabPrimaryMark({ isPrimary }) {
  if (!isPrimary) return null

  const tooltipText = 'Основная валюта отображается в шапке сайта и используется для сделок в маркете'

  return (
    <span
      className="wallet-lab-primary-mark"
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
    <div className="wallet-lab-row-menu">
      <button
        type="button"
        className="wallet-lab-row-menu__trigger"
        aria-label={`Действия для ${wallet.code}`}
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>
      {isOpen ? (
        <div className="wallet-lab-row-menu__panel">
          <button
            type="button"
            className={isPrimary ? 'is-disabled' : ''}
            onClick={onMakePrimary}
            disabled={isPrimary}
          >
            Сделать основной валютой
          </button>
          <Link to={`/money/deposit?currency=${wallet.code}`}>Пополнить</Link>
          <Link to={`/money/withdraw?currency=${wallet.code}`}>Вывести</Link>
        </div>
      ) : null}
    </div>
  )
}

function WalletLabOverview({ primaryWallet }) {
  return (
    <section className="wallet-lab-overview">
      <div className="wallet-lab-overview__main">
        <span className="wallet-lab-overview__badge">
          Основная валюта <strong>{primaryWallet.code}</strong>
        </span>
        <h1>Доступно</h1>
        <strong className="wallet-lab-overview__amount">
          {formatMoney(primaryWallet.available, primaryWallet.code)}
        </strong>
      </div>
      <div className="wallet-lab-overview__meta" aria-label="Сводка по основной валюте">
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
    <label className="wallet-lab-filter">
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
      <div className="wallet-lab-empty">
        <strong>Балансов пока нет</strong>
        <span>Когда появится активная валюта, она будет показана здесь.</span>
      </div>
    )
  }

  return (
    <div className="wallet-lab-wallet-list">
      {wallets.map((wallet) => {
        const isPrimary = wallet.code === primaryCurrencyCode
        const isEmpty = !hasWalletValue(wallet)
        const rowClassName = [
          'wallet-lab-wallet-row',
          isPrimary ? 'is-primary' : '',
          isEmpty ? 'is-empty' : '',
        ].filter(Boolean).join(' ')

        return (
          <article className={rowClassName} key={wallet.code}>
            <div className="wallet-lab-wallet-row__currency">
              <span className="wallet-lab-wallet-row__code">{wallet.code}</span>
              <div>
                <strong>{wallet.name}</strong>
                <WalletLabPrimaryMark isPrimary={isPrimary} />
              </div>
            </div>
            <div className="wallet-lab-wallet-row__available">
              <span>Доступно</span>
              <strong>{formatMoney(wallet.available, wallet.code, { dashZero: true })}</strong>
            </div>
            <div className="wallet-lab-wallet-row__secondary">
              <span>
                Всего
                <strong>{formatMoney(wallet.balance, wallet.code, { dashZero: true })}</strong>
              </span>
              <span>
                В резерве
                <strong>{formatMoney(wallet.reserved, wallet.code, { dashZero: true })}</strong>
              </span>
            </div>
            <div className="wallet-lab-row-actions">
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
    <div className="wallet-lab-modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="wallet-lab-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="wallet-lab-modal__head">
          <div>
            <h2 id={titleId}>{title}</h2>
            <p className="wallet-lab-modal__subtitle">{subtitle}</p>
          </div>
          <button type="button" onClick={onClose}>
            Закрыть
          </button>
        </div>
        <div className="wallet-lab-reserve-list">
          {items.length === 0 ? (
            <div className="wallet-lab-reserve-list__empty">{emptyText}</div>
          ) : null}
          {items.map((reason) => (
            <div className="wallet-lab-reserve-list__row" key={reason.id}>
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
  const className = 'wallet-lab-process-row'

  return (
    <button type="button" className={className} onClick={onClick}>
      <div>
        <strong className="wallet-lab-process-row__title">{label}</strong>
        <span className="wallet-lab-process-row__count">{getOperationsLabel(count)}</span>
      </div>
      <em className="wallet-lab-process-row__amounts">
        {amounts.length ? (
          amounts.map((item) => (
            <span key={item.currency}>{formatMoney(item.amount, item.currency)}</span>
          ))
        ) : (
          <span>Сумм нет</span>
        )}
      </em>
      <span className="wallet-lab-process-row__arrow" aria-hidden="true">
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

  return (
    <aside className="wallet-lab-panel wallet-lab-process-panel">
      <div className="wallet-lab-panel__head">
        <h2>Активные операции</h2>
      </div>
      {workStatus === 'loading' ? (
        <div className="wallet-lab-panel__state">Загрузка...</div>
      ) : null}
      {workStatus === 'error' ? (
        <div className="wallet-lab-panel__state wallet-lab-panel__state--error">
          {workError || 'Не удалось загрузить данные'}
        </div>
      ) : null}
      {workStatus === 'ready' ? (
        <div className="wallet-lab-process-list">
          <WalletLabProcessRow
            label="Зарезервировано"
            count={reserveItems.length}
            amounts={reserveAmounts}
            onClick={onOpenReserveDetails}
          />
          <WalletLabProcessRow
            label="Ожидает зачисления"
            count={pendingDepositItems.length}
            amounts={pendingDepositAmounts}
            onClick={onOpenPendingDepositDetails}
          />
        </div>
      ) : null}
    </aside>
  )
}

function WalletLabTransactions({
  title = 'Последние операции',
  transactions = WALLET_LAB_TRANSACTIONS,
  status = 'ready',
  error = '',
  emptyText = 'Операций пока нет.',
}) {
  return (
    <section className="wallet-lab-section wallet-lab-transactions-section">
      <div className="wallet-lab-section__head">
        <h2>{title}</h2>
        <Link to="/money/transactions">Вся история →</Link>
      </div>
      <div className="wallet-lab-ledger">
        {status === 'loading' ? <div className="wallet-lab-ledger__state">Загрузка...</div> : null}
        {status === 'error' ? <div className="wallet-lab-ledger__state wallet-lab-ledger__state--error">{error}</div> : null}
        {status === 'ready' && transactions.length === 0 ? (
          <div className="wallet-lab-ledger__state">{emptyText}</div>
        ) : null}
        {status === 'ready' ? transactions.map((item) => (
          <div className="wallet-lab-ledger__row" key={item.id}>
            <div>
              <strong>{item.type}</strong>
              <span>{item.target}</span>
            </div>
            <time>{item.date}</time>
            <strong className={`wallet-lab-amount wallet-lab-amount--${getAmountTone(item.amount)}`}>
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
  reserveItems = WALLET_LAB_RESERVE_REASONS,
  pendingDepositItems = [],
  transactions = WALLET_LAB_TRANSACTIONS,
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
    <section className="wallet-lab-stage">
      <header className="wallet-lab-page-head">
        <h1>Кошелек</h1>
      </header>
      <WalletLabOverview primaryWallet={primaryWallet} />

      <div className="wallet-lab-main-grid">
        <section className="wallet-lab-section wallet-lab-wallets-section">
          <div className="wallet-lab-section__head wallet-lab-section__head--with-action">
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
  allWallets = WALLET_LAB_WALLETS,
  wallets,
  primaryCurrencyCode,
  onMakePrimary,
  showZeroCurrencies = false,
  onToggleZeroCurrencies,
  reserveItems = WALLET_LAB_RESERVE_REASONS,
  pendingDepositItems = [],
  transactions = WALLET_LAB_TRANSACTIONS,
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
    <div className="account-page wallet-lab-page wallet-lab-page--standalone">
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
    </div>
  )
}

export default function WalletLabPage() {
  const [primaryCurrencyCode, setPrimaryCurrencyCode] = useState('RUB')
  const [showZeroCurrencies, setShowZeroCurrencies] = useState(false)

  const visibleWallets = useMemo(() => {
    if (showZeroCurrencies) return WALLET_LAB_WALLETS
    return WALLET_LAB_WALLETS.filter(hasWalletValue)
  }, [showZeroCurrencies])

  return (
    <WalletExperience
      allWallets={WALLET_LAB_WALLETS}
      wallets={visibleWallets}
      primaryCurrencyCode={primaryCurrencyCode}
      onMakePrimary={setPrimaryCurrencyCode}
      showZeroCurrencies={showZeroCurrencies}
      onToggleZeroCurrencies={() => setShowZeroCurrencies((current) => !current)}
      reserveItems={WALLET_LAB_RESERVE_REASONS}
      pendingDepositItems={[
        {
          id: 'pending-deposit-demo',
          title: 'Пополнение PMD-4831',
          description: 'Bank transfer',
          amount: 150,
          currency: 'USD',
          to: '/money/deposit-requests',
          linkLabel: 'Открыть пополнения',
        },
      ]}
      transactions={WALLET_LAB_TRANSACTIONS}
    />
  )
}
