import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../shared/ui/Button'
import { useI18n } from '../../app/i18n'
import { getMyWalletTransactions, getMyWallets } from '../../api/wallets'
import { useDisplayCurrency, setDisplayCurrency } from '../../app/displayCurrency'
import { getErrorMessage } from '../../shared/lib/errors'
import {
  formatMoneyAmount,
  formatMoneyDateTime,
  getAmountTone,
  getDisplayWallet,
  getPageContent,
  hasWalletValue,
  normalizeTransaction,
  normalizeWalletEntries,
} from '../../shared/lib/money'
import { MoneyPageHeader, MoneyStateCard } from './MoneyUI'
import { getMoneyCopy } from './moneyCopy'

function RecentTransactionPreview({ transactions, language, copy }) {
  return (
    <div className="money-transaction-preview">
      {transactions.map((item) => {
        const tone = getAmountTone(item.amount)
        return (
          <div className="money-transaction-preview__row" key={item.id || `${item.createdAt}-${item.amount}`}>
            <div className="money-transaction-preview__meta">
              <div className="money-transaction-preview__type">
                {item.type || copy.transactions.typeUnknown}
              </div>
              <div className="money-transaction-preview__date">
                {formatMoneyDateTime(item.createdAt, { language, fallback: copy.common.notAvailable })}
              </div>
              {item.description ? (
                <div className="money-transaction-preview__description">{item.description}</div>
              ) : null}
            </div>
            <div className={`money-amount money-amount--${tone}`}>
              {formatMoneyAmount(item.amount, {
                language,
                fallback: copy.common.notAvailable,
              })}{' '}
              {item.currencyCode}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function WalletPage() {
  const navigate = useNavigate()
  const { language } = useI18n()
  const copy = useMemo(() => getMoneyCopy(language), [language])
  const { currencyCode } = useDisplayCurrency()
  const [showZeroBalances, setShowZeroBalances] = useState(true)
  const [walletEntries, setWalletEntries] = useState([])
  const [walletStatus, setWalletStatus] = useState('loading')
  const [walletError, setWalletError] = useState('')
  const [recentTransactions, setRecentTransactions] = useState([])
  const [txStatus, setTxStatus] = useState('loading')
  const [txError, setTxError] = useState('')

  useEffect(() => {
    let active = true

    async function loadWallets() {
      setWalletStatus('loading')
      setWalletError('')

      try {
        const walletsRes = await getMyWallets()
        if (!active) return

        const normalized = normalizeWalletEntries(walletsRes?.data || {})
        setWalletEntries(normalized)
        setWalletStatus('ready')
      } catch (error) {
        if (!active) return
        setWalletError(getErrorMessage(error, copy.wallet.loadError))
        setWalletStatus('error')
      }
    }

    loadWallets()

    return () => {
      active = false
    }
  }, [copy.wallet.loadError])

  useEffect(() => {
    let active = true

    async function loadRecentTransactions() {
      setTxStatus('loading')
      setTxError('')

      try {
        const response = await getMyWalletTransactions({
          page: 0,
          size: 5,
          sort: 'createdAt,desc',
        })
        if (!active) return

        const pageData = getPageContent(response?.data)
        setRecentTransactions(
          pageData.content.map(normalizeTransaction).filter(Boolean)
        )
        setTxStatus('ready')
      } catch (error) {
        if (!active) return
        setTxError(getErrorMessage(error, copy.transactions.loadError))
        setTxStatus('error')
      }
    }

    loadRecentTransactions()

    return () => {
      active = false
    }
  }, [copy.transactions.loadError])

  const visibleWallets = useMemo(() => {
    if (showZeroBalances) return walletEntries
    return walletEntries.filter((item) => hasWalletValue(item))
  }, [showZeroBalances, walletEntries])

  const nonZeroWallets = useMemo(
    () => walletEntries.filter((item) => hasWalletValue(item)),
    [walletEntries]
  )
  const hiddenZeroCount = walletEntries.length - nonZeroWallets.length
  const headerWallet = getDisplayWallet(walletEntries, currencyCode)

  const walletActions = (
    <>
      <Button type="button" onClick={() => navigate(`/money/deposit?currency=${currencyCode}`)}>
        {copy.common.deposit}
      </Button>
      <Button
        type="button"
        variant="secondary"
        onClick={() => navigate(`/money/withdraw?currency=${currencyCode}`)}
      >
        {copy.common.withdraw}
      </Button>
      <Button
        type="button"
        variant="secondary"
        onClick={() => navigate(`/money/convert?from=${currencyCode}`)}
      >
        Convert
      </Button>
    </>
  )

  return (
    <div className="account-page money-page">
      <MoneyPageHeader
        eyebrow={copy.wallet.eyebrow}
        title={copy.wallet.title}
        subtitle={copy.wallet.subtitle}
        actions={walletActions}
      />

      <div className="money-overview-grid">
        <div className="card money-metric-card">
          <div className="money-metric-card__label">{copy.wallet.activeCurrencies}</div>
          <div className="money-metric-card__value">{nonZeroWallets.length}</div>
          <div className="money-metric-card__helper">
            {copy.wallet.totalCurrencies}: {walletEntries.length}
          </div>
        </div>
        <div className="card money-metric-card">
          <div className="money-metric-card__label">{copy.wallet.hiddenCurrencies}</div>
          <div className="money-metric-card__value">{Math.max(hiddenZeroCount, 0)}</div>
          <button
            type="button"
            className="money-inline-button"
            onClick={() => setShowZeroBalances((value) => !value)}
          >
            {showZeroBalances ? copy.wallet.hideZero : copy.wallet.showZero}
          </button>
        </div>
        <div className="card money-metric-card">
          <div className="money-metric-card__label">{copy.wallet.headerCurrencyTitle}</div>
          <div className="money-metric-card__value">
            {currencyCode}
            {headerWallet ? (
              <span className="money-metric-card__amount">
                {formatMoneyAmount(headerWallet.balance, {
                  language,
                  fallback: copy.common.notAvailable,
                })}
              </span>
            ) : null}
          </div>
          <div className="money-metric-card__helper">{copy.wallet.headerCurrencyHint}</div>
        </div>
      </div>

      {walletStatus === 'loading' ? (
        <MoneyStateCard title={copy.common.loading} text={copy.wallet.subtitle} />
      ) : null}

      {walletStatus === 'error' ? (
        <MoneyStateCard
          tone="danger"
          title={copy.common.noDataTitle}
          text={walletError}
          action={
            <Button type="button" variant="secondary" onClick={() => window.location.reload()}>
              {copy.common.retry}
            </Button>
          }
        />
      ) : null}

      {walletStatus === 'ready' ? (
        <>
          {visibleWallets.length === 0 ? (
            <MoneyStateCard
              title={showZeroBalances ? copy.wallet.emptyTitle : copy.wallet.zeroHiddenTitle}
              text={showZeroBalances ? copy.wallet.emptyText : copy.wallet.zeroHiddenText}
              action={
                !showZeroBalances ? (
                  <Button type="button" variant="secondary" onClick={() => setShowZeroBalances(true)}>
                    {copy.wallet.showAll}
                  </Button>
                ) : null
              }
            />
          ) : (
            <div className="wallet-grid wallet-grid--v1">
              {visibleWallets.map((wallet) => {
                const isSelected = wallet.code === currencyCode
                return (
                  <article className="card wallet-card wallet-card--v1" key={wallet.code}>
                    <div className="wallet-card__head wallet-card__head--v1">
                      <div>
                        <div className="wallet-card__code">{wallet.code}</div>
                        <div className="wallet-card__subtitle">{copy.wallet.cardActions}</div>
                      </div>
                      <button
                        type="button"
                        className={`money-chip${isSelected ? ' is-active' : ''}`}
                        onClick={() => setDisplayCurrency(wallet.code)}
                      >
                        {isSelected ? copy.wallet.selectedInHeader : copy.wallet.setInHeader}
                      </button>
                    </div>

                    <div className="wallet-card__grid">
                      <div>
                        <div className="wallet-card__label">{copy.common.balance}</div>
                        <div className="wallet-card__value">
                          {formatMoneyAmount(wallet.balance, {
                            language,
                            fallback: copy.common.notAvailable,
                          })}
                        </div>
                      </div>
                      <div>
                        <div className="wallet-card__label">{copy.common.available}</div>
                        <div className="wallet-card__value">
                          {formatMoneyAmount(wallet.available, {
                            language,
                            fallback: copy.common.notAvailable,
                          })}
                        </div>
                      </div>
                      <div>
                        <div className="wallet-card__label">{copy.common.reserved}</div>
                        <div className="wallet-card__value">
                          {formatMoneyAmount(wallet.reserved, {
                            language,
                            fallback: copy.common.notAvailable,
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="wallet-card__actions">
                      <Link to={`/money/deposit?currency=${wallet.code}`} className="wallet-card__link">
                        {copy.common.deposit}
                      </Link>
                      <Link to={`/money/withdraw?currency=${wallet.code}`} className="wallet-card__link">
                        {copy.common.withdraw}
                      </Link>
                      <Link to={`/money/convert?from=${wallet.code}`} className="wallet-card__link">
                        Convert
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </>
      ) : null}

      <div className="card money-section-card">
        <div className="money-section-card__head">
          <div>
            <div className="money-section-card__title">{copy.wallet.recentTitle}</div>
            <div className="money-section-card__subtitle">{copy.wallet.recentSubtitle}</div>
          </div>
          <Link to="/money/transactions" className="money-text-link">
            {copy.wallet.openHistory}
          </Link>
        </div>

        {txStatus === 'loading' ? <div className="muted">{copy.common.loading}</div> : null}
        {txStatus === 'error' ? <div className="error">{txError}</div> : null}
        {txStatus === 'ready' && recentTransactions.length === 0 ? (
          <div className="muted">{copy.wallet.recentEmpty}</div>
        ) : null}
        {txStatus === 'ready' && recentTransactions.length > 0 ? (
          <RecentTransactionPreview
            transactions={recentTransactions}
            language={language}
            copy={copy}
          />
        ) : null}
      </div>
    </div>
  )
}
