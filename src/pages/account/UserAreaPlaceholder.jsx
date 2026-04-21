import { useI18n } from '../../app/i18n'
import { getUserAreaCopy } from './userAreaCopy'

export default function UserAreaPlaceholder({ kind }) {
  const { language } = useI18n()
  const copy = getUserAreaCopy(language)
  const placeholder = copy.placeholders[kind] || {
    title: copy.nav.comingSoon,
    description: '',
  }

  return (
    <div className="account-page">
      <div className="account-page__head">
        <h1 className="h1 account-page__title">{placeholder.title}</h1>
      </div>

      <section className="card user-area-placeholder">
        <div className="user-area-placeholder__badge">{copy.nav.comingSoon}</div>
        <p className="user-area-placeholder__text">{placeholder.description}</p>
      </section>
    </div>
  )
}
