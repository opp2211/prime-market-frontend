import { useAuth } from '../../app/auth'
import './headerLab.css'

export default function HeaderLabPage() {
  const { isAuthed } = useAuth()

  return (
    <div className="header-lab-page">
      <section className="header-lab-page__intro">
        <p className="header-lab-page__eyebrow">Safety page</p>
        <h1 className="header-lab-page__title">Production Header Verification</h1>
        <p className="header-lab-page__text">
          Эта страница использует тот же header из общего layout, что и production-маршруты.
          Проверяйте здесь баланс, уведомления, profile dropdown, theme и language, а затем
          сверяйте поведение на `market`, `dashboard` и `notifications`.
        </p>
        <p className="header-lab-page__text">
          {isAuthed
            ? 'Сейчас открыт авторизованный state, поэтому доступны все header interactions.'
            : 'Сейчас открыт guest state. Для проверки Balance / Notifications / Profile войдите в аккаунт и обновите страницу.'}
        </p>
      </section>

      <section className="header-lab-page__checks">
        <article className="card header-lab-page__check">
          <h2 className="h2">Что проверить</h2>
          <p className="header-lab-page__check-text">
            Nav underline, compact balance dropdown, wallet navigation, notifications dropdown,
            profile actions, utility row inside profile menu, outside click и Escape.
          </p>
        </article>

        <article className="card header-lab-page__check">
          <h2 className="h2">Куда сверять</h2>
          <p className="header-lab-page__check-text">
            После проверки здесь откройте `/market`, `/dashboard`, `/money/wallet` и
            `/notifications`: header должен быть тем же самым компонентом без отдельных lab-only
            копий.
          </p>
        </article>
      </section>
    </div>
  )
}
