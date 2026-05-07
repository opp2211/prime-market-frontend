import { useMemo, useState } from 'react'
import { WalletExperience } from './WalletExperience'

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
]

const WALLET_LAB_RESERVE_ITEMS = [
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

const WALLET_LAB_PENDING_DEPOSITS = [
  {
    id: 'pending-deposit-demo',
    title: 'Пополнение PMD-4831',
    description: 'Bank transfer',
    amount: 150,
    currency: 'USD',
    to: '/money/deposit-requests',
    linkLabel: 'Открыть пополнение',
  },
]

function hasWalletValue(wallet) {
  return (
    Math.abs(Number(wallet?.balance || 0)) > 0 ||
    Math.abs(Number(wallet?.available || 0)) > 0 ||
    Math.abs(Number(wallet?.reserved || 0)) > 0
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
      reserveItems={WALLET_LAB_RESERVE_ITEMS}
      pendingDepositItems={WALLET_LAB_PENDING_DEPOSITS}
      transactions={WALLET_LAB_TRANSACTIONS}
    />
  )
}
