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
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
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
      <span aria-hidden="true" />
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
            className={isPrimary ? 'wallet-lab-row-menu__status' : ''}
            onClick={onMakePrimary}
            disabled={isPrimary}
          >
            {isPrimary ? 'Основная валюта' : 'Сделать основной валютой'}
          </button>
          <Link to={`/money/deposit?currency=${wallet.code}`}>Пополнить</Link>
          <Link to={`/money/withdraw?currency=${wallet.code}`}>Вывести</Link>
        </div>
      ) : null}
    </div>
  )
}

function WalletLabTable({
  wallets,
  dense = false,
  compactActions = false,
  primaryCurrencyCode,
  openMenuCode,
  onToggleMenu,
  onMakePrimary,
}) {
  const tableClassName = [
    'wallet-lab-table',
    dense ? 'wallet-lab-table--dense' : '',
    compactActions ? 'wallet-lab-table--compact-actions' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={tableClassName}>
      <div className="wallet-lab-table__head">
        <span>Валюта</span>
        <span>Баланс</span>
        <span>Доступно</span>
        <span>В резерве</span>
        <span>Действия</span>
      </div>
      <div className="wallet-lab-table__body">
        {wallets.map((wallet) => {
          const isPrimary = wallet.code === primaryCurrencyCode
          const isEmpty = wallet.balance === 0 && wallet.available === 0 && wallet.reserved === 0
          const rowClassName = [
            'wallet-lab-table__row',
            isPrimary ? 'is-primary' : '',
            isEmpty ? 'is-empty' : '',
          ].filter(Boolean).join(' ')

          return (
            <div className={rowClassName} key={wallet.code}>
              <div className="wallet-lab-currency-cell">
                <strong>{wallet.code}</strong>
                <span>{wallet.name}</span>
                <WalletLabPrimaryMark isPrimary={isPrimary} />
              </div>
              <strong>{formatAmount(wallet.balance)}</strong>
              <span>{formatAmount(wallet.available)}</span>
              <span>{formatAmount(wallet.reserved)}</span>
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
            </div>
          )
        })}
      </div>
    </div>
  )
}

function WalletLabReserveModal({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <div className="wallet-lab-modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="wallet-lab-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wallet-lab-reserve-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="wallet-lab-modal__head">
          <div>
            <p className="wallet-lab-kicker">Резервы</p>
            <h2 id="wallet-lab-reserve-title">Зарезервированные средства</h2>
          </div>
          <button type="button" onClick={onClose}>
            Закрыть
          </button>
        </div>
        <div className="wallet-lab-reserve-list">
          {WALLET_LAB_RESERVE_REASONS.map((reason) => (
            <div className="wallet-lab-reserve-list__row" key={reason.id}>
              <div>
                <strong>{reason.title}</strong>
                <span>{reason.description}</span>
              </div>
              <strong>{formatAmount(reason.amount)} {reason.currency}</strong>
              <Link to={reason.to}>{reason.linkLabel}</Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function WalletLabTransactions({ title = 'Последние операции' }) {
  return (
    <section className="wallet-lab-section">
      <div className="wallet-lab-section__head">
        <h2>{title}</h2>
        <Link to="/money/transactions">Вся история</Link>
      </div>
      <div className="wallet-lab-ledger">
        {WALLET_LAB_TRANSACTIONS.map((item) => (
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
        ))}
      </div>
    </section>
  )
}

function CombinedVariant({
  wallets,
  primaryWallet,
  showZeroCurrencies,
  isReserveModalOpen,
  primaryCurrencyCode,
  openMenuCode,
  onToggleMenu,
  onMakePrimary,
  onToggleZeroCurrencies,
  onOpenReserveDetails,
  onCloseReserveDetails,
}) {
  return (
    <section className="wallet-lab-stage wallet-lab-stage--combined">
      <div className="wallet-lab-combined-hero">
        <div className="wallet-lab-combined-hero__main">
          <p className="wallet-lab-kicker">Кошелек</p>
          <span className="wallet-lab-combined-hero__label">Доступно</span>
          <h1>{formatAmount(primaryWallet.available)} {primaryWallet.code}</h1>
          <div className="wallet-lab-combined-hero__meta">
            <span>Баланс: {formatAmount(primaryWallet.balance)} {primaryWallet.code}</span>
            <span>Резерв: {formatAmount(primaryWallet.reserved)} {primaryWallet.code}</span>
          </div>
        </div>
        <WalletLabActions />
      </div>

      <div className="wallet-lab-combined-grid">
        <section className="wallet-lab-section wallet-lab-section--combined-table">
          <div className="wallet-lab-section__head wallet-lab-section__head--with-action">
            <div>
              <h2>Валюты кошелька</h2>
            </div>
            <button type="button" onClick={onToggleZeroCurrencies}>
              {showZeroCurrencies ? 'Скрыть нулевые балансы' : 'Показать скрытые'}
            </button>
          </div>
          <WalletLabTable
            wallets={wallets}
            compactActions
            primaryCurrencyCode={primaryCurrencyCode}
            openMenuCode={openMenuCode}
            onToggleMenu={onToggleMenu}
            onMakePrimary={onMakePrimary}
          />
        </section>

        <aside className="wallet-lab-side-panel wallet-lab-side-panel--combined">
          <h2>В работе</h2>
          <button type="button" className="wallet-lab-work-row wallet-lab-work-row--button" onClick={onOpenReserveDetails}>
            <span>В резерве</span>
            <strong className="wallet-lab-work-amount-stack">
              {WALLET_LAB_RESERVE_REASONS.map((reason) => (
                <span key={reason.id}>{formatAmount(reason.amount)} {reason.currency}</span>
              ))}
            </strong>
            <em>2 операции</em>
          </button>
          <Link className="wallet-lab-work-row wallet-lab-work-row--link" to="/money/deposit-requests">
            <span>Ожидает зачисления</span>
            <strong>150,00 USD</strong>
            <em>1 операция</em>
          </Link>
        </aside>
      </div>

      <WalletLabTransactions title="Последние операции" />
      <WalletLabReserveModal isOpen={isReserveModalOpen} onClose={onCloseReserveDetails} />
    </section>
  )
}

export default function WalletLabPage() {
  const [primaryCurrencyCode, setPrimaryCurrencyCode] = useState('RUB')
  const [openMenuCode, setOpenMenuCode] = useState('')
  const [showZeroCurrencies, setShowZeroCurrencies] = useState(true)
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false)

  const visibleWallets = useMemo(() => {
    if (showZeroCurrencies) return WALLET_LAB_WALLETS

    return WALLET_LAB_WALLETS.filter((wallet) => wallet.balance > 0)
  }, [showZeroCurrencies])

  const primaryWallet =
    WALLET_LAB_WALLETS.find((wallet) => wallet.code === primaryCurrencyCode) ||
    WALLET_LAB_WALLETS[0]

  function handleToggleMenu(code) {
    setOpenMenuCode((current) => (current === code ? '' : code))
  }

  function handleMakePrimary(code) {
    setPrimaryCurrencyCode(code)
    setOpenMenuCode('')
  }

  const variantProps = {
    wallets: visibleWallets,
    primaryWallet,
    showZeroCurrencies,
    isReserveModalOpen,
    primaryCurrencyCode,
    openMenuCode,
    onToggleMenu: handleToggleMenu,
    onMakePrimary: handleMakePrimary,
    onToggleZeroCurrencies: () => setShowZeroCurrencies((current) => !current),
    onOpenReserveDetails: () => setIsReserveModalOpen(true),
    onCloseReserveDetails: () => setIsReserveModalOpen(false),
  }

  return (
    <div className="account-page wallet-lab-page wallet-lab-page--standalone">
      <CombinedVariant {...variantProps} />
    </div>
  )
}
