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

const VARIANTS = [
  { id: 'operations', label: 'Строгий кабинет' },
  { id: 'fintech', label: 'Финтех' },
]

const VARIANT_BY_ROUTE = {
  operations: VARIANTS[0],
  fintech: VARIANTS[1],
}

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
        Конвертация
      </Link>
    </div>
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
          <button type="button" onClick={onMakePrimary} disabled={isPrimary}>
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
  primaryCurrencyCode,
  openMenuCode,
  onToggleMenu,
  onMakePrimary,
}) {
  return (
    <div className={`wallet-lab-table${dense ? ' wallet-lab-table--dense' : ''}`}>
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

          return (
            <div className={`wallet-lab-table__row${isPrimary ? ' is-primary' : ''}`} key={wallet.code}>
              <div className="wallet-lab-currency-cell">
                <strong>{wallet.code}</strong>
                <span>{wallet.name}</span>
                {isPrimary ? <em>Основная</em> : null}
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

function OperationsVariant({
  wallets,
  primaryWallet,
  totals,
  showZeroCurrencies,
  primaryCurrencyCode,
  openMenuCode,
  onToggleMenu,
  onMakePrimary,
  onToggleZeroCurrencies,
}) {
  return (
    <section className="wallet-lab-stage wallet-lab-stage--operations">
      <div className="wallet-lab-command">
        <div>
          <p className="wallet-lab-kicker">Кошелек</p>
          <h1>Деньги и балансы</h1>
        </div>
        <WalletLabActions />
      </div>

      <div className="wallet-lab-strip">
        <div>
          <span>Основная валюта</span>
          <strong>{primaryWallet.code}</strong>
        </div>
        <div>
          <span>Доступно</span>
          <strong>{formatAmount(primaryWallet.available)} {primaryWallet.code}</strong>
        </div>
        <div>
          <span>В резерве</span>
          <strong>{formatAmount(primaryWallet.reserved)} {primaryWallet.code}</strong>
        </div>
        <button type="button" onClick={onToggleZeroCurrencies}>
          {showZeroCurrencies ? 'Скрыть пустые валюты' : 'Показать все валюты'}
        </button>
      </div>

      <section className="wallet-lab-section wallet-lab-section--flush">
        <div className="wallet-lab-section__head">
          <h2>Балансы по валютам</h2>
          <span>{totals.activeCount} активные из {totals.walletCount}</span>
        </div>
        <WalletLabTable
          wallets={wallets}
          primaryCurrencyCode={primaryCurrencyCode}
          openMenuCode={openMenuCode}
          onToggleMenu={onToggleMenu}
          onMakePrimary={onMakePrimary}
        />
      </section>

      <WalletLabTransactions />
    </section>
  )
}

function FintechVariant({
  wallets,
  primaryWallet,
  totals,
  primaryCurrencyCode,
  openMenuCode,
  onToggleMenu,
  onMakePrimary,
}) {
  const visibleWallets = wallets.filter((wallet) => wallet.balance > 0)

  return (
    <section className="wallet-lab-stage wallet-lab-stage--fintech">
      <div className="wallet-lab-fintech-hero">
        <div className="wallet-lab-fintech-hero__main">
          <p className="wallet-lab-kicker">Кошелек</p>
          <h1>{formatAmount(primaryWallet.available)} {primaryWallet.code}</h1>
          <div className="wallet-lab-fintech-hero__meta">
            <span>Баланс: {formatAmount(primaryWallet.balance)}</span>
            <span>Резерв: {formatAmount(primaryWallet.reserved)}</span>
          </div>
        </div>
        <WalletLabActions />
      </div>

      <div className="wallet-lab-fintech-grid">
        <section className="wallet-lab-section">
          <div className="wallet-lab-section__head">
            <h2>Активные валюты</h2>
            <span>{totals.activeCount}</span>
          </div>
          <div className="wallet-lab-balance-list">
            {visibleWallets.map((wallet) => (
              <div
                className={`wallet-lab-balance-list__row${wallet.code === primaryCurrencyCode ? ' is-primary' : ''}`}
                key={wallet.code}
              >
                <div>
                  <strong>{wallet.code}</strong>
                  <span>{wallet.name}</span>
                  {wallet.code === primaryCurrencyCode ? <em>Основная</em> : null}
                </div>
                <strong>{formatAmount(wallet.available)}</strong>
                <WalletLabRowMenu
                  wallet={wallet}
                  isPrimary={wallet.code === primaryCurrencyCode}
                  isOpen={openMenuCode === wallet.code}
                  onToggle={() => onToggleMenu(wallet.code)}
                  onMakePrimary={() => onMakePrimary(wallet.code)}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="wallet-lab-side-panel">
          <h2>В работе</h2>
          <div className="wallet-lab-work-row">
            <span>Зарезервировано в сделках</span>
            <strong>{formatAmount(totals.reserved)} RUB</strong>
          </div>
          <div className="wallet-lab-work-row">
            <span>Заявка на вывод</span>
            <strong>32 000,00 RUB</strong>
          </div>
          <div className="wallet-lab-work-row">
            <span>Ожидает зачисления</span>
            <strong>150,00 USD</strong>
          </div>
        </section>
      </div>

      <WalletLabTransactions title="Движение денег" />
    </section>
  )
}

export default function WalletLabPage({ variant = 'operations', showSwitcher = false }) {
  const routeVariant = VARIANT_BY_ROUTE[variant] ? variant : VARIANTS[0].id
  const [activeVariant, setActiveVariant] = useState(routeVariant)
  const [primaryCurrencyCode, setPrimaryCurrencyCode] = useState('RUB')
  const [openMenuCode, setOpenMenuCode] = useState('')
  const [showZeroCurrencies, setShowZeroCurrencies] = useState(true)

  const totals = useMemo(() => {
    const activeCount = WALLET_LAB_WALLETS.filter((wallet) => wallet.balance > 0).length
    const reserved = WALLET_LAB_WALLETS.reduce((sum, wallet) => sum + wallet.reserved, 0)

    return { activeCount, reserved, walletCount: WALLET_LAB_WALLETS.length }
  }, [])

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
    totals,
    showZeroCurrencies,
    primaryCurrencyCode,
    openMenuCode,
    onToggleMenu: handleToggleMenu,
    onMakePrimary: handleMakePrimary,
    onToggleZeroCurrencies: () => setShowZeroCurrencies((current) => !current),
  }

  return (
    <div className={`account-page wallet-lab-page${showSwitcher ? '' : ' wallet-lab-page--standalone'}`}>
      {showSwitcher ? (
        <div className="wallet-lab-page__top">
          <div>
            <p className="wallet-lab-kicker">Wallet lab</p>
            <h1 className="h1">Концепты кошелька</h1>
          </div>
          <div className="wallet-lab-switch" aria-label="Вариант интерфейса">
            {VARIANTS.map((variantItem) => (
              <button
                type="button"
                className={activeVariant === variantItem.id ? 'is-active' : ''}
                onClick={() => setActiveVariant(variantItem.id)}
                key={variantItem.id}
              >
                {variantItem.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {activeVariant === 'operations' ? <OperationsVariant {...variantProps} /> : null}
      {activeVariant === 'fintech' ? <FintechVariant {...variantProps} /> : null}
    </div>
  )
}
