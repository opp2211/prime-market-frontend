import { isHeaderLabDockVariant } from './headerLabConfig'
import styles from './HeaderLabPage.module.css'

function cx(...values) {
  return values.filter(Boolean).join(' ')
}

export default function HeaderLabPage({ variantId = null }) {
  return (
    <section
      className={cx(styles.page, isHeaderLabDockVariant(variantId) && styles.pageWithDock)}
      aria-hidden="true"
    />
  )
}
