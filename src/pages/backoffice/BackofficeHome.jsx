import { useI18n } from '../../app/i18n'
import { useUser } from '../../app/user'

export default function BackofficeHome() {
  const { t } = useI18n()
  const { permissions } = useUser()

  const canApproveDeposits = permissions?.includes('DEPOSIT_APPROVE')

  return (
    <div className="account-page">
      <div className="account-page__head">
        <h1 className="h1 account-page__title">{t('backoffice.title')}</h1>
      </div>
      <div className="card">
        <div className="muted">
          {canApproveDeposits
            ? t('backoffice.selectSection')
            : t('backoffice.noSections')}
        </div>
      </div>
    </div>
  )
}
