import { Link } from 'react-router-dom'
import { useI18n } from '../../app/i18n'
import { useUser } from '../../app/user'
import { getBackofficeDisputesCopy } from './backofficeDisputesCopy'

export default function BackofficeHome() {
  const { language, t } = useI18n()
  const { permissions } = useUser()
  const disputesCopy = getBackofficeDisputesCopy(language)

  const canApproveDeposits = permissions?.includes('DEPOSIT_APPROVE')
  const canReviewDisputes = permissions?.includes('BACKOFFICE_ACCESS')

  return (
    <div className="account-page">
      <div className="account-page__head">
        <h1 className="h1 account-page__title">{t('backoffice.title')}</h1>
      </div>
      <div className="card">
        <div className="muted">
          {canReviewDisputes || canApproveDeposits
            ? t('backoffice.selectSection')
            : t('backoffice.noSections')}
        </div>
        {canReviewDisputes ? (
          <div className="account-page__actions">
            <Link to="/backoffice/disputes" className="btn btn--secondary">
              {disputesCopy.navLabel}
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  )
}
