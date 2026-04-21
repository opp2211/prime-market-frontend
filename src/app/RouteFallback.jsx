import { useI18n } from './i18n'

export default function RouteFallback() {
  const { t } = useI18n()

  return (
    <div className="account account--single">
      <div className="card account__content account__content--single">
        <div className="muted">{t('account.loading')}</div>
      </div>
    </div>
  )
}
