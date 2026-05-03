import { Link } from 'react-router-dom'
import { useI18n } from '../../app/i18n'
import { useUser } from '../../app/user'
import { getBackofficeDisputesCopy } from './backofficeDisputesCopy'
import { getBackofficeMoneyCopy } from './backofficeMoneyCopy'
import {
  canViewDepositRequests,
  canViewDisputes,
  canViewTreasury,
  canViewWithdrawalRequests,
} from './backofficeAccess'
import { MoneyPageHeader, MoneyStateCard } from '../money/MoneyUI'

export default function BackofficeHome() {
  const { language } = useI18n()
  const { permissions } = useUser()
  const disputesCopy = getBackofficeDisputesCopy(language)
  const copy = getBackofficeMoneyCopy(language)

  const canApproveDeposits = canViewDepositRequests(permissions)
  const canReviewDisputes = canViewDisputes(permissions)
  const canReviewWithdrawals = canViewWithdrawalRequests(permissions)
  const canOpenTreasury = canViewTreasury(permissions)
  const sections = [
    canReviewWithdrawals
      ? {
          key: 'withdrawals',
          title: copy.hub.withdrawalsTitle,
          text: copy.hub.withdrawalsText,
          to: '/backoffice/withdrawal-requests',
        }
      : null,
    canApproveDeposits
      ? {
          key: 'deposits',
          title: copy.hub.depositsTitle,
          text: copy.hub.depositsText,
          to: '/backoffice/deposit-requests',
        }
      : null,
    canOpenTreasury
      ? {
          key: 'treasury',
          title: 'Treasury',
          text: 'Operator accounts, actual balances, manual corrections and P2P conversion ledger.',
          to: '/backoffice/treasury',
        }
      : null,
    canReviewDisputes
      ? {
          key: 'disputes',
          title: copy.hub.disputesTitle,
          text: copy.hub.disputesText,
          to: '/backoffice/disputes',
        }
      : null,
  ].filter(Boolean)

  return (
    <div className="account-page money-page backoffice-hub">
      <MoneyPageHeader
        eyebrow={copy.common.title}
        title={copy.hub.title}
        subtitle={copy.hub.subtitle}
      />

      {sections.length === 0 ? (
        <MoneyStateCard tone="danger" title={copy.common.noAccessTitle} text={copy.common.noAccessText} />
      ) : (
        <div className="backoffice-hub__grid">
          {sections.map((section) => (
            <div className="card money-section-card backoffice-hub-card" key={section.key}>
              <div>
                <div className="backoffice-hub-card__title">{section.title}</div>
                <div className="backoffice-hub-card__text">{section.text}</div>
              </div>
              <div className="backoffice-hub-card__actions">
                <Link to={section.to} className="btn btn--secondary">
                  {section.key === 'disputes' ? disputesCopy.navLabel : copy.hub.openSection}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
